import Link from "next/link";

const SITE_LINKS = [
  { label: "About", href: "/about" },
  { label: "Play", href: "/play" },
  { label: "Rules", href: "/play/rules" },
  { label: "Governance", href: "/governance" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-surface)] border-t border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Four-column grid — stacks on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1 — Navigation */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              Navigation
            </h2>
            <ul className="space-y-2">
              {SITE_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors inline-block min-h-[44px] flex items-center"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 — Community */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              Community
            </h2>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://chat.whatsapp.com/frisbee-mv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors min-h-[44px]"
                >
                  <WhatsAppIcon />
                  <span>WhatsApp Group</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/frisbee.mv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors min-h-[44px]"
                >
                  <InstagramIcon />
                  <span>Instagram @frisbee.mv</span>
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com/@frisbee.mv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors min-h-[44px]"
                >
                  <TikTokIcon />
                  <span>TikTok @frisbee.mv</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 — Affiliations */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              Affiliations
            </h2>
            <div className="space-y-3">
              <a
                href="https://wfdf.sport"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors min-h-[44px]"
                aria-label="World Flying Disc Federation — WFDF (opens in new tab)"
              >
                {/* WFDF logo placeholder — replace with <Image> when asset is available */}
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  W
                </div>
                <div>
                  <p className="font-medium">WFDF</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    World Flying Disc Federation
                  </p>
                </div>
              </a>
              <a
                href="https://flyingdisc.asia/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors min-h-[44px]"
                aria-label="Asia Oceania Flying Disc Federation — AOFDF (opens in new tab)"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[var(--text-muted)] text-xs font-bold shrink-0">
                  A
                </div>
                <div>
                  <p className="font-medium">AOFDF</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Asia Oceania Flying Disc Federation
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Column 4 — Legal / Contact */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              Contact
            </h2>
            <div className="space-y-3 text-sm text-[var(--text-primary)]">
              <p>
                <a
                  href="mailto:hello@frisbee.mv"
                  className="hover:text-[var(--accent)] transition-colors"
                >
                  hello@frisbee.mv
                </a>
              </p>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Ultimate Frisbee Association (UFA)
                <br />
                Republic of Maldives
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-[var(--border)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-[var(--text-muted)]">
              &copy; {year} UFA. All rights reserved.
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Registered with the Commissioner of Sports, Republic of Maldives
              &nbsp;&middot;&nbsp; WFDF Provisional Member
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* Inline SVG icons ───────────────────────────────────────────────────────── */

function WhatsAppIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z" />
    </svg>
  );
}
