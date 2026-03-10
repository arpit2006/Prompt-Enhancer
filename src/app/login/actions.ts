"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

/** Ensure callbackUrl is a relative path to prevent open redirect attacks. */
function safeCallback(url?: string): string {
  return url && url.startsWith("/") && !url.startsWith("//") ? url : "/app";
}

export async function signInWithGoogle(callbackUrl?: string) {
  await signIn("google", { redirectTo: safeCallback(callbackUrl) });
}

export async function signInWithGitHub(callbackUrl?: string) {
  await signIn("github", { redirectTo: safeCallback(callbackUrl) });
}

/** Dev-only: sign in with a password as a local test user. Never active in production. */
export async function signInWithTestUser(
  password: string,
  callbackUrl?: string
): Promise<{ error: string } | null> {
  if (process.env.NODE_ENV !== "development") return null;
  try {
    await signIn("dev-test", { password, redirectTo: safeCallback(callbackUrl) });
    return null; // unreachable — successful signIn always redirects
  } catch (err) {
    // AuthError = wrong credentials. Re-throw everything else (including
    // Next.js redirect errors which are how a successful signIn works).
    if (err instanceof AuthError) return { error: "Incorrect password." };
    throw err;
  }
}
