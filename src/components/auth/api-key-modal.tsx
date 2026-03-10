"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/prompt-store";
import {
  KeyRound,
  Eye,
  EyeOff,
  X,
  Check,
  Trash2,
  ExternalLink,
  Zap,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ open, onClose }: Props) {
  const { geminiApiKey, setGeminiApiKey } = useAppStore();
  const [value, setValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Populate current masked key hint on open
  useEffect(() => {
    if (open) {
      setValue("");
      setError("");
      setSaved(false);
      setShowKey(false);
    }
  }, [open]);

  if (!open) return null;

  const maskedKey = geminiApiKey
    ? geminiApiKey.slice(0, 8) + "•".repeat(12) + geminiApiKey.slice(-4)
    : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      setError("Please enter a key.");
      return;
    }
    if (!trimmed.startsWith("AIza") || trimmed.length < 30) {
      setError('Invalid key format. Keys start with "AIza".');
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": trimmed,
        },
        body: JSON.stringify({ prompt: "Hello.", modelId: "gemini-2.0-flash" }),
      });

      if (res.status === 401 || res.status === 403) {
        setError("Key rejected by Google. Please check and try again.");
        return;
      }

      setGeminiApiKey(trimmed);
      setSaved(true);
      setTimeout(onClose, 900);
    } catch {
      setError("Network error. Could not verify the key.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setGeminiApiKey("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border bg-card shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Gemini API Key</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Free tier notice — only when no key is set */}
          {!maskedKey && (
            <div className="rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 p-3">
              <p className="text-xs font-medium text-violet-700 dark:text-violet-300 flex items-center gap-1.5 mb-1">
                <Zap className="h-3.5 w-3.5" />
                Free tier available
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No key needed to start. PromptCraft provides{" "}
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

          {/* Current key status */}
          {maskedKey && (
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
              <div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Active key
                </p>
                <p className="text-xs font-mono text-emerald-600 dark:text-emerald-500 mt-0.5">
                  {maskedKey}
                </p>
              </div>
              <button
                onClick={handleRemove}
                className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Remove key"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* New key form */}
          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="modal-apikey">
                {maskedKey ? "Replace with new key" : "Enter your API key"}
              </label>
              <div className="relative">
                <input
                  id="modal-apikey"
                  type={showKey ? "text" : "password"}
                  value={value}
                  onChange={(e) => { setValue(e.target.value); setError(""); }}
                  placeholder="AIzaSy..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-lg border bg-background px-3 py-2 pr-10 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !value.trim() || saved}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saved ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Saved!
                </>
              ) : loading ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Verifying…
                </>
              ) : (
                "Save & Verify"
              )}
            </button>
          </form>

          {/* Help link */}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Get a free key at Google AI Studio
          </a>
        </div>
      </div>
    </div>
  );
}
