/**
 * Exhibits Module — MBA Case Study Platform
 *
 * Entry point for the exhibits + charts module.
 * Re-exports all types, components, store, and sample data.
 */

// ─── Types ──────────────────────────────────────────────────────
export type {
  ExhibitType,
  ChartType,
  Exhibit,
  ExhibitData,
  ExhibitReference,
  ExhibitState,
} from './types';

// ─── Store ──────────────────────────────────────────────────────
export { exhibitStore, useExhibitStore } from './exhibitStore';

// ─── Sample Data ────────────────────────────────────────────────
export { coffeeWarsExhibits, getExhibitsForCase } from './sampleExhibitData';

// ─── Components ─────────────────────────────────────────────────
export { ExhibitGallery } from './ExhibitGallery';
export type { ExhibitGalleryProps } from './ExhibitGallery';

export { ExhibitDetailModal } from './ExhibitDetailModal';
export type { ExhibitDetailModalProps } from './ExhibitDetailModal';

export { DataTable } from './DataTable';
export type { DataTableProps } from './DataTable';

export { ChartRenderer } from './ChartRenderer';
export type { ChartRendererProps } from './ChartRenderer';

export { ImageLightbox } from './ImageLightbox';
export type { ImageLightboxProps } from './ImageLightbox';

export { Figure } from './Figure';
export type { FigureProps } from './Figure';

export { ExhibitReferenceLink } from './ExhibitReferenceLink';
export type { ExhibitReferenceLinkProps } from './ExhibitReferenceLink';

// ─── Charts ─────────────────────────────────────────────────────
export { BarChart, LineChart, PieChart, AreaChart } from './charts';
export type { BarChartProps, LineChartProps, PieChartProps, AreaChartProps } from './charts';
