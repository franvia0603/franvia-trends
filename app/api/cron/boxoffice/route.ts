import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  title?: string;
  release_date?: string;
}

interface TmdbSearchResponse {
  results?: TmdbSearchResult[];
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

async function fetchEnTitle(
  movieName: string,
  openDt: string | null,
  tmdbApiKey: string,
): Promise<string | null> {
  try {
    const url = new URL("https://api.themoviedb.org/3/search/movie");
    url.searchParams.set("api_key", tmdbApiKey);
    url.searchParams.set("query", movieName);
    url.searchParams.set("language", "en-US");
    url.searchParams.set("region", "KR");

    const res = await fetch(url.toString());
    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as TmdbSearchResponse;
    const results = data.results ?? [];
    if (results.length === 0) {
      return null;
    }

    const title = pickClosestByReleaseDate(results, openDt)?.title;

    // 영문 번역이 없으면 TMDB가 원제(한글)를 그대로 반환하므로, 그 경우 null 처리한다.
    if (!title || containsHangul(title)) {
      return null;
    }

    return title;
  } catch {
    return null;
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
    const enTitle = tmdbApiKey
      ? await fetchEnTitle(item.movieNm, item.openDt || null, tmdbApiKey)
      : null;

    rows.push({
      rank: Number(item.rank),
      rank_change: Number(item.rankInten),
      movie_name: item.movieNm,
      en_title: enTitle,
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

  return NextResponse.json({
    message: "Boxoffice data upserted successfully",
    targetDt,
    rankDate,
    count: rows.length,
  });
}
