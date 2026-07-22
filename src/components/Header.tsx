import React from 'react';
import { HeartHandshake, BookOpen, Calculator, RotateCcw, ShieldCheck, Home } from 'lucide-react';

interface HeaderProps {
  onOpenCalculator: () => void;
  onOpenReference: () => void;
  onResetChat: () => void;
  onGoHome: () => void;
  currentStep: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCalculator,
  onOpenReference,
  onResetChat,
  onGoHome,
  currentStep,
}) => {
  return (
    <header id="app-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#ece7e2] shadow-2xs">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Brand & App Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onGoHome}>
            <div className="w-10 h-10 rounded-full bg-[#967468] text-white flex items-center justify-center shrink-0 shadow-xs">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-[#3b3531] text-base sm:text-lg leading-tight tracking-tight">
                  산모·신생아 건강관리 지원사업 상담 AI
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f4ebe4] text-[#85665b] border border-[#e4d5ca]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#bc8a5f]" /> 2026 지침
                </span>
              </div>
              <p className="text-xs text-[#8a817a] flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>해피케어 따스미 1:1 대화 상담</span>
                <span className="text-[#bc8a5f]">•</span>
                <span className="text-[#967468] font-bold">2026년 최신 기준</span>
              </p>
            </div>
          </div>

          {/* Header Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="header-btn-home"
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#5a544f] bg-[#f8f5f0] hover:bg-[#e9d5ca]/40 border border-[#ece7e2] transition-all cursor-pointer"
              title="랜딩페이지 홈으로"
            >
              <Home className="w-3.5 h-3.5 text-[#bc8a5f]" />
              <span className="hidden sm:inline">랜딩 홈</span>
            </button>

            <button
              id="header-btn-calculator"
              onClick={onOpenCalculator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#7a5b50] bg-[#f8f5f0] hover:bg-[#e9d5ca]/40 border border-[#ece7e2] transition-all cursor-pointer"
              title="건강보험료 판정 및 소득계산기"
            >
              <Calculator className="w-3.5 h-3.5 text-[#bc8a5f]" />
              <span className="hidden md:inline">소득 판정 계산기</span>
              <span className="md:hidden">계산기</span>
            </button>

            <button
              id="header-btn-reference"
              onClick={onOpenReference}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#5a544f] bg-white hover:bg-[#f8f5f0] border border-[#ece7e2] transition-all cursor-pointer"
              title="지침 지식베이스 & 근거 자료"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#8a817a]" />
              <span className="hidden sm:inline">근거 문서</span>
            </button>

            <button
              id="header-btn-reset"
              onClick={onResetChat}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#8a817a] hover:text-[#3b3531] hover:bg-[#f8f5f0] transition-colors cursor-pointer"
              title="처음부터 새로 상담"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">새 대화</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

