/**
 * Auth.js v5 configuration.
 * Supports Google OAuth and GitHub OAuth.
 * Uses JWT strategy — no database required.
 *
 * Required environment variables:
 *   AUTH_SECRET          — random secret (run: npx auth secret)
 *   AUTH_GOOGLE_ID       — from Google Cloud Console
 *   AUTH_GOOGLE_SECRET   — from Google Cloud Console
 *   AUTH_GITHUB_ID       — from GitHub OAuth Apps
 *   AUTH_GITHUB_SECRET   — from GitHub OAuth Apps
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";

// Dev-only test user — requires DEV_TEST_PASSWORD, never active in production
const devCredentials =
  process.env.NODE_ENV === "development" && process.env.DEV_TEST_PASSWORD
    ? [
        Credentials({
          id: "dev-test",
          name: "Dev Test User",
          credentials: { password: { label: "Dev Password", type: "password" } },
          authorize(creds) {
            // Must throw (not return null) to avoid Auth.js Configuration error
            if ((creds?.password as string) !== process.env.DEV_TEST_PASSWORD)
              throw new CredentialsSignin("Invalid password");
            return { id: "dev-test-user", name: "Test User", email: "test@dev.local", image: null };
          },
        }),
      ]
    : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    GitHub,
    ...devCredentials,
  ],
  // Required when using Credentials provider — Auth.js v5 needs an explicit
  // JWT strategy or it falls back to database sessions and throws Configuration.
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
  // trustHost is only enabled in development or when AUTH_TRUST_HOST env var is explicitly set.
  // In production, set the AUTH_URL environment variable to your canonical domain instead.
  trustHost: !!process.env.AUTH_TRUST_HOST || process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // Attach user id to session token
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
