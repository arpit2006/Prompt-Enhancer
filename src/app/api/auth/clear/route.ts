import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Clears stale authjs.* cookies (e.g. after a JWTSessionError caused by a
 * config change) then redirects the user back to /login for a clean attempt.
 */
export async function GET() {
  const jar = await cookies();
  for (const cookie of jar.getAll()) {
    if (cookie.name.startsWith("authjs.")) {
      jar.delete(cookie.name);
    }
  }
  return NextResponse.redirect(new URL("/login", process.env.AUTH_URL ?? "http://localhost:3000"));
}
