"use client";

import { Heart } from "lucide-react";
import {
  useWatchlist,
  type WatchlistContentType,
} from "@/lib/watchlist-context";

interface BookmarkButtonProps {
  slug: string;
  contentType: WatchlistContentType;
  title: string;
  posterUrl?: string;
  size?: number;
  className?: string;
}

export default function BookmarkButton({
  slug,
  contentType,
  title,
  posterUrl,
  size = 20,
  className = "",
}: BookmarkButtonProps) {
  const { isSaved, toggle } = useWatchlist();
  const saved = isSaved(slug, contentType);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle({ slug, contentType, title, posterUrl });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? "워치리스트에서 제거" : "워치리스트에 담기"}
      aria-pressed={saved}
      className={`inline-flex items-center justify-center text-amber-400 transition-all duration-150 hover:scale-110 hover:text-red-500 active:scale-125 ${className}`}
    >
      <Heart size={size} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
