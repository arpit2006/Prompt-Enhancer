import { prisma } from "@/lib/prisma";

/** Free prompts per user per UTC day when using PromptCraft's own API keys. */
export const FREE_DAILY_LIMIT = 20;

/** Returns true when the platform has a key configured for the given provider. */
export const platformKeyExists = {
  gemini:  () => !!process.env.GOOGLE_GEMINI_API_KEY,
  groq:    () => !!process.env.GROQ_API_KEY,
  openai:  () => !!process.env.OPENAI_API_KEY,
  mistral: () => !!process.env.MISTRAL_API_KEY,
} as const;

export interface UsageResult {
  used: number;
  limit: number;
  remaining: number;
  exceeded: boolean;
}

/**
 * Counts how many PromptLog rows the user has created today (UTC).
 * Used to gate free-tier access when no personal API key is provided.
 */
export async function checkFreeUsage(userId: string): Promise<UsageResult> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const used = await prisma.promptLog.count({
    where: { userId, createdAt: { gte: startOfDay } },
  });

  return {
    used,
    limit: FREE_DAILY_LIMIT,
    remaining: Math.max(0, FREE_DAILY_LIMIT - used),
    exceeded: used >= FREE_DAILY_LIMIT,
  };
}
