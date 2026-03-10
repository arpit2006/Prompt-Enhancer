import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { analyzePrompt } from "@/lib/gemini";
import { enforceContentLength, sanitiseInput, sanitiseClientError } from "@/lib/security";
import { checkFreeUsage, platformKeyExists } from "@/lib/usage-limit";
import type { AnalyzeRequest } from "@/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as AnalyzeRequest;
    const callerKey = req.headers.get("x-gemini-api-key") ?? undefined;

    if (!callerKey) {
      if (!platformKeyExists.gemini()) {
        return NextResponse.json(
          { error: "No API key configured. Add your Gemini key in Settings → API Keys." },
          { status: 400 }
        );
      }
      const userId = session.user.email ?? session.user.id ?? "";
      const { exceeded, limit } = await checkFreeUsage(userId);
      if (exceeded) {
        return NextResponse.json(
          { error: `Daily free limit reached (${limit} prompts/day). Add your own key for unlimited access.`, retryAfter: 86400 },
          { status: 429 }
        );
      }
    }

    if (!body.prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    body.prompt = sanitiseInput(body.prompt);

    const lengthError = enforceContentLength(body.prompt);
    if (lengthError) return lengthError;

    const result = await analyzePrompt(body.prompt, body.targetModelId ?? body.modelId ?? "", callerKey);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[/api/analyze]", err);
    const { message, status, retryAfter } = sanitiseClientError(err);
    return NextResponse.json(
      retryAfter !== undefined ? { error: message, retryAfter } : { error: message },
      { status }
    );
  }
}
