"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";

const SECTION_IDS = ["movies", "k-drama"] as const;
type SectionId = (typeof SECTION_IDS)[number];

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
      className={`rounded-full bg-amber-400 px-5 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-amber-300 ${className}`}
    >
      Visit Franvia.com
    </a>
  );
}

function desktopNavLinkClass(active: boolean): string {
  const base =
    "border-b-2 pb-1 text-sm font-semibold transition-colors hover:text-amber-400";
  return active
    ? `${base} border-amber-400 text-amber-400`
    : `${base} border-transparent text-zinc-300`;
}

function mobileNavLinkClass(active: boolean): string {
  const base = "text-sm font-semibold transition-colors hover:text-amber-400";
  return active ? `${base} text-amber-400` : `${base} text-zinc-300`;
}

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("movies");

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
            className={desktopNavLinkClass(activeSection === "movies")}
          >
            Movies
          </a>
          <a
            href="#k-drama"
            className={desktopNavLinkClass(activeSection === "k-drama")}
          >
            K-Drama
          </a>
          <span className="flex cursor-default items-center gap-1.5 pb-1 text-sm font-medium text-zinc-500">
            K-pop
            <ComingSoonBadge />
          </span>
        </nav>

        <SearchBar compact className="hidden md:block md:w-44 lg:w-56" />

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
              className={mobileNavLinkClass(activeSection === "movies")}
              onClick={() => setIsMenuOpen(false)}
            >
              Movies
            </a>
            <a
              href="#k-drama"
              className={mobileNavLinkClass(activeSection === "k-drama")}
              onClick={() => setIsMenuOpen(false)}
            >
              K-Drama
            </a>
            <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-500">
              K-pop
              <ComingSoonBadge />
            </span>
            <SearchBar compact />
            <VisitFranviaButton className="text-center" />
          </nav>
        </div>
      )}
    </header>
  );
}
