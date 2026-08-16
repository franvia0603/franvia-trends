import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About Us",
    description:
      "Learn how Franvia K-Trend Chart sources its K-Movie box office and K-Drama rankings from KOBIS and TMDB, and how this site fits into the Franvia network.",
  };
}

export default function AboutPage() {
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
            About Franvia K-Trend Chart
          </h1>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            What This Is
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            Franvia K-Trend Chart tracks what&apos;s actually rising in
            Korean movies and dramas — using official, verifiable data
            instead of guesswork or social media buzz. Every ranking on this
            site is sourced directly from recognized industry authorities:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-zinc-100">
            <li>
              <span className="font-semibold text-amber-400">
                K-Movie Box Office:
              </span>{" "}
              The Korean Film Council (KOFIC), via its official KOBIS
              (Korean Box Office Information System) database.
            </li>
            <li>
              <span className="font-semibold text-amber-400">
                K-Drama Rankings:
              </span>{" "}
              Global popularity and metadata via TMDB (The Movie Database),
              a trusted open film and TV data platform.
            </li>
            <li>
              <span className="font-semibold text-amber-400">
                Posters, synopses, cast, and trailers:
              </span>{" "}
              TMDB.
            </li>
          </ul>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            We don&apos;t editorialize the numbers. We collect them, present
            them clearly, and let readers make their own viewing choices —
            with an occasional editor&apos;s note when a chart movement is
            worth explaining.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            Why This Exists
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            Most &quot;trending in Korea&quot; content online is anecdotal —
            a headline here, a viral clip there. Franvia K-Trend Chart
            exists to give readers a single, reliable reference point:
            what&apos;s genuinely charting, according to the organizations
            that actually measure it.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            Part of the Franvia Network
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            Franvia K-Trend Chart is operated by Franvia, the publisher
            behind Franvia.com — an English-language magazine covering
            Korean food, beauty, language, and culture in depth. This site
            is our data-driven companion to that editorial work: where
            Franvia.com explains why Korean culture works the way it does,
            K-Trend Chart shows what&apos;s happening right now.
          </p>
          <a
            href="https://www.franvia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block rounded-full bg-amber-400 px-5 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-amber-300"
          >
            Visit Franvia.com
          </a>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            Questions or Corrections
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            If you notice a data discrepancy, or have questions about how a
            ranking was sourced, we want to hear from it. See our{" "}
            <Link
              href="/contact"
              className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
            >
              Contact page
            </Link>{" "}
            for details.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
