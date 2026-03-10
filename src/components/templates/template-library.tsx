"use client";

import { useState } from "react";
import {
  PROMPT_TEMPLATES,
  TEMPLATE_CATEGORY_LABELS,
} from "@/data/templates";
import { useAppStore } from "@/store/prompt-store";
import { cn } from "@/lib/utils";
import { LayoutTemplate, ArrowRight, Search } from "lucide-react";
import type { PromptTemplate } from "@/types";

const CATEGORY_COLORS: Record<PromptTemplate["category"], string> = {
  "content-writing": "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300",
  coding: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  "data-analysis": "bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300",
  "image-generation": "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
  "customer-support": "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300",
  research: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300",
  education: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300",
  general: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const ALL_CATEGORIES = [
  "all",
  ...Array.from(new Set(PROMPT_TEMPLATES.map((t) => t.category))),
] as const;

export function TemplateLibrary() {
  const { setCurrentPrompt, setRightPanel } = useAppStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = PROMPT_TEMPLATES.filter((t) => {
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const loadTemplate = (template: PromptTemplate) => {
    // If template has required variables, just load the raw prompt
    // (variable substitution is a future feature)
    setCurrentPrompt(template.prompt);
    setRightPanel("analysis");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1 flex-wrap">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent border-transparent"
              )}
            >
              {cat === "all"
                ? "All"
                : TEMPLATE_CATEGORY_LABELS[cat as PromptTemplate["category"]]}
            </button>
          ))}
        </div>
      </div>

      {/* Template list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
            <LayoutTemplate className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No templates match your search.</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((template) => (
              <div
                key={template.id}
                className="group flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                        CATEGORY_COLORS[template.category]
                      )}
                    >
                      {TEMPLATE_CATEGORY_LABELS[template.category]}
                    </span>
                  </div>
                  <p className="text-xs font-semibold">{template.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {template.description}
                  </p>
                  {template.variables.length > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      Variables: {template.variables.map((v) => `{{${v.key}}}`).join(", ")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => loadTemplate(template)}
                  className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline shrink-0 mt-1"
                >
                  Use <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
