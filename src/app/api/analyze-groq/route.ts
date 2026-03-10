import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { analyzePromptGroq } from "@/lib/groq";
import { enforceContentLength, sanitiseInput, sanitiseClientError } from "@/lib/security";
import { checkFreeUsage, platformKeyExists } from "@/lib/usage-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { prompt: string; modelId?: string; targetModelId?: string };
    const { modelId, targetModelId } = body;
    let { prompt } = body;
    const callerKey = req.headers.get("x-groq-api-key") ?? undefined;

    if (!callerKey) {
      if (!platformKeyExists.groq()) {
        return NextResponse.json(
          { error: "No API key configured. Add your Groq key in Settings → API Keys." },
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

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    prompt = sanitiseInput(prompt);

    const lengthError = enforceContentLength(prompt);
    if (lengthError) return lengthError;

    const result = await analyzePromptGroq(prompt, targetModelId ?? modelId ?? "", callerKey);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[/api/analyze-groq]", err);
    const { message, status, retryAfter } = sanitiseClientError(err);
    return NextResponse.json(
      retryAfter !== undefined ? { error: message, retryAfter } : { error: message },
      { status }
    );
  }
}
