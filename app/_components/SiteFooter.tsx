import Link from "next/link";

/* Ft5 Statement footer (Hallmark P2 2d)
   One declarative paragraph, one inline row of links, one line of contact.
   No column grid, no social-icon strip, no copyright tail. */

const SITE_LINKS = [
  { label: "About", href: "/about" },
  { label: "Play", href: "/play" },
  { label: "Rules", href: "/play/rules" },
  { label: "Governance", href: "/governance" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "News", href: "/news" },
  { label: "Research & Data", href: "/data" },
  { label: "League", href: "/league" },
  { label: "Contact", href: "/contact" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-[var(--bg-surface)] border-t border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        {/* The statement */}
        <p className="max-w-prose text-base leading-relaxed text-[var(--text-primary)]">
          The Ultimate Frisbee Association is the national governing body for
          Ultimate and flying disc sports in the Republic of Maldives — a
          registered sports association and provisional member of the{" "}
          <a
            href="https://wfdf.sport"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[var(--accent)] transition-colors"
          >
            World Flying Disc Federation
          </a>
          . We play every Tuesday and Friday evening at Villingili Football
          Ground, Malé, and everyone is welcome — follow us on{" "}
          <a
            href="https://instagram.com/frisbee.mv"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[var(--accent)] transition-colors"
          >
            Instagram
          </a>{" "}
          and{" "}
          <a
            href="https://tiktok.com/@frisbee.mv"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[var(--accent)] transition-colors"
          >
            TikTok
          </a>{" "}
          at @frisbee.mv.
        </p>

        {/* Inline row of links */}
        <nav aria-label="Footer navigation" className="mt-8">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
            {SITE_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex items-center min-h-[44px] text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* One line of contact */}
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          <a
            href="mailto:frisbee.mv@gmail.com"
            className="inline-flex items-center min-h-[44px] hover:text-[var(--accent)] transition-colors"
          >
            frisbee.mv@gmail.com
          </a>
          <span aria-hidden="true"> · </span>
          Ultimate Frisbee Association, Republic of Maldives
        </p>
      </div>
    </footer>
  );
}
