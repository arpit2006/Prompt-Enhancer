"use client";

import { useState } from "react";
import { useAppStore } from "@/store/prompt-store";
import { Sparkles, KeyRound, ExternalLink, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";

export function ApiKeySetup() {
  const { setGeminiApiKey } = useAppStore();
  const [value, setValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      setError("Please enter your API key.");
      return;
    }
    if (!trimmed.startsWith("AIza") || trimmed.length < 30) {
      setError("That doesn't look like a valid Gemini API key. Keys start with \"AIza\".");
      return;
    }

    // Quick validation: call the analyze endpoint with a smoke-test prompt
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": trimmed,
        },
        body: JSON.stringify({ prompt: "Hello, test.", modelId: "gemini-2.0-flash" }),
      });

      if (res.status === 401 || res.status === 403) {
        setError("API key rejected by Google. Please check it and try again.");
        return;
      }
      if (!res.ok && res.status !== 500) {
        // 500 could just be a content-safety block on the smoke prompt — key is still valid
        const data = await res.json().catch(() => ({})) as { error?: string };
        setError(data.error ?? "Verification failed. Please try again.");
        return;
      }

      // Key is good — save it
      setGeminiApiKey(trimmed);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Card */}
      <div className="w-full max-w-md space-y-8">
        {/* Logo + heading */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PromptCraft</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Powered by Google Gemini
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              Enter your Gemini API Key
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your key is stored only in your browser — it&apos;s never sent to any
              server other than Google&apos;s API.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Key input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="apikey">
                API Key
              </label>
              <div className="relative">
                <input
                  id="apikey"
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

              {/* Inline error */}
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !value.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Verifying key…
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Get key link */}
          <div className="rounded-lg bg-muted px-3 py-2.5 flex items-start gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Don&apos;t have a key?{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Get one free at Google AI Studio
              </a>{" "}
              — no credit card required.
            </p>
          </div>
        </div>

        {/* Privacy note */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Key stored in your browser only · Never logged or shared</span>
        </div>
      </div>
    </div>
  );
}
