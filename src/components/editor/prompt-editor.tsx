"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Save, Trash2, Loader2, Zap, BrainCircuit, ShieldAlert, X } from "lucide-react";
import { useAppStore } from "@/store/prompt-store";
import { estimateTokens, debounce } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { detectPII } from "@/lib/security";
import type { EnhanceResponse, PromptAnalysis } from "@/types";
import { TargetModelSelector } from "@/components/editor/target-model-selector";
import { AudienceTuner } from "@/components/editor/audience-tuner";

const MAX_TOKENS = 8192;

export function PromptEditor() {
  const [piiDismissed, setPiiDismissed] = useState(false);
  const {
    currentPrompt,
    isEnhancing,
    isAnalyzing,
    enhanceError,
    geminiApiKey,
    groqApiKey,
    openaiApiKey,
    mistralApiKey,
    aiMode,
    targetModelId,
    ollamaModel,
    ollamaEndpoint,
    privacyMode,
    setCurrentPrompt,
    setAnalysis,
    setSuggestions,
    setIsAnalyzing,
    setIsEnhancing,
    setEnhanceError,
    setRightPanel,
    saveVersion,
    clearSession,
    tone,
    setLastOriginalPrompt,
    trackEnhancement,
    addTag,
    activeEntryId,
  } = useAppStore();

  // PII detection — re-run whenever prompt changes, reset dismissed flag on new PII types
  const piiResult = useMemo(() => detectPII(currentPrompt), [currentPrompt]);
  // Reset dismissal if prompt changes and new PII appears
  useEffect(() => {
    if (!piiResult.found) setPiiDismissed(false);
  }, [piiResult.found]);

  const enhanceRoute =
    aiMode === "local" ? "/api/enhance-local"
    : aiMode === "groq" ? "/api/enhance-groq"
    : aiMode === "openai" ? "/api/enhance-openai"
    : aiMode === "mistral" ? "/api/enhance-mistral"
    : "/api/enhance";
  const analyzeRoute =
    aiMode === "local" ? "/api/analyze-local"
    : aiMode === "groq" ? "/api/analyze-groq"
    : aiMode === "openai" ? "/api/analyze-openai"
    : aiMode === "mistral" ? "/api/analyze-mistral"
    : "/api/analyze";
  const modeHeaders: Record<string, string> =
    aiMode === "local"
      ? { "x-ollama-model": ollamaModel, "x-ollama-endpoint": ollamaEndpoint }
      : aiMode === "groq"
      ? groqApiKey ? { "x-groq-api-key": groqApiKey } : {}
      : aiMode === "openai"
      ? openaiApiKey ? { "x-openai-api-key": openaiApiKey } : {}
      : aiMode === "mistral"
      ? mistralApiKey ? { "x-mistral-api-key": mistralApiKey } : {}
      : geminiApiKey
      ? { "x-gemini-api-key": geminiApiKey }
      : {};

  // The model the user is targeting (for optimized wording) — sent to all routes
  const requestTargetModelId = targetModelId || undefined;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tokenCount = estimateTokens(currentPrompt);
  const tokenPercent = Math.min((tokenCount / MAX_TOKENS) * 100, 100);
  const isOverLimit = tokenCount > MAX_TOKENS;

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [currentPrompt]);

  // Debounced auto-analysis
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedAnalyze = useCallback(
    debounce(async (prompt: string) => {
      if (prompt.trim().length < 10) return;
      setIsAnalyzing(true);
      try {
        const res = await fetch(analyzeRoute, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...modeHeaders },
          body: JSON.stringify({ prompt, targetModelId: requestTargetModelId }),
        });
        if (res.ok) {
          const data = (await res.json()) as PromptAnalysis;
          setAnalysis(data);
          setRightPanel("analysis");
        }
        // Silently ignore 429 on auto-analyze — enhance button will surface it
      } catch {
        // Silently fail on auto-analyze; user can still manually enhance
      } finally {
        setIsAnalyzing(false);
      }
    }, 1500),
    []
  );

  useEffect(() => {
    if (currentPrompt.trim().length >= 10) {
      debouncedAnalyze(currentPrompt);
    }
  }, [currentPrompt, debouncedAnalyze]);

  const handleEnhance = async () => {
    if (!currentPrompt.trim() || isEnhancing) return;
    // Save original prompt BEFORE enhancing (for diff view)
    setLastOriginalPrompt(currentPrompt);
    setIsEnhancing(true);
    setEnhanceError(null);
    try {
      const contextParts: string[] = [];
      if (tone && tone !== "Default") contextParts.push(`Tone: ${tone}`);
      const res = await fetch(enhanceRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...modeHeaders },
        body: JSON.stringify({
          prompt: currentPrompt,
          targetModelId: requestTargetModelId,
          context: contextParts.length > 0 ? contextParts.join("\n") : undefined,
        }),
      });
      const data = (await res.json()) as EnhanceResponse & { error?: string; retryAfter?: number };
      if (res.status === 429) {
        const secs = data.retryAfter ?? 30;
        setEnhanceError(`Quota limit reached. Please wait ${secs}s and try again.`);
        return;
      }
      if (!res.ok) {
        setEnhanceError(data.error ?? "Enhancement failed.");
        return;
      }
      setSuggestions(data.suggestions);
      if (data.analysis) setAnalysis(data.analysis);
      // Auto-save the original prompt to history (skip in privacy mode)
      let savedEntryId: string | null = null;
      if (!privacyMode) savedEntryId = saveVersion(currentPrompt, targetModelId || aiMode, data.analysis);
      // Track analytics
      trackEnhancement(aiMode, data.analysis?.clarityScore);
      // Log to Supabase PromptLog (fire-and-forget, skip in privacy mode)
      if (!privacyMode && data.suggestions.length > 0) {
        fetch("/api/db/log-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalPrompt: currentPrompt,
            enhancedPrompt: data.suggestions[0].content,
            clarityScore: data.analysis?.clarityScore ?? null,
            promptType: data.analysis?.promptType ?? null,
            tone: tone !== "Default" ? tone : null,
            aiMode,
          }),
        }).catch(() => {});
      }
      // Auto-tag: extract meaningful tags from analysis
      if (savedEntryId && data.analysis) {
        const autoTags: string[] = [];
        const pt = data.analysis.promptType;
        if (pt) autoTags.push(pt);
        if (tone && tone !== "Default") autoTags.push(tone.toLowerCase());
        const highIssue = data.analysis.issues.find((i) => i.severity === "high");
        if (highIssue) {
          const tagMap: Record<string, string> = {
            "ambiguity": "ambiguous",
            "missing-context": "needs-context",
            "vague-language": "vague",
            "no-format-spec": "no-format",
            "no-tone-spec": "no-tone",
          };
          const mapped = tagMap[highIssue.type];
          if (mapped) autoTags.push(mapped);
        }
        for (const tag of autoTags) {
          if (tag) addTag(savedEntryId, tag);
        }
      }
      setRightPanel("suggestions");
    } catch {
      setEnhanceError("Network error. Please check your connection.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSave = () => {
    if (!currentPrompt.trim() || privacyMode) return;
    saveVersion(currentPrompt, targetModelId || aiMode);
    setRightPanel("history");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-col px-4 pt-2.5 pb-0 border-b gap-2 bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Model badge — shows active enhancement mode */}
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1">
            {aiMode === "local" ? (
              <>
                <span className="text-[10px] font-bold tracking-wide text-violet-600 dark:text-violet-400">●</span>
                <span className="text-xs font-medium">{ollamaModel}</span>
                <span className="text-[9px] text-muted-foreground ml-0.5">local</span>
              </>
            ) : aiMode === "groq" ? (
              <>
                <Zap className="h-3 w-3 text-orange-500" />
                <span className="text-xs font-medium">LLaMA 3.3 70B</span>
                <span className="text-[9px] text-muted-foreground ml-0.5">groq</span>
              </>
            ) : aiMode === "openai" ? (
              <>
                <BrainCircuit className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium">GPT-4o</span>
                <span className="text-[9px] text-muted-foreground ml-0.5">openai</span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold tracking-wide text-blue-600 dark:text-blue-400">G</span>
                <span className="text-xs font-medium">Gemini 2.0 Flash</span>
              </>
            )}
          </div>

          {/* Target model selector */}
          <TargetModelSelector />
        </div>

        <div className="flex items-center gap-2">
          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!currentPrompt.trim()}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border hover:bg-accent disabled:opacity-40 transition-colors"
            title="Save to history"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Clear */}
          <button
            onClick={clearSession}
            disabled={!currentPrompt.trim()}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40 transition-colors"
            title="Clear editor"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          {/* Enhance button */}
          <button
            onClick={handleEnhance}
            disabled={isEnhancing || !currentPrompt.trim()}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            {isEnhancing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enhancing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                ✦ Enhance
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audience Tuner row */}
      <div className="pb-2.5">
        <AudienceTuner />
      </div>
    </div>

      {/* Error banner */}
      {enhanceError && (
        <div className="mx-4 mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {enhanceError}
        </div>
      )}

      {/* PII warning banner */}
      {piiResult.found && !piiDismissed && (
        <div className="mx-4 mt-3 flex items-start gap-2 rounded-md border border-amber-400/40 bg-amber-50/80 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
          <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold">Sensitive data detected: </span>
            {piiResult.types.join(", ")}.
            <span className="ml-1 opacity-80">
              Avoid sharing real personal information with AI services.
            </span>
          </div>
          <button
            onClick={() => setPiiDismissed(true)}
            className="shrink-0 rounded p-0.5 hover:bg-amber-200/60 dark:hover:bg-amber-800/40 transition-colors"
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Privacy mode indicator */}
      {privacyMode && (
        <div className="mx-4 mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 opacity-75">
          <span>●</span>
          <span>Privacy mode — history not saved</span>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto group">
        <textarea
          ref={textareaRef}
          value={currentPrompt}
          onChange={(e) => setCurrentPrompt(e.target.value)}
          placeholder={`Start writing your prompt here…\n\nTips:\n• Be specific about the task and expected output\n• Mention the target audience or skill level\n• Include format requirements (list, paragraph, JSON…)\n• Add any constraints or tone preferences\n\nHit ✦ Enhance to get AI-powered rewrites and improvements.`}
          className="w-full min-h-[520px] h-full resize-none bg-transparent text-base leading-[1.8] placeholder:text-muted-foreground/35 focus:outline-none px-8 py-6 font-mono tracking-wide"
          spellCheck={false}
        />
      </div>

      {/* Token progress bar */}
      <div className="h-0.5 w-full bg-muted/40">
        <div
          className={cn(
            "h-full transition-all duration-500",
            isOverLimit ? "bg-destructive" : tokenPercent > 75 ? "bg-amber-400" : "bg-primary/50"
          )}
          style={{ width: `${tokenPercent}%` }}
        />
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-t text-[11px] text-muted-foreground bg-muted/20">
        <div className="flex items-center gap-4">
          <span><span className="text-foreground font-semibold">{currentPrompt.split(/\s+/).filter(Boolean).length}</span> words</span>
          <span><span className="text-foreground font-semibold">{currentPrompt.length}</span> chars</span>
          {currentPrompt.length > 0 && (
            <span className="text-[10px] opacity-60">{currentPrompt.split(/\n/).length} lines</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAnalyzing && <span className="text-primary text-[10px] animate-pulse">analyzing…</span>}
          <span className={cn("text-[10px]", isOverLimit && "text-destructive font-semibold")}>
            {tokenCount.toLocaleString()} / {MAX_TOKENS.toLocaleString()} tokens
          </span>
        </div>
      </div>
    </div>
  );
}
