// ============================================================================
// MBA Case Study Platform — Persona Profile Generator
// ============================================================================
// Auto-generates persona profiles from case text, extracting personality,
// goals, and communication style from character quotes and descriptions.
// ============================================================================

import { PersonaProfile } from "./types";

// ---------------------------------------------------------------------------
// Personality Trait Extraction
// ---------------------------------------------------------------------------

/**
 * Personality traits that can be extracted from character quotes and descriptions.
 */
export interface PersonalityTraits {
  communicationStyle: string;
  decisionMaking: string;
  leadershipStyle: string;
  keyMotivations: string[];
  riskTolerance: "high" | "medium" | "low";
}

/**
 * Keywords that indicate personality traits in character text.
 */
const TRAIT_KEYWORDS: Record<string, string[]> = {
  visionary: ["vision", "future", "transform", "revolutionize", "pioneer", "innovate"],
  aggressive: ["aggressive", "bold", "assertive", "dominant", "competitive", "fierce"],
  analytical: ["analyze", "data", "numbers", "metric", "calculate", "evaluate"],
  strategic: ["strategy", "plan", "approach", "tactic", "position", "advantage"],
  pragmatic: ["practical", "realistic", "feasible", "grounded", "sensible", "prudent"],
  passionate: ["passion", "love", "dedicated", "committed", "driven", "enthusiastic"],
  conservative: ["cautious", "careful", "conservative", "steady", "methodical", "gradual"],
  collaborative: ["collaborate", "team", "together", "partnership", "cooperate", "unite"],
  customerFocused: ["customer", "consumer", "client", "user", "satisfaction", "experience"],
  costConscious: ["cost", "efficient", "economical", "budget", "saving", "optimize"],
};

/**
 * Extract personality traits from a character's quotes and descriptions.
 */
export function extractPersonalityTraits(
  quotes: string[],
  description: string
): PersonalityTraits {
  const combinedText = `${description} ${quotes.join(" ")}`.toLowerCase();

  const detectedTraits: string[] = [];
  for (const [trait, keywords] of Object.entries(TRAIT_KEYWORDS)) {
    const matchCount = keywords.filter((kw) => combinedText.includes(kw)).length;
    if (matchCount >= 2) {
      detectedTraits.push(trait);
    }
  }

  // Determine communication style
  const communicationStyle = determineCommunicationStyle(combinedText, detectedTraits);

  // Determine decision-making style
  const decisionMaking = determineDecisionMaking(combinedText, detectedTraits);

  // Determine leadership style
  const leadershipStyle = determineLeadershipStyle(combinedText, detectedTraits);

  // Determine risk tolerance
  const riskTolerance = determineRiskTolerance(combinedText);

  return {
    communicationStyle,
    decisionMaking,
    leadershipStyle,
    keyMotivations: detectedTraits.slice(0, 5),
    riskTolerance,
  };
}

/**
 * Determine communication style from text analysis.
 */
function determineCommunicationStyle(
  text: string,
  traits: string[]
): string {
  if (traits.includes("aggressive") && traits.includes("visionary")) {
    return "Direct, visionary, and commanding — speaks with conviction about the future";
  }
  if (traits.includes("analytical") && traits.includes("strategic")) {
    return "Measured and analytical — supports arguments with data and strategic reasoning";
  }
  if (traits.includes("customerFocused")) {
    return "Customer-centric and empathetic — frames discussions around consumer needs";
  }
  if (traits.includes("costConscious")) {
    return "Practical and numbers-driven — focuses on efficiency and bottom-line impact";
  }
  if (traits.includes("pragmatic")) {
    return "Grounded and realistic — prefers actionable insights over abstract theories";
  }
  return "Professional and articulate — communicates with clarity and purpose";
}

/**
 * Determine decision-making style from text analysis.
 */
