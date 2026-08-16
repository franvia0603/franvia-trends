import Link from "next/link";

const footerLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-900">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl font-bold text-white sm:text-2xl">
            All About Korea
          </p>
          <a
            href="https://www.franvia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-amber-400 px-5 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-amber-300"
          >
            Visit Franvia.com
          </a>
        </div>

        <p className="text-sm text-zinc-400">
          &copy; 2026 <span className="font-bold text-amber-400">FRANVIA</span>.
          All rights reserved.
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-zinc-500">
          {footerLinks.map((link, index) => (
            <span key={link.href} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">·</span>}
              <Link
                href={link.href}
                className="transition-colors hover:text-amber-400"
              >
                {link.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
