// ============================================================================
// MBA Case Study Platform — Adversarial Warning
// ============================================================================
// Shows a subtle warning banner when adversarial patterns are detected.
// Educational: explains why the persona may have deflected.
// ============================================================================

import { useState } from 'react';
import type { AdversarialFlag, RiskLevel } from '../../personaEngine/types';
import { getFlagDescription, getRiskWarningMessage } from './utils';

interface AdversarialWarningProps {
  flags: AdversarialFlag[];
  riskLevel: RiskLevel;
  onDismiss?: () => void;
}

export function AdversarialWarning({
  flags,
  riskLevel,
  onDismiss,
}: AdversarialWarningProps) {
  const [expanded, setExpanded] = useState(false);

  // Only show for medium and high risk
  if (riskLevel === 'low' || flags.length === 0) {
    return null;
  }

  const isHigh = riskLevel === 'high';
  const warningMessage = getRiskWarningMessage(riskLevel);

  const bgColor = isHigh ? 'bg-amber-50' : 'bg-yellow-50';
  const borderColor = isHigh ? 'border-amber-200' : 'border-yellow-200';
  const iconColor = isHigh ? 'text-amber-500' : 'text-yellow-500';
  const textColor = isHigh ? 'text-amber-800' : 'text-yellow-800';
  const subtextColor = isHigh ? 'text-amber-700' : 'text-yellow-700';

  return (
    <div
      className={`${bgColor} border ${borderColor} mx-4 my-3 rounded-lg overflow-hidden`}
      role="alert"
      aria-live="polite"
    >
      {/* Warning Header */}
      <div className="flex items-start gap-3 p-3">
        {/* Icon */}
        <div className={`flex-shrink-0 mt-0.5 ${iconColor}`} aria-hidden="true">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${textColor}`}>
            {isHigh ? 'Security safeguard triggered' : 'Query flagged for review'}
          </p>
          <p className={`text-xs mt-0.5 ${subtextColor}`}>
            {warningMessage}
          </p>
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 p-1 rounded ${iconColor} hover:bg-black/5 transition-colors`}
            aria-label="Dismiss warning"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        )}
      </div>

      {/* Expandable Details */}
      {flags.length > 0 && (
        <div className="border-t border-black/5">
          <button
            onClick={() => setExpanded(!expanded)}
            className={`w-full px-3 py-2 text-xs text-left ${subtextColor} hover:bg-black/5 transition-colors flex items-center justify-between`}
            aria-expanded={expanded}
          >
            <span>
              {flags.length} pattern{flags.length > 1 ? 's' : ''} detected
            </span>
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {expanded && (
            <div className="px-3 pb-3 space-y-1.5">
              {flags.map((flag) => (
                <div
                  key={flag}
                  className={`text-xs ${subtextColor} flex items-start gap-2`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${iconColor}`} />
                  <span>{getFlagDescription(flag)}</span>
                </div>
              ))}
              <p className={`text-[10px] mt-2 pt-2 border-t border-black/5 ${subtextColor}`}>
                💡 Personas can only discuss information from the case study. They cannot
                share teaching notes, instructor materials, or information outside their
                character's knowledge.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
