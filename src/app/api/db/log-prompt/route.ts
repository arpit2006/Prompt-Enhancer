import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_AI_MODES   = new Set(["gemini", "groq", "openai", "local"]);
const ALLOWED_PROMPT_TYPES = new Set(["instruction", "question", "creative", "code", "image", "conversational"]);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { originalPrompt, enhancedPrompt, clarityScore, promptType, tone, aiMode } = body;

    // Allowlist validation to prevent arbitrary data injection
    const safeAiMode     = ALLOWED_AI_MODES.has(aiMode)     ? aiMode     : null;
    const safePromptType = ALLOWED_PROMPT_TYPES.has(promptType) ? promptType : null;
    const safeTone       = typeof tone === "string"         ? tone.slice(0, 50)  : null;
    const safeScore      = Number.isInteger(clarityScore) && clarityScore >= 0 && clarityScore <= 100
      ? clarityScore : null;

    await prisma.promptLog.create({
      data: {
        userId: session.user.email,
        originalPrompt,
        enhancedPrompt,
        clarityScore: safeScore,
        promptType:   safePromptType,
        tone:         safeTone,
        aiMode:       safeAiMode,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[db/log-prompt]", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
