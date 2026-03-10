import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { enhancePromptGroq } from "@/lib/groq";
import { enforceContentLength, sanitiseInput, sanitiseClientError } from "@/lib/security";
import { checkFreeUsage, platformKeyExists } from "@/lib/usage-limit";
import type { EnhanceRequest } from "@/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as EnhanceRequest;
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

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    body.prompt = sanitiseInput(body.prompt);

    const lengthError = enforceContentLength(body.prompt);
    if (lengthError) return lengthError;

    if (body.prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Prompt is too short to enhance. Please write more." },
        { status: 400 }
      );
    }

    const result = await enhancePromptGroq(body, callerKey);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[/api/enhance-groq]", err);
    const { message, status, retryAfter } = sanitiseClientError(err);
    return NextResponse.json(
      retryAfter !== undefined ? { error: message, retryAfter } : { error: message },
      { status }
    );
  }
}
