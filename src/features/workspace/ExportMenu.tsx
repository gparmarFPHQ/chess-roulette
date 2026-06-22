/**
 * Export menu — export draft as Markdown, PDF, or HTML.
 * 
 * Features:
 * - Export as Markdown (clean, with headings)
 * - Export as PDF (using browser print)
 * - Export as HTML (styled document)
 * - Include metadata (title, date, word count)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type React from 'react';
import type { Draft, ExportFormat } from './types';

export interface ExportMenuProps {
  draft: Draft | null;
  onExport: (format: ExportFormat) => void;
}

const EXPORT_OPTIONS: { format: ExportFormat; label: string; icon: string; description: string }[] = [
  {
    format: 'markdown',
    label: 'Markdown',
    icon: '📝',
    description: 'Clean Markdown with headings',
  },
  {
    format: 'html',
    label: 'HTML',
    icon: '🌐',
    description: 'Styled HTML document',
  },
  {
    format: 'pdf',
    label: 'PDF',
    icon: '📄',
    description: 'Print-ready PDF via browser',
  },
];

export function ExportMenu({ draft, onExport }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const handleExport = useCallback(
    (format: ExportFormat) => {
      onExport(format);
      setIsOpen(false);
    },
    [onExport]
  );

  const canExport = draft && draft.content.trim().length > 0;

  return (
    <div className="workspace-export-menu" ref={menuRef}>
      <button
        className="workspace-export-toggle"
        onClick={() => setIsOpen(!isOpen)}
        disabled={!canExport}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Export draft"
      >
        <span className="workspace-export-icon">📤</span>
        <span className="workspace-export-label">Export</span>
      </button>

      {isOpen && canExport && (
        <div className="workspace-export-dropdown" role="menu">
          {EXPORT_OPTIONS.map((option) => (
            <button
              key={option.format}
              className="workspace-export-option"
              onClick={() => handleExport(option.format)}
              role="menuitem"
            >
              <span className="workspace-export-option-icon">
                {option.icon}
              </span>
              <div className="workspace-export-option-content">
                <div className="workspace-export-option-label">
                  {option.label}
                </div>
                <div className="workspace-export-option-desc">
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <style>{exportMenuStyles}</style>
    </div>
  );
}

const exportMenuStyles = `
.workspace-export-menu {
  position: relative;
  display: inline-block;
}

.workspace-export-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  transition: all 0.15s ease;
}

.workspace-export-toggle:hover:not(:disabled) {
  border-color: #9ca3af;
  background: #f9fafb;
}

.workspace-export-toggle:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

.workspace-export-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.workspace-export-icon {
  font-size: 14px;
}

.workspace-export-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 240px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
  overflow: hidden;
  animation: exportDropdownIn 0.15s ease;
}

@keyframes exportDropdownIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.workspace-export-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
}

.workspace-export-option:hover {
  background: #f9fafb;
}

.workspace-export-option-icon {
  font-size: 18px;
  line-height: 1;
}

.workspace-export-option-content {
  flex: 1;
}

.workspace-export-option-label {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.workspace-export-option-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 1px;
}

.workspace-export-option + .workspace-export-option {
  border-top: 1px solid #f3f4f6;
}
`;
