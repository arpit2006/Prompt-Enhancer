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
  Layers,
  BarChart3,
  GitCompare,
  Lock,
  Cpu,
  Globe,
} from "lucide-react";

export const metadata = {
  title: "PromptCraft — Craft Better Prompts Instantly",
  description:
    "Transform rough ideas into powerful, precise AI prompts. Supports Gemini, GPT-4, Groq LLaMA, and local models.",
};

// ── Data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "4", label: "AI Models Supported" },
  { value: "3×", label: "Richer Prompts" },
  { value: "100", label: "Max Clarity Score" },
  { value: "Free", label: "Always" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Enhancement",
    desc: "Paste any rough idea and get 3 polished, production-ready variants in seconds.",
    span: "col-span-1",
    accent: "from-amber-500/20 to-orange-500/5",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
  },
  {
    icon: BrainCircuit,
    title: "Multi-Model Support",
    desc: "Gemini, GPT-4o, Groq LLaMA 3.3, and local Ollama — switch with one click.",
    span: "col-span-1",
    accent: "from-emerald-500/20 to-teal-500/5",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
  {
    icon: BarChart3,
    title: "Clarity Scoring",
    desc: "Every prompt is scored 0–100 for clarity and completeness. Know exactly what needs fixing.",
    span: "col-span-1 sm:col-span-2 lg:col-span-1",
    accent: "from-blue-500/20 to-cyan-500/5",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: History,
    title: "Cross-Device History",
    desc: "Every session saved to your account. Pick up on any device, any time.",
    span: "col-span-1",
    accent: "from-violet-500/20 to-purple-500/5",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
  },
  {
    icon: GitCompare,
    title: "Diff & Compare",
    desc: "Side-by-side diff view to see exactly what changed between versions.",
    span: "col-span-1",
    accent: "from-indigo-500/20 to-blue-500/5",
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-500/10",
  },
  {
    icon: Lock,
    title: "Privacy Mode",
    desc: "One toggle to disable all history saving. Zero data stored, zero traces left.",
    span: "col-span-1",
    accent: "from-rose-500/20 to-pink-500/5",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-500/10",
  },
];

const MODELS = [
  { label: "Gemini 2.0 Flash", color: "bg-blue-500" },
  { label: "GPT-4o", color: "bg-emerald-500" },
  { label: "LLaMA 3.3 70B", color: "bg-orange-500" },
  { label: "Ollama Local", color: "bg-violet-500" },
];

