import Button from '@/app/_components/Button';
import { fmtMoney } from '../_lib/utils';
import type { Debtor } from '../_lib/types';

interface Props {
  debtors: Debtor[];
  onSelectPlayer: (name: string) => void;
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function AdminDebtorsList({ debtors, onSelectPlayer }: Props) {
  if (debtors.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] text-center py-8">No pending payments.</p>
    );
  }

  async function copyMessage(debtor: Debtor) {
    const link = `${window.location.origin}${window.location.pathname}?user=${encodeURIComponent(debtor.name)}`;
    const msg = `Hey ${debtor.name}, you have unpaid Frisbee field booking fees of ${debtor.pending.toFixed(2)} MVR pending.\nYou can view the session cost details at: ${link}\n\nPlease pay to the following account: 7730000682000 (MOHD. AMSAL)`;
    try {
      await navigator.clipboard.writeText(msg);
    } catch {
      // clipboard not available
    }
  }

  return (
    <div className="space-y-2">
      {debtors.map((debtor, idx) => (
        <div
          key={debtor.name}
          className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3"
        >
          <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center shrink-0">
            {idx + 1}
          </span>
          <button
            type="button"
            onClick={() => onSelectPlayer(debtor.name)}
            className="flex-1 text-left text-sm font-medium text-[var(--accent)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] rounded cursor-pointer"
          >
            {debtor.name}
          </button>
          <span className="text-sm font-semibold text-red-600 whitespace-nowrap">
            {fmtMoney(debtor.pending)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyMessage(debtor)}
            icon={<CopyIcon />}
            aria-label={`Copy payment reminder for ${debtor.name}`}
          >
            Copy
          </Button>
        </div>
      ))}
    </div>
  );
}
