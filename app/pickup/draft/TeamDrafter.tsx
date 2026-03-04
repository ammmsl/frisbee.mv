'use client';

import { useState } from 'react';
import Button from '@/app/_components/Button';
import SegmentedControl from '@/app/_components/SegmentedControl';
import Modal from '@/app/_components/Modal';
import { useToast } from '@/app/_components/Toast';

const TEAM_COUNT_OPTIONS = [
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
];

interface Team {
  players: string[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distributeTeams(players: string[], teamCount: number): Team[] {
  const shuffled = shuffle(players);
  const teams: Team[] = Array.from({ length: teamCount }, () => ({ players: [] }));
  shuffled.forEach((player, i) => {
    teams[i % teamCount].players.push(player);
  });
  return teams;
}

function teamsToClipboardText(teams: Team[]): string {
  return teams
    .map(
      (team, i) =>
        `Team ${i + 1} (${team.players.length} player${team.players.length !== 1 ? 's' : ''})\n` +
        team.players.map((p) => `- ${p}`).join('\n')
    )
    .join('\n\n');
}

export default function TeamDrafter() {
  const { show } = useToast();

  const [input,      setInput]      = useState('');
  const [teamCount,  setTeamCount]  = useState('2');
  const [teams,      setTeams]      = useState<Team[]>([]);
  const [drafting,   setDrafting]   = useState(false);
  const [clearOpen,  setClearOpen]  = useState(false);

  const playerNames = input
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const playerCount = playerNames.length;

  async function handleDraft() {
    if (playerCount === 0) return;
    setDrafting(true);
    await new Promise((r) => setTimeout(r, 400));
    setTeams(distributeTeams(playerNames, parseInt(teamCount, 10)));
    setDrafting(false);
  }

  async function handleCopy() {
    const text = teamsToClipboardText(teams);
    try {
      await navigator.clipboard.writeText(text);
      show('Copied to clipboard!', 'success');
    } catch {
      show('Copy failed — please copy manually.', 'error');
    }
  }

  function handleClear() {
    setInput('');
    setTeams([]);
    setClearOpen(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
        Team Drafter
      </h1>

      {/* Player input */}
      <div className="mb-5">
        <label
          htmlFor="player-input"
          className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
        >
          Players
        </label>
        <textarea
          id="player-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste player names here, one per line…"
          rows={6}
          className="w-full min-h-[120px] px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm resize-y focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--accent)] focus-visible:border-[var(--accent)] transition-colors"
        />
        <p className="mt-1.5 text-xs text-[var(--text-muted)]">
          {playerCount} {playerCount === 1 ? 'player' : 'players'}
        </p>
      </div>

      {/* Team count */}
      <div className="mb-6">
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
          Number of teams
        </p>
        <SegmentedControl
          options={TEAM_COUNT_OPTIONS}
          value={teamCount}
          onChange={setTeamCount}
        />
      </div>

      {/* Draft button */}
      <Button
        variant="primary"
        className="w-full"
        onClick={handleDraft}
        loading={drafting}
        disabled={playerCount === 0}
      >
        Draft Teams
      </Button>

      {/* Results */}
      {teams.length > 0 && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {teams.map((team, i) => (
              <div
                key={i}
                className="border border-[var(--border)] rounded-xl bg-[var(--bg-surface)] p-4"
              >
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="font-bold text-[var(--text-primary)]">
                    Team {i + 1}
                  </h2>
                  <span className="text-xs text-[var(--text-muted)]">
                    {team.players.length} {team.players.length === 1 ? 'player' : 'players'}
                  </span>
                </div>
                <ul className="space-y-1">
                  {team.players.map((player) => (
                    <li key={player} className="text-sm text-[var(--text-primary)]">
                      {player}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Actions row */}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleCopy}>
              Copy All Teams
            </Button>
            <Button variant="ghost" onClick={() => setClearOpen(true)}>
              Clear
            </Button>
          </div>
        </>
      )}

      {/* Clear confirmation modal */}
      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Clear all teams?"
        closeOnBackdrop={false}
      >
        <p className="text-sm text-[var(--text-muted)] mb-6">
          This will reset the player list and results.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setClearOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </Modal>
    </div>
  );
}
