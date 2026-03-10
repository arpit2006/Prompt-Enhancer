/**
 * Security utilities for the AI Prompt Enhancer.
 *
 * Includes:
 *  - PII detection (email, phone, credit card, SSN, passport)
 *  - Content length enforcement
 *  - Rate-limit response helper (future extensibility)
 */

import { NextResponse } from "next/server";

// ─── PII Detection ────────────────────────────────────────────────────────────

export interface PiiDetectionResult {
  found: boolean;
  types: string[];
}

const PII_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  {
    label: "Email address",
    pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
  },
  {
    // US/international phone numbers
    label: "Phone number",
    pattern: /(\+?\d{1,3}[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/g,
  },
  {
    // Visa / Mastercard / Amex / Discover — 13-19 digit card numbers (no ReDoS)
    label: "Credit/debit card number",
    pattern: /\b\d{4}[ \-]?\d{4}[ \-]?\d{4}[ \-]?\d{1,7}\b/g,
  },
  {
    // US Social Security Number: XXX-XX-XXXX or XXXXXXXXX
    label: "Social Security Number",
    pattern: /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g,
  },
  {
    // US passport: letter + 8 digits
    label: "Passport number",
    pattern: /\b[A-Z]{1,2}\d{6,9}\b/g,
  },
  {
    // IPv4 address
    label: "IP address",
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  },
  {
    // AWS-style API keys / secrets (random alphanumeric 20-40 char uppercase blocks)
    label: "API key / secret token",
    pattern: /\b(?:AKIA|sk-|AIza)[A-Za-z0-9\/\+\-_]{10,50}\b/g,
  },
];

/**
 * Scan `text` for common PII patterns.
 * Returns `{ found, types }` where `types` is de-duplicated list of PII categories found.
 */
export function detectPII(text: string): PiiDetectionResult {
  const found: string[] = [];

  for (const { label, pattern } of PII_PATTERNS) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      found.push(label);
    }
  }

  return { found: found.length > 0, types: found };
}

// ─── Content Length Enforcement ───────────────────────────────────────────────

/** Maximum prompt length accepted by API routes (characters). ~32 KB */
export const MAX_PROMPT_CHARS = 32_000;

/** Maximum prompt length for a single request body (bytes). 128 KB */
export const MAX_BODY_BYTES = 128_000;

/**
 * Returns a 400 NextResponse if `prompt` exceeds the limit, otherwise null.
 */
export function enforceContentLength(prompt: string): NextResponse | null {
  if (!prompt) return null;

  if (prompt.length > MAX_PROMPT_CHARS) {
    return NextResponse.json(
      {
        error: `Prompt is too long. Maximum length is ${MAX_PROMPT_CHARS.toLocaleString()} characters (received ${prompt.length.toLocaleString()}).`,
      },
      { status: 400 }
    );
  }
  return null;
}

// ─── Input Sanitisation ───────────────────────────────────────────────────────

/**
 * Strip null bytes and invisible control characters from a string.
 * Leaves printable Unicode (including accented chars, CJK, emoji) intact.
 */
export function sanitiseInput(input: string): string {
  // Remove null bytes and ASCII control chars (0x00-0x08, 0x0E-0x1F, 0x7F)
  // Keep 0x09 (tab), 0x0A (LF), 0x0D (CR) for normal text editing
  return input.replace(/[\u0000-\u0008\u000E-\u001F\u007F]/g, "");
}

// ─── CSRF / Origin check helper ───────────────────────────────────────────────

const TRUSTED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://prompt-enhancer.vercel.app", // update with your production domain
];

/**
 * Returns true if the origin is trusted (same-origin or explicitly allowed).
 * Call this in API routes when you want stricter CSRF-style origin validation.
 */
export function isTrustedOrigin(origin: string | null): boolean {
  if (!origin) return true; // server-to-server calls have no Origin header
  return TRUSTED_ORIGINS.some(
    (trusted) => origin === trusted || origin.startsWith("http://localhost:")
  );
}

// ─── SSRF Prevention ──────────────────────────────────────────────────────────

/**
 * Validates that an Ollama endpoint URL is restricted to localhost/loopback only.
 * Prevents SSRF attacks where an attacker supplies an internal-network URL.
 */
export function validateOllamaEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    const loopback = ["localhost", "127.0.0.1", "::1"];
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      loopback.includes(url.hostname)
    );
  } catch {
    return false;
  }
}

// ─── Client-safe error serialisation ──────────────────────────────────────────

/**
 * Maps an internal error to a safe { message, status } pair for client responses.
 * Logs nothing — callers must log the raw error before calling this.
 * Never exposes stack traces, upstream API details, or partial AI output.
 */
export function sanitiseClientError(err: unknown): {
  message: string;
  status: number;
  retryAfter?: number;
} {
  const raw = err instanceof Error ? err.message : String(err);
  const asAny = err as Record<string, unknown>;

  // Rate-limit — safe to forward the retry delay
  if (asAny.isRateLimit) {
    return {
      message: "Rate limit exceeded. Please try again later.",
      status: 429,
      retryAfter: asAny.retryAfter as number,
    };
  }

  // API key / auth errors
  if (
    raw.includes("API key") ||
    raw.includes("API_KEY") ||
    raw.includes("No Gemini") ||
    raw.includes("No Groq") ||
    raw.includes("No OpenAI") ||
    raw.includes("Unauthorized")
  ) {
    return { message: "Invalid or missing API key.", status: 401 };
  }

  return { message: "An error occurred. Please try again.", status: 500 };
}
