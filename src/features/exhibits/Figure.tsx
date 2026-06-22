/**
 * Figure — Static figure/illustration component with caption.
 *
 * Displays an image with a caption and exhibit number reference.
 * Clicking opens the lightbox (via onZoom callback).
 */

import { useState } from 'react';

export interface FigureProps {
  imageUrl: string;
  caption: string;
  exhibitNumber: number;
  onZoom?: () => void;
}

export function Figure({ imageUrl, caption, exhibitNumber, onZoom }: FigureProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <figure className="exhibit-figure" role="group" aria-label={`Exhibit ${exhibitNumber}: ${caption}`}>
      {/* Exhibit number badge */}
      <span className="exhibit-figure__badge">Exhibit {exhibitNumber}</span>

      {/* Image container */}
      <div className="exhibit-figure__image-container">
        {!loaded && !error && (
          <div className="exhibit-figure__placeholder" role="status" aria-label="Loading image">
            Loading...
          </div>
        )}
        {error ? (
          <div className="exhibit-figure__error">
            <p>Image failed to load</p>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={caption}
            className={`exhibit-figure__image ${loaded ? 'exhibit-figure__image--loaded' : ''}`}
            onClick={onZoom}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            role={onZoom ? 'button' : 'img'}
            tabIndex={onZoom ? 0 : undefined}
            onKeyDown={(e) => { if (onZoom && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onZoom(); } }}
            aria-label={onZoom ? `Click to zoom: ${caption}` : caption}
            loading="lazy"
          />
        )}
        {onZoom && !error && loaded && (
          <div className="exhibit-figure__zoom-overlay">
            <span className="exhibit-figure__zoom-icon">🔍</span>
            <span className="exhibit-figure__zoom-text">Click to zoom</span>
          </div>
        )}
      </div>

      {/* Caption */}
      <figcaption className="exhibit-figure__caption">
        <strong>Exhibit {exhibitNumber}:</strong> {caption}
      </figcaption>
    </figure>
  );
}
