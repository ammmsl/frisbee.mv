import type { Metadata } from 'next';
import Link from 'next/link';
import Timeline from './Timeline';

export function generateMetadata(): Metadata {
  return {
    title: 'About | frisbee.mv',
    description:
      'Learn about the Maldives Flying Disc Federation — our history, mission, leadership, and the sport of Ultimate Frisbee.',
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
      'Regular community sessions. Growing player base in the southern atolls.',
  },
  {
    name: 'Addu City',
    description:
      'Active community. Occasional sessions and inter-island events.',
  },
] as const;

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <>
      {/* ── Page hero band ────────────────────────────────────────────────── */}
      <section
        className="bg-[var(--accent)] py-16 px-4"
        aria-label="Page header"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3">
            About MFDF
          </h1>
          <p className="text-lg text-white/85 font-medium">
            The national governing body for Ultimate Frisbee in the Maldives
          </p>
        </div>
      </section>

      {/* ── Our Mission ───────────────────────────────────────────────────── */}
      <section
        className="py-16 px-4"
        aria-labelledby="mission-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="mission-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6"
          >
            Our Mission
          </h2>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed">
            Our mission is to make Ultimate Frisbee a mainstream sport across the Republic of
            Maldives, and to provide every player — from first-timer to seasoned competitor — with
            meaningful opportunities to develop their game and their community. We believe in open,
            mixed, self-refereed sport built on the Spirit of the Game.
          </p>
        </div>
      </section>

      {/* ── Timeline ──────────────────────────────────────────────────────── */}
      <section
        className="py-16 px-4 bg-[var(--bg-surface)] border-y border-[var(--border)]"
        aria-labelledby="timeline-heading"
      >
        <div className="mx-auto max-w-5xl">
          <h2
            id="timeline-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-10 text-center"
          >
            Our Story
          </h2>
          <Timeline />
        </div>
      </section>

      {/* ── About the Sport ───────────────────────────────────────────────── */}
      <section
        className="py-16 px-4"
        aria-labelledby="sport-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="sport-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6"
          >
            About the Sport
          </h2>
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

      {/* ── Where We Play ─────────────────────────────────────────────────── */}
      <section
        className="py-16 px-4 bg-[var(--bg-surface)] border-t border-[var(--border)]"
        aria-labelledby="where-heading"
      >
        <div className="mx-auto max-w-5xl">
          <h2
            id="where-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-8 text-center"
          >
            Where We Play
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CITIES.map((city) => (
              <div
                key={city.name}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-page)] p-6"
              >
                <h3 className="font-bold text-[var(--text-primary)] text-lg mb-2">
                  {city.name}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {city.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
