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
    question: 'How do I join the WhatsApp group?',
    answer:
      "Message us on WhatsApp at +960 966 8800 or tap 'Join the WhatsApp group' at the top of this page. The group is where session updates, cancellations, and community news are shared.",
  },
  {
    question: 'What happens if it rains?',
    answer:
      "We usually play through light rain — it's actually fun. Heavy rain or lightning means we cancel. Cancellations are announced in the WhatsApp group, so make sure you're in it before your first session.",
  },
];

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function PlayPage() {
  const session = getNextSession();

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="bg-[var(--accent)] py-16 px-4"
        aria-label="Join a session"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Come play with us.
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Next session:{' '}
            <span className="font-semibold">
              {session.dayName}, {session.fullDate}
            </span>{' '}
            at 5:30 PM — Villingili Football Ground
          </p>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors min-h-[44px] px-7 py-3 text-base bg-white text-[#2f6e7a] hover:bg-white/92 active:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Join the WhatsApp group
          </a>
        </div>
      </section>

      {/* ── Session Schedule ──────────────────────────────────────────────── */}
      {/*
       * Pure server component — renders without JavaScript.
       * Using a plain HTML table (not the Table component which is 'use client').
       */}
      <section
        className="py-16 px-4"
        aria-labelledby="schedule-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="schedule-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6"
          >
            Session Schedule
          </h2>

          <div className="w-full overflow-x-auto rounded-lg border border-[var(--border)] mb-4">
            <table className="w-full min-w-max text-sm text-left">
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
            Sessions have run every week for 113+ consecutive weeks. Fuvahmulah and Addu City
            sessions run informally — contact us for current schedules.
          </p>
        </div>
      </section>

      {/* ── Where to Go ───────────────────────────────────────────────────── */}
      <section
        className="py-16 px-4 bg-[var(--bg-surface)] border-y border-[var(--border)]"
        aria-labelledby="location-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="location-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6"
          >
            Where to Go
          </h2>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-page)] p-6 mb-8">
            <p className="font-bold text-[var(--text-primary)] text-lg mb-1">
              Villingili Football Ground
            </p>
            <p className="text-[var(--text-muted)] mb-3">Malé, Maldives</p>
            <a
              href="https://maps.app.goo.gl/QNpZ2nUpYoQwBTaH6"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] font-medium hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded text-sm"
            >
              Get directions →
            </a>
          </div>

          <h3 className="font-bold text-[var(--text-primary)] mb-4">What to bring</h3>
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
        </div>
      </section>

      {/* ── It's Free to Try ──────────────────────────────────────────────── */}
      <section
        className="py-16 px-4"
        aria-labelledby="free-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="free-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6"
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
        </div>
      </section>

      {/* ── Beginner FAQ ──────────────────────────────────────────────────── */}
      {/*
       * Uses the Accordion component from M2 — built on <details>/<summary>.
       * Works with JavaScript disabled because it uses native HTML.
       */}
      <section
        className="py-16 px-4 bg-[var(--bg-surface)] border-y border-[var(--border)]"
        aria-labelledby="faq-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="faq-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-8"
          >
            Beginner FAQ
          </h2>
          <Accordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* ── Become a Member ───────────────────────────────────────────────── */}
      <section
        className="py-16 px-4"
        aria-labelledby="member-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="member-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6"
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
            Membership is open to all. Annual fee: MVR 200. Register using the form below — it takes
            two minutes.
          </p>
          <a
            href="https://forms.gle/placeholder"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors min-h-[44px] px-5 py-2.5 text-base bg-[var(--accent)] text-white hover:bg-[#e55a27] active:bg-[#cc4f22] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Register as a Member
          </a>
        </div>
      </section>
    </>
  );
}
