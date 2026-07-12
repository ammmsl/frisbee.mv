"use client";

/* N6 Newspaper Masthead (Hallmark P2 2c)
   Centred wordmark over a 1px pacific-blue rule, nav links in a row beneath.
   Static — no sticky card, no shadow, no scroll choreography; it scrolls off. */

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Drawer from "./Drawer";

interface NavLink {
  label: string;
  href: string;
  crossover?: boolean; // league sub-product — gets the green signal dot
}

const NAV_LINKS: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Play", href: "/play" },
  { label: "Rules", href: "/play/rules" },
  { label: "League", href: "/league", crossover: true },
  { label: "Pickup", href: "/pickup" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Close drawer on route change */
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      <header className="bg-[var(--bg-page)]">
        {/* Wordmark — centred over the rule */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center pt-7 pb-5">
            <Link
              href="/"
              className="transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
            >
              <Image src="/logo.svg" alt="frisbee.mv" width={132} height={52} priority />
            </Link>
          </div>
        </div>

        {/* The masthead rule */}
        <div
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-hidden="true"
        >
          <div className="border-b border-[var(--accent)]" />
        </div>

        {/* Links beneath the rule */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Primary navigation"
            className="hidden sm:flex items-center justify-center gap-x-1 py-1"
          >
            {NAV_LINKS.map(({ label, href, crossover }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={[
                  "inline-flex items-center gap-1.5 px-3 min-h-[44px] text-sm font-medium tracking-wide transition-colors",
                  isActive(href)
                    ? "text-[var(--accent-dark)]"
                    : "text-[var(--text-primary)] hover:text-[var(--accent)]",
                ].join(" ")}
              >
                {label}
                {crossover && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-green-400"
                    aria-hidden="true"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile: hamburger right-anchored under the rule */}
          <div className="sm:hidden flex justify-end py-1">
            <button
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center justify-center w-11 h-11 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
