/* Hallmark · macrostructure: Typographic List · theme: federation · paper: tinted-pacific · accent: pacific-blue */

import type { Metadata } from 'next';
import Link from 'next/link';

export function generateMetadata(): Metadata {
  return {
    title: 'Pickup Tools | frisbee.mv',
    description:
      'Payment tracker and team drafter for UFA pickup sessions.',
  };
}

const tools = [
  {
    title: 'Payment Tracker',
    description:
      'Check your session fee balance and payment history.',
    href: '/pickup/payments',
  },
  {
    title: 'Team Drafter',
    description:
      'Randomly sort players into balanced teams for pickup sessions.',
    href: '/pickup/draft',
  },
  {
    title: 'Membership Calculator',
    description:
      'Find out if UFA membership saves you money based on how often you play.',
    href: '/pickup/membership',
  },
] as const;

export default function PickupPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
        Pickup Tools
      </h1>
      <p className="text-[var(--text-muted)] mb-10">
        Handy tools for UFA pickup sessions.
      </p>

      {/* Definition list of tools — no card chrome */}
      <dl className="m-0">
        {tools.map((tool) => (
          <div key={tool.href} className="border-t border-[var(--border)] py-6 last:border-b">
            <dt className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              {tool.title}
            </dt>
            <dd className="m-0">
              <p className="text-[var(--text-muted)] leading-relaxed mb-2">
                {tool.description}
              </p>
              <Link
                href={tool.href}
                className="inline-flex items-center min-h-[44px] text-sm font-semibold text-[var(--accent-dark)] underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
                aria-label={`Open ${tool.title}`}
              >
                Open →
              </Link>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
