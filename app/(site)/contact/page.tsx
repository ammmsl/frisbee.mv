/* Hallmark · macrostructure: Letter · theme: federation · paper: tinted-pacific · accent: pacific-blue */

import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export function generateMetadata(): Metadata {
  return {
    title: 'Contact | frisbee.mv',
    description:
      'Get in touch with Ultimate Frisbee Association — general enquiries, sponsorship, membership, media, and events.',
  };
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--accent-dark)] underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] rounded"
    >
      {children}
    </a>
  );
}

/* ─── Page — one letter, narrow measure, form embedded inline ───────────────── */

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-prose px-4 sm:px-6 py-14 sm:py-20">
      <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-10">
        Contact Us
      </h1>

      {/* The letter */}
      <p className="text-lg text-[var(--text-primary)] leading-relaxed mb-4">
        Hello —
      </p>
      <p className="text-lg text-[var(--text-primary)] leading-relaxed mb-4">
        Whether you want to try a session, sponsor the sport, register as a member, cover us in
        the media, or bring Ultimate to your school or workplace, this is the right door. We read
        everything and reply as fast as a volunteer-run association can — usually within a few
        days.
      </p>
      <p className="text-lg text-[var(--text-primary)] leading-relaxed mb-10">
        If you prefer, write to us directly at{' '}
        <ExternalLink href="mailto:frisbee.mv@gmail.com">frisbee.mv@gmail.com</ExternalLink>, or
        send a DM on Instagram or TikTok at{' '}
        <ExternalLink href="https://instagram.com/frisbee.mv">@frisbee.mv</ExternalLink> — that
        is also the fastest way to get added to the session group.
      </p>

      {/* The form, embedded in the letter */}
      <ContactForm />

      {/* Sign-off — address right-aligned beneath */}
      <address className="not-italic text-right text-sm text-[var(--text-muted)] leading-relaxed mt-12">
        Ultimate Frisbee Association
        <br />
        Ma. Snow White 5
        <br />
        Malé, Republic of Maldives
      </address>
    </div>
  );
}
