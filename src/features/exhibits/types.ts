/**
 * Exhibit Types for MBA Case Study Platform
 *
 * Defines the data structures for all exhibit types: tables, charts, photos, and figures.
 */

/** Supported exhibit rendering types */
export type ExhibitType = 'table' | 'chart' | 'photo' | 'figure';

/** Chart rendering strategies */
export type ChartType = 'bar' | 'line' | 'pie' | 'area';

/**
 * A single exhibit from a case study.
 * Exhibits can be data tables, interactive charts, photos, or static figures.
 */
export interface Exhibit {
  /** Unique identifier within the case */
  id: string;
  /** Sequential exhibit number (displayed as "Exhibit N") */
  exhibitNumber: number;
  /** Exhibit title */
  title: string;
  /** Rendering type determines which component displays the exhibit */
  type: ExhibitType;
  /** Brief description of what the exhibit shows */
  description: string;
  /** Tabular or chart data — used for 'table' and 'chart' types */
  data?: ExhibitData;
  /** Image URL — used for 'photo' and 'figure' types */
  imageUrl?: string;
  /** Caption displayed below the exhibit */
  caption: string;
  /** Source attribution (optional) */
  source?: string;
}

/**
 * Structured data for tables and charts.
 * Tables render rows as-is; charts use chartType to pick a visualization.
 */
export interface ExhibitData {
  /** Column header names */
  columns: string[];
  /** Each row is a record mapping column names to values */
  rows: Array<Record<string, string | number>>;
  /** Chart visualization type (only for type='chart' exhibits) */
  chartType?: ChartType;
  /** Key for the X axis (for bar, line, area charts) */
  xKey?: string;
  /** Keys for the Y axis values (for bar, line, area charts) */
  yKeys?: string[];
  /** Color palette for chart series */
  colors?: string[];
}

/**
 * Reference to an exhibit from within the case text.
 * Used to create clickable links like "see Exhibit 4".
 */
export interface ExhibitReference {
  /** The exhibit number being referenced */
  exhibitNumber: number;
  /** Surrounding text context where the reference appears */
  context: string;
}

/**
 * State shape for the exhibit store.
 */
export interface ExhibitState {
  /** All loaded exhibits for the current case */
  exhibits: Exhibit[];
  /** Loading indicator */
  isLoading: boolean;
  /** Currently active/expanded exhibit ID */
  activeExhibitId: string | null;
  /** Whether the image lightbox is open */
  lightboxOpen: boolean;
  /** ID of the exhibit currently shown in the lightbox */
  lightboxExhibitId: string | null;

  /** Load exhibits for a given case */
  loadExhibits: (caseId: string) => Promise<void>;
  /** Set or clear the active exhibit */
  setActiveExhibit: (exhibitId: string | null) => void;
  /** Open the image lightbox for a specific exhibit */
  openLightbox: (exhibitId: string) => void;
  /** Close the image lightbox */
  closeLightbox: () => void;
  /** Find an exhibit by its sequential number */
  getExhibitByNumber: (number: number) => Exhibit | undefined;
  /** Filter exhibits by type */
  getExhibitsByType: (type: ExhibitType) => Exhibit[];
  /** Get the active exhibit object */
  getActiveExhibit: () => Exhibit | undefined;
  /** Get the lightbox exhibit object */
  getLightboxExhibit: () => Exhibit | undefined;
}
