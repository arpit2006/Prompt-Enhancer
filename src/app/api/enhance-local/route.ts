import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { enhancePromptLocal } from "@/lib/ollama";
import { enforceContentLength, sanitiseInput, validateOllamaEndpoint, sanitiseClientError } from "@/lib/security";
import type { EnhanceRequest } from "@/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as EnhanceRequest;
    const model    = req.headers.get("x-ollama-model")    ?? "llama3.2";
    const endpoint = req.headers.get("x-ollama-endpoint") ?? "http://localhost:11434";

    if (!validateOllamaEndpoint(endpoint)) {
      return NextResponse.json(
        { error: "Invalid Ollama endpoint. Only localhost addresses are permitted." },
        { status: 400 }
      );
    }

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    body.prompt = sanitiseInput(body.prompt);

    const lengthError = enforceContentLength(body.prompt);
    if (lengthError) return lengthError;

    if (body.prompt.trim().length < 5) {
      return NextResponse.json({ error: "Prompt is too short." }, { status: 400 });
    }

    const result = await enhancePromptLocal(body, model, endpoint);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[/api/enhance-local]", err);
    const { message, status, retryAfter } = sanitiseClientError(err);
    return NextResponse.json(
      retryAfter !== undefined ? { error: message, retryAfter } : { error: message },
      { status }
    );
  }
}
