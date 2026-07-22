import React from 'react';
import { CheckCircle2, Circle, HelpCircle, FileText, Gift, Sparkles } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { num: 0, label: '상담 주제 선택', icon: HelpCircle },
    { num: 1, label: '상황 확인 (소득/출산형태)', icon: FileText },
    { num: 2, label: '자격 & 혜택 결과 안내', icon: Gift },
    { num: 4, label: '신청 절차 & 추가 안내', icon: Sparkles },
  ];

  return (
    <div id="step-indicator-bar" className="bg-[#f9f6f2] border-b border-[#ece7e2] py-2.5 px-4 text-xs font-sans">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {steps.map((step, idx) => {
          const isDone = currentStep > step.num || (currentStep === 2 && step.num === 1);
          const isCurrent = currentStep === step.num || (step.num === 1 && currentStep === 1) || (step.num === 2 && currentStep === 2);
          const Icon = step.icon;

          return (
            <div key={step.num} className="flex items-center gap-1.5 shrink-0">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-[#967468] text-white shadow-xs'
                    : isDone
                    ? 'bg-[#e9d5ca] text-[#7a5b50]'
                    : 'bg-white text-[#a19991] border border-[#ece7e2]'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#85665b]" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                <span>{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 w-3 sm:w-6 rounded-full ${isDone ? 'bg-[#bc8a5f]' : 'bg-[#ece7e2]'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
