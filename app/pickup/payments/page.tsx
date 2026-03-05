import type { Metadata } from 'next';
import { Suspense } from 'react';
import PaymentTracker from './PaymentTracker';
import Spinner from '@/app/_components/Spinner';

export function generateMetadata(): Metadata {
  return {
    title: 'Payment Tracker | frisbee.mv',
    description: 'Check your UFA pickup session payment status and history.',
  };
}

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Spinner size="md" />
        </div>
      }
    >
      <PaymentTracker />
    </Suspense>
  );
}
