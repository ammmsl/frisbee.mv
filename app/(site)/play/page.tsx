/* Hallmark · macrostructure: Workbench · theme: federation · paper: tinted-pacific · accent: pacific-blue */

import type { Metadata } from 'next';
import Link from 'next/link';
import Accordion from '@/app/_components/Accordion';
import type { AccordionItem } from '@/app/_components/Accordion';
import { getNextSession } from '@/lib/session';

export function generateMetadata(): Metadata {
  return {
    title: 'Play | frisbee.mv',
    description:
      'Join an Ultimate Frisbee session in Malé. Weekly sessions every Tuesday and Friday at Villingili Football Ground — free to try, all welcome.',
  };
}

/* ─── FAQ data ──────────────────────────────────────────────────────────────── */

const FAQ_ITEMS: AccordionItem[] = [
  {
    question: 'Do I need to know the rules before I come?',
    answer:
      'Not at all. Ultimate is easy to pick up on the field. Someone will walk you through the basics before your first game. The only rule you really need to know: no running with the disc.',
  },
  {
    question: 'Is it mixed gender?',
    answer:
      'Yes. All our sessions are mixed gender and we want it that way. Our league plays with a minimum of two players of each gender on the field at all times. Everyone is welcome regardless of experience level.',
  },
  {
    question: 'What fitness level do I need?',
    answer:
      'Whatever you have right now. People of all fitness levels play. You will get fitter over time — that tends to happen naturally. Show up as you are.',
  },
  {
    question: 'How do I join the community?',
    answer:
      "Send us a DM on Instagram @frisbee.mv and we'll get you added to the group. The group is where session updates, cancellations, and community news are shared.",
  },
  {
    question: 'What happens if it rains?',
    answer:
      "We usually play through light rain — it's actually fun. Heavy rain or lightning means we cancel. Cancellations are announced in the group, so message us on Instagram @frisbee.mv to get added before your first session.",
  },
];

/* ─── Page — utility-first: next session on top, tools below ────────────────── */

