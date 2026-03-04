'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/pickup/payments', label: 'Payment Tracker' },
  { href: '/pickup/draft',    label: 'Team Drafter'    },
];

export default function PickupNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Pickup tools navigation"
      className="bg-[var(--bg-surface)] border-b border-[var(--border)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 h-11">
          <span className="text-sm font-semibold text-[var(--text-muted)] mr-3 hidden sm:inline">
            Pickup Tools
          </span>
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] ${
                  active
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-gray-100'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
