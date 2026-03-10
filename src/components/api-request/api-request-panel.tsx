"use client";

import { useState } from "react";
import {
  Play,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { useAppStore } from "@/store/prompt-store";
import { uid } from "@/lib/utils";
import type { ApiAuthMethod, ApiRequestConfig, CustomHeader } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

const AUTH_METHODS: { id: ApiAuthMethod; label: string }[] = [
  { id: "none",           label: "None" },
  { id: "bearer",         label: "Bearer Token" },
  { id: "api-key-header", label: "API Key (Header)" },
  { id: "basic",          label: "Basic Auth" },
  { id: "custom-header",  label: "Custom Header" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(code: number) {
  if (code < 200) return "text-muted-foreground";
  if (code < 300) return "text-green-600 dark:text-green-400";
  if (code < 400) return "text-blue-600 dark:text-blue-400";
  if (code < 500) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
}

function buildHeaders(
  config: ApiRequestConfig
): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  switch (config.authMethod) {
    case "bearer":
      if (config.authHeaderValue)
        headers["Authorization"] = `Bearer ${config.authHeaderValue}`;
      break;
    case "api-key-header":
      if (config.authHeaderName && config.authHeaderValue)
        headers[config.authHeaderName] = config.authHeaderValue;
      break;
    case "basic":
      if (config.basicUsername) {
        const encoded = btoa(`${config.basicUsername}:${config.basicPassword}`);
        headers["Authorization"] = `Basic ${encoded}`;
      }
      break;
    case "custom-header":
      if (config.authHeaderName && config.authHeaderValue)
        headers[config.authHeaderName] = config.authHeaderValue;
      break;
  }

  for (const h of config.customHeaders) {
    if (h.key.trim()) headers[h.key.trim()] = h.value;
  }

  return headers;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ApiRequestPanel() {
  const {
    currentPrompt,
    apiRequestConfig,
    apiRequestResponse,
    apiRequestError,
    isApiRequesting,
    setApiRequestConfig,
    setApiRequestResponse,
    setApiRequestError,
    setIsApiRequesting,
  } = useAppStore();

  const [showHeaders, setShowHeaders] = useState(false);
  const [showRespHeaders, setShowRespHeaders] = useState(false);
  const [copied, setCopied] = useState(false);

  const cfg = apiRequestConfig;
  const hasBody = ["POST", "PUT", "PATCH"].includes(cfg.method);

  // ── Run request ─────────────────────────────────────────────────────────────

  const handleRun = async () => {
    if (!cfg.endpoint.trim() || isApiRequesting) return;
    setIsApiRequesting(true);
    setApiRequestError(null);
    setApiRequestResponse(null);

    const body = hasBody
      ? cfg.bodyTemplate.replace(/\{\{prompt\}\}/g, currentPrompt)
      : undefined;

    const t0 = performance.now();
    try {
      const res = await fetch(cfg.endpoint, {
        method: cfg.method,
        headers: buildHeaders(cfg),
        ...(body !== undefined ? { body } : {}),
      });

      const durationMs = Math.round(performance.now() - t0);
      const respBody = await res.text();

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => { responseHeaders[key] = val; });

      setApiRequestResponse({
        status: res.status,
        statusText: res.statusText,
        responseHeaders,
        body: respBody,
        durationMs,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed.";
      const isCors =
        msg.toLowerCase().includes("failed to fetch") ||
        msg.toLowerCase().includes("cors");
      setApiRequestError(
        isCors
          ? `Failed to fetch. This is likely a CORS restriction — the target API does not allow browser requests from this origin.\n\nTip: Use a local proxy, or test in Postman/curl instead.`
          : msg
      );
    } finally {
      setIsApiRequesting(false);
    }
  };

  // ── Header row helpers ───────────────────────────────────────────────────────

  const addCustomHeader = () =>
    setApiRequestConfig({
      customHeaders: [
        ...cfg.customHeaders,
        { id: uid(), key: "", value: "" },
      ],
    });

  const removeCustomHeader = (id: string) =>
    setApiRequestConfig({
      customHeaders: cfg.customHeaders.filter((h) => h.id !== id),
    });

  const updateCustomHeader = (id: string, patch: Partial<CustomHeader>) =>
    setApiRequestConfig({
      customHeaders: cfg.customHeaders.map((h) =>
        h.id === id ? { ...h, ...patch } : h
      ),
    });

  const copyResponse = () => {
    if (!apiRequestResponse) return;
    navigator.clipboard.writeText(apiRequestResponse.body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  // ── Pretty-print JSON if possible ───────────────────────────────────────────

  const prettyBody = (raw: string) => {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  };

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 space-y-4">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div>
          <h3 className="text-sm font-semibold">API Request Tester</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
            Send your current prompt to any API endpoint and inspect the
            response. Use <code className="bg-muted px-0.5 rounded text-[10px]">{"{{prompt}}"}</code> in the body template.
          </p>
        </div>

        {/* ── Endpoint + Method ────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Endpoint
          </label>
          <div className="flex gap-1.5">
            {/* Method */}
            <select
              value={cfg.method}
              onChange={(e) =>
                setApiRequestConfig({
                  method: e.target.value as typeof cfg.method,
                })
              }
              className="rounded-md border bg-background text-xs px-2 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-ring shrink-0"
            >
              {HTTP_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* URL */}
            <input
              type="url"
              value={cfg.endpoint}
              onChange={(e) => setApiRequestConfig({ endpoint: e.target.value })}
              placeholder="https://api.example.com/v1/chat"
              className="flex-1 min-w-0 rounded-md border bg-background text-xs px-2.5 py-1.5 font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* ── Auth Method ──────────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Login / Auth Method
          </label>
          <select
            value={cfg.authMethod}
            onChange={(e) =>
              setApiRequestConfig({ authMethod: e.target.value as ApiAuthMethod })
            }
            className="w-full rounded-md border bg-background text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {AUTH_METHODS.map(({ id, label }) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>

          {/* Token / key value */}
          {(cfg.authMethod === "bearer" ||
            cfg.authMethod === "api-key-header" ||
            cfg.authMethod === "custom-header") && (
            <div className="space-y-1.5">
              {cfg.authMethod !== "bearer" && (
                <input
                  type="text"
                  value={cfg.authHeaderName}
                  onChange={(e) =>
                    setApiRequestConfig({ authHeaderName: e.target.value })
                  }
                  placeholder="Header name (e.g. X-API-Key)"
                  className="w-full rounded-md border bg-background text-xs px-2.5 py-1.5 font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              )}
              <input
                type="password"
                value={cfg.authHeaderValue}
                onChange={(e) =>
                  setApiRequestConfig({ authHeaderValue: e.target.value })
                }
                placeholder={
                  cfg.authMethod === "bearer"
                    ? "Your bearer token"
                    : "Your API key / token value"
                }
                className="w-full rounded-md border bg-background text-xs px-2.5 py-1.5 font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <p className="text-[10px] text-muted-foreground">
                Stored only in your browser — never sent to our servers.
              </p>
            </div>
          )}

          {cfg.authMethod === "basic" && (
            <div className="flex gap-1.5">
              <input
                type="text"
                value={cfg.basicUsername}
                onChange={(e) =>
                  setApiRequestConfig({ basicUsername: e.target.value })
                }
                placeholder="Username"
                className="flex-1 rounded-md border bg-background text-xs px-2.5 py-1.5 font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <input
                type="password"
                value={cfg.basicPassword}
                onChange={(e) =>
                  setApiRequestConfig({ basicPassword: e.target.value })
                }
                placeholder="Password"
                className="flex-1 rounded-md border bg-background text-xs px-2.5 py-1.5 font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          )}
        </div>

        {/* ── Custom Headers ───────────────────────────────────────────────── */}
        <div>
          <button
            onClick={() => setShowHeaders((p) => !p)}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
          >
            {showHeaders ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            Headers{" "}
            {cfg.customHeaders.length > 0 && (
              <span className="rounded-full bg-primary text-primary-foreground px-1.5 py-0 text-[9px] font-bold normal-case ml-1">
                {cfg.customHeaders.length}
              </span>
            )}
          </button>

          {showHeaders && (
            <div className="mt-2 space-y-1.5">
              {cfg.customHeaders.map((h) => (
                <div key={h.id} className="flex gap-1.5 items-center">
                  <input
                    type="text"
                    value={h.key}
                    onChange={(e) =>
                      updateCustomHeader(h.id, { key: e.target.value })
                    }
                    placeholder="Header-Name"
                    className="flex-1 rounded-md border bg-background text-xs px-2 py-1 font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={(e) =>
                      updateCustomHeader(h.id, { value: e.target.value })
                    }
                    placeholder="value"
                    className="flex-1 rounded-md border bg-background text-xs px-2 py-1 font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    onClick={() => removeCustomHeader(h.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={addCustomHeader}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add header
              </button>
            </div>
          )}
        </div>

        {/* ── Body Template (POST/PUT/PATCH only) ─────────────────────────── */}
        {hasBody && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Body Template
            </label>
            <textarea
              value={cfg.bodyTemplate}
              onChange={(e) =>
                setApiRequestConfig({ bodyTemplate: e.target.value })
              }
              rows={6}
              placeholder={'{\n  "prompt": "{{prompt}}"\n}'}
              spellCheck={false}
              className="w-full rounded-md border bg-muted/30 text-xs px-2.5 py-2 font-mono leading-relaxed placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring resize-y"
            />
            <p className="text-[10px] text-muted-foreground">
              <code className="bg-muted px-0.5 rounded">{"{{prompt}}"}</code> will
              be replaced with your current prompt text before sending.
            </p>
          </div>
        )}

        {/* ── Run Button ───────────────────────────────────────────────────── */}
        <button
          onClick={handleRun}
          disabled={isApiRequesting || !cfg.endpoint.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold py-2 hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isApiRequesting ? (
            <>
              <Clock className="h-3.5 w-3.5 animate-pulse" />
              Sending…
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              Run with Current Prompt
            </>
          )}
        </button>

        {!currentPrompt.trim() && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 text-center">
            No prompt in editor — the <code className="bg-muted px-0.5 rounded">{"{{prompt}}"}</code> placeholder will be empty.
          </p>
        )}

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {apiRequestError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 space-y-1">
            <div className="flex items-center gap-1.5 text-destructive text-xs font-medium">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Request failed
            </div>
            <p className="text-xs text-destructive/90 whitespace-pre-wrap leading-snug font-mono">
              {apiRequestError}
            </p>
          </div>
        )}

        {/* ── Response ─────────────────────────────────────────────────────── */}
        {apiRequestResponse && (
          <div className="space-y-2 border rounded-md overflow-hidden">
            {/* Status bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
                <span
                  className={`font-mono text-xs font-bold ${statusColor(
                    apiRequestResponse.status
                  )}`}
                >
                  {apiRequestResponse.status} {apiRequestResponse.statusText}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {apiRequestResponse.durationMs}ms
              </span>
            </div>

            {/* Response headers toggle */}
            <div className="px-3">
              <button
                onClick={() => setShowRespHeaders((p) => !p)}
                className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
              >
                {showRespHeaders ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                Response Headers
              </button>
              {showRespHeaders && (
                <div className="mt-1.5 space-y-0.5 mb-2">
                  {Object.entries(apiRequestResponse.responseHeaders).map(
                    ([k, v]) => (
                      <div key={k} className="flex gap-2 text-[10px] font-mono">
                        <span className="text-blue-600 dark:text-blue-400 shrink-0">
                          {k}
                        </span>
                        <span className="text-muted-foreground truncate">{v}</span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="px-3 pb-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Body
                </span>
                <button
                  onClick={copyResponse}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="text-[10px] font-mono bg-muted/30 rounded-md p-2.5 overflow-x-auto max-h-64 whitespace-pre-wrap break-all leading-relaxed">
                {prettyBody(apiRequestResponse.body)}
              </pre>
              <p className="text-[9px] text-muted-foreground text-right">
                {new Date(apiRequestResponse.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
