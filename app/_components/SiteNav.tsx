"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Drawer from "./Drawer";

interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

const TOP_NAV_LINKS: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Play", href: "/play" }, // has dropdown
  { label: "League", href: "/league", external: true },
  { label: "Pickup", href: "/pickup" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

const PLAY_DROPDOWN: NavLink[] = [
  { label: "Join a Session", href: "/play" },
  { label: "Rules", href: "/play/rules" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navSolid, setNavSolid] = useState(!isHome);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);

  /* ─── Transparent nav: home hero only ──────────────────────────────── */
  useEffect(() => {
    if (!isHome) {
      setNavSolid(true);
      return;
    }

    setNavSolid(false);

    function handleScroll() {
      const sentinel = document.getElementById("hero-sentinel");
      if (sentinel) {
        const rect = sentinel.getBoundingClientRect();
        setNavSolid(rect.bottom <= 0);
      } else {
        // Fallback: go solid after 80px
        setNavSolid(window.scrollY > 80);
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  /* ─── Close drawer on route change ─────────────────────────────────── */
  useEffect(() => {
    setDrawerOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  /* ─── Dropdown: close on outside click / Escape ─────────────────────── */
  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
    dropdownTriggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeDropdown();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const items = dropdownRef.current?.querySelectorAll<HTMLElement>("a");
        items?.[0]?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen, closeDropdown]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const navBg = navSolid
    ? "bg-white border-b border-[var(--border)] shadow-sm"
    : "bg-transparent";

  const linkColour = navSolid ? "text-[var(--text-primary)]" : "text-white";

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-30 transition-all duration-300",
          navBg,
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Wordmark / logo */}
            <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
              <Image
                src="/logo.svg"
                alt="frisbee.mv"
                width={120}
                height={47}
                className={navSolid ? "" : "brightness-0 invert"}
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav
              aria-label="Primary navigation"
              className="hidden sm:flex items-center gap-1"
            >
              {TOP_NAV_LINKS.map(({ label, href, external }) => {
                if (label === "Play") {
                  return (
                    <div
                      key="play"
                      ref={dropdownRef}
                      className="relative"
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <button
                        ref={dropdownTriggerRef}
                        aria-haspopup="true"
                        aria-expanded={dropdownOpen}
                        onClick={() => setDropdownOpen((o) => !o)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setDropdownOpen((o) => !o);
                          }
                        }}
                        className={[
                          "flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px]",
                          isActive("/play")
                            ? "text-[var(--accent)]"
                            : navSolid
                              ? "text-[var(--text-primary)] hover:text-[var(--accent)] hover:bg-gray-50"
                              : "text-white hover:text-white/80",
                        ].join(" ")}
                      >
                        Play
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="currentColor"
                          aria-hidden="true"
                          className={[
                            "transition-transform duration-200",
                            dropdownOpen ? "rotate-180" : "",
                          ].join(" ")}
                        >
                          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      {/* Dropdown panel */}
                      <div
                        className={[
                          "absolute top-full left-0 mt-1 w-44 rounded-md bg-white shadow-lg border border-[var(--border)] py-1 transition-all duration-150 origin-top",
                          dropdownOpen
                            ? "opacity-100 translate-y-0 pointer-events-auto"
                            : "opacity-0 -translate-y-1 pointer-events-none",
                        ].join(" ")}
                        role="menu"
                      >
                        {PLAY_DROPDOWN.map(({ label: itemLabel, href: itemHref }) => (
                          <Link
                            key={itemHref}
                            href={itemHref}
                            role="menuitem"
                            onKeyDown={(e) => {
                              if (e.key === "Escape") closeDropdown();
                              if (e.key === "ArrowDown") {
                                e.preventDefault();
                                (e.currentTarget.nextElementSibling as HTMLElement | null)?.focus();
                              }
                              if (e.key === "ArrowUp") {
                                e.preventDefault();
                                (e.currentTarget.previousElementSibling as HTMLElement | null)?.focus();
                              }
                            }}
                            className={[
                              "block px-4 py-2.5 text-sm transition-colors min-h-[44px] flex items-center",
                              isActive(itemHref) && pathname === itemHref
                                ? "text-[var(--accent)] bg-sky-50"
                                : "text-[var(--text-primary)] hover:bg-gray-50 hover:text-[var(--accent)]",
                            ].join(" ")}
                          >
                            {itemLabel}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (external) {
                  return (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={[
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] inline-flex items-center",
                        navSolid
                          ? "text-[var(--text-primary)] hover:text-[var(--accent)] hover:bg-gray-50"
                          : "text-white hover:text-white/80",
                      ].join(" ")}
                    >
                      {label}
                    </a>
                  );
                }

                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={[
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] inline-flex items-center",
                      isActive(href)
                        ? "text-[var(--accent)]"
                        : navSolid
                          ? "text-[var(--text-primary)] hover:text-[var(--accent)] hover:bg-gray-50"
                          : "text-white hover:text-white/80",
                    ].join(" ")}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop right zone — WFDF badge */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="https://wfdf.sport"
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors",
                  navSolid
                    ? "border-[var(--accent)] text-[var(--accent)] hover:bg-sky-50"
                    : "border-white/60 text-white hover:border-white",
                ].join(" ")}
              >
                WFDF
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              onClick={() => setDrawerOpen(true)}
              className={[
                "sm:hidden flex items-center justify-center w-11 h-11 rounded-md transition-colors",
                navSolid
                  ? "text-[var(--text-primary)] hover:bg-gray-100"
                  : "text-white hover:bg-white/10",
              ].join(" ")}
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
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
