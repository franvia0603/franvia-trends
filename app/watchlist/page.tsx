"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useWatchlist } from "@/lib/watchlist-context";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

function formatAddedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function WatchlistPage() {
  const { items, remove } = useWatchlist();

  const sortedItems = [...items].sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
  );

  return (
    <>
      <SiteHeader />
      <main className="bg-zinc-900">
        <div className="mx-auto w-full max-w-3xl px-6 py-16">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-amber-400"
          >
            ← Back to Rankings
          </Link>

          <h1 className="mt-8 text-3xl font-bold text-amber-400">
            My Watchlist
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {sortedItems.length > 0
              ? `${sortedItems.length} saved title${sortedItems.length === 1 ? "" : "s"} · stored in this browser`
              : "Movies and dramas you save are stored in this browser."}
          </p>

          {sortedItems.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-800/50 px-6 py-16 text-center">
              <Heart className="mx-auto text-zinc-600" size={40} />
              <p className="mt-4 text-zinc-300">
                You haven&apos;t saved anything yet. Browse the rankings and
                save titles you like.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-amber-300"
              >
                Back to Rankings
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {sortedItems.map((item) => (
                <div
                  key={`${item.contentType}-${item.slug}`}
                  className="relative"
                >
                  <Link
                    href={`/${item.contentType === "movie" ? "movies" : "dramas"}/${item.slug}`}
                    className="block overflow-hidden rounded-xl transition-all duration-300 hover:shadow-[0_0_12px_rgba(251,191,36,0.35)] hover:ring-1 hover:ring-amber-400/50"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-800">
                      {item.posterUrl ? (
                        <Image
                          src={item.posterUrl}
                          alt={item.title}
                          fill
                          sizes="(min-width: 768px) 25vw, 45vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-600">
                          <Heart size={28} />
                        </div>
                      )}
                    </div>
                    <p className="mt-2 truncate text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Added {formatAddedDate(item.addedAt)}
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(item.slug, item.contentType)}
                    aria-label={`Remove ${item.title} from watchlist`}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/80 text-white transition-colors hover:bg-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
