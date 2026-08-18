import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchBar from "@/components/SearchBar";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

interface ResultItem {
  slug: string;
  title: string;
  posterUrl: string | null;
  rankDate: string;
}

// PostgREST의 .or() 필터 문법에서 값에 콤마/따옴표가 섞여도 깨지지 않도록 감싼다.
function ilikePattern(term: string): string {
  const escaped = term.replace(/"/g, '\\"');
  return `"%${escaped}%"`;
}

function dedupeBySlugKeepLatest<T extends { slug: string; rankDate: string }>(
  rows: T[],
): T[] {
  const bySlug = new Map<string, T>();

  for (const row of rows) {
    const existing = bySlug.get(row.slug);
    if (!existing || row.rankDate > existing.rankDate) {
      bySlug.set(row.slug, row);
    }
  }

  return Array.from(bySlug.values());
}

async function searchMovies(query: string): Promise<ResultItem[]> {
  const supabase = createSupabaseServerClient();
  const pattern = ilikePattern(query);

  const { data, error } = await supabase
    .from("boxoffice")
    .select("movie_name, en_title, poster_url, slug, rank_date")
    .or(`movie_name.ilike.${pattern},en_title.ilike.${pattern}`)
    .not("slug", "is", null)
    .order("rank_date", { ascending: false });

  if (error || !data) {
    return [];
  }

  const items = data.map((row) => ({
    slug: row.slug as string,
    title: row.en_title || row.movie_name,
    posterUrl: row.poster_url,
    rankDate: row.rank_date,
  }));

  return dedupeBySlugKeepLatest(items).sort((a, b) =>
    a.title.localeCompare(b.title),
  );
}

async function searchDramas(query: string): Promise<ResultItem[]> {
  const supabase = createSupabaseServerClient();
  const pattern = ilikePattern(query);

  const { data, error } = await supabase
    .from("dramas")
    .select("title, en_title, poster_url, slug, rank_date")
    .or(`title.ilike.${pattern},en_title.ilike.${pattern}`)
    .not("slug", "is", null)
    .order("rank_date", { ascending: false });

  if (error || !data) {
    return [];
  }

  const items = data.map((row) => ({
    slug: row.slug as string,
    title: row.en_title || row.title,
    posterUrl: row.poster_url,
    rankDate: row.rank_date,
  }));

  return dedupeBySlugKeepLatest(items).sort((a, b) =>
    a.title.localeCompare(b.title),
  );
}

async function getTodayTopMovies(limit: number): Promise<ResultItem[]> {
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
    .select("movie_name, en_title, poster_url, slug, rank_date")
    .eq("rank_date", latest.rank_date)
    .not("slug", "is", null)
    .order("rank", { ascending: true })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    slug: row.slug as string,
    title: row.en_title || row.movie_name,
    posterUrl: row.poster_url,
    rankDate: row.rank_date,
  }));
}

async function getTodayTopDramas(limit: number): Promise<ResultItem[]> {
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
    .select("title, en_title, poster_url, slug, rank_date")
    .eq("rank_date", latest.rank_date)
    .not("slug", "is", null)
    .order("rank", { ascending: true })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    slug: row.slug as string,
    title: row.en_title || row.title,
    posterUrl: row.poster_url,
    rankDate: row.rank_date,
  }));
}

function FilmIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm0 2h2v2H4V6Zm4 0h2v2H8V6Zm4 0h2v2h-2V6Zm4 0h2v2h-2V6ZM4 10h16v8H4v-8Z" />
    </svg>
  );
}

function ResultCard({ href, item }: { href: string; item: ResultItem }) {
  return (
    <Link
      href={href}
      className="block overflow-hidden rounded-xl transition-all duration-300 hover:cursor-pointer hover:shadow-[0_0_12px_rgba(239,68,68,0.35)] hover:ring-1 hover:ring-red-500/50"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-100">
        {item.posterUrl ? (
          <Image
            src={item.posterUrl}
            alt={item.title}
            fill
            sizes="(min-width: 768px) 25vw, 45vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">
            <FilmIcon />
          </div>
        )}
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-zinc-900">
        {item.title}
      </p>
    </Link>
  );
}

function ResultGrid({
  heading,
  items,
  basePath,
}: {
  heading: string;
  items: ResultItem[];
  basePath: "movies" | "dramas";
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold tracking-tight text-zinc-900">
        {heading}
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <ResultCard
            key={item.slug}
            href={`/${basePath}/${item.slug}`}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();

  return {
    title: query ? `Search results for "${query}"` : "Search",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [movies, dramas] = query
    ? await Promise.all([searchMovies(query), searchDramas(query)])
    : [[], []];

  const hasResults = movies.length > 0 || dramas.length > 0;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <SearchBar className="max-w-md" />

      {query && (
        <h1 className="mt-8 text-2xl font-bold tracking-tight text-zinc-900">
          {hasResults
            ? `Search results for "${query}"`
            : `No results for "${query}"`}
        </h1>
      )}

      {!hasResults && (
        <>
          <p className="mt-4 text-zinc-500">
            {query
              ? `No results found for "${query}". Try checking the spelling, or browse today's rankings below.`
              : "Enter a movie or drama title to search, or browse today's rankings below."}
          </p>
          <TodayFallback />
        </>
      )}

      <ResultGrid heading="Movies" items={movies} basePath="movies" />
      <ResultGrid heading="K-Drama" items={dramas} basePath="dramas" />
      </main>
      <SiteFooter />
    </>
  );
}

async function TodayFallback() {
  const [topMovies, topDramas] = await Promise.all([
    getTodayTopMovies(5),
    getTodayTopDramas(5),
  ]);

  return (
    <>
      <ResultGrid heading="Today's K-Movie Box Office" items={topMovies} basePath="movies" />
      <ResultGrid heading="Today's Trending K-Drama" items={topDramas} basePath="dramas" />
    </>
  );
}
