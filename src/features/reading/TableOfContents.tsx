// ============================================================================
// MBA Case Study Platform — Table of Contents
// ============================================================================
// Left sidebar navigation showing case sections with scroll tracking.
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

interface TocSection {
  id: string;
  title: string;
  level: number; // 1 = h1, 2 = h2, etc.
  chunkId: string;
}

interface TableOfContentsProps {
  sections: TocSection[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  title?: string;
}

export function TableOfContents({
  sections,
  activeSection,
  onSectionClick,
  title = 'Contents',
}: TableOfContentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  // Auto-scroll active section into view
  useEffect(() => {
    if (!activeSection) return;
    const el = containerRef.current?.querySelector(`[data-toc-item="${activeSection}"]`);
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeSection]);

  if (sections.length === 0) {
    return (
      <nav className="reading-toc" aria-label="Table of contents">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
          {title}
        </h3>
        <p className="text-sm text-gray-400 px-3 italic">No sections available</p>
      </nav>
    );
  }

  return (
    <nav
      ref={containerRef}
      className="reading-toc overflow-y-auto"
      aria-label="Table of contents"
    >
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3 sticky top-0 bg-white py-2 z-10">
        {title}
      </h3>

      <ul className="space-y-0.5 pb-4">
        {sections.map((section) => {
          const isActive = section.id === activeSection;
          const isCollapsed = collapsedSections.has(section.id);
          const indent = section.level > 1 ? (section.level - 1) * 12 : 0;

          return (
            <li key={section.id} style={{ paddingLeft: `${indent}px` }}>
              <button
                data-toc-item={section.id}
                onClick={() => onSectionClick(section.id)}
                className={`
                  w-full text-left px-3 py-1.5 rounded-md text-sm leading-relaxed
                  transition-colors duration-150
                  ${isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="truncate block">{section.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
