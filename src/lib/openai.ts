/**
 * OpenAI API integration — uses fetch directly (no extra package needed).
 * Compatible with GPT-4o, GPT-4, GPT-4o-mini, etc.
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

const OPENAI_API_BASE = "https://api.openai.com/v1";

function extractJSON(text: string): string {
  // Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  // Find first { or [ and paired closing bracket
  const start = text.search(/[{[]/);
  if (start !== -1) return text.slice(start);
  return text;
}

async function openaiChat(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const resp = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.6,
      max_tokens: 6000,
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } }).error?.message ?? `OpenAI error ${resp.status}`;
    throw new Error(msg);
  }

  const data = (await resp.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? "";
}

export async function enhancePromptOpenAI(
  req: EnhanceRequest,
  callerKey: string,
  model: string
): Promise<EnhanceResponse> {
  const apiKey = callerKey || process.env.OPENAI_API_KEY || "";
  if (!apiKey) throw new Error("OpenAI API key is required.");

  const raw = await openaiChat(
    apiKey,
    model,
    SHARED_ENHANCE_SYSTEM_PROMPT,
    buildEnhanceUserMessage(req)
  );
  return normalizeEnhanceResponse(JSON.parse(extractJSON(raw)), req.prompt);
}

export async function analyzePromptOpenAI(
  prompt: string,
  callerKey: string,
  model: string,
  targetModelId?: string
): Promise<PromptAnalysis> {
  const apiKey = callerKey || process.env.OPENAI_API_KEY || "";
  if (!apiKey) throw new Error("OpenAI API key is required.");

  const targetHint = targetModelId
    ? `Analyze with the context that this prompt is intended for: ${targetModelId}.`
    : "";

  const raw = await openaiChat(
    apiKey,
    model,
    `${SHARED_ANALYZE_SYSTEM_PROMPT}\n${targetHint}`,
    buildAnalyzeUserMessage(prompt, targetModelId ?? model)
  );
  return normalizePromptAnalysis(JSON.parse(extractJSON(raw)), prompt);
}
