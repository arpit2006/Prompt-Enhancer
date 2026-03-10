"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/prompt-store";
import { Wind, Eye, EyeOff, X, Check, Trash2, ExternalLink, Zap } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MistralKeyModal({ open, onClose }: Props) {
  const { mistralApiKey, setMistralApiKey } = useAppStore();
  const [value, setValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setValue("");
      setError("");
      setSaved(false);
      setShowKey(false);
    }
  }, [open]);

  if (!open) return null;

  const maskedKey = mistralApiKey
    ? mistralApiKey.slice(0, 6) + "•".repeat(14) + mistralApiKey.slice(-4)
    : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      setError("Please enter a key.");
      return;
    }
    if (trimmed.length < 20) {
      setError("That doesn't look like a valid Mistral API key.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze-mistral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-mistral-api-key": trimmed,
        },
        body: JSON.stringify({ prompt: "Hello.", modelId: "mistral-large-latest" }),
      });

      if (res.status === 401 || res.status === 403) {
        setError("Key rejected by Mistral. Please check and try again.");
        return;
      }

      setMistralApiKey(trimmed);
      setSaved(true);
      setTimeout(onClose, 900);
    } catch {
      setError("Network error. Could not verify the key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl border bg-background shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff7000]/10">
            <Wind className="h-5 w-5 text-[#ff7000]" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Mistral API Key</h2>
            <p className="text-sm text-muted-foreground">Mistral Large — powerful reasoning model</p>
          </div>
        </div>

        {/* Free tier notice — only when no key is set */}
        {!maskedKey && (
          <div className="mb-4 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 p-3">
            <p className="text-xs font-medium text-violet-700 dark:text-violet-300 flex items-center gap-1.5 mb-1">
              <Zap className="h-3.5 w-3.5" />
              Free tier available
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No key needed. PromptCraft provides{" "}
              <strong className="text-violet-700 dark:text-violet-300">20 free prompts/day</strong>{" "}
              via our shared Mistral API. Add your own key for unlimited access.
            </p>
            <button
              onClick={onClose}
              className="mt-2 text-xs text-violet-600 dark:text-violet-400 underline underline-offset-2 hover:text-violet-800 dark:hover:text-violet-200 transition-colors"
            >
              Skip — continue with free tier
            </button>
          </div>
        )}

        {/* Active key display */}
        {maskedKey && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#ff7000]/30 bg-[#ff7000]/5 px-3 py-2">
            <Check className="h-4 w-4 text-[#ff7000] shrink-0" />
            <span className="text-xs font-mono text-[#ff7000]">{maskedKey}</span>
            <button
              onClick={() => { setMistralApiKey(""); onClose(); }}
              className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
              title="Remove key"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              {maskedKey ? "Replace key" : "Enter your Mistral API key"}
            </label>
            <div className="relative">
              <Wind className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showKey ? "text" : "password"}
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(""); }}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full rounded-lg border bg-background pl-10 pr-10 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#ff7000]/50"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || saved || !value.trim()}
            className="w-full rounded-lg bg-[#ff7000] hover:bg-[#e06500] text-white py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saved ? (
              <><Check className="h-4 w-4" /> Saved!</>
            ) : loading ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Verifying…</>
            ) : (
              "Save Key"
            )}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          <span>Get a free key at </span>
          <a
            href="https://console.mistral.ai/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ff7000] hover:underline"
          >
            console.mistral.ai
          </a>
        </div>
      </div>
    </div>
  );
}
