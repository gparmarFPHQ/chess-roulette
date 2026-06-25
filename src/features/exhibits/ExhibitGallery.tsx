/**
 * ExhibitGallery — Grid view of all exhibits with filter support.
 *
 * Displays exhibit cards in a responsive grid. Each card shows a thumbnail preview,
 * exhibit number badge, type indicator, and title. Clicking opens the detail modal.
 */

import { useMemo } from 'react';
import type { Exhibit, ExhibitType } from './types';

export interface ExhibitGalleryProps {
  exhibits: Exhibit[];
  onExhibitClick: (exhibitId: string) => void;
  filter?: ExhibitType;
}

/** Get a display icon for the exhibit type */
function getTypeIcon(type: ExhibitType): string {
  switch (type) {
    case 'table': return '📊';
    case 'chart': return '📈';
    case 'photo': return '📷';
    case 'figure': return '🖼️';
  }
}

/** Get CSS class for type badge */
function getTypeBadgeClass(type: ExhibitType): string {
  switch (type) {
    case 'table': return 'exhibit-gallery__badge--table';
    case 'chart': return 'exhibit-gallery__badge--chart';
    case 'photo': return 'exhibit-gallery__badge--photo';
    case 'figure': return 'exhibit-gallery__badge--figure';
  }
}

export function ExhibitGallery({ exhibits, onExhibitClick, filter }: ExhibitGalleryProps) {
  const filteredExhibits = useMemo(() => {
    if (!filter) return exhibits;
    return exhibits.filter((e) => e.type === filter);
  }, [exhibits, filter]);

  if (filteredExhibits.length === 0) {
    return (
      <div className="exhibit-gallery__empty" style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
        <p style={{ fontSize: 18, marginBottom: 8 }}>No exhibits found</p>
        <p style={{ fontSize: 14 }}>
          {filter ? `No ${filter} exhibits available.` : 'Load a case to see its exhibits.'}
        </p>
      </div>
    );
  }

  return (
    <div className="exhibit-gallery" role="list" aria-label="Exhibit gallery">
      {filteredExhibits.map((exhibit) => (
        <button
          key={exhibit.id}
          className="exhibit-gallery__card"
          onClick={() => onExhibitClick(exhibit.id)}
          role="listitem"
          aria-label={`Open ${exhibit.title}`}
          type="button"
        >
          {/* Exhibit number badge */}
          <span className="exhibit-gallery__number">
            Exhibit {exhibit.exhibitNumber}
          </span>

          {/* Thumbnail preview */}
          <div className="exhibit-gallery__thumbnail">
            {exhibit.type === 'photo' || exhibit.type === 'figure' ? (
              <img
                src={exhibit.imageUrl}
                alt={exhibit.title}
                className="exhibit-gallery__thumbnail-image"
                loading="lazy"
              />
            ) : exhibit.data ? (
              <div className="exhibit-gallery__thumbnail-table">
                {exhibit.data.columns.slice(0, 3).map((col) => (
                  <div key={col} className="exhibit-gallery__thumbnail-col">{col}</div>
                ))}
                {exhibit.data.rows.slice(0, 2).map((row, idx) => (
                  <div key={idx} className="exhibit-gallery__thumbnail-row">
                    {exhibit.data.columns.slice(0, 3).map((col) => (
                      <div key={col} className="exhibit-gallery__thumbnail-cell">
                        {typeof row[col] === 'number' ? row[col].toLocaleString() : String(row[col])}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="exhibit-gallery__thumbnail-placeholder">No data</div>
            )}
          </div>

          {/* Type indicator */}
          <span className={`exhibit-gallery__type-badge ${getTypeBadgeClass(exhibit.type)}`}>
            <span aria-hidden="true">{getTypeIcon(exhibit.type)}</span>
            {exhibit.type}
          </span>

          {/* Title and description */}
          <h3 className="exhibit-gallery__title">{exhibit.title}</h3>
          <p className="exhibit-gallery__description">{exhibit.description}</p>
        </button>
      ))}
    </div>
  );
}
