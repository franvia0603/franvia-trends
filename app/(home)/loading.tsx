export default function Loading() {
  return (
    <article className="mx-auto w-full max-w-3xl animate-pulse px-6 py-16">
      <header className="mb-8">
        <div className="h-8 w-64 rounded bg-zinc-200" />
        <div className="mt-3 h-4 w-48 rounded bg-zinc-200" />
      </header>

      <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {Array.from({ length: 10 }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-200" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-zinc-200" />
              <div className="h-3 w-1/2 rounded bg-zinc-200" />
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="h-3 w-8 rounded bg-zinc-200" />
              <div className="h-3 w-12 rounded bg-zinc-200" />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
