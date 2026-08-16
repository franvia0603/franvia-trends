"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  compact?: boolean;
  className?: string;
}

export default function SearchBar({
  compact = false,
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className={className}>
      {!compact && (
        <p className="mb-1.5 text-xs font-medium text-zinc-400">
          Search K-Movie & K-Drama
        </p>
      )}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search a movie or drama title..."
          aria-label="Search a movie or drama title"
          className="w-full rounded-full border border-zinc-700 bg-zinc-800 py-2 pl-9 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-amber-400"
        />
      </div>
    </div>
  );
}
