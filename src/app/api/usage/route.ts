import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkFreeUsage, platformKeyExists } from "@/lib/usage-limit";

/**
 * GET /api/usage
 * Returns the authenticated user's free-tier usage for today.
 * Used by the UI to render the FreeTierBadge.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.email ?? session.user.id ?? "";
  const usage = await checkFreeUsage(userId);

  return NextResponse.json({
    ...usage,
    platformAvailable: {
      gemini: platformKeyExists.gemini(),
      groq:   platformKeyExists.groq(),
      openai: platformKeyExists.openai(),
      mistral: platformKeyExists.mistral(),
    },
  });
}
