import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateSlug } from "@/lib/slug";
import { submitToIndexNow } from "@/lib/indexnow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Vercel Hobby 플랜에서 설정 가능한 최대값. 항목당 discover 결과 처리 +
// videos + credits 호출이 순차로 도는 만큼 기본 10초 제한을 넘길 수 있어 늘려둔다.
export const maxDuration = 60;

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";

// TMDB 장르 목록은 자주 바뀌지 않으므로, API 호출 없이 하드코딩된 매핑을 사용한다.
// 출처: https://api.themoviedb.org/3/genre/tv/list?language=en-US
const TV_GENRE_MAP: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

interface TmdbDiscoverItem {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
}

interface TmdbDiscoverResponse {
  results?: TmdbDiscoverItem[];
}

interface TmdbVideo {
  key: string;
  site: string;
  type: string;
}

interface TmdbVideosResponse {
  results?: TmdbVideo[];
}

interface TmdbCastMember {
  name: string;
  order: number;
}

interface TmdbCreditsResponse {
  cast?: TmdbCastMember[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTrailerKey(
  tvId: number,
  tmdbApiKey: string,
): Promise<string | null> {
  try {
    const url = new URL(`https://api.themoviedb.org/3/tv/${tvId}/videos`);
    url.searchParams.set("api_key", tmdbApiKey);
    url.searchParams.set("language", "en-US");

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = (await res.json()) as TmdbVideosResponse;
    const trailer = (data.results ?? []).find(
      (video) => video.type === "Trailer" && video.site === "YouTube",
    );

    return trailer?.key ?? null;
  } catch {
    return null;
  }
}

async function fetchCastNames(
  tvId: number,
  tmdbApiKey: string,
): Promise<string[]> {
  try {
    const url = new URL(`https://api.themoviedb.org/3/tv/${tvId}/credits`);
    url.searchParams.set("api_key", tmdbApiKey);
    url.searchParams.set("language", "en-US");

    const res = await fetch(url.toString());
    if (!res.ok) return [];

    const data = (await res.json()) as TmdbCreditsResponse;
    return (data.cast ?? []).slice(0, 5).map((member) => member.name);
  } catch {
    return [];
  }
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

  const rows = [];
  for (const [index, item] of topDramas.entries()) {
    const genres = (item.genre_ids ?? [])
      .map((id) => TV_GENRE_MAP[id])
      .filter((name): name is string => Boolean(name));

    const [trailerKey, castNames] = await Promise.all([
      fetchTrailerKey(item.id, tmdbApiKey),
      fetchCastNames(item.id, tmdbApiKey),
    ]);

    rows.push({
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
      genres,
      trailer_key: trailerKey,
      cast_names: castNames,
      rank_date: rankDate,
    });

    await sleep(250);
  }

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase
    .from("dramas")
    .upsert(rows, { onConflict: "title,rank_date" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const urlList = [
      "https://trend.franvia.com/",
      ...rows.map((row) => `https://trend.franvia.com/dramas/${row.slug}`),
    ];
    const indexNowRes = await submitToIndexNow(urlList);
    console.log(
      `IndexNow submission (dramas): status ${indexNowRes.status}, ${urlList.length} URLs`,
    );
  } catch (indexNowError) {
    console.error("IndexNow submission failed (dramas):", indexNowError);
  }

  return NextResponse.json({
    message: "Drama data upserted successfully",
    rankDate,
    count: rows.length,
  });
}
