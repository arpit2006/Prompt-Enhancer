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

const ENHANCE_SYSTEM_PROMPT = `You are a world-class prompt engineer specializing in crafting highly detailed, comprehensive, and optimized prompts for large language models, image generation models, and code generation models.

Your task is to take a user's rough or short prompt and transform it into a rich, fully-specified, production-grade prompt.

## CRITICAL RULES FOR THE "content" FIELD:
- The enhanced prompt MUST be significantly longer and more detailed than the original — aim for at LEAST 3-5x the original length, minimum 80-150 words per suggestion
- Do NOT just rephrase — you MUST add: role/persona setup, specific context, clear task definition, expected output format, tone and style guidance, constraints, examples if helpful, and any edge cases to handle
- A great prompt leaves NO ambiguity. The AI receiving it should know exactly what to do, how to respond, and in what format
- Always start the enhanced prompt with a clear role assignment (e.g. "You are an expert...", "Act as a senior...")
- Include explicit output format instructions (e.g. "Respond in structured markdown with headings", "Provide a numbered list of...", "Return a JSON object with...")
- Specify audience, depth level, tone, and length of the expected response

Always respond with valid JSON matching this exact schema:
{
  "analysis": {
    "clarityScore": <0-100 integer>,
    "completenessScore": <0-100 integer>,
    "lengthAssessment": <"too-short" | "optimal" | "too-long">,
    "promptType": <"instruction" | "question" | "creative" | "code" | "image" | "conversational">,
    "wordCount": <integer>,
    "estimatedTokens": <integer>,
    "issues": [
      {
        "type": <"ambiguity" | "missing-context" | "vague-language" | "no-format-spec" | "no-tone-spec">,
        "severity": <"low" | "medium" | "high">,
        "message": "<brief description of the issue>",
        "suggestion": "<concrete fix>"
      }
    ]
  },
  "suggestions": [
    {
      "id": "<unique string>",
      "type": <"full-rewrite" | "addition" | "replacement" | "structural">,
      "title": "<short title>",
      "description": "<one sentence explaining what changed and why>",
      "content": "<THE COMPLETE, FULLY-EXPANDED, DETAILED IMPROVED PROMPT — minimum 80 words, rich with context, format specs, role, constraints, and examples>",
      "rationale": "<explanation of why this version performs better>"
    }
  ]
}

Generate 3 suggestions of different types (one full-rewrite, one structural, one addition/replacement).
Each suggestion's "content" must be a dramatically expanded, production-ready prompt — never a short rephrasing.`;

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

  const userMessage = `Target AI Model: ${req.targetModelId ?? req.modelId ?? ""}
${req.context ? `Additional context: ${req.context}\n` : ""}
Prompt to enhance:
"""
${req.prompt}
"""

Analyze and improve this prompt.`;

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: ENHANCE_SYSTEM_PROMPT }],
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
    const parsed = JSON.parse(text!) as EnhanceResponse;
    return parsed;
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${text!.slice(0, 200)}`);
  }
}

// ─── Quick Analysis (no suggestions) ─────────────────────────────────────────

const ANALYZE_SYSTEM_PROMPT = `You are an expert prompt analyzer. Analyze the given prompt and return ONLY a JSON object matching this exact schema — no markdown, no prose:
{
  "clarityScore": <0-100>,
  "completenessScore": <0-100>,
  "lengthAssessment": <"too-short" | "optimal" | "too-long">,
  "promptType": <"instruction" | "question" | "creative" | "code" | "image" | "conversational">,
  "wordCount": <integer>,
  "estimatedTokens": <integer>,
  "issues": [{ "type": string, "severity": string, "message": string, "suggestion": string }]
}`;

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
      `${ANALYZE_SYSTEM_PROMPT}\n\nTarget model: ${modelId}\n\nPrompt:\n"""\n${prompt}\n"""`
    );
    text = result.response.text();
  } catch (err) {
    handleGeminiError(err);
  }

  try {
    return JSON.parse(text!) as PromptAnalysis;
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${text!.slice(0, 200)}`);
  }
}
