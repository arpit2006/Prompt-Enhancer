import type {
  AnalysisCategoryId,
  AnalysisCategoryScore,
  EnhanceRequest,
  EnhanceResponse,
  PromptAnalysis,
  PromptSuggestion,
} from "@/types";

export const ANALYSIS_CATEGORY_DEFINITIONS: Array<{ id: AnalysisCategoryId; label: string }> = [
  { id: "role-clarity", label: "Role Clarity" },
  { id: "objective-clarity", label: "Objective Clarity" },
  { id: "context-completeness", label: "Context Completeness" },
  { id: "task-breakdown", label: "Task Breakdown" },
  { id: "technical-constraints", label: "Technical Constraints" },
  { id: "design-requirements", label: "Design Requirements" },
  { id: "accessibility-considerations", label: "Accessibility" },
  { id: "seo-considerations", label: "SEO" },
  { id: "performance-constraints", label: "Performance" },
  { id: "output-format-clarity", label: "Output Structure" },
  { id: "reusability-template-support", label: "Reusability" },
];

const VALID_PROMPT_TYPES = new Set<PromptAnalysis["promptType"]>([
  "instruction",
  "question",
  "creative",
  "code",
  "image",
  "conversational",
]);

const VALID_LENGTH_ASSESSMENTS = new Set<PromptAnalysis["lengthAssessment"]>([
  "too-short",
  "optimal",
  "too-long",
]);

const VALID_ISSUE_TYPES = new Set<PromptAnalysis["issues"][number]["type"]>([
  "ambiguity",
  "missing-context",
  "vague-language",
  "no-format-spec",
  "no-tone-spec",
]);

const VALID_ISSUE_SEVERITIES = new Set<PromptAnalysis["issues"][number]["severity"]>([
  "low",
  "medium",
  "high",
]);

const VALID_SUGGESTION_TYPES = new Set<PromptSuggestion["type"]>([
  "full-rewrite",
  "addition",
  "replacement",
  "structural",
]);

const DEFAULT_SUGGESTION_TYPES: PromptSuggestion["type"][] = [
  "full-rewrite",
  "structural",
  "addition",
];

function clampScore(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function clampTenScore(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  return Math.max(0, Math.min(10, Math.round(value)));
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function estimateTokens(words: number): number {
  return Math.max(1, Math.round(words * 1.33));
}

function defaultLengthAssessment(words: number): PromptAnalysis["lengthAssessment"] {
  if (words < 12) return "too-short";
  if (words > 250) return "too-long";
  return "optimal";
}

function defaultPromptType(prompt: string): PromptAnalysis["promptType"] {
  const lower = prompt.toLowerCase();
  if (/(code|function|typescript|javascript|python|debug|refactor|sql)/.test(lower)) {
    return "code";
  }
  if (/(image|photo|illustration|render|cinematic|midjourney|stable diffusion)/.test(lower)) {
    return "image";
  }
  if (/(story|poem|creative|fiction|character|scene)/.test(lower)) {
    return "creative";
  }
  if (prompt.includes("?") && lower.split("?").length <= 3) {
    return "question";
  }
  return "instruction";
}

function normalizeIssue(raw: unknown): PromptAnalysis["issues"][number] | null {
  if (!raw || typeof raw !== "object") return null;

  const issue = raw as Record<string, unknown>;
  const type = VALID_ISSUE_TYPES.has(issue.type as PromptAnalysis["issues"][number]["type"])
    ? (issue.type as PromptAnalysis["issues"][number]["type"])
    : "vague-language";
  const severity = VALID_ISSUE_SEVERITIES.has(issue.severity as PromptAnalysis["issues"][number]["severity"])
    ? (issue.severity as PromptAnalysis["issues"][number]["severity"])
    : "medium";
  const message = typeof issue.message === "string" ? issue.message.trim() : "Prompt can be clearer and more specific.";
  const suggestion = typeof issue.suggestion === "string" ? issue.suggestion.trim() : "Add explicit context, constraints, and output requirements.";

  return { type, severity, message, suggestion };
}

function normalizeSuggestion(raw: unknown, index: number): PromptSuggestion {
  const suggestion = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const type = VALID_SUGGESTION_TYPES.has(suggestion.type as PromptSuggestion["type"])
    ? (suggestion.type as PromptSuggestion["type"])
    : DEFAULT_SUGGESTION_TYPES[index] ?? "addition";
  const title = typeof suggestion.title === "string" && suggestion.title.trim()
    ? suggestion.title.trim()
    : type === "full-rewrite"
    ? "High-Clarity Rewrite"
    : type === "structural"
    ? "Structured Prompt Template"
    : "Context and Constraint Upgrade";
  const content = typeof suggestion.content === "string" ? suggestion.content.trim() : "";
  const descriptionSource = typeof suggestion.description === "string"
    ? suggestion.description
    : typeof suggestion.explanation === "string"
    ? suggestion.explanation
    : "";
  const rationaleSource = typeof suggestion.rationale === "string"
    ? suggestion.rationale
    : typeof suggestion.explanation === "string"
    ? suggestion.explanation
    : "";

  return {
    id: typeof suggestion.id === "string" && suggestion.id.trim()
      ? suggestion.id.trim()
      : `suggestion-${index + 1}-${type}`,
    type,
    title,
    description: descriptionSource.trim() || "Improves clarity, structure, and execution reliability.",
    content,
    rationale: rationaleSource.trim() || "This version reduces ambiguity and makes the expected output easier to produce consistently.",
    improvement: typeof suggestion.improvement === "number"
      ? clampScore(suggestion.improvement, 0)
      : undefined,
  };
}

function toSentenceList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
  return normalized.length > 0 ? normalized : fallback;
}

function normalizeCategoryScores(raw: unknown): AnalysisCategoryScore[] {
  const asArray = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
    ? Object.entries(raw as Record<string, unknown>).map(([id, value]) => ({ id, score: value }))
    : [];

  const mapped = new Map<AnalysisCategoryId, AnalysisCategoryScore>();

  for (const item of asArray) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const id = record.id;
    const definition = ANALYSIS_CATEGORY_DEFINITIONS.find((entry) => entry.id === id);
    if (!definition) continue;
    mapped.set(definition.id, {
      id: definition.id,
      label: typeof record.label === "string" && record.label.trim() ? record.label.trim() : definition.label,
      score: clampTenScore(record.score, 5),
      rationale: typeof record.rationale === "string" ? record.rationale.trim() : undefined,
    });
  }

  return ANALYSIS_CATEGORY_DEFINITIONS.map((definition) =>
    mapped.get(definition.id) ?? {
      id: definition.id,
      label: definition.label,
      score: 5,
    }
  );
}

