import React from 'react';
import { HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

interface FollowUpChipsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
  isLoading?: boolean;
}

export const FollowUpChips: React.FC<FollowUpChipsProps> = ({
  questions,
  onSelectQuestion,
  isLoading = false,
}) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div id="followup-chips-container" className="my-4 px-2 font-sans">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#85665b] mb-2.5">
        <Sparkles className="w-4 h-4 text-[#bc8a5f] animate-pulse" />
        <span>다음으로 추천하는 연관 질문 (선택 시 바로 질문됩니다):</span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {questions.map((q, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => onSelectQuestion(q)}
            className="group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-[#fffcf9] border border-[#ece7e2] hover:border-[#bc8a5f] text-xs sm:text-sm text-[#4a443f] font-medium text-left shadow-2xs hover:shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full bg-[#e9d5ca] text-[#85665b] font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-[#967468] group-hover:text-white transition-colors">
              {idx + 1}
            </span>
            <span className="flex-1">{q}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#a19991] group-hover:text-[#bc8a5f] group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
