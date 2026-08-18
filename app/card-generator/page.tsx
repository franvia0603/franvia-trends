import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CardGeneratorForm from "@/components/CardGeneratorForm";

export const metadata: Metadata = {
  title: "Card Generator",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CardGeneratorPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-zinc-900">
        <div className="mx-auto w-full max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold text-amber-400">
            Card Generator
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Generate a shareable 1080×1080 pick card for any Franvia content
            — internal tool, not indexed by search engines.
          </p>

          <CardGeneratorForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
