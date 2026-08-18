import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SocialCuratorForm from "@/components/SocialCuratorForm";

export const metadata: Metadata = {
  title: "Social Curator",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SocialCuratorPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-zinc-900">
        <div className="mx-auto w-full max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold text-amber-400">
            Social Curator
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Curate up to 10 X (Twitter) reactions per movie/drama page —
            internal tool, not indexed by search engines.
          </p>

          <SocialCuratorForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
