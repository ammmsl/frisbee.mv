/* Hallmark · macrostructure: Quote-Led · theme: federation · paper: tinted-pacific · accent: pacific-blue */

import type { Metadata } from 'next';
import Link from 'next/link';
import sponsorsData from '@/config/sponsors.json';

/* ─── Config type ───────────────────────────────────────────────────────────── */

interface Sponsor {
  id: string;
  name: string;
  tier: 'title' | 'gold' | 'community';
  logo: string | null;
  url: string | null;
  description: string;
  active: boolean;
}

const sponsors = sponsorsData as Sponsor[];

/* ─── Metadata ──────────────────────────────────────────────────────────────── */

export function generateMetadata(): Metadata {
  return {
    title: 'Support UFA | frisbee.mv',
    description:
      'Support the Ultimate Frisbee Association. Donate, book an introductory session, or help us find playing space in the Maldives.',
  };
}

/* ─── Data ──────────────────────────────────────────────────────────────────── */

function getActiveSponsorsByTier(tier: Sponsor['tier']): Sponsor[] {
  return sponsors.filter((s) => s.tier === tier && s.active);
}

const TIER_LABELS: Record<Sponsor['tier'], string> = {
  title: 'Title Sponsor',
  gold: 'Gold Partners',
  community: 'Community Supporters',
};

const WAYS_TO_HELP = [
  {
    title: 'Make a Donation',
    body:
      'Your contribution directly funds equipment, tournament entry fees, and player development. Donations of any size are welcome — we’re a non-profit association run entirely by volunteers.',
    linkLabel: 'Contact us about donating',
  },
  {
    title: 'Bring Ultimate to Your Team',
    body:
      'We offer introductory sessions for schools, workplaces, and community groups. A small fee applies to cover our volunteers’ time and equipment. No experience needed — just show up ready to play.',
    linkLabel: 'Book a session',
  },
  {
    title: 'Help Us Find a Field',
    body:
      'Access to good playing space is one of our biggest constraints. If your organisation has grounds or can help us secure regular court time, we’d love to hear from you.',
    linkLabel: 'Talk to us',
  },
] as const;

/* ─── Sponsor as pull-quote — the description speaks, the name attributes ───── */

function SponsorQuote({ sponsor }: { sponsor: Sponsor }) {
  return (
    <figure className="max-w-2xl">
      <blockquote className="text-xl sm:text-2xl font-medium leading-snug text-[var(--text-primary)] mb-3">
        &ldquo;{sponsor.description}&rdquo;
      </blockquote>
      <figcaption className="text-sm text-[var(--text-muted)]">
        —{' '}
        {sponsor.url ? (
          <a
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--accent-dark)] underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
          >
            {sponsor.name}
          </a>
        ) : (
          <span className="font-semibold">{sponsor.name}</span>
        )}
      </figcaption>
    </figure>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function SponsorsPage() {
  const tiers = (['title', 'gold', 'community'] as const)
    .map((tier) => ({ tier, sponsors: getActiveSponsorsByTier(tier) }))
    .filter((t) => t.sponsors.length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20">
      {/* ── Opening — headline top-left, no accent band ───────────────────── */}
      <header className="mb-14">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
          Support UFA
        </h1>
        <p className="text-lg text-[var(--text-muted)]">
          There are several ways to help grow Ultimate Frisbee in the Maldives — big and small.
        </p>
      </header>

      {/* ── Partners — quotes lead the page ───────────────────────────────── */}
      <section
        className="border-t border-[var(--border)] py-12"
        aria-labelledby="partners-heading"
      >
        <h2
          id="partners-heading"
          className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-8"
        >
          Our Partners &amp; Supporters
        </h2>

        {tiers.length > 0 ? (
          tiers.map(({ tier, sponsors: tierSponsors }, i) => (
            <div
              key={tier}
              className={i > 0 ? 'border-t border-[var(--border)] pt-8 mt-8' : ''}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-5">
                {TIER_LABELS[tier]}
              </p>
              <div className="space-y-8">
                {tierSponsors.map((s) => (
                  <SponsorQuote key={s.id} sponsor={s} />
                ))}
              </div>
            </div>
          ))
        ) : (
          /* Empty state — the close where the quotes would be */
          <p className="text-xl sm:text-2xl font-medium leading-snug text-[var(--text-primary)] max-w-2xl">
            We&rsquo;re looking for our first title sponsor.{' '}
            <Link
              href="/contact"
              className="text-[var(--accent-dark)] underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
            >
              Get in touch
            </Link>
            .
          </p>
        )}
      </section>

      {/* ── Ways to Help — stacked list, no icon-card grid ────────────────── */}
      <section
        className="border-t border-[var(--border)] py-12"
        aria-labelledby="ways-heading"
      >
        <h2
          id="ways-heading"
          className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-8"
        >
          Ways to Help
        </h2>

        <div className="space-y-10 max-w-2xl">
          {WAYS_TO_HELP.map((way) => (
            <div key={way.title}>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{way.title}</h3>
              <p className="text-[var(--text-muted)] leading-relaxed mb-3">{way.body}</p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 min-h-[44px] text-sm font-semibold text-[var(--accent-dark)] underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
              >
                {way.linkLabel} →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
