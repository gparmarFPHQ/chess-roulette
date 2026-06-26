// ============================================================================
// MBA Case Study Platform — Header
// ============================================================================
// Shared header with branding for the Case Study Lab.
// ============================================================================

import React from 'react';
import { BookOpen } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  showNav?: boolean;
}

export function Header({ title, subtitle, rightContent, showNav = true }: HeaderProps) {
  return (
    <>
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <BookOpen className="h-6 w-6 text-burgundy-700 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-serif font-bold text-slate-900 truncate">
              {title || 'Case Study Lab'}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {rightContent && (
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {rightContent}
          </div>
        )}
      </header>
      {showNav && <Navigation />}
    </>
  );
}

// Re-export Navigation for direct use
export { Navigation } from './Navigation';