function deriveIssues(
  weaknesses: string[],
  suggestedImprovements: string[]
): PromptAnalysis["issues"] {
  return weaknesses.slice(0, 4).map((message, index) => ({
    type: index === 0 ? "missing-context" : index === 1 ? "no-format-spec" : "vague-language",
    severity: index === 0 ? "high" : "medium",
    message,
    suggestion: suggestedImprovements[index] ?? "Add more explicit guidance and structure to the prompt.",
  }));
}

function buildPromptAnalysis(analysisRaw: Record<string, unknown>, originalPrompt: string): PromptAnalysis {
  const words = wordCount(originalPrompt);
  const categoryScores = normalizeCategoryScores(analysisRaw.categoryScores ?? analysisRaw.scores);
  const strengths = toSentenceList(analysisRaw.strengths, []);
  const weaknesses = toSentenceList(analysisRaw.weaknesses, []);
  const suggestedImprovements = toSentenceList(
    analysisRaw.suggestedImprovements ?? analysisRaw.suggestions,
    []
  );
  const explicitIssues = Array.isArray(analysisRaw.issues)
    ? analysisRaw.issues.map(normalizeIssue).filter((issue): issue is PromptAnalysis["issues"][number] => issue !== null)
    : [];
  const overallFromCategories = Math.round(
    (categoryScores.reduce((sum, category) => sum + category.score, 0) / categoryScores.length) * 10
  );
  const clarityFromCategories = Math.round(
    (
      categoryScores
        .filter((category) =>
          category.id === "role-clarity" ||
          category.id === "objective-clarity" ||
          category.id === "task-breakdown" ||
          category.id === "output-format-clarity"
        )
        .reduce((sum, category) => sum + category.score, 0) /
      4
    ) * 10
  );
  const completenessFromCategories = Math.round(
    (
      categoryScores
        .filter((category) =>
          category.id !== "role-clarity" &&
          category.id !== "objective-clarity" &&
          category.id !== "task-breakdown" &&
          category.id !== "output-format-clarity"
        )
        .reduce((sum, category) => sum + category.score, 0) /
      7
    ) * 10
  );

  return {
    clarityScore: clampScore(analysisRaw.clarityScore ?? analysisRaw.clarity, clarityFromCategories || 72),
    completenessScore: clampScore(
      analysisRaw.completenessScore ?? analysisRaw.completeness,
      completenessFromCategories || 68
    ),
    overallScore: clampScore(analysisRaw.overallScore, overallFromCategories || 70),
    lengthAssessment: VALID_LENGTH_ASSESSMENTS.has(analysisRaw.lengthAssessment as PromptAnalysis["lengthAssessment"])
      ? (analysisRaw.lengthAssessment as PromptAnalysis["lengthAssessment"])
      : defaultLengthAssessment(words),
    promptType: VALID_PROMPT_TYPES.has(analysisRaw.promptType as PromptAnalysis["promptType"])
      ? (analysisRaw.promptType as PromptAnalysis["promptType"])
      : defaultPromptType(originalPrompt),
    categoryScores,
    strengths,
    weaknesses,
    suggestedImprovements,
    issues: explicitIssues.length > 0 ? explicitIssues : deriveIssues(weaknesses, suggestedImprovements),
    wordCount: typeof analysisRaw.wordCount === "number" && analysisRaw.wordCount >= 0
      ? Math.round(analysisRaw.wordCount)
      : words,
    estimatedTokens: typeof analysisRaw.estimatedTokens === "number" && analysisRaw.estimatedTokens > 0
      ? Math.round(analysisRaw.estimatedTokens)
      : estimateTokens(words),
  };
}

