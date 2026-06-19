// ============================================================================
// MBA Case Study Platform — Ingestion Module Types
// ============================================================================
// Core data structures for the structured, visibility-tagged knowledge base.
// These types enforce information boundaries at the data layer, not just
// through prompt engineering.
// ============================================================================

// ---------------------------------------------------------------------------
// Visibility & Access Control
// ---------------------------------------------------------------------------

/** Controls who can access a piece of content. */
export type Visibility = "student" | "instructor";

/** How a chunk is attributed to characters. */
export type AttributionMode =
  | "narrator"       // General narrative — all characters can reference it
  | "character"      // Tied to a specific character's perspective
  | "exhibit"        // Data from an exhibit
  | "instructor"     // Teaching notes / discussion questions (instructor-only)
  | "external"       // Third-party or industry data
  | "competitor"     // Competitor perspective (limited access)
  | "expert"         // Industry expert commentary (limited access);
// ---------------------------------------------------------------------------
// Case Chunk — the atomic unit of retrievable content
// ---------------------------------------------------------------------------

export interface CaseChunk {
  /** Unique identifier within the case. */
  id: string;

  /** The actual text content (200-500 words per chunk). */
  text: string;

  /** Who can access this chunk. */
  visibility: Visibility;

  /** High-level topic for retrieval routing. */
  topic: string;

  /** Section of the case this chunk belongs to. */
  section: string;

  /**
   * Which character(s) would plausibly know this information.
   * Omitted or "narrator" means general knowledge accessible to all.
   */
  characterAttribution?: string;

  /** Source page number in the original PDF. */
  pageNumber?: number;

  /** Attribution mode for access control logic. */
  attributionMode?: AttributionMode;

  /**
   * Embedding vector (populated by the vector store layer).
   * Not part of the ingestion output — added at query time.
   */
  embedding?: number[];
}

// ---------------------------------------------------------------------------
// Character & Persona
// ---------------------------------------------------------------------------

/**
 * Maps each character to the chunks they can and cannot access.
 * This is the enforcement layer for character plausibility.
 */
export interface CharacterAccessMap {
  /** Stable character identifier. */
  characterId: string;

  /** Display name. */
  characterName: string;

  /** Role/title in the case. */
  role: string;

  /**
   * Personality description extracted from how the character is described
   * and quoted in the case.
   */
  personality: string;

  /** Chunks this character CAN speak about. */
  accessibleChunkIds: string[];

  /** Chunks this character should NOT reference. */
  inaccessibleChunkIds: string[];
}

/**
 * Full persona profile auto-generated from the case text.
 * Used to initialize character system prompts in the chat layer.
 */
export interface PersonaProfile {
  /** Stable identifier. */
  id: string;

  /** Full name. */
  name: string;

  /** Role/title. */
  role: string;

  /** Company or organization. */
  company: string;

  /**
   * Communication style and personality traits extracted from quotes
   * and narrative description.
   */
  personality: string;

  /** What this character wants to achieve. */
  goals: string[];

  /** What's at stake for this character in the case situation. */
  stakeInSituation: string;

  /** Actual quotes from the case text. */
  sampleQuotes: string[];

  /**
   * Description of the scope of information this character has access to.
   */
  informationScope: string;
}

// ---------------------------------------------------------------------------
// Exhibits
// ---------------------------------------------------------------------------

/** Type of exhibit content. */
export type ExhibitType = "table" | "chart" | "photo" | "figure";

/** A single row of data in a table exhibit. */
export interface TableDataRow {
  [key: string]: string | number | null;
}

/** Structured data for table exhibits. */
export interface TableData {
  columns: string[];
  rows: TableDataRow[];
}

/** Structured data for chart exhibits. */
export interface ChartData {
  /** Chart subtype. */
  chartType: "bar" | "line" | "pie" | "area" | "population-pyramid" | "other";
  /** Labels for axes or categories. */
  labels: string[];
  /** Data series. */
  series: { name: string; values: number[] }[];
}

/**
 * Metadata for a case exhibit (table, chart, photo, or figure).
 * Enables the frontend to render the correct component.
 */
export interface Exhibit {
  /** Unique identifier. */
  id: string;

  /** Exhibit number (e.g., 1 for "Exhibit 1"). */
  exhibitNumber: number;

  /** Exhibit title. */
  title: string;

