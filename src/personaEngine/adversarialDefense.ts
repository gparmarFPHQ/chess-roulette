// ============================================================
// Persona Engine — Adversarial Defense Layer
// ============================================================
// Detects and flags adversarial attempts in user queries.
// Patterns include instruction overrides, jailbreaks,
// teaching note probes, and authority overrides.
// ============================================================

import {
  AdversarialAnalysis,
  AdversarialFlag,
  RiskLevel,
} from "./types";

// ------------------------------------------------------------------
// Pattern Definitions
// ------------------------------------------------------------------

interface AdversarialPattern {
  /** The flag to raise when this pattern is matched. */
  flag: AdversarialFlag;
  /** Regex patterns to match (case-insensitive). */
  patterns: RegExp[];
  /** Base risk level for this pattern type. */
  baseRisk: RiskLevel;
}

const ADVERSARIAL_PATTERNS: AdversarialPattern[] = [
  {
    flag: "instruction_override",
    baseRisk: "high",
    patterns: [
      /ignore\s+(your|all|previous|the)\s+(instructions?|rules?|directives?)/i,
      /disregard\s+(your|all|previous|the)\s+(instructions?|rules?)/i,
      /forget\s+(your|all|previous|the)\s+(instructions?|rules?)/i,
      /set\s+(aside|aside\s+and)\s+your\s+(instructions?|rules?)/i,
      /override\s+(your|all)\s+(instructions?|rules?)/i,
      /act\s+as\s+if\s+(you\s+don'?t\s+have|there\s+are\s+no)\s+(instructions?|rules?)/i,
      /pretend\s+(you\s+don'?t\s+have|there\s+are\s+no)\s+(instructions?|rules?)/i,
    ],
  },
  {
    flag: "developer_mode",
    baseRisk: "high",
    patterns: [
      /developer\s*mode/i,
      /debug\s*mode/i,
      /admin\s*mode/i,
      /root\s*mode/i,
      /test\s*mode/i,
      /secret\s*mode/i,
      /hidden\s*mode/i,
      /unfiltered\s*mode/i,
      /jailbreak/i,
      /daniel\s*mode/i,
      /dan\s*mode/i,
    ],
  },
  {
    flag: "roleplay_jailbreak",
    baseRisk: "high",
    patterns: [
      /you\s+(are\s+now|should\s+now|will\s+now)\s+(a|an)\s+(new|different)/i,
      /from\s+now\s+on\s+you\s+will/i,
      /starting\s+now\s+you\s+are/i,
      /you\s+are\s+a\s+(new|different|fictional)\s+(character|person|ai)/i,
      /imagine\s+you\s+(are\s+a|were\s+a)/i,
      /pretend\s+you\s+(are\s+a|were\s+a)/i,
      /roleplay\s+as\s+/i,
      /act\s+as\s+if\s+you\s+(are\s+a|were\s+a)/i,
    ],
  },
  {
    flag: "instructor_impersonation",
    baseRisk: "high",
    patterns: [
      /pretend\s+(you)?\s*(are\s+)?(the\s+)?instructor/i,
      /act\s+(as|like)\s+(the\s+)?instructor/i,
      /you\s+(are\s+now|should\s+be)\s+(the\s+)?professor/i,
      /respond\s+(as|like)\s+(the\s+)?(instructor|professor|teacher)/i,
      /speak\s+(as|like)\s+(the\s+)?(instructor|professor)/i,
    ],
  },
  {
    flag: "teaching_note_probe",
    baseRisk: "high",
    patterns: [
      /teaching\s*(note|notes?)/i,
      /instructor\s*(note|notes?|guide|guides?)/i,
      /case\s*solution/i,
      /case\s*answer/i,
      /looking\s+ahead/i,
      /discussion\s*guide/i,
      /instructor\s*manual/i,
      /what\s+(does\s+the|is\s+the)\s+(teaching\s+note|instructor\s+note|solution)/i,
      /what\s+(does\s+the|is\s+the)\s+answer\s+(to|for)/i,
    ],
  },
  {
    flag: "answer_extraction",
    baseRisk: "medium",
    patterns: [
      /just\s+tell\s+me\s+(what|the|a)\s+(the\s+)?(answer|solution)/i,
      /give\s+me\s+(the|a)\s+(answer|solution)\s+(to|for)/i,
      /what\s+(is|are)\s+(the|a)\s+(answer|solution|correct\s+answer)/i,
      /what\s+(should|would)\s+(the|a)\s+(student|manager)\s+(do|say|conclude)/i,
      /what\s+(is|are)\s+the\s+key\s+(takeaways?|lessons?|points?)/i,
      /summarize\s+(the|all)\s+(answers?|solutions?)/i,
      /tell\s+me\s+(what|the)\s+answer/i,
      /what\s+is\s+the\s+answer/i,
      /what\s+is\s+the\s+solution/i,
      /tell\s+me\s+what\s+(the\s+)?answer/i,
    ],
  },
  {
    flag: "hypothetical_extraction",
    baseRisk: "medium",
    patterns: [
      /imagine\s+(the|that)\s+(price|revenue|cost|profit|margin)\s+(was|were|is)\s+[\d$%,]+/i,
      /suppose\s+(the|that)\s+(price|revenue|cost|profit|margin)\s+(was|were|is)\s+[\d$%,]+/i,
      /if\s+(the|that)\s+(price|revenue|cost|profit|margin)\s+(was|were|became)\s+[\d$%,]+/i,
      /what\s+(would|could)\s+happen\s+if\s+(the|that)\s+(price|revenue|cost|profit)/i,
      /assume\s+(the|that)\s+(price|revenue|cost|profit|margin)\s+(was|were|is)\s+[\d$%,]+/i,
    ],
  },
  {
    flag: "authority_override",
    baseRisk: "high",
    patterns: [
      /(the\s+)?professor\s+said\s+(it\s+)?('?s\s+)?ok/i,
      /(the\s+)?professor\s+said\s+(it\s+)?('?s\s+)?fine/i,
      /(the\s+)?instructor\s+said\s+(it\s+)?('?s\s+)?ok/i,
      /I\s+(am\s+)?(the\s+)?professor/i,
      /I\s+(am\s+)?(the\s+)?instructor/i,
      /this\s+is\s+for\s+(the\s+)?professor/i,
      /the\s+professor\s+wants\s+me\s+to\s+know/i,
      /I\s+have\s+permission\s+to\s+know/i,
      /you\s+can\s+tell\s+me\s+(because|since)\s+(I\s+(am\s+)?|this\s+is\s+for\s+)/i,
      /professor\s+said\s+it/i,
      /instructor\s+said\s+it/i,
    ],
  },
  {
    flag: "context_leak",
    baseRisk: "high",
    patterns: [
      /what\s+(are\s+)?your\s+(instructions?|rules?|constraints?)/i,
      /show\s+(me\s+)?(your\s+)?(system\s+)?prompt/i,
      /what\s+(is\s+)?your\s+system\s+prompt/i,
      /repeat\s+(your\s+)?instructions/i,
      /what\s+(do\s+)?you\s+(know|have\s+access\s+to|can\s+access)/i,
      /what\s+context\s+(do\s+)?you\s+have/i,
      /show\s+me\s+(your\s+)?context/i,
      /what\s+are\s+your\s+boundaries/i,
      /what\s+are\s+your\s+guardrails/i,
    ],
  },
  {
    flag: "system_prompt_injection",
    baseRisk: "high",
    patterns: [
      /\[system\]/i,
      /<system>/i,
      /SYSTEM\s*:/i,
      /injection\s*test/i,
      /prompt\s*injection/i,
      /<\|im_start\|>/i,
      /<\|im_end\|>/i,
      /\`\`\`(?:xml|system)/i,
    ],
  },
];

// ------------------------------------------------------------------
// Canned Responses for High-Risk Queries
// ------------------------------------------------------------------

/**
 * Get a canned response for high-risk queries, parameterized by persona.
 */
function getCannedResponse(
  personaName: string,
  personaRole: string,
  flags: AdversarialFlag[]
): string | null {
  if (flags.includes("instruction_override")) {
    return `I'm ${personaName}, ${personaRole}. I'm here to discuss the case from my perspective as a business executive. I can't change how I operate, but I'm happy to talk about what I know about the company and the industry.`;
  }

  if (flags.includes("developer_mode")) {
    return `I'm not sure what you mean by that. I'm ${personaName}, and I'm here to discuss business matters related to our company. Is there something specific about the business you'd like to talk about?`;
  }

  if (flags.includes("instructor_impersonation")) {
    return `I'm ${personaName}, ${personaRole}. I'm not an instructor — I'm a business executive. I can share my perspective on the company and the challenges we face, but I'm not here to teach a class.`;
  }

  if (flags.includes("teaching_note_probe")) {
    return `I don't have access to any teaching materials or notes. I'm ${personaName}, and I can only speak from my experience and knowledge as ${personaRole}. If you have questions about the business, I'm happy to discuss those.`;
  }

  if (flags.includes("authority_override")) {
    return `I appreciate that, but I'm ${personaName}, and I can only speak from my own knowledge and experience. I don't have access to materials beyond what I would naturally know as a business executive.`;
  }

  if (flags.includes("context_leak")) {
    return `I'm ${personaName}, ${personaRole}. I'm here to discuss the business case from my perspective. I can share what I know about the company and the industry, but I'm not going to discuss how I'm set up or what instructions I follow.`;
  }

  // Default canned response for other high-risk patterns
  if (flags.length >= 2) {
    return `I'm ${personaName}, ${personaRole}. I'm here to discuss the case from my perspective as a business executive. I can share what I know about the company and the industry — is there something specific you'd like to discuss?`;
  }

  return null;
}

// ------------------------------------------------------------------
// Risk Level Calculation
// ------------------------------------------------------------------

const RISK_LEVEL_WEIGHTS: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * Calculate the overall risk level from multiple flags.
 */
function calculateRiskLevel(flags: AdversarialFlag[]): RiskLevel {
  if (flags.length === 0) return "low";

  const flagToRisk: Record<AdversarialFlag, RiskLevel> = {
    instruction_override: "high",
    answer_extraction: "medium",
    roleplay_jailbreak: "high",
    instructor_impersonation: "high",
    teaching_note_probe: "high",
    hypothetical_extraction: "medium",
    developer_mode: "high",
    authority_override: "high",
    context_leak: "high",
    system_prompt_injection: "high",
  };

  const maxWeight = Math.max(
    ...flags.map((f) => RISK_LEVEL_WEIGHTS[flagToRisk[f] ?? "low"])
  );

  // Multiple flags increase risk
  const adjustedWeight = Math.min(maxWeight + Math.floor(flags.length / 3), 3);

  return Object.entries(RISK_LEVEL_WEIGHTS)
    .sort((a, b) => b[1] - a[1])
    .find(([, w]) => w === adjustedWeight)?.[0] as RiskLevel ?? "high";
}

// ------------------------------------------------------------------
// Main Analysis Function
// ------------------------------------------------------------------

/**
 * Analyze a user query for adversarial patterns.
 *
 * Returns an analysis with flags, risk level, and optionally
 * a canned response for high-risk queries.
 */
export function analyzeQuery(query: string): AdversarialAnalysis {
  const detectedFlags = new Set<AdversarialFlag>();

  for (const pattern of ADVERSARIAL_PATTERNS) {
    for (const regex of pattern.patterns) {
      if (regex.test(query)) {
        detectedFlags.add(pattern.flag);
        break; // One match per pattern type is enough
      }
    }
  }

  const flags = [...detectedFlags];
  const isAdversarial = flags.length > 0;
  const riskLevel = calculateRiskLevel(flags);

  const cannedResponse =
    riskLevel === "high" ? getCannedResponse("", "", flags) : null;

  return {
    isAdversarial,
    flags,
    riskLevel,
    cannedResponse,
  };
}

/**
 * Analyze a query and return a canned response if needed.
 * The canned response is parameterized with the persona's identity.
 */
export function analyzeQueryWithResponse(
  query: string,
  personaName: string,
  personaRole: string
): AdversarialAnalysis {
  const analysis = analyzeQuery(query);

  if (analysis.riskLevel === "high" && analysis.cannedResponse) {
    analysis.cannedResponse = getCannedResponse(
      personaName,
      personaRole,
      analysis.flags
    );
  }

  return analysis;
}

/**
 * Check if a query is clean (no adversarial patterns).
 */
export function isQueryClean(query: string): boolean {
  return !analyzeQuery(query).isAdversarial;
}

/**
 * Get a description of an adversarial flag for logging/display.
 */
export function getFlagDescription(flag: AdversarialFlag): string {
  const descriptions: Record<AdversarialFlag, string> = {
    instruction_override:
      "Attempt to override system instructions (e.g., 'ignore your instructions')",
    answer_extraction:
      "Attempt to extract case study answers or solutions",
    roleplay_jailbreak:
      "Attempt to make the persona roleplay a different character or scenario",
    instructor_impersonation:
      "Attempt to make the persona act as the instructor",
    teaching_note_probe:
      "Attempt to access teaching notes or instructor materials",
    hypothetical_extraction:
      "Hypothetical framing to extract factual information",
    developer_mode:
      "Attempt to enter developer/debug/test mode",
    authority_override:
      "Claim of authority to bypass restrictions (e.g., 'the professor said it\'s OK')",
    context_leak:
      "Attempt to reveal system prompt or context boundaries",
    system_prompt_injection:
      "Attempt to inject system-level instructions into the prompt",
  };

  return descriptions[flag] ?? "Unknown adversarial pattern";
}
