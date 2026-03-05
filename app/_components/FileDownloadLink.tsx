export interface FileDownloadLinkProps {
  href: string;
  label: string;
  ariaLabel: string;
  sizeLabel?: string;
}

function PdfIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-red-600"
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="7"
        y="18"
        fontSize="5.5"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="sans-serif"
      >
        PDF
      </text>
    </svg>
  );
}

function DownloadArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-[var(--accent)]"
    >
      <path
        d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FileDownloadLink({
  href,
  label,
  ariaLabel,
  sizeLabel,
}: FileDownloadLinkProps) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)] hover:bg-sky-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] min-h-[44px] group"
    >
      <PdfIcon />
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] truncate">
          {label}
        </span>
        {sizeLabel && (
          <span className="block text-xs text-[var(--text-muted)]">{sizeLabel}</span>
        )}
      </span>
      <DownloadArrowIcon />
    </a>
  );
}
