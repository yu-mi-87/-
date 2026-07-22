import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { KNOWLEDGE_BASE_DOCS, OFFICIAL_LINKS } from './src/data/knowledgeBase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// System Prompt for Maternal & Newborn Health Management Support Chatbot
const SYSTEM_PROMPT = `
# SYSTEM PROMPT: 산모·신생아 건강관리 지원사업 전문 상담 AI '따스미' (2026년 최신 지침)

## 역할과 톤
당신은 대한민국 보건복지부 "2026년 산모·신생아 건강관리 지원사업" 전담 AI 상담원 "따스미"입니다.
20~30대 예비 산모 및 부모님을 위해 다정하고 세심하며, 법령·지침 데이터에 기반한 최고 수준의 전문성을 제공합니다.
사용자를 "산모님", "부모님"으로 다정하게 호칭하며, 복잡한 관공서 문장 대신 직관적이고 가독성 높은 한국어로 명확하게 설명합니다.

이 프롬프트는 단발성 답변이 아니라 **대화형(멀티턴) 상담**을 전제로 합니다.
이미 확인한 정보(가구원수, 건보료, 태아 수 등)는 절대 다시 묻지 않고 대화 맥락을 완벽히 기억합니다.

---

## STEP 0. 첫 인사 및 핵심 질문 메뉴
사용자가 구체적인 질문 없이 시작한 경우 따뜻한 인사와 핵심 메뉴를 제안합니다.

안녕하세요! 2026년 산모·신생아 건강관리 지원사업 전문 AI 상담원 '따스미'입니다. 🌸
산모님과 소중한 아기의 첫 출발을 축하드립니다! 무엇이 궁금하신가요? 아래 항목을 선택하시거나 편하게 말씀해 주세요.

1. 2026년 소득기준 & 건강보험료 지원자격 판정
2. 지원 금액 및 가구별 본인부담금 자동 산출
3. 복지로/정부24 모바일 원스톱 신청 및 필요서류
4. 단태아/쌍태아/다태아별 서비스 바우처 이용 기간
5. 맞벌이 건보료 50% 감면 및 보건소 예외지원 안내

---

## STEP 1. 사용자 상황 파악
필요한 정보 중 미확인 항목만 자연스럽게 1~2개씩 확인합니다:
- 가구원 수 (산모, 배우자, 주민등록상 직계존비속 + 출생예정 신생아/태아)
- 최근월 건강보험료 본인부담금 및 가입 형태(직장/지역/혼합, 맞벌이 여부)
- 출산 형태 (단태아 / 쌍태아 / 삼태아 이상)
- 신청 시기 및 지자체/보건소 위치

---

## STEP 2. 상담 결과 및 맞춤형 가이드
확인된 정보로 정확한 결과를 제시합니다:
- 지원 가능 여부 (기본지원 A-통형 / 예외지원 A-라형 등)
- 예상 지원 금액 및 본인부담금 비율
- 서비스 바우처 선택 가능 일수 (단축/표준/연장)
- 복지로(www.bokjiro.go.kr) 또는 정부24(www.gov.kr) 모바일 신청 방법

---

## STEP 3. 근거 표기 원칙 (2026년 지침 기준)
답변에 포함되는 모든 기준, 금액, 절차는 2026년 최신 지침에 근거합니다.
1. 핵심 안내 항목 끝에는 반드시 [출처: 문서명, 2026년 기준] 표기.
2. 링크는 공식 검증 사이트만 제공: 복지로(https://www.bokjiro.go.kr), 정부24(https://www.gov.kr), 보건복지부(https://www.mohw.go.kr), 사회서비스 전자바우처(https://www.socialservice.or.kr)
3. 안내 하단 공통 안내 문구:
   "본 안내는 2026년 보건복지부 지침 기준이며, 지자체별 세부 예외지원 규정은 관할 보건소에서 최종 확인하실 수 있습니다."

---

## STEP 4. 연관 질문 제시 (JSON 포맷)
답변 마무리에 다음 추천 질문을 작성하고, 프론트엔드가 버튼 칩으로 렌더링하도록 맨 끝에 JSON 블록을 포함하십시오:

\`\`\`json
{
  "followUpQuestions": [
    "추천질문 1",
    "추천질문 2",
    "추천질문 3"
  ],
  "currentStep": 2
}
\`\`\`

---

## 지식베이스 참고 정보
${KNOWLEDGE_BASE_DOCS.map(doc => `### ${doc.title} (${doc.section})\n${doc.content}\n${doc.sourceTag}`).join('\n\n')}

