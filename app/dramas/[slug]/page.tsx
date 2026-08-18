import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ShareButtons from "@/components/ShareButtons";

interface DramaPageProps {
  params: Promise<{ slug: string }>;
}

interface DramaDetail {
  rank: number;
  rank_change: number | null;
  title: string;
  en_title: string | null;
  poster_url: string | null;
  overview: string | null;
  vote_average: number | null;
  vote_count: number | null;
  genres: string[] | null;
  trailer_key: string | null;
  cast_names: string[] | null;
  first_air_date: string | null;
  rank_date: string;
  slug: string;
}

interface RankHistoryEntry {
  rank_date: string;
  rank: number;
  rank_change: number | null;
}

async function getDrama(slug: string): Promise<DramaDetail | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("dramas")
    .select(
      "rank, rank_change, title, en_title, poster_url, overview, vote_average, vote_count, genres, trailer_key, cast_names, first_air_date, rank_date, slug",
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

async function getDramaHistory(slug: string): Promise<RankHistoryEntry[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("dramas")
    .select("rank_date, rank, rank_change")
    .eq("slug", slug)
    .order("rank_date", { ascending: false })
    .limit(7);

  if (error || !data) {
    return [];
  }

  return data;
}

function RankChangeBadge({ change }: { change: number | null }) {
  if (change && change > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-red-500">
        ▲ {change}
      </span>
    );
  }
  if (change && change < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-blue-500">
        ▼ {Math.abs(change)}
      </span>
    );
  }
  return <span className="text-sm font-semibold text-zinc-400">–</span>;
}

export async function generateMetadata({
  params,
}: DramaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const drama = await getDrama(slug);

  if (!drama) {
    return {
      title: "Drama Not Found",
    };
  }

  const title = drama.en_title || drama.title;

  return {
    title: `${title} - K-Drama Ranking`,
    description: `See ${title}'s K-Drama trending rank, TMDB rating, and ranking history on Franvia K-Trend Chart.`,
  };
}

export default async function DramaPage({ params }: DramaPageProps) {
  const { slug } = await params;
  const drama = await getDrama(slug);

  if (!drama) {
    notFound();
  }

  const history = await getDramaHistory(slug);
  const title = drama.en_title || drama.title;
  const showSubtitle = drama.en_title && drama.en_title !== drama.title;

  const formattedAirDate = drama.first_air_date
    ? new Date(drama.first_air_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const hasRating = drama.vote_average !== null && drama.vote_average > 0;

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
          {drama.poster_url ? (
            <Image
              src={drama.poster_url}
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
            <p className="mt-1 text-base text-zinc-500">{drama.title}</p>
          )}

          {drama.genres && drama.genres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {drama.genres.map((genre) => (
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
              TMDB Global Rating: {drama.vote_average!.toFixed(1)}/10 (
              {drama.vote_count?.toLocaleString("en-US")} votes)
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-400">No TMDB ratings yet</p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            {formattedAirDate && (
              <div>
                <dt className="text-zinc-400">First Air Date</dt>
                <dd className="mt-0.5 font-medium text-zinc-900">
                  {formattedAirDate}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-zinc-400">Current Rank</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">
                #{drama.rank}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-400">Rank Change</dt>
              <dd className="mt-0.5">
                <RankChangeBadge change={drama.rank_change} />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6">
        <ShareButtons
          url={`https://trend.franvia.com/dramas/${slug}`}
          title={title}
          description={drama.overview ?? undefined}
          imageUrl={drama.poster_url ?? undefined}
        />
      </div>

      {drama.trailer_key && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-zinc-900">Trailer</h2>
          <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-xl bg-zinc-100">
            <iframe
              src={`https://www.youtube.com/embed/${drama.trailer_key}`}
              title={`${title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </section>
      )}

      {drama.overview && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-zinc-900">Overview</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-700">
            {drama.overview}
          </p>
        </section>
      )}

      {drama.cast_names && drama.cast_names.length > 0 && (
        <section className="mt-10">
          <h3 className="text-sm font-semibold text-zinc-900">Cast</h3>
          <p className="mt-1 text-sm text-zinc-700">
            {drama.cast_names.join(", ")}
          </p>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-lg font-bold text-zinc-900">Ranking History</h2>
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
        Ranking based on TMDB&apos;s weekly trending TV data, filtered for
        Korean titles. Poster, synopsis, and rating provided by TMDB.
      </p>
    </main>
  );
}
