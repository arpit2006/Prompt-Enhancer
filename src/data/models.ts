import type { AIModel } from "@/types";

export const AI_MODELS: AIModel[] = [
  // ── Text / LLM ─────────────────────────────────────────────────────────────
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    category: "text",
    description: "Fast, efficient model for most tasks. Great balance of speed and quality.",
    maxTokens: 8192,
    supportsSystem: true,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    category: "text",
    description: "Advanced reasoning with 1M token context window. Best for complex tasks.",
    maxTokens: 8192,
    supportsSystem: true,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    category: "text",
    description: "OpenAI's flagship multimodal model. Excellent instruction following.",
    maxTokens: 4096,
    supportsSystem: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    category: "text",
    description: "Cost-efficient OpenAI model for everyday tasks.",
    maxTokens: 4096,
    supportsSystem: true,
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    category: "text",
    description: "Strong at nuanced writing, analysis, and following complex instructions.",
    maxTokens: 4096,
    supportsSystem: true,
  },
  // ── Code ───────────────────────────────────────────────────────────────────
  {
    id: "codestral",
    name: "Codestral",
    provider: "Mistral",
    category: "code",
    description: "High-performance code generation and completion model.",
    maxTokens: 4096,
    supportsSystem: true,
  },
  {
    id: "deepseek-coder",
    name: "DeepSeek Coder",
    provider: "DeepSeek",
    category: "code",
    description: "Open-source code model trained on 2T code tokens.",
    maxTokens: 4096,
    supportsSystem: true,
  },
  // ── Image ──────────────────────────────────────────────────────────────────
  {
    id: "dall-e-3",
    name: "DALL·E 3",
    provider: "OpenAI",
    category: "image",
    description: "High-quality image generation with natural language prompts.",
    maxTokens: 1000,
    supportsSystem: false,
  },
  {
    id: "stable-diffusion-xl",
    name: "Stable Diffusion XL",
    provider: "Stability AI",
    category: "image",
    description: "Open-source image generation model. Highly customizable.",
    maxTokens: 750,
    supportsSystem: false,
  },
  {
    id: "midjourney-v6",
    name: "Midjourney v6",
    provider: "Midjourney",
    category: "image",
    description: "Artistic image generation with unique aesthetic quality.",
    maxTokens: 500,
    supportsSystem: false,
  },
];

export const DEFAULT_MODEL_ID = "gemini-2.0-flash";

export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find((m) => m.id === id);
}

export function getModelsByCategory(category: AIModel["category"]): AIModel[] {
  return AI_MODELS.filter((m) => m.category === category);
}
