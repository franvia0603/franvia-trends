import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Terms of Use",
    description:
      "The terms governing your use of Franvia K-Trend Chart, including data accuracy, intellectual property, use restrictions, and liability limitations.",
  };
}

export default function TermsPage() {
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
            Terms of Use — Franvia K-Trend Chart
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Last Updated: August 2026
          </p>

          <p className="mt-6 text-zinc-100 leading-relaxed">
            This Terms of Use agreement governs your access to and use of
            Franvia K-Trend Chart (trend.franvia.com), operated by Franvia.
            By using this site, you agree to these terms.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            1. Acceptance of Terms
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            You confirm you are at least 13 years of age and have the
            authority to agree to these terms.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            2. Nature of the Content
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            Franvia K-Trend Chart aggregates and presents publicly available
            ranking data from third-party sources, including the Korean
            Film Council (KOFIC/KOBIS) and TMDB. We compile and present this
            data; we do not independently verify every figure at its
            source, and rankings may be revised as source data updates.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            3. No Warranty on Accuracy
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            Rankings, figures, and metadata are provided &quot;as is,&quot;
            sourced from third parties, and may contain delays, omissions,
            or errors originating from those sources. This site makes no
            warranty as to completeness or real-time accuracy. Do not rely
            on this site as the sole basis for commercial or editorial
            decisions — verify with the original source (KOBIS, TMDB) for
            anything time-sensitive.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            4. Intellectual Property
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            Original content on this site — editor commentary, page design,
            and the compiled presentation of ranking data — is the property
            of Franvia. Movie/drama posters, synopses, and metadata are
            provided by TMDB under its own terms; box office figures are
            sourced from KOBIS under KOFIC&apos;s terms of public data use.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            5. Use Restrictions
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            You may view and share links to this site for personal,
            non-commercial use. You may not scrape, republish, or use this
            site&apos;s compiled data presentation for commercial purposes,
            or use content from this site to train AI/ML models, without
            prior written authorization from Franvia.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            6. Advertising &amp; Affiliate Disclosure
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            This site may display advertising (e.g., via Mediavine) to
            support operating costs. Any sponsored content will be clearly
            labeled.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            7. Third-Party Links
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            This site links to external sources including KOBIS, TMDB, and
            streaming platforms. We are not responsible for their content,
            accuracy, or practices.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            8. Limitation of Liability
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            To the maximum extent permitted by law, Franvia is not liable
            for damages arising from reliance on rankings or content
            presented on this site, including decisions made based on that
            information.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            9. Governing Law
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            These terms are governed by the laws of the Republic of Korea.
            Disputes are subject to the exclusive jurisdiction of the
            courts in Incheon, South Korea.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            10. Changes to Terms
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            We may update these terms; the date above reflects the last
            revision. Continued use after an update constitutes acceptance.
          </p>

          <p className="mt-8 border-t border-zinc-800 pt-6 text-sm text-zinc-400">
            Contact:{" "}
            <a
              href="mailto:business@franvia.com"
              className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
            >
              business@franvia.com
            </a>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
