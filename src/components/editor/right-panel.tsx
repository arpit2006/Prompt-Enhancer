"use client";

import { useAppStore } from "@/store/prompt-store";
import { AnalysisPanel } from "@/components/editor/analysis-panel";
import { SuggestionPanel } from "@/components/editor/suggestion-panel";
import { PromptHistory } from "@/components/history/prompt-history";
import { TemplateLibrary } from "@/components/templates/template-library";
import { ComparePanel } from "@/components/editor/compare-panel";
import { cn } from "@/lib/utils";
import {
    BarChart2,
    Sparkles,
    History,
    LayoutTemplate,
    GitCompare,
} from "lucide-react";

const TABS = [
    { id: "analysis" as const,    label: "Analysis",  icon: BarChart2     },
    { id: "suggestions" as const, label: "Suggest",   icon: Sparkles      },
    { id: "compare" as const,     label: "Compare",   icon: GitCompare    },
    { id: "history" as const,     label: "History",   icon: History       },
    { id: "templates" as const,   label: "Templates", icon: LayoutTemplate },
];

export function RightPanel() {
    const { rightPanel, setRightPanel, suggestions, analysis } = useAppStore();

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b bg-background/80 backdrop-blur px-2 pt-1 pb-0 shrink-0">
                {TABS.map(({ id, label, icon: Icon }) => {
                    const isActive = rightPanel === id;

                    const badge =
                        id === "suggestions" && suggestions.length > 0
                            ? suggestions.length
                            : id === "analysis" && analysis?.issues.length
                                ? analysis.issues.length
                                : null;

                    return (
                        <button
                            key={id}
                            onClick={() => setRightPanel(id)}
                            className={cn(
                                "relative flex flex-1 flex-col items-center gap-0.5 px-1 pb-3 pt-2 text-[10px] font-medium transition-all duration-200",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className="relative">
                                <Icon className={cn("h-3.5 w-3.5 transition-transform duration-200", isActive && "scale-110")} />
                                {badge !== null && (
                                    <span className="absolute -top-1.5 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground ring-1 ring-background">
                                        {badge > 9 ? '9+' : badge}
                                    </span>
                                )}
                            </div>
                            <span className="hidden sm:inline tracking-wide">{label}</span>
                            {isActive && (
                                <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Panel content */}
            <div className="flex-1 min-h-0 flex flex-col bg-background">
                {rightPanel === "analysis"    && <AnalysisPanel />}
                {rightPanel === "suggestions" && <SuggestionPanel />}
                {rightPanel === "compare"     && <ComparePanel />}
                {rightPanel === "history"     && <PromptHistory />}
                {rightPanel === "templates"   && <TemplateLibrary />}
            </div>
        </div>
    );
}