export default function PlayPage() {
  const session = getNextSession();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20">
      {/* ── Next session — the tool you came for, top-left, no band ───────── */}
      <header className="mb-14">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-8">
          Come play with us.
        </h1>

        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
          Next Session
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">
          {session.dayName}, {session.fullDate}
        </p>
        <p className="text-lg text-[var(--text-muted)] mb-6">
          8:00 PM MVT · Villingili Football Ground, Malé
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://instagram.com/frisbee.mv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors min-h-[44px] px-7 py-3 text-base bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:bg-[var(--accent-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Message us on Instagram
          </a>
          <a
            href="https://maps.app.goo.gl/QNpZ2nUpYoQwBTaH6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors min-h-[44px] px-5 py-2.5 text-base bg-transparent text-[var(--accent)] hover:bg-sky-50 active:bg-sky-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Get directions →
          </a>
        </div>
      </header>

      {/* ── Session Schedule ──────────────────────────────────────────────── */}
      {/*
       * Pure server component — renders without JavaScript.
       * Using a plain HTML table (not the Table component which is 'use client').
       */}
      <section
        className="py-10 border-t border-[var(--border)]"
        aria-labelledby="schedule-heading"
      >
        <h2
          id="schedule-heading"
          className="text-2xl font-bold text-[var(--text-primary)] mb-6"
        >
          Session Schedule
        </h2>

        <div className="w-full overflow-x-auto rounded-lg border border-[var(--border)] mb-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--bg-surface)] border-b border-[var(--border)]">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap"
                >
                  Day
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap"
                >
                  Time
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap"
                >
                  Location
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-[var(--bg-page)]">
                <td className="px-4 py-3 text-[var(--text-primary)] border-t border-[var(--border)] font-medium">
                  Tuesday
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)] border-t border-[var(--border)]">
                  8:00 PM MVT
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)] border-t border-[var(--border)]">
                  Villingili Football Ground, Malé
                </td>
              </tr>
              <tr className="bg-[var(--bg-surface)]">
                <td className="px-4 py-3 text-[var(--text-primary)] border-t border-[var(--border)] font-medium">
                  Friday
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)] border-t border-[var(--border)]">
                  8:00 PM MVT
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)] border-t border-[var(--border)]">
                  Villingili Football Ground, Malé
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          Weekly sessions have run since January 2024 — at Villingili Football Ground
          from February 2024. Fuvahmulah and Addu City have hosted event and outreach
          activity — contact us to get involved.
        </p>
      </section>

      {/* ── What to Bring ─────────────────────────────────────────────────── */}
      <section
        className="py-10 border-t border-[var(--border)]"
        aria-labelledby="bring-heading"
      >
        <h2
          id="bring-heading"
          className="text-2xl font-bold text-[var(--text-primary)] mb-4"
        >
          What to Bring
        </h2>
        <ul className="space-y-2 list-none m-0 p-0">
          {[
            'Comfortable sports clothes',
            'Water (it\'s hot)',
            'Sports shoes or cleats (optional but recommended)',
            'Just yourself — everything else is provided',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-[var(--text-muted)]">
              <span
                aria-hidden="true"
                className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0"
              />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* ── It's Free to Try ──────────────────────────────────────────────── */}
      <section
        className="py-10 border-t border-[var(--border)]"
        aria-labelledby="free-heading"
      >
        <h2
          id="free-heading"
          className="text-2xl font-bold text-[var(--text-primary)] mb-4"
        >
          It&rsquo;s Free to Try
        </h2>
        <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-4">
          Your first session is completely free. Just show up at Villingili Football Ground at
          8:00 PM on any Tuesday or Friday. No booking, no registration, no experience needed.
        </p>
        <p className="text-lg text-[var(--text-muted)] leading-relaxed">
          After your first session, there&rsquo;s a small weekly session fee to cover costs. You
          can check your payment status any time at the{' '}
          <Link
            href="/pickup/payments"
            className="text-[var(--accent)] font-medium hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
          >
            Payment Tracker
          </Link>
          .
        </p>
      </section>

      {/* ── Beginner FAQ ──────────────────────────────────────────────────── */}
      {/*
       * Uses the Accordion component from M2 — built on <details>/<summary>.
       * Works with JavaScript disabled because it uses native HTML.
       */}
      <section
        className="py-10 border-t border-[var(--border)]"
        aria-labelledby="faq-heading"
      >
        <h2
          id="faq-heading"
          className="text-2xl font-bold text-[var(--text-primary)] mb-6"
        >
          Beginner FAQ
        </h2>
        <Accordion items={FAQ_ITEMS} />
      </section>

      {/* ── Become a Member ───────────────────────────────────────────────── */}
      <section
        className="py-10 border-t border-[var(--border)]"
        aria-labelledby="member-heading"
      >
        <h2
          id="member-heading"
          className="text-2xl font-bold text-[var(--text-primary)] mb-4"
        >
          Become a Member
        </h2>
        <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-4">
          Attending sessions and being a Association member are two different things. Anyone can
          come to a session. Association membership is for players who want to formally represent
          UFA, vote at the AGM, and be eligible for national team selection when that becomes
          relevant.
        </p>
        <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8">
          Membership is open to all. Annual fee: MVR 350 in your first year, MVR 250 to renew.
          Register using the form below — it takes two minutes.
        </p>
        <a
          href="https://forms.gle/a3KcMV5zJnfWLxB57"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors min-h-[44px] px-5 py-2.5 text-base bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:bg-[var(--accent-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          Register as a Member
        </a>
      </section>

      {/* ── Typographic close — the rules ─────────────────────────────────── */}
      <footer className="pt-10 border-t border-[var(--border)]">
        <p className="text-lg text-[var(--text-muted)] leading-relaxed">
          When you&rsquo;re ready to go deeper,{' '}
          <Link
            href="/play/rules"
            className="text-[var(--accent-dark)] font-semibold underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
          >
            read the rules of Ultimate
          </Link>
          {' '}— self-refereed, Spirit of the Game first.
        </p>
      </footer>
    </div>
  );
}
