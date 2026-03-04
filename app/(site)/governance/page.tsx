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
      'MFDF board of directors, committees, governance structure, WFDF membership status, and AGM documents.',
  };
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function GovernancePage() {
  return (
    <>
      {/* ── Page hero band ────────────────────────────────────────────────── */}
      <section
        className="bg-[var(--accent)] py-16 px-4"
        aria-label="Page header"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3">
            Governance
          </h1>
          <p className="text-lg text-white/85 font-medium">
            Transparency, accountability, and community leadership.
          </p>
        </div>
      </section>

      {/* ── Board of Directors ────────────────────────────────────────────── */}
      <section
        className="py-16 px-4"
        aria-labelledby="board-heading"
      >
        <div className="mx-auto max-w-5xl">
          <h2
            id="board-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-8"
          >
            Board of Directors
          </h2>
          {/*
           * CSS Grid with align-items: stretch so every card is the same height.
           * PersonCard uses flex-col internally; the bio grows to fill height.
           */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {board.map((member) => (
              <PersonCard
                key={member.id}
                name={member.name}
                title={member.title}
                term={member.term}
                bio={member.bio}
                photo={member.photo}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Committees ────────────────────────────────────────────────────── */}
      <section
        className="py-16 px-4 bg-[var(--bg-surface)] border-y border-[var(--border)]"
        aria-labelledby="committees-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="committees-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-8"
          >
            Committees
          </h2>
          <ul className="space-y-8 list-none m-0 p-0">
            {committees.map((committee) => (
              <li key={committee.id}>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                  {committee.name}
                </h3>
                <p className="text-[var(--text-muted)] leading-relaxed mb-2">
                  {committee.mandate}
                </p>
                {committee.chairperson ? (
                  <p className="text-sm text-[var(--text-muted)]">
                    <span className="font-medium text-[var(--text-primary)]">Chairperson:</span>{' '}
                    {committee.chairperson}
                  </p>
                ) : committee.status === 'accepting-applications' ? (
                  <p className="text-sm text-[var(--accent)]">
                    Chairperson applications open — contact{' '}
                    <a
                      href="mailto:hello@frisbee.mv"
                      className="underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
                    >
                      hello@frisbee.mv
                    </a>{' '}
                    to express interest.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How We're Governed ────────────────────────────────────────────── */}
      <section
        className="py-16 px-4"
        aria-labelledby="governed-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="governed-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6"
          >
            How We&rsquo;re Governed
          </h2>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-4">
            The MFDF is governed by an elected executive committee. Registered members vote by secret
            ballot at the Annual General Meeting (AGM). Committee members serve four-year terms.
          </p>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed">
            The federation operates under a formal constitution. A link to the constitution will be
            published here when the document is finalised.
          </p>
        </div>
      </section>

      {/* ── WFDF Membership ───────────────────────────────────────────────── */}
      <section
        className="py-16 px-4 bg-[var(--bg-surface)] border-y border-[var(--border)]"
        aria-labelledby="wfdf-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="wfdf-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6"
          >
            WFDF Membership
          </h2>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-6">
            The Maldives Flying Disc Federation applied for WFDF Provisional National Federation
            Membership in December 2024. Provisional membership recognises MFDF as the sole national
            governing body for flying disc sports in the Maldives and is the first step toward full
            WFDF membership.
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
      <section
        className="py-16 px-4"
        aria-labelledby="documents-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="documents-heading"
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3"
          >
            AGM Documents
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Documents are provided as PDF files.
          </p>

          <div className="w-full overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full min-w-max text-sm text-left">
              <thead className="bg-[var(--bg-surface)] border-b border-[var(--border)]">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap"
                  >
                    Document
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap"
                  >
                    Download
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, idx) => (
                  <tr
                    key={doc.id}
                    className={
                      idx % 2 === 1
                        ? 'bg-[var(--bg-surface)]'
                        : 'bg-[var(--bg-page)]'
                    }
                  >
                    <td className="px-4 py-3 text-[var(--text-primary)] border-t border-[var(--border)]">
                      {doc.name}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] border-t border-[var(--border)] whitespace-nowrap">
                      {new Date(doc.date + 'T00:00:00Z').toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        timeZone: 'UTC',
                      })}
                    </td>
                    <td className="px-4 py-3 border-t border-[var(--border)]">
                      <FileDownloadLink
                        href={`/documents/${doc.filename}`}
                        label={doc.name}
                        ariaLabel={`Download ${doc.name} (PDF)`}
                        sizeLabel={doc.sizeLabel}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
