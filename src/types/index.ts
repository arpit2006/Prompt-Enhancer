// ─── Prompt & Model Types ────────────────────────────────────────────────────

export type ModelCategory = "text" | "image" | "code";

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  category: ModelCategory;
  description: string;
  maxTokens: number;
  supportsSystem: boolean;
}

export interface PromptAnalysis {
  clarityScore: number;       // 0–100
  completenessScore: number;  // 0–100
  lengthAssessment: "too-short" | "optimal" | "too-long";
  promptType: "instruction" | "question" | "creative" | "code" | "image" | "conversational";
  issues: AnalysisIssue[];
  wordCount: number;
  estimatedTokens: number;
}

export interface AnalysisIssue {
  type: "ambiguity" | "missing-context" | "vague-language" | "no-format-spec" | "no-tone-spec";
  severity: "low" | "medium" | "high";
  message: string;
  suggestion: string;
}

export interface PromptSuggestion {
  id: string;
  type: "full-rewrite" | "addition" | "replacement" | "structural";
  title: string;
  description: string;
  content: string;         // The suggested improved prompt
  rationale: string;       // Why this improvement helps
  improvement?: number;    // Optional estimated % improvement score (0-100)
}

// ─── Prompt History & Versioning ─────────────────────────────────────────────

export interface PromptVersion {
  id: string;
  content: string;
  modelId: string;
  createdAt: string;       // ISO date string
  label?: string;          // e.g. "v3 – production"
  analysis?: PromptAnalysis;
}

export interface PromptEntry {
  id: string;
  title: string;
  versions: PromptVersion[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  folderId?: string;
}

// ─── Folder Types ────────────────────────────────────────────────────────────

export type FolderColor =
  | "violet"
  | "blue"
  | "emerald"
  | "amber"
  | "rose"
  | "slate";

export interface Folder {
  id: string;
  name: string;
  color: FolderColor;
  createdAt: string;
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface AnalyticsEntry {
  date: string;            // YYYY-MM-DD
  enhancements: number;
  modelCounts: Record<string, number>;
  totalScore: number;      // sum of clarity scores (for computing avg)
  scoreCount: number;      // number of scored enhancements
}

// ─── Template Types ───────────────────────────────────────────────────────────

export type TemplateCategory =
  | "content-writing"
  | "coding"
  | "data-analysis"
  | "image-generation"
  | "customer-support"
  | "research"
  | "education"
  | "general";

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  targetModelIds: string[];   // empty = works for all
  prompt: string;             // may contain {{variable}} placeholders
  variables: TemplateVariable[];
  tags: string[];
}

export interface TemplateVariable {
  key: string;                // matches {{key}} in prompt
  label: string;
  placeholder: string;
  required: boolean;
}

// ─── API Request / Response Types ────────────────────────────────────────────

export interface EnhanceRequest {
  prompt: string;
  modelId?: string;
  targetModelId?: string;
  context?: string;
  tone?: string;
}

export interface EnhanceResponse {
  suggestions: PromptSuggestion[];
  analysis: PromptAnalysis;
}

export interface AnalyzeRequest {
  prompt: string;
  modelId?: string;
  targetModelId?: string;
}

// ─── Custom API Tester Types ─────────────────────────────────────────────────

export type ApiAuthMethod =
  | "none"
  | "bearer"
  | "api-key-header"
  | "basic"
  | "custom-header";

export interface CustomHeader {
  id: string;
  key: string;
  value: string;
}

export interface ApiRequestConfig {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  authMethod: ApiAuthMethod;
  // bearer / api-key-header
  authHeaderName: string;  // e.g. "Authorization" or "X-API-Key"
  authHeaderValue: string; // token / key
  // basic auth
  basicUsername: string;
  basicPassword: string;
  // extra headers
  customHeaders: CustomHeader[];
  // Body template — use {{prompt}} as placeholder for current prompt
  bodyTemplate: string;
}

export interface ApiRequestResponse {
  status: number;
  statusText: string;
  responseHeaders: Record<string, string>;
  body: string;
  durationMs: number;
  timestamp: string;
}
