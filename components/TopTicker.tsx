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

function TickerItems({ items }: { items: TickerItem[] }) {
  return (
    <>
      {items.map((item, index) => (
        <span key={item.rank}>
          {index > 0 && <span className="mx-2 text-zinc-500">·</span>}
          <span className="font-bold text-amber-400">#{item.rank}</span>
          <span className="ml-1.5 font-normal text-white">{item.title}</span>
        </span>
      ))}
    </>
  );
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
    { emoji: "🎬", label: "Movies", items: movies },
    { emoji: "📺", label: "K-Drama", items: dramas },
    { emoji: "🎵", label: "K-pop", items: [] as TickerItem[] },
  ];

  const current = slides[index];
  const isKpop = index === 2;

  return (
    <div
      className="flex h-9 items-center justify-center overflow-hidden bg-zinc-800 px-4 sm:h-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <p
        className={`truncate text-xs sm:text-sm ${
          visible ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
      >
        <span className="mr-1.5">{current.emoji}</span>
        <span className="font-semibold text-amber-400">{current.label}</span>
        {current.items.length > 0 && (
          <span className="ml-2">
            <TickerItems items={current.items} />
          </span>
        )}
        {isKpop && (
          <span className="ml-2 font-normal text-white">Coming soon</span>
        )}
      </p>
    </div>
  );
}
