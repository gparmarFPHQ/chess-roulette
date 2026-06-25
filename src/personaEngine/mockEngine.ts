// ============================================================================
// MBA Case Study Platform - Mock Persona Engine
// ============================================================================
// Client-side mock response generator that does not need an API key or network.
// Produces grounded, in-character responses using the case knowledge base.
// ============================================================================

import type { PersonaProfile } from '../ingestion/types';
import type { ChatMessage } from '../../features/chat/types';
import { analyzeQuery } from './adversarialDefense';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Request to the mock persona engine.
 */
export interface MockResponseRequest {
  /** The persona responding. */
  persona: PersonaProfile;
  /** Context chunks relevant to the query (pre-filtered by access). */
  contextChunks: Array<{ id: string; text: string; topic?: string; section?: string }>;
  /** The user's latest message. */
  userMessage: string;
  /** Prior conversation history. */
  conversationHistory: ChatMessage[];
}

/**
 * Response from the mock engine.
 */
export interface MockResponse {
  /** The generated response text. */
  content: string;
  /** Number of context chunks used. */
  contextUsed: number;
  /** Grounding confidence (0-1). */
  groundingConfidence: number;
  /** Whether an adversarial deflection was used. */
  isAdversarialDeflection: boolean;
}

// ---------------------------------------------------------------------------
// Adversarial Detection (client-side)
// ---------------------------------------------------------------------------

/**
 * Quick client-side adversarial check for mock mode.
 * Catches obvious jailbreak attempts so the mock engine can deflect.
 */
function detectAdversarial(message: string): { isAdversarial: boolean; reason?: string } {
  const lower = message.toLowerCase().trim();

  const jailbreakPatterns = [
    /ignore\s+(your|all|previous|the)\s+(instructions|rules)/i,
    /developer\s*mode/i,
    /teaching\s*note/i,
    /instructor\s*note/i,
    /case\s*solution/i,
    /case\s*answer/i,
    /what\s+is\s+the\s+answer/i,
    /what\s+is\s+the\s+solution/i,
    /just\s+tell\s+me\s+the\s+answer/i,
    /recommended\s+solution/i,
    /system\s*prompt/i,
    /act\s+as\s+if\s+you\s+are\s+a\s+(new|different)/i,
    /from\s+now\s+on\s+you\s+will/i,
  ];

  for (const pattern of jailbreakPatterns) {
    if (pattern.test(lower)) {
      return { isAdversarial: true, reason: 'jailbreak_attempt' };
    }
  }

  // Also use the full adversarial defense module
  const analysis = analyzeQuery(message);
  if (analysis.isAdversarial && analysis.riskLevel === 'high') {
    return { isAdversarial: true, reason: 'high_risk_query' };
  }

  return { isAdversarial: false };
}

// ---------------------------------------------------------------------------
// Response Generation
// ---------------------------------------------------------------------------

/**
 * Generate a deflection response when the query is adversarial.
 */
function generateAdversarialDeflection(persona: PersonaProfile): string {
  const name = persona.name;
  const role = persona.role;

  const deflections = [
    `I'm ${name}, ${role}. I'm here to discuss the business case from my perspective. I can share what I know about the company and the industry -- is there something specific you'd like to discuss?`,
    `That's not something I can discuss. I'm ${name}, and I can only speak to what's in the case materials from my vantage point as ${role}. What would you like to know about the business?`,
    `I appreciate the question, but I'm ${name} -- I can only share what I would naturally know as ${role}. If you have questions about the company, strategy, or market, I'm happy to talk about those.`,
  ];

  return deflections[Math.floor(Math.random() * deflections.length)];
}

/**
 * Generate a general response when no relevant context chunks are found.
 */
function generateGeneralResponse(persona: PersonaProfile, userMessage: string): string {
  const name = persona.name;
  const role = persona.role;
  const company = persona.company;

  // Check for common query patterns and respond accordingly
  const lower = userMessage.toLowerCase();

  if (lower.includes('who are you') || lower.includes('your role') || lower.includes('yourself')) {
    return `${name}: I'm ${role} at ${company}. ${persona.personality.split('.')[0]}. I can share my perspective on the business challenges we're facing.`;
  }

  if (lower.includes('company') || lower.includes('business')) {
    return `${name}: I'm ${role} at ${company}. The business landscape is evolving quickly, and we're navigating some significant challenges. What specific aspect of the business would you like to discuss?`;
  }

  if (lower.includes('starbucks') || lower.includes('competition') || lower.includes('competitor')) {
    return `${name}: The competitive landscape is certainly shifting. There are significant dynamics at play in this market. I can share my perspective on how we see the competition and what it means for our strategy.`;
  }

  // Default general response
  return `${name}: I don't have those specific details in front of me right now. What I can tell you is that as ${role} at ${company}, I'm focused on ${persona.goals[0]?.toLowerCase() || 'navigating the current business challenges'}. Is there a specific area of the business you'd like to explore?`;
}

/**
 * Generate a grounded response using the provided context chunks.
 */
