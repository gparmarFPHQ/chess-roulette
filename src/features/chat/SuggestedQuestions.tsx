// ============================================================================
// MBA Case Study Platform — Suggested Questions
// ============================================================================
// Starter questions component that displays clickable question chips.
// Questions are relevant to the persona's knowledge area.
// ============================================================================

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  personaName: string;
}

export function SuggestedQuestions({
  questions,
  onSelect,
  personaName,
}: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="px-4 py-6" role="list" aria-label="Suggested questions">
      <h3 className="text-sm font-medium text-gray-500 mb-3">
        Ask {personaName}:
      </h3>
      <div className="space-y-2" role="list">
        {questions.map((question, index) => (
          <button
            key={`${question}-${index}`}
            role="listitem"
            onClick={() => onSelect(question)}
            className={`
              w-full text-left px-4 py-3 rounded-xl border border-gray-200
              bg-white text-sm text-gray-700
              hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm
              active:bg-gray-100
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1
              group
            `}
          >
            <div className="flex items-start gap-3">
              {/* Question Icon */}
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-500 transition-colors">
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 001-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="text-sm leading-relaxed">{question}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
