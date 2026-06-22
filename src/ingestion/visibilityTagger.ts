// ============================================================================
// MBA Case Study Platform — Visibility Tagger
// ============================================================================
// Tags each chunk as student-facing or instructor-only.
// Enforces information boundaries at the data layer.
// ============================================================================

import { CaseChunk, AttributionMode } from "./types";

// ---------------------------------------------------------------------------
// Instructor-Only Patterns
// ---------------------------------------------------------------------------

/**
 * Text patterns that indicate instructor-only content.
 * These are discussion questions, teaching notes, and strategic frameworks
 * that should not be visible to students during case discussions.
 */
const INSTRUCTOR_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /(?i)looking\s*ahead/, reason: "Looking Ahead section" },
  { pattern: /(?i)discussion\s*question/, reason: "Discussion question" },
  { pattern: /(?i)teaching\s*note/, reason: "Teaching note" },
  { pattern: /(?i)case\s*teaching\s*note/, reason: "Case teaching note" },
  { pattern: /(?i)learning\s*objective/, reason: "Learning objective" },
  { pattern: /(?i)suggested\s*answer/, reason: "Suggested answer" },
  { pattern: /(?i)recommended\s*response/, reason: "Recommended response" },
  { pattern: /(?i)instructor\s*(only|guide|notes?)/, reason: "Instructor content" },
  { pattern: /(?i)what\s+should\s+(siddhartha|ccd|the\s*company)\s+(do|consider)/, reason: "Strategic debate question" },
  { pattern: /(?i)how\s+should\s+(siddhartha|ccd|management)\s+(respond|react|prepare)/, reason: "Strategic debate question" },
  { pattern: /(?i)what\s+are\s+the\s+(key|main|critical)\s+(issues?|challenges?|factors?)/, reason: "Discussion framework" },
  { pattern: /(?i)what\s+would\s+you\s+recommend/, reason: "Student prompt (instructor context)" },
  { pattern: /(?i)evaluate\s+(the|ccd|siddhartha)/, reason: "Evaluation prompt" },
  { pattern: /(?i)analyze\s+(the|ccd|siddhartha)/, reason: "Analysis prompt" },
  { pattern: /(?i)debate\s*(question|topic|issue)/, reason: "Debate prompt" },
  { pattern: /(?i)strategic\s*consideration/, reason: "Strategic consideration" },
];

/**
 * Section names that are always instructor-only.
 */
const INSTRUCTOR_SECTIONS: string[] = [
  "Looking Ahead",
  "Teaching Note",
  "Discussion Questions",
  "Instructor Guide",
  "Learning Objectives",
  "Suggested Answers",
  "Case Analysis Guide",
];

// ---------------------------------------------------------------------------
// Attribution Mode Detection
// ---------------------------------------------------------------------------

/**
 * Determine the attribution mode for a chunk based on its content.
 */
export function detectAttributionMode(chunk: CaseChunk): AttributionMode {
  const text = chunk.text.toLowerCase();

  // Check for instructor content first
  if (isInstructorContent(chunk)) {
    return "instructor";
  }

  // Check for exhibit references
  if (/exhibit\s*\d|table\s*\d|figure\s*\d|chart\s*\d/i.test(text)) {
    return "exhibit";
  }

  // Check for competitor perspective
  if (/sushant\s*dash|starbucks\s*(perspective|view|approach)/i.test(text)) {
    return "competitor";
  }

  // Check for expert commentary
  if (/harish\s*bijoor|industry\s*expert|consultant|external\s*analyst/i.test(text)) {
    return "expert";
  }

  // Check for character-specific content
  const characterNames = [
    "siddhartha", "venu\s*madhav", "ramakrishnan", "jayaraj\s*hubli",
  ];

  for (const name of characterNames) {
    if (new RegExp(name, "i").test(text)) {
      // Check if it's a quote or perspective
      if (/said|stated|noted|explained|argued|believed|thought/i.test(text)) {
        return "character";
      }
    }
  }

  // Default to narrator
  return "narrator";
}

// ---------------------------------------------------------------------------
// Instructor Content Detection
// ---------------------------------------------------------------------------

/**
 * Check if a chunk contains instructor-only content.
 *
 * @param chunk — The chunk to check.
 * @returns Object with `isInstructor` flag and optional `reason`.
 */
