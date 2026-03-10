"use client";

import { useAppStore } from "@/store/prompt-store";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  BarChart2,
} from "lucide-react";
import type { AnalysisIssue } from "@/types";

function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const color =
    value >= 75
      ? "bg-emerald-500"
      : value >= 50
      ? "bg-amber-500"
      : "bg-red-500";
  const textColor =
    value >= 75
      ? "text-emerald-600 dark:text-emerald-400"
      : value >= 50
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className={cn("font-bold tabular-nums text-sm", textColor)}>{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

const SEVERITY_CONFIG: Record<
  string,
  { icon: typeof Info; className: string; label: string }
> = {
  high: {
    icon: AlertTriangle,
    className: "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    label: "High",
  },
  medium: {
    icon: AlertTriangle,
    className: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    label: "Medium",
  },
  low: {
    icon: Info,
    className: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    label: "Low",
  },
  // Aliases / fallbacks for unexpected AI responses
  warning: {
    icon: AlertTriangle,
    className: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    label: "Warning",
  },
  error: {
    icon: AlertTriangle,
    className: "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    label: "Error",
  },
  info: {
    icon: Info,
    className: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    label: "Info",
  },
  suggestion: {
    icon: Info,
    className: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    label: "Suggestion",
  },
};

const DEFAULT_SEVERITY_CONFIG = {
  icon: Info,
  className: "text-muted-foreground bg-muted/50 border-border",
  label: "Note",
};

const PROMPT_TYPE_LABELS: Record<string, string> = {
  instruction: "📋 Instruction",
  question: "❓ Question",
  creative: "🎨 Creative",
  code: "💻 Code Generation",
  image: "🖼️ Image Generation",
  conversational: "💬 Conversational",
};

const LENGTH_LABELS: Record<string, { label: string; className: string }> = {
  "too-short": { label: "Too Short", className: "text-amber-600" },
  optimal: { label: "Optimal Length", className: "text-emerald-600" },
  "too-long": { label: "Too Long", className: "text-amber-600" },
};

export function AnalysisPanel() {
  const { analysis, isAnalyzing, currentPrompt } = useAppStore();

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground px-6">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Analyzing…</p>
          <p className="text-xs text-muted-foreground mt-1">Scoring your prompt quality</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-6">
        <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center">
          <BarChart2 className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <div>
          <p className="text-sm font-semibold">No analysis yet</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {currentPrompt.trim().length < 10
              ? "Type at least 10 characters to begin automatic analysis."
              : "Analysis will appear here shortly…"}
          </p>
        </div>
      </div>
    );
  }

  const lengthInfo = LENGTH_LABELS[analysis.lengthAssessment];

  return (
    <div className="flex flex-col gap-5 p-4 overflow-y-auto flex-1 min-h-0">
      {/* Scores */}
      <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Quality Scores
        </h3>
        <ScoreBar label="Clarity" value={analysis.clarityScore} />
        <ScoreBar label="Completeness" value={analysis.completenessScore} />
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border bg-card p-3 space-y-0.5 shadow-sm">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Type</p>
          <p className="text-xs font-medium">
            {PROMPT_TYPE_LABELS[analysis.promptType] ?? analysis.promptType}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-3 space-y-0.5 shadow-sm">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Length</p>
          <p className={cn("text-xs font-semibold", lengthInfo.className)}>
            {lengthInfo.label}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-3 space-y-0.5 shadow-sm">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Words</p>
          <p className="text-xs font-semibold tabular-nums">{analysis.wordCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-3 space-y-0.5 shadow-sm">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Tokens</p>
          <p className="text-xs font-semibold tabular-nums">
            ~{analysis.estimatedTokens.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Issues */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Issues
          </h3>
          {analysis.issues.length > 0 && (
            <span className="text-[10px] bg-destructive/10 text-destructive font-semibold px-1.5 py-0.5 rounded-full">
              {analysis.issues.length} found
            </span>
          )}
        </div>

        {analysis.issues.length === 0 ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-3">
            <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              No issues detected — your prompt looks solid!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {analysis.issues.map((issue, i) => {
              const config = SEVERITY_CONFIG[issue.severity?.toLowerCase?.()] ?? DEFAULT_SEVERITY_CONFIG;
              const Icon = config.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 space-y-1",
                    config.className
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs font-semibold leading-tight flex-1">{issue.message}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wide opacity-60">{config.label}</span>
                  </div>
                  {issue.suggestion && (
                    <p className="text-xs opacity-75 pl-5 leading-relaxed">{issue.suggestion}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