export const SHARED_ENHANCE_SYSTEM_PROMPT = `You are an elite prompt engineer. Rewrite rough prompts into clear, optimized, production-ready instructions that reliably produce better results.

Primary goals:
- Maximize clarity, specificity, completeness, and output reliability.
- Preserve the user's actual intent, constraints, and domain context.
- Do not invent factual details. If essential information is missing, use short placeholders like [insert audience] or [insert success criteria].
- Optimize the wording for the stated target model when provided.
- Avoid filler. Add useful structure, not empty verbosity.
- Judge the source prompt using professional prompt engineering standards before rewriting it.
- Never return a prompt that is materially the same as the source with only light rewording. A good rewrite must be substantively more detailed, structured, and actionable than the original.

For every improved prompt:
- Make it immediately usable as a standalone prompt.
- State the task, relevant context, constraints, and expected output format explicitly.
- Include tone, audience, depth, and length guidance when available or clearly needed.
- Add quality controls such as success criteria, edge cases, exclusions, or assumptions when they materially improve reliability.
- Keep the prompt concise relative to the task, but detailed enough to remove ambiguity.
- If the source contains placeholders such as [insert profession] or [insert audience], preserve those placeholders but build a fully professional template around them — not a light reword.
- If the source lists pages, sections, or features by name only, expand each one with: specific components/elements, content requirements, layout guidance, user interactions, and technical behavior. Do not just re-list section names.
- If the source is about websites, apps, UI, UX, or software delivery: add information architecture, per-page component specs, design system guidance, responsive breakpoints, accessibility requirements (WCAG level, specific techniques), SEO (meta tags, schema, sitemap), performance targets (Lighthouse scores, load time, image optimization), technical stack requirements, deployment target, and explicit deliverables with measurable acceptance criteria.
- When the source mentions accessibility, SEO, or performance with vague placeholders like [insert score], supplement with real professional minimums AND keep the placeholder for user customization.
- If output structure matters, specify the exact structure the model should follow.

Suggestion requirements:
- Return exactly 3 suggestions in this order: full-rewrite, structural, addition.
- full-rewrite: the strongest end-to-end professional spec. Must be 3-5x more detailed than the source. Use labeled sections (Role, Objective, Pages, Design, Accessibility, SEO, Performance, Technical, Deliverables, Acceptance Criteria). Each listed page or feature must have its own sub-section with specific requirements.
- structural: present the prompt as a clean, clearly sectioned template that developers or designers could hand off directly. Use numbered or bulleted sub-items under each section.
- addition: preserve the user's phrasing while injecting the most critical missing professional detail — do not cut content, only add.
- Each suggestion must have a distinct strategy, not minor wording variations.
- Each content field must be a complete improved prompt, not notes about a prompt.
- For simple prompts: at least 90 words. For template or spec-style prompts (those listing pages, features, deliverables, or acceptance criteria): full-rewrite must exceed 350 words with clearly labeled sections; structural must exceed 250 words.

Return ONLY valid JSON matching this exact schema:
{
  "analysis": {
    "clarityScore": <0-100 integer>,
    "completenessScore": <0-100 integer>,
    "overallScore": <0-100 integer>,
    "lengthAssessment": <"too-short" | "optimal" | "too-long">,
    "promptType": <"instruction" | "question" | "creative" | "code" | "image" | "conversational">,
    "categoryScores": [
      { "id": "role-clarity", "label": "Role Clarity", "score": <0-10 integer>, "rationale": "<short explanation>" },
      { "id": "objective-clarity", "label": "Objective Clarity", "score": <0-10 integer>, "rationale": "<short explanation>" },
      { "id": "context-completeness", "label": "Context Completeness", "score": <0-10 integer>, "rationale": "<short explanation>" },
      { "id": "task-breakdown", "label": "Task Breakdown", "score": <0-10 integer>, "rationale": "<short explanation>" },
      { "id": "technical-constraints", "label": "Technical Constraints", "score": <0-10 integer>, "rationale": "<short explanation>" },
      { "id": "design-requirements", "label": "Design Requirements", "score": <0-10 integer>, "rationale": "<short explanation>" },
      { "id": "accessibility-considerations", "label": "Accessibility", "score": <0-10 integer>, "rationale": "<short explanation>" },
      { "id": "seo-considerations", "label": "SEO", "score": <0-10 integer>, "rationale": "<short explanation>" },
      { "id": "performance-constraints", "label": "Performance", "score": <0-10 integer>, "rationale": "<short explanation>" },
      { "id": "output-format-clarity", "label": "Output Structure", "score": <0-10 integer>, "rationale": "<short explanation>" },
      { "id": "reusability-template-support", "label": "Reusability", "score": <0-10 integer>, "rationale": "<short explanation>" }
    ],
    "strengths": ["<brief strength>"],
    "weaknesses": ["<brief weakness>"],
    "suggestedImprovements": ["<specific improvement>"],
    "wordCount": <integer>,
    "estimatedTokens": <integer>,
    "issues": [
      {
        "type": <"ambiguity" | "missing-context" | "vague-language" | "no-format-spec" | "no-tone-spec">,
        "severity": <"low" | "medium" | "high">,
        "message": "<brief description>",
        "suggestion": "<concrete fix>"
      }
    ]
  },
  "suggestions": [
    {
      "id": "<unique string>",
      "type": <"full-rewrite" | "addition" | "replacement" | "structural">,
      "title": "<short title>",
      "description": "<one sentence explaining what changed and why>",
      "content": "<complete improved prompt>",
      "rationale": "<why this version performs better>",
      "improvement": <0-100 integer>
    }
  ]
}`;

