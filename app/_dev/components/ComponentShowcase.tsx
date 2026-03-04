'use client';

import { useState } from 'react';

import Spinner from '@/app/_components/Spinner';
import Button from '@/app/_components/Button';
import Badge, { BadgeVariant } from '@/app/_components/Badge';
import Skeleton from '@/app/_components/Skeleton';
import { useToast } from '@/app/_components/Toast';
import Accordion from '@/app/_components/Accordion';
import Table from '@/app/_components/Table';
import FileDownloadLink from '@/app/_components/FileDownloadLink';
import Avatar from '@/app/_components/Avatar';
import PersonCard from '@/app/_components/PersonCard';
import QuoteBlock from '@/app/_components/QuoteBlock';
import StatTile from '@/app/_components/StatTile';
import SearchInput from '@/app/_components/SearchInput';
import SegmentedControl from '@/app/_components/SegmentedControl';
import Modal from '@/app/_components/Modal';

const BADGE_VARIANTS: BadgeVariant[] = [
  'wfdf', 'upcoming', 'past', 'cancelled', 'paid', 'unpaid', 'partial',
];

const ACCORDION_ITEMS = [
  { question: 'Do I need to know the rules to join?', answer: 'Not at all! We welcome complete beginners. Just show up and we will teach you on the field.' },
  { question: 'Is it mixed gender?', answer: 'Yes! All our sessions are mixed gender and open to everyone aged 16+.' },
  { question: 'What fitness level do I need?', answer: 'Any level is fine. We play at a casual pace and you set your own tempo.' },
  { question: 'How do I join the WhatsApp group?', answer: 'Attend a session and ask any player, or reach out on Instagram @frisbee.mv.' },
  { question: 'What happens if it rains?', answer: 'We play in light rain. Heavy rain or lightning = session called off. Announcements go out on WhatsApp.' },
];

const TABLE_HEADERS = ['Document', 'Date', 'Type'];
const TABLE_ROWS = [
  ['AGM Minutes', 'December 12, 2024', 'PDF'],
  ['Constitution', 'March 2024', 'PDF'],
  ['Financial Report', 'December 2024', 'PDF'],
  ['Election Results', 'December 12, 2024', 'PDF'],
];

