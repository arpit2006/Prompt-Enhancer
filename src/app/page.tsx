import Link from "next/link";
import { auth } from "@/auth";
import {
  Sparkles,
  Zap,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  History,
  ChevronRight,
  BarChart3,
  GitCompare,
  Lock,
  Cpu,
  Globe,
  Wind,
  Users,
  FlaskConical,
  FolderOpen,
  Star,
} from "lucide-react";

export const metadata = {
  title: "PromptCraft — Craft Better Prompts Instantly",
  description:
    "Transform rough ideas into powerful, precise AI prompts. Supports Gemini, GPT-4, Groq LLaMA, and local models.",
};

// ── Styles ────────────────────────────────────────────────────────────────────
const MARQUEE_STYLE = `
@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
.marquee-inner { animation: marquee 22s linear infinite; }
.marquee-inner:hover { animation-play-state: paused; }
@keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
.fade-up { animation: fadeUp 0.7s ease both; }
.fade-up-1 { animation-delay: 0.1s }
.fade-up-2 { animation-delay: 0.25s }
.fade-up-3 { animation-delay: 0.4s }
.fade-up-4 { animation-delay: 0.55s }
`;

// ── Data ──────────────────────────────────────────────────────────────────────
const MODELS_MARQUEE = [
  { label: "Gemini 2.0 Flash",  color: "bg-blue-500",    textColor: "text-blue-400" },
  { label: "GPT-4o",            color: "bg-emerald-500", textColor: "text-emerald-400" },
  { label: "Groq LLaMA 3.3",    color: "bg-orange-500",  textColor: "text-orange-400" },
  { label: "Mistral",           color: "bg-amber-500",   textColor: "text-amber-400" },
  { label: "Ollama Local",      color: "bg-violet-500",  textColor: "text-violet-400" },
];

