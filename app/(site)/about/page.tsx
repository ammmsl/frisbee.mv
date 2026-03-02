import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about the Maldives Flying Disc Federation — our mission, history, and the growing Ultimate community across the Maldives.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">About</h1>
      <p className="text-[var(--text-muted)]">Page content coming in M4.</p>
    </div>
  );
}
