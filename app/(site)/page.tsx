import type { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "frisbee.mv — Maldives Flying Disc Federation",
  description:
    "Join the flying disc community in the Maldives. Weekly pickup sessions in Malé every Tuesday and Friday. Open to everyone — no experience needed.",
};

export default function HomePage() {
  return (
    <>
      {/* Placeholder hero — replaced in M3.
          The section covers the full viewport (-mt-16 pulls it behind the fixed nav).
          hero-sentinel sits at the bottom edge; SiteNav observes it to toggle transparency. */}
      <section className="relative flex items-center justify-center min-h-screen -mt-16 bg-gray-900 text-white px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4">frisbee.mv</h1>
          <p className="text-xl text-white/80 mb-8">
            Maldives Flying Disc Federation — home of Ultimate in the Maldives
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/play"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition-opacity min-h-[44px]"
            >
              Join a Session
            </a>
            <a
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-white/60 text-white font-semibold hover:border-white transition-colors min-h-[44px]"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Sentinel: SiteNav scroll handler looks for this element */}
        <div id="hero-sentinel" aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-px" />
      </section>

      {/* Placeholder content sections — built in M3 */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-[var(--text-muted)] text-sm">
            Home page content will be built in M3.
          </p>
        </div>
      </section>
    </>
  );
}
