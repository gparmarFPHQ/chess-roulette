/**
 * Autosave indicator — shows save status and last saved time.
 * 
 * Features:
 * - "Saving..." indicator
 * - "Saved at [time]" message
 * - "Unsaved changes" warning
 * - Subtle, non-intrusive placement
 */

import { useMemo } from 'react';

export interface AutosaveIndicatorProps {
  isSaving: boolean;
  lastSavedAt: number | null;
  hasUnsavedChanges: boolean;
}

export function AutosaveIndicator({
  isSaving,
  lastSavedAt,
  hasUnsavedChanges,
}: AutosaveIndicatorProps) {
  const statusText = useMemo(() => {
    if (isSaving) return 'Saving...';
    if (hasUnsavedChanges) return 'Unsaved changes';
    if (lastSavedAt) {
      const time = new Date(lastSavedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `Saved at ${time}`;
    }
    return 'Not saved yet';
  }, [isSaving, lastSavedAt, hasUnsavedChanges]);

  const statusType = useMemo<'saving' | 'warning' | 'success' | 'neutral'>(() => {
    if (isSaving) return 'saving';
    if (hasUnsavedChanges) return 'warning';
    if (lastSavedAt) return 'success';
    return 'neutral';
  }, [isSaving, hasUnsavedChanges, lastSavedAt]);

  const getStatusIcon = (): string => {
    switch (statusType) {
      case 'saving':
        return '⏳';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✓';
      default:
        return '○';
    }
  };

  const getStatusColor = (): string => {
    switch (statusType) {
      case 'saving':
        return '#f59e0b';
      case 'warning':
        return '#ef4444';
      case 'success':
        return '#22c55e';
      default:
        return '#9ca3af';
    }
  };

  return (
    <div className="workspace-autosave-indicator" role="status" aria-live="polite">
      <span
        className="workspace-autosave-dot"
        style={{ backgroundColor: getStatusColor() }}
      />
      <span className="workspace-autosave-text">{statusText}</span>
      <style>{autosaveStyles}</style>
    </div>
  );
}

const autosaveStyles = `
.workspace-autosave-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  padding: 0 4px;
  transition: color 0.2s ease;
}

.workspace-autosave-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
}

.workspace-autosave-text {
  white-space: nowrap;
}

/* Saving animation */
.workspace-autosave-indicator:has(.workspace-autosave-dot[style*="#f59e0b"]) {
  animation: autosavePulse 1s ease infinite;
}

@keyframes autosavePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
`;
