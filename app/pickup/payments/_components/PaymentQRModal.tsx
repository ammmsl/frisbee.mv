'use client';

import Image from 'next/image';
import { useState } from 'react';
import Modal from '@/app/_components/Modal';
import { PAYMENT_ACCOUNT, PAYMENT_ACCOUNT_NAME } from '../_lib/constants';

interface PaymentQRModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PaymentQRModal({ open, onClose }: PaymentQRModalProps) {
  const [copied, setCopied] = useState(false);

  async function copyAccount() {
    try {
      await navigator.clipboard.writeText(PAYMENT_ACCOUNT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Pay via BML Transfer">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-xl overflow-hidden border border-[var(--border)]">
          <Image
            src="/payment_qr.png"
            alt="BML payment QR code"
            width={220}
            height={220}
            className="block"
          />
        </div>

        <div className="w-full rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] p-4 text-center">
          <p className="text-xs text-[var(--text-muted)] mb-1">BML Account Number</p>
          <p className="font-mono text-lg font-bold text-[var(--text-primary)] tracking-wider">
            {PAYMENT_ACCOUNT}
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{PAYMENT_ACCOUNT_NAME}</p>
        </div>

        <button
          type="button"
          onClick={copyAccount}
          className="w-full min-h-[44px] rounded-lg border border-[var(--accent)] text-[var(--accent)] text-sm font-semibold hover:bg-[var(--accent)] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] cursor-pointer"
        >
          {copied ? '✓ Copied' : 'Copy Account Number'}
        </button>

        <p className="text-xs text-[var(--text-muted)] text-center">
          Use your name as the reference when transferring.
        </p>
      </div>
    </Modal>
  );
}