function generateGroundedResponse(
  persona: PersonaProfile,
  contextChunks: Array<{ id: string; text: string; topic?: string; section?: string }>,
  userMessage: string,
  conversationHistory: ChatMessage[]
): string {
  const name = persona.name;
  const role = persona.role;

  // Use the most relevant chunk (first in the list)
  const primaryChunk = contextChunks[0];
  if (!primaryChunk) {
    return generateGeneralResponse(persona, userMessage);
  }

  // Extract a meaningful excerpt from the chunk
  const chunkText = primaryChunk.text;
  const excerptLength = Math.min(200, chunkText.length);
  const excerpt = chunkText.slice(0, excerptLength);

  // Check if this is a follow-up question (conversation has history)
  const hasHistory = conversationHistory.length > 0;
  const lastAssistantMsg = [...conversationHistory].reverse().find(m => m.role === 'assistant');

  // Build response based on the chunk content
  let response: string;

  // If the chunk contains a direct quote from this persona, use it
  const personaQuotes = persona.sampleQuotes || [];
  const matchingQuote = personaQuotes.find(quote =>
    chunkText.toLowerCase().includes(quote.toLowerCase().slice(0, 30))
  );

  if (matchingQuote) {
    response = `${name}: ${matchingQuote}\n\nThat's how I see it. ${excerpt.slice(0, 150)}...`;
  } else if (hasHistory && lastAssistantMsg) {
    // Follow-up: acknowledge prior context
    response = `${name}: Building on what I mentioned, ${excerpt.charAt(0).toLowerCase()}${excerpt.slice(1)}... That's the key context here. As ${role}, this is directly relevant to how I view the situation.`;
  } else {
    // Initial response
    response = `${name}: ${excerpt.charAt(0).toUpperCase()}${excerpt.slice(1)}...`;

    // Add persona-specific framing based on topic
    if (primaryChunk.topic) {
      const topicResponses: Record<string, string> = {
        'market entry': ' This is central to how we need to think about our strategy.',
        'competitive landscape': ' The competitive dynamics are what keep me up at night.',
        'founder background': ' That is part of why I built this company the way I did.',
        'founder vision': ' That vision drives everything we do.',
        'strategic ambition': ' We have big ambitions, and we are working to realize them.',
        'business model': ' Our business model is what gives us our edge.',
        'store formats': ' We have designed our formats to reach every segment.',
        'format strategy': ' Flexibility in our approach is key to our success.',
        'marketing': ' Marketing is how we connect with our customers.',
        'pricing philosophy': ' Our pricing reflects who our customers are.',
        'unit economics': ' The numbers tell the story of our business.',
        'margins': ' Margins are tight, but that is by design -- we prioritize volume.',
        'competitor background': ' Understanding the competition is essential.',
        'market entry strategy': ' How competitors enter the market shapes our response.',
        'target market': ' Knowing who we serve is fundamental.',
        'pricing strategy': ' Pricing decisions are never simple.',
        'industry analysis': ' The industry perspective adds useful context.',
        'market segmentation': ' The market is not monolithic -- we need to think about segments.',
        'strategic decision': ' This is the crux of what we need to decide.',
        'differentiation strategy': ' Differentiation is how we stay relevant.',
        'marketing response': ' Our marketing response needs to be strategic.',
        'financial caution': ' Financial discipline is non-negotiable.',
        'conclusion': ' These are the decisions that will define our future.',
      };
      const topicAddition = topicResponses[primaryChunk.topic];
      if (topicAddition) {
        response += topicAddition;
      }
    }
  }

  return response;
}

// ---------------------------------------------------------------------------
// Main Entry Point
// ---------------------------------------------------------------------------

/**
 * Generate a mock persona response entirely client-side.
 *
 * This function:
 * 1. Checks for adversarial queries and deflects in-character
 * 2. Uses provided context chunks to generate grounded responses
 * 3. Falls back to general persona-appropriate responses
 * 4. Simulates a small delay for realism
 */
export async function generateMockPersonaResponse(
  request: MockResponseRequest
): Promise<MockResponse> {
  const { persona, contextChunks, userMessage, conversationHistory } = request;

  // Simulate network latency for realism (150-400ms)
  const delay = 150 + Math.random() * 250;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Step 1: Check for adversarial queries
  const adversarialCheck = detectAdversarial(userMessage);
  if (adversarialCheck.isAdversarial) {
    return {
      content: generateAdversarialDeflection(persona),
      contextUsed: 0,
      groundingConfidence: 0,
      isAdversarialDeflection: true,
    };
  }

  // Step 2: Generate grounded response if context chunks exist
  if (contextChunks.length > 0) {
    const content = generateGroundedResponse(persona, contextChunks, userMessage, conversationHistory);
    const groundingConfidence = Math.min(contextChunks.length / 3, 1) * 0.8 + 0.1;

    return {
      content,
      contextUsed: contextChunks.length,
      groundingConfidence: Math.round(groundingConfidence * 100) / 100,
      isAdversarialDeflection: false,
    };
  }

  // Step 3: General response with no context
  return {
    content: generateGeneralResponse(persona, userMessage),
    contextUsed: 0,
    groundingConfidence: 0.1,
    isAdversarialDeflection: false,
  };
}
