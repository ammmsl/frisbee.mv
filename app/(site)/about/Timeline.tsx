/**
 * Timeline — server component, no 'use client'.
 *
 * Add a new entry to MILESTONES to extend the timeline — no JSX edits needed.
 *
 * Single column at every breakpoint (Hallmark 3b Long Document — the timeline
 * is the document's spine): vertical line on the left, marker on the line,
 * content to the right. The last entry (most recent) has a filled
 * accent-colour marker; others are outlined.
 */

interface Milestone {
  date: string;
  title: string;
  description: string | null;
}

const MILESTONES: Milestone[] = [
  {
    date: '28 September 2018',
    title: 'Founded — first games',
    description:
      'University of Nottingham Malaysia graduates introduce Ultimate to Malé.',
  },
  {
    date: 'January 2024',
    title: 'Weekly sessions formalised',
    description:
      'Twice-weekly sessions begin in Hulhumalé; the move to Villingili Football Ground follows on 2 February 2024.',
  },
  {
    date: '3 September 2024',
    title: 'Registered with the Commissioner of Sports',
    description:
      'UFA receives official registration as a sports association.',
  },
  {
    date: '12 December 2024',
    title: 'First AGM & executive committee election',
    description: 'Members elect the inaugural board via secret ballot.',
  },
  {
    date: '24 January 2025',
    title: 'First tournament',
    description:
      "5v5 format, 42 players across 7 teams — the federation's inaugural competitive event.",
  },
  {
    date: 'February 2025',
    title: 'WFDF Provisional Membership granted',
    description: 'Applied in late 2024; provisional membership granted February 2025.',
  },
  {
    date: '17–18 October 2025',
    title: 'Largest tournament to date',
    description:
      '6v6 format, 64 players across 8 teams — the biggest flying disc event held in the Maldives.',
  },
];

function Marker({ isLast }: { isLast: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={[
        'w-4 h-4 rounded-full border-2 shrink-0',
        isLast
          ? 'bg-[var(--accent)] border-[var(--accent)]'
          : 'bg-[var(--bg-page)] border-[var(--accent)]',
      ].join(' ')}
    />
  );
}

export default function Timeline() {
  const last = MILESTONES.length - 1;

  return (
    <ol className="relative list-none m-0 p-0 pl-8">
      {/* Vertical line */}
      <div
        aria-hidden="true"
        className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-[var(--border)]"
      />

      {MILESTONES.map((milestone, index) => (
        <li key={index} className="relative flex items-start gap-4 pb-10 last:pb-0">
          {/* Marker positioned over the line */}
          <div
            aria-hidden="true"
            className="absolute -left-[1.125rem] top-1 flex items-center justify-center"
          >
            <Marker isLast={index === last} />
          </div>

          {/* Content */}
          <div className="max-w-2xl">
            <time className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-0.5">
              {milestone.date}
            </time>
            <p className="font-bold text-[var(--text-primary)] leading-snug">
              {milestone.title}
            </p>
            {milestone.description && (
              <p className="mt-1 text-sm text-[var(--text-muted)] leading-relaxed">
                {milestone.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
