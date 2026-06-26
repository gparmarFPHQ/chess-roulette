/**
 * ExhibitsPage — Gallery page showing all exhibits in a grid.
 *
 * Displays exhibit cards with thumbnails, type badges, and titles.
 * Clicking an exhibit opens the detail modal.
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { coffeeWarsCase } from '../ingestion/sampleCaseData';
import type { Exhibit, ExhibitType } from '../features/exhibits/types';
import { ExhibitGallery } from '../features/exhibits/ExhibitGallery';
import { ExhibitDetailModal } from '../features/exhibits/ExhibitDetailModal';
import { ArrowLeft, Filter } from 'lucide-react';

export function ExhibitsPage() {
  const exhibits = coffeeWarsCase.exhibits;
  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
  const [activeFilter, setActiveFilter] = useState<ExhibitType | 'all'>('all');

  const filteredExhibits = useMemo(() => {
    if (activeFilter === 'all') return exhibits;
    return exhibits.filter((e) => e.type === activeFilter);
  }, [exhibits, activeFilter]);

  const exhibitTypes: (ExhibitType | 'all')[] = ['all', 'table', 'chart', 'photo', 'figure'];

  const handleExhibitClick = (exhibitId: string) => {
    const exhibit = exhibits.find((e) => e.id === exhibitId);
    if (exhibit) setSelectedExhibit(exhibit);
  };

  const handleCloseModal = () => setSelectedExhibit(null);

  const handleNavigate = (exhibitId: string) => {
    const exhibit = exhibits.find((e) => e.id === exhibitId);
    if (exhibit) setSelectedExhibit(exhibit);
  };

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: exhibits.length };
    exhibits.forEach((e) => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });
    return counts;
  }, [exhibits]);

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            to="/read"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-burgundy-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reading
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <h1 className="text-lg font-serif font-semibold text-slate-900">
              Exhibits
            </h1>
            <p className="text-xs text-slate-500">
              Coffee Wars in India — {exhibits.length} exhibits
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <p className="text-slate-600 mb-4">
            Financial data, charts, and figures from the case. Click any exhibit to view details.
          </p>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-500 mr-1">Filter:</span>
            {exhibitTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === type
                    ? 'bg-burgundy-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                type="button"
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                <span className="ml-1.5 text-xs opacity-70">
                  ({typeCounts[type] || 0})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          <ExhibitGallery
            exhibits={filteredExhibits}
            onExhibitClick={handleExhibitClick}
          />
        </div>
      </main>

      {/* Exhibit Detail Modal */}
      {selectedExhibit && (
        <ExhibitDetailModal
          exhibit={selectedExhibit}
          allExhibits={exhibits}
          isOpen={!!selectedExhibit}
          onClose={handleCloseModal}
          onNavigate={handleNavigate}
        />
      )}

      {/* Gallery Styles */}
      <style>{`
        .exhibit-gallery {
          display: contents;
        }

        .exhibit-gallery__card {
          display: flex;
          flex-direction: column;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .exhibit-gallery__card:hover {
          border-color: #8B1A4A;
          box-shadow: 0 4px 12px rgba(139, 26, 74, 0.12);
          transform: translateY(-2px);
        }

        .exhibit-gallery__number {
          display: inline-block;
          background: #8B1A4A;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
          margin-bottom: 0.75rem;
          letter-spacing: 0.02em;
        }

        .exhibit-gallery__thumbnail {
          background: #f9fafb;
          border-radius: 8px;
          padding: 0.75rem;
          margin-bottom: 0.75rem;
          min-height: 100px;
          overflow: hidden;
        }

        .exhibit-gallery__thumbnail-image {
          width: 100%;
          height: 100px;
          object-fit: cover;
          border-radius: 4px;
        }

        .exhibit-gallery__thumbnail-table {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          font-size: 0.65rem;
        }

        .exhibit-gallery__thumbnail-col {
          font-weight: 600;
          color: #8B1A4A;
          padding: 2px 4px;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .exhibit-gallery__thumbnail-row {
          display: contents;
        }

        .exhibit-gallery__thumbnail-cell {
          padding: 2px 4px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .exhibit-gallery__thumbnail-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100px;
          color: #9ca3af;
          font-size: 0.8rem;
        }

        .exhibit-gallery__type-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 999px;
          margin-bottom: 0.5rem;
          width: fit-content;
        }

        .exhibit-gallery__badge--table {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .exhibit-gallery__badge--chart {
          background: #f0fdf4;
          color: #15803d;
        }

        .exhibit-gallery__badge--photo {
          background: #fef3c7;
          color: #b45309;
        }

        .exhibit-gallery__badge--figure {
          background: #fce7f3;
          color: #be185d;
        }

        .exhibit-gallery__title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.25rem 0;
          line-height: 1.3;
        }

        .exhibit-gallery__description {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Modal Styles */
        .exhibit-modal__overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 1rem;
          backdrop-filter: blur(4px);
        }

        .exhibit-modal__content {
          background: white;
          border-radius: 16px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        }

        .exhibit-modal__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.5rem 1.5rem 0;
          gap: 1rem;
        }

        .exhibit-modal__header-left {
          flex: 1;
        }

        .exhibit-modal__badge {
          display: inline-block;
          background: #8B1A4A;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 999px;
          margin-bottom: 0.5rem;
        }

        .exhibit-modal__title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
          font-family: serif;
        }

        .exhibit-modal__close-btn {
          background: #f3f4f6;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .exhibit-modal__close-btn:hover {
          background: #e5e7eb;
          color: #111827;
        }

        .exhibit-modal__description {
          padding: 0.75rem 1.5rem;
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .exhibit-modal__body {
          padding: 0 1.5rem 1rem;
        }

        .exhibit-modal__footer {
          padding: 0 1.5rem 1rem;
          border-top: 1px solid #e5e7eb;
          margin-top: 0.5rem;
        }

        .exhibit-modal__caption {
          font-size: 0.85rem;
          color: #4b5563;
          margin: 0 0 0.25rem 0;
          font-style: italic;
        }

        .exhibit-modal__source {
          font-size: 0.75rem;
          color: #9ca3af;
          margin: 0;
        }

        .exhibit-modal__nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .exhibit-modal__nav-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-size: 0.8rem;
          color: #4b5563;
          transition: all 0.15s ease;
        }

        .exhibit-modal__nav-btn:hover:not(:disabled) {
          border-color: #8B1A4A;
          color: #8B1A4A;
        }

        .exhibit-modal__nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .exhibit-modal__nav-info {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        /* Data Table Styles */
        .exhibit-data-table {
          width: 100%;
        }

        .exhibit-data-table__scroll {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .exhibit-data-table__table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .exhibit-data-table__header {
          background: #f9fafb;
          padding: 10px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
        }

        .exhibit-data-table__header--sortable {
          cursor: pointer;
          user-select: none;
        }

        .exhibit-data-table__header--sortable:hover {
          background: #f3f4f6;
        }

        .exhibit-data-table__header--numeric {
          text-align: right;
        }

        .exhibit-data-table__header-content {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .exhibit-data-table__sort-icon {
          font-size: 0.7rem;
          color: #8B1A4A;
        }

        .exhibit-data-table__row:hover {
          background: #faf5ff;
        }

        .exhibit-data-table__row--alt {
          background: #fafafa;
        }

        .exhibit-data-table__row--alt:hover {
          background: #faf5ff;
        }

        .exhibit-data-table__cell {
          padding: 8px 12px;
          border-bottom: 1px solid #f3f4f6;
          color: #4b5563;
        }

        .exhibit-data-table__cell--numeric {
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        .exhibit-data-table__caption {
          padding: 8px 12px;
          font-size: 0.8rem;
          color: #6b7280;
          text-align: left;
          caption-side: bottom;
        }

        /* Figure Styles */
        .exhibit-figure {
          position: relative;
          max-width: 100%;
        }

        .exhibit-figure__badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(139, 26, 74, 0.9);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 999px;
          z-index: 1;
        }

        .exhibit-figure__image-container {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
        }

        .exhibit-figure__image {
          width: 100%;
          display: block;
          border-radius: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .exhibit-figure__image--loaded {
          opacity: 1;
        }

        .exhibit-figure__placeholder {
          width: 100%;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          color: #9ca3af;
          border-radius: 8px;
        }

        .exhibit-figure__error {
          width: 100%;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 8px;
        }

        .exhibit-figure__caption {
          margin-top: 0.75rem;
          font-size: 0.85rem;
          color: #4b5563;
          font-style: italic;
        }

        .exhibit-figure__zoom-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          border-radius: 8px;
          cursor: pointer;
        }

        .exhibit-figure__image-container:hover .exhibit-figure__zoom-overlay {
          opacity: 1;
        }

        .exhibit-figure__zoom-icon {
          font-size: 2rem;
          margin-bottom: 0.25rem;
        }

        .exhibit-figure__zoom-text {
          color: white;
          font-size: 0.85rem;
          font-weight: 500;
        }

        /* Chart Styles */
        .exhibit-chart {
          width: 100%;
        }

        .exhibit-chart__error {
          padding: 2rem;
          text-align: center;
          color: #6b7280;
        }

        .exhibit-detail__no-data {
          padding: 2rem;
          text-align: center;
          color: #6b7280;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
