'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from './icons'

const NAV_LINKS = [
  { href: '/league/fixtures',  label: 'Fixtures'  },
  { href: '/league/standings', label: 'Standings' },
  { href: '/league/teams',     label: 'Teams'     },
  { href: '/league/players',   label: 'Players'   },
  { href: '/league/spirit',    label: 'Spirit'    },
  { href: '/league/stats',     label: 'Stats'     },
  { href: '/league/mvp',       label: 'MVP'       },
  { href: '/league/gallery',   label: 'Gallery'   },
  { href: '/league/rules',     label: 'Rules'     },
]

export default function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-20">
        {/* Topbar — always visible */}
        <div className="max-w-7xl mx-auto px-4 flex items-center h-14 justify-between md:justify-center md:gap-8">
          <div className="flex items-center gap-3 shrink-0">
            {/* Bridge back to the federation site (Hallmark P2 2e) */}
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors whitespace-nowrap"
            >
              ← frisbee.mv
            </Link>
            <Link href="/league" className="shrink-0">
              <Image src="/bannerlogo.svg" alt="UFA League" width={120} height={40} className="h-10 w-auto" priority />
            </Link>
          </div>

          {/* Desktop links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap text-sm ${
                  pathname === href ? 'nav-link-active' : 'nav-link-inactive'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Hamburger — mobile only, right-anchored */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-in drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 z-40 bg-gray-950 border-l border-gray-800
          flex flex-col pt-16 px-4 pb-6 gap-1 transition-transform duration-300 md:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMenuOpen(false)}
            className={`py-2.5 px-3 text-sm font-medium rounded-lg ${
              pathname === href
                ? 'bg-green-900/30 text-green-400'
                : 'nav-link-inactive hover:bg-gray-900'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </>
  )
}
