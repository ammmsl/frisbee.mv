'use client';

import { useState, useRef } from 'react';
import Modal from '@/app/_components/Modal';
import Button from '@/app/_components/Button';
import { useToast } from '@/app/_components/Toast';
import { teamPalette, accent } from '@/lib/tokens';

// ─── Types ───────────────────────────────────────────────────────────────────

type Protocol = 'standard' | '3rr';

interface SwapSelection {
  teamIdx: number;
  playerIdx: number;
}

// ─── Team colour palette ──────────────────────────────────────────────────────
// Sourced from lib/tokens — edit colours there, not here.

const TEAM_COLORS = teamPalette;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scrubHiddenChars(str: string): string {
  if (!str) return '';
  return str.replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '').trim();
}

function buildSequence(captainCount: number, totalPicks: number, protocol: Protocol): number[] {
  const seq: number[] = [];
  let round = 0;
  while (seq.length < totalPicks) {
    const order = Array.from({ length: captainCount }, (_, i) => i);
    let shouldReverse = false;
    if (protocol === 'standard') {
      shouldReverse = round % 2 !== 0;
    } else {
      if (round === 0) shouldReverse = false;
      else if (round === 1 || round === 2) shouldReverse = true;
      else shouldReverse = round % 2 === 0;
    }
    if (shouldReverse) order.reverse();
    order.forEach((idx) => {
      if (seq.length < totalPicks) seq.push(idx);
    });
    round++;
  }
  return seq;
}

