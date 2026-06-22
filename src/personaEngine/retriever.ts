// ============================================================
// Persona Engine — Context Retriever
// ============================================================
// Retrieves relevant context chunks from the knowledge base,
// enforcing visibility and character access filters BEFORE
// any scoring or ranking. Instructor-only chunks are NEVER
// eligible for retrieval, period.
// ============================================================

import {
  CaseChunk,
  KnowledgeBase,
  RetrievalResult,
  RetrievalOptions,
} from "./types";

// ------------------------------------------------------------------
// Defaults
// ------------------------------------------------------------------

const DEFAULT_MAX_CHUNKS = 5;
const DEFAULT_MIN_SCORE = 0;

// ------------------------------------------------------------------
// Tokenization & Keyword Extraction
// ------------------------------------------------------------------

/**
 * Simple tokenizer: lowercase, split on non-alphanumeric chars,
 * filter out very short tokens and common stop words.
 */
function tokenize(text: string): string[] {
  const stopWords = new Set([
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "above",
    "below", "between", "out", "off", "over", "under", "again",
    "further", "then", "once", "here", "there", "when", "where",
    "why", "how", "all", "both", "each", "few", "more", "most",
    "other", "some", "such", "no", "nor", "not", "only", "own",
    "same", "so", "than", "too", "very", "just", "because", "but",
    "and", "or", "if", "while", "about", "what", "which", "who",
    "whom", "this", "that", "these", "those", "i", "me", "my",
    "we", "our", "you", "your", "he", "him", "his", "it", "its",
    "she", "her", "they", "them", "their", "also", "up", "any",
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

/**
 * Extract unique keywords from a set of tokens.
 */
function extractKeywords(tokens: string[]): string[] {
  return [...new Set(tokens)];
}

// ------------------------------------------------------------------
// TF-IDF-Style Scoring
// ------------------------------------------------------------------

interface TermStats {
  /** Number of documents (chunks) containing this term. */
  df: number;
  /** Term frequency in a specific document. */
  tf: Map<string, number>;
}

/**
 * Build a simple inverted index and document frequency map for scoring.
 * This is computed on the candidate set (after filtering).
 */
function buildIndex(chunks: CaseChunk[]): {
  queryTokens: string[];
  df: Map<string, number>;
} {
  const df = new Map<string, number>();

  for (const chunk of chunks) {
    const chunkTokens = tokenize(chunk.text);
    const uniqueTokens = new Set(chunkTokens);

    for (const token of uniqueTokens) {
      df.set(token, (df.get(token) ?? 0) + 1);
    }
  }

  return { queryTokens: [], df };
}

/**
 * Score a chunk against a query using a BM25-inspired formula.
 *
 * Score = sum over query terms of:
 *   IDF(term) * (TF(term, doc) * (k1 + 1)) / (TF(term, doc) + k1)
 *
 * Where:
 *   IDF = log((N - df + 0.5) / (df + 0.5))
 *   k1 = 1.5 (term frequency saturation)
 */
function scoreChunk(
  chunk: CaseChunk,
  queryTokens: string[],
  df: Map<string, number>,
  totalChunks: number
): number {
  const k1 = 1.5;
  const chunkTokens = tokenize(chunk.text);
  const chunkKeywordSet = new Set(chunk.keywords.map((k) => k.toLowerCase()));
  const tf = new Map<string, number>();

  // Compute term frequency in this chunk
  for (const token of chunkTokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }

  let score = 0;

  for (const qToken of queryTokens) {
    const documentFrequency = df.get(qToken) ?? 0;

    // IDF: inverse document frequency
    const idf =
      documentFrequency > 0
        ? Math.log((totalChunks - documentFrequency + 0.5) / (documentFrequency + 0.5))
        : Math.log(totalChunks + 1); // term not in corpus at all — high IDF

    // TF saturation
    const termTf = tf.get(qToken) ?? 0;
    const tfScore = (termTf * (k1 + 1)) / (termTf + k1);

    score += idf * tfScore;

    // Bonus: if the query term matches a pre-extracted keyword
    if (chunkKeywordSet.has(qToken)) {
      score += idf * 0.5;
    }
  }

  return score;
}

// ------------------------------------------------------------------
// Normalization
// ------------------------------------------------------------------

/**
 * Normalize scores to 0-1 range using min-max normalization.
 */
function normalizeScores(scores: number[]): number[] {
  if (scores.length === 0) return [];

  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const range = max - min || 1;

  return scores.map((s) => (s - min) / range);
}

// ------------------------------------------------------------------
// Main Retrieval Function
// ------------------------------------------------------------------

/**
 * Retrieve relevant context chunks for a query, filtered by
 * visibility and character access.
 *
 * CRITICAL: Filtering happens BEFORE scoring. Instructor-only
 * chunks are never eligible for retrieval.
 */
export function retrieveContext(
  query: string,
  personaId: string,
  knowledgeBase: KnowledgeBase,
  options: RetrievalOptions = {}
): RetrievalResult {
  const maxChunks = options.maxChunks ?? DEFAULT_MAX_CHUNKS;
  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;

  const allChunks = knowledgeBase.chunks;
  const totalCandidates = allChunks.length;

  // --------------------------------------------------------------
  // STEP 1: Filter by visibility (instructor-only chunks excluded)
  // --------------------------------------------------------------
  const studentChunks = allChunks.filter(
    (chunk) => chunk.visibility === "student"
  );
  const filteredByVisibility = totalCandidates - studentChunks.length;

  // --------------------------------------------------------------
  // STEP 2: Filter by character access
  // --------------------------------------------------------------
  const accessibleChunks = studentChunks.filter((chunk) =>
    chunk.characterIds.includes(personaId)
  );
  const filteredByAccess = studentChunks.length - accessibleChunks.length;

  // --------------------------------------------------------------
  // STEP 3: Score remaining candidates
  // --------------------------------------------------------------
  if (accessibleChunks.length === 0) {
    return {
      chunks: [],
      scores: [],
      totalCandidates,
      filteredByVisibility,
      filteredByAccess,
    };
  }

  const queryTokens = extractKeywords(tokenize(query));
  const { df } = buildIndex(accessibleChunks);

  const scoredChunks = accessibleChunks.map((chunk) => ({
    chunk,
    score: scoreChunk(chunk, queryTokens, df, accessibleChunks.length),
  }));

  // --------------------------------------------------------------
  // STEP 4: Sort by score (descending) and take top-K
  // --------------------------------------------------------------
  scoredChunks.sort((a, b) => b.score - a.score);

  const rawScores = scoredChunks.map((sc) => sc.score);
  const normalizedScores = normalizeScores(rawScores);

  const topChunks = scoredChunks
    .slice(0, maxChunks)
    .filter((_, i) => normalizedScores[i] >= minScore);

  return {
    chunks: topChunks.map((sc) => sc.chunk),
    scores: topChunks.map((_, i) => normalizedScores[i]),
    totalCandidates,
    filteredByVisibility,
    filteredByAccess,
  };
}

/**
 * Validate that a retrieval result properly filtered instructor content.
 * Returns an error message if validation fails, or null if OK.
 */
export function validateRetrieval(result: RetrievalResult): string | null {
  for (const chunk of result.chunks) {
    if (chunk.visibility !== "student") {
      return `CRITICAL: Instructor-only chunk "${chunk.id}" was included in retrieval results.`;
    }
  }
  return null;
}
