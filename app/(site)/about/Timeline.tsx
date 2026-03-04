/**
 * Timeline — server component, no 'use client'.
 *
 * Add a new entry to MILESTONES to extend the timeline — no JSX edits needed.
 *
 * Mobile:  single column, vertical line on left, marker on line, content right.
 * Desktop (lg:): alternating zigzag — even entries left of centre, odd entries
 *          right of centre. Vertical line runs through the centre. The last
 *          entry (most recent) has a filled accent-colour marker; others outlined.
 */

interface Milestone {
  date: string;
  title: string;
  description: string | null;
}

const MILESTONES: Milestone[] = [
  {
    date: '2018',
    title: 'First games',
    description:
      'University of Nottingham Malaysia graduates introduce Ultimate to Malé.',
  },
  {
    date: 'January 2024',
    title: 'Weekly sessions formalised',
    description:
      'Tuesday and Friday evening sessions established at Villingili Football Ground.',
  },
  {
    date: 'August 2024',
    title: 'Association founded',
    description: 'The Ultimate Frisbee Association (UFA) is formally established.',
  },
  {
    date: '2 September 2024',
    title: 'Registered by Commissioner of Sports',
    description:
      'UFA receives official registration as a national sports association.',
  },
  {
    date: '12 December 2024',
    title: 'First AGM & executive committee election',
    description: 'Members elect the inaugural board via secret ballot.',
  },
  {
    date: 'December 2024',
    title: 'WFDF Provisional Membership Granted',
    description: null,
  },
  {
    date: 'January 2025',
    title: 'First tournament',
    description:
      "5v5 format, 49 players — the federation's inaugural competitive event.",
  },
    {
    date: 'October 2025',
    title: 'Largest tournament to date',
    description:
      '7v7 format, 72 players — the biggest flying disc event held in the Maldives.',
  },
];

function MilestoneContent({
  milestone,
  align,
}: {
  milestone: Milestone;
  align: 'left' | 'right';
}) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
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
  );
}

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
    <div className="relative">
      {/* ── Mobile layout ────────────────────────────────────────────────── */}
      {/* Shown below lg:; single-column with line on left */}
      <ol className="lg:hidden relative list-none m-0 p-0 pl-8">
        {/* Vertical line */}
        <div
          aria-hidden="true"
          className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-[var(--border)]"
        />

        {MILESTONES.map((milestone, index) => (
          <li key={index} className="relative flex items-start gap-4 pb-8 last:pb-0">
            {/* Marker positioned over the line */}
            <div
              aria-hidden="true"
              className="absolute -left-[1.125rem] top-1 flex items-center justify-center"
            >
              <Marker isLast={index === last} />
            </div>

            {/* Content */}
            <div>
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

      {/* ── Desktop layout (lg:) ─────────────────────────────────────────── */}
      {/* Zigzag: even entries on the left, odd on the right */}
      <ol className="hidden lg:block relative list-none m-0 p-0">
        {/* Centre vertical line */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-px top-2 bottom-2 w-0.5 bg-[var(--border)]"
        />

        {MILESTONES.map((milestone, index) => {
          const isEven = index % 2 === 0; /* even → left; odd → right */
          const isLast = index === last;

          return (
            <li
              key={index}
              className="relative grid pb-10 last:pb-0"
              style={{ gridTemplateColumns: '1fr 2rem 1fr' }}
            >
              {/* Left cell — content when even, empty when odd */}
              <div className={isEven ? 'pr-8 text-right' : ''}>
                {isEven && <MilestoneContent milestone={milestone} align="right" />}
              </div>

              {/* Centre cell — marker positioned over the line */}
              <div className="relative flex items-start justify-center">
                <div className="mt-0.5">
                  <Marker isLast={isLast} />
                </div>
              </div>

              {/* Right cell — content when odd, empty when even */}
              <div className={!isEven ? 'pl-8' : ''}>
                {!isEven && <MilestoneContent milestone={milestone} align="left" />}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
