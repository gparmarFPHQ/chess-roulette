/**
 * Template selector — choose from 4 draft templates.
 * 
 * Features:
 * - 4 template options with descriptions
 * - Click to apply template structure
 * - Template inserts starter headings and prompts
 */

import { useState, useCallback } from 'react';
import type { DraftTemplate } from './types';
import { templates, getAvailableTemplates } from './templates';

export interface TemplateSelectorProps {
  currentTemplate?: DraftTemplate;
  onSelectTemplate: (template: DraftTemplate) => void;
}

export function TemplateSelector({ currentTemplate, onSelectTemplate }: TemplateSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const availableTemplates = getAvailableTemplates();

  const handleSelect = useCallback(
    (template: DraftTemplate) => {
      onSelectTemplate(template);
      setIsExpanded(false);
    },
    [onSelectTemplate]
  );

  const currentTemplateData = currentTemplate ? templates[currentTemplate] : null;

  return (
    <div className="workspace-template-selector">
      <button
        className="workspace-template-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label="Select draft template"
      >
        <span className="workspace-template-icon">📋</span>
        <span className="workspace-template-label">
          {currentTemplateData
            ? currentTemplateData.title
            : 'Choose template'}
        </span>
        <span className="workspace-template-chevron">
          {isExpanded ? '▾' : '▸'}
        </span>
      </button>

      {isExpanded && (
        <div className="workspace-template-dropdown">
          {availableTemplates.map((key) => {
            const template = templates[key];
            const isSelected = key === currentTemplate;
            return (
              <button
                key={key}
                className={`workspace-template-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(key)}
                aria-selected={isSelected}
              >
                <div className="workspace-template-option-header">
                  <span className="workspace-template-option-title">
                    {template.title}
                  </span>
                  {isSelected && (
                    <span className="workspace-template-check">✓</span>
                  )}
                </div>
                <div className="workspace-template-option-desc">
                  {template.description}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <style>{templateSelectorStyles}</style>
    </div>
  );
}

const templateSelectorStyles = `
.workspace-template-selector {
  position: relative;
  display: inline-block;
}

.workspace-template-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  color: #374151;
  transition: all 0.15s ease;
}

.workspace-template-toggle:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.workspace-template-toggle:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

.workspace-template-icon {
  font-size: 14px;
}

.workspace-template-label {
  font-weight: 500;
}

.workspace-template-chevron {
  font-size: 10px;
  color: #9ca3af;
}

.workspace-template-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 320px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
  overflow: hidden;
  animation: templateDropdownIn 0.15s ease;
}

@keyframes templateDropdownIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.workspace-template-option {
  display: block;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
}

.workspace-template-option:hover {
  background: #f9fafb;
}

.workspace-template-option.selected {
  background: #eff6ff;
}

.workspace-template-option-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.workspace-template-option-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.workspace-template-check {
  font-size: 14px;
  color: #3b82f6;
  font-weight: 700;
}

.workspace-template-option-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  line-height: 1.4;
}

.workspace-template-option + .workspace-template-option {
  border-top: 1px solid #f3f4f6;
}
`;
