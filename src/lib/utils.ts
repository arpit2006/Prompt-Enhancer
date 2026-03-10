import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Rough token counting heuristic (~4 chars per token for English text).
 * For display purposes only — not suitable for billing.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Debounce: returns a function that delays invoking fn until after wait ms. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** Format an ISO date string for display (e.g. "Mar 7, 2026 · 14:32"). */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Truncate text to a maximum character length, appending "…". */
export function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 1) + "…";
}

/** Generate a simple random ID (not cryptographically secure, UI use only). */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
