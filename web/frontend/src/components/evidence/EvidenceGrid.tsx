'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Search } from 'lucide-react';
import type { EvidenceCell, EvidenceTable } from '@/lib/evidence/types.ts';
import { formatCell } from '@/lib/evidence/types.ts';

const PAGE_SIZE = 12;

type SortDirection = 'asc' | 'desc';

interface SortState {
  readonly key: string;
  readonly direction: SortDirection;
}

/**
 * CSV escaping. A cell beginning with `=`, `+`, `-` or `@` is prefixed with a
 * quote so spreadsheet software treats it as text — otherwise an exported
 * evidence row becomes a formula in the recipient's Excel.
 */
const toCsvField = (value: EvidenceCell): string => {
  const text = String(value);
  const guarded = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${guarded.replace(/"/g, '""')}"`;
};

const compare = (a: EvidenceCell, b: EvidenceCell): number => {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'en', { numeric: true });
};

export function EvidenceGrid({
  table,
  exportName,
  canExport,
}: {
  table: EvidenceTable;
  exportName: string;
  canExport: boolean;
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) return table.rows;
    return table.rows.filter((row) =>
      table.columns.some((column) =>
        String(row[column.key] ?? '')
          .toLowerCase()
          .includes(needle),
      ),
    );
  }, [query, table]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const result = compare(a[sort.key] ?? '', b[sort.key] ?? '');
      return sort.direction === 'asc' ? result : -result;
    });
    return copy;
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = sorted.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const toggleSort = (key: string): void => {
    setPage(0);
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' };
      return current.direction === 'asc' ? { key, direction: 'desc' } : null;
    });
  };

  const downloadCsv = (): void => {
    const header = table.columns.map((column) => toCsvField(column.label)).join(',');
    const body = sorted
      .map((row) => table.columns.map((column) => toCsvField(row[column.key] ?? '')).join(','))
      .join('\n');
    const blob = new Blob([`${header}\n${body}\n`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${exportName}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-3 py-3 sm:px-4">
        <label className="relative min-w-0 basis-full sm:min-w-[12rem] sm:flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="Search these rows"
            aria-label="Search evidence rows"
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </label>

        {canExport ? (
          <button
            type="button"
            onClick={downloadCsv}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:w-auto"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            Export CSV
          </button>
        ) : (
          <span className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-500">
            Export disabled by the provider
          </span>
        )}
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {visible.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">No rows match that search.</p>
        ) : (
          visible.map((row, index) => (
            <article key={`${safePage}-${index}`} className="p-3">
              <dl className="space-y-2">
                {table.columns.map((column) => (
                  <div key={column.key} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 border-b border-slate-100 py-2 last:border-b-0">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">{column.label}</dt>
                    <dd className={`min-w-0 break-words text-sm text-slate-800 ${column.align === 'right' ? 'text-right tabular-nums' : 'text-left'}`}>{formatCell(row[column.key] ?? '')}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            {`Evidence rows${query ? ` matching “${query}”` : ''}`}
          </caption>
          <thead>
            <tr className="bg-slate-50">
              {table.columns.map((column) => {
                const active = sort?.key === column.key;
                const ariaSort = active
                  ? sort.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none';
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={`whitespace-nowrap border-b border-slate-200 px-4 py-2 font-semibold text-slate-700 ${
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="inline-flex items-center gap-1 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      {column.label}
                      {active ? (
                        sort.direction === 'asc' ? (
                          <ArrowUp aria-hidden="true" className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={table.columns.length}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No rows match that search.
                </td>
              </tr>
            ) : (
              visible.map((row, index) => (
                <tr
                  key={`${safePage}-${index}`}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                >
                  {table.columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-2 text-slate-800 ${
                        column.align === 'right' ? 'text-right tabular-nums' : 'text-left'
                      }`}
                    >
                      {formatCell(row[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-stretch gap-3 border-t border-slate-200 px-3 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <span>
          {sorted.length} {sorted.length === 1 ? 'row' : 'rows'}
          {query ? ` of ${table.rows.length}` : ''}
        </span>
        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-start">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={safePage === 0}
            className="min-h-9 rounded-md border border-slate-300 px-2.5 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span aria-live="polite">
            Page {safePage + 1} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
            disabled={safePage >= pageCount - 1}
            className="min-h-9 rounded-md border border-slate-300 px-2.5 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