export function isInstructorContent(
  chunk: CaseChunk
): { isInstructor: boolean; reason?: string } {
  // Check section name
  if (INSTRUCTOR_SECTIONS.includes(chunk.section)) {
    return { isInstructor: true, reason: `Section "${chunk.section}" is instructor-only` };
  }

  // Check text patterns
  for (const { pattern, reason } of INSTRUCTOR_PATTERNS) {
    if (pattern.test(chunk.text)) {
      return { isInstructor: true, reason };
    }
  }

  return { isInstructor: false };
}

// ---------------------------------------------------------------------------
// Tagging Pipeline
// ---------------------------------------------------------------------------

/**
 * Tag all chunks with visibility and attribution mode.
 *
 * @param chunks — Array of chunks to tag.
 * @returns The same array with visibility and attributionMode set.
 */
export function tagChunks(chunks: CaseChunk[]): CaseChunk[] {
  return chunks.map((chunk) => {
    const { isInstructor, reason } = isInstructorContent(chunk);
    const attributionMode = detectAttributionMode(chunk);

    return {
      ...chunk,
      visibility: isInstructor ? "instructor" : chunk.visibility,
      attributionMode,
    };
  });
}

/**
 * Tag a single chunk and return the updated version.
 */
export function tagChunk(chunk: CaseChunk): CaseChunk {
  const { isInstructor } = isInstructorContent(chunk);
  const attributionMode = detectAttributionMode(chunk);

  return {
    ...chunk,
    visibility: isInstructor ? "instructor" : chunk.visibility,
    attributionMode,
  };
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

/**
 * Filter chunks by visibility level.
 */
export function filterByVisibility(
  chunks: CaseChunk[],
  visibility: "student" | "instructor"
): CaseChunk[] {
  return chunks.filter((chunk) => chunk.visibility === visibility);
}

/**
 * Get only student-facing chunks.
 */
export function getStudentChunks(chunks: CaseChunk[]): CaseChunk[] {
  return filterByVisibility(chunks, "student");
}

/**
 * Get only instructor-only chunks.
 */
export function getInstructorChunks(chunks: CaseChunk[]): CaseChunk[] {
  return filterByVisibility(chunks, "instructor");
}

/**
 * Get chunks by attribution mode.
 */
export function filterByAttributionMode(
  chunks: CaseChunk[],
  mode: AttributionMode
): CaseChunk[] {
  return chunks.filter((chunk) => chunk.attributionMode === mode);
}

// ---------------------------------------------------------------------------
// Visibility Statistics
// ---------------------------------------------------------------------------

/**
 * Compute visibility statistics for a set of chunks.
 */
export function computeVisibilityStats(chunks: CaseChunk[]): {
  total: number;
  student: number;
  instructor: number;
  studentPercentage: number;
  instructorPercentage: number;
  byAttributionMode: Record<AttributionMode, number>;
} {
  const total = chunks.length;
  const student = getStudentChunks(chunks).length;
  const instructor = getInstructorChunks(chunks).length;

  const byAttributionMode: Record<string, number> = {};
  for (const chunk of chunks) {
    const mode = chunk.attributionMode || "narrator";
    byAttributionMode[mode] = (byAttributionMode[mode] || 0) + 1;
  }

  return {
    total,
    student,
    instructor,
    studentPercentage: total > 0 ? Math.round((student / total) * 100) : 0,
    instructorPercentage: total > 0 ? Math.round((instructor / total) * 100) : 0,
    byAttributionMode: byAttributionMode as Record<AttributionMode, number>,
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate visibility tagging completeness.
 */
export function validateVisibilityTagging(chunks: CaseChunk[]): string[] {
  const issues: string[] = [];

  for (const chunk of chunks) {
    if (!chunk.visibility) {
      issues.push(`Chunk "${chunk.id}" has no visibility tag.`);
    }

    if (chunk.visibility !== "student" && chunk.visibility !== "instructor") {
      issues.push(`Chunk "${chunk.id}" has invalid visibility: "${chunk.visibility}".`);
    }

    // Check for instructor content that wasn't tagged
    const { isInstructor } = isInstructorContent(chunk);
    if (isInstructor && chunk.visibility === "student") {
      issues.push(
        `Chunk "${chunk.id}" appears to contain instructor content but is tagged as student-facing.`
      );
    }
  }

  return issues;
}