function buildTextOutput(captains: string[], teams: Record<number, string[]>): string {
  return captains
    .map((cap, i) => {
      let text = `*Team ${cap}:*\n1. ${cap} (C)\n`;
      teams[i].forEach((p, pIdx) => {
        text += `${pIdx + 2}. ${p}\n`;
      });
      return text;
    })
    .join('\n')
    .trim();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TeamDrafter() {
  const { show } = useToast();

  // Step
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [rawInput, setRawInput] = useState('');
  const [inputError, setInputError] = useState('');

  // Step 2
  const [allPlayers, setAllPlayers] = useState<string[]>([]);
  const [captains, setCaptains] = useState<string[]>([]);
  const [protocol, setProtocol] = useState<Protocol>('standard');
  const [isShuffling, setIsShuffling] = useState(false);

  // Step 3
  const [availablePlayers, setAvailablePlayers] = useState<string[]>([]);
  const [teams, setTeams] = useState<Record<number, string[]>>({});
  const [draftSequence, setDraftSequence] = useState<number[]>([]);
  const [seqIndex, setSeqIndex] = useState(0);
  const [swapSelection, setSwapSelection] = useState<SwapSelection | null>(null);
  const [isBalancerActive, setIsBalancerActive] = useState(false);

  // Confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const confirmActionRef = useRef<() => void>(() => {});

  const draftFinished = seqIndex >= draftSequence.length && draftSequence.length > 0;
  const textOutput = draftFinished ? buildTextOutput(captains, teams) : '';

  // ── Step 1 → 2 ────────────────────────────────────────────────────────────

  function processList() {
    const lines = rawInput.split('\n');
    const tempPlayers: string[] = [];
    lines.forEach((line) => {
      const lineClean = scrubHiddenChars(line);
      if (!lineClean) return;
      if (/^\d+[\.\)]/.test(lineClean)) {
        let name = lineClean.replace(/^\d+[\.\)\s]+/, '');
        name = name.replace(/\s*\([^)]*\)/g, '');
        name = name.replace(/50\/50/g, '');
        const finalName = scrubHiddenChars(name);
        if (finalName) tempPlayers.push(finalName);
      }
    });

    if (tempPlayers.length < 2) {
      setInputError('Need at least 2 players. Paste a numbered list (e.g. "1. Ahmed").');
      return;
    }
    setInputError('');
    const unique = [...new Set(tempPlayers)].sort((a, b) => a.localeCompare(b));
    setAllPlayers(unique);
    setCaptains([]);
    setProtocol('standard');
    setStep(2);
  }

  // ── Step 2 helpers ────────────────────────────────────────────────────────

  function toggleCaptain(name: string) {
    setCaptains((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  function shuffleCaptains() {
    setIsShuffling(true);
    setTimeout(() => {
      setCaptains((prev) => {
        const arr = [...prev];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      });
      setIsShuffling(false);
    }, 300);
  }

  // ── Step 2 → 3 ────────────────────────────────────────────────────────────

  function startDraft(captainList = captains) {
    if (captainList.length < 2) return;
    const pool = allPlayers
      .filter((p) => !captainList.includes(p))
      .sort((a, b) => a.localeCompare(b));
    const initTeams: Record<number, string[]> = {};
    captainList.forEach((_, i) => { initTeams[i] = []; });
    const seq = buildSequence(captainList.length, pool.length, protocol);
    setAvailablePlayers(pool);
    setTeams(initTeams);
    setDraftSequence(seq);
    setSeqIndex(0);
    setSwapSelection(null);
    setIsBalancerActive(false);
    setStep(3);
  }

  // ── Step 3 actions ────────────────────────────────────────────────────────

  function makePick(index: number) {
    if (seqIndex >= draftSequence.length) return;
    const captainIdx = draftSequence[seqIndex];
    const player = availablePlayers[index];
    setAvailablePlayers(availablePlayers.filter((_, i) => i !== index));
    setTeams((t) => ({ ...t, [captainIdx]: [...t[captainIdx], player] }));
    setSeqIndex((i) => i + 1);
  }

  function undoPick() {
    if (seqIndex === 0) return;
    const prevIdx = seqIndex - 1;
    const captainIdx = draftSequence[prevIdx];
    setTeams((t) => {
      const teamCopy = [...t[captainIdx]];
      const undonePlayer = teamCopy.pop()!;
      setAvailablePlayers((prev) =>
        [...prev, undonePlayer].sort((a, b) => a.localeCompare(b))
      );
      return { ...t, [captainIdx]: teamCopy };
    });
    setSeqIndex(prevIdx);
    setSwapSelection(null);
  }

  function handleRosterClick(teamIdx: number, playerIdx: number) {
    if (!draftFinished || !isBalancerActive) return;
    if (!swapSelection) {
      setSwapSelection({ teamIdx, playerIdx });
    } else {
      setTeams((t) => {
        const next = { ...t };
        next[swapSelection.teamIdx] = [...next[swapSelection.teamIdx]];
        next[teamIdx] = [...next[teamIdx]];
        const temp = next[swapSelection.teamIdx][swapSelection.playerIdx];
        next[swapSelection.teamIdx][swapSelection.playerIdx] = next[teamIdx][playerIdx];
        next[teamIdx][playerIdx] = temp;
        return next;
      });
      setSwapSelection(null);
    }
  }

  function toggleBalancer() {
    setIsBalancerActive((b) => !b);
    setSwapSelection(null);
  }

  // ── Confirm helper ────────────────────────────────────────────────────────

  function askConfirm(message: string, action: () => void) {
    setConfirmMessage(message);
    confirmActionRef.current = action;
    setConfirmOpen(true);
  }

  function doReset() {
    setStep(1);
    setRawInput('');
    setInputError('');
    setAllPlayers([]);
    setCaptains([]);
    setDraftSequence([]);
    setSeqIndex(0);
  }

  function resetToStep1() {
    if (seqIndex > 0 && !draftFinished) {
      askConfirm('Cancel draft and start over?', doReset);
    } else {
      doReset();
    }
  }

  function restartSameCaptains() {
    askConfirm(
      'Start the draft over with the same captains? Current teams will be cleared.',
      () => startDraft(captains)
    );
  }

  // ── Export ────────────────────────────────────────────────────────────────

  function buildExportContainer() {
    const container = document.getElementById('draft-export-container');
    if (!container) return;
    const teamsEl = container.querySelector('#draft-export-teams') as HTMLElement;
    const dateEl = container.querySelector('#draft-export-date') as HTMLElement;
    if (!teamsEl || !dateEl) return;

    dateEl.textContent = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    teamsEl.innerHTML = captains
      .map((cap, i) => {
        const color = TEAM_COLORS[i % TEAM_COLORS.length];
        const roster = [cap, ...teams[i]];
        const rows = roster
          .map(
            (name, idx) => `
            <div style="background:${idx === 0 ? color.hexLight : '#f8fafc'};border:1px solid ${idx === 0 ? color.hex : '#f1f5f9'};padding:8px 10px;border-radius:8px;font-weight:${idx === 0 ? '800' : '500'};color:${idx === 0 ? color.hex : '#1e293b'};display:flex;align-items:center;font-size:14px;">
              <span style="font-family:monospace;color:${color.hex};opacity:0.6;margin-right:8px;font-size:14px;font-weight:900;min-width:24px;">${idx + 1}.</span>
              ${name}
            </div>`
          )
          .join('');
        return `<div style="display:flex;flex-direction:column;gap:8px;">
          <div style="color:#64748b;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Team ${cap}</div>
          <div style="display:flex;flex-direction:column;gap:8px;">${rows}</div>
        </div>`;
      })
      .join('');
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(textOutput);
      show('Text copied to clipboard!', 'success');
    } catch {
      show('Copy failed — please copy manually.', 'error');
    }
  }

  async function copyImageToClipboard() {
    buildExportContainer();
    const container = document.getElementById('draft-export-container');
    if (!container) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', logging: false });
      canvas.toBlob(async (blob) => {
        if (!blob) { show('Error creating image.', 'error'); return; }
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          show('Image copied to clipboard!', 'success');
        } catch {
          triggerDownload(canvas);
          show('Clipboard blocked — image saved instead.', 'error');
        }
      }, 'image/png');
    } catch {
      show('Failed to generate image.', 'error');
    }
  }

  async function downloadImage() {
    buildExportContainer();
    const container = document.getElementById('draft-export-container');
    if (!container) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', logging: false });
      triggerDownload(canvas);
      show('PNG saved!', 'success');
    } catch {
      show('Failed to generate image.', 'error');
    }
  }

  function triggerDownload(canvas: HTMLCanvasElement) {
    const link = document.createElement('a');
    link.download = `UFA-Draft-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const currentCaptainIdx = !draftFinished && draftSequence.length > 0
    ? draftSequence[seqIndex]
    : null;
  const currentColor = currentCaptainIdx !== null
    ? TEAM_COLORS[currentCaptainIdx % TEAM_COLORS.length]
    : null;

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6 font-sans text-[var(--text-primary)]">

      {/* ── Header ── */}
      <header className="text-center">
        <h1 className="text-2xl font-bold text-[var(--accent)]">UFA Snake Draft</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          {step === 1 && 'Paste the list to begin'}
          {step === 2 && 'Select Captains'}
          {step === 3 && (draftFinished ? 'Draft Complete' : 'Drafting Teams')}
        </p>
      </header>

      {/* ══════════════ STEP 1 ══════════════ */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-[var(--bg-surface)] p-4 rounded-2xl shadow-sm border border-[var(--border)]">
            <h2 className="font-semibold text-[var(--text-muted)] mb-3 text-sm uppercase tracking-wider">
              1. Paste Original Message
            </h2>
            <textarea
              rows={12}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste WhatsApp message here..."
              className="w-full p-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none shadow-inner text-sm leading-relaxed bg-[var(--bg-page)] resize-y"
            />
            {inputError && (
              <p className="mt-2 text-xs text-rose-600">{inputError}</p>
            )}
          </div>
          <button
            onClick={processList}
            className="w-full py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            Identify Players
          </button>
        </div>
      )}

      {/* ══════════════ STEP 2 ══════════════ */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Captain pool */}
          <div className="bg-[var(--bg-surface)] p-4 rounded-2xl shadow-sm border border-[var(--border)]">
            <h2 className="font-semibold text-[var(--text-muted)] mb-1 text-sm uppercase tracking-wider">
              2. Select Captains
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-3">Tap captains (names are sorted A-Z)</p>
            <div className="flex flex-wrap gap-2">
              {allPlayers.map((name) => {
                const selected = captains.includes(name);
                return (
                  <button
                    key={name}
                    onClick={() => toggleCaptain(name)}
                    className={`border px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all min-h-[44px] ${
                      selected
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                        : 'bg-[var(--bg-page)] border-[var(--border)] text-[var(--text-primary)]'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Captain order + protocol */}
          {captains.length > 0 && (
            <div className="space-y-4">
              <div className="bg-[var(--bg-surface)] p-4 rounded-2xl shadow-sm border border-[var(--border)]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    Picker Order
                  </h3>
                  <button
                    onClick={shuffleCaptains}
                    className="flex items-center gap-1 text-[10px] bg-[#e0f2f7] px-3 py-1.5 rounded-lg font-bold text-[var(--accent)] active:scale-90 transition-all border border-[var(--accent-light)] shadow-sm"
                  >
                    🎲 Randomize Order
                  </button>
                </div>
                <div className={`flex flex-col gap-2 transition-all duration-300 ${isShuffling ? 'shuffling' : ''}`}>
                  {captains.map((c, i) => {
                    const color = TEAM_COLORS[i % TEAM_COLORS.length];
                    return (
                      <div
                        key={c}
                        className={`${color.light} ${color.text} p-3 rounded-xl text-sm font-bold flex justify-between items-center shadow-sm border ${color.border}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="bg-white/80 w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-inner">
                            {i + 1}
                          </span>
                          {c}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Protocol */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-[var(--border)]">
                <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  Draft Protocol
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['standard', '3rr'] as Protocol[]).map((proto) => (
                    <button
                      key={proto}
                      onClick={() => setProtocol(proto)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all ${
                        protocol === proto
                          ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                          : 'bg-[var(--bg-page)] text-slate-600 border-[var(--border)]'
                      }`}
                    >
                      {proto === 'standard' ? 'Standard Snake' : '3RR Snake'}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-3 leading-tight text-center px-2">
                  {protocol === 'standard'
                    ? 'Classic: Round 1 (1,2,3), Round 2 (3,2,1), Round 3 (1,2,3)...'
                    : 'Advanced: Rounds 1&2 are normal. Round 3 "flips" again (3,2,1) to balance #1 pick.'}
                </p>
              </div>
            </div>
          )}

          {captains.length >= 2 && (
            <button
              onClick={() => startDraft()}
              className="w-full py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              Start Draft
            </button>
          )}
          <button
            onClick={() => setStep(1)}
            className="w-full py-2 text-[var(--text-muted)] text-sm font-medium"
          >
            Back
          </button>
        </div>
      )}

      {/* ══════════════ STEP 3 ══════════════ */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-wrap justify-between items-center bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border)] shadow-sm gap-y-2">
            <button
              onClick={resetToStep1}
              className="text-[10px] text-[var(--text-muted)] font-bold px-2 py-1 uppercase tracking-tight"
            >
              Full Reset
            </button>
            {seqIndex > 0 && !draftFinished && (
              <button
                onClick={undoPick}
                className="text-[10px] text-rose-500 font-bold px-2 py-1 uppercase tracking-tight"
              >
                Undo Pick
              </button>
            )}
            {draftFinished && (
              <button
                onClick={toggleBalancer}
                className={`text-[10px] font-bold px-2 py-1 uppercase tracking-tight border rounded-lg ${
                  isBalancerActive
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'text-amber-600 border-amber-100'
                }`}
              >
                {isBalancerActive ? 'Disable Balancer' : 'Enable Balancer'}
              </button>
            )}
            <button
              onClick={restartSameCaptains}
              className="text-[10px] text-[var(--accent)] font-bold px-2 py-1 uppercase tracking-tight"
            >
              Redraft
            </button>
          </div>

          {/* Turn indicator */}
          {!draftFinished && currentColor && (
            <div
              className={`${currentColor.main} text-white p-4 rounded-2xl shadow-lg text-center animate-pulse transition-colors duration-300`}
            >
              <p className="text-xs uppercase font-bold tracking-widest opacity-80">Current Turn</p>
              <h2 className="text-xl font-bold">{captains[currentCaptainIdx!]}</h2>
            </div>
          )}

          {/* Balancer notice */}
          {isBalancerActive && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center">
              <p className="text-xs text-amber-700 font-medium">⚖️ <strong>Balancer Mode Active</strong></p>
              <p className="text-[10px] text-amber-600">Tap two players to swap them between teams.</p>
            </div>
          )}

          {/* Available pool */}
          {!draftFinished && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                Available Players ({availablePlayers.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {availablePlayers.map((name, index) => (
                  <button
                    key={name}
                    onClick={() => makePick(index)}
                    className="bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-3 rounded-xl text-sm font-bold shadow-sm active:scale-95 active:bg-slate-100 transition-all min-h-[44px]"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Team rosters */}
          <div className="grid grid-cols-2 gap-3">
            {captains.map((cap, i) => {
              const color = TEAM_COLORS[i % TEAM_COLORS.length];
              const isTurn = !draftFinished && currentCaptainIdx === i;
              const fullRoster = [cap, ...(teams[i] ?? [])];
              const isLastOdd = captains.length % 2 !== 0 && i === captains.length - 1;

              return (
                <div
                  key={cap}
                  className={`bg-[var(--bg-surface)] p-3 rounded-2xl border-2 shadow-sm transition-all ${
                    isTurn ? `${color.active} ring-2` : 'border-[var(--border)]'
                  } ${isLastOdd ? 'col-span-2' : ''}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-[var(--text-primary)] text-xs truncate mr-1">Team {cap}</h3>
                    <span className={`text-[9px] ${color.light} ${color.text} px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0`}>
                      {fullRoster.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {fullRoster.map((name, pIdx) => {
                      const isCaptain = pIdx === 0;
                      const isSelected =
                        !isCaptain &&
                        swapSelection?.teamIdx === i &&
                        swapSelection?.playerIdx === pIdx - 1;

                      return (
                        <div
                          key={`${name}-${pIdx}`}
                          onClick={() => {
                            if (isBalancerActive && !isCaptain) handleRosterClick(i, pIdx - 1);
                          }}
                          className={[
                            'text-[11px] py-1 px-1.5 border rounded-md transition-colors overflow-hidden text-ellipsis whitespace-nowrap',
                            isBalancerActive && !isCaptain ? 'cursor-pointer hover:bg-slate-100 active:bg-slate-200' : 'cursor-default',
                            isSelected
                              ? 'swap-selected'
                              : isCaptain
                              ? `${color.light} ${color.border} ${color.text} font-bold`
                              : 'bg-slate-50/50 border-slate-100',
                          ].join(' ')}
                        >
                          <span className={`font-mono text-[9px] mr-0.5 ${isSelected || isCaptain ? color.num : 'text-slate-400'}`}>
                            {pIdx + 1}.
                          </span>
                          {name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Export section */}
          {draftFinished && (
            <div className="space-y-3 pt-6 border-t border-[var(--border)]">
              <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest text-center">
                Export Options
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={copyToClipboard}
                  className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy Text
                </button>
                <button
                  onClick={copyImageToClipboard}
                  className="py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                    <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                  </svg>
                  Copy Image
                </button>
                <button
                  onClick={downloadImage}
                  className="py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Save PNG
                </button>
              </div>

              <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border)] text-xs whitespace-pre-wrap font-mono shadow-sm opacity-60 max-h-32 overflow-y-auto mt-4">
                {textOutput}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Confirm modal ── */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Are you sure?"
        closeOnBackdrop={false}
      >
        <p className="text-sm text-[var(--text-muted)] mb-6">{confirmMessage}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => {
              confirmActionRef.current();
              setConfirmOpen(false);
            }}
          >
            Confirm
          </Button>
        </div>
      </Modal>

      {/* ── Hidden export container (captured by html2canvas) ── */}
      <div id="draft-export-container">
        <div className="text-center mb-10">
          <h1 style={{ fontSize: 36, fontWeight: 900, color: accent.base, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.03em' }}>
            Lineup Draft
          </h1>
          <div id="draft-export-date" style={{ color: '#94a3b8', fontWeight: 700, fontSize: 14, letterSpacing: '0.1em', marginTop: 4 }} />
        </div>
        <div id="draft-export-teams" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }} />
        <div style={{ marginTop: 48, textAlign: 'center', color: '#cbd5e1', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
          Generated with UFA Snake Draft
        </div>
      </div>
    </div>
  );
}
