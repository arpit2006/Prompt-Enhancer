"use client";

import { useState } from "react";
import { useAppStore } from "@/store/prompt-store";
import {
  Play,
  Square,
  FlaskConical,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROMPT_OPTIONS = [
  { label: "Current prompt", value: "current" },
  { label: "Best enhanced suggestion", value: "suggestion" },
] as const;

type PromptChoice = (typeof PROMPT_OPTIONS)[number]["value"];

export function TestPanel() {
  const currentPrompt = useAppStore((s) => s.currentPrompt);
  const suggestions = useAppStore((s) => s.suggestions);
  const aiMode = useAppStore((s) => s.aiMode);
  const geminiApiKey = useAppStore((s) => s.geminiApiKey);
  const groqApiKey = useAppStore((s) => s.groqApiKey);
  const openaiApiKey = useAppStore((s) => s.openaiApiKey);
  const ollamaEndpoint = useAppStore((s) => s.ollamaEndpoint);
  const ollamaModel = useAppStore((s) => s.ollamaModel);

  const testResult = useAppStore((s) => s.testResult);
  const setTestResult = useAppStore((s) => s.setTestResult);
  const isTestRunning = useAppStore((s) => s.isTestRunning);
  const setIsTestRunning = useAppStore((s) => s.setIsTestRunning);

  const [choice, setChoice] = useState<PromptChoice>("current");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const bestSuggestion =
    suggestions.find((s) => s.type === "full-rewrite") ?? suggestions[0];

  const promptToTest =
    choice === "suggestion" && bestSuggestion
      ? bestSuggestion.content
      : currentPrompt;

  const modeHeaders: Record<string, string> = {};
  if (aiMode === "gemini" && geminiApiKey)
    modeHeaders["x-gemini-api-key"] = geminiApiKey;
  else if (aiMode === "groq" && groqApiKey)
    modeHeaders["x-groq-api-key"] = groqApiKey;
  else if (aiMode === "openai" && openaiApiKey)
    modeHeaders["x-openai-api-key"] = openaiApiKey;

  const handleRun = async () => {
    if (!promptToTest.trim() || isTestRunning) return;
    const ac = new AbortController();
    setAbortController(ac);
    setIsTestRunning(true);
    setTestResult(null);
    setError(null);

    try {
      const res = await fetch("/api/test-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...modeHeaders },
        body: JSON.stringify({
          prompt: promptToTest,
          mode: aiMode,
          ollamaEndpoint,
          ollamaModel,
        }),
        signal: ac.signal,
      });

      const data = (await res.json()) as { response?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Request failed.");
      } else {
        setTestResult(data.response ?? "");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Stopped.");
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setIsTestRunning(false);
      setAbortController(null);
    }
  };

  const handleStop = () => {
    abortController?.abort();
  };

  const handleCopy = async () => {
    if (!testResult) return;
    await navigator.clipboard.writeText(testResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const noPrompt = !currentPrompt.trim();
  const noSuggestions = suggestions.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header controls */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b">
        <FlaskConical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-medium text-muted-foreground">Test</span>

        {/* Prompt selector */}
        <div className="relative ml-auto">
          <select
            value={choice}
            onChange={(e) => setChoice(e.target.value as PromptChoice)}
            disabled={noSuggestions && choice === "suggestion"}
            className="appearance-none text-xs rounded-md border bg-background px-2.5 py-1 pr-5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-40 cursor-pointer"
          >
            {PROMPT_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.value === "suggestion" && noSuggestions}
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        </div>

        {/* Run / Stop */}
        {isTestRunning ? (
          <button
            onClick={handleStop}
            className="flex items-center gap-1.5 rounded-md bg-destructive/10 text-destructive px-3 py-1.5 text-xs font-medium hover:bg-destructive/20 transition-colors"
          >
            <Square className="h-3 w-3" />
            Stop
          </button>
        ) : (
          <button
            onClick={handleRun}
            disabled={noPrompt}
            className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-violet-600 to-indigo-500 text-white px-3 py-1.5 text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity shadow-sm"
          >
            <Play className="h-3 w-3 fill-current" />
            Run
          </button>
        )}
      </div>

      {/* Prompt preview */}
      <div className="mx-3 mt-2.5 rounded-md border bg-muted/30 px-2.5 py-2">
        <p className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wide">
          Prompt to test
        </p>
        <p className="text-[11px] font-mono text-foreground/80 leading-relaxed line-clamp-3">
          {promptToTest || (
            <span className="italic text-muted-foreground">
              No prompt yet — write something in the editor.
            </span>
          )}
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2 px-3 mt-3 mb-1">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          Response
        </span>
        <div className="flex-1 h-px bg-border" />
        {testResult && (
          <span className="text-[10px] text-muted-foreground">
            {testResult.split(/\s+/).filter(Boolean).length} words
          </span>
        )}
      </div>

      {/* Response output */}
      <div className="flex-1 overflow-y-auto mx-3 mb-3">
        {isTestRunning && !testResult && (
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground animate-pulse">
            <span className="inline-block h-2 w-2 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="inline-block h-2 w-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0s]" />
            <span className="inline-block h-2 w-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0.15s]" />
            <span className="ml-1">Running…</span>
          </div>
        )}

        {error && (
          <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {testResult && (
          <div className="relative group mt-0">
            <pre className="rounded-md border bg-muted/20 p-3 text-[12px] leading-relaxed font-mono whitespace-pre-wrap break-words text-foreground/90">
              {testResult}
            </pre>
            <button
              onClick={handleCopy}
              className={cn(
                "absolute top-2 right-2 rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-all",
                "bg-background border hover:border-primary/40",
                copied && "opacity-100"
              )}
              title="Copy response"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
          </div>
        )}

        {!testResult && !isTestRunning && !error && (
          <div className="flex flex-col items-center justify-center mt-8 gap-3 text-center px-4">
            <FlaskConical className="h-8 w-8 text-muted-foreground/25" />
            <p className="text-xs text-muted-foreground">
              Click <strong>Run</strong> to send your prompt to{" "}
              <span className="capitalize font-medium text-foreground/70">
                {aiMode}
              </span>{" "}
              and see the raw response.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
