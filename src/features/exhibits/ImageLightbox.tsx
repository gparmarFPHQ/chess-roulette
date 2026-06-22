/**
 * ImageLightbox — Full-screen image viewer with navigation.
 *
 * Features: dark overlay, centered image, caption, nav arrows, ESC to close, zoom controls.
 */

import { useState, useEffect, useCallback } from 'react';

export interface ImageLightboxProps {
  imageUrl: string;
  caption: string;
  exhibitNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function ImageLightbox({
  imageUrl,
  caption,
  exhibitNumber,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Reset state when image changes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setIsLoading(true);
      setError(false);
    }
  }, [isOpen, imageUrl]);

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrevious) onPrevious();
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z + 0.25, 3));
      if (e.key === '-') setZoom((z) => Math.max(z - 0.25, 0.5));
      if (e.key === '0') setZoom(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious, hasNext, hasPrevious]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.25, 3)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.25, 0.5)), []);
  const handleZoomReset = useCallback(() => setZoom(1), []);

  if (!isOpen) return null;

  return (
    <div
      className="exhibit-lightbox__overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Exhibit ${exhibitNumber}: ${caption}`}
    >
      <div className="exhibit-lightbox__container" onClick={(e) => e.stopPropagation()}>
        {/* Header bar */}
        <div className="exhibit-lightbox__header">
          <span className="exhibit-lightbox__badge">Exhibit {exhibitNumber}</span>
          <button className="exhibit-lightbox__close-btn" onClick={onClose} aria-label="Close lightbox" type="button">
            ✕
          </button>
        </div>

        {/* Image area */}
        <div className="exhibit-lightbox__image-area">
          {/* Previous button */}
          {hasPrevious && (
            <button
              className="exhibit-lightbox__nav-btn exhibit-lightbox__nav-btn--prev"
              onClick={onPrevious}
              aria-label="Previous image"
              type="button"
            >
              ‹
            </button>
          )}

          {/* Image */}
          <div
            className="exhibit-lightbox__image-wrapper"
            style={{ transform: `scale(${zoom})` }}
          >
            {isLoading && !error && (
              <div className="exhibit-lightbox__loading" role="status" aria-label="Loading image">
                <div className="exhibit-lightbox__spinner" />
              </div>
            )}
            {error ? (
              <div className="exhibit-lightbox__error">
                <p>Failed to load image</p>
                <button onClick={() => { setError(false); setIsLoading(true); }} type="button">
                  Retry
                </button>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={caption}
                className="exhibit-lightbox__image"
                onLoad={() => setIsLoading(false)}
                onError={() => { setIsLoading(false); setError(true); }}
              />
            )}
          </div>

          {/* Next button */}
          {hasNext && (
            <button
              className="exhibit-lightbox__nav-btn exhibit-lightbox__nav-btn--next"
              onClick={onNext}
              aria-label="Next image"
              type="button"
            >
              ›
            </button>
          )}
        </div>

        {/* Zoom controls */}
        <div className="exhibit-lightbox__zoom-controls">
          <button onClick={handleZoomOut} disabled={zoom <= 0.5} aria-label="Zoom out" type="button">−</button>
          <span className="exhibit-lightbox__zoom-level">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomReset} aria-label="Reset zoom" type="button">Reset</button>
          <button onClick={handleZoomIn} disabled={zoom >= 3} aria-label="Zoom in" type="button">+</button>
        </div>

        {/* Caption */}
        {caption && (
          <div className="exhibit-lightbox__caption">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}
