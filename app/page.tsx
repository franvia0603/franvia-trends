import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/SiteHeader";
import EditorCommentary from "@/components/EditorCommentary";
import FranviaEditorial from "@/components/FranviaEditorial";

export const revalidate = 3600;

interface BoxOfficeRow {
  rank: number;
  rank_change: number;
  movie_name: string;
  en_title: string | null;
  poster_url: string | null;
  audience_count: number;
  audience_acc: number;
  rank_date: string;
}

async function getLatestBoxOffice(): Promise<BoxOfficeRow[]> {
  const supabase = createSupabaseServerClient();

  const { data: latest } = await supabase
    .from("boxoffice")
    .select("rank_date")
    .order("rank_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest?.rank_date) {
    return [];
  }

  const { data, error } = await supabase
    .from("boxoffice")
    .select(
      "rank, rank_change, movie_name, en_title, poster_url, audience_count, audience_acc, rank_date",
    )
    .eq("rank_date", latest.rank_date)
    .order("rank", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}

interface DramaRow {
  rank: number;
  title: string;
  en_title: string | null;
  poster_url: string | null;
  overview: string | null;
  netflix_weeks_in_top10?: number | null;
  rank_date: string;
}

async function getLatestDramas(): Promise<DramaRow[]> {
  const supabase = createSupabaseServerClient();

  const { data: latest } = await supabase
    .from("dramas")
    .select("rank_date")
    .order("rank_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest?.rank_date) {
    return [];
  }

  const { data, error } = await supabase
    .from("dramas")
    .select("rank, title, en_title, poster_url, overview, rank_date")
    .eq("rank_date", latest.rank_date)
    .order("rank", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}

function RankChangeBadge({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-red-500">
        ▲ {change}
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-blue-500">
        ▼ {Math.abs(change)}
      </span>
    );
  }
  return <span className="text-sm font-semibold text-zinc-400">–</span>;
}

function PosterThumbnail({
  posterUrl,
  alt,
}: {
  posterUrl: string | null;
  alt: string;
}) {
  if (posterUrl) {
    return (
      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
        <Image
          src={posterUrl}
          alt={alt}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-300">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm0 2h2v2H4V6Zm4 0h2v2H8V6Zm4 0h2v2h-2V6Zm4 0h2v2h-2V6ZM4 10h16v8H4v-8Z" />
      </svg>
    </div>
  );
}

function DramaRankingSection({ dramas }: { dramas: DramaRow[] }) {
  if (dramas.length === 0) {
    return (
      <article className="mx-auto w-full max-w-3xl px-6 pb-16">
        <h2 className="text-2xl font-bold text-zinc-900">
          Trending K-Drama on Netflix
        </h2>
        <p className="mt-4 text-zinc-500">
          No drama ranking data available yet. Please check back soon.
        </p>
      </article>
    );
  }

  return (
    <article className="mx-auto w-full max-w-3xl px-6 pb-16">
      <header className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          Trending K-Drama on Netflix
        </h2>
      </header>

      <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {dramas.map((drama) => (
          <li
            key={`${drama.title}-${drama.rank_date}`}
            className="flex items-center gap-4 px-5 py-4"
          >
            <PosterThumbnail
              posterUrl={drama.poster_url}
              alt={drama.en_title || drama.title}
            />
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-base font-bold text-white">
              {drama.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-zinc-900">
                {drama.en_title || drama.title}
              </p>
              {drama.overview && (
                <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500">
                  {drama.overview}
                </p>
              )}
              {drama.netflix_weeks_in_top10 ? (
                <span className="mt-1.5 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                  {drama.netflix_weeks_in_top10} weeks in Top 10
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-zinc-400">
        Ranking based on TMDB&apos;s weekly trending TV data, filtered for
        Korean titles. Poster and synopsis provided by TMDB.
      </p>
    </article>
  );
}

export default async function Home() {
  const rows = await getLatestBoxOffice();
  const dramas = await getLatestDramas();

  if (rows.length === 0) {
    return (
      <>
        <SiteHeader />
        <main className="flex flex-col">
          <EditorCommentary />
          <article className="mx-auto w-full max-w-3xl px-6 py-16">
            <h1 className="text-2xl font-bold text-zinc-900">
              Today&apos;s K-Movie Box Office
            </h1>
            <p className="mt-4 text-zinc-500">
              No box office data available yet. Please check back soon.
            </p>
          </article>
          <DramaRankingSection dramas={dramas} />
          <FranviaEditorial />
        </main>
      </>
    );
  }

  const formattedDate = new Date(rows[0].rank_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <SiteHeader />
      <main className="flex flex-col">
        <EditorCommentary />
        <article className="mx-auto w-full max-w-3xl px-6 py-16">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Today&apos;s K-Movie Box Office
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Daily Box Office TOP {rows.length} · Updated {formattedDate}
            </p>
          </header>

          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            {rows.map((movie) => (
              <li
                key={`${movie.movie_name}-${movie.rank_date}`}
                className="flex items-center gap-4 px-5 py-4"
              >
                <PosterThumbnail
                  posterUrl={movie.poster_url}
                  alt={movie.en_title || movie.movie_name}
                />
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-base font-bold text-white">
                  {movie.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-zinc-900">
                    {movie.en_title || movie.movie_name}
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    Cumulative admissions: {movie.audience_acc.toLocaleString("en-US")}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <RankChangeBadge change={movie.rank_change} />
                  <span className="text-sm text-zinc-600">
                    {movie.audience_count.toLocaleString("en-US")}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-zinc-400">
            Box office data sourced from KOBIS (Korean Box office Information
            System), operated by the Korean Film Council (KOFIC).
          </p>
        </article>
        <DramaRankingSection dramas={dramas} />
        <FranviaEditorial />
      </main>
    </>
  );
}
