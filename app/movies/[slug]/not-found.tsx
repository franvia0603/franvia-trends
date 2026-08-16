import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function MovieNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Movie Not Found</h1>
        <p className="mt-3 text-zinc-500">
          We couldn&apos;t find a box office entry for this movie.
        </p>
        <Link
          href="/"
          className="mt-6 text-sm font-medium text-amber-500 transition-colors hover:text-amber-600"
        >
          ← Back to Rankings
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
