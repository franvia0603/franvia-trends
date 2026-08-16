"use client";

import { useState } from "react";

function ComingSoonBadge() {
  return (
    <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
      Coming Soon
    </span>
  );
}

function VisitFranviaButton({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://www.franvia.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`rounded-full border border-amber-400 px-4 py-1.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-400 hover:text-zinc-900 ${className}`}
    >
      Visit Franvia.com
    </a>
  );
}

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <a
          href="https://trend.franvia.com"
          className="flex shrink-0 items-baseline gap-1.5"
        >
          <span className="text-xl font-extrabold tracking-tight text-amber-400">
            FRANVIA
          </span>
          <span className="text-lg font-light text-white">K-Trend Chart</span>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#movies"
            className="border-b-2 border-amber-400 pb-1 text-sm font-semibold text-amber-400 transition-colors hover:text-amber-400"
          >
            Movies
          </a>
          <a
            href="#k-drama"
            className="pb-1 text-sm font-semibold text-zinc-300 transition-colors hover:text-amber-400"
          >
            K-Drama
          </a>
          <span className="flex cursor-default items-center gap-1.5 pb-1 text-sm font-medium text-zinc-500">
            K-pop
            <ComingSoonBadge />
          </span>
        </nav>

        <VisitFranviaButton className="hidden md:inline-block" />

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-zinc-300 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            {isMenuOpen ? (
              <path d="M6 6l12 12M18 6l-12 12" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-zinc-800 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <a
              href="#movies"
              className="text-sm font-semibold text-amber-400 transition-colors hover:text-amber-400"
              onClick={() => setIsMenuOpen(false)}
            >
              Movies
            </a>
            <a
              href="#k-drama"
              className="text-sm font-semibold text-zinc-300 transition-colors hover:text-amber-400"
              onClick={() => setIsMenuOpen(false)}
            >
              K-Drama
            </a>
            <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-500">
              K-pop
              <ComingSoonBadge />
            </span>
            <VisitFranviaButton className="text-center" />
          </nav>
        </div>
      )}
    </header>
  );
}
