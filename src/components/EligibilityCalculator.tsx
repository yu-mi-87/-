import React, { useState } from 'react';
import { Calculator, X, ShieldCheck, Send, Users } from 'lucide-react';
import { CalculatorResult, InsuranceType } from '../types';

interface EligibilityCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResultToChat: (summaryText: string) => void;
}

export const EligibilityCalculator: React.FC<EligibilityCalculatorProps> = ({
  isOpen,
  onClose,
  onApplyResultToChat,
}) => {
  const [householdSize, setHouseholdSize] = useState<number>(3); // 산모+배우자+태아 (3인 가구)
  const [insuranceType, setInsuranceType] = useState<InsuranceType>('workplace');
  const [monthlyFee, setMonthlyFee] = useState<string>('240000'); // 24만원 예시
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  if (!isOpen) return null;

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const response = await fetch('/api/calculate-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          householdSize,
          insuranceType,
          monthlyFee: Number(monthlyFee) || 0,
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSendToChat = () => {
    if (!result) return;
    const summary = `[2026 소득 판정 계산 결과]
• 가구원 수: ${result.householdSize}인 가구 (산모/배우자/직계/출생예정 태아 포함)
• 건강보험 구분: ${result.insuranceType === 'workplace' ? '직장가입자' : result.insuranceType === 'local' ? '지역가입자' : '혼합'}
• 월 건강보험료 본인부담금: ${result.monthlyFee.toLocaleString()}원
• 2026 기준중위소득 150% 기준액: ${result.threshold150Fee.toLocaleString()}원
• 판정 예상 결과: ${result.typeCode} - ${result.typeName}
이 조건에서 제가 받을 수 있는 2026년 정부지원금액과 본인부담금, 복지로/보건소 신청 절차를 상세 상담해주세요!`;

    onApplyResultToChat(summary);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3b3531]/50 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#ece7e2] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#967468] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">2026 건강보험료 소득 판정 계산기</h3>
              <p className="text-xs text-[#e9d5ca]">기준 중위소득 150% 자격판정 자동 산출</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Guide banner */}
          <div className="bg-[#f8f5f0] border border-[#ece7e2] rounded-2xl p-3.5 text-xs text-[#5a544f] flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#bc8a5f] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-[#3b3531] mb-0.5">2026 가구원 수 산정 공식</span>
              산모, 배우자, 주민등록상 직계존비속 + <strong className="underline text-[#85665b]">출생 예정 태아(신생아)</strong>를 포함합니다. (예: 부부 + 첫째 태아 = 3인 가구)
            </div>
          </div>

          {/* Form Controls */}
          <div className="space-y-4">
            {/* Household Size */}
            <div>
              <label className="block text-xs font-bold text-[#5a544f] mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#bc8a5f]" />
                <span>총 가구원 수 (태아 포함)</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setHouseholdSize(num)}
                    className={`py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                      householdSize === num
                        ? 'bg-[#967468] text-white border-[#967468] shadow-2xs'
                        : 'bg-[#f8f5f0] hover:bg-[#e9d5ca]/40 text-[#5a544f] border-[#ece7e2]'
                    }`}
                  >
                    {num}인 {num === 6 && '이상'}
                  </button>
                ))}
              </div>
            </div>

            {/* Insurance Type */}
            <div>
              <label className="block text-xs font-bold text-[#5a544f] mb-2">건강보험 가입 형태</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'workplace', label: '직장가입자' },
                  { id: 'local', label: '지역가입자' },
                  { id: 'mixed', label: '혼합 (맞벌이 등)' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setInsuranceType(type.id as InsuranceType)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      insuranceType === type.id
                        ? 'bg-[#967468] text-white border-[#967468] shadow-2xs'
                        : 'bg-[#f8f5f0] hover:bg-[#e9d5ca]/40 text-[#5a544f] border-[#ece7e2]'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Insurance Fee */}
            <div>
              <label className="block text-xs font-bold text-[#5a544f] mb-2">
                최근월 건강보험료 본인부담금 합산액 (원)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value)}
                  placeholder="예: 240000"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece7e2] bg-[#fcfaf7] focus:bg-white focus:ring-2 focus:ring-[#bc8a5f] focus:border-[#bc8a5f] text-sm font-bold pr-12 text-[#3b3531] outline-none"
                />
                <span className="absolute right-4 top-2.5 text-xs font-bold text-[#8a817a]">원</span>
              </div>
              <p className="text-[11px] text-[#8a817a] mt-1">
                * 순수 건강보험료 기준 (장기요양보험료 제외) / 맞벌이는 적은 쪽 건보료 50% 감면 합산 가능
              </p>
            </div>

            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full py-3.5 rounded-full bg-[#967468] hover:bg-[#85665b] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>{isCalculating ? '2026 판정 계산 중...' : '2026 소득구간 판정하기'}</span>
            </button>
          </div>

          {/* Result Card */}
          {result && (
            <div className="mt-4 p-4 rounded-2xl bg-[#f8f5f0] border border-[#ece7e2] space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8a817a]">2026년 판정 결과</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    result.isEligibleStandard
                      ? 'bg-[#e9d5ca] text-[#7a5b50] border border-[#d6c6b9]'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {result.isEligibleStandard ? '기본지원 대상 (150% 이하)' : '예외지원 대상 (150% 초과)'}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-[#3b3531] text-base">{result.typeCode}</h4>
                <p className="text-xs text-[#8a817a] mt-0.5">{result.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#ece7e2]">
                <div className="bg-white p-2.5 rounded-xl border border-[#ece7e2]">
                  <span className="text-[#8a817a] block text-[11px]">입력 건강보험료</span>
                  <strong className="text-[#3b3531] text-sm">{result.monthlyFee.toLocaleString()}원</strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#ece7e2]">
                  <span className="text-[#8a817a] block text-[11px]">2026 상한 기준액</span>
                  <strong className="text-[#bc8a5f] text-sm">{result.threshold150Fee.toLocaleString()}원</strong>
                </div>
              </div>

              <button
                onClick={handleSendToChat}
                className="w-full mt-2 py-3 rounded-full bg-[#3b3531] hover:bg-[#2a2522] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#e9d5ca]" />
                <span>이 결과로 1:1 해피케어 따스미 AI와 바로 상담하기</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

