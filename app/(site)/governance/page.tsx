/* Hallmark · macrostructure: Stat-Led · theme: federation · paper: tinted-pacific · accent: pacific-blue */

import type { Metadata } from 'next';
import PersonCard from '@/app/_components/PersonCard';
import QuoteBlock from '@/app/_components/QuoteBlock';
import FileDownloadLink from '@/app/_components/FileDownloadLink';
import boardData from '@/config/board.json';
import committeesData from '@/config/committees.json';
import documentsData from '@/config/documents.json';

/* ─── Config type definitions ───────────────────────────────────────────────── */

interface BoardMember {
  id: string;
  name: string;
  title: string;
  term: string;
  bio: string;
  photo: string | null;
  email: string | null;
}

interface Committee {
  id: string;
  name: string;
  mandate: string;
  chairperson: string | null;
  status: string;
}

interface GovernanceDocument {
  id: string;
  name: string;
  date: string;
  filename: string;
  type: string;
  sizeLabel: string;
}

const board = boardData as BoardMember[];
const committees = committeesData as Committee[];
const documents = (documentsData as GovernanceDocument[]).sort(
  (a, b) => b.date.localeCompare(a.date), // descending by date string (ISO format)
);

/* ─── Metadata ──────────────────────────────────────────────────────────────── */

export function generateMetadata(): Metadata {
  return {
    title: 'Governance | frisbee.mv',
    description:
      'UFA board of directors, committees, governance structure, WFDF membership status, and AGM documents.',
  };
}

/* ─── The five anchor stats ─────────────────────────────────────────────────── */

const ANCHORS = [
  { value: String(board.length), label: 'Board members', href: '#board' },
  { value: String(committees.length), label: 'Committees', href: '#committees' },
  { value: String(documents.length), label: 'AGM documents', href: '#documents' },
  { value: '2018', label: 'Founded', href: '#governed' },
  { value: '2025', label: 'WFDF provisional member since', href: '#wfdf' },
] as const;

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function GovernancePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20">
      {/* ── Opening — headline + five anchored numerals ───────────────────── */}
      <header className="mb-14">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
          Governance
        </h1>
        <p className="text-lg text-[var(--text-muted)] mb-10">
          Transparency, accountability, and community leadership.
        </p>

        <nav aria-label="Governance at a glance">
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-8 list-none m-0 p-0 border-t border-[var(--border)] pt-8">
            {ANCHORS.map((stat) => (
              <li key={stat.href} className="pr-6">
                <a
                  href={stat.href}
                  className="group inline-flex flex-col gap-1 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
                >
                  <span className="text-4xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-dark)] transition-colors">
                    {stat.value}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-muted)]">
                    {stat.label} ↓
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ── Board of Directors — vary-sized spans, President leads ───────── */}
      <section id="board" className="py-12 border-t border-[var(--border)]" aria-labelledby="board-heading">
        <h2
          id="board-heading"
          className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-8"
        >
          Board of Directors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {board.map((member) => (
            <PersonCard
              key={member.id}
              name={member.name}
              title={member.title}
              term={member.term}
              bio={member.bio}
              photo={member.photo}
              className={member.id === 'president' ? 'sm:col-span-2' : ''}
            />
          ))}
        </div>
      </section>

      {/* ── Committees ────────────────────────────────────────────────────── */}
      {/* Names only — the config mandates are placeholder text (spec §6 C8,
          owner-owed); render them once real content lands. */}
      <section id="committees" className="py-12 border-t border-[var(--border)]" aria-labelledby="committees-heading">
        <h2
          id="committees-heading"
          className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6"
        >
          Committees
        </h2>
        <ul className="max-w-2xl list-none m-0 p-0 divide-y divide-[var(--border)]">
          {committees.map((committee) => (
            <li key={committee.id} className="flex items-baseline justify-between gap-4 py-3.5">
              <span className="font-semibold text-[var(--text-primary)]">{committee.name}</span>
              {committee.status === 'accepting-applications' && (
                <span className="text-sm text-[var(--text-muted)] shrink-0">
                  Accepting applications
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ── How We're Governed ────────────────────────────────────────────── */}
      <section id="governed" className="py-12 border-t border-[var(--border)]" aria-labelledby="governed-heading">
        <h2
          id="governed-heading"
          className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6"
        >
          How We&rsquo;re Governed
        </h2>
        <div className="max-w-3xl">
          <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-4">
            Founded in 2018, the UFA is governed by an elected executive committee. Registered
            members vote by secret ballot at the Annual General Meeting (AGM). Committee members
            serve five-year terms.
          </p>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed">
            The federation operates under a formal constitution.
          </p>
        </div>
      </section>

      {/* ── WFDF Membership ───────────────────────────────────────────────── */}
      <section id="wfdf" className="py-12 border-t border-[var(--border)]" aria-labelledby="wfdf-heading">
        <h2
          id="wfdf-heading"
          className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6"
        >
          WFDF Membership
        </h2>
        <div className="max-w-3xl">
          <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-6">
            The Ultimate Frisbee Association applied for WFDF Provisional National Federation
            Membership in late 2024, and provisional membership was granted in February 2025.
            Provisional membership recognises UFA as the sole national governing body for flying
            disc sports in the Maldives and is the first step toward full WFDF membership.
          </p>
          <QuoteBlock>
            The Asia Oceania Flying Disc Federation has confirmed its support for the Maldives
            Flying Disc Federation&rsquo;s application for WFDF membership, recognising the
            federation&rsquo;s active player community and formal governance structure.
          </QuoteBlock>
          <div className="mt-6 flex gap-6 flex-wrap">
            <a
              href="https://wfdf.sport"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] font-semibold hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
            >
              WFDF →
            </a>
            <a
              href="https://aofdf.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] font-semibold hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
            >
              AOFDF →
            </a>
          </div>
        </div>
      </section>

      {/* ── AGM Documents ─────────────────────────────────────────────────── */}
      <section id="documents" className="py-12 border-t border-[var(--border)]" aria-labelledby="documents-heading">
        <h2
          id="documents-heading"
          className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3"
        >
          AGM Documents
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Documents are provided as PDF files.
        </p>

        {/* Stacked list, not a table — reflows cleanly on mobile (a 3-col table
            with a download column overflows at 360px). Row stacks on small
            screens, name/date left + download right from sm up. */}
        <ul className="max-w-3xl list-none m-0 p-0 rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--text-primary)]">{doc.name}</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {new Date(doc.date + 'T00:00:00Z').toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'UTC',
                  })}
                </p>
              </div>
              <FileDownloadLink
                href={`/documents/${doc.filename}`}
                label="Download"
                ariaLabel={`Download ${doc.name} (PDF)`}
                sizeLabel={doc.sizeLabel}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