  /** Content type determines frontend rendering. */
  type: ExhibitType;

  /** Human-readable description of what the exhibit shows. */
  description: string;

  /** Structured data for tables. */
  tableData?: TableData;

  /** Structured data for charts. */
  chartData?: ChartData;

  /** URL or path to the image for photos/figures. */
  imageUrl?: string;

  /** Caption text from the exhibit. */
  caption: string;

  /** Page number in the original PDF. */
  pageNumber?: number;

  /** Whether this exhibit is referenced but not included in the PDF. */
  referencedOnly?: boolean;
}

// ---------------------------------------------------------------------------
// Case Metadata
// ---------------------------------------------------------------------------

/**
 * Top-level metadata about the case document.
 */
export interface CaseMetadata {
  /** Case title. */
  title: string;

  /** Publishing institution or source. */
  source: string;

  /** Year of publication. */
  year: number;

  /** Total number of pages in the PDF. */
  totalPages: number;

  /** Number of student-facing chunks. */
  studentChunkCount: number;

  /** Number of instructor-only chunks. */
  instructorChunkCount: number;

  /** Number of characters/personas. */
  characterCount: number;

  /** Number of exhibits. */
  exhibitCount: number;

  /** Date the knowledge base was generated. */
  generatedAt: string;

  /** Version of the ingestion schema. */
  schemaVersion: string;
}

// ---------------------------------------------------------------------------
// Knowledge Base — the root output
// ---------------------------------------------------------------------------

/**
 * The complete structured knowledge base for a single case.
 * This is the foundation for retrieval-grounded queries,
 * character-plausible responses, and visibility enforcement.
 */
export interface KnowledgeBase {
  /** Unique case identifier. */
  caseId: string;

  /** Case title. */
  caseTitle: string;

  /** All segmented, tagged chunks. */
  chunks: CaseChunk[];

  /** Per-character access maps. */
  characters: CharacterAccessMap[];

  /** Auto-generated persona profiles. */
  personaProfiles: PersonaProfile[];

  /** Exhibit metadata. */
  exhibits: Exhibit[];

  /** Case-level metadata. */
  metadata: CaseMetadata;
}

// ---------------------------------------------------------------------------
// Parser & Processing Interfaces
// ---------------------------------------------------------------------------

/** Raw section extracted from a case document before chunking. */
export interface RawSection {
  /** Section identifier. */
  id: string;

  /** Section title. */
  title: string;

  /** Raw text content. */
  text: string;

  /** Starting page number. */
  startPage: number;

  /** Ending page number. */
  endPage: number;

  /** Whether this section is instructor-only. */
  isInstructorOnly: boolean;
}

/** Result of parsing a case document into raw sections. */
export interface ParseResult {
  /** Case title extracted from the document. */
  title: string;

  /** Raw sections before chunking. */
  sections: RawSection[];

  /** Exhibit references found in the document. */
  exhibitReferences: { exhibitNumber: number; title: string; page: number }[];
}

/** Configuration for the chunker. */
export interface ChunkerConfig {
  /** Minimum words per chunk. */
  minWords: number;

  /** Maximum words per chunk. */
  maxWords: number;

  /** Whether to split on paragraph boundaries only. */
  respectParagraphs: boolean;

  /** Whether to split on section boundaries. */
  respectSections: boolean;
}

/** Default chunker configuration. */
export const DEFAULT_CHUNKER_CONFIG: ChunkerConfig = {
  minWords: 200,
  maxWords: 500,
  respectParagraphs: true,
  respectSections: true,
};

// ---------------------------------------------------------------------------
// Character Knowledge Domain
// ---------------------------------------------------------------------------

/**
 * Defines what domains of knowledge a character has access to.
 * Used by the access map builder to determine chunk accessibility.
 */
export interface CharacterKnowledgeDomain {
  characterId: string;

  /** Topics this character can speak about. */
  topics: string[];

  /** Sections this character can reference. */
  sections: string[];

  /** Attribution modes this character can access. */
  attributionModes: AttributionMode[];

  /**
   * Specific chunks that are exceptions — always accessible
   * even if they don't match the above criteria.
   */
  alwaysAccessibleChunkIds?: string[];

  /**
   * Specific chunks that are exceptions — never accessible
   * even if they match the above criteria.
   */
  neverAccessibleChunkIds?: string[];
}
