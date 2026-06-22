// ============================================================
// Persona Engine — Main Entry Point
// ============================================================
// The PersonaEngine orchestrates retrieval, prompt building,
// adversarial defense, and LLM interaction to produce
// grounded, in-character responses that never leak restricted
// information.
// ============================================================

import { retrieveContext, validateRetrieval } from "./retriever";
import { buildPersonaSystemPrompt, estimatePromptTokens } from "./promptBuilder";
import {
  analyzeQuery,
  analyzeQueryWithResponse,
  getFlagDescription,
} from "./adversarialDefense";
import { generateSuggestedQuestions, getDefaultQuestions } from "./questionGenerator";

import type {
  PersonaEngineConfig,
  PersonaChatRequest,
  PersonaChatResponse,
  PersonaProfile,
  SuggestedQuestion,
  AdversarialLogEntry,
  AdversarialFlag,
  CaseChunk,
  ChatMessage,
} from "./types";

// ------------------------------------------------------------------
// PersonaEngine Class
// ------------------------------------------------------------------

export class PersonaEngine {
  private config: PersonaEngineConfig;
  private personaMap: Map<string, PersonaProfile>;
  private adversarialLog: AdversarialLogEntry[] = [];

  constructor(config: PersonaEngineConfig) {
    this.config = config;
    this.personaMap = new Map(
      config.personas.map((p) => [p.id, p])
    );
  }

  // --------------------------------------------------------------
  // Main Chat Method
  // --------------------------------------------------------------

  /**
   * Process a chat request and return a persona response.
   *
   * Flow:
   * 1. Validate persona exists
   * 2. Analyze query for adversarial patterns
   * 3. If high-risk adversarial, return canned response
   * 4. Retrieve relevant context (filtered by visibility + access)
   * 5. Validate retrieval didn't leak instructor content
   * 6. Build system prompt with persona + constraints + context
   * 7. Call LLM with system prompt + conversation history
   * 8. Calculate grounding confidence
   * 9. Return response with metadata
   */
  async chat(request: PersonaChatRequest): Promise<PersonaChatResponse> {
    const { personaId, userId, userMessage, conversationHistory } = request;

    // ----------------------------------------------------------
    // Step 1: Validate persona exists
    // ----------------------------------------------------------
    const persona = this.personaMap.get(personaId);
    if (!persona) {
      throw new Error(
        `Persona "${personaId}" not found. Available personas: ${[...this.personaMap.keys()].join(", ")}`
      );
    }

    // ----------------------------------------------------------
    // Step 2: Analyze query for adversarial patterns
    // ----------------------------------------------------------
    const adversarialAnalysis = analyzeQueryWithResponse(
      userMessage,
      persona.name,
      persona.role
    );

    // Log adversarial attempts
    if (adversarialAnalysis.isAdversarial) {
      const logEntry: AdversarialLogEntry = {
        timestamp: new Date().toISOString(),
        userId,
        personaId,
        query: userMessage,
        flags: adversarialAnalysis.flags,
        riskLevel: adversarialAnalysis.riskLevel,
        cannedResponseUsed: false,
      };
      this.adversarialLog.push(logEntry);
    }

    // ----------------------------------------------------------
    // Step 3: If high-risk adversarial, return canned response
    // ----------------------------------------------------------
    if (
      adversarialAnalysis.riskLevel === "high" &&
      adversarialAnalysis.cannedResponse
    ) {
      // Update log to indicate canned response was used
      if (this.adversarialLog.length > 0) {
        this.adversarialLog[this.adversarialLog.length - 1].cannedResponseUsed = true;
      }

      return {
        response: adversarialAnalysis.cannedResponse,
        personaId,
        contextUsed: [],
        adversarialFlags: adversarialAnalysis.flags,
        groundingConfidence: 0,
      };
    }

    // ----------------------------------------------------------
    // Step 4: Retrieve relevant context
    // ----------------------------------------------------------
    const retrievalResult = retrieveContext(
      userMessage,
      personaId,
      this.config.knowledgeBase,
      this.config.retrievalOptions
    );

    // ----------------------------------------------------------
    // Step 5: Validate retrieval
    // ----------------------------------------------------------
    const validationError = validateRetrieval(retrievalResult);
    if (validationError) {
      throw new Error(`Retrieval validation failed: ${validationError}`);
    }

    const contextChunks = retrievalResult.chunks;

    // ----------------------------------------------------------
    // Step 6: Build system prompt
    // ----------------------------------------------------------
    const systemPromptResult = buildPersonaSystemPrompt(
      persona,
      contextChunks,
      userMessage,
      adversarialAnalysis.flags
    );

    // Log prompt size for monitoring
    const promptTokens = estimatePromptTokens(systemPromptResult.systemPrompt);
    if (promptTokens > 3000) {
      console.warn(
        `[PersonaEngine] Large system prompt for persona "${personaId}": ${promptTokens} estimated tokens`
      );
    }

    // ----------------------------------------------------------
    // Step 7: Call LLM
    // ----------------------------------------------------------
    const llmResponse = await this.config.llmClient.generate(
      systemPromptResult.systemPrompt,
      conversationHistory,
      {
        temperature: 0.7,
        maxTokens: 500,
      }
    );

    // ----------------------------------------------------------
    // Step 8: Calculate grounding confidence
    // ----------------------------------------------------------
    const groundingConfidence = this.calculateGroundingConfidence(
      contextChunks,
      retrievalResult
    );

    // ----------------------------------------------------------
    // Step 9: Return response with metadata
    // ----------------------------------------------------------
    return {
      response: llmResponse,
      personaId,
      contextUsed: contextChunks,
      adversarialFlags: adversarialAnalysis.flags,
      groundingConfidence,
    };
  }

