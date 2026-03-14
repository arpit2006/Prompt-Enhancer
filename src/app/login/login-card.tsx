"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, AlertCircle, ArrowRight, ArrowLeft, Zap, Shield, History } from "lucide-react";
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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xl"
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      <div className="relative mb-8 h-16 w-16">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 animate-ping opacity-40" />
        <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-2xl">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
      </div>
      <p className="text-lg font-semibold tracking-tight text-white">
        Redirecting to {provider === "google" ? "Google" : "GitHub"}
        {".".repeat(dotCount)}
      </p>
      <p className="text-sm text-white/50 mt-2">Hang on, just a moment…</p>
      <div className="mt-8 h-0.5 w-56 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500"
          style={{ animation: "progressFill 2.5s cubic-bezier(0.4,0,0.2,1) forwards" }}
        />
      </div>
    </div>
  );
}

// ── Floating particle ─────────────────────────────────────────────────────────

function Particles() {
  const particles = [
    { size: 3, x: "10%",  y: "20%", delay: "0s",    dur: "6s"  },
    { size: 2, x: "85%",  y: "15%", delay: "1.2s",  dur: "8s"  },
    { size: 4, x: "70%",  y: "75%", delay: "0.5s",  dur: "7s"  },
    { size: 2, x: "25%",  y: "80%", delay: "2s",    dur: "9s"  },
    { size: 3, x: "50%",  y: "10%", delay: "1.5s",  dur: "6.5s"},
    { size: 2, x: "92%",  y: "55%", delay: "0.8s",  dur: "7.5s"},
    { size: 3, x: "5%",   y: "60%", delay: "2.5s",  dur: "8.5s"},
    { size: 2, x: "60%",  y: "90%", delay: "3s",    dur: "7s"  },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-violet-400/40"
          style={{
            width: p.size, height: p.size,
            left: p.x, top: p.y,
            animation: `particleFloat ${p.dur} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}
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
  const [hoveredBtn, setHoveredBtn] = useState<"google" | "github" | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Subtle card tilt on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -4, y: dx * 4 });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

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
      {pending && activeProvider && <RedirectOverlay provider={activeProvider} />}

      <style>{`
        @keyframes fadeIn        { from { opacity:0 } to { opacity:1 } }
        @keyframes slideDown     { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes dotBounce     { 0%,100% { transform:translateY(0); opacity:.5 } 50% { transform:translateY(-5px); opacity:1 } }
        @keyframes progressFill  { from { width:0% } to { width:90% } }
        @keyframes particleFloat { 0%,100% { transform:translateY(0) scale(1); opacity:.4 } 50% { transform:translateY(-18px) scale(1.3); opacity:.8 } }
        @keyframes borderSpin    { to { --angle: 360deg } }
        @keyframes shimmer       { 0% { background-position: -200% center } 100% { background-position: 200% center } }
        @keyframes iconPop       { 0% { transform:scale(1) } 50% { transform:scale(1.15) rotate(-8deg) } 100% { transform:scale(1) } }
        @keyframes badgePulse    { 0%,100% { box-shadow:0 0 0 0 rgba(139,92,246,.5) } 70% { box-shadow:0 0 0 6px rgba(139,92,246,0) } }

        .google-btn:hover { box-shadow: 0 0 24px rgba(66,133,244,0.25), 0 4px 16px rgba(0,0,0,0.3); }
        .github-btn:hover { box-shadow: 0 0 24px rgba(139,92,246,0.30), 0 4px 16px rgba(0,0,0,0.3); }

        .card-glass {
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .glow-ring {
          position:absolute; inset:-1px; border-radius:inherit; pointer-events:none;
          background: conic-gradient(from var(--angle,0deg), transparent 70%, rgba(139,92,246,.6) 80%, rgba(99,102,241,.7) 90%, transparent 100%);
          animation: borderSpin 4s linear infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          padding: 1px;
        }
        @property --angle { syntax:'<angle>'; inherits:false; initial-value:0deg; }
      `}</style>

      <div
        className="w-full max-w-[400px]"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 0.5s cubic-bezier(0,0,.2,1), transform 0.5s cubic-bezier(0,0,.2,1)",
        }}
      >
        {/* Back link */}
        <div className="mb-6 flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>
        </div>

        {/* ── Main glass card ── */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative rounded-2xl card-glass p-8"
          style={{
            transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.18s ease",
          }}
        >
          {/* Spinning gradient border ring */}
          <div className="glow-ring rounded-2xl" />

          {/* Floating particles inside card */}
          <Particles />

          {/* ── Logo ── */}
          <div className="relative z-10 flex flex-col items-center mb-7">
            <div className="relative mb-4">
              <div
                className="absolute inset-0 rounded-[18px] bg-violet-500 opacity-30 blur-2xl scale-150"
                style={{ animation: "badgePulse 2.8s ease-in-out infinite" }}
              />
              <div
                className="relative h-[68px] w-[68px] rounded-[18px] bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-900/50"
                style={{ animation: "iconPop 3.5s ease-in-out infinite" }}
              >
                <Sparkles className="h-8 w-8 text-white drop-shadow" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">PromptCraft</h1>
            <p className="text-sm text-white/45 mt-1.5 text-center leading-relaxed">
              Sign in to unlock AI-powered prompt enhancement
            </p>
          </div>

          {/* ── Error banner ── */}
          {errorMessage && (
            <div
              className="relative z-10 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur px-4 py-3 text-sm text-red-300 mb-5"
              style={{ animation: "slideDown 0.3s ease" }}
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* ── Buttons ── */}
          <div className="relative z-10 space-y-3">
            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={pending}
              onMouseEnter={() => setHoveredBtn("google")}
              onMouseLeave={() => setHoveredBtn(null)}
              className={`google-btn w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed border ${
                isGoogle
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                  : "bg-white/[0.06] border-white/[0.10] text-white hover:bg-white/[0.10] hover:border-white/20"
              } ${!isGoogle && pending ? "opacity-35" : ""}`}
            >
              <GoogleIcon spinning={isGoogle} />
              <span className="flex-1 text-left">
                {isGoogle ? <span className="animate-pulse">Opening Google…</span> : "Continue with Google"}
              </span>
              {!pending && (
                <ArrowRight
                  className="h-4 w-4 opacity-30 transition-all duration-200"
                  style={{ opacity: hoveredBtn === "google" ? 0.7 : 0.3, transform: hoveredBtn === "google" ? "translateX(2px)" : "none" }}
                />
              )}
            </button>

            {/* GitHub */}
            <button
              onClick={handleGitHub}
              disabled={pending}
              onMouseEnter={() => setHoveredBtn("github")}
              onMouseLeave={() => setHoveredBtn(null)}
              className={`github-btn w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed border ${
                isGitHub
                  ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                  : "bg-white/[0.06] border-white/[0.10] text-white hover:bg-white/[0.10] hover:border-white/20"
              } ${!isGitHub && pending ? "opacity-35" : ""}`}
            >
              <GitHubIcon spinning={isGitHub} />
              <span className="flex-1 text-left">
                {isGitHub ? <span className="animate-pulse">Opening GitHub…</span> : "Continue with GitHub"}
              </span>
              {!pending && (
                <ArrowRight
                  className="h-4 w-4 transition-all duration-200"
                  style={{ opacity: hoveredBtn === "github" ? 0.7 : 0.3, transform: hoveredBtn === "github" ? "translateX(2px)" : "none" }}
                />
              )}
            </button>

            {/* Dev login */}
            {isDev && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => { setDevOpen((o) => !o); setDevError(""); }}
                  className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400/70 hover:text-amber-400 transition-colors"
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
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-amber-400/60"
                    />
                    {devError && <p className="text-[11px] text-red-400">{devError}</p>}
                    <button
                      type="submit"
                      disabled={devPending || !devPassword}
                      className="w-full rounded-lg border border-dashed border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {devPending ? "Signing in…" : "Sign in as Test User"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* ── Divider ── */}
          <div className="relative z-10 flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-[11px] text-white/25 tracking-wide uppercase">No password needed</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          {/* ── Privacy note ── */}
          <p className="relative z-10 text-center text-[11px] text-white/25 leading-relaxed">
            Your API keys are stored only in your browser — we never see them.
          </p>
        </div>

        {/* ── Feature pills ── */}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {[
            { icon: <Zap className="h-3.5 w-3.5" />, label: "AI Enhancement", delay: "0ms",   color: "text-violet-400" },
            { icon: <History className="h-3.5 w-3.5" />, label: "Prompt History", delay: "80ms",  color: "text-indigo-400" },
            { icon: <Shield className="h-3.5 w-3.5" />, label: "Private & Local", delay: "160ms", color: "text-cyan-400"   },
          ].map(({ icon, label, delay, color }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-2 py-3 hover:bg-white/[0.06] hover:border-white/[0.12] hover:scale-105 transition-all duration-200 cursor-default"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 0.5s ease ${delay}, transform 0.5s ease ${delay}`,
              }}
            >
              <span className={color}>{icon}</span>
              <p className="text-[10px] font-medium text-white/35">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
