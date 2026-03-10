/**
 * OpenAI API integration — uses fetch directly (no extra package needed).
 * Compatible with GPT-4o, GPT-4, GPT-4o-mini, etc.
 */

export interface OpenAIEnhanceResult {
  suggestions: Array<{
    id: string;
    title: string;
    content: string;
    explanation: string;
    improvement: number;
  }>;
  analysis: {
    clarity: number;
    specificity: number;
    structure: number;
    completeness: number;
    estimatedTokens: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

export interface OpenAIAnalysisResult {
  clarity: number;
  specificity: number;
  structure: number;
  completeness: number;
  estimatedTokens: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

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
  prompt: string,
  callerKey: string,
  model: string,
  targetModelId?: string
): Promise<OpenAIEnhanceResult> {
  const apiKey = callerKey || process.env.OPENAI_API_KEY || "";
  if (!apiKey) throw new Error("OpenAI API key is required.");

  const targetHint = targetModelId
    ? `The user wants to optimize this prompt specifically for use with: ${targetModelId}.`
    : "";

  const systemPrompt = `You are a world-class prompt engineer specializing in crafting highly detailed, comprehensive, and optimized prompts for large language models.
${targetHint}

## CRITICAL RULES FOR THE "content" FIELD:
- The enhanced prompt MUST be significantly longer and more detailed than the original — aim for at LEAST 3-5x the original length, minimum 80-150 words per suggestion
- Do NOT just rephrase — you MUST add: role/persona setup, specific context, clear task definition, expected output format, tone and style guidance, constraints, examples if helpful, and edge cases to handle
- Always start the enhanced prompt with a clear role assignment (e.g. "You are an expert...", "Act as a senior...")
- Include explicit output format instructions and specify audience, depth level, tone, and length of expected response
- A great prompt leaves NO ambiguity whatsoever

Return ONLY valid JSON matching this schema (no markdown fences):
{
  "suggestions": [
    {
      "id": "string",
      "title": "short title",
      "content": "THE COMPLETE, FULLY-EXPANDED, DETAILED IMPROVED PROMPT — minimum 80 words, rich with context, format specs, role, constraints, and examples",
      "explanation": "why this is better",
      "improvement": 0-100
    }
  ],
  "analysis": {
    "clarity": 0-100,
    "specificity": 0-100,
    "structure": 0-100,
    "completeness": 0-100,
    "estimatedTokens": number,
    "strengths": ["..."],
    "weaknesses": ["..."],
    "suggestions": ["short tips..."]
  }
}
Provide 3 distinct improvement variations. Each "content" must be a dramatically expanded, production-ready prompt.`;

  const raw = await openaiChat(apiKey, model, systemPrompt, `Prompt to enhance:\n\n${prompt}`);
  const parsed = JSON.parse(extractJSON(raw)) as OpenAIEnhanceResult;
  return parsed;
}

export async function analyzePromptOpenAI(
  prompt: string,
  callerKey: string,
  model: string,
  targetModelId?: string
): Promise<OpenAIAnalysisResult> {
  const apiKey = callerKey || process.env.OPENAI_API_KEY || "";
  if (!apiKey) throw new Error("OpenAI API key is required.");

  const targetHint = targetModelId
    ? `Analyze with the context that this prompt is intended for: ${targetModelId}.`
    : "";

  const systemPrompt = `You are an expert prompt engineer. Analyze the given prompt and score it.
${targetHint}

Return ONLY valid JSON (no markdown fences):
{
  "clarity": 0-100,
  "specificity": 0-100,
  "structure": 0-100,
  "completeness": 0-100,
  "estimatedTokens": number,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": ["short improvement tips..."]
}`;

  const raw = await openaiChat(apiKey, model, systemPrompt, `Prompt to analyze:\n\n${prompt}`);
  return JSON.parse(extractJSON(raw)) as OpenAIAnalysisResult;
}
