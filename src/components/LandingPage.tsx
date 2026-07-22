import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  HeartHandshake,
  Baby,
  Users,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Zap,
  Award,
  BookOpen,
  Key,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  RotateCcw,
  RefreshCw,
  Heart,
  Smile,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { InsuranceType, BirthType } from '../types';
import maternalCareHeroImg from '../assets/images/maternal_care_hero_1784701303412.jpg';
import postpartumCareSpecialistImg from '../assets/images/postpartum_care_specialist_1784701323330.jpg';

interface LandingPageProps {
  apiKey: string;
  isApproved: boolean;
  onVerifyApiKey: (key: string) => Promise<{ success: boolean; message: string }>;
  onResetApiKey: () => void;
  onStartChat: (initialQuestion?: string) => void;
  onOpenCalculator: () => void;
  onOpenReference: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  apiKey,
  isApproved,
  onVerifyApiKey,
  onResetApiKey,
  onStartChat,
  onOpenCalculator,
  onOpenReference,
}) => {
  // API Key Input & Verification State
  const [inputKey, setInputKey] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [showGuideSection, setShowGuideSection] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const handleResetClick = () => {
    setInputKey('');
    setVerifyResult(null);
    setWarningMessage(null);
    onResetApiKey();
  };

  // Quick Calculator State inside Landing Page Hero
  const [quickHousehold, setQuickHousehold] = useState<number>(3);
  const [quickInsuranceType, setQuickInsuranceType] = useState<InsuranceType>('workplace');
  const [quickMonthlyFee, setQuickMonthlyFee] = useState<string>('240000');
  const [quickBirthType, setQuickBirthType] = useState<BirthType>('single');
  const [quickCalculated, setQuickCalculated] = useState<boolean>(false);

  // Gated Access Helper
  const handleGatedAction = (action: () => void) => {
    if (isApproved) {
      action();
    } else {
      setWarningMessage('서비스 이용을 위해 Gemini API Key 승인이 필요합니다. 아래에서 API Key를 입력하고 승인받아 주세요.');
      const el = document.getElementById('api-key-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setVerifyResult({ success: false, message: 'Gemini API Key를 입력해 주세요.' });
      return;
    }

    setIsVerifying(true);
    setVerifyResult(null);
    setWarningMessage(null);

    const res = await onVerifyApiKey(inputKey.trim());
    setIsVerifying(false);
    setVerifyResult(res);
  };

  // 2026 Threshold check helper
  const thresholdMap: Record<number, { workplace: number; local: number; mixed: number }> = {
    2: { workplace: 207200, local: 192100, mixed: 208500 },
    3: { workplace: 263800, local: 255000, mixed: 266000 },
    4: { workplace: 321500, local: 324800, mixed: 326500 },
    5: { workplace: 376800, local: 391200, mixed: 384000 },
    6: { workplace: 431800, local: 454200, mixed: 441000 },
  };

  const currentThreshold = thresholdMap[quickHousehold]?.[quickInsuranceType] || 263800;
  const numericFee = Number(quickMonthlyFee) || 0;
  const isEligible = numericFee <= currentThreshold;

  const handleQuickCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    handleGatedAction(() => {
      setQuickCalculated(true);
    });
  };

  const handleStartChatWithQuickResult = () => {
    handleGatedAction(() => {
      const birthText = quickBirthType === 'twin' ? '쌍태아(쌍둥이)' : quickBirthType === 'triplet_plus' ? '삼태아 이상' : '단태아';
      const insText = quickInsuranceType === 'workplace' ? '직장가입자' : quickInsuranceType === 'local' ? '지역가입자' : '혼합';
      const initialQuery = `${quickHousehold}인 가구(태아 포함), ${insText}, 최근 건강보험료 ${numericFee.toLocaleString()}원, ${birthText} 출산 예정입니다. 2026년 지원 자격과 바우처 이용기간, 지원금을 상세 상담해 주세요.`;
      onStartChat(initialQuery);
    });
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#3b3531] font-sans selection:bg-[#e9d5ca] selection:text-[#5a544f]">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#ece7e2]">
        <div className="max-w-6xl mx-auto px-4 py-3.5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleGatedAction(() => onStartChat())}>
            <div className="w-10 h-10 rounded-full bg-[#967468] text-white flex items-center justify-center shadow-xs">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#3b3531] text-base tracking-tight">해피케어 따스미 AI</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f4ebe4] text-[#85665b] border border-[#e4d5ca]">
                  2026 보건복지부 지침
                </span>
              </div>
              <p className="text-xs text-[#8a817a]">산모·신생아 건강관리 지원 원스톱 센터</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isApproved ? (
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                API 승인됨
              </span>
            ) : (
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                API 승인 필요
              </span>
            )}

            <button
              onClick={() => handleGatedAction(onOpenCalculator)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-[#5a544f] bg-[#f5f0ea] hover:bg-[#e9d5ca]/50 transition-colors cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-[#bc8a5f]" />
              <span>건보료 소득 계산기</span>
            </button>
            <button
              onClick={() => handleGatedAction(onOpenReference)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-[#5a544f] bg-white border border-[#ece7e2] hover:bg-[#f5f0ea] transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#8a817a]" />
              <span>지침 근거 문서</span>
            </button>
            <button
              onClick={() => handleGatedAction(() => onStartChat())}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#967468] hover:bg-[#85665b] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>1:1 AI 상담하기</span>
            </button>
          </div>
        </div>
      </header>

      {/* Prominent Gemini API Key Approval Card Section */}
      <section id="api-key-section" className="pt-6 pb-2 px-4 sm:px-6 max-w-6xl mx-auto">
        <div
          className={`p-5 sm:p-6 rounded-3xl border transition-all shadow-md ${
            isApproved
              ? 'bg-gradient-to-r from-[#f5f9f6] via-white to-[#fbf9f6] border-emerald-200'
              : 'bg-white border-[#e4d5ca] ring-2 ring-[#e9d5ca]/60'
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Title & Status Badge */}
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                  isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-[#f4ebe4] text-[#85665b]'
                }`}
              >
                <Key className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-extrabold text-base sm:text-lg text-[#3b3531]">
                    Gemini API Key 승인 및 연동
                  </h2>
                  {isApproved ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      승인 완료 (Gemini AI 연동)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      승인 필요 (기능 잠김)
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8a817a] mt-0.5">
                  {isApproved
                    ? 'Gemini API Key가 승인되었습니다. 해피케어 따스미 AI 1:1 상담, 소득 판정 계산기, 근거 지침 문서를 자유롭게 이용하실 수 있습니다.'
                    : '해피케어 따스미 AI 상담 및 모든 기능을 이용하시려면 Gemini API Key를 입력하고 승인받아 주세요.'}
                </p>
              </div>
            </div>

            {/* Form or Status Action */}
            {isApproved ? (
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <div className="px-3 py-1.5 rounded-xl bg-[#f8f5f0] border border-[#ece7e2] text-xs font-mono font-bold text-[#5a544f]">
                  {apiKey.length > 8 ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : 'Key Verified'}
                </div>
                <button
                  onClick={handleResetClick}
                  className="px-3.5 py-2 rounded-full bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>키 재설정 / 해제</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifySubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 min-w-[260px]">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Gemini API Key 입력 (AIzaSy...)"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#ece7e2] bg-[#fcfaf7] focus:bg-white focus:ring-2 focus:ring-[#bc8a5f] text-xs font-mono text-[#3b3531] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-[#8a817a] hover:text-[#3b3531]"
                    title={showPassword ? '키 숨기기' : '키 보기'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-4 py-2.5 rounded-xl bg-[#967468] hover:bg-[#85665b] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>승인 검증 중...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5 text-[#e9d5ca]" />
                      <span>API 키 검증 & 승인받기</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Warning banner when gated action was blocked */}
          {warningMessage && !isApproved && (
            <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{warningMessage}</span>
            </div>
          )}

          {/* Verification Result Feedback */}
          {verifyResult && (
            <div
              className={`mt-3 p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
                verifyResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {verifyResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{verifyResult.message}</span>
            </div>
          )}

          {!isApproved && (
            <div className="mt-3 pt-3 border-t border-[#ece7e2]/80 flex flex-col gap-3">
              <div className="text-xs text-[#8a817a] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-medium">
                  <Info className="w-3.5 h-3.5 text-[#bc8a5f]" />
                  <span>Gemini API 키가 없으신가요? 1분 만에 무료로 발급받으실 수 있습니다.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGuideSection(!showGuideSection)}
                    className="text-[#85665b] font-bold hover:underline inline-flex items-center gap-1 text-xs cursor-pointer"
                  >
                    <span>발급 방법 {showGuideSection ? '접기' : '펼쳐보기'}</span>
                    {showGuideSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-[#d8ceca]">|</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-full bg-[#f4ebe4] hover:bg-[#e9d5ca] text-[#85665b] font-extrabold text-xs inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Google AI Studio 열기</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Inline Collapsible Step-by-Step Guide */}
              {showGuideSection && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#fbf9f6] border border-[#e4d5ca] space-y-4 animate-fadeIn text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-[#3b3531] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#bc8a5f]" />
                      Gemini API Key 무료 발급 3단계 가이드
                    </h3>
                    <button
                      onClick={() => setShowGuideModal(true)}
                      className="text-[#85665b] font-bold text-xs underline cursor-pointer"
                    >
                      상세안내 모달로 보기
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Step 1 */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#ece7e2] space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#f4ebe4] text-[#85665b] font-extrabold flex items-center justify-center text-xs">
                          1
                        </span>
                        <span className="font-extrabold text-[#3b3531]">Google AI Studio 접속</span>
                      </div>
                      <p className="text-[11px] text-[#8a817a] leading-relaxed">
                        구글 공식 AI 스튜디오 키 발급 페이지에 접속하고 구글 계정으로 로그인합니다.
                      </p>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#85665b] font-bold hover:underline inline-flex items-center gap-1 pt-1"
                      >
                        <span>aistudio.google.com 열기</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Step 2 */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#ece7e2] space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#f4ebe4] text-[#85665b] font-extrabold flex items-center justify-center text-xs">
                          2
                        </span>
                        <span className="font-extrabold text-[#3b3531]">Create API Key 클릭</span>
                      </div>
                      <p className="text-[11px] text-[#8a817a] leading-relaxed">
                        화면의 <strong className="text-[#3b3531]">[Create API key]</strong> 파란색 버튼을 누릅니다.
                      </p>
                      <p className="text-[10px] text-[#b0a8a2]">
                        * 새 프로젝트 생성 시 기본 프로젝트가 자동 할당됩니다.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#ece7e2] space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#f4ebe4] text-[#85665b] font-extrabold flex items-center justify-center text-xs">
                          3
                        </span>
                        <span className="font-extrabold text-[#3b3531]">키 복사 및 붙여넣기</span>
                      </div>
                      <p className="text-[11px] text-[#8a817a] leading-relaxed">
                        생성된 <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-[#5a544f]">AIzaSy...</code> 키를 복사해 위 입력창에 붙여넣고 승인받으세요.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f4ebe4]/60 border border-[#e4d5ca] text-[11px] text-[#5a544f] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>보안 및 개인정보 보호:</strong> 입력하신 API Key는 서버에 저장되지 않고 개별 사용자의 브라우저 로컬 스토리지에만 안전하게 보관됩니다.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Detailed Gemini API Key Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#ece7e2] relative animate-scaleUp max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-[#8a817a] hover:text-[#3b3531] p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#f4ebe4] text-[#85665b] flex items-center justify-center shrink-0">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#3b3531]">Gemini API Key 무료 발급 가이드</h3>
                <p className="text-xs text-[#8a817a]">구글 계정으로 1분 만에 키를 발급받아 연동하세요.</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-[#5a544f]">
              <div className="p-4 rounded-2xl bg-[#fbf9f6] border border-[#ece7e2] space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#967468] text-white font-extrabold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#3b3531]">Google AI Studio 발급 페이지 이동</h4>
                    <p className="text-xs text-[#8a817a] mt-0.5">
                      구글 계정만 있다면 누구나 무료로 Gemini API 키를 발급받으실 수 있습니다.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-full bg-[#967468] hover:bg-[#85665b] text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <span>Google AI Studio 열기 (새 창)</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('https://aistudio.google.com/app/apikey');
                          setCopiedUrl(true);
                          setTimeout(() => setCopiedUrl(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-full bg-white border border-[#ece7e2] hover:bg-[#f5f0ea] text-[#5a544f] font-semibold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8a817a]" />}
                        <span>{copiedUrl ? '주소 복사됨!' : '주소 복사'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-[#ece7e2]">
                  <div className="w-6 h-6 rounded-full bg-[#967468] text-white font-extrabold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#3b3531]">[Create API key] 버튼 클릭</h4>
                    <p className="text-xs text-[#8a817a] mt-0.5">
                      화면에 보이는 파란색 <strong>Create API key</strong> 버튼을 누르신 후 안내에 따라 키 생성을 완료해 주세요.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-[#ece7e2]">
                  <div className="w-6 h-6 rounded-full bg-[#967468] text-white font-extrabold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#3b3531]">API Key 복사 및 해피케어 따스미 AI 승인</h4>
                    <p className="text-xs text-[#8a817a] mt-0.5">
                      생성된 <code className="bg-stone-200 px-1 py-0.5 rounded font-mono text-[#3b3531]">AIzaSy...</code> 형태의 문자열을 복사한 뒤, 해피케어 따스미 AI 메인 화면의 입력창에 붙여넣고 <strong>[API 키 검증 & 승인받기]</strong>를 누르시면 모든 메뉴가 즉시 해제됩니다!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <p className="font-extrabold flex items-center gap-1.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>비용 및 할당량(Quota) 안내</span>
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Gemini API의 Free Tier(무료 요금제)를 이용하면 일상 상담 및 가구별 건강보험료 계산 상담에 충분한 무료 요청량이 제공됩니다. 별도 유료 결제 수단을 등록하지 않아도 안전하게 이용할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 rounded-full bg-[#967468] hover:bg-[#85665b] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                가이드 확인 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Motion Graphics */}
      <section className="relative overflow-hidden py-10 sm:py-16 px-4 sm:px-6">
        {/* Background Organic Glow Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#f3e5dc]/60 blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-[#e8d2c4]/50 blur-3xl pointer-events-none animate-pulse-glow" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Top Motion Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#ece7e2] shadow-2xs text-xs font-semibold text-[#85665b]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>2026년 최신 보건복지부 지원 지침 100% 완전 연동</span>
              <Sparkles className="w-3.5 h-3.5 text-[#bc8a5f]" />
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-[1.25] text-[#3b3531] tracking-tight">
              복잡한 출산지원금 지침은 그만! <br />
              <span className="text-[#967468] underline decoration-[#e9d5ca] underline-offset-8">
                내 아기 맞춤 지원금
              </span>
              과 <br />
              바우처 일수를 1초 만에 확인하세요
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#615953] leading-relaxed max-w-xl">
              태아 포함 가구원 수, 건강보험료, 단태아·쌍태아 출산 유형만 선택하면 <br className="hidden sm:inline" />
              <strong>2026년 최신 중위소득 150% 판정</strong>과 가구별 정부 지원금액을 한눈에 정확히 알려드립니다.
            </p>

            {/* Quick Benefits Bullet Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#ece7e2] shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-[#f4ebe4] text-[#85665b] flex items-center justify-center shrink-0">
                  <Baby className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#3b3531]">태아 가구원 산정</p>
                  <p className="text-[#8a817a]">2인→3인 소득 상향</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#ece7e2] shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-[#f4ebe4] text-[#85665b] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#3b3531]">맞벌이 부부 특례</p>
                  <p className="text-[#8a817a]">소액 건보료 50% 감면</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#ece7e2] shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-[#f4ebe4] text-[#85665b] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#3b3531]">100% 검증 근거</p>
                  <p className="text-[#8a817a]">보건복지부 공식 출처</p>
                </div>
              </div>
            </div>

            {/* Hero CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                onClick={() => handleGatedAction(() => onStartChat())}
                className="flex items-center gap-2.5 px-6 py-4 rounded-full bg-[#967468] hover:bg-[#85665b] text-white text-base font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                <span>💬 해피케어 따스미 AI와 1:1 맞춤 상담 시작하기</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleGatedAction(onOpenCalculator)}
                className="flex items-center gap-2 px-5 py-4 rounded-full bg-white hover:bg-[#f5f0ea] text-[#5a544f] border border-[#ece7e2] text-sm font-bold transition-all cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-[#bc8a5f]" />
                <span>건보료 계산기 단독 실행</span>
              </button>
            </div>
          </motion.div>

          {/* Right Hero Image & Interactive Quick Calculator Card Stack */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Hero Maternal Care Warm Image Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#e4d5ca] group">
              <img
                src={maternalCareHeroImg}
                alt="산모와 아기의 따뜻한 모습"
                referrerPolicy="no-referrer"
                className="w-full h-52 sm:h-60 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3b3531]/80 via-[#3b3531]/20 to-transparent" />
              
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#85665b] border border-white/40 flex items-center gap-1.5 shadow-xs">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>2026년 산모·신생아 안심 지원</span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs font-semibold text-[#f3e5dc] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#e9d5ca]" />
                  보건복지부 산후조리 바우처 정식 연동
                </p>
                <h3 className="text-sm sm:text-base font-extrabold mt-0.5">
                  내 아이에게 딱 맞는 산후도우미 지원혜택 조회
                </h3>
              </div>
            </div>

            {/* Quick Calculator Box */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#ece7e2] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#967468] text-white text-[11px] font-bold px-3 py-1 rounded-bl-2xl">
                2026 원스톱 소득 판정
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#f4ebe4] text-[#85665b] flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#3b3531]">나의 지원 유형 빠른 조회</h3>
                  <p className="text-xs text-[#8a817a]">조건을 입력하면 바로 판정 결과를 확인합니다</p>
                </div>
              </div>

              <form onSubmit={handleQuickCalculate} className="space-y-4">
                {/* Household Size */}
                <div>
                  <label className="block text-xs font-bold text-[#5a544f] mb-1.5">
                    1. 가구원 수 (출생 예정 태아 포함)
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setQuickHousehold(num);
                          setQuickCalculated(false);
                        }}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          quickHousehold === num
                            ? 'bg-[#967468] text-white shadow-2xs'
                            : 'bg-[#f8f5f0] hover:bg-[#e9d5ca]/40 text-[#5a544f] border border-[#ece7e2]'
                        }`}
                      >
                        {num}인{num === 6 && '+'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Birth Type */}
                <div>
                  <label className="block text-xs font-bold text-[#5a544f] mb-1.5">
                    2. 출산 예정 형태
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'single', label: '단태아 (1명)' },
                      { id: 'twin', label: '쌍태아 (쌍둥이)' },
                      { id: 'triplet_plus', label: '삼태아 이상' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setQuickBirthType(item.id as BirthType);
                          setQuickCalculated(false);
                        }}
                        className={`py-2 px-1 text-[11px] rounded-xl font-bold transition-all cursor-pointer ${
                          quickBirthType === item.id
                            ? 'bg-[#967468] text-white shadow-2xs'
                            : 'bg-[#f8f5f0] hover:bg-[#e9d5ca]/40 text-[#5a544f] border border-[#ece7e2]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Insurance Type & Fee */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#5a544f]">
                      3. 월 건강보험료 본인부담금
                    </label>
                    <div className="flex gap-1 text-[11px]">
                      {(['workplace', 'local'] as InsuranceType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setQuickInsuranceType(t);
                            setQuickCalculated(false);
                          }}
                          className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                            quickInsuranceType === t ? 'bg-[#3b3531] text-white' : 'text-[#8a817a]'
                          }`}
                        >
                          {t === 'workplace' ? '직장' : '지역'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={quickMonthlyFee}
                      onChange={(e) => {
                        setQuickMonthlyFee(e.target.value);
                        setQuickCalculated(false);
                      }}
                      placeholder="예: 240000"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ece7e2] bg-[#fcfaf7] focus:bg-white focus:ring-2 focus:ring-[#bc8a5f] text-sm font-bold text-[#3b3531] outline-none pr-10"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-[#8a817a]">원</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#967468] hover:bg-[#85665b] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  <span>2026 판정 결과 즉시 확인하기</span>
                </button>
              </form>

              {/* Instant Calculation Result Box */}
              {quickCalculated && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-2xl bg-[#f5f0ea] border border-[#e4d5ca] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8a817a]">2026년 기준 판정</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isEligible
                          ? 'bg-[#e9d5ca] text-[#7a5b50] border border-[#d6c6b9]'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {isEligible ? '기본지원 대상 (150% 이하)' : '예외지원 대상 (150% 초과)'}
                    </span>
                  </div>

                  <div className="text-xs text-[#5a544f] leading-relaxed">
                    <p className="font-bold text-sm text-[#3b3531]">
                      {isEligible ? 'A-통-①형 (정부지원 바우처 대폭 지원)' : 'A-라-①형 (보건소 예외지원 검토)'}
                    </p>
                    <p className="mt-1">
                      {quickHousehold}인 가구 150% 기준 건보료: <strong>{currentThreshold.toLocaleString()}원</strong>
                    </p>
                    <p className="text-[11px] text-[#85665b] mt-0.5">
                      {quickBirthType === 'twin'
                        ? '쌍태아: 표준 15일 / 연장 20일 바우처 선택 가능'
                        : '단태아: 표준 10일 / 연장 15일 바우처 선택 가능'}
                    </p>
                  </div>

                  <button
                    onClick={handleStartChatWithQuickResult}
                    className="w-full py-2.5 rounded-xl bg-[#3b3531] hover:bg-[#2a2522] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <span>이 결과로 1:1 맞춤 AI 상담 이어가기</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visual Feature Showcase Section */}
      <section className="py-16 px-4 sm:px-6 bg-[#f7f3ee] border-t border-[#ece7e2]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Image Showcase Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#e4d5ca] group">
              <img
                src={postpartumCareSpecialistImg}
                alt="전문 산후도우미 맞춤 상담"
                referrerPolicy="no-referrer"
                className="w-full h-72 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3b3531]/75 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#85665b] text-xs font-bold border border-white/50 inline-flex items-center gap-1.5 shadow-2xs">
                  <Smile className="w-3.5 h-3.5 text-amber-600" />
                  <span>검증된 산후도우미 지원혜택</span>
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white pt-1">
                  전문 산후관리사 1:1 방문 서비스 지원
                </h3>
                <p className="text-xs text-[#f3e5dc]">
                  산모 영양 관리, 신생아 목욕 및 케어, 수유 보조, 가사 지원까지 바우처로 이용하세요.
                </p>
              </div>
            </div>

            {/* Floating Overlay Badge */}
            <div className="absolute -bottom-5 -right-2 sm:right-4 bg-white p-4 rounded-2xl shadow-xl border border-[#ece7e2] max-w-[220px] hidden sm:block">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#f4ebe4] text-[#85665b] flex items-center justify-center shrink-0 font-extrabold text-xs">
                  150%
                </div>
                <div className="text-xs">
                  <p className="font-extrabold text-[#3b3531]">기준중위소득 지원</p>
                  <p className="text-[11px] text-[#8a817a]">가구별 정부지원금 최대</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Text & Feature Points */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#ece7e2] text-xs font-bold text-[#85665b]">
              <HeartHandshake className="w-4 h-4 text-[#bc8a5f]" />
              <span>따뜻하고 전문적인 산후케어 안내</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#3b3531] leading-tight">
              어려운 서류 절차 없이 <br />
              <span className="text-[#967468]">복지로 신청까지 한 번에</span> 안내해 드려요
            </h2>

            <p className="text-sm sm:text-base text-[#615953] leading-relaxed">
              보건복지부 공식 출산 지원 사업 가이드라인을 바탕으로, 예비 부모님이 꼭 알아야 할 지원 자격과 신청 시기를 AI가 맞춤 분석해 드립니다.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#ece7e2] shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#3b3531]">태아 포함 가구원수 소득 재산정</h4>
                  <p className="text-xs text-[#8a817a] mt-0.5">
                    임신 중인 경우 태아를 가구원 수에 포함하여 기준 소득 범위를 넓혀 드립니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#ece7e2] shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#3b3531]">단태아 · 쌍태아 맞춤 바우처 일수 산정</h4>
                  <p className="text-xs text-[#8a817a] mt-0.5">
                    단태아 최대 15일, 쌍태아 최대 20일, 삼태아 이상 최대 25일 지원기간 단축/표준/연장 옵션 안내.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#ece7e2] shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#3b3531]">맞벌이 부부 건보료 50% 감면 특례 계산</h4>
                  <p className="text-xs text-[#8a817a] mt-0.5">
                    맞벌이 가구 소득 산정 시 낮은 쪽 건보료를 50% 감면 합산하여 자격 요건을 완화해 드립니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleGatedAction(() => onStartChat())}
                className="px-6 py-3.5 rounded-full bg-[#967468] hover:bg-[#85665b] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>나의 맞춤 바우처 일수 AI로 알아보기</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Bento Section */}
      <section className="py-16 px-4 sm:px-6 bg-white border-y border-[#ece7e2]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-widest text-[#bc8a5f] uppercase">
              WHY CHOOSE TASEUMI
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#3b3531]">
              20-30대 임산부들이 '해피케어 따스미'를 신뢰하는 이유
            </h2>
            <p className="text-sm sm:text-base text-[#8a817a]">
              어려운 정부 행정 서류와 소득판정을 쉽고 똑똑하게 해결해 드립니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-[#fbf9f6] border border-[#ece7e2] space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#f4ebe4] text-[#85665b] flex items-center justify-center font-bold text-xl">
                01
              </div>
              <h3 className="font-extrabold text-lg text-[#3b3531]">2026 최신 지침 100% 반영</h3>
              <p className="text-xs sm:text-sm text-[#615953] leading-relaxed">
                매년 개정되는 보건복지부 산모·신생아 건강관리 지원 기준중위소득 150% 금액을 완벽하게 적용합니다.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-[#fbf9f6] border border-[#ece7e2] space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#f4ebe4] text-[#85665b] flex items-center justify-center font-bold text-xl">
                02
              </div>
              <h3 className="font-extrabold text-lg text-[#3b3531]">맞벌이 50% 감면 특례</h3>
              <p className="text-xs sm:text-sm text-[#615953] leading-relaxed">
                부부 맞벌이 시 상대적으로 적은 건보료 50% 감면 합산 규정을 적용하여 지원 자격 가능성을 극대화합니다.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-[#fbf9f6] border border-[#ece7e2] space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#f4ebe4] text-[#85665b] flex items-center justify-center font-bold text-xl">
                03
              </div>
              <h3 className="font-extrabold text-lg text-[#3b3531]">원스톱 복지로 신청 연결</h3>
              <p className="text-xs sm:text-sm text-[#615953] leading-relaxed">
                출산 예정일 D-40부터 복지로/정부24 모바일 신청 방법과 필요 제출서류 맞춤 체크리스트를 제공합니다.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-3xl bg-[#fbf9f6] border border-[#ece7e2] space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#f4ebe4] text-[#85665b] flex items-center justify-center font-bold text-xl">
                04
              </div>
              <h3 className="font-extrabold text-lg text-[#3b3531]">100% 공식 출처 근거 명시</h3>
              <p className="text-xs sm:text-sm text-[#615953] leading-relaxed">
                허위 및 왜곡된 블로그 정보 없이 보건복지부, 복지로 등 승인된 공식 검증 링크만을 기반으로 답변합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Frequently Asked Questions */}
      <section className="py-16 px-4 sm:px-6 bg-[#fbf9f6]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3b3531]">
              임산부님들이 가장 자주 질문하는 TOP 5
            </h2>
            <p className="text-xs sm:text-sm text-[#8a817a]">
              질문을 클릭하시면 AI 해피케어 따스미가 1:1 대화로 상세 답변해 드립니다
            </p>
          </div>

          <div className="space-y-3">
            {[
              '쌍둥이(쌍태아) 임신 중인데 지원금액과 바우처 일수가 어떻게 되나요?',
              '맞벌이 부부인데 건강보험료 50% 감면 혜택은 어떻게 계산되나요?',
              '출산 예정일이 얼마 남지 않았는데 언제 복지로에서 신청해야 하나요?',
              '건강보험료 150% 기준을 초과하면 전혀 지원을 못 받나요? (보건소 예외지원)',
              '산모·신생아 건강관리사 분이 오시면 주로 어떤 서비스를 제공해 주시나요?',
            ].map((q, idx) => (
              <div
                key={idx}
                onClick={() => handleGatedAction(() => onStartChat(q))}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#ece7e2] hover:border-[#bc8a5f] shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#f4ebe4] text-[#85665b] font-bold text-xs flex items-center justify-center shrink-0">
                    Q{idx + 1}
                  </span>
                  <span className="font-semibold text-xs sm:text-sm text-[#3b3531] group-hover:text-[#85665b] transition-colors">
                    {q}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8a817a] group-hover:text-[#bc8a5f] group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-16 px-4 sm:px-6 bg-[#3b3531] text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-[#e9d5ca]">
            <Award className="w-4 h-4" />
            <span>2026년 최신 지침 보건복지부 연동 완료</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
            지금 바로 내 아기를 위한 <br className="sm:hidden" />
            맞춤 지원 혜택을 확인해보세요
          </h2>

          <p className="text-sm sm:text-base text-[#d6c6b9] max-w-lg mx-auto">
            1:1 대화형 상담 AI 해피케어 따스미가 산모님의 상황에 딱 맞추어 필요한 서류와 신청 방법까지 차근차근 안내해 드립니다.
          </p>

          <div className="pt-2">
            <button
              onClick={() => handleGatedAction(() => onStartChat())}
              className="px-8 py-4 rounded-full bg-[#967468] hover:bg-[#85665b] text-white text-base font-extrabold shadow-xl hover:shadow-2xl transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>해피케어 따스미 AI 챗봇 상담 시작하기</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#ece7e2] text-center text-xs text-[#8a817a] space-y-2 bg-white">
        <p className="font-bold text-[#5a544f]">
          보건복지부 2026년 산모·신생아 건강관리 지원사업 지침 준수
        </p>
        <p className="max-w-2xl mx-auto text-[11px] leading-relaxed text-[#a19991]">
          본 안내 서비스는 보건복지부 공식 가이드라인을 참고하여 제공하는 정보이며, 지자체별 상세 예외 규정에 따른 최종 판정 결과는 관할 보건소 및 복지로(www.bokjiro.go.kr)에서 확인하시기 바랍니다.
        </p>
      </footer>
    </div>
  );
};

