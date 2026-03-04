export interface AccordionItem {
  question: string;
  answer: string;
}

export interface AccordionProps {
  items: AccordionItem[];
}

export default function Accordion({ items }: AccordionProps) {
  return (
    <div className="divide-y divide-[var(--border)]">
      {items.map((item, index) => (
        <details key={index} className="group">
          <summary
            className="flex items-center justify-between gap-4 cursor-pointer min-h-[44px] py-3 px-1 text-base font-medium text-[var(--text-primary)] list-none select-none hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            <span>{item.question}</span>
            {/* Chevron — rotates 180° when <details> is open */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="chevron shrink-0 transition-transform duration-200 group-open:rotate-180"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </summary>

          {/*
            CSS grid animation: grid-template-rows goes from 0fr → 1fr on open.
            The inner div must have overflow:hidden and min-height:0 for this to work.
          */}
          <div
            className="grid transition-[grid-template-rows] duration-200 ease-out"
            style={{ gridTemplateRows: '0fr' }}
          >
            <div className="overflow-hidden">
              <p className="pb-4 pt-1 px-1 text-[var(--text-muted)] leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        </details>
      ))}

      {/*
        Pure CSS: when <details> is open, expand the grid wrapper.
        This approach works without JavaScript because CSS can select
        "details[open] > div" to change grid-template-rows.
      */}
      <style>{`
        details[open] > div {
          grid-template-rows: 1fr;
        }
      `}</style>
    </div>
  );
}
