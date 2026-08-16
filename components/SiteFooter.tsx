export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-900">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-zinc-400 sm:flex-row">
        <p>&copy; 2026 Franvia. All rights reserved.</p>
        <a
          href="https://www.franvia.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-zinc-300 transition-colors hover:text-amber-400"
        >
          Visit Franvia.com
        </a>
      </div>
    </footer>
  );
}
