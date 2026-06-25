/**
 * ExhibitDetailModal — Full exhibit view in a large modal.
 *
 * Renders the appropriate component (table, chart, photo) based on exhibit type.
 * Supports navigation to next/previous exhibits and keyboard handling (ESC to close).
 */

import { useEffect, useCallback, useMemo } from 'react';
import type { Exhibit } from './types';
import { DataTable } from './DataTable';
import { ChartRenderer } from './ChartRenderer';
import { Figure } from './Figure';

export interface ExhibitDetailModalProps {
  exhibit: Exhibit;
  allExhibits?: Exhibit[]; // For navigation
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (exhibitId: string) => void;
}

export function ExhibitDetailModal({ exhibit, allExhibits = [], isOpen, onClose, onNavigate }: ExhibitDetailModalProps) {
  // ESC key handling
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrevious()) navigate(-1);
      if (e.key === 'ArrowRight' && hasNext()) navigate(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const currentIndex = useMemo(() => {
    return allExhibits.findIndex((e) => e.id === exhibit.id);
  }, [allExhibits, exhibit.id]);

  const navigate = useCallback((direction: number) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < allExhibits.length && onNavigate) {
      onNavigate(allExhibits[newIndex].id);
    }
  }, [currentIndex, allExhibits, onNavigate]);

  const hasNext = useCallback(() => currentIndex < allExhibits.length - 1, [currentIndex, allExhibits.length]);
  const hasPrevious = useCallback(() => currentIndex > 0, [currentIndex]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (exhibit.type) {
      case 'table':
        return exhibit.data ? (
          <DataTable data={exhibit.data} caption={exhibit.caption} sortable />
        ) : <p className="exhibit-detail__no-data">No table data available.</p>;

      case 'chart':
        return exhibit.data ? (
          <ChartRenderer exhibit={exhibit} height={450} />
        ) : <p className="exhibit-detail__no-data">No chart data available.</p>;

      case 'photo':
      case 'figure':
        return exhibit.imageUrl ? (
          <Figure
            imageUrl={exhibit.imageUrl}
            caption={exhibit.caption}
            exhibitNumber={exhibit.exhibitNumber}
          />
        ) : <p className="exhibit-detail__no-data">No image available.</p>;

      default:
        return <p className="exhibit-detail__no-data">Unknown exhibit type.</p>;
    }
  };

  return (
    <div className="exhibit-modal__overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={exhibit.title}>
      <div className="exhibit-modal__content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="exhibit-modal__header">
          <div className="exhibit-modal__header-left">
            <span className="exhibit-modal__badge">Exhibit {exhibit.exhibitNumber}</span>
            <h2 className="exhibit-modal__title">{exhibit.title}</h2>
          </div>
          <button
            className="exhibit-modal__close-btn"
            onClick={onClose}
            aria-label="Close exhibit"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        {exhibit.description && (
          <p className="exhibit-modal__description">{exhibit.description}</p>
        )}

        {/* Content */}
        <div className="exhibit-modal__body">
          {renderContent()}
        </div>

        {/* Caption and Source */}
        <div className="exhibit-modal__footer">
          {exhibit.caption && (
            <p className="exhibit-modal__caption">{exhibit.caption}</p>
          )}
          {exhibit.source && (
            <p className="exhibit-modal__source">Source: {exhibit.source}</p>
          )}
        </div>

        {/* Navigation */}
        {allExhibits.length > 1 && (
          <div className="exhibit-modal__nav">
            <button
              className="exhibit-modal__nav-btn exhibit-modal__nav-btn--prev"
              onClick={() => navigate(-1)}
              disabled={!hasPrevious()}
              aria-label="Previous exhibit"
              type="button"
            >
              ← {hasPrevious() ? `Exhibit ${allExhibits[currentIndex - 1]?.exhibitNumber}` : ''}
            </button>
            <span className="exhibit-modal__nav-info">
              {currentIndex + 1} of {allExhibits.length}
            </span>
            <button
              className="exhibit-modal__nav-btn exhibit-modal__nav-btn--next"
              onClick={() => navigate(1)}
              disabled={!hasNext()}
              aria-label="Next exhibit"
              type="button"
            >
              {hasNext() ? `Exhibit ${allExhibits[currentIndex + 1]?.exhibitNumber}` : ''} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
