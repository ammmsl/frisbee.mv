import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play",
  description:
    "Join a weekly Ultimate session in Malé. Free to try, no experience needed. Sessions every Tuesday and Friday evening.",
};

export default function PlayPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Play</h1>
      <p className="text-[var(--text-muted)]">Page content coming in M4.</p>
    </div>
  );
}
