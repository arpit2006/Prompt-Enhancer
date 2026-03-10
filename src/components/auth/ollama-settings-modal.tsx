"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/prompt-store";
import { testOllamaConnection } from "@/lib/ollama";
import {
  X,
  Check,
  Wifi,
  WifiOff,
  ExternalLink,
  ChevronDown,
  Loader2,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const RECOMMENDED_MODELS = [
  { id: "llama3.2",   label: "Llama 3.2 (3B) — fast, good quality" },
  { id: "llama3.1",   label: "Llama 3.1 (8B) — better quality" },
  { id: "mistral",    label: "Mistral 7B — great all-rounder" },
  { id: "phi4",       label: "Phi-4 — small but capable" },
  { id: "gemma3",     label: "Gemma 3 — Google open model" },
  { id: "qwen2.5",    label: "Qwen 2.5 (7B)" },
  { id: "codellama",  label: "Code Llama (code-focused)" },
];

export function OllamaSettingsModal({ open, onClose }: Props) {
  const { ollamaModel, ollamaEndpoint, setOllamaModel, setOllamaEndpoint } =
    useAppStore();

  const [model,    setModel]    = useState(ollamaModel);
  const [endpoint, setEndpoint] = useState(ollamaEndpoint);
  const [custom,   setCustom]   = useState(false);
  const [testing,  setTesting]  = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    models: string[];
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setModel(ollamaModel);
      setEndpoint(ollamaEndpoint);
      setTestResult(null);
      // If current model isn't in the recommended list, show custom input
      setCustom(!RECOMMENDED_MODELS.some((m) => m.id === ollamaModel));
    }
  }, [open, ollamaModel, ollamaEndpoint]);

  if (!open) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    // Call our own test API to avoid CORS (server-side fetch to Ollama)
    try {
      const res = await fetch("/api/ollama-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
      const data = await res.json() as { ok: boolean; models: string[]; error?: string };
      setTestResult(data);
    } catch {
      setTestResult({ ok: false, models: [], error: "Network error testing connection." });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setOllamaModel(model.trim() || "llama3.2");
    setOllamaEndpoint(endpoint.trim() || "http://localhost:11434");
    onClose();
  };

  const isKnownModel = RECOMMENDED_MODELS.some((m) => m.id === model);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border rounded-xl shadow-xl space-y-5 p-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-base">Local Mode — Ollama</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Run AI enhancement locally with no API key and no quota.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Setup guide */}
        <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-1.5 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Quick setup (one-time)</p>
          <ol className="list-decimal list-inside space-y-1 leading-relaxed">
            <li>
              Install Ollama from{" "}
              <a
                href="https://ollama.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-0.5 text-foreground"
              >
                ollama.com <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </li>
            <li>
              Open a terminal and run:{" "}
              <code className="bg-muted rounded px-1 font-mono text-foreground">
                ollama pull llama3.2
              </code>
            </li>
            <li>Ollama starts automatically in the background.</li>
          </ol>
        </div>

        {/* Model selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Model
          </label>

          {!custom ? (
            <div className="relative">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full appearance-none rounded-md border bg-background text-sm px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {RECOMMENDED_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. llama3.2:latest"
              className="w-full rounded-md border bg-background text-sm px-3 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-ring"
            />
          )}

          <button
            onClick={() => setCustom((p) => !p)}
            className="text-[11px] text-muted-foreground underline hover:text-foreground"
          >
            {custom ? "← Choose from list" : "Enter custom model name"}
          </button>

          {testResult?.ok && !isKnownModel && testResult.models.length > 0 && (
            <p className="text-[11px] text-muted-foreground">
              Installed:{" "}
              {testResult.models.slice(0, 5).map((m, i) => (
                <button
                  key={m}
                  onClick={() => { setModel(m); setCustom(false); }}
                  className="underline text-foreground mr-1"
                >
                  {m}{i < Math.min(testResult.models.length, 5) - 1 ? "" : ""}
                </button>
              ))}
            </p>
          )}
        </div>

        {/* Endpoint */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Ollama Endpoint
          </label>
          <input
            type="url"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="http://localhost:11434"
            className="w-full rounded-md border bg-background text-sm px-3 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Test connection */}
        <div className="space-y-2">
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground border rounded-md px-3 py-1.5 hover:bg-accent hover:text-foreground disabled:opacity-50 transition-colors"
          >
            {testing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wifi className="h-3.5 w-3.5" />
            )}
            Test Connection
          </button>

          {testResult && (
            <div
              className={`flex items-start gap-2 rounded-md px-3 py-2 text-xs ${
                testResult.ok
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                  : "bg-destructive/10 border border-destructive/30 text-destructive"
              }`}
            >
              {testResult.ok ? (
                <Check className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              )}
              <span>
                {testResult.ok
                  ? `Connected! ${testResult.models.length} model(s) installed.`
                  : testResult.error ?? "Connection failed."}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm border hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
