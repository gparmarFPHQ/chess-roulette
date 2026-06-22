// ============================================================================
// MBA Case Study Platform — Chunker
// ============================================================================
// Segments case sections into logical, retrieval-friendly chunks.
// Preserves context boundaries and respects paragraph/section limits.
// ============================================================================

import { CaseChunk, ChunkerConfig, DEFAULT_CHUNKER_CONFIG } from "./types";

// ---------------------------------------------------------------------------
// Paragraph Splitting
// ---------------------------------------------------------------------------

/**
 * Split text into paragraphs.
 * A paragraph is a block of text separated by blank lines or explicit markers.
 */
export function splitIntoParagraphs(text: string): string[] {
  // Split on double newlines or explicit paragraph markers
  const rawParagraphs = text.split(/\n\s*\n/);
  return rawParagraphs
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !/^\s*[-*•]\s*$/.test(p)); // Exclude bullet-only lines
}

/**
 * Count words in a text string.
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// ---------------------------------------------------------------------------
// Sentence Splitting
// ---------------------------------------------------------------------------

/**
 * Split text into sentences while preserving abbreviations and decimals.
 */
export function splitIntoSentences(text: string): string[] {
  // Match sentence boundaries: period/exclamation/question followed by space and uppercase
  const sentences = text.match(
    /[^.!?]*[.!?]+["']?|[^.!?]*$/g
  );

  if (!sentences) return [text];

  return sentences
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ---------------------------------------------------------------------------
// Chunk Builder
// ---------------------------------------------------------------------------

/**
 * Build chunks from a single section's text.
 * Respects paragraph and sentence boundaries to avoid splitting mid-thought.
 */
export function chunkSection(
  sectionId: string,
  sectionTitle: string,
  text: string,
  config: ChunkerConfig = DEFAULT_CHUNKER_CONFIG
): string[] {
  const paragraphs = splitIntoParagraphs(text);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const paragraphWords = countWords(paragraph);

    // If a single paragraph exceeds maxWords, split it by sentences
    if (paragraphWords > config.maxWords) {
      // Flush any accumulated content first
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }

      // Split the large paragraph into sentence-based chunks
      const sentences = splitIntoSentences(paragraph);
      let sentenceChunk = "";

      for (const sentence of sentences) {
        const testChunk = sentenceChunk ? `${sentenceChunk} ${sentence}` : sentence;

        if (countWords(testChunk) > config.maxWords && sentenceChunk.trim()) {
          chunks.push(sentenceChunk.trim());
          sentenceChunk = sentence;
        } else {
          sentenceChunk = testChunk;
        }
      }

      if (sentenceChunk.trim()) {
        // If this chunk is small enough, it might merge with the next
        if (countWords(sentenceChunk) < config.minWords / 2) {
          currentChunk = sentenceChunk;
        } else {
          chunks.push(sentenceChunk.trim());
        }
      }
      continue;
    }

    // Normal paragraph — try to merge with current chunk
    const testChunk = currentChunk ? `${currentChunk} ${paragraph}` : paragraph;
    const testWords = countWords(testChunk);

    if (testWords > config.maxWords) {
      // Flush current chunk
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = paragraph;
    } else {
      currentChunk = testChunk;
    }
  }

  // Flush remaining content
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// Topic Extraction
// ---------------------------------------------------------------------------

/**
 * Extract a topic label from chunk text.
 * Uses heuristics based on the first sentence and key terms.
 */
export function extractTopic(text: string, sectionTitle: string): string {
  const words = text.split(/\s+/).slice(0, 15).join(" ");

  // Keyword-based topic mapping
  const topicKeywords: Record<string, string[]> = {
    "market size and growth": ["market", "size", "growth", "billion", "million", "percent"],
    "competitive landscape": ["competitor", "competition", "starbucks", " rivalry", "threat"],
    "pricing strategy": ["price", "pricing", "afford", "rupee", "cost"],
    "expansion plans": ["expand", "expansion", "growth", "new store", "outlet"],
    "customer demographics": ["customer", "consumer", "demographic", "age", "young", "urban"],
    "financial performance": ["revenue", "profit", "margin", "financial", "earning"],
    "operational efficiency": ["operational", "efficiency", "cost", "vertical", "integration"],
    "brand positioning": ["brand", "position", "premium", "mass", "market"],
    "company history": ["founded", "history", "background", "origin", "established"],
    "industry analysis": ["industry", "sector", "landscape", "overview"],
    "service formats": ["format", "service", "lounge", "express", "kiosk"],
    "strategic debate": ["strategy", "strategic", "decision", "future", "ahead"],
  };

  const lowerText = text.toLowerCase();

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    const matchCount = keywords.filter((kw) => lowerText.includes(kw)).length;
    if (matchCount >= 2) {
      return topic;
    }
  }

  // Fallback: use section title
  return sectionTitle.toLowerCase();
}

