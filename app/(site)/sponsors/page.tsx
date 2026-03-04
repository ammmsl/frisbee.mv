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
    title: 'Sponsors | frisbee.mv',
    description:
      'Support the Maldives Flying Disc Federation. Sponsorship opportunities for organisations who want to back the growth of Ultimate Frisbee in the Maldives.',
  };
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function getActiveSponsorsByTier(tier: Sponsor['tier']): Sponsor[] {
  return sponsors.filter((s) => s.tier === tier && s.active);
}

/* ─── Placeholder card ──────────────────────────────────────────────────────── */

function PlaceholderCard({ size }: { size: 'large' | 'medium' | 'small' }) {
  const logoHeight: Record<string, string> = {
    large: 'h-40',
    medium: 'h-32',
    small: 'h-24',
  };
  return (
    <div className="rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-6 flex flex-col items-center justify-center gap-3 text-center">
      <div
        className={`${logoHeight[size]} w-full rounded-lg border border-dashed border-[var(--border)] flex items-center justify-center`}
        aria-hidden="true"
      >
        <span className="text-xs text-[var(--text-muted)]">Logo</span>
      </div>
      <p className="text-sm text-[var(--text-muted)] font-medium">Position available</p>
    </div>
  );
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

  return (
    <>
      {/* ── Page hero band ────────────────────────────────────────────────── */}
      <section
        className="bg-[var(--accent)] py-16 px-4"
        aria-label="Page header"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3">
            Partners &amp; Supporters
          </h1>
          <p className="text-lg text-white/85 font-medium">
            Help grow Ultimate Frisbee across the Maldives.
          </p>
        </div>
      </section>

      {/* ── Overview ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg text-[var(--text-muted)] leading-relaxed">
            The Maldives Flying Disc Federation is looking for founding sponsors and partners. We
            offer community reach across 167+ active players, branding at weekly sessions and
            tournaments at Villingili Football Ground, jersey sponsorship, and social media
            presence. All support, large or small, directly funds player development and events.
          </p>
        </div>
      </section>

      {/* ── Sponsor tier grid ─────────────────────────────────────────────── */}
      <section
        className="py-16 px-4 bg-[var(--bg-surface)] border-y border-[var(--border)]"
        aria-labelledby="tiers-heading"
      >
        <div className="mx-auto max-w-5xl">
          <h2
            id="tiers-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-10 text-center"
          >
            Our Partners
          </h2>

          {/* Title Sponsor — 1 slot */}
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4 text-center">
              Title Sponsor
            </p>
            <div className="max-w-sm mx-auto">
              {titleSponsors.length > 0 ? (
                titleSponsors.map((s) => <SponsorCard key={s.id} sponsor={s} />)
              ) : (
                <PlaceholderCard size="large" />
              )}
            </div>
          </div>

          {/* Gold Partners — 2 slots */}
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4 text-center">
              Gold Partners
            </p>
            <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
              {goldSponsors.length > 0
                ? goldSponsors.map((s) => <SponsorCard key={s.id} sponsor={s} />)
                : [0, 1].map((i) => <PlaceholderCard key={i} size="medium" />)}
            </div>
          </div>

          {/* Community Supporters — 3 slots */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4 text-center">
              Community Supporters
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {communitySponsors.length > 0
                ? communitySponsors.map((s) => <SponsorCard key={s.id} sponsor={s} />)
                : [0, 1, 2].map((i) => <PlaceholderCard key={i} size="small" />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 text-center">
        <div className="mx-auto max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4">
            Interested in supporting UFA?
          </h2>
          <p className="text-[var(--text-muted)] mb-8">
            We&rsquo;d love to hear from you. Get in touch and we&rsquo;ll share our sponsorship
            package.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors min-h-[44px] px-6 py-3 text-base bg-[var(--accent)] text-white hover:bg-[#e55a27] active:bg-[#cc4f22] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
