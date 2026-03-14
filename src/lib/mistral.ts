/**
 * Mistral AI client wrapper.
 * Uses the Mistral Chat Completions API directly (no extra package needed).
 * Default model: mistral-large-latest
 *
 * Required: MISTRAL_API_KEY env var  OR  caller-supplied key via request header.
 * Get yours at: https://console.mistral.ai
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

const MISTRAL_BASE = "https://api.mistral.ai/v1";
export const MISTRAL_MODEL = "mistral-small-latest";

// ─── Key resolution ───────────────────────────────────────────────────────────

function resolveApiKey(callerKey?: string): string {
  const key = callerKey?.trim() || process.env.MISTRAL_API_KEY;
  if (!key) {
    throw new Error(
      "No Mistral API key provided. Enter your key in the app settings."
    );
  }
  return key;
}

// ─── JSON extraction ──────────────────────────────────────────────────────────

function extractJSON(raw: string): string {
  // 1. Try fenced code block first
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();

  // 2. Find the outermost balanced { } object
  const start = raw.indexOf("{");
  if (start !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < raw.length; i++) {
      const ch = raw[i];
      if (escape) { escape = false; continue; }
      if (ch === "\\" && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (!inString) {
        if (ch === "{") depth++;
        else if (ch === "}") { depth--; if (depth === 0) return raw.slice(start, i + 1); }
      }
    }
    // Depth never closed — return from start anyway and let JSON.parse report the error
    return raw.slice(start);
  }

  return raw.trim();
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function chatComplete(
  apiKey: string,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  temperature = 0.4,
  maxTokens = 3500
): Promise<string> {
  const res = await fetch(`${MISTRAL_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MISTRAL_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      message?: string;
      error?: { message?: string };
    };
    const msg = err?.message ?? err?.error?.message ?? res.statusText;
    if (res.status === 429) {
      const e = Object.assign(
        new Error(`Mistral rate limit: ${msg}`),
        { isRateLimit: true, retryAfter: 30 }
      );
      throw e;
    }
    throw new Error(`Mistral API error ${res.status}: ${msg}`);
  }

  type ChatResponse = { choices: { message: { content: string } }[] };
  const data = (await res.json()) as ChatResponse;
  return data.choices[0].message.content ?? "";
}

// ─── Shared prompts (same schema as the other providers) ─────────────────────

// ─── Public API ───────────────────────────────────────────────────────────────

export async function enhancePromptMistral(
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
    3500
  );

  try {
    return normalizeEnhanceResponse(JSON.parse(extractJSON(raw)), req.prompt);
  } catch {
    console.error("[mistral] enhance parse failed. Raw response:", raw.slice(0, 500));
    throw new Error("Mistral returned invalid JSON.");
  }
}

export async function analyzePromptMistral(
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
    console.error("[mistral] analyze parse failed. Raw response:", raw.slice(0, 500));
    throw new Error("Mistral returned invalid JSON.");
  }
}