const FEATURES = [
  {
    icon: Zap,
    tag: "Core",
    title: "Instant Enhancement",
    desc: "Paste any rough idea. Get 3 polished, production-ready prompt variants in under 2 seconds — each scored for clarity and completeness.",
    bg: "bg-amber-500/8 dark:bg-amber-500/5",
    border: "border-amber-500/20",
    pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    icon: BarChart3,
    tag: "Analysis",
    title: "Clarity Scoring",
    desc: "Every prompt is scored 0–100 for clarity, completeness, and specificity. Pinpoint exactly what's missing before you send.",
    bg: "bg-blue-500/8 dark:bg-blue-500/5",
    border: "border-blue-500/20",
    pill: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    icon: BrainCircuit,
    tag: "Models",
    title: "5 AI Providers",
    desc: "Gemini, GPT-4o, Groq LLaMA 3.3, Mistral, and local Ollama. Switch providers with a single click — no restart needed.",
    bg: "bg-emerald-500/8 dark:bg-emerald-500/5",
    border: "border-emerald-500/20",
    pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: GitCompare,
    tag: "Review",
    title: "Word-Level Diff",
    desc: "See exactly what changed between your original and enhanced prompt with a side-by-side word diff viewer.",
    bg: "bg-indigo-500/8 dark:bg-indigo-500/5",
    border: "border-indigo-500/20",
    pill: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: History,
    tag: "Sync",
    title: "Cross-Device History",
    desc: "Every session saved to your account. Pick up where you left off on any device, any time.",
    bg: "bg-violet-500/8 dark:bg-violet-500/5",
    border: "border-violet-500/20",
    pill: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    icon: FolderOpen,
    tag: "Organize",
    title: "Folders & Templates",
    desc: "Organize prompts into color-coded folders. Start fast with a library of pre-built templates for coding, writing, and more.",
    bg: "bg-fuchsia-500/8 dark:bg-fuchsia-500/5",
    border: "border-fuchsia-500/20",
    pill: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
  },
  {
    icon: Users,
    tag: "Tuning",
    title: "Audience Tuner",
    desc: "Rewrite for any reader — Technical, Simple, Executive, Creative, or Child-friendly. One button, completely different output.",
    bg: "bg-rose-500/8 dark:bg-rose-500/5",
    border: "border-rose-500/20",
    pill: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  {
    icon: FlaskConical,
    tag: "Testing",
    title: "Live Prompt Testing",
    desc: "Fire your prompt directly at the active LLM inside the app and see the live response — no copy-pasting to another tab.",
    bg: "bg-cyan-500/8 dark:bg-cyan-500/5",
    border: "border-cyan-500/20",
    pill: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  {
    icon: Lock,
    tag: "Privacy",
    title: "Privacy Mode",
    desc: "One toggle disables all history saving. Zero data stored, zero traces left. Your sensitive prompts stay yours.",
    bg: "bg-slate-500/8 dark:bg-slate-500/5",
    border: "border-slate-500/20",
    pill: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
];

const TESTIMONIALS = [
  {
    quote: "PromptCraft turned my vague 'explain this code' into a detailed, perfectly structured prompt. My LLM answers got 3× more useful overnight.",
    name: "Rohan M.",
    role: "Full-stack developer",
    stars: 5,
  },
  {
    quote: "The clarity score alone is worth it. I can now tell exactly why my prompt was getting garbage output before I even hit enhance.",
    name: "Sarah K.",
    role: "AI researcher",
    stars: 5,
  },
  {
    quote: "Switching between Groq (fast) and GPT-4 (precise) with one click is a game changer. I use this every single day.",
    name: "Alex T.",
    role: "Content strategist",
    stars: 5,
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function LandingPage() {
  const session = await auth();
  const appHref = session?.user ? "/app" : "/login?callbackUrl=/app";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <style>{MARQUEE_STYLE}</style>

      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
        <nav className="mx-auto max-w-5xl flex h-12 items-center gap-3 rounded-2xl border border-border/50 bg-background/80 px-4 shadow-lg shadow-black/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 font-bold text-sm shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-600 shadow-md shadow-fuchsia-500/30">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="hidden sm:inline">PromptCraft</span>
          </div>

          <div className="flex-1" />

          <div className="hidden md:flex items-center gap-0.5 text-xs">
            <a href="#features" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Features</a>
            <a href="#how" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">How it works</a>
            <a href="#testimonials" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Reviews</a>
          </div>

          <div className="flex items-center gap-2">
            {session?.user ? (
              <Link href="/app" className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-fuchsia-500/20 hover:opacity-90 transition-opacity">
                Open App <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
                <Link href={appHref} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-fuchsia-500/20 hover:opacity-90 transition-opacity">
                  Get started <ArrowRight className="h-3 w-3" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-gradient-to-b from-fuchsia-600/20 via-violet-600/15 to-transparent blur-[100px]" />
          <div className="absolute top-1/2 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-l from-indigo-500/15 to-transparent blur-[80px]" />
          <div className="absolute bottom-0 -left-20 h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-fuchsia-500/10 to-transparent blur-3xl" />
          <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
            style={{ backgroundImage: "radial-gradient(hsl(var(--border)) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left — text */}
            <div className="flex-1 text-center lg:text-left max-w-2xl">
              <div className="fade-up fade-up-1 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-1.5 text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400 mb-7">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-500 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-500" />
                </span>
                Free · No credit card · Instant setup
              </div>

              <h1 className="fade-up fade-up-2 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mb-6">
                Stop writing{" "}
                <span className="relative whitespace-nowrap">
                  <span className="relative z-10 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
                    bad prompts.
                  </span>
                  <svg className="absolute -bottom-1 left-0 w-full overflow-visible" viewBox="0 0 400 8" fill="none" preserveAspectRatio="none">
                    <path d="M2 5 Q100 1, 200 5 Q300 9, 398 3" stroke="url(#h-ul)" strokeWidth="3" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="h-ul" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#d946ef"/><stop offset="1" stopColor="#6366f1"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="fade-up fade-up-3 text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                PromptCraft analyzes your AI prompts, scores their clarity, and rewrites them into{" "}
                <span className="font-semibold text-foreground">precise, production-ready variants</span>{" "}
                — in under 2 seconds, across 5 AI providers.
              </p>

              <div className="fade-up fade-up-4 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <Link href={appHref}
                  className="group relative flex items-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:scale-[1.02] transition-all duration-200 w-full sm:w-auto justify-center">
                  <Sparkles className="h-4 w-4" />
                  Start for free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />
                </Link>
                <a href="#features"
                  className="flex items-center gap-2 rounded-2xl border border-border bg-card/60 px-7 py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 backdrop-blur transition-all w-full sm:w-auto justify-center">
                  See all features
                </a>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 justify-center lg:justify-start">
                {["Free forever", "Google & GitHub login", "Open source"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — product mockup */}
            <div className="flex-shrink-0 w-full max-w-[480px] lg:max-w-[440px]">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 blur-2xl scale-95 -z-10" />
                <div className="rounded-3xl border border-border/70 bg-card/90 shadow-2xl shadow-black/20 overflow-hidden backdrop-blur">
                  {/* Window chrome */}
                  <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-red-400/70" />
                      <span className="h-3 w-3 rounded-full bg-amber-400/70" />
                      <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">promptcraft.app</span>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      Live
                    </div>
                  </div>

                  {/* Before block */}
                  <div className="p-4 border-b border-border/40">
                    <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      Original prompt
                    </div>
                    <div className="rounded-xl bg-red-500/5 border border-red-500/15 p-3 text-sm text-muted-foreground italic">
                      &ldquo;write something that summarizes my meeting notes&rdquo;
                    </div>
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-medium text-red-500">Clarity: 12 / 100</span>
                      <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-medium text-red-500">No role</span>
                      <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-medium text-red-500">No format</span>
                    </div>
                  </div>

                  {/* Processing bar */}
                  <div className="px-4 py-2 bg-gradient-to-r from-fuchsia-500/8 to-violet-500/8 flex items-center gap-2 border-b border-border/40">
                    <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500" />
                    </div>
                    <span className="text-[10px] font-semibold text-fuchsia-600 dark:text-fuchsia-400">Enhanced in 1.7s</span>
                  </div>

                  {/* After block */}
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-widest text-fuchsia-600 dark:text-fuchsia-400">
                      <Sparkles className="h-3 w-3" />
                      PromptCraft output
                    </div>
                    <div className="rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/20 p-3 text-xs leading-relaxed">
                      <span className="font-semibold text-foreground">You are an expert meeting facilitator. </span>
                      <span className="text-muted-foreground">Summarize the following meeting notes into: (1) a 3-bullet executive summary, (2) action items with owners and deadlines, and (3) key decisions made. Format as markdown. Tone: professional. Notes: [paste here]</span>
                    </div>
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Clarity: 96 / 100</span>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">✓ Role</span>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">✓ Format</span>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">✓ Tone</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee strip ─────────────────────────────────────────────── */}
      <div className="relative border-y border-border/50 bg-muted/15 py-3 overflow-hidden">
        <p className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 z-10 hidden sm:block">Works with</p>
        <div className="overflow-hidden">
          <div className="marquee-inner flex items-center gap-0 w-max">
            {[...MODELS_MARQUEE, ...MODELS_MARQUEE, ...MODELS_MARQUEE, ...MODELS_MARQUEE].map(({ label, color, textColor }, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-1 border-r border-border/30 last:border-0">
                <span className={`h-2 w-2 rounded-full ${color} shrink-0`} />
                <span className={`text-xs font-medium whitespace-nowrap ${textColor}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { n: "5",    label: "AI providers",    sub: "in one app" },
            { n: "3",    label: "Prompt variants", sub: "per enhance" },
            { n: "100",  label: "Max clarity",     sub: "0–100 grading" },
            { n: "Free", label: "Always",          sub: "no paywall" },
          ].map(({ n, label, sub }) => (
            <div key={label} className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 text-center hover:border-fuchsia-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-fuchsia-500/5">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-4xl font-black bg-gradient-to-br from-fuchsia-500 to-violet-600 bg-clip-text text-transparent mb-1 tabular-nums">{n}</div>
              <div className="text-sm font-semibold mb-0.5">{label}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ─────────────────────────────────────────────── */}
      <section id="features" className="max-w-5xl mx-auto px-4 pb-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/8 px-4 py-1.5 text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400 mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Everything you need
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
            A complete toolkit for<br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-fuchsia-500 to-violet-600 bg-clip-text text-transparent"> prompt engineers</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            From raw idea to production-ready prompt — built for developers, writers, and AI power users.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, tag, title, desc, bg, border, pill }) => (
            <div key={title}
              className={`group relative overflow-hidden rounded-2xl border ${border} ${bg} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-3 ${pill}`}>
                    {tag}
                  </span>
                  <h3 className="font-bold text-base leading-snug">{title}</h3>
                </div>
                <div className="shrink-0 rounded-xl bg-background/60 border border-border/50 p-2 shadow-sm">
                  <Icon className="h-5 w-5 text-foreground/70" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section id="how" className="relative py-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-fuchsia-500/3 to-transparent" />
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs font-semibold text-muted-foreground mb-5">
              <Zap className="h-3.5 w-3.5" />
              How it works
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              From rough idea to<br className="hidden sm:block" /> perfect prompt in 4 steps
            </h2>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="hidden lg:block absolute top-9 left-[14%] right-[14%] h-px bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent" />
            {[
              { n: "01", title: "Paste your idea",  desc: "Type anything — a rough sentence, half-formed thought, or even a single keyword.",           color: "from-fuchsia-500 to-violet-500" },
              { n: "02", title: "Pick your model",  desc: "Select Gemini, GPT-4o, Groq LLaMA, Mistral, or run fully offline with Ollama.",             color: "from-violet-500 to-indigo-500" },
              { n: "03", title: "Get 3 variants",   desc: "Full rewrite, structural improvement, and additive enhancement — all clarity-scored.",       color: "from-indigo-500 to-cyan-500" },
              { n: "04", title: "Copy & ship",      desc: "Pick the best version, copy it, and paste into any AI tool or API call.",                    color: "from-cyan-500 to-emerald-500" },
            ].map(({ n, title, desc, color }) => (
              <div key={n} className="group flex flex-col items-center text-center gap-4">
                <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-xl text-white font-black text-lg group-hover:scale-110 transition-transform duration-300`}>
                  {n}
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1.5">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Models section ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-10 pb-24">
        <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Text */}
            <div className="p-8 sm:p-12 flex flex-col justify-center gap-5 border-b lg:border-b-0 lg:border-r border-border/60">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground w-fit">
                <Globe className="h-3.5 w-3.5" />
                Multi-provider
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                All your favourite models,<br />one interface
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Switch between cloud and on-device inference with a single click. Each model gets prompts tuned specifically for its architecture and capabilities.
              </p>
              <Link href={appHref}
                className="group w-fit flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity shadow-lg shadow-fuchsia-500/25">
                Try it free
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Model cards */}
            <div className="p-8 sm:p-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 bg-muted/10">
              {[
                { name: "Gemini 2.0 Flash", by: "Google DeepMind", color: "from-blue-500 to-cyan-400",      icon: Globe },
                { name: "GPT-4o",           by: "OpenAI",          color: "from-emerald-500 to-teal-400",   icon: BrainCircuit },
                { name: "LLaMA 3.3 70B",   by: "via Groq",        color: "from-orange-500 to-amber-400",   icon: Zap },
                { name: "Mistral",          by: "Mistral AI",      color: "from-amber-500 to-yellow-400",   icon: Wind },
                { name: "Ollama Local",     by: "On-device",       color: "from-violet-500 to-purple-400",  icon: Cpu },
                { name: "More soon",        by: "Stay tuned",      color: "from-slate-500 to-zinc-400",     icon: Sparkles },
              ].map(({ name, by, color, icon: Icon }) => (
                <div key={name} className="rounded-2xl border border-border/60 bg-background/60 p-4 hover:border-fuchsia-500/30 hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-sm`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="font-bold text-xs leading-snug">{name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{by}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section id="testimonials" className="relative py-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-violet-500/4 to-transparent" />
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs font-semibold text-muted-foreground mb-5">
              <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
              What people are saying
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Loved by prompt engineers</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ quote, name, role, stars }) => (
              <div key={name} className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 hover:border-fuchsia-500/30 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-fuchsia-500/5">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fuchsia-500/4 to-violet-500/4 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">&ldquo;{quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{name}</div>
                      <div className="text-[11px] text-muted-foreground">{role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-950 via-violet-900 to-indigo-900 dark:from-fuchsia-950 dark:to-black" />
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px 200px",
          }} />
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }} />
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative px-8 sm:px-16 py-16 sm:py-24 flex flex-col items-center text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 backdrop-blur border border-white/20 shadow-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-5">
              Write once.
              <br />
              <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                Get it right.
              </span>
            </h2>
            <p className="text-violet-200/70 text-base sm:text-lg max-w-sm mb-10 leading-relaxed">
              Sign up with Google or GitHub — no credit card, no setup. Start crafting perfect prompts in under 30 seconds.
            </p>
            <Link href={appHref}
              className="group inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-black text-fuchsia-700 shadow-2xl shadow-black/40 hover:bg-violet-50 hover:scale-[1.03] transition-all duration-200">
              <Sparkles className="h-4 w-4" />
              Start for free — it&apos;s instant
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-xs text-violet-300/60">
              {["No credit card", "Free forever", "Google & GitHub login", "Open source"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-violet-400/70" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-600 shadow-sm shadow-fuchsia-500/30">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            PromptCraft
            <span className="text-muted-foreground font-normal text-xs ml-1">— Craft better prompts instantly</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
            <Link href="/app" className="hover:text-foreground transition-colors">App</Link>
            <Link href="/profile" className="hover:text-foreground transition-colors">Profile</Link>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="https://github.com/arpit2006/Prompt-Enhancer" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
            <span className="text-muted-foreground/50">© {new Date().getFullYear()} PromptCraft</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
