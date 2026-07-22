import React from 'react';
import { BookOpen, X, ExternalLink, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { KNOWLEDGE_BASE_DOCS, OFFICIAL_LINKS } from '../data/knowledgeBase';

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3b3531]/50 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#ece7e2] w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#3b3531] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#e9d5ca]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">2026년 공식 지침 및 검증 근거 데이터</h3>
              <p className="text-xs text-[#d6c6b9]">보건복지부 산모·신생아 건강관리 지원사업 지침</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Verified Official Links */}
          <div>
            <h4 className="font-extrabold text-[#3b3531] text-sm mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#bc8a5f]" />
              <span>사전 검증된 공식 기관 연동 링크</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {OFFICIAL_LINKS.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-[#f8f5f0] hover:bg-[#e9d5ca]/40 border border-[#ece7e2] flex items-center justify-between gap-2 text-xs font-bold text-[#5a544f] transition-colors group"
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <CheckCircle2 className="w-4 h-4 text-[#bc8a5f] shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#8a817a] group-hover:text-[#bc8a5f] shrink-0" />
                </a>
              ))}
            </div>
          </div>

          {/* Reference Document Knowledge Base List */}
          <div>
            <h4 className="font-extrabold text-[#3b3531] text-sm mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#bc8a5f]" />
              <span>2026년 지식베이스 수록 지침 항목</span>
            </h4>

            <div className="space-y-3">
              {KNOWLEDGE_BASE_DOCS.map((doc) => (
                <div key={doc.id} className="p-4 rounded-2xl bg-[#f8f5f0] border border-[#ece7e2] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-[#3b3531] text-xs sm:text-sm">{doc.title}</span>
                    <span className="text-[11px] font-bold text-[#85665b] bg-[#e9d5ca] border border-[#d6c6b9] px-2.5 py-0.5 rounded-full shrink-0">
                      2026 지침
                    </span>
                  </div>
                  <p className="text-xs text-[#5a544f] leading-relaxed whitespace-pre-wrap">{doc.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

