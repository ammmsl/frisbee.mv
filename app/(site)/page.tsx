import type { Metadata } from 'next';
import Link from 'next/link';
import StatTile from '@/app/_components/StatTile';
import Badge from '@/app/_components/Badge';
import NewsCard from '@/app/_components/NewsCard';
import { getNextSession, getNextSessionAfterDate } from '@/lib/session';
import { getPublishedPosts, getSessionOverrides } from '@/lib/events';
import { getTodayMVT, addDays } from '@/lib/calendar';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: 'Ultimate Frisbee Association | frisbee.mv' },
    description:
      'The national governing body for Ultimate Frisbee in the Republic of Maldives. Weekly sessions in Malé every Tuesday and Friday — open to everyone.',
    openGraph: {
      title: 'Ultimate Frisbee Association | frisbee.mv',
      description:
        'The national governing body for Ultimate Frisbee in the Republic of Maldives. Weekly sessions in Malé every Tuesday and Friday — open to everyone.',
      url: 'https://frisbee.mv',
      type: 'website',
    },
  };
}

/* ─── Placeholder news data (fallback if no posts in DB) ─────────────────── */

const PLACEHOLDER_NEWS = [
  {
    id: 'federation-update',
    headline: 'Federation Update',
    date: 'December 2024',
    excerpt:
      'Ultimate Frisbee Association has been officially registered with the Commissioner of Sports, marking a landmark moment for the sport in the Maldives.',
  },
  {
    id: 'agm-2024',
    headline: 'AGM 2024 Recap',
    date: 'December 12, 2024',
    excerpt:
      'The inaugural Annual General Meeting of the UFA was held in Malé, with the executive committee elected by registered members through a secret ballot.',
  },
  {
    id: 'season-1',
    headline: 'Season 1 Underway',
    date: 'January 2025',
    excerpt:
      'Weekly pickup sessions continue every Tuesday and Friday at Villingili Football Ground. Sessions have now run for over 113 consecutive weeks without interruption.',
  },
] as const;

/* ─── Inline icons ────────────────────────────────────────────────────────── */

function MapPinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

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
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
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
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.5a8.16 8.16 0 0 0 4.77 1.52V7.59a4.85 4.85 0 0 1-1-.9z" />
    </svg>
  );
}

function DiscIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.25"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v20M2 12h20" />
    </svg>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default async function HomePage() {
  // ── Fetch session with override check ─────────────────────────────────────
  const todayMVT = getTodayMVT();
  const twoWeeksStr = addDays(todayMVT, 14);
  const [overrides, latestPosts] = await Promise.all([
    getSessionOverrides(todayMVT, twoWeeksStr),
    getPublishedPosts(3),
  ]);

  // Build set of cancelled dates and map of special override notes
  const cancelledDates = new Set(
    overrides.filter(o => o.status === 'cancelled').map(o => o.session_date),
  );
  const specialNotes = new Map(
    overrides.filter(o => o.status === 'special').map(o => [o.session_date, o.note]),
  );

  // Find the next non-cancelled session
  let session = getNextSession();
  if (cancelledDates.has(session.dateStr)) {
    session = getNextSessionAfterDate(session.dateStr);
  }
  const specialNote = specialNotes.get(session.dateStr) ?? null;

  return (
    <>
      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <section
        className="relative flex items-center justify-center min-h-screen -mt-16 overflow-hidden"
        aria-label="Hero"
      >
        {/* Disc-orange gradient — intentional brand colour, not a placeholder */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #FF6B35 0%, #e8582a 45%, #bf3d18 100%)',
          }}
        />

        {/* Radial highlight — adds depth to the gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,255,255,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Dark tint overlay — ensures white text passes WCAG AA */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/55" />

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-2xl px-4 pt-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 tracking-tight">
            Ultimate Frisbee Association
          </h1>
          <p className="text-lg sm:text-xl text-white/85 mb-10 font-medium">
            Ultimate Frisbee — Malé, Fuvahmulah &amp; Addu City
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Primary CTA */}
            <Link
              href="/play"
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors min-h-[44px] px-7 py-3 text-base bg-white text-[#bf3d18] hover:bg-white/92 active:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Join a Session
            </Link>

            {/* Ghost CTA */}
            <Link
              href="/pickup"
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors min-h-[44px] px-7 py-3 text-base bg-transparent border-2 border-white/75 text-white hover:bg-white/12 hover:border-white active:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Pickup &amp; League
            </Link>
          </div>
        </div>

        {/* WFDF Provisional Member badge — bottom-left */}
        <div className="absolute bottom-6 left-4 sm:left-8 z-10">
          <Badge variant="wfdf">WFDF Provisional Member</Badge>
        </div>

        {/*
         * Sentinel element — SiteNav watches this with a scroll handler.
         * When the sentinel's bottom edge crosses the top of the viewport,
         * SiteNav transitions from transparent to its solid background.
         */}
        <div
          id="hero-sentinel"
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-px"
        />
      </section>

      {/* ── 2. Live Stats Bar ────────────────────────────────────────────── */}
      <section
        className="py-12 px-4 bg-[var(--bg-surface)] border-y border-[var(--border)]"
        aria-label="Live community statistics"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-6 overflow-x-auto pb-2 lg:justify-center lg:overflow-visible lg:pb-0">
            <StatTile value={167} suffix="+" label="Players" />
            <StatTile value={113} suffix="+" label="Consecutive Weeks" />
            <StatTile value={3481} suffix="+" label="Attendances" />
          </div>
        </div>
      </section>

      {/* ── 3. Next Session ──────────────────────────────────────────────── */}
      <section
        className="py-16 px-4"
        aria-label="Next session details"
      >
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">
            Next Session
          </p>

          {/* Accent rule */}
          <div className="mx-auto w-10 h-1 rounded-full bg-[var(--accent)] mb-6" aria-hidden="true" />

          <p className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-1">
            {session.dayName}
          </p>
          <p className="text-xl text-[var(--text-muted)] mb-1">
            {session.fullDate}
          </p>
          <p className="text-lg font-semibold text-[var(--text-primary)] mb-1">
            {session.time}
          </p>
          <p className="text-[var(--text-muted)] mb-2">{session.location}</p>

          {/* Special override note */}
          {specialNote && (
            <p className="text-sm text-purple-600 mb-4">{specialNote}</p>
          )}

          {/* Ghost link styled as button */}
          <a
            href="https://maps.app.goo.gl/QNpZ2nUpYoQwBTaH6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors min-h-[44px] px-5 py-2.5 text-sm bg-transparent text-[var(--accent)] hover:bg-orange-50 active:bg-orange-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            <MapPinIcon />
            Get Directions
          </a>
        </div>
      </section>

      {/* ── 4. About Snippet ─────────────────────────────────────────────── */}
      <section
        className="py-16 px-4 bg-[var(--bg-surface)] border-y border-[var(--border)]"
        aria-label="About UFA"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6">
            About the Federation
          </h2>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8">
            The Ultimate Frisbee Association (UFA) is the national governing body for
            Ultimate Frisbee in the Republic of Maldives. Founded in 2024 and registered
            with the Commissioner of Sports, we are a provisional member of the World
            Flying Disc Federation. We run weekly sessions in Malé and support growing
            communities across the islands.
          </p>
          <Link
            href="/about"
            className="text-[var(--accent)] font-semibold hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
          >
            Learn more about us →
          </Link>
        </div>
      </section>

      {/* ── 5. Latest News ───────────────────────────────────────────────── */}
      <section className="py-16 px-4" aria-label="Latest news">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Latest News
            </h2>
            {latestPosts.length > 0 && (
              <Link
                href="/news"
                className="text-sm font-medium text-[var(--accent)] hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
              >
                View all →
              </Link>
            )}
          </div>

          {latestPosts.length > 0 ? (
            /* Live news from DB */
            <div className="flex gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
              {latestPosts.map(post => (
                <div key={post.post_id} className="shrink-0 w-[280px] lg:w-auto">
                  <NewsCard
                    slug={post.slug}
                    title={post.title}
                    summary={post.summary}
                    author={post.author}
                    publishedAt={post.published_at ?? post.created_at}
                    coverImageUrl={post.cover_image_url}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* Fallback placeholder cards */
            <div className="flex gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
              {PLACEHOLDER_NEWS.map((card) => (
                <article
                  key={card.id}
                  className="shrink-0 w-[280px] lg:w-auto flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden"
                >
                  {/* Placeholder thumbnail — disc-orange rectangle */}
                  <div
                    className="h-44 w-full bg-[var(--accent)] flex items-center justify-center opacity-90"
                    aria-hidden="true"
                  >
                    <div className="opacity-40">
                      <DiscIcon />
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex flex-col flex-1">
                    <time
                      className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2"
                    >
                      {card.date}
                    </time>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 leading-snug">
                      {card.headline}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      {card.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 6. Social Proof Strip ────────────────────────────────────────── */}
      <section
        className="py-10 px-4 bg-[var(--bg-surface)] border-t border-[var(--border)]"
        aria-label="Connect with us"
      >
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">

            {/* Instagram */}
            <a
              href="https://instagram.com/frisbee.mv"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram @frisbee.mv (opens in new tab)"
              className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
            >
              <InstagramIcon />
              <span className="text-sm font-medium">@frisbee.mv</span>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com/@frisbee.mv"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on TikTok @frisbee.mv (opens in new tab)"
              className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
            >
              <TikTokIcon />
              <span className="text-sm font-medium">@frisbee.mv</span>
            </a>

            {/* Vertical divider — visible only on wider screens */}
            <div
              className="hidden sm:block w-px h-8 bg-[var(--border)]"
              aria-hidden="true"
            />

            {/* WFDF */}
            <a
              href="https://wfdf.sport"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="World Flying Disc Federation (opens in new tab)"
              className="flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
            >
              <span className="text-xs font-bold px-2.5 py-1 border-2 border-current rounded-md shrink-0">
                WFDF
              </span>
              <span className="text-xs text-[var(--text-muted)]">Provisional Member</span>
            </a>

            {/* AOFDF */}
            <a
              href="https://aofdf.org"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Asia-Oceania Flying Disc Federation (opens in new tab)"
              className="flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
            >
              <span className="text-xs font-bold px-2.5 py-1 border-2 border-current rounded-md shrink-0">
                AOFDF
              </span>
              <span className="text-xs text-[var(--text-muted)]">Regional Member</span>
            </a>

          </div>
        </div>
      </section>
    </>
  );
}
