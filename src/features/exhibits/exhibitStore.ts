/**
 * Exhibit Store
 *
 * Central state management for exhibits: loading, active exhibit, lightbox.
 * Uses a callback-based reactive pattern compatible with React.
 */

import type { Exhibit, ExhibitType, ExhibitState } from './types';
import { coffeeWarsExhibits } from './sampleExhibitData';

class ExhibitStore implements ExhibitState {
  private _exhibits: Exhibit[] = [];
  private _isLoading = false;
  private _activeExhibitId: string | null = null;
  private _lightboxOpen = false;
  private _lightboxExhibitId: string | null = null;
  private _listeners: Set<() => void> = new Set();

  get exhibits(): Exhibit[] { return this._exhibits; }
  get isLoading(): boolean { return this._isLoading; }
  get activeExhibitId(): string | null { return this._activeExhibitId; }
  get lightboxOpen(): boolean { return this._lightboxOpen; }
  get lightboxExhibitId(): string | null { return this._lightboxExhibitId; }

  async loadExhibits(caseId: string): Promise<void> {
    this._isLoading = true;
    this.notify();

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (caseId === 'coffee-wars' || caseId === 'default') {
        this._exhibits = [...coffeeWarsExhibits];
      } else {
        this._exhibits = [];
      }
    } finally {
      this._isLoading = false;
      this.notify();
    }
  }

  setActiveExhibit(exhibitId: string | null): void {
    this._activeExhibitId = exhibitId;
    this.notify();
  }

  openLightbox(exhibitId: string): void {
    this._lightboxExhibitId = exhibitId;
    this._lightboxOpen = true;
    this.notify();
  }

  closeLightbox(): void {
    this._lightboxOpen = false;
    this._lightboxExhibitId = null;
    this.notify();
  }

  getExhibitByNumber(number: number): Exhibit | undefined {
    return this._exhibits.find((e) => e.exhibitNumber === number);
  }

  getExhibitsByType(type: ExhibitType): Exhibit[] {
    return this._exhibits.filter((e) => e.type === type);
  }

  getActiveExhibit(): Exhibit | undefined {
    if (!this._activeExhibitId) return undefined;
    return this._exhibits.find((e) => e.id === this._activeExhibitId);
  }

  getLightboxExhibit(): Exhibit | undefined {
    if (!this._lightboxExhibitId) return undefined;
    return this._exhibits.find((e) => e.id === this._lightboxExhibitId);
  }

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => { this._listeners.delete(listener); };
  }

  private notify(): void {
    for (const listener of this._listeners) {
      listener();
    }
  }
}

export const exhibitStore = new ExhibitStore();

// ─── React Hook ────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';

export function useExhibitStore(): ExhibitState {
  const [state, setState] = useState<ExhibitState>(exhibitStore);

  useEffect(() => {
    const unsubscribe = exhibitStore.subscribe(() => {
      setState(exhibitStore);
    });
    return unsubscribe;
  }, []);

  const loadExhibits = useCallback((caseId: string) => exhibitStore.loadExhibits(caseId), []);
  const setActiveExhibit = useCallback((id: string | null) => exhibitStore.setActiveExhibit(id), []);
  const openLightbox = useCallback((id: string) => exhibitStore.openLightbox(id), []);
  const closeLightbox = useCallback(() => exhibitStore.closeLightbox(), []);
  const getExhibitByNumber = useCallback((n: number) => exhibitStore.getExhibitByNumber(n), []);
  const getExhibitsByType = useCallback((t: ExhibitType) => exhibitStore.getExhibitsByType(t), []);
  const getActiveExhibit = useCallback(() => exhibitStore.getActiveExhibit(), []);
  const getLightboxExhibit = useCallback(() => exhibitStore.getLightboxExhibit(), []);

  return {
    exhibits: exhibitStore.exhibits,
    isLoading: exhibitStore.isLoading,
    activeExhibitId: exhibitStore.activeExhibitId,
    lightboxOpen: exhibitStore.lightboxOpen,
    lightboxExhibitId: exhibitStore.lightboxExhibitId,
    loadExhibits,
    setActiveExhibit,
    openLightbox,
    closeLightbox,
    getExhibitByNumber,
    getExhibitsByType,
    getActiveExhibit,
    getLightboxExhibit,
  };
}
