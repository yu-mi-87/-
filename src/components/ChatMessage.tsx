import React, { useState } from 'react';
import { HeartHandshake, User, Copy, Check, Volume2, VolumeX, ShieldAlert, ExternalLink, Bookmark } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onSelectQuestion?: (question: string) => void;
}

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.sender === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleTTS = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean text for TTS
    const cleanText = message.text
      .replace(/\[출처:[^\]]+\]/g, '')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/[#*`>]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Helper to format assistant text with custom elements
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');

    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;

          // Check if line is a disclaimer quote
          if (line.trim().startsWith('>')) {
            const quoteContent = line.replace(/^>\s*/, '').replace(/^"|"$/g, '');
            return (
              <div
                key={idx}
                className="my-3 p-3.5 rounded-2xl bg-[#f9f6f2] border border-[#ece7e2] text-[#5a544f] text-xs flex items-start gap-2.5 shadow-2xs font-sans"
              >
                <ShieldAlert className="w-4 h-4 text-[#bc8a5f] shrink-0 mt-0.5" />
                <span className="font-medium">{quoteContent}</span>
              </div>
            );
          }

          // Replace source tags [출처: ...] with styled badges
          const sourceRegex = /\[출처:\s*([^\]]+)\]/g;
          const parts = [];
          let lastIdx = 0;
          let match;

          while ((match = sourceRegex.exec(line)) !== null) {
            if (match.index > lastIdx) {
              parts.push(line.substring(lastIdx, match.index));
            }
            parts.push(
              <span
                key={`src-${match.index}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md bg-[#f9f6f2] border border-[#ece7e2] text-[#85665b] text-xs font-sans font-semibold"
              >
                <Bookmark className="w-3 h-3 text-[#bc8a5f] shrink-0" />
                출처: {match[1]}
              </span>
            );
            lastIdx = match.index + match[0].length;
          }
          if (lastIdx < line.length) {
            parts.push(line.substring(lastIdx));
          }

          // Process URL links
          const renderedLine = (
            <React.Fragment key={idx}>
              {parts.map((p, pIdx) => {
                if (typeof p === 'string') {
                  // Linkify pre-approved URLs
                  const urlRegex = /(https?:\/\/[^\s]+)/g;
                  const subParts = p.split(urlRegex);
                  return (
                    <span key={pIdx}>
                      {subParts.map((sp, spIdx) => {
                        if (sp.match(/^https?:\/\//)) {
                          return (
                            <a
                              key={spIdx}
                              href={sp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#bc8a5f] hover:text-[#967468] font-semibold underline underline-offset-2 mx-1 font-sans"
                            >
                              <span>{sp}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          );
                        }
                        return sp;
                      })}
                    </span>
                  );
                }
                return p;
              })}
            </React.Fragment>
          );

          // Headings
          if (line.trim().startsWith('### ') || line.trim().startsWith('**') && line.trim().endsWith('**')) {
            const headingText = line.replace(/^[#*]+\s*|\*+$/g, '');
            return (
              <h4 key={idx} className="font-bold text-[#5a544f] text-base mt-3.5 mb-1 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#bc8a5f] rounded-full inline-block" />
                {headingText}
              </h4>
            );
          }

          // Bullet points
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2 my-0.5">
                <span className="text-[#bc8a5f] font-bold">•</span>
                <span className="text-[#4a443f]">{renderedLine}</span>
              </div>
            );
          }

          // Numbered lists
          if (/^\d+\.\s/.test(line.trim())) {
            const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
            if (numMatch) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-1 my-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#e9d5ca] text-[#85665b] font-bold text-xs shrink-0 font-sans">
                    {numMatch[1]}
                  </span>
                  <span className="text-[#4a443f] mt-0.5">{numMatch[2]}</span>
                </div>
              );
            }
          }

          return (
            <p key={idx} className="text-[#4a443f] leading-relaxed">
              {renderedLine}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div
      id={`chat-msg-${message.id}`}
      className={`flex items-start gap-3 my-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
          isUser
            ? 'bg-[#5a544f] text-white'
            : 'bg-[#e9d5ca] text-[#967468]'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <HeartHandshake className="w-5 h-5 text-[#967468]" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[88%] sm:max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 px-1 font-sans">
          <span className="text-xs font-semibold text-[#8a817a]">
            {isUser ? '산모님 / 부모님' : '상담원 (산모·신생아 건강관리)'}
          </span>
          <span className="text-[10px] text-[#a19991]">{message.timestamp}</span>
        </div>

        <div
          className={`relative p-5 rounded-3xl shadow-sm transition-all leading-relaxed ${
            isUser
              ? 'bg-[#967468] text-white rounded-tr-none shadow-md font-sans'
              : 'bg-white border border-[#ece7e2] text-[#4a443f] rounded-tl-none'
          }`}
        >
          {isUser ? (
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
          ) : (
            renderFormattedText(message.text)
          )}

          {/* Action Bar for Assistant */}
          {!isUser && (
            <div className="flex items-center justify-between border-t border-[#ece7e2] pt-2.5 mt-3.5 text-xs text-[#a19991] font-sans">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-[#f9f6f2] text-[#8a817a] transition-colors"
                  title="답변 내용 복사"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '복사완료' : '복사'}</span>
                </button>

                <button
                  onClick={handleToggleTTS}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors ${
                    isSpeaking ? 'bg-[#e9d5ca] text-[#85665b] font-medium' : 'hover:bg-[#f9f6f2] text-[#8a817a]'
                  }`}
                  title="음성으로 읽어주기"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? '정지' : '음성듣기'}</span>
                </button>
              </div>

              {message.sources && message.sources.length > 0 && (
                <div className="text-[11px] font-medium text-[#85665b] bg-[#f9f6f2] border border-[#ece7e2] px-2.5 py-0.5 rounded-full">
                  지침 근거 확인됨
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
