import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News",
  description:
    "Latest news and announcements from the Maldives Flying Disc Federation.",
};

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">News</h1>
      <p className="text-[var(--text-muted)]">Page content coming in M8.</p>
    </div>
  );
}
