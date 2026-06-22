/**
 * Draft header — editable title and template badge.
 * 
 * Features:
 * - Editable title field
 * - Template badge
 * - Clean, minimal design
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type React from 'react';
import type { DraftTemplate } from './types';
import { templates } from './templates';

export interface DraftHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  template?: DraftTemplate;
}

export function DraftHeader({ title, onTitleChange, template }: DraftHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync edit value when title changes externally
  useEffect(() => {
    setEditValue(title);
  }, [title]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== title) {
      onTitleChange(editValue.trim());
    } else {
      setEditValue(title);
    }
  }, [editValue, title, onTitleChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        inputRef.current?.blur();
      } else if (e.key === 'Escape') {
        setEditValue(title);
        inputRef.current?.blur();
      }
    },
    [title]
  );

  const templateData = template ? templates[template] : null;

  return (
    <div className="workspace-draft-header">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="workspace-draft-title-input"
          value={editValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Untitled Draft"
          aria-label="Draft title"
        />
      ) : (
        <button
          className="workspace-draft-title"
          onClick={handleStartEdit}
          aria-label={`Edit title: ${title}`}
        >
          {title || 'Untitled Draft'}
          <span className="workspace-draft-title-edit">✏️</span>
        </button>
      )}

      {templateData && (
        <span className="workspace-draft-template-badge">
          {templateData.title}
        </span>
      )}

      <style>{draftHeaderStyles}</style>
    </div>
  );
}

const draftHeaderStyles = `
.workspace-draft-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.workspace-draft-title {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  margin: -4px -8px;
  border-radius: 4px;
  text-align: left;
  transition: background 0.15s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.workspace-draft-title:hover {
  background: #f9fafb;
}

.workspace-draft-title-edit {
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.workspace-draft-title:hover .workspace-draft-title-edit {
  opacity: 0.5;
}

.workspace-draft-title-input {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 4px 12px;
  outline: none;
  transition: border-color 0.15s ease;
}

.workspace-draft-title-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.workspace-draft-template-badge {
  font-size: 12px;
  font-weight: 500;
  color: #3b82f6;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 9999px;
  padding: 2px 10px;
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 640px) {
  .workspace-draft-header {
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 16px;
  }
  
  .workspace-draft-title {
    font-size: 18px;
  }
  
  .workspace-draft-title-input {
    font-size: 18px;
  }
}
`;