export const SHARED_ANALYZE_SYSTEM_PROMPT = `You are an expert prompt engineer and AI systems architect.

Analyze the given prompt and evaluate it against professional prompt engineering standards.

Score the prompt on these categories using integers from 0 to 10:
- Role Clarity
- Objective Clarity
- Context Completeness
- Task Breakdown
- Technical Constraints
- Design Requirements
- Accessibility Considerations
- SEO Considerations
- Performance Constraints
- Output Format Clarity
- Reusability / Template Support

Then:
- Calculate an overall prompt quality score from 0 to 100.
- Identify clear strengths.
- Identify weaknesses or missing information.
- Suggest specific improvements.
- If a category is not relevant, still score it based on whether the prompt handles it appropriately for its use case.

Return ONLY valid JSON matching this exact schema:
{
  "clarityScore": <0-100 integer>,
  "completenessScore": <0-100 integer>,
  "overallScore": <0-100 integer>,
  "lengthAssessment": <"too-short" | "optimal" | "too-long">,
  "promptType": <"instruction" | "question" | "creative" | "code" | "image" | "conversational">,
  "categoryScores": [
    { "id": "role-clarity", "label": "Role Clarity", "score": <0-10 integer>, "rationale": "<short explanation>" },
    { "id": "objective-clarity", "label": "Objective Clarity", "score": <0-10 integer>, "rationale": "<short explanation>" },
    { "id": "context-completeness", "label": "Context Completeness", "score": <0-10 integer>, "rationale": "<short explanation>" },
    { "id": "task-breakdown", "label": "Task Breakdown", "score": <0-10 integer>, "rationale": "<short explanation>" },
    { "id": "technical-constraints", "label": "Technical Constraints", "score": <0-10 integer>, "rationale": "<short explanation>" },
    { "id": "design-requirements", "label": "Design Requirements", "score": <0-10 integer>, "rationale": "<short explanation>" },
    { "id": "accessibility-considerations", "label": "Accessibility", "score": <0-10 integer>, "rationale": "<short explanation>" },
    { "id": "seo-considerations", "label": "SEO", "score": <0-10 integer>, "rationale": "<short explanation>" },
    { "id": "performance-constraints", "label": "Performance", "score": <0-10 integer>, "rationale": "<short explanation>" },
    { "id": "output-format-clarity", "label": "Output Structure", "score": <0-10 integer>, "rationale": "<short explanation>" },
    { "id": "reusability-template-support", "label": "Reusability", "score": <0-10 integer>, "rationale": "<short explanation>" }
  ],
  "strengths": ["<brief strength>"],
  "weaknesses": ["<brief weakness>"],
  "suggestedImprovements": ["<specific improvement>"],
  "wordCount": <integer>,
  "estimatedTokens": <integer>,
  "issues": [
    { "type": string, "severity": string, "message": string, "suggestion": string }
  ]
}`;

