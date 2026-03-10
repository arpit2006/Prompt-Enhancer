"use client";

import { useAppStore } from "@/store/prompt-store";
import { GitCompare, ArrowRight, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Word Diff Algorithm ──────────────────────────────────────────────────────

interface DiffToken {
  type: "same" | "removed" | "added";
  text: string;
}

/**
 * Tokenise a string preserving whitespace — returns alternating word/space
 * tokens so the rendered diff keeps original spacing.
 */
function tokenise(text: string): string[] {
  return text.split(/(\s+)/);
}

/**
 * Compute the longest-common-subsequence table for two token arrays.
 * Uses word equality (case-sensitive).
 */
function lcs(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

/**
 * Back-trace the LCS table to produce diff tokens.
 * Whitespace-only tokens are always typed "same" to keep spacing intact.
 */
function diffWords(original: string, enhanced: string): DiffToken[] {
  const a = tokenise(original);
  const b = tokenise(enhanced);
  const dp = lcs(a, b);
  const result: DiffToken[] = [];

  let i = a.length;
  let j = b.length;
  const ops: DiffToken[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ type: "same", text: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: "added", text: b[j - 1] });
      j--;
    } else {
      ops.push({ type: "removed", text: a[i - 1] });
      i--;
    }
  }

  ops.reverse();
  // Merge consecutive same-type non-whitespace tokens
  for (const tok of ops) {
    const prev = result[result.length - 1];
    const isWhitespace = /^\s+$/.test(tok.text);
    if (prev && prev.type === tok.type && !isWhitespace) {
      prev.text += tok.text;
    } else {
      result.push({ ...tok });
    }
  }
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DiffPanel() {
  const lastOriginalPrompt = useAppStore((s) => s.lastOriginalPrompt);
  const currentPrompt = useAppStore((s) => s.currentPrompt);
  const suggestions = useAppStore((s) => s.suggestions);

  // Use the best suggestion if available, otherwise current prompt
  const enhanced =
    suggestions.length > 0
      ? (suggestions.find((s) => s.type === "full-rewrite") ?? suggestions[0])
          .content
      : currentPrompt;

  const original = lastOriginalPrompt || currentPrompt;

  const noComparison = !lastOriginalPrompt && suggestions.length === 0;

  if (noComparison) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
        <GitCompare className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          Hit <strong>✦ Enhance</strong> to generate a comparison. The diff
          will show what the AI changed.
        </p>
      </div>
    );
  }

  const tokens = diffWords(original, enhanced);

  const removedCount = tokens.filter((t) => t.type === "removed" && !/^\s+$/.test(t.text)).length;
  const addedCount = tokens.filter((t) => t.type === "added" && !/^\s+$/.test(t.text)).length;

  const originalWords = original.split(/\s+/).filter(Boolean).length;
  const enhancedWords = enhanced.split(/\s+/).filter(Boolean).length;
  const wordDiff = enhancedWords - originalWords;

  return (
    <div className="flex flex-col h-full">
      {/* Header stats */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b text-xs">
        <GitCompare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="font-medium text-muted-foreground">Diff</span>
        <div className="flex items-center gap-2 ml-auto">
          {removedCount > 0 && (
            <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400 font-mono">
              <Minus className="h-3 w-3" />
              {removedCount}
            </span>
          )}
          {addedCount > 0 && (
            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-mono">
              <Plus className="h-3 w-3" />
              {addedCount}
            </span>
          )}
          <span className="text-muted-foreground">
            {wordDiff === 0
              ? "same length"
              : wordDiff > 0
              ? `+${wordDiff} words`
              : `${wordDiff} words`}
          </span>
        </div>
      </div>

      {/* Side-by-side panels */}
      <div className="flex flex-1 overflow-hidden divide-x">
        {/* Original */}
        <div className="flex-1 overflow-y-auto flex flex-col min-w-0">
          <div className="sticky top-0 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 border-b text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Original
          </div>
          <div className="px-3 py-3 text-[12px] leading-relaxed font-mono break-words whitespace-pre-wrap">
            {tokens.map((tok, i) =>
              tok.type === "removed" ? (
                <mark
                  key={i}
                  className="bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 rounded-[2px] px-0.5 not-italic"
                >
                  {tok.text}
                </mark>
              ) : tok.type === "added" ? null : (
                <span key={i}>{tok.text}</span>
              )
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center w-7 bg-muted/20 shrink-0">
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
        </div>

        {/* Enhanced */}
        <div className="flex-1 overflow-y-auto flex flex-col min-w-0">
          <div className="sticky top-0 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 border-b text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Enhanced
          </div>
          <div className="px-3 py-3 text-[12px] leading-relaxed font-mono break-words whitespace-pre-wrap">
            {tokens.map((tok, i) =>
              tok.type === "added" ? (
                <mark
                  key={i}
                  className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-[2px] px-0.5 not-italic"
                >
                  {tok.text}
                </mark>
              ) : tok.type === "removed" ? null : (
                <span key={i}>{tok.text}</span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t text-[10px] text-muted-foreground bg-muted/10">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-200 dark:bg-rose-800/60" />
          Removed
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-200 dark:bg-emerald-800/60" />
          Added
        </span>
        <span
          className={cn(
            "ml-auto font-medium",
            suggestions.length > 0
              ? "text-violet-600 dark:text-violet-400"
              : "text-muted-foreground"
          )}
        >
          {suggestions.length > 0 ? "Best suggestion" : "Current prompt"}
        </span>
      </div>
    </div>
  );
}
