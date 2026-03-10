/**
 * Test-Your-Prompt route.
 * Sends the user's prompt directly to the chosen LLM (no enhancement system
 * prompt) and returns the raw completion text. Used by the Test Panel to show
 * how the current prompt performs in practice.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanitiseInput, enforceContentLength, validateOllamaEndpoint, sanitiseClientError } from "@/lib/security";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface TestPromptRequest {
  prompt: string;
  mode: "gemini" | "groq" | "openai" | "local";
  ollamaEndpoint?: string;
  ollamaModel?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function runGemini(prompt: string, apiKey: string): Promise<string> {
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function runGroq(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Groq error ${res.status}`);
  }
  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content ?? "";
}

async function runOpenAI(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `OpenAI error ${res.status}`);
  }
  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content ?? "";
}

async function runOllama(
  prompt: string,
  endpoint: string,
  model: string
): Promise<string> {
  const res = await fetch(`${endpoint}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`Ollama error ${res.status}`);
  const data = (await res.json()) as {
    message?: { content?: string };
    response?: string;
  };
  return data.message?.content ?? data.response ?? "";
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as TestPromptRequest;

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    body.prompt = sanitiseInput(body.prompt);
    const lengthError = enforceContentLength(body.prompt);
    if (lengthError) return lengthError;

    let response = "";

    switch (body.mode) {
      case "gemini": {
        const key =
          req.headers.get("x-gemini-api-key")?.trim() ||
          process.env.GOOGLE_GEMINI_API_KEY;
        if (!key)
          return NextResponse.json(
            { error: "No Gemini API key provided." },
            { status: 401 }
          );
        response = await runGemini(body.prompt, key);
        break;
      }
      case "groq": {
        const key =
          req.headers.get("x-groq-api-key")?.trim() ||
          process.env.GROQ_API_KEY;
        if (!key)
          return NextResponse.json(
            { error: "No Groq API key provided." },
            { status: 401 }
          );
        response = await runGroq(body.prompt, key);
        break;
      }
      case "openai": {
        const key =
          req.headers.get("x-openai-api-key")?.trim() ||
          process.env.OPENAI_API_KEY;
        if (!key)
          return NextResponse.json(
            { error: "No OpenAI API key provided." },
            { status: 401 }
          );
        response = await runOpenAI(body.prompt, key);
        break;
      }
      case "local": {
        const endpoint = body.ollamaEndpoint ?? "http://localhost:11434";
        const model = body.ollamaModel ?? "llama3.2";
        if (!validateOllamaEndpoint(endpoint)) {
          return NextResponse.json(
            { error: "Invalid Ollama endpoint. Only localhost addresses are permitted." },
            { status: 400 }
          );
        }
        response = await runOllama(body.prompt, endpoint, model);
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown mode." }, { status: 400 });
    }

    return NextResponse.json({ response });
  } catch (err: unknown) {
    console.error("[/api/test-prompt]", err);
    const { message, status, retryAfter } = sanitiseClientError(err);
    return NextResponse.json(
      retryAfter !== undefined ? { error: message, retryAfter } : { error: message },
      { status }
    );
  }
}
