import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Governance",
  description:
    "MFDF board, committees, AGM documents, and WFDF membership information.",
};

export default function GovernancePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Governance</h1>
      <p className="text-[var(--text-muted)]">Page content coming in M4.</p>
    </div>
  );
}
