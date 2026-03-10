"use client";

import { useAppStore } from "@/store/prompt-store";
import { TrendingUp, Zap, BrainCircuit, Cpu, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function last14Days(): string[] {
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

const MODEL_COLORS: Record<string, string> = {
  gemini: "bg-blue-500",
  groq: "bg-orange-500",
  openai: "bg-emerald-500",
  local: "bg-violet-500",
};

const MODEL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  gemini: ({ className }: { className?: string }) => (
    <span className={cn("text-[10px] font-bold text-blue-600 dark:text-blue-400", className)}>G</span>
  ),
  groq: Zap,
  openai: BrainCircuit,
  local: Cpu,
};

// ─── SVG Mini Bar Chart ───────────────────────────────────────────────────────

function BarChart({
  values,
  labels,
  height = 56,
}: {
  values: number[];
  labels: string[];
  height?: number;
}) {
  const max = Math.max(...values, 1);
  const barW = 10;
  const gap = 3;
  const totalW = values.length * (barW + gap) - gap;

  return (
    <div className="flex flex-col gap-0.5">
      <svg
        width="100%"
        viewBox={`0 0 ${totalW} ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {values.map((v, i) => {
          const barH = Math.max((v / max) * height, v > 0 ? 2 : 0);
          const x = i * (barW + gap);
          const y = height - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={2}
                className={cn(
                  "transition-all",
                  v > 0
                    ? "fill-violet-500 dark:fill-violet-400"
                    : "fill-muted dark:fill-muted"
                )}
                opacity={v > 0 ? 0.85 : 0.2}
              />
              {v > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 2}
                  textAnchor="middle"
                  fontSize={6}
                  className="fill-muted-foreground"
                >
                  {v}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {/* X axis labels — show every 3rd to avoid clutter */}
      <div
        style={{ display: "grid", gridTemplateColumns: `repeat(${values.length}, 1fr)` }}
        className="text-center"
      >
        {labels.map((l, i) => (
          <span
            key={i}
            className={cn(
              "text-[8px] text-muted-foreground truncate",
              i % 3 !== 0 && "invisible"
            )}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Model usage horizontal bar ───────────────────────────────────────────────

function ModelBar({
  model,
  count,
  total,
}: {
  model: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const colorClass = MODEL_COLORS[model] ?? "bg-slate-500";
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-12 text-right capitalize text-muted-foreground shrink-0">
        {model}
      </span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-muted-foreground font-mono shrink-0">
        {count}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AnalyticsPanel() {
  const analyticsData = useAppStore((s) => s.analyticsData);
  const entries = useAppStore((s) => s.entries);

  const days = last14Days();
  const dataByDate = Object.fromEntries(analyticsData.map((d) => [d.date, d]));

  const barValues = days.map((d) => dataByDate[d]?.enhancements ?? 0);
  const barLabels = days.map((d) => formatDate(d));

  const totalEnhancements = analyticsData.reduce((s, d) => s + d.enhancements, 0);
  const totalSaved = entries.length;

  // Aggregate model counts
  const modelCounts: Record<string, number> = {};
  for (const d of analyticsData) {
    for (const [model, cnt] of Object.entries(d.modelCounts)) {
      modelCounts[model] = (modelCounts[model] ?? 0) + cnt;
    }
  }
  const topModel = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0];
  const totalModelUsage = Object.values(modelCounts).reduce((a, b) => a + b, 0);

  // Average clarity score across all days
  const scoredDays = analyticsData.filter((d) => d.scoreCount > 0);
  const avgScore =
    scoredDays.length > 0
      ? Math.round(
          scoredDays.reduce((s, d) => s + d.totalScore / d.scoreCount, 0) /
            scoredDays.length
        )
      : null;

  const isEmpty = totalEnhancements === 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-6">
          <BarChart3 className="h-10 w-10 text-muted-foreground/25" />
          <p className="text-sm text-muted-foreground">
            No data yet. Start enhancing prompts to see your usage analytics.
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border bg-card px-3 py-2 text-center">
              <p className="text-[18px] font-bold tabular-nums text-violet-600 dark:text-violet-400">
                {totalEnhancements}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Enhancements
              </p>
            </div>
            <div className="rounded-lg border bg-card px-3 py-2 text-center">
              <p className="text-[18px] font-bold tabular-nums text-blue-600 dark:text-blue-400">
                {totalSaved}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Saved Prompts
              </p>
            </div>
            <div className="rounded-lg border bg-card px-3 py-2 text-center">
              <p className="text-[18px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {avgScore != null ? `${avgScore}%` : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Avg Clarity
              </p>
            </div>
          </div>

          {/* Enhancements over time */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">Enhancements (14 days)</span>
            </div>
            <BarChart values={barValues} labels={barLabels} />
          </div>

          {/* Model usage */}
          {Object.keys(modelCounts).length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 justify-between">
                <span className="text-xs font-medium">Model Usage</span>
                {topModel && (
                  <span className="text-[10px] text-muted-foreground">
                    Top:{" "}
                    <span className="capitalize font-medium text-foreground">
                      {topModel[0]}
                    </span>
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {Object.entries(modelCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([model, count]) => (
                    <ModelBar
                      key={model}
                      model={model}
                      count={count}
                      total={totalModelUsage}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Daily breakdown — last 7 days */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium">Recent Days</span>
            <div className="space-y-1">
              {days
                .slice(-7)
                .reverse()
                .map((d) => {
                  const entry = dataByDate[d];
                  const count = entry?.enhancements ?? 0;
                  return (
                    <div key={d} className="flex items-center gap-2 text-[11px]">
                      <span className="w-16 text-muted-foreground shrink-0">
                        {formatDate(d)}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-violet-500/70 dark:bg-violet-400/70 transition-all duration-500"
                          style={{
                            width: `${Math.max(...barValues) > 0 ? (count / Math.max(...barValues)) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="w-4 text-right text-muted-foreground font-mono shrink-0">
                        {count > 0 ? count : "—"}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
