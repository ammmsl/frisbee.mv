import type { Metadata } from 'next';
import PaymentTracker from './PaymentTracker';

export function generateMetadata(): Metadata {
  return {
    title: 'Payment Tracker | frisbee.mv',
  };
}

export default function PaymentsPage() {
  return <PaymentTracker />;
}