export default function ComponentShowcase() {
  const toast = useToast();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('2');
  const [modalOpen, setModalOpen] = useState(false);
  const [destructiveModalOpen, setDestructiveModalOpen] = useState(false);

  function handleLoadingDemo() {
    setLoadingBtn(true);
    setTimeout(() => setLoadingBtn(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] p-6 md:p-10 space-y-16">
      <header>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1">Component Showcase</h1>
        <p className="text-[var(--text-muted)] text-sm">Dev-only · delete before Phase 1 ships</p>
      </header>

      {/* ── 1. Spinner ─────────────────────────────────────────────────── */}
      <Section title="1. Spinner">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-2">sm (default)</p>
            <Spinner size="sm" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-2">md</p>
            <Spinner size="md" />
          </div>
          <div className="bg-[var(--accent)] p-3 rounded-lg">
            <p className="text-xs text-white mb-2">on accent bg</p>
            <Spinner size="sm" className="text-white" />
          </div>
        </div>
      </Section>

      {/* ── 2. Button ──────────────────────────────────────────────────── */}
      <Section title="2. Button">
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="primary" onClick={() => {}}>Primary</Button>
          <Button variant="secondary" onClick={() => {}}>Secondary</Button>
          <Button variant="ghost" onClick={() => {}}>Ghost</Button>
          <Button variant="destructive" onClick={() => {}}>Destructive</Button>
        </div>
        <div className="flex flex-wrap gap-3 items-center mt-3">
          <Button variant="primary" size="sm" onClick={() => {}}>Small</Button>
          <Button variant="primary" size="md" onClick={() => {}}>Medium</Button>
          <Button variant="primary" size="lg" onClick={() => {}}>Large</Button>
        </div>
        <div className="flex flex-wrap gap-3 items-center mt-3">
          <Button
            variant="primary"
            loading={loadingBtn}
            onClick={handleLoadingDemo}
          >
            Click to load (2s)
          </Button>
          <Button variant="secondary" disabled onClick={() => {}}>Disabled</Button>
          <Button
            variant="primary"
            icon={<span>🥏</span>}
            onClick={() => {}}
          >
            With Icon
          </Button>
        </div>
      </Section>

      {/* ── 3. Badge ───────────────────────────────────────────────────── */}
      <Section title="3. Badge">
        <div className="flex flex-wrap gap-3 items-center">
          {BADGE_VARIANTS.map((v) => (
            <Badge key={v} variant={v}>{v}</Badge>
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-3">
          All variants contrast-verified: wfdf (#FF6B35 + dark text 7.4:1), paid/upcoming (green-700 + white 5.0:1),
          unpaid/cancelled (red-600 + white 7.4:1), partial (amber-700 + white 7.0:1), past (gray-100 + gray-700 9.4:1)
        </p>
      </Section>

      {/* ── 4. Skeleton ────────────────────────────────────────────────── */}
      <Section title="4. Skeleton">
        <div className="space-y-3 max-w-sm">
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <div className="flex gap-3 mt-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          </div>
        </div>
      </Section>

      {/* ── 5. Toast ───────────────────────────────────────────────────── */}
      <Section title="5. Toast">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => toast.show('Operation completed successfully!', 'success')}>
            Success Toast
          </Button>
          <Button variant="destructive" onClick={() => toast.show('Something went wrong. Please try again.', 'error')}>
            Error Toast
          </Button>
          <Button variant="secondary" onClick={() => toast.show('Your data has been saved.', 'info')}>
            Info Toast
          </Button>
          <Button variant="ghost" onClick={() => {
            toast.show('First message', 'success');
            setTimeout(() => toast.show('Second message', 'info'), 300);
            setTimeout(() => toast.show('Third message', 'error'), 600);
          }}>
            Stack 3 Toasts
          </Button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-3">Auto-dismiss: 4s · role=&quot;status&quot; aria-live=&quot;polite&quot;</p>
      </Section>

      {/* ── 6. Accordion ───────────────────────────────────────────────── */}
      <Section title="6. Accordion">
        <div className="max-w-xl">
          <Accordion items={ACCORDION_ITEMS} />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-3">
          Built on native &lt;details&gt;/&lt;summary&gt; — works without JavaScript.
          CSS grid-template-rows animation.
        </p>
      </Section>

      {/* ── 7. Table ───────────────────────────────────────────────────── */}
      <Section title="7. Table">
        <div className="max-w-xl space-y-6">
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-2">Zebra striped (default)</p>
            <Table headers={TABLE_HEADERS} rows={TABLE_ROWS} />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-2">Sortable — click headers</p>
            <Table headers={TABLE_HEADERS} rows={TABLE_ROWS} sortable zebraStriped />
          </div>
        </div>
      </Section>

      {/* ── 8. FileDownloadLink ────────────────────────────────────────── */}
      <Section title="8. FileDownloadLink">
        <div className="max-w-sm space-y-2">
          <FileDownloadLink
            href="/documents/agm-minutes-dec-2024.pdf"
            label="AGM Minutes, December 2024"
            ariaLabel="Download AGM Minutes, December 2024 (PDF)"
            sizeLabel="284 KB"
          />
          <FileDownloadLink
            href="/documents/constitution.pdf"
            label="UFA Constitution"
            ariaLabel="Download UFA Constitution (PDF)"
          />
        </div>
      </Section>

      {/* ── 9. Avatar ──────────────────────────────────────────────────── */}
      <Section title="9. Avatar">
        <div className="flex flex-wrap items-end gap-6">
          <div className="text-center space-y-2">
            <Avatar src={null} name="Aishath Uraiba Asif" size="sm" />
            <p className="text-xs text-[var(--text-muted)]">sm + initials</p>
          </div>
          <div className="text-center space-y-2">
            <Avatar src={null} name="Ahmed Naaif Mohamed" size="md" />
            <p className="text-xs text-[var(--text-muted)]">md + initials</p>
          </div>
          <div className="text-center space-y-2">
            <Avatar src={null} name="Mohamed Amsal" size="lg" />
            <p className="text-xs text-[var(--text-muted)]">lg + initials</p>
          </div>
          <div className="text-center space-y-2">
            <Avatar src="/favicon.ico" name="Test User" size="md" />
            <p className="text-xs text-[var(--text-muted)]">md + photo</p>
          </div>
          <div className="text-center space-y-2">
            <Avatar src="/broken-url.jpg" name="Error User" size="md" />
            <p className="text-xs text-[var(--text-muted)]">broken src → initials</p>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-3">Deterministic colour — same name always same colour</p>
      </Section>

      {/* ── 10. PersonCard ─────────────────────────────────────────────── */}
      <Section title="10. PersonCard">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl">
          <PersonCard
            name="Aishath Uraiba Asif"
            title="President"
            term="2024–2028"
            bio="Founder of the weekly sessions and primary architect of the federation. Led the registration drive and WFDF membership application."
          />
          <PersonCard
            name="Ahmed Naaif Mohamed"
            title="Vice President"
            term="2024–2028"
            bio="Operations lead. Coordinates tournament logistics and player development programmes."
          />
          <PersonCard
            name="Mohamed Amsal"
            title="Treasurer"
            term="2024–2028"
            bio="Manages federation finances, session fee collection, and annual financial reporting to the Commissioner of Sports."
          />
          <PersonCard
            name="Mariyam Solaaha"
            title="Secretary General"
            term="2024–2028"
            bio="Governance and documentation lead."
          />
        </div>
      </Section>

      {/* ── 11. QuoteBlock ─────────────────────────────────────────────── */}
      <Section title="11. QuoteBlock">
        <div className="max-w-xl space-y-6">
          <QuoteBlock>
            Ultimate is self-refereed. Spirit is everything.
          </QuoteBlock>
          <QuoteBlock attribution="AOFDF Letter of Recommendation, 2024">
            The Maldives Flying Disc Federation has demonstrated the organisational
            capacity and community commitment expected of a WFDF member federation.
            We fully support their provisional membership application.
          </QuoteBlock>
        </div>
      </Section>

      {/* ── 12. StatTile ───────────────────────────────────────────────── */}
      <Section title="12. StatTile">
        <div className="flex flex-wrap gap-4">
          <StatTile value={167} label="Unique Players" />
          <StatTile value={113} label="Consecutive Weeks Active" suffix="+" />
          <StatTile value={3481} label="Total Attendances" suffix="+" />
          <StatTile
            value={5}
            label="Active Committees"
            icon={<span role="img" aria-label="committees">🏛️</span>}
          />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-3">
          Scroll to trigger IntersectionObserver animation (may already be in view).
          Counter animates 0→target over ~1.5s ease-out.
        </p>
      </Section>

      {/* ── 13. SearchInput ────────────────────────────────────────────── */}
      <Section title="13. SearchInput">
        <div className="max-w-sm space-y-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name..."
          />
          {search && (
            <p className="text-xs text-[var(--text-muted)]">
              Filtering for: <strong>{search}</strong>
            </p>
          )}
        </div>
      </Section>

      {/* ── 14. SegmentedControl ───────────────────────────────────────── */}
      <Section title="14. SegmentedControl">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-2">Team count selector</p>
            <SegmentedControl
              options={[
                { value: '2', label: '2 Teams' },
                { value: '3', label: '3 Teams' },
                { value: '4', label: '4 Teams' },
              ]}
              value={segment}
              onChange={setSegment}
            />
            <p className="text-xs text-[var(--text-muted)] mt-2">Selected: {segment} teams</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-2">2-option variant</p>
            <SegmentedControl
              options={[
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'past', label: 'Past' },
              ]}
              value="upcoming"
              onChange={() => {}}
            />
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-3">Arrow keys navigate, roving tabindex</p>
      </Section>

      {/* ── 15. Modal ──────────────────────────────────────────────────── */}
      <Section title="15. Modal">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Open Standard Modal
          </Button>
          <Button variant="destructive" onClick={() => setDestructiveModalOpen(true)}>
            Open Destructive Confirm
          </Button>
        </div>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Example Modal"
        >
          <p className="text-[var(--text-muted)] text-sm mb-6">
            This modal has a focus trap — press Tab repeatedly and focus will stay
            within this dialog. Press Escape or click the backdrop to close.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>Confirm</Button>
          </div>
        </Modal>

        <Modal
          open={destructiveModalOpen}
          onClose={() => setDestructiveModalOpen(false)}
          title="Clear all teams?"
          closeOnBackdrop={false}
        >
          <p className="text-[var(--text-muted)] text-sm mb-6">
            This action cannot be undone. All team assignments will be removed.
            <br /><br />
            <strong className="text-[var(--text-primary)]">closeOnBackdrop=false</strong> — backdrop click does nothing.
            Use the buttons.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDestructiveModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              setDestructiveModalOpen(false);
              toast.show('Teams cleared.', 'info');
            }}>
              Clear teams
            </Button>
          </div>
        </Modal>

        <p className="text-xs text-[var(--text-muted)] mt-3">
          role=&quot;dialog&quot; · aria-modal · focus trap · Escape closes · portal to document.body
        </p>
      </Section>

      <footer className="border-t border-[var(--border)] pt-6 text-xs text-[var(--text-muted)]">
        Dev showcase · frisbee.mv M2 · Delete before Phase 1 ships
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border)]">
        {title}
      </h2>
      {children}
    </section>
  );
}
