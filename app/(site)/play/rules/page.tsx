import type { Metadata } from 'next';
import QuoteBlock from '@/app/_components/QuoteBlock';
import TableOfContents, { type TocSection } from './TableOfContents';

export function generateMetadata(): Metadata {
  return {
    title: 'Rules | frisbee.mv',
    description:
      'How to play Ultimate Frisbee — Spirit of the Game, basic rules, UFA session format, fouls, and a link to the full WFDF rulebook.',
  };
}

const TOC_SECTIONS: TocSection[] = [
  { id: 'spirit', label: 'Spirit of the Game' },
  { id: 'basics', label: 'The Basics' },
  { id: 'how-we-play', label: 'How We Play' },
  { id: 'fouls', label: 'Fouls & Violations' },
  { id: 'full-rules', label: 'Full Rulebook' },
];

export default function RulesPage() {
  return (
    <>
      {/*
       * Print stylesheet: hides the TOC column when printing.
       * The prose column expands to full width.
       * SiteNav and SiteFooter are outside this component and are hidden by
       * targeting their semantic elements (header/footer).
       */}
      <style>{`
        @media print {
          header, footer {
            display: none !important;
          }
          .rules-toc {
            display: none !important;
          }
          .rules-layout {
            display: block !important;
          }
          .rules-content {
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-4 py-12">
        {/*
         * Two-column layout at lg: breakpoint: TOC (240px) + prose.
         * Below lg: single column. The TOC aside is hidden with display:none
         * below lg: so it is not visible or interactable on mobile.
         */}
        <div
          className="rules-layout lg:grid lg:gap-12"
          style={{ gridTemplateColumns: '240px 1fr' }}
        >
          {/* ── Sticky TOC sidebar — desktop only ─────────────────────────── */}
          <aside
            className="rules-toc hidden lg:block print:hidden"
            aria-label="Page navigation"
          >
            <div className="sticky top-24">
              <TableOfContents sections={TOC_SECTIONS} />
            </div>
          </aside>

          {/* ── Prose content ─────────────────────────────────────────────── */}
          <article className="rules-content max-w-[720px]">

            {/* Spirit of the Game */}
            <section>
              <h2
                id="spirit"
                className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6 scroll-mt-24"
              >
                Spirit of the Game
              </h2>

              <QuoteBlock>
                Ultimate is self-refereed. Spirit is everything.
              </QuoteBlock>

              <p className="text-[var(--text-muted)] leading-loose mb-4 mt-4">
                The Spirit of the Game (SOTG) is the cornerstone of Ultimate Frisbee. It places the
                responsibility of fair play on every player. There are no referees. Competitive play
                is encouraged — but never at the expense of respect, safety, or sportsmanship.
                Disputes are resolved between players, calmly and honestly.
              </p>
              <p className="text-[var(--text-muted)] leading-loose mb-12">
                At UFA sessions and in our league, after each match each team nominates one player
                from the opposing team who best demonstrated Spirit of the Game. These nominations
                are tracked across the season.
              </p>
            </section>

            {/* The Basics */}
            <section>
              <h2
                id="basics"
                className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6 scroll-mt-24"
              >
                The Basics
              </h2>

              <p className="text-[var(--text-muted)] leading-loose mb-4">
                Ultimate is played between two teams on a rectangular field with end zones at each
                end. The object is to catch the disc in the opposing end zone.
              </p>

              <ul className="list-none m-0 p-0 space-y-3 mb-12">
                {[
                  'The disc may be passed in any direction',
                  'A player may not run while holding the disc',
                  'The thrower has 10 seconds to pass (the stall count)',
                  'If the disc hits the ground or is intercepted, possession changes',
                  'A point is scored when a player catches the disc in the end zone',
                ].map((rule) => (
                  <li key={rule} className="flex items-start gap-3 text-[var(--text-muted)]">
                    <span
                      aria-hidden="true"
                      className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0"
                    />
                    <span className="leading-loose">{rule}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* How We Play */}
            <section>
              <h2
                id="how-we-play"
                className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6 scroll-mt-24"
              >
                How We Play
              </h2>
              <p className="text-[var(--text-muted)] leading-loose mb-12">
                At UFA sessions we play mixed 5v5 at Villingili Football Ground in Malé. Teams must
                have at least two players of each gender on the field. Games are to 11 points or a
                30-minute cap, whichever comes first. The team leading at the cap wins.
              </p>
            </section>

            {/* Fouls & Violations */}
            <section>
              <h2
                id="fouls"
                className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6 scroll-mt-24"
              >
                Fouls &amp; Violations
              </h2>
              <p className="text-[var(--text-muted)] leading-loose mb-4">
                A foul occurs when there is contact between players that affects play. The fouled
                player calls the foul. If the player who caused the foul disagrees, the disc returns
                to the thrower and the stall count resets. If the call is accepted, play continues
                as if the pass was complete (or incomplete, depending on context).
              </p>
              <p className="text-[var(--text-muted)] leading-loose mb-12">
                A violation is a rules infraction not involving contact — such as travelling
                (running with the disc) or a stall count error. The opposing team calls violations.
                Contested calls follow the same process as fouls.
              </p>
            </section>

            {/* Full Rulebook */}
            <section>
              <h2
                id="full-rules"
                className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6 scroll-mt-24"
              >
                Full Rulebook
              </h2>
              <p className="text-[var(--text-muted)] leading-loose mb-6">
                The rules above are a practical summary for new players. The complete official rules
                are maintained by the World Flying Disc Federation.
              </p>
              <a
                href="https://rules.wfdf.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors min-h-[44px] px-5 py-2.5 text-base bg-transparent border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white active:bg-[#e55a27] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                Read the WFDF Official Rulebook
              </a>
            </section>

          </article>
        </div>
      </div>
    </>
  );
}
