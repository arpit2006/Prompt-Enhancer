"use client";

import { useState } from "react";
import {
  Loader2,
  Zap,
  Trophy,
  Copy,
  CheckCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAppStore } from "@/store/prompt-store";
import type { AiMode } from "@/store/prompt-store";
import type { EnhanceResponse } from "@/types";
import { cn } from "@/lib/utils";

// ─── Mode config ──────────────────────────────────────────────────────────────

const MODES: {
  value: AiMode;
  label: string;
  textColor: string;
  dotBg: string;
}[] = [
  { value: "gemini",  label: "Gemini",  textColor: "text-blue-400",    dotBg: "bg-blue-400"    },
  { value: "groq",    label: "Groq",    textColor: "text-orange-400",  dotBg: "bg-orange-400"  },
  { value: "openai",  label: "OpenAI",  textColor: "text-emerald-400", dotBg: "bg-emerald-400" },
  { value: "mistral", label: "Mistral", textColor: "text-[#ff7000]",   dotBg: "bg-[#ff7000]"   },
  { value: "local",   label: "Ollama",  textColor: "text-purple-400",  dotBg: "bg-purple-400"  },
];

function getRoute(mode: AiMode) {
  if (mode === "local")    return "/api/enhance-local";
  if (mode === "groq")     return "/api/enhance-groq";
  if (mode === "openai")   return "/api/enhance-openai";
  if (mode === "mistral")  return "/api/enhance-mistral";
  return "/api/enhance";
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SlotResult {
  result: EnhanceResponse | null;
  error: string | null;
  loading: boolean;
}

const EMPTY_SLOT: SlotResult = { result: null, error: null, loading: false };

function avgScore(r: EnhanceResponse): number {
  return (r.analysis.clarityScore + r.analysis.completenessScore) / 2;
}

// ─── Score pill ───────────────────────────────────────────────────────────────

function ScorePill({ label, score }: { label: string; score: number }) {
  const color =
    score >= 75 ? "bg-emerald-500/15 text-emerald-400" :
    score >= 50 ? "bg-amber-500/15 text-amber-400" :
                  "bg-rose-500/15 text-rose-400";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
        color,
      )}
    >
      {label}:{score}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ComparePanel() {
  const {
    currentPrompt,
    geminiApiKey,
    groqApiKey,
    openaiApiKey,
    mistralApiKey,
    ollamaModel,
    ollamaEndpoint,
    tone,
    targetModelId,
    setCurrentPrompt,
    setAnalysis,
    setSuggestions,
    setRightPanel,
  } = useAppStore();

  const [slotAMode, setSlotAMode] = useState<AiMode>("gemini");
  const [slotBMode, setSlotBMode] = useState<AiMode>("groq");
  const [slotA, setSlotA] = useState<SlotResult>(EMPTY_SLOT);
  const [slotB, setSlotB] = useState<SlotResult>(EMPTY_SLOT);
  const [isComparing, setIsComparing]   = useState(false);
  const [expandedA, setExpandedA]       = useState(false);
  const [expandedB, setExpandedB]       = useState(false);
  const [copiedA, setCopiedA]           = useState(false);
  const [copiedB, setCopiedB]           = useState(false);

  // Build request headers per mode
  function buildHeaders(mode: AiMode): Record<string, string> {
    const base: Record<string, string> = { "Content-Type": "application/json" };
    if (mode === "local")    return { ...base, "x-ollama-model": ollamaModel, "x-ollama-endpoint": ollamaEndpoint };
    if (mode === "groq")     return groqApiKey    ? { ...base, "x-groq-api-key":    groqApiKey    } : base;
    if (mode === "openai")   return openaiApiKey  ? { ...base, "x-openai-api-key":  openaiApiKey  } : base;
    if (mode === "mistral")  return mistralApiKey ? { ...base, "x-mistral-api-key": mistralApiKey } : base;
    return geminiApiKey ? { ...base, "x-gemini-api-key": geminiApiKey } : base;
  }

  async function runSlot(mode: AiMode): Promise<EnhanceResponse> {

    const res = await fetch(getRoute(mode), {
      method: "POST",
      headers: buildHeaders(mode),
      body: JSON.stringify({ prompt: currentPrompt, tone, targetModelId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error((data as { error?: string }).error ?? "Enhancement failed");
    return data as EnhanceResponse;
  }

  async function handleCompare() {
    const trimmed = currentPrompt.trim();
    if (!trimmed || trimmed.length < 5) return;

    setIsComparing(true);
    setSlotA({ ...EMPTY_SLOT, loading: true });
    setSlotB({ ...EMPTY_SLOT, loading: true });
    setExpandedA(false);
    setExpandedB(false);

    const [resA, resB] = await Promise.allSettled([
      runSlot(slotAMode),
      runSlot(slotBMode),
    ]);

    setSlotA({
      result:  resA.status === "fulfilled" ? resA.value : null,
      error:   resA.status === "rejected"  ? (resA.reason as Error).message : null,
      loading: false,
    });
    setSlotB({
      result:  resB.status === "fulfilled" ? resB.value : null,
      error:   resB.status === "rejected"  ? (resB.reason as Error).message : null,
      loading: false,
    });

    setIsComparing(false);
  }

  function applyResult(result: EnhanceResponse) {
    const best = result.suggestions?.[0];
    if (best) {
      setCurrentPrompt(best.content);
      setAnalysis(result.analysis);
      setSuggestions(result.suggestions);
      setRightPanel("analysis");
    }
  }

  async function copy(text: string, slot: "A" | "B") {
    await navigator.clipboard.writeText(text);
    if (slot === "A") { setCopiedA(true); setTimeout(() => setCopiedA(false), 1500); }
    else              { setCopiedB(true); setTimeout(() => setCopiedB(false), 1500); }
  }

  const bothDone = slotA.result !== null && slotB.result !== null;
  const scoreA   = slotA.result ? avgScore(slotA.result) : 0;
  const scoreB   = slotB.result ? avgScore(slotB.result) : 0;
  const winnerA  = bothDone && scoreA >= scoreB;
  const winnerB  = bothDone && scoreB > scoreA;
  const canRun   = currentPrompt.trim().length >= 5 && !isComparing;

  const slots = [
    {
      key: "A", slot: slotA, mode: slotAMode, setMode: setSlotAMode,
      expanded: expandedA, setExpanded: setExpandedA,
      copied: copiedA,  copySlot: "A" as const, isWinner: winnerA,
    },
    {
      key: "B", slot: slotB, mode: slotBMode, setMode: setSlotBMode,
      expanded: expandedB, setExpanded: setExpandedB,
      copied: copiedB, copySlot: "B" as const, isWinner: winnerB,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-3 p-3 h-full overflow-y-auto">

      {/* ── Header ── */}
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-primary" />
          Compare Models
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Run your prompt through two AI models simultaneously and see which performs better.
        </p>
      </div>

      {/* ── Slot selectors ── */}
      <div className="grid grid-cols-2 gap-2">
        {slots.map(({ key, mode, setMode }) => {
          const modeInfo = MODES.find((m) => m.value === mode)!;
          return (
            <div key={key} className="rounded-lg border bg-muted/30 p-2">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Model {key}
                </span>
                <span className={cn("text-[10px] font-semibold truncate", modeInfo.textColor)}>
                  · {modeInfo.label}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                {MODES.map(({ value, label, textColor, dotBg }) => (
                  <button
                    key={value}
                    onClick={() => setMode(value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-all text-left",
                      mode === value
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full shrink-0",
                        mode === value ? "bg-primary-foreground" : dotBg,
                      )}
                    />
                    <span className={mode === value ? "" : textColor}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Compare button ── */}
      <button
        onClick={handleCompare}
        disabled={!canRun}
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
          "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md",
          "hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        {isComparing
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Comparing…</>
          : <><Zap className="h-4 w-4" /> Run Comparison</>
        }
      </button>

      {!canRun && !isComparing && (
        <p className="text-[11px] text-amber-500/80 text-center -mt-1">
          Enter a prompt in the editor first.
        </p>
      )}

      {/* ── Result cards ── */}
      {slots.map(({ key, slot, mode, expanded, setExpanded, copied, copySlot, isWinner }) => {
        if (!slot.loading && !slot.result && !slot.error) return null;

        const modeInfo = MODES.find((m) => m.value === mode)!;
        const best     = slot.result?.suggestions?.[0];

        return (
          <div
            key={key}
            className={cn(
              "rounded-lg border p-3 transition-all",
              isWinner
                ? "border-emerald-500/40 bg-emerald-500/5 shadow-sm shadow-emerald-500/10"
                : "border-border bg-muted/20",
            )}
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-muted-foreground">
                  Model {key}
                </span>
                <span className={cn("text-[10px] font-semibold", modeInfo.textColor)}>
                  {modeInfo.label}
                </span>
                {isWinner && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 rounded-full px-1.5 py-0.5">
                    <Trophy className="h-2.5 w-2.5" /> Winner
                  </span>
                )}
              </div>
              {slot.result && (
                <div className="flex gap-1">
                  <ScorePill label="Clarity" score={slot.result.analysis.clarityScore} />
                  <ScorePill label="Complete" score={slot.result.analysis.completenessScore} />
                </div>
              )}
            </div>

            {/* Loading */}
            {slot.loading && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Enhancing with {modeInfo.label}…
              </div>
            )}

            {/* Error */}
            {slot.error && !slot.loading && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
                {slot.error}
              </div>
            )}

            {/* Enhanced prompt text */}
            {best && (
              <>
                <p
                  className={cn(
                    "text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap rounded-md bg-muted/40 p-2",
                    !expanded && "line-clamp-4",
                  )}
                >
                  {best.content}
                </p>
                {best.content.length > 200 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-0.5 text-[10px] text-primary mt-1 hover:underline"
                  >
                    {expanded
                      ? <><ChevronUp className="h-3 w-3" /> Show less</>
                      : <><ChevronDown className="h-3 w-3" /> Show more</>
                    }
                  </button>
                )}
                <div className="flex gap-1.5 mt-2.5">
                  <button
                    onClick={() => copy(best.content, copySlot)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md border text-xs py-1.5 hover:bg-muted transition-colors"
                  >
                    {copied
                      ? <><CheckCheck className="h-3 w-3 text-emerald-500" /> Copied</>
                      : <><Copy className="h-3 w-3" /> Copy</>
                    }
                  </button>
                  <button
                    onClick={() => applyResult(slot.result!)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md bg-primary text-primary-foreground text-xs py-1.5 font-medium hover:opacity-90 transition-opacity"
                  >
                    Use this →
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}

    </div>
  );
}
