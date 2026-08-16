import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateSlug } from "@/lib/slug";
import { submitToIndexNow } from "@/lib/indexnow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Vercel Hobby 플랜에서 설정 가능한 최대값. 항목당 검색+videos+credits
// 3회 호출이 순차로 도는 만큼 기본 10초 제한을 넘길 수 있어 늘려둔다.
export const maxDuration = 60;

// TMDB 장르 목록은 자주 바뀌지 않으므로, API 호출 없이 하드코딩된 매핑을 사용한다.
// 출처: https://api.themoviedb.org/3/genre/movie/list?language=en-US
const MOVIE_GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

interface KobisDailyBoxOfficeItem {
  rank: string;
  rankInten: string;
  movieNm: string;
  audiCnt: string;
  audiAcc: string;
  salesAmt: string;
  openDt: string;
}

interface KobisResponse {
  boxOfficeResult?: {
    dailyBoxOfficeList: KobisDailyBoxOfficeItem[];
  };
  faultResult?: {
    errorCode: string;
    message: string;
  };
}

interface TmdbSearchResult {
  id: number;
  title?: string;
  release_date?: string;
  poster_path?: string | null;
  overview?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
}

interface TmdbSearchResponse {
  results?: TmdbSearchResult[];
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

interface TmdbCrewMember {
  name: string;
  job: string;
}

interface TmdbCreditsResponse {
  cast?: TmdbCastMember[];
  crew?: TmdbCrewMember[];
}

interface TmdbMatch {
  enTitle: string | null;
  posterUrl: string | null;
  overview: string | null;
  voteAverage: number | null;
  voteCount: number | null;
  genres: string[];
  trailerKey: string | null;
  castNames: string[];
  director: string | null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function containsHangul(text: string): boolean {
  return /[가-힣]/.test(text);
}

// openDt와 release_date가 가장 가까운 결과를 골라 동명이작 오매칭을 줄인다.
function pickClosestByReleaseDate(
  results: TmdbSearchResult[],
  openDt: string | null,
): TmdbSearchResult | undefined {
  const target = openDt ? new Date(openDt).getTime() : NaN;
  if (Number.isNaN(target)) {
    return results[0];
  }

  let closest: TmdbSearchResult | undefined;
  let closestDiff = Infinity;

  for (const result of results) {
    if (!result.release_date) continue;
    const releaseTime = new Date(result.release_date).getTime();
    if (Number.isNaN(releaseTime)) continue;

    const diff = Math.abs(releaseTime - target);
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = result;
    }
  }

