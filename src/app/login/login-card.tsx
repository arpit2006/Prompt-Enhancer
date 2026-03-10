"use client";

import { useState, useTransition, useEffect } from "react";
import { Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { signInWithGoogle, signInWithGitHub, signInWithTestUser } from "./actions";

// ── SVG provider icons ────────────────────────────────────────────────────────

function GoogleIcon({ spinning }: { spinning?: boolean }) {
  if (spinning) return <LoadingDots />;
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon({ spinning }: { spinning?: boolean }) {
  if (spinning) return <LoadingDots />;
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LoadingDots() {
  return (
    <span className="flex items-center gap-1 h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current"
          style={{ animation: `dotBounce 1s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
    </span>
  );
}

// Full-screen redirect overlay shown while OAuth redirect is in flight
function RedirectOverlay({ provider }: { provider: "google" | "github" }) {
  const [dotCount, setDotCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setDotCount((d) => (d + 1) % 4), 450);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md"
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      {/* The custom loader */}
      <div className="loader mb-8" />

      {/* Label */}
      <p className="text-lg font-semibold tracking-tight">
        Redirecting to {provider === "google" ? "Google" : "GitHub"}
        {".".repeat(dotCount)}
      </p>
      <p className="text-sm text-muted-foreground mt-2">Hang on, just a moment…</p>

      {/* Progress bar */}
      <div className="mt-8 h-1 w-56 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
          style={{ animation: "progressFill 2.5s cubic-bezier(0.4,0,0.2,1) forwards" }}
        />
      </div>
    </div>
  );
}

// ── Error message map ─────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin:    "Could not start the sign-in flow. Please try again.",
  OAuthCallback:  "Error during OAuth callback. Please try again.",
  OAuthCreateAccount: "Could not create your account. Try a different provider.",
  EmailCreateAccount: "Could not create your account.",
  Callback:       "An unexpected error occurred.",
  OAuthAccountNotLinked:
    "This email is already linked to another provider. Sign in with that instead.",
  Configuration:  "Sign-in configuration error. Please try again.",
  Default:        "Something went wrong. Please try again.",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function LoginCard({
  callbackUrl,
  error,
  isDev,
}: {
  callbackUrl?: string;
  error?: string;
  isDev?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [activeProvider, setActiveProvider] = useState<"google" | "github" | null>(null);
  const [mounted, setMounted] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [devPassword, setDevPassword] = useState("");
  const [devError, setDevError] = useState("");
  const [devPending, startDevTransition] = useTransition();

  // Trigger card entry animation after first paint
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleGoogle = () => {
    setActiveProvider("google");
    startTransition(() => signInWithGoogle(callbackUrl));
  };

  const handleGitHub = () => {
    setActiveProvider("github");
    startTransition(() => signInWithGitHub(callbackUrl));
  };

  const handleDevLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setDevError("");
    startDevTransition(async () => {
      const result = await signInWithTestUser(devPassword, callbackUrl);
      if (result?.error) setDevError(result.error);
    });
  };

  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default)
    : null;

  const isGoogle = pending && activeProvider === "google";
  const isGitHub = pending && activeProvider === "github";

  return (
    <>
      {/* Full-page redirect overlay */}
      {pending && activeProvider && <RedirectOverlay provider={activeProvider} />}

      {/* Inject keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50%       { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to   { width: 90%; }
        }
      `}</style>

      <div
        className="w-full max-w-sm space-y-8"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.45s ease, transform 0.45s ease",
        }}
      >
        {/* Logo + heading */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              {/* Pulsing outer ring */}
              <div
                className="absolute inset-0 rounded-2xl bg-primary opacity-20 animate-ping"
                style={{ animationDuration: "2.6s" }}
              />
              {/* Glow */}
              <div className="absolute inset-0 rounded-2xl bg-primary blur-xl opacity-25 -z-10" />
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-primary/30">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PromptCraft</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Sign in to save your prompts and preferences
            </p>
          </div>
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div
            className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            style={{ animation: "slideDown 0.3s ease" }}
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Sign-in card */}
        <div className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-lg p-6 space-y-3">

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={pending}
            className={`w-full flex items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed
              ${isGoogle
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                : "bg-background hover:bg-accent hover:shadow-md hover:scale-[1.015]"
              }
              ${!isGoogle && pending ? "opacity-40" : ""}
            `}
          >
            <GoogleIcon spinning={isGoogle} />
            {isGoogle ? (
              <span className="text-blue-700 dark:text-blue-300 font-medium animate-pulse">
                Opening Google…
              </span>
            ) : (
              <span>Continue with Google</span>
            )}
            {!pending && <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-25" />}
          </button>

          {/* GitHub */}
          <button
            onClick={handleGitHub}
            disabled={pending}
            className={`w-full flex items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed
              ${isGitHub
                ? "bg-slate-50 dark:bg-slate-800/60 border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                : "bg-background hover:bg-accent hover:shadow-md hover:scale-[1.015]"
              }
              ${!isGitHub && pending ? "opacity-40" : ""}
            `}
          >
            <GitHubIcon spinning={isGitHub} />
            {isGitHub ? (
              <span className="text-slate-700 dark:text-slate-300 font-medium animate-pulse">
                Opening GitHub…
              </span>
            ) : (
              <span>Continue with GitHub</span>
            )}
            {!pending && <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-25" />}
          </button>

          {/* Dev-only test login */}
          {isDev && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => { setDevOpen((o) => !o); setDevError(""); }}
                className="flex items-center gap-1.5 text-[11px] font-mono text-amber-500 hover:text-amber-600 transition-colors"
              >
                <span>🧪</span>
                {devOpen ? "Hide dev login" : "Dev test login"}
              </button>

              {devOpen && (
                <form onSubmit={handleDevLogin} className="mt-2 space-y-2">
                  <input
                    type="password"
                    value={devPassword}
                    onChange={(e) => setDevPassword(e.target.value)}
                    placeholder="Dev password"
                    autoFocus
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  {devError && (
                    <p className="text-[11px] text-destructive">{devError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={devPending || !devPassword}
                    className="w-full rounded-lg border border-dashed border-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {devPending ? "Signing in…" : "Sign in as Test User"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] text-muted-foreground">No password needed</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
            Your API keys are stored only in your browser.
            <br />
            We never see them.
          </p>
        </div>

        {/* Feature hints — staggered fade-in */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: "✨", label: "AI Enhancement", delay: "0ms" },
            { icon: "📋", label: "Prompt History",  delay: "90ms" },
            { icon: "🔒", label: "Private & Local", delay: "180ms" },
          ].map(({ icon, label, delay }) => (
            <div
              key={label}
              className="rounded-xl border bg-muted/30 px-2 py-3 space-y-1 hover:bg-muted/60 hover:scale-105 transition-all duration-200"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 0.45s ease ${delay}, transform 0.45s ease ${delay}`,
              }}
            >
              <div className="text-xl">{icon}</div>
              <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