const STEPS = [
  {
    n: "01",
    title: "Paste your idea",
    desc: "Type anything — a rough sentence, a half-formed thought, or even a single word.",
  },
  {
    n: "02",
    title: "Choose your model",
    desc: "Select Gemini, GPT-4, Groq, or run fully offline with a local Ollama model.",
  },
  {
    n: "03",
    title: "Get 3 variants",
    desc: "A full rewrite, a structural improvement, and an additive enhancement — all scored.",
  },
  {
    n: "04",
    title: "Copy & ship",
    desc: "Pick the best version, copy it, and paste it into any AI tool or API call.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const session = await auth();
  const appHref = session?.user ? "/app" : "/login?callbackUrl=/app";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <nav className="flex h-12 items-center gap-4 rounded-2xl border border-border/60 bg-background/70 px-4 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-2 font-bold text-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 shadow-sm shadow-violet-500/30">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              PromptCraft
            </div>

            <div className="flex-1" />

            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <a href="#features" className="px-3 py-1.5 rounded-lg hover:bg-accent hover:text-foreground transition-colors">Features</a>
              <a href="#how" className="px-3 py-1.5 rounded-lg hover:bg-accent hover:text-foreground transition-colors">How it works</a>
            </div>

            <div className="flex items-center gap-2">
              {session?.user ? (
                <Link href="/app" className="flex items-center gap-1 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Open App <ChevronRight className="h-3 w-3" />
                </Link>
              ) : (
                <>
                  <Link href="/login" className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Sign in
                  </Link>
                  <Link href={appHref} className="rounded-lg bg-foreground px-3.5 py-1.5 text-xs font-semibold text-background hover:bg-foreground/90 transition-colors">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pb-16 overflow-hidden">

        {/* Radial glow background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-br from-violet-600/25 via-indigo-500/15 to-transparent blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.15] dark:opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Pill badge */}
        <div className="mt-24 mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
          </span>
          Free to use · No credit card needed
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
          Your prompts,{" "}
          <br className="hidden sm:block" />
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-violet-600 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
              supercharged
            </span>
            {/* Underline accent */}
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
              <path d="M2 9 Q75 2, 150 7 Q225 12, 298 5" stroke="url(#ul)" strokeWidth="3" strokeLinecap="round"/>
              <defs>
                <linearGradient id="ul" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c3aed"/>
                  <stop offset="1" stopColor="#6366f1"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h1>

        <p className="mt-8 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          Turn vague, incomplete ideas into{" "}
          <span className="font-semibold text-foreground">clear, detailed, production-ready prompts</span>{" "}
          — optimized for any AI model in under 2 seconds.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={appHref}
            className="group relative flex items-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-500/30 transition-all hover:shadow-violet-500/50 hover:scale-[1.03]"
          >
            <Sparkles className="h-4 w-4" />
            Start for free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            {/* Shine sweep */}
            <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
          <a
            href="#how"
            className="flex items-center gap-2 rounded-2xl border border-border/80 bg-background/60 px-7 py-3.5 text-sm font-medium text-muted-foreground backdrop-blur hover:border-primary/40 hover:text-foreground transition-all"
          >
            See how it works
          </a>
        </div>

        {/* Model chips */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {MODELS.map(({ label, color }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
              {label}
            </span>
          ))}
        </div>

        {/* Before → After demo card */}
        <div className="mt-16 w-full max-w-3xl">
          <div className="rounded-3xl border border-border/60 bg-card/80 shadow-2xl shadow-black/10 backdrop-blur overflow-hidden">
            {/* Card header tabs */}
            <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3 bg-muted/30">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400/70" />
                <span className="h-3 w-3 rounded-full bg-amber-400/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">prompt-editor.app</span>
              <div className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Enhanced in 1.4s
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
              {/* Before */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                  Before
                </div>
                <div className="rounded-xl bg-muted/50 border border-border/40 p-4 text-sm text-muted-foreground italic leading-relaxed min-h-[90px] flex items-center">
                  &ldquo;write a python script to scrape a website&rdquo;
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400">Clarity: 18 / 100</span>
                  <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400">No format spec</span>
                  <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400">No constraints</span>
                </div>
              </div>

              {/* After */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  After PromptCraft
                </div>
                <div className="rounded-xl bg-violet-500/5 border border-violet-500/20 p-4 text-sm leading-relaxed min-h-[90px]">
                  <span className="font-medium text-foreground">You are a Python expert.</span>
                  <span className="text-muted-foreground"> Write a script using </span>
                  <span className="font-medium text-foreground">BeautifulSoup + requests</span>
                  <span className="text-muted-foreground"> to scrape product names and prices from an e-commerce page. Handle pagination, rate limiting, and export results to CSV. Include error handling and type hints...</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Clarity: 94 / 100</span>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">✓ Role set</span>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">✓ Format defined</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="mt-12 flex flex-col items-center gap-2 text-xs text-muted-foreground/50">
          <span>Scroll to learn more</span>
          <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      <section className="border-y border-border/60 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label} className="space-y-1">
              <div className="text-3xl font-black bg-gradient-to-br from-violet-600 to-indigo-500 bg-clip-text text-transparent tabular-nums">
                {value}
              </div>
              <div className="text-xs text-muted-foreground font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features bento ────────────────────────────────────────────── */}
      <section id="features" className="max-w-5xl mx-auto px-4 py-24">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            A complete prompt engineering toolkit
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Everything you need to go from vague to production-ready — built for developers, writers, and power users.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, span, accent, iconColor, iconBg }) => (
            <div
              key={title}
              className={`group relative ${span} overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5`}
            >
              {/* Gradient wash on hover */}
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative">
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <h3 className="mb-2 font-bold text-sm">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section id="how" className="relative overflow-hidden py-24">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />

        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              How it works
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Four steps to a perfect prompt
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="relative flex flex-col items-center text-center gap-4">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 shadow-lg shadow-violet-500/30 text-white font-black text-lg">
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
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Text side */}
            <div className="p-8 sm:p-12 flex flex-col justify-center gap-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground w-fit">
                <Globe className="h-3.5 w-3.5" />
                Compatible with
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Works with every major AI model
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Switch between cloud and local inference with a single click. Each model gets
                prompts specifically optimized for its strengths.
              </p>
              <Link
                href={appHref}
                className="group w-fit flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-bold text-background hover:bg-foreground/90 transition-all"
              >
                Try it now
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Model cards side */}
            <div className="p-8 sm:p-10 grid grid-cols-2 gap-3 border-t lg:border-t-0 lg:border-l border-border/60 bg-muted/20">
              {[
                { name: "Gemini 2.0 Flash", by: "Google DeepMind", color: "from-blue-500 to-cyan-400", icon: Globe },
                { name: "GPT-4o", by: "OpenAI", color: "from-emerald-500 to-teal-400", icon: BrainCircuit },
                { name: "LLaMA 3.3 70B", by: "via Groq", color: "from-orange-500 to-amber-400", icon: Zap },
                { name: "Ollama Local", by: "On your machine", color: "from-violet-500 to-purple-400", icon: Cpu },
              ].map(({ name, by, color, icon: Icon }) => (
                <div key={name} className="rounded-2xl border border-border/60 bg-card p-4 hover:border-primary/30 transition-colors">
                  <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}>
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

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Deep gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-indigo-900 to-violet-900 dark:from-violet-950 dark:via-indigo-950 dark:to-black" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `
                linear-gradient(white 1px, transparent 1px),
                linear-gradient(90deg, white 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
          {/* Glow orbs */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative px-8 sm:px-14 py-16 sm:py-20 flex flex-col items-center text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur border border-white/20">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-5">
              Better prompts,
              <br />
              better results.
            </h2>
            <p className="text-violet-200/80 text-base sm:text-lg max-w-md mb-10 leading-relaxed">
              Sign in with Google or GitHub. No credit card, no setup.
              Start enhancing in under 30 seconds.
            </p>
            <Link
              href={appHref}
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-sm font-black text-violet-700 shadow-2xl shadow-black/30 hover:bg-violet-50 hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="h-4 w-4" />
              Start for free — it&apos;s instant
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-violet-300/70">
              {["No credit card", "Free forever", "Google & GitHub login", "Open source"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-violet-400" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/60 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-500">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            PromptCraft
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/app" className="hover:text-foreground transition-colors">App</Link>
            <Link href="/profile" className="hover:text-foreground transition-colors">Profile</Link>
            <span>© {new Date().getFullYear()} PromptCraft. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
