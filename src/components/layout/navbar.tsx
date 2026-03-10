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

            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center px-4 gap-3">
                    {/* Logo */}
                    <button
                        onClick={clearSession}
                        className="flex items-center gap-2 font-semibold text-sm hover:opacity-80 transition-opacity shrink-0"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 shadow-sm">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <span className="hidden sm:inline">PromptCraft</span>
                    </button>

                    <div className="flex-1" />

                    {/* ── AI provider section ─────────────────────────────── */}
                    <div className="flex items-center gap-2">

                        {/* Mode toggle pill */}
                        <div className="flex items-center rounded-lg border bg-muted/40 p-0.5 gap-0.5">
                            {/* Gemini */}
                            <button
                                onClick={() => { setAiMode("gemini"); if (!geminiApiKey) setKeyModalOpen(true); }}
                                title="Gemini — Google AI Studio"
                                className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${aiMode === "gemini"
                                    ? "bg-background shadow-sm text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Cloud className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Gemini</span>
                                {geminiApiKey && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                            </button>

                            {/* Groq */}
                            <button
                                onClick={() => { setAiMode("groq"); if (!groqApiKey) setGroqModalOpen(true); }}
                                title="Groq — fast free LLaMA inference"
                                className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${aiMode === "groq"
                                    ? "bg-background shadow-sm text-orange-600 dark:text-orange-400"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Zap className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Groq</span>
                                {groqApiKey && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                            </button>

                            {/* OpenAI */}
                            <button
                                onClick={() => { setAiMode("openai"); if (!openaiApiKey) setOpenaiModalOpen(true); }}
                                title="OpenAI — GPT-4o, GPT-4"
                                className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${aiMode === "openai"
                                    ? "bg-background shadow-sm text-emerald-600 dark:text-emerald-400"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <BrainCircuit className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">OpenAI</span>
                                {openaiApiKey && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                            </button>

                            {/* Mistral */}
                            <button
                                onClick={() => setAiMode("mistral")}
                                title="Mistral — free tier available, no key required"
                                className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${aiMode === "mistral"
                                    ? "bg-background shadow-sm text-[#ff7000]"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Wind className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Mistral</span>
                                {mistralApiKey && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                            </button>

                            {/* Local / Ollama */}
                            <button
                                onClick={() => { setAiMode("local"); setOllamaModalOpen(true); }}
                                title="Local — runs via Ollama on your machine"
                                className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${aiMode === "local"
                                    ? "bg-background shadow-sm text-violet-600 dark:text-violet-400"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Cpu className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Local</span>
                            </button>
                        </div>

                        {/* Key / settings button for active mode — only shown when key is already saved */}
                        {aiMode === "gemini" && geminiApiKey && (
                            <button onClick={() => setKeyModalOpen(true)} title="Manage Gemini API key"
                                className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors">
                                <KeyRound className="h-3.5 w-3.5" /><span className="hidden sm:inline">Key ✓</span>
                            </button>
                        )}
                        {aiMode === "groq" && groqApiKey && (
                            <button onClick={() => setGroqModalOpen(true)} title="Manage Groq API key"
                                className="flex items-center gap-1.5 rounded-md border border-orange-300 dark:border-orange-700 px-2.5 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                                <KeyRound className="h-3.5 w-3.5" /><span className="hidden sm:inline">Key ✓</span>
                            </button>
                        )}
                        {aiMode === "openai" && openaiApiKey && (
                            <button onClick={() => setOpenaiModalOpen(true)} title="Manage OpenAI API key"
                                className="flex items-center gap-1.5 rounded-md border border-emerald-300 dark:border-emerald-700 px-2.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                                <KeyRound className="h-3.5 w-3.5" /><span className="hidden sm:inline">Key ✓</span>
                            </button>
                        )}
                        {aiMode === "mistral" && mistralApiKey && (
                            <button onClick={() => setMistralModalOpen(true)} title="Manage Mistral API key"
                                className="flex items-center gap-1.5 rounded-md border border-[#ff7000]/40 px-2.5 py-1.5 text-xs font-medium text-[#ff7000] hover:bg-[#ff7000]/10 transition-colors">
                                <KeyRound className="h-3.5 w-3.5" /><span className="hidden sm:inline">Key ✓</span>
                            </button>
                        )}
                        {aiMode === "local" && (
                            <button onClick={() => setOllamaModalOpen(true)} title="Ollama settings"
                                className="flex items-center gap-1.5 rounded-md border border-violet-300 dark:border-violet-700 px-2.5 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                                <Cpu className="h-3.5 w-3.5" /><span className="hidden sm:inline truncate max-w-[80px]">{ollamaModel || "Configure"}</span>
                            </button>
                        )}

                        {/* Free-tier quota pill — hidden when a personal key is active */}
                        <FreeTierBadge />
                    </div>

                    <div className="h-5 w-px bg-border mx-1" />

                    {/* ── Utility icons ───────────────────────────────────── */}
                    <div className="flex items-center gap-0.5">
                        {/* Newsletter */}
                        <button
                            onClick={() => setNewsletterOpen(true)}
                            title="Newsletter"
                            className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            aria-label="Newsletter"
                        >
                            <Bell className="h-4 w-4" />
                        </button>

                        {/* Privacy mode */}
                        <button
                            onClick={() => setPrivacyMode(!privacyMode)}
                            title={privacyMode ? "Privacy mode ON — history not saved" : "Privacy mode OFF"}
                            className={`rounded-md p-2 transition-colors ${privacyMode
                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            }`}
                            aria-label="Toggle privacy mode"
                        >
                            <Shield className="h-4 w-4" />
                        </button>

                        {/* Clear data */}
                        <button
                            onClick={handleClearAll}
                            title={confirmClear ? "Click again to confirm — erases everything!" : "Clear all data"}
                            className={`rounded-md p-2 transition-colors ${confirmClear
                                ? "text-white bg-destructive hover:bg-destructive/90"
                                : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            }`}
                            aria-label="Clear all data"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>

                        {/* Theme */}
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>
                        )}
                    </div>

                    {/* ── User ────────────────────────────────────────────── */}
                    {session?.user && (
                        <>
                            <div className="h-5 w-px bg-border" />
                            <div className="flex items-center gap-1.5">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-accent transition-colors"
                                    title="View profile"
                                >
                                    <div className="relative h-7 w-7 rounded-full overflow-hidden border bg-muted shrink-0">
                                        {session.user.image && !avatarError ? (
                                            <Image
                                                src={session.user.image}
                                                alt={session.user.name ?? "User"}
                                                fill
                                                className="object-cover"
                                                onError={() => setAvatarError(true)}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="hidden md:inline text-xs font-medium max-w-[100px] truncate">
                                        {session.user.name?.split(" ")[0] ?? "User"}
                                    </span>
                                </Link>
                                <button
                                    onClick={() => startSignOut(() => signOutAction())}
                                    disabled={signingOut}
                                    className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                                    title="Sign out"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </header>
        </>
    );
}
