import { createSupabaseServerClient } from "@/lib/supabase/server";

interface CommentaryRow {
  title: string;
  body: string;
  rank_date: string;
}

async function getLatestCommentary(): Promise<CommentaryRow | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("commentary")
    .select("title, body, rank_date")
    .order("rank_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function EditorCommentary() {
  const commentary = await getLatestCommentary();

  if (!commentary) {
    return (
      <aside className="mx-auto w-full max-w-3xl px-6 pt-16">
        <p className="text-sm text-zinc-400">Editor&apos;s note coming soon.</p>
      </aside>
    );
  }

  return (
    <aside className="mx-auto w-full max-w-3xl px-6 pt-16">
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Editor&apos;s Note
        </p>
        <h2 className="mt-1 text-lg font-bold text-zinc-900">
          {commentary.title}
        </h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
          {commentary.body}
        </p>
      </div>
    </aside>
  );
}
