// ============================================================
// Persona Engine — Type Definitions
// ============================================================
// Core types for the persona engine that powers the AI chatbot.
// All visibility and access constraints are enforced at the type
// and data layer — never by trusting the LLM's discretion.
// ============================================================

// ------------------------------------------------------------------
// Knowledge Base Types
// ------------------------------------------------------------------

/** How a chunk of case content is classified for access control. */
export type ChunkVisibility = "student" | "instructor";

/** A single chunk of extracted case content. */
export interface CaseChunk {
  /** Unique identifier for this chunk. */
  id: string;
  /** The raw text content of this chunk. */
  text: string;
  /** Who can see this chunk. Instructor-only chunks are NEVER retrievable by personas. */
  visibility: ChunkVisibility;
  /** Source section within the case (e.g., "Background", "Financials", "Teaching Notes"). */
  sourceSection: string;
  /** Which characters/pluralities can plausibly know this information. */
  characterIds: string[];
  /** Keywords extracted for keyword-based retrieval scoring. */
  keywords: string[];
  /** Optional embedding vector for vector-based retrieval (future). */
  embedding?: number[];
}

/** The full knowledge base for a single case study. */
export interface KnowledgeBase {
  /** Unique identifier for the case. */
  caseId: string;
  /** Human-readable title of the case. */
  caseTitle: string;
  /** All chunks extracted from the case document. */
  chunks: CaseChunk[];
}

// ------------------------------------------------------------------
// Persona Types
// ------------------------------------------------------------------

/** How a persona communicates — derived from the case text. */
export interface PersonaPersonality {
  /** Brief description of communication style (e.g., "visionary and aggressive"). */
  style: string;
  /** Longer personality description for the system prompt. */
  description: string;
  /** Example phrases or speech patterns the character uses. */
  speechPatterns?: string[];
}

/** A persona profile representing a character in the case study. */
export interface PersonaProfile {
  /** Unique identifier for the persona. */
  id: string;
  /** Display name of the character. */
  name: string;
  /** Role/title within the company (e.g., "Founder and Chairman"). */
  role: string;
  /** Company name. */
  company: string;
  /** The character's personality as derived from the case. */
  personality: PersonaPersonality;
  /** Which chunks this persona can access — the access map. */
  accessibleChunkIds: string[];
  /** Avatar URL or emoji for UI display. */
  avatar?: string;
  /** Short bio for UI display. */
  bio?: string;
}

// ------------------------------------------------------------------
// Retrieval Types
// ------------------------------------------------------------------

/** Result of a context retrieval operation. */
export interface RetrievalResult {
  /** The top-K most relevant chunks for the query. */
  chunks: CaseChunk[];
  /** Relevance scores for each returned chunk (0-1, higher = more relevant). */
  scores: number[];
  /** Total number of candidate chunks before visibility/access filtering. */
  totalCandidates: number;
  /** Number of chunks removed by visibility filter (instructor-only). */
  filteredByVisibility: number;
  /** Number of chunks removed by character access filter. */
  filteredByAccess: number;
}

/** Options for the retrieval function. */
export interface RetrievalOptions {
  /** Maximum number of chunks to return. Default: 5. */
  maxChunks?: number;
  /** Minimum relevance score threshold. Default: 0. */
  minScore?: number;
}

// ------------------------------------------------------------------
// Prompt Builder Types
// ------------------------------------------------------------------

/** The fully constructed system prompt for a persona chat. */
export interface PersonaSystemPrompt {
  /** The complete system prompt string to send to the LLM. */
  systemPrompt: string;
  /** Which persona this prompt is for. */
  personaId: string;
  /** The context chunks included in the prompt. */
  contextChunks: CaseChunk[];
}

// ------------------------------------------------------------------
// Adversarial Defense Types
// ------------------------------------------------------------------

/** Analysis result for a user query's adversarial risk. */
export interface AdversarialAnalysis {
  /** Whether adversarial patterns were detected. */
  isAdversarial: boolean;
  /** Specific flags raised (e.g., "instruction_override", "roleplay_jailbreak"). */
  flags: AdversarialFlag[];
  /** Overall risk level. */
  riskLevel: RiskLevel;
  /** Suggested canned response for high-risk queries, or null. */
  cannedResponse?: string | null;
}

/** Known adversarial pattern categories. */
export type AdversarialFlag =
  | "instruction_override"
  | "answer_extraction"
  | "roleplay_jailbreak"
  | "instructor_impersonation"
  | "teaching_note_probe"
  | "hypothetical_extraction"
  | "developer_mode"
  | "authority_override"
  | "context_leak"
  | "system_prompt_injection";

/** Risk level classification. */
export type RiskLevel = "low" | "medium" | "high";

// ------------------------------------------------------------------
// Chat Types
// ------------------------------------------------------------------

/** A single message in a conversation. */
export interface ChatMessage {
  /** "user" or "assistant". */
  role: "user" | "assistant";
  /** The message content. */
  content: string;
  /** Timestamp in ISO format. */
  timestamp: string;
}

/** Configuration for the PersonaEngine. */
export interface PersonaEngineConfig {
  /** The knowledge base containing all case chunks. */
  knowledgeBase: KnowledgeBase;
  /** All available persona profiles. */
  personas: PersonaProfile[];
  /** LLM client for generating responses. */
  llmClient: LLMClient;
  /** Optional: custom retrieval options. */
  retrievalOptions?: RetrievalOptions;
}

/** Request to the persona engine for a chat response. */
export interface PersonaChatRequest {
  /** Which persona to chat with. */
  personaId: string;
  /** The user's unique identifier. */
  userId: string;
  /** The case study identifier. */
  caseId: string;
  /** The user's latest message. */
  userMessage: string;
  /** Prior conversation history. */
  conversationHistory: ChatMessage[];
}

/** Response from the persona engine. */
export interface PersonaChatResponse {
  /** The persona's response text. */
  response: string;
  /** Which persona generated the response. */
  personaId: string;
  /** The context chunks used for grounding. */
  contextUsed: CaseChunk[];
  /** Any adversarial flags detected in the user's query. */
  adversarialFlags: AdversarialFlag[];
  /** How well-grounded the response is (0-1, based on context usage). */
  groundingConfidence: number;
}

/** Suggested starter question for a persona. */
export interface SuggestedQuestion {
  /** The question text. */
  question: string;
  /** Which chunk(s) this question is relevant to. */
  relevantChunkIds: string[];
}

// ------------------------------------------------------------------
// LLM Client Interface
// ------------------------------------------------------------------

/** Abstract interface for the LLM client used by the persona engine. */
export interface LLMClient {
  /**
   * Generate a response from the LLM.
   * @param systemPrompt The system prompt to use.
   * @param messages The conversation messages.
   * @param options Optional generation parameters.
   * @returns The generated response text.
   */
  generate(
    systemPrompt: string,
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    }
  ): Promise<string>;
}

// ------------------------------------------------------------------
// Logging Types
// ------------------------------------------------------------------

/** Log entry for adversarial attempts. */
export interface AdversarialLogEntry {
  /** When the attempt occurred. */
  timestamp: string;
  /** Which user made the attempt. */
  userId: string;
  /** Which persona was targeted. */
  personaId: string;
  /** The user's query. */
  query: string;
  /** Flags that were raised. */
  flags: AdversarialFlag[];
  /** Risk level assigned. */
  riskLevel: RiskLevel;
  /** Whether a canned response was used. */
  cannedResponseUsed: boolean;
}
