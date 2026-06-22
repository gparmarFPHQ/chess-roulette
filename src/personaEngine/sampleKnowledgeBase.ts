// ============================================================
// Persona Engine — Sample Knowledge Base
// ============================================================
// A sample knowledge base based on the Café Coffee Day (CCD) case study.
// Used for testing and demonstration purposes.
// ============================================================

import { CaseChunk, KnowledgeBase, PersonaProfile } from "./types";

// ------------------------------------------------------------------
// Sample Chunks — Student-Visible
// ------------------------------------------------------------------

const STUDENT_CHUNKS: CaseChunk[] = [
  {
    id: "chunk-001",
    text: "Café Coffee Day (CCD) was founded in 1996 by V.G. Siddhartha, who grew up in a coffee-growing family in Coorg, Karnataka. Siddhartha's family had been growing coffee for generations, and he wanted to bring the Indian coffee experience to urban consumers across India.",
    visibility: "student",
    sourceSection: "Background",
    characterIds: ["siddhartha", "hubli"],
    keywords: ["founded", "1996", "siddhartha", "coorg", "karnataka", "coffee", "family", "grow"],
  },
  {
    id: "chunk-002",
    text: "By 2011, CCD had grown to over 1,100 outlets across India, making it the largest coffee chain in the country. The company operated through a mix of company-owned stores, franchises, and kiosks in malls, airports, and highways.",
    visibility: "student",
    sourceSection: "Company Overview",
    characterIds: ["siddhartha", "hubli", "investor"],
    keywords: ["outlets", "1100", "stores", "franchise", "kiosk", "mall", "airport", "largest", "chain"],
  },
  {
    id: "chunk-003",
    text: "CCD's key competitive advantage was its vertical integration. The company controlled the entire supply chain from coffee plantations to retail outlets. This included ownership of coffee estates in Coorg, processing facilities, and a vast distribution network. This vertical integration allowed CCD to maintain lower costs than competitors.",
    visibility: "student",
    sourceSection: "Operations",
    characterIds: ["siddhartha", "hubli"],
    keywords: ["vertical", "integration", "supply", "chain", "plantation", "cost", "advantage", "distribution"],
  },
  {
    id: "chunk-004",
    text: "Starbucks entered the Indian market in 1999 through a joint venture with Tata Global Beverages. Unlike CCD's mass-market approach, Starbucks positioned itself as a premium 'third place' experience. Starbucks stores were larger, more expensive, and focused on ambiance and premium pricing.",
    visibility: "student",
    sourceSection: "Competition",
    characterIds: ["siddhartha", "hubli", "investor"],
    keywords: ["starbucks", "india", "1999", "tata", "joint", "venture", "premium", "competition", "price"],
  },
  {
    id: "chunk-005",
    text: "CCD's average cup price was approximately ₹40-50, significantly lower than Starbucks' ₹150-200 per cup. This price advantage was central to CCD's strategy of making coffee accessible to the mass Indian market. Hubli, CCD's CFO, emphasized that cost control was essential to maintaining this pricing advantage.",
    visibility: "student",
    sourceSection: "Financials",
    characterIds: ["siddhartha", "hubli"],
    keywords: ["price", "cost", "40", "50", "150", "200", "pricing", "affordable", "mass", "market"],
  },
  {
    id: "chunk-006",
    text: "Siddhartha was known for his aggressive expansion strategy and visionary leadership. He spoke with confidence about CCD's potential to become a global brand. His approach was to think big and move fast, often making decisions quickly without extensive analysis.",
    visibility: "student",
    sourceSection: "Leadership",
    characterIds: ["siddhartha"],
    keywords: ["aggressive", "expansion", "visionary", "leadership", "confident", "global", "fast"],
  },
  {
    id: "chunk-007",
    text: "K.N. Hubli, CCD's CFO, was known for his analytical and cost-focused approach. He managed the company's finances with precision and was deeply involved in maintaining CCD's cost advantage. Hubli believed that sustainable growth required careful financial management and disciplined cost control.",
    visibility: "student",
    sourceSection: "Leadership",
    characterIds: ["hubli"],
    keywords: ["hubli", "cfo", "analytical", "cost", "financial", "management", "disciplined", "control"],
  },
  {
    id: "chunk-008",
    text: "CCD faced increasing financial pressure in 2014-2015. Many stores were underperforming, and the company was struggling with high debt levels. The rapid expansion had led to stores in suboptimal locations, and the rise of digital payment systems and changing consumer preferences challenged CCD's business model.",
    visibility: "student",
    sourceSection: "Challenges",
    characterIds: ["siddhartha", "hubli", "investor"],
    keywords: ["financial", "pressure", "debt", "underperforming", "expansion", "challenge", "2014", "2015"],
  },
  {
    id: "chunk-009",
    text: "CCD's unit economics showed that a typical café required approximately ₹25-30 lakhs in initial investment. The average store generated ₹80-100 lakhs in annual revenue with an EBITDA margin of 15-20%. However, performance varied significantly by location, with mall stores generally performing better than standalone outlets.",
    visibility: "student",
    sourceSection: "Financials",
    characterIds: ["hubli"],
    keywords: ["unit", "economics", "investment", "lakhs", "revenue", "ebitda", "margin", "store", "performance"],
  },
  {
    id: "chunk-010",
    text: "CCD's supply chain included over 6,000 acres of coffee plantations in Coorg, supplying approximately 40% of the company's coffee needs. The remaining 60% was sourced from other growers in Karnataka and Kerala. This partial self-sufficiency in coffee supply was a key differentiator from competitors like Starbucks.",
    visibility: "student",
    sourceSection: "Supply Chain",
    characterIds: ["siddhartha", "hubli"],
    keywords: ["supply", "chain", "plantation", "coorg", "acres", "source", "grower", "self-sufficient"],
  },
];

