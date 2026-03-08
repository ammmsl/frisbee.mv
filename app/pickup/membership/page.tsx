import type { Metadata } from 'next';
import MembershipCalculator from './MembershipCalculator';

export function generateMetadata(): Metadata {
  return {
    title: 'UFA Libeytha? | frisbee.mv',
    description:
      'Does UFA membership make financial sense for you? See how many sessions you need before membership pays off.',
  };
}

export default function MembershipPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <MembershipCalculator />
    </div>
  );
}
