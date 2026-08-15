import { createSupabaseServerClient } from "@/lib/supabase/server";
import EditorCommentary from "@/components/EditorCommentary";

interface BoxOfficeRow {
  rank: number;
  rank_change: number;
  movie_name: string;
  en_title: string | null;
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
      "rank, rank_change, movie_name, en_title, audience_count, audience_acc, rank_date",
    )
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

export default async function Home() {
  const rows = await getLatestBoxOffice();

  if (rows.length === 0) {
    return (
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
      </main>
    );
  }

  const formattedDate = new Date(rows[0].rank_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
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
    </main>
  );
}