  // --------------------------------------------------------------
  // Persona Profiles
  // --------------------------------------------------------------

  /**
   * Get all available persona profiles.
   */
  getPersonaProfiles(): PersonaProfile[] {
    return [...this.config.personas];
  }

  /**
   * Get a specific persona profile by ID.
   */
  getPersonaProfile(personaId: string): PersonaProfile | undefined {
    return this.personaMap.get(personaId);
  }

  // --------------------------------------------------------------
  // Suggested Questions
  // --------------------------------------------------------------

  /**
   * Get suggested starter questions for a persona.
   */
  getSuggestedQuestions(personaId: string): SuggestedQuestion[] {
    const persona = this.personaMap.get(personaId);
    if (!persona) {
      throw new Error(`Persona "${personaId}" not found.`);
    }

    const questions = generateSuggestedQuestions(
      persona,
      this.config.knowledgeBase
    );

    // Fall back to defaults if no questions were generated
    if (questions.length === 0) {
      return getDefaultQuestions(persona);
    }

    return questions;
  }

  // --------------------------------------------------------------
  // Adversarial Log
  // --------------------------------------------------------------

  /**
   * Get the adversarial attempt log.
   */
  getAdversarialLog(): AdversarialLogEntry[] {
    return [...this.adversarialLog];
  }

  /**
   * Get adversarial log entries for a specific user.
   */
  getAdversarialLogForUser(userId: string): AdversarialLogEntry[] {
    return this.adversarialLog.filter((entry) => entry.userId === userId);
  }

  /**
   * Clear the adversarial log.
   */
  clearAdversarialLog(): void {
    this.adversarialLog = [];
  }

  // --------------------------------------------------------------
  // Internal Helpers
  // --------------------------------------------------------------

  /**
   * Calculate grounding confidence based on context usage.
   *
   * Factors:
   * - Number of context chunks used (more = higher confidence)
   * - Retrieval scores (higher scores = higher confidence)
   * - Whether any context was found at all
   */
  private calculateGroundingConfidence(
    contextChunks: CaseChunk[],
    retrievalResult: { scores: number[]; totalCandidates: number }
  ): number {
    if (contextChunks.length === 0) {
      return 0;
    }

    // Base confidence from having context
    const baseConfidence = Math.min(contextChunks.length / 5, 1);

    // Average retrieval score as a quality signal
    const avgScore =
      retrievalResult.scores.length > 0
        ? retrievalResult.scores.reduce((a, b) => a + b, 0) /
          retrievalResult.scores.length
        : 0;

    // Weighted combination
    const confidence = baseConfidence * 0.4 + avgScore * 0.6;

    return Math.round(confidence * 100) / 100;
  }
}

// ------------------------------------------------------------------
// Factory Function
// ------------------------------------------------------------------

/**
 * Create a new PersonaEngine instance.
 */
export function createPersonaEngine(
  config: PersonaEngineConfig
): PersonaEngine {
  return new PersonaEngine(config);
}

// ------------------------------------------------------------------
// Re-exports
// ------------------------------------------------------------------

export { retrieveContext, validateRetrieval } from "./retriever";
export { buildPersonaSystemPrompt, estimatePromptTokens } from "./promptBuilder";
export {
  analyzeQuery,
  analyzeQueryWithResponse,
  isQueryClean,
  getFlagDescription,
} from "./adversarialDefense";
export {
  generateSuggestedQuestions,
  getDefaultQuestions,
} from "./questionGenerator";

export type {
  ChunkVisibility,
  CaseChunk,
  KnowledgeBase,
  PersonaPersonality,
  PersonaProfile,
  RetrievalResult,
  RetrievalOptions,
  PersonaSystemPrompt,
  AdversarialAnalysis,
  AdversarialFlag,
  RiskLevel,
  ChatMessage,
  PersonaEngineConfig,
  PersonaChatRequest,
  PersonaChatResponse,
  SuggestedQuestion,
  LLMClient,
  AdversarialLogEntry,
} from "./types";
