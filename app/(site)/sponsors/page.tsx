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

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function getActiveSponsorsByTier(tier: Sponsor['tier']): Sponsor[] {
  return sponsors.filter((s) => s.tier === tier && s.active);
}

/* ─── Active sponsor card ───────────────────────────────────────────────────── */

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const card = (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-center">
      <p className="font-bold text-[var(--text-primary)] text-lg">{sponsor.name}</p>
      {sponsor.description && (
        <p className="text-sm text-[var(--text-muted)] mt-2">{sponsor.description}</p>
      )}
    </div>
  );

  if (sponsor.url) {
    return (
      <a
        href={sponsor.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded-xl"
        aria-label={`${sponsor.name} — sponsor website (opens in new tab)`}
      >
        {card}
      </a>
    );
  }
  return card;
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function SponsorsPage() {
  const titleSponsors = getActiveSponsorsByTier('title');
  const goldSponsors = getActiveSponsorsByTier('gold');
  const communitySponsors = getActiveSponsorsByTier('community');
  const hasAnyActive =
    titleSponsors.length > 0 || goldSponsors.length > 0 || communitySponsors.length > 0;

  return (
    <>
      {/* ── Page hero band ────────────────────────────────────────────────── */}
      <section
        className="bg-[var(--accent)] py-16 px-4"
        aria-label="Page header"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3">
            Support UFA
          </h1>
          <p className="text-lg text-white/85 font-medium">
            There are several ways to help grow Ultimate Frisbee in the Maldives — big and small.
          </p>
        </div>
      </section>

      {/* ── Ways to Support ───────────────────────────────────────────────── */}
      <section className="py-16 px-4" aria-labelledby="ways-heading">
        <div className="mx-auto max-w-5xl">
          <h2
            id="ways-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-10 text-center"
          >
            Ways to Help
          </h2>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Card 1 — Donate */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 flex flex-col gap-4">
              <div className="w-11 h-11 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-[var(--accent)]"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  <path d="M12 6v2M12 16v2M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-1 2-2.5 2.5S9.5 13 9.5 14.5a2.5 2.5 0 0 0 5 0" />
                </svg>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Make a Donation</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1">
                  Your contribution directly funds equipment, tournament entry fees, and player
                  development. Donations of any size are welcome — we&rsquo;re a non-profit
                  association run entirely by volunteers.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded transition-colors"
              >
                Contact us about donating
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06L7.28 11.78a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            {/* Card 2 — Intro Sessions */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 flex flex-col gap-4">
              <div className="w-11 h-11 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-[var(--accent)]"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Bring Ultimate to Your Team</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1">
                  We offer introductory sessions for schools, workplaces, and community groups. A
                  small fee applies to cover our volunteers&rsquo; time and equipment. No experience
                  needed — just show up ready to play.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded transition-colors"
              >
                Book a session
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06L7.28 11.78a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            {/* Card 3 — Facility */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 flex flex-col gap-4">
              <div className="w-11 h-11 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-[var(--accent)]"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Help Us Find a Field</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1">
                  Access to good playing space is one of our biggest constraints. If your
                  organisation has grounds or can help us secure regular court time, we&rsquo;d love
                  to hear from you.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded transition-colors"
              >
                Talk to us
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06L7.28 11.78a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partners (only shown when at least one active sponsor exists) ───── */}
      {hasAnyActive && (
        <section
          className="py-16 px-4 bg-[var(--bg-surface)] border-y border-[var(--border)]"
          aria-labelledby="partners-heading"
        >
          <div className="mx-auto max-w-5xl">
            <h2
              id="partners-heading"
              className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-10 text-center"
            >
              Our Partners &amp; Supporters
            </h2>

            {titleSponsors.length > 0 && (
              <div className="mb-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4 text-center">
                  Title Sponsor
                </p>
                <div className="max-w-sm mx-auto">
                  {titleSponsors.map((s) => (
                    <SponsorCard key={s.id} sponsor={s} />
                  ))}
                </div>
              </div>
            )}

            {goldSponsors.length > 0 && (
              <div className="mb-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4 text-center">
                  Gold Partners
                </p>
                <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
                  {goldSponsors.map((s) => (
                    <SponsorCard key={s.id} sponsor={s} />
                  ))}
                </div>
              </div>
            )}

            {communitySponsors.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4 text-center">
                  Community Supporters
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {communitySponsors.map((s) => (
                    <SponsorCard key={s.id} sponsor={s} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Contact CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 text-center">
        <div className="mx-auto max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4">
            Interested in supporting UFA?
          </h2>
          <p className="text-[var(--text-muted)] mb-8">
            We&rsquo;d love to hear from you — whether you want to donate, book a session, or
            discuss another way to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors min-h-[44px] px-6 py-3 text-base bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:bg-[var(--accent-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