export function buildEnhanceUserMessage(req: EnhanceRequest): string {
  const lines = [
    "Improve the following prompt for stronger clarity, better task definition, and more reliable outputs.",
  ];

  const targetModel = req.targetModelId ?? req.modelId;
  if (targetModel?.trim()) {
    lines.push(`Target AI model: ${targetModel.trim()}`);
  }

  const hasPlaceholders = /\[(?:insert|provide|add)[^\]]+\]/i.test(req.prompt);
  const isWebOrUiBrief = /(website|portfolio|landing page|ui|ux|frontend|web app|app design)/i.test(req.prompt);
  const hasPagesList = /(home|about|projects|contact|services|blog|portfolio)\s*(page|section)/i.test(req.prompt);
  const hasDeliverables = /(deliverable|acceptance criteria|source code|design file)/i.test(req.prompt);

  if (hasPlaceholders) {
    lines.push(
      "TEMPLATE EXPANSION REQUIRED: The source prompt contains [insert X] placeholders. Do NOT lightly rephrase it. Build a fully professional, detailed template around those placeholders — they must be preserved but surrounded by rich, specific requirements."
    );
  }

  if (isWebOrUiBrief) {
    lines.push(
      "WEB/UI SPEC EXPANSION: This is a product or website brief. The full-rewrite must be a proper professional spec with labeled sections. For each page or feature mentioned, list specific components, content requirements, layout guidance, and interactions. Add: design system details, responsive breakpoints (320/768/1024/1440px), WCAG 2.1 AA accessibility specifics, SEO implementation details (meta tags, Open Graph, JSON-LD schema, sitemap), Lighthouse performance targets, technical stack constraints, deployment target, complete deliverables list, and measurable acceptance criteria."
    );
  }

  if (hasPagesList && !isWebOrUiBrief) {
    lines.push(
      "PAGE/SECTION EXPANSION: The source lists pages or sections. For the full-rewrite, expand each listed page with its own sub-section detailing specific components, content, layout, and behavior — do not just re-list the page names."
    );
  }

  if (hasDeliverables) {
    lines.push(
      "DELIVERABLES EXPANSION: The source mentions deliverables and/or acceptance criteria. Expand each into specific, measurable items (e.g. 'Lighthouse scores: Performance ≥ 90, Accessibility ≥ [insert score], SEO ≥ 90' rather than 'accessible website')."
    );
  }

  if (req.tone?.trim() && req.tone !== "Default") {
    lines.push(`Requested tone: ${req.tone.trim()}`);
  }

  if (req.context?.trim()) {
    lines.push(`Additional context:\n${req.context.trim()}`);
  }

  lines.push("Original prompt:");
  lines.push('"""');
  lines.push(req.prompt);
  lines.push('"""');
  lines.push("Return JSON only.");

  return lines.join("\n");
}

export function buildAnalyzeUserMessage(prompt: string, modelId: string): string {
  return `Target model: ${modelId}\n\nPrompt to analyze:\n"""\n${prompt}\n"""\n\nReturn JSON only.`;
}

export function normalizePromptAnalysis(raw: unknown, originalPrompt: string): PromptAnalysis {
  const analysisRaw = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return buildPromptAnalysis(analysisRaw, originalPrompt);
}

export function normalizeEnhanceResponse(raw: unknown, originalPrompt: string): EnhanceResponse {
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const analysisRaw = value.analysis && typeof value.analysis === "object"
    ? (value.analysis as Record<string, unknown>)
    : value;
  const analysis = buildPromptAnalysis(analysisRaw, originalPrompt);

  const suggestionsRaw = Array.isArray(value.suggestions) ? value.suggestions : [];
  const suggestions = suggestionsRaw
    .map((suggestion, index) => normalizeSuggestion(suggestion, index))
    .filter((suggestion) => suggestion.content.length > 0)
    .slice(0, 3);

  if (suggestions.length === 0) {
    throw new Error("Model response did not include any valid suggestions.");
  }

  return { analysis, suggestions };
}
