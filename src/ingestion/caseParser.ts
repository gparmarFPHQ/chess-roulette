// ============================================================================
// MBA Case Study Platform — Case Parser
// ============================================================================
// Parses raw case document text into structured sections.
// Currently supports hardcoded sample data; designed for future PDF integration.
// ============================================================================

import {
  RawSection,
  ParseResult,
  Exhibit,
} from "./types";

// ---------------------------------------------------------------------------
// Section Identifiers
// ---------------------------------------------------------------------------

export const SECTION_IDS = {
  INTRODUCTION: "introduction",
  INDUSTRY_OVERVIEW: "industry-overview",
  COMPANY_HISTORY: "company-history",
  CCD_EXPANSION: "ccd-expansion",
  MARKET_ANALYSIS: "market-analysis",
  COMPETITIVE_LANDSCAPE: "competitive-landscape",
  STARBUCKS_ENTRY: "starbucks-entry",
  OPERATIONAL_MODELS: "operational-models",
  FINANCIAL_ANALYSIS: "financial-analysis",
  CUSTOMER_DEMOGRAPHICS: "customer-demographics",
  EXPANSION_STRATEGY: "expansion-strategy",
  LOOKING_AHEAD: "looking-ahead",
  EXHIBITS: "exhibits",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

// ---------------------------------------------------------------------------
// Section Boundary Markers
// ---------------------------------------------------------------------------

/**
 * Text patterns that signal the start of a new section.
 * Ordered by specificity — more specific patterns first.
 */
const SECTION_BOUNDARIES: { pattern: RegExp; sectionId: SectionId; isInstructorOnly: boolean }[] = [
  { pattern: /looking\s*ahead/i, sectionId: SECTION_IDS.LOOKING_AHEAD, isInstructorOnly: true },
  { pattern: /exhibit\s*\d/i, sectionId: SECTION_IDS.EXHIBITS, isInstructorOnly: false },
  { pattern: /(starbucks|tata\s*starbucks)\s*(enters?|entry|arrival)/i, sectionId: SECTION_IDS.STARBUCKS_ENTRY, isInstructorOnly: false },
  { pattern: /competitive\s*(landscape|environment|threat)/i, sectionId: SECTION_IDS.COMPETITIVE_LANDSCAPE, isInstructorOnly: false },
  { pattern: /(financial|economics|cost|profit|revenue)/i, sectionId: SECTION_IDS.FINANCIAL_ANALYSIS, isInstructorOnly: false },
  { pattern: /expansion\s*(strategy|plan|ambition)/i, sectionId: SECTION_IDS.EXPANSION_STRATEGY, isInstructorOnly: false },
  { pattern: /customer\s*(demographic|segment|profile)/i, sectionId: SECTION_IDS.CUSTOMER_DEMOGRAPHICS, isInstructorOnly: false },
  { pattern: /(operational|service\s*format|store\s*format)/i, sectionId: SECTION_IDS.OPERATIONAL_MODELS, isInstructorOnly: false },
  { pattern: /market\s*(analysis|overview|size|growth)/i, sectionId: SECTION_IDS.MARKET_ANALYSIS, isInstructorOnly: false },
  { pattern: /(ccd|caf?e?\s*coffee\s*day)\s*(expands?|growth|expansion)/i, sectionId: SECTION_IDS.CCD_EXPANSION, isInstructorOnly: false },
  { pattern: /(history|founding|background|origins?)/i, sectionId: SECTION_IDS.COMPANY_HISTORY, isInstructorOnly: false },
  { pattern: /(industry|coffee\s*market|specialty\s*coffee)/i, sectionId: SECTION_IDS.INDUSTRY_OVERVIEW, isInstructorOnly: false },
];

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

/**
 * Parse raw case document text into structured sections.
 *
 * @param rawText — The full text of the case document.
 * @param caseId  — Stable identifier for the case.
 * @returns A ParseResult with sections and exhibit references.
 */
export function parseCaseDocument(rawText: string, caseId: string): ParseResult {
  const title = extractTitle(rawText);
  const sections = extractSections(rawText, caseId);
  const exhibitReferences = extractExhibitReferences(rawText);

  return { title, sections, exhibitReferences };
}

/**
 * Extract the case title from the document text.
 * Looks for the first line that resembles a title (uppercase, contains key terms).
 */
export function extractTitle(rawText: string): string {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

  // Heuristic: first non-empty line that's relatively short and looks like a title
  for (const line of lines) {
    if (line.length < 200 && (line.includes("Coffee") || line.includes("Case") || line.includes(":"))) {
      return line;
    }
  }

  // Fallback: first meaningful line
  return lines[0] || "Untitled Case";
}

/**
 * Split the document text into sections based on boundary markers.
 */
export function extractSections(rawText: string, caseId: string): RawSection[] {
  const sections: RawSection[] = [];
  let currentPosition = 0;

  // Find all boundary positions
  const boundaries: { position: number; sectionId: SectionId; isInstructorOnly: boolean }[] = [];

  for (const { pattern, sectionId, isInstructorOnly } of SECTION_BOUNDARIES) {
    const match = rawText.match(pattern);
    if (match && match.index !== undefined) {
      boundaries.push({
        position: match.index,
        sectionId,
        isInstructorOnly,
      });
    }
  }

  // Sort by position
  boundaries.sort((a, b) => a.position - b.position);

  // If no boundaries found, treat entire text as introduction
  if (boundaries.length === 0) {
    sections.push({
      id: `${caseId}-${SECTION_IDS.INTRODUCTION}`,
      title: "Introduction",
      text: rawText.trim(),
      startPage: 1,
      endPage: estimatePageCount(rawText),
      isInstructorOnly: false,
    });
    return sections;
  }

  // Create sections from boundaries
  for (let i = 0; i < boundaries.length; i++) {
    const boundary = boundaries[i];
    const nextBoundary = boundaries[i + 1];

    const sectionText = rawText.slice(
      boundary.position,
      nextBoundary ? nextBoundary.position : rawText.length
    );

    sections.push({
      id: `${caseId}-${boundary.sectionId}`,
      title: sectionIdToTitle(boundary.sectionId),
      text: sectionText.trim(),
      startPage: estimatePageFromPosition(rawText, boundary.position),
      endPage: nextBoundary
        ? estimatePageFromPosition(rawText, nextBoundary.position) - 1
        : estimatePageCount(rawText),
      isInstructorOnly: boundary.isInstructorOnly,
    });
  }

  return sections;
}

/**
 * Extract exhibit references from the document text.
 */
export function extractExhibitReferences(rawText: string): { exhibitNumber: number; title: string; page: number }[] {
  const references: { exhibitNumber: number; title: string; page: number }[] = [];
  const exhibitPattern = /Exhibit\s+(\d+)[\s:]+([^\n]+)/gi;
  let match;

  while ((match = exhibitPattern.exec(rawText)) !== null) {
    references.push({
      exhibitNumber: parseInt(match[1], 10),
      title: match[2].trim(),
      page: estimatePageFromPosition(rawText, match.index),
    });
  }

  return references;
}

// ---------------------------------------------------------------------------
// Page Estimation Helpers
// ---------------------------------------------------------------------------

/**
 * Estimate the total page count from text length.
 * Assumes ~300 words per page for a typical case document.
 */
function estimatePageCount(text: string): number {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 300));
}

