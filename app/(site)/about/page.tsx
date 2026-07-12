/* Hallmark · macrostructure: Long Document · theme: federation · paper: tinted-pacific · accent: pacific-blue */

import type { Metadata } from 'next';
import Link from 'next/link';
import Timeline from './Timeline';

export function generateMetadata(): Metadata {
  return {
    title: 'About | frisbee.mv',
    description:
      'Learn about the Ultimate Frisbee Association — our history, mission, leadership, and the sport of Ultimate Frisbee.',
  };
}

/* ─── Where We Play city data ───────────────────────────────────────────────── */

const CITIES = [
  {
    name: 'Malé',
    description:
      'Primary home. Weekly sessions at Villingili Football Ground, Tuesday and Friday evenings.',
  },
  {
    name: 'Fuvahmulah',
    description:
      'Event & outreach activity — Eid Ufaa tournament, April 2025. Growing interest in the southern atolls.',
  },
  {
    name: 'Addu City',
    description:
      'Event & outreach activity — introductory session, November 2025.',
  },
] as const;

/* ─── Page — story-led single column, chapter rhythm ────────────────────────── */

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 py-14 sm:py-20">
      {/* Document opening — headline top-left, no accent band */}
      <header className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
          About UFA
        </h1>
        <p className="text-lg text-[var(--text-muted)]">
          The national governing body for Ultimate Frisbee in the Maldives
        </p>
      </header>

      {/* Mission — the opening paragraph, wide left margin at desktop */}
      <div className="lg:ml-36 max-w-2xl mb-16">
        <p className="text-lg text-[var(--text-primary)] leading-relaxed">
          Our mission is to make Ultimate Frisbee a mainstream sport across the Republic of
          Maldives, and to provide every player — from first-timer to seasoned competitor — with
          meaningful opportunities to develop their game and their community. We believe in open,
          mixed, self-refereed sport built on the Spirit of the Game.
        </p>
      </div>

      {/* ── Chapter: Our story — the timeline is the spine, full-bleed ────── */}
      <section
        aria-labelledby="story-heading"
        className="border-t border-[var(--border)] pt-10 mb-16"
      >
        <h2
          id="story-heading"
          className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-10"
        >
          Our Story
        </h2>
        <Timeline />
      </section>

      {/* ── Chapter: About the Sport ──────────────────────────────────────── */}
      <section
        aria-labelledby="sport-heading"
        className="border-t border-[var(--border)] pt-10 mb-16"
      >
        <h2
          id="sport-heading"
          className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6"
        >
          About the Sport
        </h2>
        <div className="lg:ml-36 max-w-2xl">
          <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-4">
            Ultimate Frisbee is a non-contact team sport played with a flying disc. Two teams compete
            to score by catching the disc in the opposing end zone. There are no referees — players
            call their own fouls, governed by the Spirit of the Game.
          </p>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-6">
            It is fast, mixed-gender by default, and open to all fitness levels. If you can catch
            and throw, you can play.
          </p>
          <Link
            href="/play/rules"
            className="text-[var(--accent)] font-semibold hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
          >
            Read the rules →
          </Link>
        </div>
      </section>

      {/* ── Chapter: Where We Play — inline definition list, not cards ────── */}
      <section
        aria-labelledby="where-heading"
        className="border-t border-[var(--border)] pt-10"
      >
        <h2
          id="where-heading"
          className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6"
        >
          Where We Play
        </h2>
        <dl className="lg:ml-36 max-w-2xl space-y-6">
          {CITIES.map((city) => (
            <div key={city.name}>
              <dt className="text-lg font-bold text-[var(--text-primary)]">{city.name}</dt>
              <dd className="text-[var(--text-muted)] leading-relaxed">{city.description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
