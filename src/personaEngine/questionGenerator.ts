// ============================================================
// Persona Engine — Suggested Questions Generator
// ============================================================
// Auto-generates suggested starter questions for each persona
// based on the chunks they have access to. Questions are
// derived from the content and keywords of accessible chunks.
// ============================================================

import {
  PersonaProfile,
  CaseChunk,
  KnowledgeBase,
  SuggestedQuestion,
} from "./types";

// ------------------------------------------------------------------
// Question Templates by Content Type
// ------------------------------------------------------------------

interface QuestionTemplate {
  /** The question template with {topic} placeholder. */
  template: string;
  /** Which source sections this template applies to. */
  applicableSections: string[];
  /** Keywords that trigger this template. */
  triggerKeywords: string[];
}

const QUESTION_TEMPLATES: QuestionTemplate[] = [
  // Background / History
  {
    template: "What inspired you to start {topic}?",
    applicableSections: ["Background", "History", "Origins", "Introduction"],
    triggerKeywords: ["found", "start", "begin", "origin", "inspire", "history"],
  },
  {
    template: "Can you tell me about the history of {topic}?",
    applicableSections: ["Background", "History", "Origins", "Introduction"],
    triggerKeywords: ["history", "past", "background", "story"],
  },
  {
    template: "How did {topic} begin?",
    applicableSections: ["Background", "History", "Origins"],
    triggerKeywords: ["begin", "start", "founded", "established"],
  },

  // Strategy / Competitive
  {
    template: "What's your strategy for {topic}?",
    applicableSections: ["Strategy", "Competition", "Market", "Analysis"],
    triggerKeywords: ["strategy", "plan", "approach", "competitive"],
  },
  {
    template: "How do you respond to {topic}?",
    applicableSections: ["Competition", "Market", "Strategy"],
    triggerKeywords: ["competitor", "competition", "starbucks", "challenge"],
  },
  {
    template: "What's your competitive advantage in {topic}?",
    applicableSections: ["Competition", "Strategy", "Market"],
    triggerKeywords: ["advantage", "competitive", "edge", "differentiate"],
  },

  // Financial / Operations
  {
    template: "How does {topic} work from a financial perspective?",
    applicableSections: ["Financials", "Operations", "Economics"],
    triggerKeywords: ["cost", "revenue", "profit", "margin", "financial"],
  },
  {
    template: "What's the economics of {topic}?",
    applicableSections: ["Financials", "Operations", "Economics"],
    triggerKeywords: ["economics", "cost", "profit", "margin", "unit"],
  },
  {
    template: "How do you keep costs down with {topic}?",
    applicableSections: ["Operations", "Financials", "Supply Chain"],
    triggerKeywords: ["cost", "efficiency", "lean", "reduce"],
  },

  // Operations / Supply Chain
  {
    template: "How does {topic} give you an advantage?",
    applicableSections: ["Operations", "Supply Chain", "Vertical Integration"],
    triggerKeywords: ["integration", "supply", "chain", "vertical", "advantage"],
  },
  {
    template: "Can you explain how {topic} works?",
    applicableSections: ["Operations", "Supply Chain", "Process"],
    triggerKeywords: ["process", "how", "explain", "work", "operate"],
  },

  // Market / Growth
  {
    template: "What are your plans for {topic}?",
    applicableSections: ["Growth", "Expansion", "Market", "Future"],
    triggerKeywords: ["growth", "expand", "plan", "future", "market"],
  },
  {
    template: "How do you see {topic} evolving?",
    applicableSections: ["Market", "Future", "Trends", "Growth"],
    triggerKeywords: ["future", "trend", "evolve", "change", "grow"],
  },

  // Leadership / Personal
  {
    template: "What's your leadership philosophy regarding {topic}?",
    applicableSections: ["Leadership", "Management", "Culture"],
    triggerKeywords: ["leadership", "manage", "culture", "philosophy"],
  },
  {
    template: "How do you approach {topic} as a leader?",
    applicableSections: ["Leadership", "Management", "Culture"],
    triggerKeywords: ["leader", "approach", "decide", "decision"],
  },

  // General fallback
  {
    template: "What can you tell me about {topic}?",
    applicableSections: [],
    triggerKeywords: [],
  },
];

// ------------------------------------------------------------------
// Topic Extraction
// ------------------------------------------------------------------

/**
 * Extract key topics from a chunk's keywords and text.
 */
function extractTopics(chunk: CaseChunk): string[] {
  const topics = new Set<string>();

  // Use pre-extracted keywords
  for (const keyword of chunk.keywords) {
    if (keyword.length > 2) {
      topics.add(keyword);
    }
  }

  // Extract noun phrases from section name
  const sectionWords = chunk.sourceSection.split(/[\s_-]+/);
  for (const word of sectionWords) {
    if (word.length > 2) {
      topics.add(word.toLowerCase());
    }
  }

  return [...topics];
}

/**
 * Match a topic to the best question template.
 */