/**
 * Estimate which page a text position falls on.
 */
function estimatePageFromPosition(fullText: string, position: number): number {
  const textUpToPosition = fullText.slice(0, position);
  const wordCount = textUpToPosition.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 300));
}

/**
 * Convert a section ID to a human-readable title.
 */
function sectionIdToTitle(sectionId: SectionId): string {
  const titles: Record<SectionId, string> = {
    [SECTION_IDS.INTRODUCTION]: "Introduction",
    [SECTION_IDS.INDUSTRY_OVERVIEW]: "Industry Overview",
    [SECTION_IDS.COMPANY_HISTORY]: "Company History",
    [SECTION_IDS.CCD_EXPANSION]: "CCD Expansion",
    [SECTION_IDS.MARKET_ANALYSIS]: "Market Analysis",
    [SECTION_IDS.COMPETITIVE_LANDSCAPE]: "Competitive Landscape",
    [SECTION_IDS.STARBUCKS_ENTRY]: "Starbucks Entry",
    [SECTION_IDS.OPERATIONAL_MODELS]: "Operational Models",
    [SECTION_IDS.FINANCIAL_ANALYSIS]: "Financial Analysis",
    [SECTION_IDS.CUSTOMER_DEMOGRAPHICS]: "Customer Demographics",
    [SECTION_IDS.EXPANSION_STRATEGY]: "Expansion Strategy",
    [SECTION_IDS.LOOKING_AHEAD]: "Looking Ahead",
    [SECTION_IDS.EXHIBITS]: "Exhibits",
  };
  return titles[sectionId];
}

// ---------------------------------------------------------------------------
// Exhibit Parser
// ---------------------------------------------------------------------------

/**
 * Parse exhibit text into a structured Exhibit object.
 * Called after sections are extracted to process exhibit content.
 */
export function parseExhibit(
  exhibitNumber: number,
  rawText: string,
  exhibitTitle: string
): Partial<Exhibit> {
  const lines = rawText.split("\n").filter((l) => l.trim());

  // Detect type based on content patterns
  let type: Exhibit["type"] = "table";

  if (/photo|image|picture|illustration/i.test(rawText)) {
    type = "photo";
  } else if (/chart|graph|diagram|pyramid|pie/i.test(rawText)) {
    type = "chart";
  } else if (/\|.*\|/m.test(rawText) || /\t/.test(rawText)) {
    type = "table";
  }

  return {
    id: `exhibit-${exhibitNumber}`,
    exhibitNumber,
    title: exhibitTitle,
    type,
    description: extractExhibitDescription(rawText),
    caption: extractExhibitCaption(rawText, exhibitTitle),
  };
}

/**
 * Extract a description from exhibit text (first few lines).
 */
function extractExhibitDescription(rawText: string): string {
  const lines = rawText.split("\n").filter((l) => l.trim());
  // Take the first 3 non-empty lines as description
  return lines.slice(0, 3).join(" ").trim();
}

/**
 * Extract the caption from exhibit text.
 */
function extractExhibitCaption(rawText: string, exhibitTitle: string): string {
  // Look for "Source:" or "Note:" lines
  const sourceMatch = rawText.match(/(?:Source|Note)[:\s]+([^\n]+)/i);
  if (sourceMatch) {
    return `Exhibit: ${exhibitTitle}. ${sourceMatch[1].trim()}`;
  }
  return `Exhibit: ${exhibitTitle}`;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate that a ParseResult is complete and well-formed.
 */
export function validateParseResult(result: ParseResult): string[] {
  const errors: string[] = [];

  if (!result.title || result.title === "Untitled Case") {
    errors.push("Could not extract a meaningful case title.");
  }

  if (result.sections.length === 0) {
    errors.push("No sections were extracted from the document.");
  }

  for (const section of result.sections) {
    if (!section.text || section.text.trim().length < 50) {
      errors.push(`Section "${section.id}" has insufficient content (< 50 characters).`);
    }
    if (section.startPage > section.endPage) {
      errors.push(`Section "${section.id}" has invalid page range (${section.startPage}-${section.endPage}).`);
    }
  }

  return errors;
}
