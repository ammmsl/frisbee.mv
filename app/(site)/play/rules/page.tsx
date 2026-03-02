import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rules",
  description:
    "Ultimate rules and the Spirit of the Game. Self-refereed, fair, and fun — the foundation of flying disc sport.",
};

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Rules</h1>
      <p className="text-[var(--text-muted)]">Page content coming in M4.</p>
    </div>
  );
}
