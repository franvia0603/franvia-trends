"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type WatchlistContentType = "movie" | "drama";

export interface WatchlistItem {
  slug: string;
  contentType: WatchlistContentType;
  title: string;
  posterUrl?: string;
  addedAt: string;
}

interface WatchlistContextValue {
  items: WatchlistItem[];
  count: number;
  isSaved: (slug: string, contentType: WatchlistContentType) => boolean;
  toggle: (item: Omit<WatchlistItem, "addedAt">) => void;
  remove: (slug: string, contentType: WatchlistContentType) => void;
}

const STORAGE_KEY = "franvia-watchlist";

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

function readFromStorage(): WatchlistItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistToStorage(items: WatchlistItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // 프라이빗 브라우징 등 localStorage 접근이 막힌 환경은 무시
  }
}

function sameItem(
  a: { slug: string; contentType: WatchlistContentType },
  slug: string,
  contentType: WatchlistContentType,
): boolean {
  return a.slug === slug && a.contentType === contentType;
}

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    const restore = () => setItems(readFromStorage());
    restore();
  }, []);

  function isSaved(slug: string, contentType: WatchlistContentType): boolean {
    return items.some((item) => sameItem(item, slug, contentType));
  }

  function toggle(item: Omit<WatchlistItem, "addedAt">) {
    setItems((prev) => {
      const exists = prev.some((i) =>
        sameItem(i, item.slug, item.contentType),
      );
      const next = exists
        ? prev.filter((i) => !sameItem(i, item.slug, item.contentType))
        : [...prev, { ...item, addedAt: new Date().toISOString() }];

      persistToStorage(next);
      return next;
    });
  }

  function remove(slug: string, contentType: WatchlistContentType) {
    setItems((prev) => {
      const next = prev.filter((i) => !sameItem(i, slug, contentType));
      persistToStorage(next);
      return next;
    });
  }

  return (
    <WatchlistContext.Provider
      value={{ items, count: items.length, isSaved, toggle, remove }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist(): WatchlistContextValue {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}