function determineDecisionMaking(
  _text: string,
  traits: string[]
): string {
  if (traits.includes("aggressive")) {
    return "Decisive and fast-moving — willing to take bold bets on growth";
  }
  if (traits.includes("analytical")) {
    return "Data-driven and methodical — weighs evidence before committing";
  }
  if (traits.includes("strategic")) {
    return "Long-term oriented — evaluates decisions against strategic positioning";
  }
  if (traits.includes("pragmatic")) {
    return "Practical and incremental — prefers tested approaches over radical change";
  }
  return "Balanced — considers multiple perspectives before deciding";
}

/**
 * Determine leadership style from text analysis.
 */
function determineLeadershipStyle(
  _text: string,
  traits: string[]
): string {
  if (traits.includes("visionary") && traits.includes("aggressive")) {
    return "Transformational — inspires through a compelling vision and drives execution";
  }
  if (traits.includes("collaborative")) {
    return "Participative — builds consensus and values team input";
  }
  if (traits.includes("analytical")) {
    return "Directive — leads through expertise and analytical rigor";
  }
  return "Adaptive — adjusts leadership approach to the situation";
}

/**
 * Determine risk tolerance from text analysis.
 */
function determineRiskTolerance(text: string): "high" | "medium" | "low" {
  const highRiskKeywords = ["bold", "aggressive", "risk", "bet", "leap", "daring"];
  const lowRiskKeywords = ["cautious", "careful", "conservative", "steady", "prudent"];

  let score = 0;
  for (const kw of highRiskKeywords) {
    if (text.includes(kw)) score++;
  }
  for (const kw of lowRiskKeywords) {
    if (text.includes(kw)) score--;
  }

  if (score >= 2) return "high";
  if (score <= -2) return "low";
  return "medium";
}

// ---------------------------------------------------------------------------
// Goal Extraction
// ---------------------------------------------------------------------------

/**
 * Extract goals from character quotes and descriptions.
 */
export function extractGoals(
  quotes: string[],
  description: string,
  role: string
): string[] {
  const goals: string[] = [];
  const combinedText = `${description} ${quotes.join(" ")}`.toLowerCase();

  // Role-based default goals
  const roleGoals: Record<string, string[]> = {
    founder: ["Build and scale the company", "Achieve market dominance", "Fulfill personal vision"],
    cfo: ["Ensure financial sustainability", "Optimize cost structure", "Support profitable growth"],
    marketing: ["Increase brand awareness", "Drive customer acquisition", "Maintain competitive pricing"],
    director: ["Support strategic decisions", "Monitor competitive threats", "Ensure organizational alignment"],
    competitor: ["Defend market position", "Counter competitive moves", "Grow market share"],
    expert: ["Provide objective analysis", "Identify industry trends", "Offer strategic perspective"],
  };

  // Add role-based goals
  for (const [roleKey, roleGoalList] of Object.entries(roleGoals)) {
    if (role.toLowerCase().includes(roleKey)) {
      goals.push(...roleGoalList);
    }
  }

  // Extract from text
  if (combinedText.includes("expand") || combinedText.includes("growth")) {
    goals.push("Expand market presence");
  }
  if (combinedText.includes("compet") || combinedText.includes("starbucks")) {
    goals.push("Respond to competitive threats");
  }
  if (combinedText.includes("customer") || combinedText.includes("consumer")) {
    goals.push("Deliver superior customer experience");
  }
  if (combinedText.includes("profit") || combinedText.includes("financial")) {
    goals.push("Maintain financial performance");
  }

  // Deduplicate
  return [...new Set(goals)].slice(0, 5);
}

// ---------------------------------------------------------------------------
// Information Scope
// ---------------------------------------------------------------------------

/**
 * Generate an information scope description for a character.
 */
