/**
 * Route protection middleware.
 * Redirects unauthenticated users to /login.
 * Public paths (login, api/auth, static assets) are excluded.
 */

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow if already authenticated
  if (req.auth) return NextResponse.next();

  // Redirect to login
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  // Protect everything except the landing page, login, auth API, and static assets
  matcher: [
    "/((?!$|login|api/auth|api/newsletter|api/ollama-test|_next/static|_next/image|favicon.ico).*)",
  ],
};
