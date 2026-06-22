/**
 * ExhibitReferenceLink — Clickable inline reference to an exhibit.
 *
 * Used within case text to create links like "see Exhibit 4".
 * Clicking opens the exhibit detail modal.
 */

import type { Exhibit } from './types';

export interface ExhibitReferenceLinkProps {
  exhibitNumber: number;
  exhibit?: Exhibit; // Optional: for hover tooltip preview
  onClick: () => void;
  className?: string;
}

export function ExhibitReferenceLink({ exhibitNumber, exhibit, onClick, className = '' }: ExhibitReferenceLinkProps) {
  return (
    <span
      className={`exhibit-ref-link ${className}`.trim()}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      title={exhibit ? `View: ${exhibit.title}` : `View Exhibit ${exhibitNumber}`}
      aria-label={`View Exhibit ${exhibitNumber}${exhibit ? `: ${exhibit.title}` : ''}`}
    >
      Exhibit {exhibitNumber}
    </span>
  );
}
