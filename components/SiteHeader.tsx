"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { useWatchlist } from "@/lib/watchlist-context";

const SECTION_IDS = ["movies", "k-drama"] as const;
type SectionId = (typeof SECTION_IDS)[number];

function VisitFranviaButton({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://www.franvia.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`flex shrink-0 items-center justify-center rounded-md bg-amber-400 px-5 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-amber-300 ${className}`}
    >
      Visit Franvia.com
    </a>
  );
}

function navLinkClass(active: boolean): string {
  const base =
    "border-b-2 pb-1 text-sm font-semibold transition-colors hover:text-amber-400";
  return active
    ? `${base} border-amber-400 text-amber-400`
    : `${base} border-transparent text-zinc-300`;
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-zinc-900">
      {count}
    </span>
  );
}

function WatchlistNavLink({ count }: { count: number }) {
  return (
    <Link
      href="/watchlist"
      className="flex items-center gap-1.5 border-b-2 border-transparent pb-1 text-sm font-semibold text-zinc-300 transition-colors hover:text-amber-400"
    >
      <Heart size={16} />
      Watchlist
      <CountBadge count={count} />
    </Link>
  );
}

export default function SiteHeader() {
  const [activeSection, setActiveSection] = useState<SectionId>("movies");
  const { count } = useWatchlist();

  useEffect(() => {
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );

    if (elements.length === 0) {
      return;
    }

    // 스티키 헤더/티커 높이만큼 위쪽을 제외하고, 화면 상단 근처에
    // 걸린 섹션만 "활성"으로 감지한다.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id as SectionId);
        }
      },
      {
        rootMargin: "-96px 0px -70% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-7 z-50 border-b border-zinc-800 bg-zinc-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <a
            href="https://trend.franvia.com"
            className="flex shrink-0 items-baseline gap-1.5"
          >
            <span className="text-xl font-extrabold tracking-tight text-amber-400">
              FRANVIA
            </span>
            <span className="text-lg font-bold text-white">K-Trend Chart</span>
          </a>

          <VisitFranviaButton />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex flex-wrap items-center gap-6">
            <a
              href="#movies"
              className={navLinkClass(activeSection === "movies")}
            >
              Movies
            </a>
            <a
              href="#k-drama"
              className={navLinkClass(activeSection === "k-drama")}
            >
              K-Drama
            </a>
            <WatchlistNavLink count={count} />
          </nav>

          <SearchBar compact className="w-full sm:w-56" />
        </div>
      </div>
    </header>
  );
}
