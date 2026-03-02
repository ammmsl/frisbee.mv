"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Join a Session", href: "/play" },
  { label: "Rules", href: "/play/rules" },
  { label: "League", href: "/league" },
  { label: "Pickup", href: "/pickup" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  /* Focus trap ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;

    // Move focus into drawer when it opens
    closeButtonRef.current?.focus();

    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusableSelectors =
      'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

    function getFocusable() {
      return Array.from(
        drawer!.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter((el) => !el.closest("[hidden]"));
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  /* Prevent body scroll when open ──────────────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={[
          "fixed inset-0 z-50 flex flex-col bg-white transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
          <Link
            href="/"
            onClick={onClose}
            className="text-xl font-bold text-[var(--text-primary)]"
          >
            frisbee.mv
          </Link>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close navigation"
            className="flex items-center justify-center w-11 h-11 rounded-md text-[var(--text-primary)] hover:bg-gray-100 transition-colors"
          >
            {/* Close (×) icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto py-4">
          <ul className="flex flex-col">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={[
                      "block px-6 py-4 text-lg font-medium transition-colors min-h-[44px]",
                      isActive
                        ? "text-[var(--accent)] bg-orange-50"
                        : "text-[var(--text-primary)] hover:bg-gray-50",
                    ].join(" ")}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom zone — social links + affiliation logos */}
        <div className="border-t border-[var(--border)] px-6 py-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Community
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="https://instagram.com/frisbee.mv"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors min-h-[44px]"
            >
              <InstagramIcon />
              <span className="text-sm font-medium">Instagram @frisbee.mv</span>
            </a>
            <a
              href="https://tiktok.com/@frisbee.mv"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors min-h-[44px]"
            >
              <TikTokIcon />
              <span className="text-sm font-medium">TikTok @frisbee.mv</span>
            </a>
          </div>

          {/* WFDF / AOFDF text badges */}
          <div className="flex items-center gap-4 pt-2">
            <a
              href="https://wfdf.sport"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors underline"
            >
              WFDF Provisional Member
            </a>
            <span className="text-[var(--border)]">·</span>
            <a
              href="https://aofdf.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors underline"
            >
              AOFDF Member
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

/* Inline SVG icons ───────────────────────────────────────────────────────── */

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
