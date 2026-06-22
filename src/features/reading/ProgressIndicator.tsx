// ============================================================================
// MBA Case Study Platform — Progress Indicator
// ============================================================================
// Shows reading progress as a bar and chunk counter.
// ============================================================================

import { useMemo } from 'react';

interface ProgressIndicatorProps {
  currentChunk: number;
  totalChunks: number;
}

export function ProgressIndicator({ currentChunk, totalChunks }: ProgressIndicatorProps) {
  const percentage = useMemo(() => {
    if (totalChunks <= 0) return 0;
    return Math.min(100, Math.round(((currentChunk + 1) / totalChunks) * 100));
  }, [currentChunk, totalChunks]);

  return (
    <div className="reading-progress-indicator" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
      {/* Progress bar */}
      <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Text label */}
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-gray-500 font-medium">
          {currentChunk + 1} of {totalChunks} sections
        </span>
        <span className="text-xs text-gray-500 font-medium tabular-nums">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
