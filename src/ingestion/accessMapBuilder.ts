// ============================================================================
// MBA Case Study Platform — Character Access Map Builder
// ============================================================================
// Determines which chunks each character can plausibly access based on
// their role, company affiliation, and the information presented in the case.
// ============================================================================

import {
  CaseChunk,
  CharacterAccessMap,
  CharacterKnowledgeDomain,
  AttributionMode,
} from "./types";

// ---------------------------------------------------------------------------
// Character Knowledge Domains
// ---------------------------------------------------------------------------

/**
 * Define what each character in the Coffee Wars case can plausibly know.
 * These domains are derived from the case text and each character's role.
 */
export const CHARACTER_KNOWLEDGE_DOMAINS: CharacterKnowledgeDomain[] = [
  {
    characterId: "siddhartha",
    topics: [
      "company history",
      "expansion plans",
      "market size and growth",
      "competitive landscape",
      "pricing strategy",
      "financial performance",
      "operational efficiency",
      "brand positioning",
      "service formats",
      "customer demographics",
      "strategic debate",
    ],
    sections: [
      "Introduction",
      "Industry Overview",
      "Company History",
      "CCD Expansion",
      "Market Analysis",
      "Competitive Landscape",
      "Starbucks Entry",
      "Operational Models",
      "Financial Analysis",
      "Customer Demographics",
      "Expansion Strategy",
    ],
    attributionModes: ["narrator", "character", "exhibit", "external"],
    neverAccessibleChunkIds: [],
  },
  {
    characterId: "madhav",
    topics: [
      "competitive landscape",
      "market size and growth",
      "expansion plans",
      "strategic debate",
      "brand positioning",
      "customer demographics",
      "service formats",
    ],
    sections: [
      "Introduction",
      "Industry Overview",
      "CCD Expansion",
      "Market Analysis",
      "Competitive Landscape",
      "Starbucks Entry",
      "Operational Models",
      "Expansion Strategy",
    ],
    attributionModes: ["narrator", "character", "exhibit"],
    neverAccessibleChunkIds: [],
  },
  {
    characterId: "ramakrishnan",
    topics: [
      "pricing strategy",
      "customer demographics",
      "brand positioning",
      "service formats",
      "market size and growth",
      "competitive landscape",
    ],
    sections: [
      "Introduction",
      "Market Analysis",
      "Competitive Landscape",
      "Operational Models",
      "Customer Demographics",
      "Expansion Strategy",
    ],
    attributionModes: ["narrator", "character", "exhibit"],
    neverAccessibleChunkIds: [],
  },
  {
    characterId: "hubli",
    topics: [
      "financial performance",
      "operational efficiency",
      "pricing strategy",
      "service formats",
      "expansion plans",
    ],
    sections: [
      "Introduction",
      "CCD Expansion",
      "Operational Models",
      "Financial Analysis",
      "Expansion Strategy",
    ],
    attributionModes: ["narrator", "character", "exhibit"],
    neverAccessibleChunkIds: [],
  },
  {
    characterId: "sushant-dash",
    topics: [
      "competitive landscape",
      "market size and growth",
      "brand positioning",
      "customer demographics",
    ],
    sections: [
      "Introduction",
      "Industry Overview",
      "Market Analysis",
      "Competitive Landscape",
      "Starbucks Entry",
    ],
    attributionModes: ["narrator", "competitor", "exhibit"],
    neverAccessibleChunkIds: [],
  },
  {
    characterId: "harish-bijoor",
    topics: [
      "industry analysis",
      "competitive landscape",
      "market size and growth",
      "brand positioning",
      "customer demographics",
    ],
    sections: [
      "Introduction",
      "Industry Overview",
      "Market Analysis",
      "Competitive Landscape",
    ],
    attributionModes: ["narrator", "expert", "exhibit"],
    neverAccessibleChunkIds: [],
  },
];

// ---------------------------------------------------------------------------
// Access Map Construction
// ---------------------------------------------------------------------------

/**
 * Build the access map for a single character.
 *
 * @param characterId — The character to build the map for.
 * @param chunks      — All chunks in the knowledge base.
 * @returns The character's access map.
 */
export function buildAccessMapForCharacter(
  characterId: string,
  chunks: CaseChunk[]
): { accessible: string[]; inaccessible: string[] } {
  const domain = CHARACTER_KNOWLEDGE_DOMAINS.find((d) => d.characterId === characterId);

  if (!domain) {
    return { accessible: [], inaccessible: chunks.map((c) => c.id) };
  }

  const accessible: string[] = [];
  const inaccessible: string[] = [];

  for (const chunk of chunks) {
    // Instructor-only content is never accessible to any character
    if (chunk.visibility === "instructor") {
      inaccessible.push(chunk.id);
      continue;
    }

    // Check explicit exceptions
    if (domain.neverAccessibleChunkIds?.includes(chunk.id)) {
      inaccessible.push(chunk.id);
      continue;
    }

    if (domain.alwaysAccessibleChunkIds?.includes(chunk.id)) {
      accessible.push(chunk.id);
      continue;
    }

    // Check attribution mode
    const attributionMode = chunk.attributionMode || "narrator";
    if (!domain.attributionModes.includes(attributionMode)) {
      inaccessible.push(chunk.id);
      continue;
    }

    // Check topic match
    const topicMatch = domain.topics.some(
      (t) => chunk.topic.toLowerCase().includes(t) || t.includes(chunk.topic.toLowerCase())
    );

    // Check section match
    const sectionMatch = domain.sections.some(
      (s) => chunk.section.toLowerCase().includes(s.toLowerCase()) ||
             s.toLowerCase().includes(chunk.section.toLowerCase())
    );

    // A chunk is accessible if it matches topic OR section
    if (topicMatch || sectionMatch) {
      accessible.push(chunk.id);
    } else {
      inaccessible.push(chunk.id);
    }
  }

  return { accessible, inaccessible };
}

