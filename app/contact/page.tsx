import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Contact Us",
    description:
      "Reach the Franvia K-Trend Chart team about general questions, ranking data, or partnerships. All enquiries go to business@franvia.com.",
  };
}

const contactCards = [
  {
    title: "General Question about Franvia",
    description:
      "Questions about Franvia.com's articles, K-Food, K-Beauty, Hangeul, or other editorial content.",
    href: "mailto:business@franvia.com?subject=%5BFranvia%5D%20General%20Inquiry",
  },
  {
    title: "Data or Ranking Question — K-Trend Chart",
    description:
      "Something looks off in a ranking, or you'd like to understand how a chart was compiled.",
    href: "mailto:business@franvia.com?subject=%5BFranvia%20K-Trend%20Chart%5D%20Data%2FRanking%20Inquiry",
  },
  {
    title: "Partnership or Advertising — K-Trend Chart",
    description:
      "Media partnerships, data collaboration, or advertising enquiries specific to this site.",
    href: "mailto:business@franvia.com?subject=%5BFranvia%20K-Trend%20Chart%5D%20Partnership%20Inquiry",
  },
];

export default function ContactPage() {
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
            Contact Franvia K-Trend Chart
          </h1>
          <p className="mt-3 text-zinc-100 leading-relaxed">
            We read every message. Let us know what you&apos;re reaching out
            about, and we&apos;ll route it accordingly.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            {contactCards.map((card) => (
              <a
                key={card.title}
                href={card.href}
                className="block rounded-xl border border-zinc-800 bg-zinc-800 p-5 transition-all duration-300 hover:cursor-pointer hover:shadow-[0_0_12px_rgba(239,68,68,0.35)] hover:ring-1 hover:ring-red-500/50"
              >
                <p className="text-base font-semibold text-amber-400">
                  {card.title}
                </p>
                <p className="mt-1.5 text-sm text-zinc-300">
                  {card.description}
                </p>
              </a>
            ))}
          </div>

          <h2 className="mt-10 text-xl font-bold text-amber-400">
            A Few Things Worth Knowing
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-zinc-100">
            <li>
              All correspondence goes to one address; the category you
              select only pre-fills the subject line so we can route it
              faster.
            </li>
            <li>
              Response time varies with volume. Relevant enquiries always
              receive a reply.
            </li>
            <li>English and Korean are both welcome.</li>
          </ul>

          <div className="mt-10 border-t border-zinc-800 pt-6 text-sm text-zinc-400">
            <p>
              Primary Contact:{" "}
              <a
                href="mailto:business@franvia.com"
                className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
              >
                business@franvia.com
              </a>
            </p>
            <p className="mt-1">Based in Korea · Franvia Network</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
