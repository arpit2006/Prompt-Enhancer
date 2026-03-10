"use client";

import { useState } from "react";
import { useAppStore } from "@/store/prompt-store";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Lightbulb,
  PenLine,
  PlusCircle,
  RefreshCw,
  LayoutList,
  TrendingUp,
  Copy,
  Check,
} from "lucide-react";
import type { PromptSuggestion } from "@/types";

const TYPE_CONFIG: Record<PromptSuggestion["type"], { label: string; color: string; icon: typeof PenLine }> = {
  "full-rewrite": { label: "Full Rewrite", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: RefreshCw },
  addition:       { label: "Addition",     color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", icon: PlusCircle },
  replacement:    { label: "Replacement",  color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: PenLine },
  structural:     { label: "Structural",   color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: LayoutList },
};

function ImprovementBadge({ value }: { value: number }) {
  if (!value) return null;
  const color = value >= 75 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
    : value >= 50 ? "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
    : "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
  return (
    <div className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold shrink-0", color)}>
      <TrendingUp className="h-2.5 w-2.5" />
      +{value}%
    </div>
  );
}

function SuggestionCard({ suggestion, index }: { suggestion: PromptSuggestion; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { applySuggestion } = useAppStore();
  const typeConfig = TYPE_CONFIG[suggestion.type] ?? { label: suggestion.type, color: "bg-muted text-muted-foreground", icon: Sparkles };
  const TypeIcon = typeConfig.icon;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(suggestion.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = suggestion.content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow group">
      {/* Header */}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-start gap-2">
          {/* Index circle */}
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold mt-0.5">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide", typeConfig.color)}>
                <TypeIcon className="h-2.5 w-2.5" />
                {typeConfig.label}
              </span>
              <ImprovementBadge value={suggestion.improvement ?? 0} />
            </div>
            <h4 className="text-sm font-semibold leading-snug">{suggestion.title}</h4>
            {suggestion.description && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{suggestion.description}</p>
            )}
          </div>
        </div>

        {/* Preview */}
        <div
          className={cn(
            "rounded-lg bg-muted/60 border px-3 py-2.5 text-xs font-mono leading-relaxed overflow-hidden transition-all duration-300 cursor-pointer",
            expanded ? "max-h-[400px]" : "max-h-16"
          )}
          onClick={() => setExpanded((v) => !v)}
        >
          {suggestion.content}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="h-3 w-3" /> Show less</>
          ) : (
            <><ChevronDown className="h-3 w-3" /> Show full prompt</>
          )}
        </button>

        {/* Rationale */}
        {expanded && suggestion.rationale && (
          <div className="flex gap-2 rounded-lg border border-primary/20 bg-accent/60 px-3 py-2.5">
            <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/80 leading-relaxed">
              {suggestion.rationale}
            </p>
          </div>
        )}
      </div>

      {/* Footer: Copy + Apply */}
      <div className="border-t px-3.5 py-2.5 bg-muted/20 flex gap-2">
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold border transition-all active:scale-[0.98] shrink-0",
            copied
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
              : "bg-background hover:bg-accent text-foreground border-border"
          )}
          title="Copy prompt to clipboard"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          onClick={() => applySuggestion(suggestion)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
        >
          <Sparkles className="h-3 w-3" />
          Apply This Version
          <ArrowRight className="h-3 w-3 ml-auto" />
        </button>
      </div>
    </div>
  );
}

export function SuggestionPanel() {
  const { suggestions, isEnhancing, currentPrompt } = useAppStore();

  if (isEnhancing) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground px-6">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <Loader2 className="absolute -top-1 -right-1 h-4 w-4 animate-spin text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">Enhancing your prompt…</p>
          <p className="text-xs text-muted-foreground mt-1">AI is crafting improvements</p>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-6">
        <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center">
          <Sparkles className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <div>
          <p className="text-sm font-semibold">No suggestions yet</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {currentPrompt.trim()
              ? 'Click the “Enhance” button to generate AI-powered improvements.'
              : 'Write a prompt in the editor, then click Enhance.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto flex-1 min-h-0">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {suggestions.length} Suggestion{suggestions.length !== 1 ? "s" : ""}
        </h3>
        <span className="text-[10px] text-muted-foreground">Pick the best version</span>
      </div>
      {suggestions.map((s, i) => (
        <SuggestionCard key={s.id} suggestion={s} index={i} />
      ))}
    </div>
  );
}



