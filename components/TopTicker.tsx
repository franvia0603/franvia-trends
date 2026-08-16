"use client";

import { useEffect, useState } from "react";

interface TickerItem {
  rank: number;
  title: string;
}

interface TopTickerProps {
  movies: TickerItem[];
  dramas: TickerItem[];
}

function formatItems(items: TickerItem[]): string {
  return items.map((item) => `#${item.rank} ${item.title}`).join(" · ");
}

export default function TopTicker({ movies, dramas }: TopTickerProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % 3);
        setVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const slides = [
    {
      emoji: "🎬",
      label: "Movies",
      content: movies.length > 0 ? formatItems(movies) : null,
    },
    {
      emoji: "📺",
      label: "K-Drama",
      content: dramas.length > 0 ? formatItems(dramas) : null,
    },
    {
      emoji: "🎵",
      label: "K-pop",
      content: "Coming soon",
    },
  ];

  const current = slides[index];

  return (
    <div
      className="flex h-9 items-center justify-center overflow-hidden bg-zinc-800 px-4 sm:h-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <p
        className={`truncate text-xs font-medium sm:text-sm ${
          visible ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
      >
        <span className="mr-1.5">{current.emoji}</span>
        <span className="font-semibold text-amber-400">{current.label}</span>
        {current.content && (
          <span className="ml-2 text-white">{current.content}</span>
        )}
      </p>
    </div>
  );
}
