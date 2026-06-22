/**
 * Word count display with progress bar and reading time.
 * 
 * Features:
 * - Current word count
 * - Progress bar if limit set
 * - Reading time estimate
 * - Real-time updates
 */

export interface WordCountDisplayProps {
  wordCount: number;
  wordLimit?: number;
  readingTime: number;
}

export function WordCountDisplay({ wordCount, wordLimit, readingTime }: WordCountDisplayProps) {
  const progress = wordLimit ? Math.min((wordCount / wordLimit) * 100, 100) : null;
  const isOverLimit = wordLimit && wordCount > wordLimit;
  const isNearLimit = wordLimit && progress && progress >= 90 && progress < 100;

  const getProgressColor = (): string => {
    if (isOverLimit) return '#ef4444';
    if (isNearLimit) return '#f59e0b';
    return '#3b82f6';
  };

  const formatReadingTime = (minutes: number): string => {
    if (minutes <= 1) return '< 1 min read';
    return `~${minutes} min read`;
  };

  return (
    <div className="workspace-word-count">
      <div className="workspace-word-count-stats">
        <span className={`workspace-word-count-value ${isOverLimit ? 'over-limit' : ''}`}>
          {wordCount.toLocaleString()} words
        </span>
        <span className="workspace-word-count-separator">·</span>
        <span className="workspace-word-count-reading-time">
          {formatReadingTime(readingTime)}
        </span>
      </div>

      {wordLimit && (
        <>
          <div className="workspace-word-count-bar-container">
            <div
              className="workspace-word-count-bar"
              style={{
                width: `${progress}%`,
                backgroundColor: getProgressColor(),
              }}
              role="progressbar"
              aria-valuenow={wordCount}
              aria-valuemin={0}
              aria-valuemax={wordLimit}
              aria-label={`Word count: ${wordCount} of ${wordLimit}`}
            />
          </div>
          <div className="workspace-word-count-limit">
            {wordCount}/{wordLimit.toLocaleString()}
            {isOverLimit && (
              <span className="workspace-word-count-over">
                {' '}· {wordCount - wordLimit} over limit
              </span>
            )}
          </div>
        </>
      )}

      <style>{wordCountStyles}</style>
    </div>
  );
}

const wordCountStyles = `
.workspace-word-count {
  padding: 8px 16px;
  background: #fafafa;
  border-top: 1px solid #e5e7eb;
  font-size: 12px;
}

.workspace-word-count-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
}

.workspace-word-count-value {
  font-weight: 500;
  color: #374151;
  transition: color 0.2s ease;
}

.workspace-word-count-value.over-limit {
  color: #ef4444;
}

.workspace-word-count-separator {
  color: #d1d5db;
}

.workspace-word-count-reading-time {
  color: #9ca3af;
}

.workspace-word-count-bar-container {
  height: 3px;
  background: #e5e7eb;
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
}

.workspace-word-count-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease, background-color 0.2s ease;
  min-width: 2px;
}

.workspace-word-count-limit {
  margin-top: 4px;
  color: #9ca3af;
  font-size: 11px;
}

.workspace-word-count-over {
  color: #ef4444;
  font-weight: 500;
}
`;