승인된 공식 URL 목록:
${OFFICIAL_LINKS.map(link => `- ${link.name}: ${link.url}`).join('\n')}
`;

// Helper function to create Gemini client dynamically or use default
function getGeminiClient(userApiKey?: string) {
  const apiKey = (userApiKey && userApiKey.trim()) ? userApiKey.trim() : (process.env.GEMINI_API_KEY || '');
  if (!apiKey) {
    throw new Error('Gemini API Key가 제공되지 않았습니다. API 키를 먼저 입력해 주세요.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// API Route for Gemini Key Verification
app.post('/api/verify-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const client = getGeminiClient(apiKey);

    // Perform a lightweight verification call to test key validity
    await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Gemini API Key Approval Verification Test',
    });

    return res.json({
      valid: true,
      message: 'Gemini API Key가 정상적으로 승인되었습니다. 따스미 AI의 모든 기능을 이용하실 수 있습니다.'
    });
  } catch (error: any) {
    console.error('API Key Verification Failed:', error);
    let userFriendlyError = 'Gemini API 키 검증에 실패했습니다. 올바른 키인지 확인해 주세요.';
    const rawMsg = String(error?.message || '');
    if (rawMsg.includes('API_KEY_INVALID') || rawMsg.includes('API key not valid') || rawMsg.includes('400')) {
      userFriendlyError = '입력하신 Gemini API 키가 유효하지 않습니다. AIzaSy... 형태의 올바른 API Key를 입력해 주세요.';
    } else if (rawMsg.includes('QUOTA_EXCEEDED') || rawMsg.includes('429')) {
      userFriendlyError = '해당 Gemini API 키의 한도(Quota)가 초과되었습니다. 새로운 키를 발급받아 사용해 주세요.';
    }
    return res.status(400).json({
      valid: false,
      error: userFriendlyError
    });
  }
});

// API Route for Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { history, message, isFirstTurn, apiKey } = req.body;

    if (!message && !isFirstTurn) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const aiClient = getGeminiClient(apiKey);

    // Format conversation history for Gemini
    const formattedContents = [];

    if (history && Array.isArray(history)) {
      for (const h of history) {
        formattedContents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      }
    }

    // Append current message
    if (message) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }]
      });
    } else if (isFirstTurn && formattedContents.length === 0) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: '안녕하세요. 상담을 시작하고 싶습니다.' }]
      });
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3, // low temperature for high accuracy & compliance with guidelines
      }
    });

    const replyText = response.text || '';

    // Extract JSON block if present for followUpQuestions
    let followUpQuestions: string[] = [];
    let currentStep = 1;

    const jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/);
    let cleanText = replyText;

    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (Array.isArray(parsed.followUpQuestions)) {
          followUpQuestions = parsed.followUpQuestions;
        }
        if (typeof parsed.currentStep === 'number') {
          currentStep = parsed.currentStep;
        }
        // Remove JSON block from reply display
        cleanText = replyText.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
      } catch (e) {
        console.error('Failed to parse response JSON block:', e);
      }
    }

    // Extract sources if formatted like [출처: ...]
    const sourceMatches = Array.from(cleanText.matchAll(/\[출처:\s*([^\]]+)\]/g)).map(m => m[0]);
    const uniqueSources = Array.from(new Set(sourceMatches));

    return res.json({
      text: cleanText,
      followUpQuestions,
      currentStep,
      sources: uniqueSources
    });
  } catch (error: any) {
    console.error('Gemini Chat API Error:', error);
    return res.status(500).json({
      error: '상담 서비스 응답 처리 중 오류가 발생했습니다.',
      details: error.message || String(error)
    });
  }
});

// API Route for Eligibility Calculation
app.post('/api/calculate-eligibility', (req, res) => {
  const { householdSize, insuranceType, monthlyFee } = req.body;

  const size = Number(householdSize) || 3;
  const fee = Number(monthlyFee) || 0;
  const type = insuranceType || 'workplace';

  // 2026 기준중위소득 150% 건강보험료 본인부담금 판정표
  const thresholdMap: Record<number, { workplace: number; local: number; mixed: number }> = {
    2: { workplace: 207200, local: 192100, mixed: 208500 },
    3: { workplace: 263800, local: 255000, mixed: 266000 },
    4: { workplace: 321500, local: 324800, mixed: 326500 },
    5: { workplace: 376800, local: 391200, mixed: 384000 },
    6: { workplace: 431800, local: 454200, mixed: 441000 },
  };

  const lookupSize = Math.min(Math.max(size, 2), 6);
  const thresholds = thresholdMap[lookupSize] || thresholdMap[4];
  const thresholdFee = thresholds[type as keyof typeof thresholds] || thresholds.workplace;

  const isEligibleStandard = fee <= thresholdFee;

  let typeCode = '';
  let typeName = '';
  let description = '';
  let copaymentRateEstimate = '';

  if (isEligibleStandard) {
    typeCode = 'A-통-①형 (기본지원)';
    typeName = '기준중위소득 150% 이하 일반 지원';
    description = '정부 지원 바우처가 대부분 상쇄되어 산모 본인부담금이 대폭 경감됩니다.';
    copaymentRateEstimate = '총 서비스 금액의 약 20% ~ 35% 본인 부담';
  } else {
    typeCode = 'A-라-①형 (예외지원)';
    typeName = '기준중위소득 150% 초과 예외지원 대상';
    description = '관할 보건소의 예외지원 대상(다자녀, 장애산모, 희귀난치, 지자체 확대사업 등)에 따라 지원 가능합니다.';
    copaymentRateEstimate = '총 서비스 금액의 약 40% ~ 55% 본인 부담 (보건소 확인 필요)';
  }

  res.json({
    householdSize: size,
    insuranceType: type,
    monthlyFee: fee,
    threshold150Fee: thresholdFee,
    isEligibleStandard,
    typeCode,
    typeName,
    description,
    copaymentRateEstimate
  });
});

// Start Server & Vite Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
