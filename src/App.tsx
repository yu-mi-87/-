import React, { useState, useEffect, useRef } from 'react';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { StepIndicator } from './components/StepIndicator';
import { ChatMessageComponent } from './components/ChatMessage';
import { FollowUpChips } from './components/FollowUpChips';
import { EligibilityCalculator } from './components/EligibilityCalculator';
import { ReferenceModal } from './components/ReferenceModal';
import { ChatMessage } from './types';
import { INITIAL_STEP_0_MENU } from './data/knowledgeBase';
import { Send, Sparkles, HelpCircle, HeartHandshake, Calculator, Info } from 'lucide-react';

export default function App() {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [isApproved, setIsApproved] = useState<boolean>(() => {
    return localStorage.getItem('gemini_api_key_approved') === 'true';
  });

  const [viewMode, setViewMode] = useState<'landing' | 'chat'>('landing');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeFollowUps, setActiveFollowUps] = useState<string[]>([]);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (viewMode === 'chat') {
      scrollToBottom();
    }
  }, [messages, isLoading, viewMode]);

  // Handle Gemini API Key verification
  const handleVerifyApiKey = async (keyToVerify: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToVerify }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setApiKey(keyToVerify);
        setIsApproved(true);
        localStorage.setItem('gemini_api_key', keyToVerify);
        localStorage.setItem('gemini_api_key_approved', 'true');
        return {
          success: true,
          message: data.message || 'Gemini API Key가 성공적으로 검증 및 승인되었습니다.',
        };
      } else {
        setIsApproved(false);
        localStorage.removeItem('gemini_api_key_approved');
        return {
          success: false,
          message: data.error || '유효하지 않은 Gemini API 키입니다. 다시 확인해 주세요.',
        };
      }
    } catch (error: any) {
      setIsApproved(false);
      return {
        success: false,
        message: '서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      };
    }
  };

  const handleResetApiKey = () => {
    setApiKey('');
    setIsApproved(false);
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('gemini_api_key_approved');
    setViewMode('landing');
  };

  // Initial welcome message (STEP 0 - shown once at start of session)
  useEffect(() => {
    const initialWelcome: ChatMessage = {
      id: 'msg-welcome-step0',
      sender: 'assistant',
      text: `안녕하세요! 2026 산모·신생아 건강관리 지원사업 전담 AI 상담원 '따스미'입니다. 🌸
산모님과 아기의 소중한 만남을 진심으로 축하드립니다.

2026년 최신 보건복지부 지원 지침에 맞춰 지원 대상, 정부지원금액, 서비스 이용기간, 보건소 및 복지로 신청 방법을 자세하게 1:1 상담해 드립니다.

궁금하신 주제를 아래 메뉴에서 바로 선택하시거나 편하게 말씀해 주세요!

1. 2026 지원 대상 및 자격 조건 (소득기준, 건강보험료 판정)
2. 정부지원금 및 본인부담금 확인 (단태아/쌍태아/삼태아)
3. 서비스 신청 방법 및 제출 서류 (복지로/보건소)
4. 이용 기간 및 신청 가능 시기 (출산 전 40일 ~ 출산 후 30일)
5. 예외 지원 대상 및 지자체 추가 지원 안내

> "본 안내는 2026년 보건복지부 최신 지침 기준이며, 관할 보건소 또는 복지로(www.bokjiro.go.kr)에서 온라인 신청이 가능합니다."`,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      step: 0,
      sources: ['[출처: 2026년 산모·신생아 건강관리 지원사업 안내지침 제1장]'],
    };

    setMessages([initialWelcome]);
    setCurrentStep(0);
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    if (!isApproved) {
      setViewMode('landing');
      return;
    }

    const userPrompt = (textToSend || inputText).trim();
    if (!userPrompt || isLoading) return;

    if (viewMode !== 'chat') {
      setViewMode('chat');
    }

    setInputText('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);
    setActiveFollowUps([]); // clear current followups while generating

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: newHistory,
          message: userPrompt,
          isFirstTurn: messages.length <= 1,
          apiKey: apiKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '서버 응답 오류가 발생했습니다.');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text || '죄송합니다. 답변을 생성하지 못했습니다.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
        step: data.currentStep || 1,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (data.currentStep) {
        setCurrentStep(data.currentStep);
      } else {
        setCurrentStep(1);
      }

      if (data.followUpQuestions && data.followUpQuestions.length > 0) {
        setActiveFollowUps(data.followUpQuestions);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: error.message || '네트워크 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChatFromLanding = (initialQuery?: string) => {
    if (!isApproved) {
      return;
    }
    setViewMode('chat');
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  };

  const handleResetChat = () => {
    if (window.confirm('대화 내역을 초기화하고 처음부터 다시 시작하시겠습니까?')) {
      const initialWelcome: ChatMessage = {
        id: `msg-welcome-${Date.now()}`,
        sender: 'assistant',
        text: `안녕하세요! 2026 산모·신생아 건강관리 지원사업 전담 AI 상담원 '따스미'입니다. 🌸
산모님과 아기의 소중한 만남을 진심으로 축하드립니다.

2026년 최신 보건복지부 지원 지침에 맞춰 지원 대상, 정부지원금액, 서비스 이용기간, 보건소 및 복지로 신청 방법을 자세하게 1:1 상담해 드립니다.

궁금하신 주제를 아래 메뉴에서 바로 선택하시거나 편하게 말씀해 주세요!

1. 2026 지원 대상 및 자격 조건 (소득기준, 건강보험료 판정)
2. 정부지원금 및 본인부담금 확인 (단태아/쌍태아/삼태아)
3. 서비스 신청 방법 및 제출 서류 (복지로/보건소)
4. 이용 기간 및 신청 가능 시기 (출산 전 40일 ~ 출산 후 30일)
5. 예외 지원 대상 및 지자체 추가 지원 안내

> "본 안내는 2026년 보건복지부 최신 지침 기준이며, 관할 보건소 또는 복지로(www.bokjiro.go.kr)에서 온라인 신청이 가능합니다."`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        step: 0,
        sources: ['[출처: 2026년 산모·신생아 건강관리 지원사업 안내지침 제1장]'],
      };

      setMessages([initialWelcome]);
      setCurrentStep(0);
      setActiveFollowUps([]);
    }
  };

  // Render Landing Page
  if (viewMode === 'landing') {
    return (
      <div className="min-h-screen bg-[#fcfaf7] text-[#3b3531] font-sans selection:bg-[#e9d5ca] selection:text-[#85665b]">
        <LandingPage
          apiKey={apiKey}
          isApproved={isApproved}
          onVerifyApiKey={handleVerifyApiKey}
          onResetApiKey={handleResetApiKey}
          onStartChat={handleStartChatFromLanding}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenReference={() => setIsReferenceOpen(true)}
        />

        {/* Modals rendered on landing too */}
        <EligibilityCalculator
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
          onApplyResultToChat={(summary) => handleSendMessage(summary)}
        />
        <ReferenceModal isOpen={isReferenceOpen} onClose={() => setIsReferenceOpen(false)} />
      </div>
    );
  }

  // Render 1:1 Chat Interface
  return (
    <div className="flex flex-col h-screen bg-[#fcfaf7] text-[#3b3531] font-sans overflow-hidden selection:bg-[#e9d5ca] selection:text-[#85665b]">
      {/* Header */}
      <Header
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenReference={() => setIsReferenceOpen(true)}
        onResetChat={handleResetChat}
        onGoHome={() => setViewMode('landing')}
        currentStep={currentStep}
      />

      {/* Step Progress Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Main Chat Scroll Container */}
      <main id="chat-main-container" className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 max-w-4xl w-full mx-auto space-y-4">
        {/* Banner Info */}
        <div className="bg-white border border-[#ece7e2] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#5a544f]">
            <Sparkles className="w-4 h-4 text-[#bc8a5f] shrink-0" />
            <span>
              <strong>1:1 맞춤 AI 상담:</strong> 2026 건강보험료, 단태아/쌍태아, 출산예정일을 말씀해주시면 정확하게 자격을 산출해 드립니다.
            </span>
          </div>
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="shrink-0 font-bold text-[#85665b] bg-[#f8f5f0] hover:bg-[#e9d5ca]/40 px-3 py-1 rounded-full border border-[#ece7e2] transition-colors cursor-pointer"
          >
            소득 계산기 열기 →
          </button>
        </div>

        {/* Chat Messages */}
        {messages.map((msg) => (
          <ChatMessageComponent key={msg.id} message={msg} />
        ))}

        {/* Step 0 Quick Menu Buttons (Rendered if current messages length is 1 at Step 0) */}
        {messages.length === 1 && currentStep === 0 && (
          <div className="my-4 p-5 rounded-3xl bg-[#f8f5f0] border border-[#ece7e2] space-y-3 animate-fadeIn">
            <p className="text-xs font-bold text-[#85665b] flex items-center gap-1.5 mb-1">
              <HelpCircle className="w-4 h-4 text-[#bc8a5f]" />
              <span>자주 물어보시는 주요 상담 주제를 선택하시면 상담원이 바로 답변해 드립니다:</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INITIAL_STEP_0_MENU.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item)}
                  className="p-3.5 rounded-2xl bg-white hover:bg-[#fffcf9] border border-[#ece7e2] hover:border-[#bc8a5f] text-left text-xs sm:text-sm font-semibold text-[#3b3531] shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">{item}</span>
                  <span className="text-[#bc8a5f] font-bold group-hover:translate-x-0.5 transition-transform shrink-0">
                    선택 →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 my-4 font-sans">
            <div className="w-10 h-10 rounded-full bg-[#967468] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-[#ece7e2] px-4 py-3 rounded-2xl shadow-xs text-xs text-[#5a544f] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#bc8a5f] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[#967468] animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-[#e9d5ca] animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 font-semibold text-[#85665b]">
                2026 보건복지부 지침 지식베이스 검증 및 맞춤 답변 생성 중...
              </span>
            </div>
          </div>
        )}

        {/* STEP 4 Follow Up Questions Chips */}
        {!isLoading && activeFollowUps.length > 0 && (
          <FollowUpChips questions={activeFollowUps} onSelectQuestion={handleSendMessage} isLoading={isLoading} />
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Dock */}
      <footer id="chat-input-dock" className="bg-white border-t border-[#ece7e2] p-3 sm:p-4 z-20 font-sans">
        <div className="max-w-4xl mx-auto space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="예: 쌍둥이 임신 중인데 2026년 정부지원금과 소득기준이 어떻게 되나요?"
              disabled={isLoading}
              className="flex-1 px-5 py-3.5 rounded-full bg-[#fcfaf7] border border-[#ece7e2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#bc8a5f] focus:border-[#bc8a5f] text-sm font-medium text-[#3b3531] placeholder-[#8a817a] transition-all pr-12 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="absolute right-2.5 p-2.5 rounded-full bg-[#967468] hover:bg-[#85665b] text-white disabled:opacity-40 transition-all shadow-xs cursor-pointer"
              title="메시지 전송"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Help Hints */}
          <div className="flex items-center justify-between text-[11px] text-[#8a817a] px-2">
            <span className="flex items-center gap-1 text-[#8a817a]">
              <Info className="w-3 h-3 text-[#bc8a5f]" /> 대화 중 확인된 소득/가구 정보는 유지되며 맥락에 맞춰 답변합니다.
            </span>
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="text-[#85665b] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Calculator className="w-3 h-3 text-[#bc8a5f]" /> 건강보험료 소득구간 미리 계산하기
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EligibilityCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onApplyResultToChat={(summary) => handleSendMessage(summary)}
      />

      <ReferenceModal isOpen={isReferenceOpen} onClose={() => setIsReferenceOpen(false)} />
    </div>
  );
}

