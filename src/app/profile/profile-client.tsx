"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppStore } from "@/store/prompt-store";
import {
  Sparkles,
  ArrowLeft,
  TrendingUp,
  FileText,
  Layers,
  BarChart2,
  Clock,
  Tag,
  User,
  Zap,
  GitCompare,
  FlaskConical,
  Globe,
  Wrench,
  Activity,
  Bell,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import type { Session } from "next-auth";
import { cn } from "@/lib/utils";
import { DiffPanel } from "@/components/editor/diff-panel";
import { TestPanel } from "@/components/editor/test-panel";
import { ApiRequestPanel } from "@/components/api-request/api-request-panel";
import { AnalyticsPanel } from "@/components/analytics/analytics-panel";
import { NewsletterModal } from "@/components/newsletter/newsletter-modal";

interface Props {
  user: NonNullable<Session["user"]>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileClient({ user }: Props) {
  const router = useRouter();
  const { entries, loadVersion } = useAppStore();
  const [toolTab, setToolTab] = useState<"compare" | "test" | "api">("compare");
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const handleDeleteAccount = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 5000);
      return;
    }
    setDeleteError(null);
    startDelete(async () => {
      const res = await fetch("/api/db/delete-account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error ?? "Something went wrong. Please try again.");
        setDeleteConfirm(false);
        return;
      }
      // Clear local store then sign out
      const { clearAllData } = await import("@/store/prompt-store").then(m => ({ clearAllData: m.useAppStore.getState().clearAllData }));
      clearAllData();
      const { signOut } = await import("next-auth/react");
      await signOut({ callbackUrl: "/" });
    });
  };

  // ── Compute stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const totalVersions = entries.reduce((s, e) => s + e.versions.length, 0);
    const enhancedEntries = entries.filter((e) => e.versions.length > 1).length;
    const enhancementRate =
      totalEntries > 0 ? Math.round((enhancedEntries / totalEntries) * 100) : 0;

    // Collect all analyses
    const allAnalyses = entries.flatMap((e) =>
      e.versions.flatMap((v) => (v.analysis ? [v.analysis] : []))
    );

    const avgClarity =
      allAnalyses.length > 0
        ? Math.round(
            allAnalyses.reduce((s, a) => s + a.clarityScore, 0) / allAnalyses.length
          )
        : null;

    const avgCompleteness =
      allAnalyses.length > 0
        ? Math.round(
            allAnalyses.reduce((s, a) => s + a.completenessScore, 0) /
              allAnalyses.length
          )
        : null;

    // Per-entry: avg clarity improvement (first vs latest version with analysis)
    let totalImprovement = 0;
    let improvementCount = 0;
    for (const entry of entries) {
      const versionsWithAnalysis = entry.versions.filter((v) => v.analysis);
      if (versionsWithAnalysis.length >= 2) {
        const first = versionsWithAnalysis[0].analysis!.clarityScore;
        const last =
          versionsWithAnalysis[versionsWithAnalysis.length - 1].analysis!
            .clarityScore;
        totalImprovement += last - first;
        improvementCount++;
      }
    }
    const avgImprovement =
      improvementCount > 0
        ? Math.round(totalImprovement / improvementCount)
        : null;

    // Total tokens (sum of estimatedTokens from all analyses)
    const totalTokens = allAnalyses.reduce(
      (s, a) => s + (a.estimatedTokens ?? 0),
      0
    );

    // Prompt type distribution
    const typeCounts: Record<string, number> = {};
    for (const a of allAnalyses) {
      typeCounts[a.promptType] = (typeCounts[a.promptType] ?? 0) + 1;
    }
    const topType =
      Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return {
      totalEntries,
      totalVersions,
      enhancedEntries,
      enhancementRate,
      avgClarity,
      avgCompleteness,
      avgImprovement,
      topType,
      totalAnalyses: allAnalyses.length,
      totalTokens,
    };
  }, [entries]);

  // ── Per-entry data ─────────────────────────────────────────────────────────
  const entryRows = useMemo(
    () =>
      [...entries]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .map((entry) => {
          const versionsWithAnalysis = entry.versions.filter(
            (v) => v.analysis
          );
          const firstScore =
            versionsWithAnalysis[0]?.analysis?.clarityScore ?? null;
          const latestScore =
            versionsWithAnalysis.length > 0
              ? versionsWithAnalysis[versionsWithAnalysis.length - 1].analysis!
                  .clarityScore
              : null;
          const improvement =
            firstScore !== null && latestScore !== null && versionsWithAnalysis.length > 1
              ? latestScore - firstScore
              : null;
          const latestVersion = entry.versions[entry.versions.length - 1];
          return { entry, firstScore, latestScore, improvement, latestVersion };
        }),
    [entries]
  );

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex h-14 items-center px-4 gap-3">
          <button
            onClick={() => router.push("/app")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex-1" />
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold hidden sm:inline">
            PromptCraft
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* ── User card ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-5">
          <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20 bg-muted shrink-0">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "User"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name ?? "Your Profile"}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* ── Stats grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={<FileText className="h-4 w-4" />}
            label="Prompts Saved"
            value={stats.totalEntries.toString()}
            sub="total sessions"
          />
          <StatCard
            icon={<Layers className="h-4 w-4" />}
            label="Versions Created"
            value={stats.totalVersions.toString()}
            sub={`across all prompts`}
          />
          <StatCard
            icon={<Zap className="h-4 w-4" />}
            label="Enhanced"
            value={`${stats.enhancementRate}%`}
            sub={`${stats.enhancedEntries} of ${stats.totalEntries} prompts`}
            highlight={stats.enhancementRate > 0}
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Avg Clarity Gain"
            value={
              stats.avgImprovement !== null
                ? `+${stats.avgImprovement}`
                : "—"
            }
            sub="pts from first to latest"
            highlight={(stats.avgImprovement ?? 0) > 0}
          />
        </div>

        {/* ── Token usage strip ─────────────────────────────────────────── */}
        <div className="rounded-xl border bg-card px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </span>
            Total Tokens Processed
          </div>
          <div className="flex-1" />
          <div className="tabular-nums">
            <span className="text-2xl font-bold text-primary">
              {stats.totalTokens.toLocaleString()}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
              estimated across {stats.totalAnalyses} analys{stats.totalAnalyses === 1 ? "is" : "es"}
            </span>
          </div>
        </div>

        {/* ── Score overview ─────────────────────────────────────────────── */}
        {stats.avgClarity !== null && (
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              Quality Averages
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ScoreBar
                label="Avg Clarity Score"
                score={stats.avgClarity}
              />
              {stats.avgCompleteness !== null && (
                <ScoreBar
                  label="Avg Completeness Score"
                  score={stats.avgCompleteness}
                />
              )}
            </div>
            {stats.topType && (
              <p className="text-xs text-muted-foreground">
                Most common prompt type:{" "}
                <span className="font-medium capitalize text-foreground">
                  {stats.topType}
                </span>
              </p>
            )}
          </div>
        )}

        {/* ── Analytics / Stats section ────────────────────────────────── */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Activity &amp; Stats</h2>
          </div>
          <div className="p-4">
            <AnalyticsPanel />
          </div>
        </div>

        {/* ── Tools section ─────────────────────────────────────────────── */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b">
            <Wrench className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Tools</h2>
            <div className="flex items-center gap-1 ml-2">
              {([
                { id: "compare" as const, label: "Diff", icon: GitCompare },
                { id: "test" as const, label: "Test Prompt", icon: FlaskConical },
                { id: "api" as const, label: "API Request", icon: Globe },
              ]).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setToolTab(id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                    toolTab === id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[480px] overflow-hidden">
            {toolTab === "compare" && <DiffPanel />}
            {toolTab === "test" && <TestPanel />}
            {toolTab === "api" && <ApiRequestPanel />}
          </div>
        </div>

        {/* ── Danger Zone ───────────────────────────────────────────────── */}
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Permanently delete your account and all associated data — prompt history, folders,
            analytics, and logs. This action <span className="font-semibold text-foreground">cannot be undone</span>.
          </p>
          {deleteError && (
            <p className="text-xs text-destructive font-medium">{deleteError}</p>
          )}
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              deleteConfirm
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "border border-destructive/60 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isDeleting
              ? "Deleting…"
              : deleteConfirm
              ? "Confirm — delete my account"
              : "Delete my account"}
          </button>
          {deleteConfirm && !isDeleting && (
            <p className="text-[11px] text-muted-foreground">
              Click again within 5 seconds to confirm. This will sign you out immediately.
            </p>
          )}
        </div>

        {/* ── Newsletter CTA ─────────────────────────────────────────────── */}
        <NewsletterModal open={newsletterOpen} onClose={() => setNewsletterOpen(false)} />
        <div className="rounded-xl border bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 shadow-sm">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">Stay updated</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Subscribe to the newsletter and get notified about new features, AI model updates,
                and prompt engineering tips.
              </p>
            </div>
          </div>
          <button
            onClick={() => setNewsletterOpen(true)}
            className="shrink-0 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Bell className="h-3.5 w-3.5" />
            Subscribe
          </button>
        </div>

        {/* ── Prompt history table ───────────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Prompt History
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              ({entries.length})
            </span>
          </h2>

          {entries.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/30 py-16 text-center">
              <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No prompts yet. Go enhance something!
              </p>
              <button
                onClick={() => router.push("/app")}
                className="mt-4 text-xs font-medium text-primary hover:underline"
              >
                Open Editor →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {entryRows.map(
                ({ entry, firstScore, latestScore, improvement, latestVersion }) => (
                  <div
                    key={entry.id}
                    className="group rounded-xl border bg-card hover:border-primary/40 transition-colors p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {entry.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {entry.versions.length} version
                          {entry.versions.length !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelative(entry.updatedAt)}
                        </span>
                        {entry.tags.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Tag className="h-3 w-3" />
                            {entry.tags.slice(0, 2).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score progression */}
                    <div className="flex items-center gap-3 shrink-0">
                      {latestScore !== null && (
                        <div className="text-center">
                          <div
                            className={cn(
                              "text-lg font-bold tabular-nums",
                              scoreColor(latestScore)
                            )}
                          >
                            {latestScore}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            clarity
                          </div>
                        </div>
                      )}

                      {improvement !== null && (
                        <div
                          className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full",
                            improvement > 0
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                              : improvement < 0
                              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {improvement > 0 ? "+" : ""}
                          {improvement} pts
                        </div>
                      )}

                      {/* Load button */}
                      <button
                        onClick={() => {
                          loadVersion(latestVersion, latestVersion.modelId);
                          router.push("/app");
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-primary hover:underline whitespace-nowrap"
                      >
                        Load →
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-1">
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium",
          highlight ? "text-primary" : "text-muted-foreground"
        )}
      >
        {icon}
        {label}
      </div>
      <div
        className={cn(
          "text-2xl font-bold tabular-nums",
          highlight && "text-primary"
        )}
      >
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-semibold tabular-nums", scoreColor(score))}>
          {score} / 100
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", scoreBg(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
