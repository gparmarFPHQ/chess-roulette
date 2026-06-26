// ============================================================================
// MBA Case Study Platform — Navigation
// ============================================================================
// Shared navigation component with responsive behavior:
// - Desktop: horizontal tabs at top
// - Mobile: bottom tab bar
// ============================================================================

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, FileText, NotebookPen, LayoutDashboard, BarChart3 } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  mobileLabel: string;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', mobileLabel: 'Home', icon: <LayoutDashboard className="h-5 w-5" /> },
  { path: '/read', label: 'Read', mobileLabel: 'Read', icon: <BookOpen className="h-5 w-5" /> },
  { path: '/exhibits', label: 'Exhibits', mobileLabel: 'Exhibits', icon: <BarChart3 className="h-5 w-5" /> },
  { path: '/chat', label: 'Chat', mobileLabel: 'Chat', icon: <MessageSquare className="h-5 w-5" /> },
  { path: '/notes', label: 'Notes', mobileLabel: 'Notes', icon: <NotebookPen className="h-5 w-5" /> },
  { path: '/workspace', label: 'Workspace', mobileLabel: 'Write', icon: <FileText className="h-5 w-5" /> },
];

interface NavigationProps {
  /** When true, only render the mobile bottom bar (skip desktop top nav) */
  mobileOnly?: boolean;
}

export function Navigation({ mobileOnly = false }: NavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/home';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop: Top horizontal navigation */}
      {!mobileOnly && (
        <nav className="hidden md:flex items-center bg-white border-b border-slate-200 px-4 sm:px-6">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${isActive(item.path)
                  ? 'border-burgundy-700 text-burgundy-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      )}

      {/* Mobile: Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 md:hidden safe-area-bottom">
        <div className="flex items-center justify-around py-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1
                transition-colors min-h-[44px]
                ${isActive(item.path)
                  ? 'text-burgundy-700'
                  : 'text-slate-500'
                }
              `}
              aria-label={item.mobileLabel}
            >
              {item.icon}
              <span className="text-[10px] mt-0.5 truncate">{item.mobileLabel}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
