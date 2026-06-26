/**
 * ExhibitReference — Clickable inline exhibit reference in case text.
 *
 * Renders as a small superscript-like link with burgundy color and hover underline.
 * Clicking opens the exhibit detail modal.
 */

export interface ExhibitReferenceProps {
  exhibitNumber: number;
  onOpenExhibit: (exhibitNumber: number) => void;
}

export function ExhibitReference({ exhibitNumber, onOpenExhibit }: ExhibitReferenceProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onOpenExhibit(exhibitNumber);
      }}
      className="exhibit-reference"
      type="button"
      title={`View Exhibit ${exhibitNumber}`}
      aria-label={`View Exhibit ${exhibitNumber}`}
      style={{
        color: '#8B1A4A',
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: '0 2px',
        fontSize: '0.9em',
        fontWeight: 600,
        fontFamily: 'inherit',
        transition: 'color 0.15s ease, background-color 0.15s ease',
        borderRadius: '3px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#5C1030';
        e.currentTarget.style.backgroundColor = 'rgba(139, 26, 74, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#8B1A4A';
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      Exhibit {exhibitNumber}
    </button>
  );
}
