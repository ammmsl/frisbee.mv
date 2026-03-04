import type { Metadata } from 'next';
import Link from 'next/link';

export function generateMetadata(): Metadata {
  return {
    title: 'Pickup Tools | frisbee.mv',
    description:
      'Payment tracker and team drafter for MFDF pickup sessions.',
  };
}

interface ToolCard {
  title: string;
  description: string;
  href: string;
}

const tools: ToolCard[] = [
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
];

export default function PickupPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
        Pickup Tools
      </h1>
      <p className="text-[var(--text-muted)] mb-8">
        Handy tools for MFDF pickup sessions.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.href}
            className="border border-[var(--border)] rounded-xl p-6 bg-[var(--bg-surface)] hover:border-[var(--accent)] transition-colors"
          >
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              {tool.title}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              {tool.description}
            </p>
            <Link
              href={tool.href}
              className="text-sm font-semibold text-[var(--accent)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] rounded"
            >
              Open →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
