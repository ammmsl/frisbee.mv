import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pickup Hub | frisbee.mv",
  description: "Payment tracker and team drafter for MFDF pickup sessions.",
};

export default function PickupPage() {
  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Pickup Hub</h1>
      <p className="text-[var(--text-muted)]">Tools coming in M5.</p>
    </main>
  );
}
