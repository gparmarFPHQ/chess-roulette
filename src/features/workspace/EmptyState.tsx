/**
 * Empty state — shown when no draft exists yet.
 * 
 * Features:
 * - Welcome message
 * - "Start your proposal" CTA
 * - Template quick-select
 * - Brief instructions
 */

import { useCallback } from 'react';
import type { DraftTemplate } from './types';
import { templates, getAvailableTemplates } from './templates';

export interface EmptyStateProps {
  onCreateDraft: () => void;
  templates: DraftTemplate[];
  onSelectTemplate?: (template: DraftTemplate) => void;
}

export function EmptyState({ onCreateDraft, templates: templateKeys, onSelectTemplate }: EmptyStateProps) {
  const handleTemplateSelect = useCallback(
    (template: DraftTemplate) => {
      if (onSelectTemplate) {
        onSelectTemplate(template);
      } else {
        onCreateDraft();
      }
    },
    [onCreateDraft, onSelectTemplate]
  );

  return (
    <div className="workspace-empty-state">
      <div className="workspace-empty-content">
        <div className="workspace-empty-icon">📝</div>
        <h2 className="workspace-empty-title">Start Your Proposal</h2>
        <p className="workspace-empty-description">
          Draft your case study analysis, proposal, or recommendation.
          Choose a template to get started with a structured outline.
        </p>

        <div className="workspace-empty-templates">
          <h3 className="workspace-empty-templates-label">Choose a template</h3>
          <div className="workspace-empty-template-grid">
            {templateKeys.map((key) => {
              const template = templates[key];
              if (!template) return null;
              return (
                <button
                  key={key}
                  className="workspace-empty-template-card"
                  onClick={() => handleTemplateSelect(key)}
                >
                  <div className="workspace-empty-template-card-title">
                    {template.title}
                  </div>
                  <div className="workspace-empty-template-card-desc">
                    {template.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="workspace-empty-or">
          <span>or</span>
        </div>

        <button
          className="workspace-empty-cta"
          onClick={onCreateDraft}
        >
          Start with a blank draft
        </button>

        <div className="workspace-empty-tips">
          <h4 className="workspace-empty-tips-label">Quick tips</h4>
          <ul className="workspace-empty-tips-list">
            <li>Use the reference panel to insert highlights and notes</li>
            <li>Your work auto-saves as you type</li>
            <li>Export as Markdown, HTML, or PDF when finished</li>
            <li>Press <kbd>⌘</kbd> + <kbd>S</kbd> to manually save</li>
          </ul>
        </div>
      </div>

      <style>{emptyStateStyles}</style>
    </div>
  );
}

const emptyStateStyles = `
.workspace-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 2rem;
  background: #fafafa;
}

.workspace-empty-content {
  max-width: 640px;
  width: 100%;
  text-align: center;
}

.workspace-empty-icon {
  font-size: 48px;
  margin-bottom: 1rem;
}

.workspace-empty-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.75rem;
}

.workspace-empty-description {
  font-size: 15px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 2rem;
}

.workspace-empty-templates {
  text-align: left;
  margin-bottom: 1.5rem;
}

.workspace-empty-templates-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem;
  text-align: center;
}

.workspace-empty-template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.workspace-empty-template-card {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.workspace-empty-template-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.workspace-empty-template-card:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.workspace-empty-template-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.workspace-empty-template-card-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.workspace-empty-or {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 1.5rem 0;
  color: #9ca3af;
  font-size: 14px;
}

.workspace-empty-or::before,
.workspace-empty-or::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.workspace-empty-cta {
  display: inline-block;
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.workspace-empty-cta:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.workspace-empty-cta:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.workspace-empty-tips {
  margin-top: 2rem;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: left;
}

.workspace-empty-tips-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px;
}

.workspace-empty-tips-list {
  margin: 0;
  padding-left: 1.25em;
  list-style: disc;
}

.workspace-empty-tips-list li {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  margin: 4px 0;
}

.workspace-empty-tips-list kbd {
  display: inline-block;
  padding: 1px 6px;
  font-size: 11px;
  font-family: inherit;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  color: #374151;
}

/* Responsive */
@media (max-width: 640px) {
  .workspace-empty-state {
    padding: 1rem;
  }
  
  .workspace-empty-template-grid {
    grid-template-columns: 1fr;
  }
  
  .workspace-empty-title {
    font-size: 20px;
  }
}
`;
