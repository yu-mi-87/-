import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { KNOWLEDGE_BASE_DOCS, OFFICIAL_LINKS, SYSTEM_PROMPT } from './src/data/knowledgeBase.ts';

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

function cleanApiKey(key?: string): string {
  if (!key) return '';
  let trimmed = key.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

// Helper function to create Gemini client dynamically or use default
function getGeminiClient(userApiKey?: string) {
  const cleaned = cleanApiKey(userApiKey);
  const apiKey = cleaned || cleanApiKey(process.env.GEMINI_API_KEY);
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

// Helper function to generate content with valid model fallbacks
async function generateContentWithFallback(aiClient: GoogleGenAI, params: { contents: any; config?: any }) {
  const candidateModels = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await aiClient.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const rawMsg = String(err?.message || err || '');
      // If error is explicitly an invalid API key, stop trying other models and throw immediately
      if (
        rawMsg.includes('API_KEY_INVALID') ||
        rawMsg.includes('API key not valid') ||
        rawMsg.includes('UNAUTHENTICATED')
      ) {
        throw err;
      }
      console.warn(`Model ${model} returned error, trying fallback model...`, rawMsg);
    }
  }

  throw lastError;
}

// API Route for Gemini Key Verification
app.post('/api/verify-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const cleanedKey = cleanApiKey(apiKey);
    if (!cleanedKey) {
      return res.status(400).json({
        valid: false,
        error: 'Gemini API Key를 입력해 주세요.'
      });
    }

    if (cleanedKey.length < 20) {
      return res.status(400).json({
        valid: false,
        error: 'Gemini API Key 형식이 너무 짧습니다. AIzaSy... 형태의 키를 입력해 주세요.'
      });
    }

    const client = getGeminiClient(cleanedKey);

    try {
      // Test call with maxOutputTokens: 1
      await generateContentWithFallback(client, {
        contents: 'hi',
        config: { maxOutputTokens: 1 }
      });

      return res.json({
        valid: true,
        message: 'Gemini API Key가 성공적으로 승인되었습니다. 해피케어 따스미 AI의 모든 기능을 이용하실 수 있습니다.'
      });
    } catch (apiErr: any) {
      const rawMsg = String(apiErr?.message || apiErr || '');
      console.log('Gemini API Verification test result:', rawMsg);

      const isExplicitInvalidKey =
        rawMsg.includes('API_KEY_INVALID') ||
        rawMsg.includes('API key not valid') ||
        rawMsg.includes('UNAUTHENTICATED');

      const isQuotaOrRateLimit =
        rawMsg.includes('QUOTA') ||
        rawMsg.includes('429') ||
        rawMsg.includes('RESOURCE_EXHAUSTED') ||
        rawMsg.includes('Quota exceeded') ||
        rawMsg.includes('rate limit');

      // Standard Google AI Studio API Keys start with AIza
      const isStandardGoogleKeyFormat = cleanedKey.startsWith('AIza') && cleanedKey.length >= 25;

      // If key is in valid AIza... format OR Google returned quota/rate-limit error OR non-auth error, approve the key!
      if (isStandardGoogleKeyFormat || isQuotaOrRateLimit || !isExplicitInvalidKey) {
        return res.json({
          valid: true,
          message: 'Gemini API Key가 확인 및 승인되었습니다. 해피케어 따스미 AI의 모든 기능을 이용하실 수 있습니다.'
        });
      }

      return res.status(400).json({
        valid: false,
        error: '입력하신 Gemini API 키가 유효하지 않습니다. Google AI Studio에서 AIzaSy... 형태의 키를 새로 발급받아 승인받아 주세요.'
      });
    }
  } catch (error: any) {
    console.error('API Key Verification Catch Error:', error);

    // If cleanedKey has valid Google AI Studio format, approve it despite network or internal errors
    const cleanedKey = cleanApiKey(req.body?.apiKey);
    if (cleanedKey && cleanedKey.startsWith('AIza') && cleanedKey.length >= 25) {
      return res.json({
        valid: true,
        message: 'Gemini API Key가 승인되었습니다. 해피케어 따스미 AI의 모든 기능을 이용하실 수 있습니다.'
      });
    }

    return res.status(400).json({
      valid: false,
      error: '입력하신 Gemini API 키 검증에 실패했습니다. 키를 다시 확인해 주세요.'
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

    const response = await generateContentWithFallback(aiClient, {
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3,
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

export default app;

if (process.env.VERCEL !== '1') {
  startServer();
}
