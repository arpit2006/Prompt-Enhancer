/**
 * Groq cloud inference client.
 * Uses the OpenAI-compatible Groq API — no extra package needed.
 * Model: llama-3.3-70b-versatile (free tier, very fast)
 *
 * Required: GROQ_API_KEY env var  OR  caller-supplied key via header.
 * Get yours free at: https://console.groq.com
 */

import type { EnhanceRequest, EnhanceResponse, PromptAnalysis } from "@/types";

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

const ENHANCE_SYSTEM = `You are a world-class prompt engineer specializing in crafting highly detailed, comprehensive, and optimized prompts for large language models, image generation models, and code generation models.

Your task is to take a user's rough or short prompt and transform it into a rich, fully-specified, production-grade prompt.

## CRITICAL RULES FOR THE "content" FIELD:
- The enhanced prompt MUST be significantly longer and more detailed than the original — aim for at LEAST 3-5x the original length, minimum 80-150 words per suggestion
- Do NOT just rephrase — you MUST add: role/persona setup, specific context, clear task definition, expected output format, tone and style guidance, constraints, examples if helpful, and any edge cases to handle
- A great prompt leaves NO ambiguity. The AI receiving it should know exactly what to do, how to respond, and in what format
- Always start the enhanced prompt with a clear role assignment (e.g. "You are an expert...", "Act as a senior...")
- Include explicit output format instructions (e.g. "Respond in structured markdown with headings", "Provide a numbered list of...", "Return a JSON object with...")
- Specify audience, depth level, tone, and length of the expected response

Respond with valid JSON matching this EXACT schema (no markdown, no prose):
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
        "message": "<brief description>",
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
      "rationale": "<why this version performs better>"
    }
  ]
}

Generate 3 suggestions (one full-rewrite, one structural, one addition/replacement).
Each suggestion's "content" must be a dramatically expanded, production-ready prompt — never a short rephrasing.`;

const ANALYZE_SYSTEM = `You are an expert prompt analyzer. Analyze the given prompt and return ONLY a JSON object — no markdown, no prose:
{
  "clarityScore": <0-100>,
  "completenessScore": <0-100>,
  "lengthAssessment": <"too-short" | "optimal" | "too-long">,
  "promptType": <"instruction" | "question" | "creative" | "code" | "image" | "conversational">,
  "wordCount": <integer>,
  "estimatedTokens": <integer>,
  "issues": [{ "type": string, "severity": string, "message": string, "suggestion": string }]
}`;

// ─── Public API ───────────────────────────────────────────────────────────────

export async function enhancePromptGroq(
  req: EnhanceRequest,
  callerApiKey?: string
): Promise<EnhanceResponse> {
  const key = resolveApiKey(callerApiKey);

  const userMessage = `Target AI Model: ${req.targetModelId ?? req.modelId ?? ""}
${req.context ? `Additional context: ${req.context}\n` : ""}
Prompt to enhance:
"""
${req.prompt}
"""

Analyze and improve this prompt. Return JSON only.`;

  const raw = await chatComplete(
    key,
    [
      { role: "system", content: ENHANCE_SYSTEM },
      { role: "user", content: userMessage },
    ],
    0.5,
    8000
  );

  try {
    return JSON.parse(extractJSON(raw)) as EnhanceResponse;
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
      { role: "system", content: ANALYZE_SYSTEM },
      {
        role: "user",
        content: `Target model: ${modelId}\n\nPrompt:\n"""\n${prompt}\n"""\n\nReturn JSON only.`,
      },
    ],
    0.1,
    1024
  );

  try {
    return JSON.parse(extractJSON(raw)) as PromptAnalysis;
  } catch {
    throw new Error(`Groq returned invalid JSON: ${raw.slice(0, 200)}`);
  }
}
