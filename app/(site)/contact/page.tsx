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
      className="text-[var(--accent)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] rounded"
    >
      {children}
    </a>
  );
}

export default function ContactPage() {
  return (
    <>
      {/* Page hero */}
      <div className="bg-[var(--accent)] text-white py-14 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-orange-100 text-lg">
            Get in touch with the Ultimate Frisbee Association.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form — left, ~60% */}
          <div className="flex-[3]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
              Send us a message
            </h2>
            <ContactForm />
          </div>

          {/* Contact info — right, ~40% */}
          <div className="flex-[2]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
              Contact information
            </h2>

            <ul className="space-y-4">
              <li>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                  Email
                </p>
                <ExternalLink href="mailto:frisbee.mv@gmail.com">
                  frisbee.mv@gmail.com
                </ExternalLink>
              </li>

              <li>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                  Instagram
                </p>
                <ExternalLink href="https://instagram.com/frisbee.mv">
                  @frisbee.mv
                </ExternalLink>
              </li>

              <li>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                  TikTok
                </p>
                <ExternalLink href="https://tiktok.com/@frisbee.mv">
                  @frisbee.mv
                </ExternalLink>
              </li>

              <li>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                  Address
                </p>
                <address className="not-italic text-sm text-[var(--text-primary)] leading-relaxed">
                  Ma. Snow White 5<br />
                  Malé, Republic of Maldives
                </address>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