/**
 * Build access maps for all characters.
 *
 * @param chunks — All chunks in the knowledge base.
 * @param characterProfiles — Character profiles with names and roles.
 * @returns Array of CharacterAccessMap objects.
 */
export function buildAllAccessMaps(
  chunks: CaseChunk[],
  characterProfiles: {
    characterId: string;
    characterName: string;
    role: string;
    personality: string;
  }[]
): CharacterAccessMap[] {
  return characterProfiles.map((profile) => {
    const { accessible, inaccessible } = buildAccessMapForCharacter(
      profile.characterId,
      chunks
    );

    return {
      characterId: profile.characterId,
      characterName: profile.characterName,
      role: profile.role,
      personality: profile.personality,
      accessibleChunkIds: accessible,
      inaccessibleChunkIds: inaccessible,
    };
  });
}

// ---------------------------------------------------------------------------
// Access Validation
// ---------------------------------------------------------------------------

/**
 * Check if a character can access a specific chunk.
 */
export function canAccessChunk(
  accessMap: CharacterAccessMap,
  chunkId: string
): boolean {
  return accessMap.accessibleChunkIds.includes(chunkId);
}

/**
 * Get the chunks that a character can access, filtered from the full set.
 */
export function getAccessibleChunks(
  accessMap: CharacterAccessMap,
  allChunks: CaseChunk[]
): CaseChunk[] {
  return allChunks.filter((chunk) =>
    accessMap.accessibleChunkIds.includes(chunk.id)
  );
}

/**
 * Get chunks that are accessible to ALL characters (common knowledge).
 */
export function getCommonKnowledgeChunks(
  accessMaps: CharacterAccessMap[],
  allChunks: CaseChunk[]
): CaseChunk[] {
  if (accessMaps.length === 0) return [];

  const commonChunkIds = new Set(accessMaps[0].accessibleChunkIds);

  for (let i = 1; i < accessMaps.length; i++) {
    for (const id of commonChunkIds) {
      if (!accessMaps[i].accessibleChunkIds.includes(id)) {
        commonChunkIds.delete(id);
      }
    }
  }

  return allChunks.filter((chunk) => commonChunkIds.has(chunk.id));
}

// ---------------------------------------------------------------------------
// Access Map Statistics
// ---------------------------------------------------------------------------

/**
 * Compute access statistics for a character.
 */
export function computeAccessStats(accessMap: CharacterAccessMap, totalChunks: number): {
  characterId: string;
  characterName: string;
  totalChunks: number;
  accessibleCount: number;
  inaccessibleCount: number;
  accessPercentage: number;
} {
  return {
    characterId: accessMap.characterId,
    characterName: accessMap.characterName,
    totalChunks,
    accessibleCount: accessMap.accessibleChunkIds.length,
    inaccessibleCount: accessMap.inaccessibleChunkIds.length,
    accessPercentage: totalChunks > 0
      ? Math.round((accessMap.accessibleChunkIds.length / totalChunks) * 100)
      : 0,
  };
}

/**
 * Compute access statistics for all characters.
 */
export function computeAllAccessStats(
  accessMaps: CharacterAccessMap[],
  totalChunks: number
) {
  return accessMaps.map((map) => computeAccessStats(map, totalChunks));
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate access maps for completeness and consistency.
 */
export function validateAccessMaps(
  accessMaps: CharacterAccessMap[],
  allChunks: CaseChunk[]
): string[] {
  const issues: string[] = [];
  const allChunkIds = new Set(allChunks.map((c) => c.id));

  for (const map of accessMaps) {
    // Check for missing chunks (should be in either accessible or inaccessible)
    const coveredIds = new Set([
      ...map.accessibleChunkIds,
      ...map.inaccessibleChunkIds,
    ]);

    const uncovered = [...allChunkIds].filter((id) => !coveredIds.has(id));
    if (uncovered.length > 0) {
      issues.push(
        `Character "${map.characterName}" has ${uncovered.length} uncovered chunks.`
      );
    }

    // Check for duplicates
    const accessibleSet = new Set(map.accessibleChunkIds);
    const inaccessibleSet = new Set(map.inaccessibleChunkIds);
    const overlap = [...accessibleSet].filter((id) => inaccessibleSet.has(id));
    if (overlap.length > 0) {
      issues.push(
        `Character "${map.characterName}" has ${overlap.length} chunks in both accessible and inaccessible lists.`
      );
    }

    // Check for references to non-existent chunks
    const invalidAccessible = map.accessibleChunkIds.filter(
      (id) => !allChunkIds.has(id)
    );
    if (invalidAccessible.length > 0) {
      issues.push(
        `Character "${map.characterName}" references ${invalidAccessible.length} non-existent chunks as accessible.`
      );
    }

    // Instructor-only chunks should never be accessible
    const instructorChunks = allChunks.filter((c) => c.visibility === "instructor");
    const leakedInstructor = instructorChunks.filter((c) =>
      map.accessibleChunkIds.includes(c.id)
    );
    if (leakedInstructor.length > 0) {
      issues.push(
        `Character "${map.characterName}" has access to ${leakedInstructor.length} instructor-only chunks.`
      );
    }
  }

  return issues;
}
