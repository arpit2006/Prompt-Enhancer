"use client";

import { useEffect, useRef, useState } from "react";
import { X, Mail, CheckCircle2, Loader2, Bell, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Status = "idle" | "loading" | "success" | "already" | "error";

export function NewsletterModal({ open, onClose }: Props) {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-fill with signed-in user's email
  useEffect(() => {
    if (open) {
      setEmail(session?.user?.email ?? "");
      setStatus("idle");
      setErrorMsg("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, session]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          name: session?.user?.name ?? undefined,
          source: "navbar",
        }),
      });
      const data = (await res.json()) as { status?: string; error?: string };

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      if (data.status === "already_subscribed") {
        setStatus("already");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection.");
      setStatus("error");
    }
  };

  const isDone = status === "success" || status === "already";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md rounded-2xl border bg-card shadow-2xl animate-in fade-in-0 zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative flex items-start gap-4 p-6 pb-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 shadow-md">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 pr-8">
              <h2 className="text-lg font-semibold leading-tight">
                Stay in the loop
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Get notified about new features, improvements, and tips for
                better prompt engineering — straight to your inbox.
              </p>
            </div>
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* What you'll get */}
          <div className="mx-6 mt-5 rounded-xl bg-muted/50 p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              What you&apos;ll receive
            </p>
            {[
              "New AI model integrations & prompt techniques",
              "Feature announcements and changelog updates",
              "Prompt engineering guides and templates",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm">
                <Sparkles className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Form / States */}
          <div className="p-6 pt-5">
            {isDone ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full",
                    status === "already"
                      ? "bg-amber-100 dark:bg-amber-900/30"
                      : "bg-emerald-100 dark:bg-emerald-900/30"
                  )}
                >
                  <CheckCircle2
                    className={cn(
                      "h-7 w-7",
                      status === "already"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    )}
                  />
                </div>
                <div>
                  <p className="font-semibold">
                    {status === "already"
                      ? "You're already subscribed!"
                      : "You're subscribed!"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {status === "already"
                      ? `${email} is already on our list. We'll keep you posted.`
                      : `Welcome aboard! We'll send updates to ${email}.`}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="mt-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg("");
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="you@example.com"
                    className={cn(
                      "w-full rounded-lg border bg-background py-2.5 pl-9 pr-4 text-sm outline-none",
                      "placeholder:text-muted-foreground/60",
                      "focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all",
                      errorMsg && "border-destructive focus:ring-destructive/30"
                    )}
                    autoComplete="email"
                    disabled={status === "loading"}
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading" || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subscribing…
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      Subscribe to Updates
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-muted-foreground">
                  No spam, ever. Unsubscribe at any time.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