function matchTemplate(
  topic: string,
  chunk: CaseChunk
): string | null {
  const topicLower = topic.toLowerCase();
  const sectionLower = chunk.sourceSection.toLowerCase();

  // Try section-specific templates first
  for (const template of QUESTION_TEMPLATES) {
    if (
      template.applicableSections.length > 0 &&
      template.applicableSections.some((s) =>
        sectionLower.includes(s.toLowerCase())
      )
    ) {
      // Check if keywords also match
      if (
        template.triggerKeywords.length === 0 ||
        template.triggerKeywords.some((k) => topicLower.includes(k))
      ) {
        return template.template.replace("{topic}", topic);
      }
    }
  }

  // Try keyword-matched templates
  for (const template of QUESTION_TEMPLATES) {
    if (
      template.triggerKeywords.length > 0 &&
      template.triggerKeywords.some((k) => topicLower.includes(k))
    ) {
      return template.template.replace("{topic}", topic);
    }
  }

  // Fallback
  return QUESTION_TEMPLATES[QUESTION_TEMPLATES.length - 1].template.replace(
    "{topic}",
    topic
  );
}

// ------------------------------------------------------------------
// Question Deduplication
// ------------------------------------------------------------------

/**
 * Simple similarity check to avoid near-duplicate questions.
 */
function questionsAreSimilar(q1: string, q2: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^\w\s]/g, "").trim();

  const n1 = normalize(q1);
  const n2 = normalize(q2);

  if (n1 === n2) return true;

  // Check if one contains the other (with small tolerance)
  if (n1.length > 10 && n2.length > 10) {
    const shorter = n1.length < n2.length ? n1 : n2;
    const longer = n1.length < n2.length ? n2 : n1;
    if (longer.includes(shorter)) return true;
  }

  // Token overlap check
  const tokens1 = new Set(n1.split(/\s+/));
  const tokens2 = new Set(n2.split(/\s+/));
  const overlap = [...tokens1].filter((t) => tokens2.has(t)).length;
  const maxTokens = Math.max(tokens1.size, tokens2.size);

  return overlap / maxTokens > 0.7;
}

// ------------------------------------------------------------------
// Main Generator
// ------------------------------------------------------------------

/**
 * Generate suggested starter questions for a persona.
 *
 * Questions are derived from the chunks the persona has access to,
 * ensuring they only ask about information the persona actually knows.
 */
export function generateSuggestedQuestions(
  persona: PersonaProfile,
  knowledgeBase: KnowledgeBase,
  maxQuestions: number = 5
): SuggestedQuestion[] {
  // Get chunks this persona can access
  const accessibleChunks = knowledgeBase.chunks.filter(
    (chunk) =>
      chunk.visibility === "student" &&
      persona.accessibleChunkIds.includes(chunk.id) &&
      chunk.characterIds.includes(persona.id)
  );

  if (accessibleChunks.length === 0) {
    return [];
  }

  // Generate candidate questions from each chunk
  const candidates: Array<{
    question: string;
    chunkId: string;
    chunkSection: string;
  }> = [];

  for (const chunk of accessibleChunks) {
    const topics = extractTopics(chunk);

    for (const topic of topics) {
      const question = matchTemplate(topic, chunk);
      if (question) {
        candidates.push({
          question,
          chunkId: chunk.id,
          chunkSection: chunk.sourceSection,
        });
      }
    }
  }

  // Deduplicate
  const unique: typeof candidates = [];
  for (const candidate of candidates) {
    const isDuplicate = unique.some((u) =>
      questionsAreSimilar(u.question, candidate.question)
    );
    if (!isDuplicate) {
      unique.push(candidate);
    }
  }

  // Prioritize by diversity of source sections
  const sectionCounts = new Map<string, number>();
  const sorted = unique.sort((a, b) => {
    const countA = sectionCounts.get(a.chunkSection) ?? 0;
    const countB = sectionCounts.get(b.chunkSection) ?? 0;
    return countA - countB;
  });

  for (const item of sorted) {
    sectionCounts.set(
      item.chunkSection,
      (sectionCounts.get(item.chunkSection) ?? 0) + 1
    );
  }

  // Take top N
  const selected = sorted.slice(0, maxQuestions);

  // Build result with chunk ID mapping
  const chunkIdMap = new Map<string, Set<string>>();
  for (const item of selected) {
    if (!chunkIdMap.has(item.question)) {
      chunkIdMap.set(item.question, new Set());
    }
    chunkIdMap.get(item.question)!.add(item.chunkId);
  }

  return [...chunkIdMap.entries()].map(([question, chunkIds]) => ({
    question,
    relevantChunkIds: [...chunkIds],
  }));
}

/**
 * Generate a default set of questions when no knowledge base is available.
 */
export function getDefaultQuestions(persona: PersonaProfile): SuggestedQuestion[] {
  return [
    {
      question: `What can you tell me about ${persona.company}?`,
      relevantChunkIds: [],
    },
    {
      question: `What's your role at ${persona.company}?`,
      relevantChunkIds: [],
    },
    {
      question: `What challenges is ${persona.company} facing?`,
      relevantChunkIds: [],
    },
    {
      question: `What's your vision for the company?`,
      relevantChunkIds: [],
    },
    {
      question: `How do you see the competitive landscape?`,
      relevantChunkIds: [],
    },
  ];
}
