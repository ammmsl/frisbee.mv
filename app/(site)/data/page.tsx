import type { Metadata } from 'next'
import Link from 'next/link'

/* Hallmark · macrostructure: Curated Index (typographic list) · theme: federation · paper: tinted-pacific · accent: pacific-blue */

export const metadata: Metadata = {
  title: 'Data & Research | frisbee.mv',
  description:
    'The UFA research archive — vetted, de-identified analysis of the club’s own records: community size, attendance, retention, money, venue, network and governance.',
}

// The archive is static HTML in public/data/<slug>.html (spec §4) — each report
// is self-contained and carries its own method notes and caveats. This index is
// the only curated layer on top. Grouping follows the publication spec's themes.
interface Report {
  slug: string
  title: string
}

const THEMES: { theme: string; reports: Report[] }[] = [
  {
    theme: 'Origin & lifecycle',
    reports: [
      { slug: 'tb-4', title: 'How far has UFA professionalised, 2018 to 2026?' },
      { slug: 'x-1', title: 'What do all the frameworks, taken together, say about UFA?' },
      { slug: 'oms-1', title: "Where is UFA on Greiner's growth curve, and what breaks next?" },
      { slug: 'b-tb2', title: 'How does UFA compare to other emerging sports at the same early size?' },
    ],
  },
  {
    theme: 'Size & structure',
    reports: [
      { slug: 'oms-5', title: 'Constitution says X — what does the data show?' },
      { slug: 'pb-c1', title: 'Where does UFA sit on the community-size ladder?' },
      { slug: 'pb-s1', title: 'How big is a pickup session, and when does the game fire?' },
      { slug: 'sm-5', title: 'Do women play and connect less — or does the model just look that way?' },
    ],
  },
  {
    theme: 'Showing up',
    reports: [
      { slug: 'pb-s2', title: 'Do people show up when they say they will?' },
      { slug: 'pb-x1', title: 'Every breakpoint of play, benchmarked against one real community' },
    ],
  },
  {
    theme: 'Newcomers & retention',
    reports: [
      { slug: 'pb-c2', title: "How does UFA's retention compare to parkrun, gyms and clubs?" },
      { slug: 'soc-4', title: 'Where do the 150 sit on the newcomer-socialization ladder?' },
      { slug: 'cb-a', title: 'What participation trajectories do the 150 actually follow?' },
      { slug: 'pb-g1', title: 'What do lapsed players become?' },
    ],
  },
  {
    theme: 'Money',
    reports: [
      { slug: 'oms-6', title: "Is UFA's membership fee coherent as patronage?" },
      { slug: 'oms-13', title: 'The fee cut as a rationing signal — read against the AGM books' },
      { slug: 'agm-finance', title: 'Org-wide finances vs the pickup slice — the whole picture' },
    ],
  },
  {
    theme: 'Venue',
    reports: [
      { slug: 'b4', title: 'How exposed is UFA to losing its single venue?' },
      { slug: 'soc-5', title: "Is Villingili a genuine 'third place'? An Oldenburg audit vs the mainland venues" },
      { slug: 'nq-4', title: 'Does the second (HDC futsal) venue bridge or split the club?' },
    ],
  },
  {
    theme: 'Network',
    reports: [
      { slug: 'nq-2', title: 'Does the @-mention network split into admin and play?' },
      { slug: 'nq-5', title: 'Is the played-not-on-roster crowd a real periphery — or off the map?' },
    ],
  },
  {
    theme: 'Governance',
    reports: [
      { slug: 'tb-1', title: 'Which design archetype is UFA — kitchen table or boardroom?' },
      { slug: 'oms-16', title: 'Where does UFA sit on the Kitchen-Table → Board-led continuum?' },
      { slug: 'b1', title: "Where does UFA's formal policy decouple from practice?" },
      { slug: 'tb-3', title: 'How does UFA score on a good-governance self-audit?' },
      { slug: 'b3', title: 'How does UFA respond to competing institutional demands?' },
      { slug: 'cb-b', title: "Is UFA's shared turf a well-governed commons?" },
      { slug: 'a-tb1', title: 'SPLISS-lite — which success pillars does UFA actually have?' },
      { slug: 'a-tb2', title: 'Does admin load per member rise as the club grows?' },
      { slug: 'oms-7', title: "Map UFA's institutional field — and the National-Association milestone ahead" },
      { slug: 'sm-6', title: 'How ready is UFA for full WFDF membership — where are the gaps?' },
    ],
  },
  {
    theme: 'Volunteer capacity',
    reports: [
      { slug: 'sm-2', title: 'Is volunteer admin far more concentrated than playing?' },
      { slug: 'oms-4', title: 'How succession-ready is each function?' },
    ],
  },
  {
    theme: 'Expansion',
    reports: [
      { slug: 'pb-e1', title: 'What would a second playing community require?' },
    ],
  },
  {
    theme: 'Growth research',
    reports: [
      { slug: 'growth-brief', title: 'How do we grow — adults and kids — and what will it cost?' },
    ],
  },
]

const REPORT_COUNT = THEMES.reduce((n, t) => n + t.reports.length, 0)

export default function DataPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20">
      {/* Document header — left-aligned, no accent band */}
      <header className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
          The archive · {REPORT_COUNT} reports
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] leading-tight mb-5">
          Data &amp; Research
        </h1>
        <div className="space-y-4 text-[var(--text-primary)] leading-relaxed">
          <p>
            Since January 2024 the club has kept a tracked record of its own life — who turned
            up, who came back, what a session costs, how the community holds together. This
            archive is the vetted analysis of that record: {REPORT_COUNT} reports, each a single
            question answered against the data, with its method and its limits stated on the page.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Every figure is a de-identified aggregate from the club&rsquo;s own records or the
            public literature — no individuals, no personal finances. Narrative write-ups of the
            headline findings appear in{' '}
            <Link
              href="/news"
              className="text-[var(--accent-dark)] underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
            >
              News under Research
            </Link>
            .
          </p>
        </div>
      </header>

      {/* Theme sections — typographic list, hairline rules, no cards */}
      {THEMES.map(({ theme, reports }) => (
        <section key={theme} className="border-t border-[var(--border)] py-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{theme}</h2>
          <ul>
            {reports.map(({ slug, title }) => (
              <li key={slug}>
                {/* Static file in public/data/ — plain anchor, not <Link> */}
                <a
                  href={`/data/${slug}.html`}
                  className="group flex items-baseline gap-3 min-h-[44px] py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
                >
                  <span className="shrink-0 font-mono text-xs text-[var(--text-muted)] w-24">
                    {slug}
                  </span>
                  <span className="text-[var(--text-primary)] group-hover:text-[var(--accent-dark)] transition-colors leading-snug">
                    {title}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <footer className="border-t border-[var(--border)] pt-8">
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          Reports are self-contained pages produced by the club&rsquo;s analysis project; they
          open in this tab and carry their own charts, method notes and caveats. Figures on money
          cover the pickup slice and AGM totals only. Questions?{' '}
          <Link
            href="/contact"
            className="text-[var(--accent-dark)] underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
          >
            Get in touch
          </Link>
          .
        </p>
      </footer>
    </div>
  )
}
