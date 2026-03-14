/**
 * Groq cloud inference client.
 * Uses the OpenAI-compatible Groq API — no extra package needed.
 * Model: llama-3.3-70b-versatile (free tier, very fast)
 *
 * Required: GROQ_API_KEY env var  OR  caller-supplied key via header.
 * Get yours free at: https://console.groq.com
 */

import type { EnhanceRequest, EnhanceResponse, PromptAnalysis } from "@/types";
import {
  buildAnalyzeUserMessage,
  buildEnhanceUserMessage,
  normalizeEnhanceResponse,
  normalizePromptAnalysis,
  SHARED_ANALYZE_SYSTEM_PROMPT,
  SHARED_ENHANCE_SYSTEM_PROMPT,
} from "@/lib/prompt-enhancement";

const GROQ_BASE = "https://api.groq.com/openai/v1";
export const GROQ_MODEL = "llama-3.3-70b-versatile";

// ─── Key resolution ───────────────────────────────────────────────────────────

function resolveApiKey(callerKey?: string): string {
  const key = callerKey?.trim() || process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error(
      "No Groq API key provided. Enter your key in the app settings."
    );
  }
  return key;
}

// ─── JSON extraction (strips markdown fences if model wraps output) ───────────

function extractJSON(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return fenced ? fenced[1].trim() : raw.trim();
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function chatComplete(
  apiKey: string,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  temperature = 0.4,
  maxTokens = 4096
): Promise<string> {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    const msg = err?.error?.message ?? res.statusText;
    if (res.status === 429) {
      const e = Object.assign(new Error(`Groq rate limit: ${msg}`), {
        isRateLimit: true,
        retryAfter: 30,
      });
      throw e;
    }
    throw new Error(`Groq API error ${res.status}: ${msg}`);
  }

  type ChatResponse = { choices: { message: { content: string } }[] };
  const data = (await res.json()) as ChatResponse;
  return data.choices[0].message.content ?? "";
}

// ─── Prompts (same schema as Gemini lib) ─────────────────────────────────────

// ─── Public API ───────────────────────────────────────────────────────────────

export async function enhancePromptGroq(
  req: EnhanceRequest,
  callerApiKey?: string
): Promise<EnhanceResponse> {
  const key = resolveApiKey(callerApiKey);

  const userMessage = buildEnhanceUserMessage(req);

  const raw = await chatComplete(
    key,
    [
      { role: "system", content: SHARED_ENHANCE_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    0.5,
    8000
  );

  try {
    return normalizeEnhanceResponse(JSON.parse(extractJSON(raw)), req.prompt);
  } catch {
    throw new Error(`Groq returned invalid JSON: ${raw.slice(0, 200)}`);
  }
}

export async function analyzePromptGroq(
  prompt: string,
  modelId: string,
  callerApiKey?: string
): Promise<PromptAnalysis> {
  const key = resolveApiKey(callerApiKey);

  const raw = await chatComplete(
    key,
    [
      { role: "system", content: SHARED_ANALYZE_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildAnalyzeUserMessage(prompt, modelId),
      },
    ],
    0.1,
    1024
  );

  try {
    return normalizePromptAnalysis(JSON.parse(extractJSON(raw)), prompt);
  } catch {
    throw new Error(`Groq returned invalid JSON: ${raw.slice(0, 200)}`);
  }
}
