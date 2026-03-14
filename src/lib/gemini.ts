/**
 * Google Gemini (AI Studio) client wrapper.
 * Used exclusively in server-side API routes — never called from the browser.
 *
 * Requires environment variable: GOOGLE_GEMINI_API_KEY
 * Get yours at: https://aistudio.google.com/app/apikey
 */

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import type { EnhanceRequest, EnhanceResponse, PromptAnalysis } from "@/types";
import {
  buildAnalyzeUserMessage,
  buildEnhanceUserMessage,
  normalizeEnhanceResponse,
  normalizePromptAnalysis,
  SHARED_ANALYZE_SYSTEM_PROMPT,
  SHARED_ENHANCE_SYSTEM_PROMPT,
} from "@/lib/prompt-enhancement";

// ─── Client Factory ───────────────────────────────────────────────────────────

/**
 * Resolves the API key: prefers the caller-supplied key (from the request
 * header), then falls back to the server env var for self-hosted deployments.
 */
function resolveApiKey(callerKey?: string): string {
  const key = callerKey?.trim() || process.env.GOOGLE_GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "No Gemini API key provided. Enter your key in the app settings."
    );
  }
  return key;
}

function getClient(apiKey: string): GoogleGenerativeAI {
  return new GoogleGenerativeAI(apiKey);
}

// ─── Error Normalisation ──────────────────────────────────────────────────────

/**
 * Detects 429 / quota-exceeded errors from the Gemini SDK, extracts the
 * retry-after delay (seconds), and re-throws a structured error that API
 * routes can inspect.
 */
export interface RateLimitError extends Error {
  isRateLimit: true;
  retryAfter: number; // seconds
}

function handleGeminiError(err: unknown): never {
  const message = err instanceof Error ? err.message : String(err);

  if (
    message.includes("[429") ||
    message.includes("Too Many Requests") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("quota")
  ) {
    const match = message.match(/retry in (\d+(?:\.\d+)?)s/i);
    const retryAfter = match ? Math.ceil(parseFloat(match[1])) : 30;
    const e = new Error(
      `Rate limit exceeded. Free-tier quota reached. Retrying in ${retryAfter}s.`
    ) as RateLimitError;
    e.isRateLimit = true;
    e.retryAfter = retryAfter;
    throw e;
  }

  throw err instanceof Error ? err : new Error(message);
}

// ─── Safety Settings ──────────────────────────────────────────────────────────

const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// ─── Prompt Enhancement ───────────────────────────────────────────────────────

export async function enhancePrompt(
  req: EnhanceRequest,
  callerApiKey?: string
): Promise<EnhanceResponse> {
  const client = getClient(resolveApiKey(callerApiKey));
  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature: 0.5,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });

  const userMessage = buildEnhanceUserMessage(req);

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: SHARED_ENHANCE_SYSTEM_PROMPT }],
      },
      {
        role: "model",
        parts: [
          {
            text: '{"acknowledged": true, "role": "prompt engineer ready to analyze and enhance prompts with structured JSON responses"}',
          },
        ],
      },
    ],
  });

  let text: string;
  try {
    const result = await chat.sendMessage(userMessage);
    text = result.response.text();
  } catch (err) {
    handleGeminiError(err);
  }

  try {
    return normalizeEnhanceResponse(JSON.parse(text!), req.prompt);
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${text!.slice(0, 200)}`);
  }
}

// ─── Quick Analysis (no suggestions) ─────────────────────────────────────────

export async function analyzePrompt(
  prompt: string,
  modelId: string,
  callerApiKey?: string
): Promise<PromptAnalysis> {
  const client = getClient(resolveApiKey(callerApiKey));
  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
  });

  let text: string;
  try {
    const result = await model.generateContent(
      `${SHARED_ANALYZE_SYSTEM_PROMPT}\n\n${buildAnalyzeUserMessage(prompt, modelId)}`
    );
    text = result.response.text();
  } catch (err) {
    handleGeminiError(err);
  }

  try {
    return normalizePromptAnalysis(JSON.parse(text!), prompt);
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${text!.slice(0, 200)}`);
  }
}
