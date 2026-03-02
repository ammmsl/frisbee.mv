import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Maldives Flying Disc Federation.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Contact</h1>
      <p className="text-[var(--text-muted)]">Page content coming in M5.</p>
    </div>
  );
}
