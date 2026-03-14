"use client";

import { Sparkles, Moon, Sun, KeyRound, Cpu, Cloud, LogOut, User, Zap, BrainCircuit, Shield, Trash2, Bell, Wind } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useAppStore } from "@/store/prompt-store";
import { ApiKeyModal } from "@/components/auth/api-key-modal";
import { NewsletterModal } from "@/components/newsletter/newsletter-modal";
import { GroqKeyModal } from "@/components/auth/groq-key-modal";
import { OllamaSettingsModal } from "@/components/auth/ollama-settings-modal";
import { OpenAIKeyModal } from "@/components/auth/openai-key-modal";
import { MistralKeyModal } from "@/components/auth/mistral-key-modal";
import { FreeTierBadge } from "@/components/ui/free-tier-badge";

import { signOutAction } from "@/app/login/sign-out-action";

export function Navbar() {
    const { theme, setTheme } = useTheme();
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);
    const [keyModalOpen, setKeyModalOpen] = useState(false);
    const [groqModalOpen, setGroqModalOpen] = useState(false);
    const [ollamaModalOpen, setOllamaModalOpen] = useState(false);
    const [openaiModalOpen, setOpenaiModalOpen] = useState(false);
    const [mistralModalOpen, setMistralModalOpen] = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);
    const [newsletterOpen, setNewsletterOpen] = useState(false);
    const [signingOut, startSignOut] = useTransition();
    const [avatarError, setAvatarError] = useState(false);
    const {
        clearSession,
        geminiApiKey,
        groqApiKey,
        openaiApiKey,
        mistralApiKey,
        aiMode,
        setAiMode,
        ollamaModel,
        privacyMode,
        setPrivacyMode,
        clearAllData,
    } = useAppStore();

    useEffect(() => setMounted(true), []);

    const handleClearAll = () => {
        if (!confirmClear) {
            setConfirmClear(true);
            // Auto-reset confirmation after 4 s
            setTimeout(() => setConfirmClear(false), 4000);
            return;
        }
        clearAllData();
        setConfirmClear(false);
    };

    return (
        <>
            <ApiKeyModal open={keyModalOpen} onClose={() => setKeyModalOpen(false)} />
            <GroqKeyModal open={groqModalOpen} onClose={() => setGroqModalOpen(false)} />
            <OllamaSettingsModal open={ollamaModalOpen} onClose={() => setOllamaModalOpen(false)} />
            <OpenAIKeyModal open={openaiModalOpen} onClose={() => setOpenaiModalOpen(false)} />
            <MistralKeyModal open={mistralModalOpen} onClose={() => setMistralModalOpen(false)} />
            <NewsletterModal open={newsletterOpen} onClose={() => setNewsletterOpen(false)} />

            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative">
                {/* Gradient accent line */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 opacity-70" />

                {/* ── Primary row ──────────────────────────────────────── */}
                <div className="flex h-14 items-center px-4 gap-3">
                    {/* Logo */}
                    <button
                        onClick={clearSession}
                        className="flex items-center gap-2 font-semibold text-sm hover:opacity-80 transition-opacity shrink-0"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 shadow-sm">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <span className="hidden sm:inline bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent font-bold">PromptCraft</span>
                    </button>

                    <div className="flex-1" />

                    {/* ── AI provider section (desktop only) ──────────── */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="flex items-center rounded-lg border bg-muted/40 p-0.5 gap-0.5">
                            <button onClick={() => { setAiMode("gemini"); if (!geminiApiKey) setKeyModalOpen(true); }} title="Gemini — Google AI Studio"
                                className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${aiMode === "gemini" ? "bg-background shadow-sm text-primary ring-1 ring-primary/25" : "text-muted-foreground hover:text-foreground"}`}>
                                <Cloud className="h-3.5 w-3.5" /><span>Gemini</span>
                                {geminiApiKey && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                            </button>
                            <button onClick={() => { setAiMode("groq"); if (!groqApiKey) setGroqModalOpen(true); }} title="Groq — fast free LLaMA inference"
                                className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${aiMode === "groq" ? "bg-background shadow-sm text-orange-600 dark:text-orange-400 ring-1 ring-orange-500/25" : "text-muted-foreground hover:text-foreground"}`}>
                                <Zap className="h-3.5 w-3.5" /><span>Groq</span>
                                {groqApiKey && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                            </button>
                            <button onClick={() => { setAiMode("openai"); if (!openaiApiKey) setOpenaiModalOpen(true); }} title="OpenAI — GPT-4o, GPT-4"
                                className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${aiMode === "openai" ? "bg-background shadow-sm text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/25" : "text-muted-foreground hover:text-foreground"}`}>
                                <BrainCircuit className="h-3.5 w-3.5" /><span>OpenAI</span>
                                {openaiApiKey && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                            </button>
                            <button onClick={() => setAiMode("mistral")} title="Mistral — free tier available"
                                className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${aiMode === "mistral" ? "bg-background shadow-sm text-[#ff7000] ring-1 ring-[#ff7000]/25" : "text-muted-foreground hover:text-foreground"}`}>
                                <Wind className="h-3.5 w-3.5" /><span>Mistral</span>
                                {mistralApiKey && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                            </button>
                            <button onClick={() => { setAiMode("local"); setOllamaModalOpen(true); }} title="Local — runs via Ollama on your machine"
                                className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${aiMode === "local" ? "bg-background shadow-sm text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/25" : "text-muted-foreground hover:text-foreground"}`}>
                                <Cpu className="h-3.5 w-3.5" /><span>Local</span>
                            </button>
                        </div>
                        {aiMode === "gemini" && geminiApiKey && (
                            <button onClick={() => setKeyModalOpen(true)} title="Manage Gemini API key"
                                className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors">
                                <KeyRound className="h-3.5 w-3.5" /><span>Key ✓</span>
                            </button>
                        )}
                        {aiMode === "groq" && groqApiKey && (
                            <button onClick={() => setGroqModalOpen(true)} title="Manage Groq API key"
                                className="flex items-center gap-1.5 rounded-md border border-orange-300 dark:border-orange-700 px-2.5 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                                <KeyRound className="h-3.5 w-3.5" /><span>Key ✓</span>
                            </button>
                        )}
                        {aiMode === "openai" && openaiApiKey && (
                            <button onClick={() => setOpenaiModalOpen(true)} title="Manage OpenAI API key"
                                className="flex items-center gap-1.5 rounded-md border border-emerald-300 dark:border-emerald-700 px-2.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                                <KeyRound className="h-3.5 w-3.5" /><span>Key ✓</span>
                            </button>
                        )}
                        {aiMode === "mistral" && mistralApiKey && (
                            <button onClick={() => setMistralModalOpen(true)} title="Manage Mistral API key"
                                className="flex items-center gap-1.5 rounded-md border border-[#ff7000]/40 px-2.5 py-1.5 text-xs font-medium text-[#ff7000] hover:bg-[#ff7000]/10 transition-colors">
                                <KeyRound className="h-3.5 w-3.5" /><span>Key ✓</span>
                            </button>
                        )}
                        {aiMode === "local" && (
                            <button onClick={() => setOllamaModalOpen(true)} title="Ollama settings"
                                className="flex items-center gap-1.5 rounded-md border border-violet-300 dark:border-violet-700 px-2.5 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                                <Cpu className="h-3.5 w-3.5" /><span className="truncate max-w-[80px]">{ollamaModel || "Configure"}</span>
                            </button>
                        )}
                        <FreeTierBadge />
                    </div>

                    <div className="hidden md:block h-5 w-px bg-border mx-1" />

                    {/* ── Utility icons (desktop only) ────────────────── */}
                    <div className="hidden md:flex items-center gap-0.5">
                        <button onClick={() => setNewsletterOpen(true)} title="Newsletter"
                            className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" aria-label="Newsletter">
                            <Bell className="h-4 w-4" />
                        </button>
                        <button onClick={() => setPrivacyMode(!privacyMode)} title={privacyMode ? "Privacy mode ON — history not saved" : "Privacy mode OFF"}
                            className={`rounded-md p-2 transition-colors ${privacyMode ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                            aria-label="Toggle privacy mode">
                            <Shield className="h-4 w-4" />
                        </button>
                        <button onClick={handleClearAll} title={confirmClear ? "Click again to confirm — erases everything!" : "Clear all data"}
                            className={`rounded-md p-2 transition-colors ${confirmClear ? "text-white bg-destructive hover:bg-destructive/90" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"}`}
                            aria-label="Clear all data">
                            <Trash2 className="h-4 w-4" />
                        </button>
                        {mounted && (
                            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" aria-label="Toggle theme">
                                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>
                        )}
                    </div>

                    {/* Theme toggle — mobile only, stays in primary row */}
                    {mounted && (
                        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="md:hidden rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" aria-label="Toggle theme">
                            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                    )}

                    {/* ── User ────────────────────────────────────────────── */}
                    {session?.user && (
                        <>
                            <div className="h-5 w-px bg-border" />
                            <div className="flex items-center gap-1.5">
                                <Link href="/profile"
                                    className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-accent transition-colors" title="View profile">
                                    <div className="relative h-7 w-7 rounded-full overflow-hidden border bg-muted shrink-0">
                                        {session.user.image && !avatarError ? (
                                            <Image src={session.user.image} alt={session.user.name ?? "User"} fill className="object-cover" onError={() => setAvatarError(true)} />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="hidden lg:inline text-xs font-medium max-w-[100px] truncate">
                                        {session.user.name?.split(" ")[0] ?? "User"}
                                    </span>
                                </Link>
                                <button onClick={() => startSignOut(() => signOutAction())} disabled={signingOut}
                                    className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50" title="Sign out">
                                    <LogOut className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* ── Mobile toolbar row (scrollable, hidden on desktop) ── */}
                <div className="md:hidden border-t overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 w-max">
                        {/* Mode toggle pill */}
                        <div className="flex items-center rounded-lg border bg-muted/40 p-0.5 gap-0.5">
                            <button onClick={() => { setAiMode("gemini"); if (!geminiApiKey) setKeyModalOpen(true); }} title="Gemini"
                                className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${aiMode === "gemini" ? "bg-background shadow-sm text-primary ring-1 ring-primary/25" : "text-muted-foreground hover:text-foreground"}`}>
                                <Cloud className="h-3.5 w-3.5" /><span>Gemini</span>
                                {geminiApiKey && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                            </button>
                            <button onClick={() => { setAiMode("groq"); if (!groqApiKey) setGroqModalOpen(true); }} title="Groq"
                                className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${aiMode === "groq" ? "bg-background shadow-sm text-orange-600 dark:text-orange-400 ring-1 ring-orange-500/25" : "text-muted-foreground hover:text-foreground"}`}>
                                <Zap className="h-3.5 w-3.5" /><span>Groq</span>
                                {groqApiKey && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                            </button>
                            <button onClick={() => { setAiMode("openai"); if (!openaiApiKey) setOpenaiModalOpen(true); }} title="OpenAI"
                                className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${aiMode === "openai" ? "bg-background shadow-sm text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/25" : "text-muted-foreground hover:text-foreground"}`}>
                                <BrainCircuit className="h-3.5 w-3.5" /><span>OpenAI</span>
                                {openaiApiKey && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                            </button>
                            <button onClick={() => setAiMode("mistral")} title="Mistral"
                                className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${aiMode === "mistral" ? "bg-background shadow-sm text-[#ff7000] ring-1 ring-[#ff7000]/25" : "text-muted-foreground hover:text-foreground"}`}>
                                <Wind className="h-3.5 w-3.5" /><span>Mistral</span>
                                {mistralApiKey && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                            </button>
                            <button onClick={() => { setAiMode("local"); setOllamaModalOpen(true); }} title="Local / Ollama"
                                className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${aiMode === "local" ? "bg-background shadow-sm text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/25" : "text-muted-foreground hover:text-foreground"}`}>
                                <Cpu className="h-3.5 w-3.5" /><span>Local</span>
                            </button>
                        </div>

                        {/* Key / settings button */}
                        {aiMode === "gemini" && geminiApiKey && (
                            <button onClick={() => setKeyModalOpen(true)} title="Manage Gemini API key"
                                className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors shrink-0">
                                <KeyRound className="h-3.5 w-3.5" /><span>Key ✓</span>
                            </button>
                        )}
                        {aiMode === "groq" && groqApiKey && (
                            <button onClick={() => setGroqModalOpen(true)} title="Manage Groq API key"
                                className="flex items-center gap-1.5 rounded-md border border-orange-300 dark:border-orange-700 px-2.5 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors shrink-0">
                                <KeyRound className="h-3.5 w-3.5" /><span>Key ✓</span>
                            </button>
                        )}
                        {aiMode === "openai" && openaiApiKey && (
                            <button onClick={() => setOpenaiModalOpen(true)} title="Manage OpenAI API key"
                                className="flex items-center gap-1.5 rounded-md border border-emerald-300 dark:border-emerald-700 px-2.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors shrink-0">
                                <KeyRound className="h-3.5 w-3.5" /><span>Key ✓</span>
                            </button>
                        )}
                        {aiMode === "mistral" && mistralApiKey && (
                            <button onClick={() => setMistralModalOpen(true)} title="Manage Mistral API key"
                                className="flex items-center gap-1.5 rounded-md border border-[#ff7000]/40 px-2.5 py-1.5 text-xs font-medium text-[#ff7000] hover:bg-[#ff7000]/10 transition-colors shrink-0">
                                <KeyRound className="h-3.5 w-3.5" /><span>Key ✓</span>
                            </button>
                        )}
                        {aiMode === "local" && (
                            <button onClick={() => setOllamaModalOpen(true)} title="Ollama settings"
                                className="flex items-center gap-1.5 rounded-md border border-violet-300 dark:border-violet-700 px-2.5 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors shrink-0">
                                <Cpu className="h-3.5 w-3.5" /><span className="truncate max-w-[80px]">{ollamaModel || "Configure"}</span>
                            </button>
                        )}

                        <FreeTierBadge />

                        <div className="h-5 w-px bg-border mx-0.5 shrink-0" />

                        {/* Utility icons */}
                        <button onClick={() => setNewsletterOpen(true)} title="Newsletter"
                            className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0" aria-label="Newsletter">
                            <Bell className="h-4 w-4" />
                        </button>
                        <button onClick={() => setPrivacyMode(!privacyMode)} title={privacyMode ? "Privacy mode ON" : "Privacy mode OFF"}
                            className={`rounded-md p-2 transition-colors shrink-0 ${privacyMode ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                            aria-label="Toggle privacy mode">
                            <Shield className="h-4 w-4" />
                        </button>
                        <button onClick={handleClearAll} title={confirmClear ? "Click again to confirm!" : "Clear all data"}
                            className={`rounded-md p-2 transition-colors shrink-0 ${confirmClear ? "text-white bg-destructive" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"}`}
                            aria-label="Clear all data">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}