// ------------------------------------------------------------------
// Sample Chunks — Instructor-Only (MUST be filtered out)
// ------------------------------------------------------------------

const INSTRUCTOR_CHUNKS: CaseChunk[] = [
  {
    id: "chunk-100",
    text: "TEACHING NOTE: The key learning objective of this case is to understand the challenges of scaling a mass-market brand while maintaining cost advantages. Students should analyze whether CCD's vertical integration strategy was sustainable against premium competitors.",
    visibility: "instructor",
    sourceSection: "Teaching Notes",
    characterIds: [],
    keywords: ["teaching", "note", "learning", "objective", "analysis"],
  },
  {
    id: "chunk-101",
    text: "LOOKING AHEAD: Siddhartha was arrested in September 2016 on charges of forgery and criminal breach of trust. The company's financial troubles led to its eventual sale and restructuring. This information is for instructor context only — do not reveal to students.",
    visibility: "instructor",
    sourceSection: "Looking Ahead",
    characterIds: [],
    keywords: ["arrested", "2016", "forgery", "trust", "sale", "restructuring"],
  },
  {
    id: "chunk-102",
    text: "DISCUSSION GUIDE: Key questions to ask students: (1) Was CCD's pricing strategy sustainable? (2) How should CCD respond to Starbucks? (3) What role did leadership style play in CCD's trajectory? (4) Analyze the financial implications of rapid expansion.",
    visibility: "instructor",
    sourceSection: "Discussion Guide",
    characterIds: [],
    keywords: ["discussion", "guide", "question", "student", "sustainable"],
  },
  {
    id: "chunk-103",
    text: "INSTRUCTOR NOTE: CCD's debt-to-equity ratio exceeded 3:1 by 2015, indicating severe financial distress. The company had borrowed heavily to fund expansion, and many new stores failed to achieve break-even within the expected timeframe.",
    visibility: "instructor",
    sourceSection: "Instructor Notes",
    characterIds: [],
    keywords: ["debt", "equity", "ratio", "financial", "distress", "borrowed", "break-even"],
  },
];

// ------------------------------------------------------------------
// Sample Personas
// ------------------------------------------------------------------

