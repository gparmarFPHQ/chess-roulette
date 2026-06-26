// ============================================================================
// MBA Case Study Platform — Home Page
// ============================================================================
// Landing page showing available cases and quick stats.
// ============================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, FileText, BarChart3, ArrowRight } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';

interface CaseCard {
  id: string;
  title: string;
  company: string;
  industry: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  personas: number;
  exhibits: number;
  progress?: number;
}

const coffeeWarsCase: CaseCard = {
  id: 'coffee-wars-india',
  title: 'Coffee Wars in India',
  company: 'Café Coffee Day',
  industry: 'Food & Beverage',
  difficulty: 'Intermediate',
  personas: 6,
  exhibits: 14,
  progress: 0,
};

export function MBAHome() {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-16 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                Case Study Lab
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-600">
                Interactive MBA case studies powered by AI
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">Student</p>
                <p className="text-xs text-slate-500">student@example.com</p>
              </div>
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-burgundy-700 flex items-center justify-center text-white font-semibold text-sm">
                S
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-slate-900 mb-2">
            Welcome to your case study workspace
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
            Read cases, chat with AI personas of the key characters, take notes, and draft your recommendations.
            All your work is saved automatically.
          </p>
        </div>

        {/* Available Cases */}
        <div className="mb-8 sm:mb-12">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-burgundy-700" />
            Available Cases
          </h3>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Coffee Wars Case Card */}
            <div
              className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/read')}
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-burgundy-700 to-burgundy-900 px-4 sm:px-6 py-3 sm:py-4">
                <h4 className="text-white font-semibold text-base sm:text-lg">
                  {coffeeWarsCase.title}
                </h4>
                <p className="text-burgundy-100 text-xs sm:text-sm mt-1">
                  {coffeeWarsCase.company}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(coffeeWarsCase.difficulty)}`}>
                    {coffeeWarsCase.difficulty}
                  </span>
                  <span className="text-xs text-slate-500">
                    {coffeeWarsCase.industry}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex items-center text-xs sm:text-sm text-slate-600">
                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                    {coffeeWarsCase.personas} personas
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-slate-600">
                    <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                    {coffeeWarsCase.exhibits} exhibits
                  </div>
                </div>

                {/* Progress Bar */}
                {coffeeWarsCase.progress !== undefined && (
                  <div className="mb-3 sm:mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>Progress</span>
                      <span>{coffeeWarsCase.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-burgundy-700 transition-all"
                        style={{ width: `${coffeeWarsCase.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  className="w-full flex items-center justify-center px-4 py-2.5 bg-burgundy-700 text-white rounded-md hover:bg-burgundy-800 transition-colors font-medium text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/read');
                  }}
                >
                  Start Case
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>

            {/* Placeholder for future cases */}
            <div className="bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 p-4 sm:p-6 flex flex-col items-center justify-center text-center min-h-[200px] sm:min-h-[280px]">
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 mb-3" />
              <h4 className="text-slate-600 font-medium mb-1">More Cases Coming Soon</h4>
              <p className="text-xs sm:text-sm text-slate-500">
                Additional case studies will be added regularly
              </p>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
            Platform Features
          </h3>
          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-burgundy-700" />}
              title="Close Reading"
              description="Typography-first reading interface with highlighting and annotations"
            />
            <FeatureCard
              icon={<MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-burgundy-700" />}
              title="AI Personas"
              description="Chat with characters from the case, grounded in actual content"
            />
            <FeatureCard
              icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-burgundy-700" />}
              title="Proposal Workspace"
              description="Draft your recommendations with autosave and templates"
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-burgundy-700" />}
              title="Data Exhibits"
              description="Interactive charts, tables, and figures from the case"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <p className="text-center text-xs sm:text-sm text-slate-500">
            Case Study Lab — Powered by Fabric AI
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5">
      <div className="mb-2 sm:mb-3">{icon}</div>
      <h4 className="font-medium text-slate-900 mb-1 text-sm">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-600">{description}</p>
    </div>
  );
}
