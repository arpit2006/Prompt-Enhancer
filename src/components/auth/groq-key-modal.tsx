"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/prompt-store";
import { KeyRound, Eye, EyeOff, X, Check, Trash2, ExternalLink, Zap } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GroqKeyModal({ open, onClose }: Props) {
  const { groqApiKey, setGroqApiKey } = useAppStore();
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

  const maskedKey = groqApiKey
    ? groqApiKey.slice(0, 8) + "•".repeat(12) + groqApiKey.slice(-4)
    : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      setError("Please enter a key.");
      return;
    }
    if (!trimmed.startsWith("gsk_") || trimmed.length < 20) {
      setError('Invalid key format. Groq keys start with "gsk_".');
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze-groq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-groq-api-key": trimmed,
        },
        body: JSON.stringify({ prompt: "Hello.", modelId: "llama-3.3-70b-versatile" }),
      });

      if (res.status === 401 || res.status === 403) {
        setError("Key rejected by Groq. Please check and try again.");
        return;
      }

      setGroqApiKey(trimmed);
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
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border bg-background shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
            <Zap className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Groq API Key</h2>
            <p className="text-sm text-muted-foreground">
              Fast, free inference via LLaMA 3.3 70B
            </p>
          </div>
        </div>

        {!maskedKey && (
          <div className="mb-4 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 p-3">
            <p className="text-xs font-medium text-violet-700 dark:text-violet-300 flex items-center gap-1.5 mb-1">
              <Zap className="h-3.5 w-3.5" />
              Free tier available
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No key needed. PromptCraft provides{" "}
              <strong className="text-violet-700 dark:text-violet-300">20 free prompts/day</strong>{" "}
              via our shared API. Add your own key for unlimited access.
            </p>
            <button
              onClick={onClose}
              className="mt-2 text-xs text-violet-600 dark:text-violet-400 underline underline-offset-2 hover:text-violet-800 dark:hover:text-violet-200 transition-colors"
            >
              Skip &mdash; continue with free tier
            </button>
          </div>
        )}

        {maskedKey && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 px-3 py-2">
            <Check className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
            <span className="text-xs text-orange-700 dark:text-orange-300 font-mono">
              {maskedKey}
            </span>
            <button
              onClick={() => { setGroqApiKey(""); onClose(); }}
              className="ml-auto text-orange-600 dark:text-orange-400 hover:text-destructive transition-colors"
              title="Remove key"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              {maskedKey ? "Replace key" : "Enter your Groq API key"}
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showKey ? "text" : "password"}
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(""); }}
                placeholder="gsk_••••••••••••••••••••••••••••••••••••••"
                className="w-full rounded-lg border bg-background pl-10 pr-10 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50"
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
            className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 text-white py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            href="https://console.groq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:underline"
          >
            console.groq.com
          </a>
        </div>
      </div>
    </div>
  );
}
