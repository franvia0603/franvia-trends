"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { X, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ContentType = "movie" | "drama";

interface SlugOption {
  slug: string;
  title: string;
}

interface Reaction {
  id: string;
  tweet_url: string;
}

const MAX_REACTIONS = 10;

const INPUT_CLASS =
  "mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-amber-400";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void;
      };
    };
  }
}

function isValidTweetUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["twitter.com", "www.twitter.com", "x.com", "www.x.com"].includes(
      parsed.hostname,
    );
  } catch {
    return false;
  }
}

async function fetchSlugOptions(contentType: ContentType): Promise<SlugOption[]> {
  const supabase = createSupabaseBrowserClient();
  const table = contentType === "movie" ? "boxoffice" : "dramas";

  const { data: latest } = await supabase
    .from(table)
    .select("rank_date")
    .order("rank_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest?.rank_date) return [];

  if (contentType === "movie") {
    const { data, error } = await supabase
      .from("boxoffice")
      .select("slug, movie_name, en_title")
      .eq("rank_date", latest.rank_date)
      .not("slug", "is", null)
      .order("rank", { ascending: true });

    if (error || !data) return [];
    return data
      .filter((row): row is typeof row & { slug: string } => Boolean(row.slug))
      .map((row) => ({ slug: row.slug, title: row.en_title || row.movie_name }));
  }

  const { data, error } = await supabase
    .from("dramas")
    .select("slug, title, en_title")
    .eq("rank_date", latest.rank_date)
    .not("slug", "is", null)
    .order("rank", { ascending: true });

  if (error || !data) return [];
  return data
    .filter((row): row is typeof row & { slug: string } => Boolean(row.slug))
    .map((row) => ({ slug: row.slug, title: row.en_title || row.title }));
}

async function fetchReactions(
  slug: string,
  contentType: ContentType,
): Promise<Reaction[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("social_reactions")
    .select("id, tweet_url")
    .eq("slug", slug)
    .eq("content_type", contentType)
    .order("added_at", { ascending: true });

  if (error || !data) return [];
  return data;
}

export default function SocialCuratorForm() {
  const [contentType, setContentType] = useState<ContentType>("movie");
  const [slugOptions, setSlugOptions] = useState<SlugOption[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [newTweetUrl, setNewTweetUrl] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingReactions, setLoadingReactions] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [widgetsReady, setWidgetsReady] = useState(false);

  // content_type이 바뀌면 해당 테이블의 최신 랭킹 목록을 다시 불러온다.
  useEffect(() => {
    let cancelled = false;
    const startLoading = () => {
      setLoadingOptions(true);
      setSelectedSlug("");
      setReactions([]);
    };
    startLoading();

    fetchSlugOptions(contentType).then((options) => {
      if (cancelled) return;
      setSlugOptions(options);
      setLoadingOptions(false);
      if (options.length > 0) {
        setSelectedSlug(options[0].slug);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [contentType]);

  // 선택된 slug가 바뀌면 그 작품에 등록된 반응 목록을 불러온다.
  useEffect(() => {
    if (!selectedSlug) return;

    let cancelled = false;
    const startLoading = () => {
      setLoadingReactions(true);
      setError(null);
    };
    startLoading();

    fetchReactions(selectedSlug, contentType).then((data) => {
      if (cancelled) return;
      setReactions(data);
      setLoadingReactions(false);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedSlug, contentType]);

  // 반응 목록이 바뀔 때마다 새로 추가된 blockquote를 X 위젯으로 변환한다.
  useEffect(() => {
    if (widgetsReady) {
      window.twttr?.widgets.load();
    }
  }, [reactions, widgetsReady]);

  async function handleAddTweet() {
    const trimmed = newTweetUrl.trim();
    setError(null);

    if (!isValidTweetUrl(trimmed)) {
      setError("Only twitter.com or x.com links can be added.");
      return;
    }
    if (reactions.length >= MAX_REACTIONS) {
      setError("Maximum of 10 reached — remove one to add another.");
      return;
    }

    setAdding(true);
    const supabase = createSupabaseBrowserClient();
    const { error: insertError } = await supabase.from("social_reactions").insert({
      slug: selectedSlug,
      content_type: contentType,
      tweet_url: trimmed,
    });
    setAdding(false);

    if (insertError) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setNewTweetUrl("");
    setReactions(await fetchReactions(selectedSlug, contentType));
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    const supabase = createSupabaseBrowserClient();
    await supabase.from("social_reactions").delete().eq("id", id);
    setRemovingId(null);
    setReactions(await fetchReactions(selectedSlug, contentType));
  }

  const atLimit = reactions.length >= MAX_REACTIONS;

  return (
    <div className="mt-10">
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        onLoad={() => setWidgetsReady(true)}
      />

      <div className="flex flex-wrap items-end gap-4">
        <fieldset>
          <legend className="text-sm font-medium text-zinc-300">
            Content type
          </legend>
          <div className="mt-1 flex gap-4">
            {(["movie", "drama"] as const).map((option) => (
              <label
                key={option}
                className="flex items-center gap-1.5 text-sm text-zinc-300"
              >
                <input
                  type="radio"
                  name="contentType"
                  value={option}
                  checked={contentType === option}
                  onChange={() => setContentType(option)}
                  className="accent-amber-400"
                />
                {option === "movie" ? "Movie" : "Drama"}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm font-medium text-zinc-300">
          Slug
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            disabled={loadingOptions || slugOptions.length === 0}
            className={`${INPUT_CLASS} disabled:opacity-50`}
          >
            {slugOptions.length === 0 ? (
              <option value="">
                {loadingOptions ? "Loading..." : "No titles available"}
              </option>
            ) : (
              slugOptions.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.title}
                </option>
              ))
            )}
          </select>
        </label>
      </div>

      {selectedSlug && (
        <div className="mt-8">
          <p className="text-sm font-medium text-zinc-300">
            Registered tweets ({reactions.length}/{MAX_REACTIONS})
          </p>

          {loadingReactions ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">
              <Loader2 className="animate-spin" size={14} />
              Loading...
            </p>
          ) : reactions.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">
              No tweets registered yet.
            </p>
          ) : (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {reactions.map((reaction) => (
                <div
                  key={reaction.id}
                  className="relative rounded-lg border border-zinc-700 bg-zinc-800 p-2"
                >
                  <button
                    type="button"
                    onClick={() => handleRemove(reaction.id)}
                    disabled={removingId === reaction.id}
                    aria-label="Remove tweet"
                    className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/90 text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                  >
                    {removingId === reaction.id ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <X size={14} />
                    )}
                  </button>
                  <blockquote className="twitter-tweet" data-theme="dark">
                    <a href={reaction.tweet_url}></a>
                  </blockquote>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            {atLimit ? (
              <p className="text-sm text-amber-400">
                Maximum of 10 reached — remove one to add another.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="url"
                  value={newTweetUrl}
                  onChange={(e) => setNewTweetUrl(e.target.value)}
                  placeholder="https://x.com/user/status/..."
                  className={`${INPUT_CLASS} mt-0 max-w-md flex-1`}
                />
                <button
                  type="button"
                  onClick={handleAddTweet}
                  disabled={adding || !newTweetUrl.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-400 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {adding && <Loader2 className="animate-spin" size={14} />}
                  Add tweet URL
                </button>
              </div>
            )}
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
