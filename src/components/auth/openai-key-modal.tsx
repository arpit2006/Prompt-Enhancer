"use client";

import { useState } from "react";
import { KeyRound, ExternalLink, Eye, EyeOff, Zap } from "lucide-react";
import { useAppStore } from "@/store/prompt-store";

interface OpenAIKeyModalProps {
  open: boolean;
  onClose: () => void;
}

export function OpenAIKeyModal({ open, onClose }: OpenAIKeyModalProps) {
  const { openaiApiKey, setOpenaiApiKey } = useAppStore();
  const [draft, setDraft] = useState(openaiApiKey);
  const [showKey, setShowKey] = useState(false);

  if (!open) return null;

  const isValid = draft.trim().startsWith("sk-") && draft.trim().length > 20;

  const handleSave = () => {
    if (!isValid) return;
    setOpenaiApiKey(draft.trim());
    onClose();
  };

  const handleClear = () => {
    setOpenaiApiKey("");
    setDraft("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border bg-background shadow-xl p-6 mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <KeyRound className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold">OpenAI API Key</h2>
            <p className="text-xs text-muted-foreground">GPT-4o · GPT-4 · GPT-4o Mini</p>
          </div>
        </div>

        {/* Free tier notice — only when no key is set */}
        {!openaiApiKey && (
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

        {/* Info banner */}
        <div className="mb-4 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          Your key is stored in browser localStorage only — never sent to our servers.
          The key is passed directly to the OpenAI API.
        </div>

        {/* Input */}
        <label className="block mb-3">
          <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
            API Key (starts with <code className="font-mono">sk-</code>)
          </span>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="sk-proj-..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono pr-9 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {draft && !isValid && (
            <p className="mt-1 text-xs text-destructive">
              Key must start with <code>sk-</code> and be at least 20 characters.
            </p>
          )}
        </label>

        {/* Get key link */}
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline mb-5"
        >
          Get a key from OpenAI Platform
          <ExternalLink className="h-3 w-3" />
        </a>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          {openaiApiKey && (
            <button
              onClick={handleClear}
              className="rounded-md px-3 py-1.5 text-xs font-medium border text-destructive hover:bg-destructive/10 transition-colors"
            >
              Remove Key
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-xs font-medium border hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="rounded-md px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}
