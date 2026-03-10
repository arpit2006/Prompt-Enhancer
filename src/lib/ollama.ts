/**
 * Ollama local LLM client.
 * Communicates with a locally-running Ollama instance via its
 * OpenAI-compatible REST API at http://localhost:11434/v1.
 *
 * Install Ollama: https://ollama.com
 * Pull a model:  ollama pull llama3.2
 */

import type { EnhanceRequest, EnhanceResponse, PromptAnalysis } from "@/types";

// ─── JSON Extraction ──────────────────────────────────────────────────────────
// Local models often wrap JSON in markdown code fences — strip those out.

function extractJSON(raw: string): string {
  // Try fenced block first: ```json ... ```
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  // Try bare JSON object
  const bare = raw.match(/(\{[\s\S]*\})/);
  if (bare) return bare[1].trim();
  throw new Error(`Could not extract JSON from model response.`);
}

// ─── Chat Completion Helper ───────────────────────────────────────────────────

async function chatComplete(
  endpoint: string,
  model: string,
  system: string,
  user: string,
  temperature: number
): Promise<string> {
  const url = `${endpoint.replace(/\/$/, "")}/v1/chat/completions`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature,
        stream: false,
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Do not include the endpoint URL in the error message to prevent SSRF info disclosure
    throw new Error(
      `Cannot reach Ollama. Is it running?\n\n` +
      `Install: https://ollama.com\nStart:   ollama serve\nPull:    ollama pull ${model}\n\n` +
      `(${msg})`
    );
  }

  if (!res.ok) {
    if (res.status === 404)
      throw new Error(
        `Ollama model "${model}" not found.\nRun: ollama pull ${model}`
      );
    throw new Error(`Ollama returned HTTP ${res.status}.`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Ollama returned an empty response.");
  return text;
}

// ─── Shared System Prompts (identical to Gemini routes) ───────────────────────

const ENHANCE_SYSTEM_PROMPT = `You are a world-class prompt engineer specializing in crafting highly detailed, comprehensive, and optimized prompts for large language models, image generation models, and code generation models.

Your task is to take a user's rough or short prompt and transform it into a rich, fully-specified, production-grade prompt.

## CRITICAL RULES FOR THE "content" FIELD:
- The enhanced prompt MUST be significantly longer and more detailed than the original — aim for at LEAST 3-5x the original length, minimum 80-150 words per suggestion
- Do NOT just rephrase — you MUST add: role/persona setup, specific context, clear task definition, expected output format, tone and style guidance, constraints, examples if helpful, and edge cases
- A great prompt leaves NO ambiguity. The AI receiving it should know exactly what to do, how to respond, and in what format
- Always start the enhanced prompt with a clear role assignment (e.g. "You are an expert...", "Act as a senior...")
- Include explicit output format instructions and specify audience, depth, tone, and response length

Return ONLY valid JSON — no prose, no markdown fences — matching this exact schema:
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
      "rationale": "<explanation of why this version performs better>"
    }
  ]
}
Generate 3 suggestions (one full-rewrite, one structural, one addition/replacement). Return ONLY the JSON object.`;

const ANALYZE_SYSTEM_PROMPT = `You are an expert prompt analyzer. Return ONLY a JSON object — no prose, no markdown fences — matching this schema:
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

export async function enhancePromptLocal(
  req: EnhanceRequest,
  model: string,
  endpoint = "http://localhost:11434"
): Promise<EnhanceResponse> {
  const userMsg = `Target AI Model: ${req.modelId}
${req.context ? `Additional context: ${req.context}\n` : ""}Prompt to enhance:
"""
${req.prompt}
"""
Analyze and improve this prompt. Return ONLY the JSON object.`;

  const raw = await chatComplete(endpoint, model, ENHANCE_SYSTEM_PROMPT, userMsg, 0.4);
  try {
    return JSON.parse(extractJSON(raw)) as EnhanceResponse;
  } catch {
    throw new Error(`Could not parse model response as JSON:\n${raw.slice(0, 300)}`);
  }
}

export async function analyzePromptLocal(
  prompt: string,
  modelId: string,
  model: string,
  endpoint = "http://localhost:11434"
): Promise<PromptAnalysis> {
  const userMsg = `Target model: ${modelId}\n\nPrompt:\n"""\n${prompt}\n"""\n\nReturn ONLY the JSON object.`;
  const raw = await chatComplete(endpoint, model, ANALYZE_SYSTEM_PROMPT, userMsg, 0.1);
  try {
    return JSON.parse(extractJSON(raw)) as PromptAnalysis;
  } catch {
    throw new Error(`Could not parse model response as JSON:\n${raw.slice(0, 300)}`);
  }
}

// ─── Connection Test ──────────────────────────────────────────────────────────

export async function testOllamaConnection(
  endpoint: string
): Promise<{ ok: boolean; models: string[]; error?: string }> {
  try {
    const res = await fetch(`${endpoint.replace(/\/$/, "")}/api/tags`);
    if (!res.ok) return { ok: false, models: [], error: `Ollama returned ${res.status}` };
    const data = (await res.json()) as { models?: { name: string }[] };
    const models = (data.models ?? []).map((m) => m.name);
    return { ok: true, models };
  } catch {
    return { ok: false, models: [], error: "Cannot connect to Ollama. Is it running?" };
  }
}
