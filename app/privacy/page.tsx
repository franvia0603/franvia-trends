import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Privacy Policy | Franvia K-Trend Chart",
    description:
      "How Franvia K-Trend Chart collects, uses, and protects visitor information, including analytics, advertising, third-party data sources, and your privacy rights.",
  };
}

export default function PrivacyPage() {
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
            Privacy Policy — Franvia K-Trend Chart
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Last Updated: August 2026
          </p>

          <p className="mt-6 text-zinc-100 leading-relaxed">
            This Privacy Policy explains how Franvia K-Trend Chart
            (trend.franvia.com) collects, uses, and protects information
            associated with your visit. This site is operated by Franvia,
            the same publisher behind Franvia.com; for Franvia.com&apos;s
            own privacy practices, see{" "}
            <a
              href="https://www.franvia.com/p/privacy-policy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
            >
              Franvia.com&apos;s Privacy Policy
            </a>
            .
          </p>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            Questions about this policy:{" "}
            <a
              href="mailto:business@franvia.com"
              className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
            >
              business@franvia.com
            </a>
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            1. Information We Collect
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            This site does not require registration and does not
            intentionally collect sensitive personal data.
          </p>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            <span className="font-semibold text-amber-400">
              Information you provide directly:
            </span>{" "}
            Your email address, if you contact us.
          </p>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            <span className="font-semibold text-amber-400">
              Information collected automatically:
            </span>{" "}
            When you visit, analytics and (where enabled) advertising
            technologies may collect your IP address (anonymized where
            possible), browser and device information, pages visited, time
            on page, approximate location at city level, and cookies or
            similar identifiers.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            2. Cookies &amp; Analytics
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            We use Google Analytics to understand aggregate site traffic and
            visitor behavior. No personally identifiable information is
            shared with Google Analytics directly. Opt-out tool:{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
            >
              tools.google.com/dlpage/gaoptout
            </a>
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            3. Advertising
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            This site may display advertising through Mediavine or
            comparable ad networks once approved. Advertising partners may
            use cookies to personalize ads, measure performance, and detect
            invalid traffic. Visitors in the EU/EEA, UK, and other regions
            with applicable consent laws will be presented with a consent
            management option. We do not sell personal information to
            third parties.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            4. Data Sources for Rankings
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            The rankings and content shown on this site (box office
            figures, drama rankings, posters, synopses) are drawn from
            third-party public data sources — the Korean Film Council
            (KOFIC/KOBIS) and TMDB. These sources operate under their own
            data and privacy practices, which we do not control.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            5. Third-Party Services
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            This site is built using standard cloud hosting and database
            infrastructure, which may process data on servers located
            outside your country of residence, including the United
            States. By using this site, you acknowledge this.
          </p>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            We also draw ranking data and media metadata (posters,
            synopses, titles) from third-party public data providers,
            including the Korean Film Council (KOFIC/KOBIS) and TMDB, each
            of which operates under its own data practices.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            6. Your Rights
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            <span className="font-semibold text-amber-400">
              GDPR (EU/EEA):
            </span>{" "}
            access, correction, deletion, restriction, portability, and
            withdrawal of consent.
          </p>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            <span className="font-semibold text-amber-400">
              CCPA/CPRA (California):
            </span>{" "}
            disclosure, deletion, and opt-out of data sharing. We do not
            sell personal data.
          </p>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            <span className="font-semibold text-amber-400">
              Do Not Track:
            </span>{" "}
            honored where technically feasible.
          </p>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            To exercise any right, contact{" "}
            <a
              href="mailto:business@franvia.com"
              className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
            >
              business@franvia.com
            </a>
            .
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            7. Children&apos;s Privacy
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            This site does not knowingly collect personal information from
            children under 13 (COPPA) and is not directed at children.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            8. Data Security
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            We take reasonable steps to protect information associated with
            this site, but no method of transmission or storage is entirely
            secure.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            9. External Links
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            This site may link to external sources (e.g., KOBIS, TMDB,
            streaming platforms). We are not responsible for their content
            or privacy practices.
          </p>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            10. Changes to This Policy
          </h2>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            This policy may be updated periodically; the date above
            reflects the last revision. Continued use after an update
            constitutes acceptance.
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
