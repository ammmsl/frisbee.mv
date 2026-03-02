import { ReactNode } from 'react';

export interface QuoteBlockProps {
  children: ReactNode;
  attribution?: string;
}

export default function QuoteBlock({ children, attribution }: QuoteBlockProps) {
  return (
    <blockquote className="relative pl-6 border-l-4 border-[var(--accent)] my-6">
      {/* Decorative quotation mark */}
      <span
        aria-hidden="true"
        className="absolute -top-3 left-4 text-5xl font-serif leading-none text-[var(--accent)] opacity-30 select-none"
      >
        &ldquo;
      </span>

      <div className="text-lg text-[var(--text-primary)] leading-relaxed">
        {children}
      </div>

      {attribution && (
        <cite className="block mt-3 text-sm text-[var(--text-muted)] not-italic font-medium">
          — {attribution}
        </cite>
      )}
    </blockquote>
  );
}
