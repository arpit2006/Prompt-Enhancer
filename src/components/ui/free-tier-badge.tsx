"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/prompt-store";
import { Zap, KeyRound } from "lucide-react";

interface UsageData {
  used: number;
  limit: number;
  remaining: number;
  exceeded: boolean;
  platformAvailable: { gemini: boolean; groq: boolean; openai: boolean; mistral: boolean };
}

interface Props {
  /** Called when the user clicks "Add key" to open the relevant settings. */
  onOpenSettings?: () => void;
}

export function FreeTierBadge({ onOpenSettings }: Props) {
  const { geminiApiKey, groqApiKey, openaiApiKey, mistralApiKey, aiMode } = useAppStore();
  const [usage, setUsage] = useState<UsageData | null>(null);

  // Determine whether the active AI mode has a personal key configured
  const hasPersonalKey =
    aiMode === "gemini"   ? !!geminiApiKey
    : aiMode === "groq"   ? !!groqApiKey
    : aiMode === "openai" ? !!openaiApiKey
    : aiMode === "mistral" ? !!mistralApiKey
    : true; // "local" (Ollama) needs no key

  useEffect(() => {
    // Only fetch usage when the user is on the free tier
    if (hasPersonalKey || aiMode === "local") return;

    let cancelled = false;
    fetch("/api/usage")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (!cancelled && data) setUsage(data as UsageData); })
      .catch(() => {/* silently ignore — badge is non-critical */});

    return () => { cancelled = true; };
  }, [hasPersonalKey, aiMode]);

  // Don't render anything when user has their own key or is using Ollama
  if (hasPersonalKey || aiMode === "local") return null;

  // While loading
  if (!usage) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 px-2.5 py-1 text-xs text-violet-600 dark:text-violet-400">
        <Zap className="h-3 w-3" />
        <span>Free tier</span>
      </div>
    );
  }

  // No platform key for this provider
  const providerAvailable =
    aiMode === "gemini"   ? usage.platformAvailable.gemini
    : aiMode === "groq"   ? usage.platformAvailable.groq
    : aiMode === "mistral" ? usage.platformAvailable.mistral
    : usage.platformAvailable.openai;

  if (!providerAvailable) {
    // If no platform key exists for this provider and no settings handler, nothing to show
    if (!onOpenSettings) return null;
    return (
      <button
        onClick={onOpenSettings}
        className="flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2.5 py-1 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
        title="Add your API key to start"
      >
        <KeyRound className="h-3 w-3" />
        <span>Add API key to start</span>
      </button>
    );
  }

  const percent = Math.round((usage.used / usage.limit) * 100);
  const barColor =
    usage.exceeded   ? "bg-red-500"
    : percent >= 80  ? "bg-amber-500"
    : "bg-violet-500";

  return (
    <div className="flex items-center gap-2 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 px-2.5 py-1">
      <Zap className="h-3 w-3 text-violet-500 shrink-0" />
      <span className="text-xs text-violet-700 dark:text-violet-300 whitespace-nowrap">
        {usage.exceeded
          ? "Free limit reached"
          : `${usage.remaining}/${usage.limit} free today`}
      </span>
      {/* Mini progress bar */}
      <div className="w-12 h-1.5 rounded-full bg-violet-200 dark:bg-violet-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          className="text-xs text-violet-600 dark:text-violet-400 underline underline-offset-2 hover:text-violet-800 dark:hover:text-violet-200 transition-colors whitespace-nowrap"
          title="Add your own API key for unlimited use"
        >
          {usage.exceeded ? "Add key" : "Use own key"}
        </button>
      )}
    </div>
  );
}
