/**
 * DataTable — Renders financial/data tables with clean styling.
 *
 * Features: alternating rows, numeric right-alignment, sorting, hover effects, responsive scroll.
 */

import { useState, useMemo } from 'react';
import type { ExhibitData } from './types';

export interface DataTableProps {
  data: ExhibitData;
  caption?: string;
  highlightRows?: number[];
  sortable?: boolean;
}

/** Check if a column contains numeric values */
function isNumericColumn(data: ExhibitData, col: string): boolean {
  return data.rows.some((row) => typeof row[col] === 'number');
}

/** Format a cell value for display */
function formatCell(value: string | number | undefined): string {
  if (value === undefined || value === null) return '—';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  }
  return String(value);
}

export function DataTable({ data, caption, highlightRows = [], sortable = true }: DataTableProps) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const sortedRows = useMemo(() => {
    if (!sortCol) return data.rows;
    return [...data.rows].sort((a, b) => {
      const aVal = a[sortCol];
      const bVal = b[sortCol];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal ?? '');
      const bStr = String(bVal ?? '');
      return sortAsc ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [data.rows, sortCol, sortAsc]);

  const handleSort = (col: string) => {
    if (!sortable) return;
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  return (
    <div className="exhibit-data-table">
      <div className="exhibit-data-table__scroll">
        <table className="exhibit-data-table__table" role="table" aria-label={caption}>
          <thead>
            <tr>
              {data.columns.map((col) => {
                const numeric = isNumericColumn(data, col);
                return (
                  <th
                    key={col}
                    className={`exhibit-data-table__header ${sortable ? 'exhibit-data-table__header--sortable' : ''} ${numeric ? 'exhibit-data-table__header--numeric' : ''}`}
                    onClick={() => handleSort(col)}
                    role={sortable ? 'columnheader button' : 'columnheader'}
                    aria-sort={sortCol === col ? (sortAsc ? 'ascending' : 'descending') : undefined}
                    tabIndex={sortable ? 0 : undefined}
                    onKeyDown={(e) => { if (sortable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleSort(col); } }}
                  >
                    <span className="exhibit-data-table__header-content">
                      {col}
                      {sortCol === col && (
                        <span className="exhibit-data-table__sort-icon" aria-hidden="true">
                          {sortAsc ? '▲' : '▼'}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, idx) => {
              const isHighlighted = highlightRows.includes(idx);
              return (
                <tr
                  key={idx}
                  className={`exhibit-data-table__row ${idx % 2 === 1 ? 'exhibit-data-table__row--alt' : ''} ${isHighlighted ? 'exhibit-data-table__row--highlight' : ''}`}
                >
                  {data.columns.map((col) => {
                    const numeric = isNumericColumn(data, col);
                    return (
                      <td
                        key={col}
                        className={`exhibit-data-table__cell ${numeric ? 'exhibit-data-table__cell--numeric' : ''}`}
                      >
                        {formatCell(row[col])}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {caption && <caption className="exhibit-data-table__caption">{caption}</caption>}
    </div>
  );
}