export function generateInformationScope(
  characterId: string,
  role: string,
  company: string
): string {
  const scopes: Record<string, string> = {
    "siddhartha": `As founder and chairman of ${company}, has comprehensive knowledge of company history, strategy, financials, expansion plans, and personal background. Can reference all internal company information and industry data presented in the case.`,
    "madhav": `As a director at ${company}, has strategic knowledge of market analysis, competitive dynamics, and company direction. Knows what is discussed in strategic meetings and board-level information.`,
    "ramakrishnan": `As president of marketing at ${company}, has deep knowledge of pricing strategy, customer demographics, promotional activities, and brand positioning. Knows marketing data and customer insights.`,
    "hubli": `As CFO of ${company}, has authoritative knowledge of financials, cost structure, operational efficiency, and capital expenditures. Knows all financial metrics and operational data.`,
    "sushant-dash": `As senior director of marketing at the competitor, has knowledge limited to what is quoted or attributed to them in the case. Knows Starbucks' market entry approach and competitive perspective as presented.`,
    "harish-bijoor": `As an industry expert and consultant, has external perspective on the industry landscape, CCD's strengths, and competitive observations. Knowledge is limited to publicly available information and their quoted analysis.`,
  };

  return scopes[characterId] || `Has knowledge appropriate to their role as ${role} at ${company}.`;
}

// ---------------------------------------------------------------------------
// Persona Profile Generation
// ---------------------------------------------------------------------------

/**
 * Generate a complete persona profile for a character.
 *
 * @param characterId  — Stable character identifier.
 * @param name         — Character's full name.
 * @param role         — Character's role/title.
 * @param company      — Character's company/organization.
 * @param quotes       — Direct quotes from the case.
 * @param description  — Narrative description of the character.
 * @returns A complete PersonaProfile.
 */
export function generatePersonaProfile(
  characterId: string,
  name: string,
  role: string,
  company: string,
  quotes: string[],
  description: string
): PersonaProfile {
  const traits = extractPersonalityTraits(quotes, description);
  const goals = extractGoals(quotes, description, role);
  const informationScope = generateInformationScope(characterId, role, company);

  // Build personality string from traits
  const personality = [
    traits.communicationStyle,
    traits.decisionMaking,
    traits.leadershipStyle,
    `Risk tolerance: ${traits.riskTolerance}`,
  ].join(". ");

  return {
    id: characterId,
    name,
    role,
    company,
    personality,
    goals,
    stakeInSituation: generateStakeDescription(characterId, role, company),
    sampleQuotes: quotes.slice(0, 5), // Limit to 5 most relevant quotes
    informationScope,
  };
}

/**
 * Generate a stake-in-situation description.
 */
function generateStakeDescription(
  characterId: string,
  role: string,
  company: string
): string {
  const stakes: Record<string, string> = {
    "siddhartha": `His life's work and personal identity are tied to CCD's success. The competitive threat from Starbucks directly challenges his vision of dominating India's coffee market.`,
    "madhav": `Responsible for helping steer the company through a critical competitive juncture. His strategic insights shape CCD's response to market challenges.`,
    "ramakrishnan": `Owns the brand positioning and customer strategy that must differentiate CCD from Starbucks. Pricing decisions directly impact market share.`,
    "hubli": `Accountable for the financial health of CCD's expansion. Cost efficiency and capital allocation decisions determine whether growth is sustainable.`,
    "sushant-dash": `Tasked with executing Starbucks' India strategy. Success depends on outmaneuvering CCD while adapting to the Indian market.`,
    "harish-bijoor": `Provides the external expert lens. His credibility depends on accurate, unbiased analysis of the competitive dynamics.`,
  };

  return stakes[characterId] || `Has professional and strategic interests tied to ${company}'s performance in the competitive landscape.`;
}

// ---------------------------------------------------------------------------
// Batch Generation
// ---------------------------------------------------------------------------

/**
 * Generate persona profiles for all characters in a case.
 */
export function generateAllPersonaProfiles(
  characterData: {
    characterId: string;
    name: string;
    role: string;
    company: string;
    quotes: string[];
    description: string;
  }[]
): PersonaProfile[] {
  return characterData.map((data) =>
    generatePersonaProfile(
      data.characterId,
      data.name,
      data.role,
      data.company,
      data.quotes,
      data.description
    )
  );
}
