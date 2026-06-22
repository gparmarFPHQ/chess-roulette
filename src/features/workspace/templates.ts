/**
 * Draft template definitions — structure, titles, and descriptions.
 * Each template provides a Markdown scaffold that gets converted to
 * HTML for insertion into the TipTap editor.
 */

import type { DraftTemplate, TemplateMetadata } from './types';

export const templates: Record<DraftTemplate, TemplateMetadata> = {
  'executive-summary': {
    title: 'Executive Summary',
    description: 'Brief overview with key findings and recommendation',
    structure: `# Executive Summary

## Situation
[Brief description of the situation]

## Key Findings
[2-3 main insights from your analysis]

## Recommendation
[Your primary recommendation]

## Expected Impact
[What outcome do you expect?]`,
  },

  proposal: {
    title: 'Proposal',
    description: 'Full proposal with problem, analysis, solution, and implementation',
    structure: `# Proposal

## Problem Statement
[What problem are you addressing?]

## Analysis
[Your analysis of the situation]

## Proposed Solution
[What are you proposing?]

## Implementation Plan
[How will this be executed?]

## Expected Outcomes
[What results do you anticipate?]`,
  },

  analysis: {
    title: 'Analysis',
    description: 'Structured analysis with alternatives and evaluation',
    structure: `# Analysis

## Situation Analysis
[What is the current situation?]

## Key Issues
[What are the main issues to address?]

## Alternatives
[What options are available?]

## Evaluation Criteria
[How are you evaluating each alternative?]

## Recommendation
[Which alternative do you recommend and why?]`,
  },

  recommendation: {
    title: 'Recommendation',
    description: 'Focused recommendation with justification and next steps',
    structure: `# Recommendation

## Context
[Background and context for the recommendation]

## Recommendation
[Your specific recommendation]

## Justification
[Why is this the best course of action?]

## Implementation Steps
[What needs to happen next?]

## Risks and Mitigation
[What could go wrong and how do you handle it?]`,
  },
};

/**
 * Get all available template keys.
 */
export function getAvailableTemplates(): DraftTemplate[] {
  return Object.keys(templates) as DraftTemplate[];
}

/**
 * Get template metadata by key.
 */
export function getTemplate(key: DraftTemplate): TemplateMetadata | undefined {
  return templates[key];
}
