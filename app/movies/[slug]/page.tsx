import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ShareButtons from "@/components/ShareButtons";
import BookmarkButton from "@/components/BookmarkButton";

interface MoviePageProps {
  params: Promise<{ slug: string }>;
}

interface BoxOfficeDetail {
  rank: number;
  rank_change: number;
  movie_name: string;
  en_title: string | null;
  poster_url: string | null;
  overview: string | null;
  vote_average: number | null;
  vote_count: number | null;
  genres: string[] | null;
  trailer_key: string | null;
  cast_names: string[] | null;
  director: string | null;
  audience_count: number;
  audience_acc: number;
  open_dt: string | null;
  rank_date: string;
  slug: string;
}

interface RankHistoryEntry {
  rank_date: string;
  rank: number;
  rank_change: number;
}

async function getMovie(slug: string): Promise<BoxOfficeDetail | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("boxoffice")
    .select(
      "rank, rank_change, movie_name, en_title, poster_url, overview, vote_average, vote_count, genres, trailer_key, cast_names, director, audience_count, audience_acc, open_dt, rank_date, slug",
    )
    .eq("slug", slug)
    .order("rank_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getMovieHistory(slug: string): Promise<RankHistoryEntry[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("boxoffice")
    .select("rank_date, rank, rank_change")
    .eq("slug", slug)
    .order("rank_date", { ascending: false })
    .limit(7);

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

// 개봉일 당일을 Day 1로 세는 방식(시간대 영향을 없애기 위해 UTC 자정 기준으로 비교)
function getDaysSinceRelease(openDt: string): number {
  const release = new Date(openDt);
  const releaseUTC = Date.UTC(
    release.getUTCFullYear(),
    release.getUTCMonth(),
    release.getUTCDate(),
  );

  const now = new Date();
  const todayUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  return Math.floor((todayUTC - releaseUTC) / (1000 * 60 * 60 * 24)) + 1;
}

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const { slug } = await params;
  const movie = await getMovie(slug);

  if (!movie) {
    return {
      title: "Movie Not Found",
    };
  }

  const title = movie.en_title || movie.movie_name;

  return {
    title: `${title} - K-Movie Box Office Ranking`,
    description: `See ${title}'s daily K-Movie box office rank, cumulative admissions, and ranking history on Franvia K-Trend Chart.`,
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { slug } = await params;
  const movie = await getMovie(slug);

  if (!movie) {
    notFound();
  }

  const history = await getMovieHistory(slug);
  const title = movie.en_title || movie.movie_name;
  const showSubtitle = movie.en_title && movie.en_title !== movie.movie_name;

  const formattedOpenDt = movie.open_dt
    ? new Date(movie.open_dt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const hasRating = movie.vote_average !== null && movie.vote_average > 0;

  const daysSinceRelease = movie.open_dt
    ? getDaysSinceRelease(movie.open_dt)
    : null;

  const formattedAudienceAcc = movie.audience_acc.toLocaleString("en-US");
  const releaseSentenceDate = movie.open_dt
    ? new Date(movie.open_dt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })
    : null;

  const performanceSentence = releaseSentenceDate
    ? `As of today, ${title} has drawn ${formattedAudienceAcc} admissions since its ${releaseSentenceDate} release.`
    : `As of today, ${title} has drawn ${formattedAudienceAcc} admissions.`;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-sm font-medium text-zinc-500 transition-colors hover:text-amber-500"
      >
        ← Back to Rankings
      </Link>

      <div className="mt-8 flex flex-col gap-6 sm:flex-row">
        <div className="relative h-72 w-48 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
          {movie.poster_url ? (
            <Image
              src={movie.poster_url}
              alt={title}
              fill
              sizes="192px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
              No poster
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-zinc-900">{title}</h1>
          {showSubtitle && (
            <p className="mt-1 text-base text-zinc-500">{movie.movie_name}</p>
          )}

          {movie.genres && movie.genres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {movie.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {hasRating ? (
            <p className="mt-2 text-sm font-medium text-zinc-600">
              TMDB Global Rating: {movie.vote_average!.toFixed(1)}/10 (
              {movie.vote_count?.toLocaleString("en-US")} votes)
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-400">No TMDB ratings yet</p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            {formattedOpenDt && (
              <div>
                <dt className="text-zinc-400">Release Date</dt>
                <dd className="mt-0.5 font-medium text-zinc-900">
                  {formattedOpenDt}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-zinc-400">Current Rank</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">
                #{movie.rank}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-400">Rank Change</dt>
              <dd className="mt-0.5">
                <RankChangeBadge change={movie.rank_change} />
              </dd>
            </div>
            <div>
              <dt className="text-zinc-400">Cumulative Admissions</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">
                {movie.audience_acc.toLocaleString("en-US")}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <ShareButtons
          url={`https://trend.franvia.com/movies/${slug}`}
          title={title}
          description={movie.overview ?? undefined}
          imageUrl={movie.poster_url ?? undefined}
        />
        <BookmarkButton
          slug={slug}
          contentType="movie"
          title={title}
          posterUrl={movie.poster_url ?? undefined}
        />
      </div>

      {movie.trailer_key && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-zinc-900">Trailer</h2>
          <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-xl bg-zinc-100">
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailer_key}`}
              title={`${title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </section>
      )}

      {movie.overview && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-zinc-900">Overview</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-700">
            {movie.overview}
          </p>
        </section>
      )}

      {(movie.director || (movie.cast_names && movie.cast_names.length > 0)) && (
        <section className="mt-10">
          {movie.director && (
            <p className="text-sm text-zinc-700">
              <span className="font-semibold text-zinc-900">Director:</span>{" "}
              {movie.director}
            </p>
          )}
          {movie.cast_names && movie.cast_names.length > 0 && (
            <div className={movie.director ? "mt-3" : ""}>
              <h3 className="text-sm font-semibold text-zinc-900">Cast</h3>
              <p className="mt-1 text-sm text-zinc-700">
                {movie.cast_names.join(", ")}
              </p>
            </div>
          )}
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-bold text-zinc-900">
          Korean Box Office Performance
        </h2>
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
          {daysSinceRelease !== null && (
            <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
              Day {daysSinceRelease} since release
            </span>
          )}
          <p className="mt-3 text-sm leading-relaxed text-zinc-700">
            {performanceSentence}
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-bold text-zinc-900">
          Ranking History (Last 7 Days)
        </h2>
        <ul className="mt-4 divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {history.map((entry) => (
            <li
              key={entry.rank_date}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span className="text-zinc-500">
                {new Date(entry.rank_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-3">
                <span className="font-semibold text-zinc-900">
                  #{entry.rank}
                </span>
                <RankChangeBadge change={entry.rank_change} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm text-zinc-400">
        Box office data sourced from KOBIS (Korean Box office Information
        System), operated by the Korean Film Council (KOFIC).
      </p>
    </main>
  );
}
