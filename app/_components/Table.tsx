'use client';

import { useState } from 'react';

export interface TableProps {
  headers: string[];
  rows: string[][];
  sortable?: boolean;
  zebraStriped?: boolean;
}

export default function Table({
  headers,
  rows,
  sortable = false,
  zebraStriped = true,
}: TableProps) {
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  function handleSort(colIndex: number) {
    if (!sortable) return;
    if (sortCol === colIndex) {
      setSortAsc((prev) => !prev);
    } else {
      setSortCol(colIndex);
      setSortAsc(true);
    }
  }

  const displayRows =
    sortable && sortCol !== null
      ? [...rows].sort((a, b) => {
          const av = a[sortCol] ?? '';
          const bv = b[sortCol] ?? '';
          return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
        })
      : rows;

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full min-w-max text-sm text-left">
        <thead className="bg-[var(--bg-surface)] border-b border-[var(--border)]">
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                scope="col"
                className={`px-4 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap ${
                  sortable
                    ? 'cursor-pointer select-none hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)]'
                    : ''
                }`}
                onClick={sortable ? () => handleSort(i) : undefined}
                onKeyDown={
                  sortable
                    ? (e) => (e.key === 'Enter' || e.key === ' ') && handleSort(i)
                    : undefined
                }
                tabIndex={sortable ? 0 : undefined}
                aria-sort={
                  sortable && sortCol === i
                    ? sortAsc
                      ? 'ascending'
                      : 'descending'
                    : sortable
                    ? 'none'
                    : undefined
                }
              >
                <span className="inline-flex items-center gap-1">
                  {header}
                  {sortable && (
                    <SortIcon active={sortCol === i} asc={sortAsc} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={
                zebraStriped && rowIdx % 2 === 1
                  ? 'bg-[var(--bg-surface)]'
                  : 'bg-[var(--bg-page)]'
              }
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="px-4 py-3 text-[var(--text-primary)] border-t border-[var(--border)]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortIcon({ active, asc }: { active: boolean; asc: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={active ? 'text-[var(--accent)]' : 'text-gray-400'}
    >
      {active && asc ? (
        <path d="M8 14l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ) : active && !asc ? (
        <path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <path d="M8 10l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
          <path d="M8 14l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
        </>
      )}
    </svg>
  );
}