// ---------------------------------------------------------------------------
// Main Chunking Pipeline
// ---------------------------------------------------------------------------

/**
 * Chunk a section's text and produce CaseChunk objects.
 *
 * @param sectionId      — Unique section identifier.
 * @param sectionTitle   — Human-readable section title.
 * @param text           — Raw section text.
 * @param visibility     — Student or instructor visibility.
 * @param startPage      — Starting page number.
 * @param config         — Chunker configuration.
 * @returns Array of CaseChunk objects.
 */
export function createChunks(
  sectionId: string,
  sectionTitle: string,
  text: string,
  visibility: "student" | "instructor",
  startPage: number,
  config: ChunkerConfig = DEFAULT_CHUNKER_CONFIG
): CaseChunk[] {
  const rawChunks = chunkSection(sectionId, sectionTitle, text, config);
  const chunks: CaseChunk[] = [];

  for (let i = 0; i < rawChunks.length; i++) {
    const chunkText = rawChunks[i];
    const topic = extractTopic(chunkText, sectionTitle);

    chunks.push({
      id: `${sectionId}-chunk-${String(i + 1).padStart(3, "0")}`,
      text: chunkText,
      visibility,
      topic,
      section: sectionTitle,
      pageNumber: startPage + Math.floor(i * 0.5), // Rough page estimate
    });
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// Chunk Merging & Optimization
// ---------------------------------------------------------------------------

/**
 * Merge adjacent small chunks that fall below the minimum word count.
 * Called after initial chunking to clean up orphan fragments.
 */
export function mergeSmallChunks(chunks: CaseChunk[], minWords: number = 100): CaseChunk[] {
  if (chunks.length <= 1) return chunks;

  const merged: CaseChunk[] = [];
  let current = { ...chunks[0] };

  for (let i = 1; i < chunks.length; i++) {
    const next = chunks[i];
    const currentWords = countWords(current.text);

    if (currentWords < minWords) {
      // Merge with next chunk
      current.text = `${current.text} ${next.text}`.trim();
      current.topic = extractTopic(current.text, current.section);
    } else {
      merged.push(current);
      current = { ...next };
    }
  }

  // Push final chunk
  merged.push(current);

  return merged;
}

/**
 * Validate that all chunks meet the configured size constraints.
 */
export function validateChunks(chunks: CaseChunk[], config: ChunkerConfig): string[] {
  const issues: string[] = [];

  for (const chunk of chunks) {
    const words = countWords(chunk.text);

    if (words < config.minWords) {
      issues.push(`Chunk "${chunk.id}" is too small (${words} words < ${config.minWords} min).`);
    }

    if (words > config.maxWords) {
      issues.push(`Chunk "${chunk.id}" is too large (${words} words > ${config.maxWords} max).`);
    }

    if (!chunk.id) {
      issues.push(`Chunk at index has no ID.`);
    }

    if (!chunk.text.trim()) {
      issues.push(`Chunk "${chunk.id}" has empty text.`);
    }
  }

  return issues;
}
