import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateSlug } from "@/lib/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";

interface TmdbDiscoverItem {
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
}

interface TmdbDiscoverResponse {
  results?: TmdbDiscoverItem[];
}

// TMDB discover는 실시간 스냅샷이라 KOBIS와 달리 "오늘" 날짜(KST) 기준으로 저장한다.
function getKstToday(): string {
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const yyyy = kstNow.getUTCFullYear();
  const mm = String(kstNow.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kstNow.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tmdbApiKey = process.env.TMDB_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!tmdbApiKey || !supabaseUrl || !supabaseSecretKey) {
    return NextResponse.json(
      { error: "Missing required environment variables" },
      { status: 500 },
    );
  }

  const rankDate = getKstToday();

  const tmdbUrl = new URL("https://api.themoviedb.org/3/discover/tv");
  tmdbUrl.searchParams.set("api_key", tmdbApiKey);
  tmdbUrl.searchParams.set("language", "en-US");
  tmdbUrl.searchParams.set("with_origin_country", "KR");
  tmdbUrl.searchParams.set("with_genres", "18");
  tmdbUrl.searchParams.set("sort_by", "popularity.desc");
  tmdbUrl.searchParams.set("page", "1");

  const tmdbRes = await fetch(tmdbUrl.toString());
  if (!tmdbRes.ok) {
    return NextResponse.json(
      { error: `TMDB API request failed with status ${tmdbRes.status}` },
      { status: 502 },
    );
  }

  const tmdbData = (await tmdbRes.json()) as TmdbDiscoverResponse;
  const topDramas = (tmdbData.results ?? [])
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 10);

  if (topDramas.length === 0) {
    return NextResponse.json({
      message: "No drama results returned from TMDB",
      rankDate,
    });
  }

  const rows = topDramas.map((item, index) => ({
    rank: index + 1,
    rank_change: null,
    title: item.original_name,
    en_title: item.name,
    slug: generateSlug(
      item.name || item.original_name,
      item.first_air_date,
      `${rankDate}-rank${index + 1}`,
    ),
    poster_url: item.poster_path
      ? `${TMDB_POSTER_BASE_URL}${item.poster_path}`
      : null,
    overview: item.overview || null,
    first_air_date: item.first_air_date || null,
    vote_average: item.vote_average,
    vote_count: item.vote_count,
    rank_date: rankDate,
  }));

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase
    .from("dramas")
    .upsert(rows, { onConflict: "title,rank_date" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Drama data upserted successfully",
    rankDate,
    count: rows.length,
  });
}