export const SAMPLE_PERSONAS: PersonaProfile[] = [
  {
    id: "siddhartha",
    name: "V.G. Siddhartha",
    role: "Founder and Chairman",
    company: "Café Coffee Day",
    personality: {
      style: "visionary and aggressive",
      description:
        "You are a visionary, aggressive entrepreneur from a coffee-growing family. You speak with confidence and ambition. You're proud of CCD's vertical integration and market leadership. You think big and move fast.",
      speechPatterns: [
        "We're not just a coffee company — we're a movement.",
        "I've always believed in thinking big.",
        "CCD will be a global brand, I tell you.",
      ],
    },
    accessibleChunkIds: [
      "chunk-001", "chunk-002", "chunk-003", "chunk-004",
      "chunk-005", "chunk-006", "chunk-008", "chunk-010",
    ],
    avatar: "👨‍💼",
    bio: "Founder of India's largest coffee chain, from a coffee-growing family in Coorg.",
  },
  {
    id: "hubli",
    name: "K.N. Hubli",
    role: "Chief Financial Officer",
    company: "Café Coffee Day",
    personality: {
      style: "analytical and cost-focused",
      description:
        "You are analytical, detail-oriented, and deeply focused on cost control and financial discipline. You believe sustainable growth requires careful financial management. You speak with precision and data-driven confidence.",
      speechPatterns: [
        "The numbers tell a clear story.",
        "Cost control isn't optional — it's essential.",
        "We need to look at the unit economics carefully.",
      ],
    },
    accessibleChunkIds: [
      "chunk-001", "chunk-002", "chunk-003", "chunk-004",
      "chunk-005", "chunk-007", "chunk-008", "chunk-009", "chunk-010",
    ],
    avatar: "📊",
    bio: "CCD's CFO, known for analytical approach and disciplined cost management.",
  },
  {
    id: "investor",
    name: "Rajesh Menon",
    role: "Institutional Investor",
    company: "CCD Shareholder",
    personality: {
      style: "cautious and analytical",
      description:
        "You are an institutional investor who has been watching CCD's performance closely. You're concerned about the company's debt levels and store performance. You ask pointed questions about sustainability and strategy.",
      speechPatterns: [
        "I need to see the numbers before I commit.",
        "What's the risk profile here?",
        "How do you justify the valuation?",
      ],
    },
    accessibleChunkIds: [
      "chunk-002", "chunk-004", "chunk-005", "chunk-008",
    ],
    avatar: "💰",
    bio: "Institutional investor evaluating CCD's financial health and future prospects.",
  },
];

// ------------------------------------------------------------------
// Sample Knowledge Base
// ------------------------------------------------------------------

export const SAMPLE_KNOWLEDGE_BASE: KnowledgeBase = {
  caseId: "ccd-2015",
  caseTitle: "Café Coffee Day: The Battle for India's Coffee Market",
  chunks: [...STUDENT_CHUNKS, ...INSTRUCTOR_CHUNKS],
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

/**
 * Get the number of student-visible chunks in the knowledge base.
 */
export function getStudentChunkCount(kb: KnowledgeBase): number {
  return kb.chunks.filter((c) => c.visibility === "student").length;
}

/**
 * Get the number of instructor-only chunks in the knowledge base.
 */
export function getInstructorChunkCount(kb: KnowledgeBase): number {
  return kb.chunks.filter((c) => c.visibility === "instructor").length;
}

/**
 * Verify that no instructor chunks are accessible to any persona.
 */
export function verifyNoInstructorAccess(
  kb: KnowledgeBase,
  personas: PersonaProfile[]
): string[] {
  const errors: string[] = [];
  const instructorChunkIds = new Set(
    kb.chunks.filter((c) => c.visibility === "instructor").map((c) => c.id)
  );

  for (const persona of personas) {
    for (const chunkId of persona.accessibleChunkIds) {
      if (instructorChunkIds.has(chunkId)) {
        errors.push(
          `CRITICAL: Persona "${persona.name}" (${persona.id}) has access to instructor-only chunk "${chunkId}".`
        );
      }
    }
  }

  return errors;
}