  return closest ?? results[0];
}

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";

async function fetchTrailerKey(
  movieId: number,
  tmdbApiKey: string,
): Promise<string | null> {
  try {
    const url = new URL(
      `https://api.themoviedb.org/3/movie/${movieId}/videos`,
    );
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

async function fetchCredits(
  movieId: number,
  tmdbApiKey: string,
): Promise<{ castNames: string[]; director: string | null }> {
  try {
    const url = new URL(
      `https://api.themoviedb.org/3/movie/${movieId}/credits`,
    );
    url.searchParams.set("api_key", tmdbApiKey);
    url.searchParams.set("language", "en-US");

    const res = await fetch(url.toString());
    if (!res.ok) return { castNames: [], director: null };

    const data = (await res.json()) as TmdbCreditsResponse;
    const castNames = (data.cast ?? [])
      .slice(0, 5)
      .map((member) => member.name);
    const director =
      (data.crew ?? []).find((member) => member.job === "Director")?.name ??
      null;

    return { castNames, director };
  } catch {
    return { castNames: [], director: null };
  }
}

async function fetchTmdbMatch(
  movieName: string,
  openDt: string | null,
  tmdbApiKey: string,
): Promise<TmdbMatch> {
  const empty: TmdbMatch = {
    enTitle: null,
    posterUrl: null,
    overview: null,
    voteAverage: null,
    voteCount: null,
    genres: [],
    trailerKey: null,
    castNames: [],
    director: null,
  };

  try {
    const url = new URL("https://api.themoviedb.org/3/search/movie");
    url.searchParams.set("api_key", tmdbApiKey);
    url.searchParams.set("query", movieName);
    url.searchParams.set("language", "en-US");
    url.searchParams.set("region", "KR");

    const res = await fetch(url.toString());
    if (!res.ok) {
      return empty;
    }

    const data = (await res.json()) as TmdbSearchResponse;
    const results = data.results ?? [];
    if (results.length === 0) {
      return empty;
    }

    const match = pickClosestByReleaseDate(results, openDt);
    if (!match) {
      return empty;
    }

    const posterUrl = match.poster_path
      ? `${TMDB_POSTER_BASE_URL}${match.poster_path}`
      : null;

    // 영문 번역이 없으면 TMDB가 원제(한글)를 그대로 반환하므로, 그 경우 null 처리한다.
    const title = match.title;
    const enTitle = title && !containsHangul(title) ? title : null;

    const genres = (match.genre_ids ?? [])
      .map((id) => MOVIE_GENRE_MAP[id])
      .filter((name): name is string => Boolean(name));

    const [trailerKey, credits] = await Promise.all([
      fetchTrailerKey(match.id, tmdbApiKey),
      fetchCredits(match.id, tmdbApiKey),
    ]);

    return {
      enTitle,
      posterUrl,
      overview: match.overview || null,
      voteAverage: match.vote_average ?? null,
      voteCount: match.vote_count ?? null,
      genres,
      trailerKey,
      castNames: credits.castNames,
      director: credits.director,
    };
  } catch {
    return empty;
  }
}

// KOBIS는 "전일" 데이터만 제공하므로, 한국 시간(KST) 기준 어제 날짜를 구한다.
function getKstYesterday() {
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  kstNow.setUTCDate(kstNow.getUTCDate() - 1);

  const yyyy = kstNow.getUTCFullYear();
  const mm = String(kstNow.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kstNow.getUTCDate()).padStart(2, "0");

  return {
    targetDt: `${yyyy}${mm}${dd}`,
    rankDate: `${yyyy}-${mm}-${dd}`,
  };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kobisKey = process.env.KOBIS_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!kobisKey || !supabaseUrl || !supabaseSecretKey) {
    return NextResponse.json(
      { error: "Missing required environment variables" },
      { status: 500 },
    );
  }

  const { targetDt, rankDate } = getKstYesterday();

  const kobisUrl = new URL(
    "https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json",
  );
  kobisUrl.searchParams.set("key", kobisKey);
  kobisUrl.searchParams.set("targetDt", targetDt);

  const kobisRes = await fetch(kobisUrl.toString());
  if (!kobisRes.ok) {
    return NextResponse.json(
      { error: `KOBIS API request failed with status ${kobisRes.status}` },
      { status: 502 },
    );
  }

  const kobisData = (await kobisRes.json()) as KobisResponse;

  if (kobisData.faultResult) {
    return NextResponse.json(
      { error: `KOBIS API error: ${kobisData.faultResult.message}` },
      { status: 502 },
    );
  }

  const list = kobisData.boxOfficeResult?.dailyBoxOfficeList ?? [];

  if (list.length === 0) {
    return NextResponse.json({ message: "No data returned from KOBIS", targetDt });
  }

  const tmdbApiKey = process.env.TMDB_API_KEY;

  const rows = [];
  for (const item of list) {
    const {
      enTitle,
      posterUrl,
      overview,
      voteAverage,
      voteCount,
      genres,
      trailerKey,
      castNames,
      director,
    } = tmdbApiKey
      ? await fetchTmdbMatch(item.movieNm, item.openDt || null, tmdbApiKey)
      : {
          enTitle: null,
          posterUrl: null,
          overview: null,
          voteAverage: null,
          voteCount: null,
          genres: [] as string[],
          trailerKey: null,
          castNames: [] as string[],
          director: null,
        };

    rows.push({
      rank: Number(item.rank),
      rank_change: Number(item.rankInten),
      movie_name: item.movieNm,
      en_title: enTitle,
      slug: generateSlug(
        enTitle || item.movieNm,
        item.openDt,
        `${targetDt}-rank${item.rank}`,
      ),
      poster_url: posterUrl,
      overview,
      vote_average: voteAverage,
      vote_count: voteCount,
      genres,
      trailer_key: trailerKey,
      cast_names: castNames,
      director,
      audience_count: Number(item.audiCnt),
      audience_acc: Number(item.audiAcc),
      sales_amt: Number(item.salesAmt),
      open_dt: item.openDt || null,
      rank_date: rankDate,
    });

    await sleep(250);
  }

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase
    .from("boxoffice")
    .upsert(rows, { onConflict: "movie_name,rank_date" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const urlList = [
      "https://trend.franvia.com/",
      ...rows.map((row) => `https://trend.franvia.com/movies/${row.slug}`),
    ];
    const indexNowRes = await submitToIndexNow(urlList);
    console.log(
      `IndexNow submission (boxoffice): status ${indexNowRes.status}, ${urlList.length} URLs`,
    );
  } catch (indexNowError) {
    console.error("IndexNow submission failed (boxoffice):", indexNowError);
  }

  return NextResponse.json({
    message: "Boxoffice data upserted successfully",
    targetDt,
    rankDate,
    count: rows.length,
  });
}
