/**
 * Ollama local LLM client.
 * Communicates with a locally-running Ollama instance via its
 * OpenAI-compatible REST API at http://localhost:11434/v1.
 *
 * Install Ollama: https://ollama.com
 * Pull a model:  ollama pull llama3.2
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

// ─── Public API ───────────────────────────────────────────────────────────────

export async function enhancePromptLocal(
  req: EnhanceRequest,
  model: string,
  endpoint = "http://localhost:11434"
): Promise<EnhanceResponse> {
  const userMsg = buildEnhanceUserMessage(req);

  const raw = await chatComplete(endpoint, model, SHARED_ENHANCE_SYSTEM_PROMPT, userMsg, 0.4);
  try {
    return normalizeEnhanceResponse(JSON.parse(extractJSON(raw)), req.prompt);
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
  const userMsg = buildAnalyzeUserMessage(prompt, modelId);
  const raw = await chatComplete(endpoint, model, SHARED_ANALYZE_SYSTEM_PROMPT, userMsg, 0.1);
  try {
    return normalizePromptAnalysis(JSON.parse(extractJSON(raw)), prompt);
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
