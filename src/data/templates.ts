import type { PromptTemplate } from "@/types";

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // ── Content Writing ────────────────────────────────────────────────────────
  {
    id: "blog-post-outline",
    title: "Blog Post Outline",
    description: "Generate a structured outline for a long-form blog post.",
    category: "content-writing",
    targetModelIds: [],
    tags: ["writing", "seo", "content"],
    variables: [
      { key: "topic", label: "Topic", placeholder: "AI in healthcare", required: true },
      { key: "audience", label: "Target Audience", placeholder: "Healthcare professionals", required: true },
      { key: "tone", label: "Tone", placeholder: "Professional yet approachable", required: false },
    ],
    prompt: `Create a detailed blog post outline about {{topic}} for an audience of {{audience}}.

Tone: {{tone}}

Include:
- A compelling headline with an emotional hook
- An introduction that establishes the problem or opportunity
- 5–7 main sections with H2 headings and 3 bullet points each
- A conclusion with key takeaways and a clear call to action
- Suggested internal linking opportunities
- SEO meta description (150–160 characters)`,
  },
  {
    id: "product-description",
    title: "Product Description",
    description: "Write a compelling product description optimized for conversions.",
    category: "content-writing",
    targetModelIds: [],
    tags: ["ecommerce", "copywriting", "marketing"],
    variables: [
      { key: "product", label: "Product Name", placeholder: "Ergonomic Standing Desk", required: true },
      { key: "features", label: "Key Features", placeholder: "Adjustable height, memory presets, cable management", required: true },
      { key: "audience", label: "Target Customer", placeholder: "Remote workers with back pain", required: true },
    ],
    prompt: `Write a persuasive product description for {{product}}.

Key features: {{features}}
Target customer: {{audience}}

Structure:
1. Hook (1 sentence addressing the customer pain point)
2. Product overview (2–3 sentences)
3. Key benefits (bullet list, benefit-focused not feature-focused)
4. Social proof placeholder [e.g., "Trusted by 10,000+ professionals"]
5. Call to action

Keep the tone confident, benefit-driven, and under 200 words.`,
  },
  // ── Coding ─────────────────────────────────────────────────────────────────
  {
    id: "code-review",
    title: "Code Review Request",
    description: "Ask an AI model to review code for quality, bugs, and improvements.",
    category: "coding",
    targetModelIds: ["gpt-4o", "gemini-2.0-flash", "gemini-1.5-pro", "claude-3-5-sonnet"],
    tags: ["code review", "debugging", "best practices"],
    variables: [
      { key: "language", label: "Programming Language", placeholder: "TypeScript", required: true },
      { key: "context", label: "What the code does", placeholder: "Handles user authentication with JWT", required: true },
    ],
    prompt: `Please review the following {{language}} code. The code is responsible for: {{context}}

\`\`\`{{language}}
[PASTE YOUR CODE HERE]
\`\`\`

Please analyze and provide:
1. **Bugs & Issues**: Any bugs, edge cases, or potential runtime errors
2. **Security Concerns**: Vulnerabilities, injection risks, or insecure patterns
3. **Performance**: Inefficiencies, unnecessary re-renders, or N+1 query risks
4. **Code Quality**: Readability, naming conventions, and adherence to best practices
5. **Refactored Version**: A cleaned-up version of the code with inline comments explaining changes

Be specific with line references and provide concrete fixes.`,
  },
  {
    id: "api-design",
    title: "REST API Design",
    description: "Design a REST API endpoint with request/response schema.",
    category: "coding",
    targetModelIds: [],
    tags: ["api", "backend", "design"],
    variables: [
      { key: "resource", label: "Resource", placeholder: "User Profile", required: true },
      { key: "operations", label: "Operations needed", placeholder: "CRUD + search", required: true },
      { key: "stack", label: "Tech Stack", placeholder: "Node.js + PostgreSQL", required: false },
    ],
    prompt: `Design a RESTful API for managing {{resource}} with the following operations: {{operations}}.
Tech stack: {{stack}}

For each endpoint provide:
- HTTP method and URL path
- Request headers (authentication requirements)
- Request body schema (JSON with field types and validation rules)
- Success response schema (with HTTP status code)
- Error response schemas (validation, not found, unauthorized)
- Rate limiting considerations

Also provide:
- OpenAPI 3.0 YAML snippet for the main endpoint
- Security considerations specific to this resource
- Pagination strategy (if applicable)`,
  },
  // ── Data Analysis ──────────────────────────────────────────────────────────
  {
    id: "data-analysis-plan",
    title: "Data Analysis Plan",
    description: "Create a structured data analysis plan for a dataset.",
    category: "data-analysis",
    targetModelIds: [],
    tags: ["data science", "analytics", "sql"],
    variables: [
      { key: "dataset", label: "Dataset Description", placeholder: "E-commerce transaction records from 2024", required: true },
      { key: "goal", label: "Business Goal", placeholder: "Identify churn indicators", required: true },
    ],
    prompt: `I have a dataset consisting of {{dataset}}.
My business goal is to: {{goal}}

Create a comprehensive data analysis plan that includes:

1. **Exploratory Data Analysis (EDA)**
   - Key statistics to compute
   - Distributions to examine
   - Missing value treatment strategy

2. **Feature Engineering**
   - Derived features to create
   - Encoding strategies for categorical variables

3. **Analysis Methods**
   - Statistical tests appropriate for this goal
   - Visualization types and what insights they reveal

4. **SQL Queries**
   - 3 key queries to extract insights (with comments)

5. **Expected Outputs**
   - Key metrics and KPIs to report
   - Recommended dashboard components`,
  },
  // ── Image Generation ───────────────────────────────────────────────────────
  {
    id: "photorealistic-portrait",
    title: "Photorealistic Portrait",
    description: "Craft a detailed portrait prompt for image generation models.",
    category: "image-generation",
    targetModelIds: ["dall-e-3", "stable-diffusion-xl", "midjourney-v6"],
    tags: ["portrait", "photography", "photorealistic"],
    variables: [
      { key: "subject", label: "Subject Description", placeholder: "A 30-year-old woman with curly auburn hair", required: true },
      { key: "setting", label: "Setting / Background", placeholder: "Golden hour, forest clearing", required: true },
      { key: "style", label: "Photography Style", placeholder: "Editorial fashion photography", required: false },
    ],
    prompt: `{{subject}}, {{setting}}, {{style}}.

Technical: shot on Canon EOS R5, 85mm f/1.4 lens, shallow depth of field, bokeh background.
Lighting: golden hour natural light, soft rim lighting, catchlights in eyes.
Quality: 8K UHD, hyperrealistic skin texture, professional color grading, magazine quality.
Mood: confident, authentic, editorial.
Negative: cartoon, illustration, painting, blurry, low quality, oversaturated.`,
  },
  {
    id: "concept-art",
    title: "Concept Art / Environment",
    description: "Generate an environment or scene concept art prompt.",
    category: "image-generation",
    targetModelIds: ["dall-e-3", "stable-diffusion-xl", "midjourney-v6"],
    tags: ["concept art", "environment", "digital art"],
    variables: [
      { key: "scene", label: "Scene Description", placeholder: "Abandoned space station orbiting a gas giant", required: true },
      { key: "mood", label: "Mood / Atmosphere", placeholder: "Eerie, mysterious, lonely", required: true },
      { key: "style", label: "Art Style", placeholder: "Sci-fi concept art, cinematic", required: false },
    ],
    prompt: `{{scene}}, {{mood}} atmosphere. {{style}}.

Visual details: dramatic volumetric lighting, god rays, detailed environmental storytelling, micro-details visible.
Color palette: deep blues and purples, warm accent lighting, high contrast.
Composition: wide establishing shot, rule of thirds, strong foreground element for depth.
Technical: octane render, unreal engine 5 quality, artstation trending, 8K, concept art.`,
  },
  // ── Research ───────────────────────────────────────────────────────────────
  {
    id: "research-summary",
    title: "Research Topic Summary",
    description: "Produce a structured research summary on a topic.",
    category: "research",
    targetModelIds: [],
    tags: ["research", "summary", "academic"],
    variables: [
      { key: "topic", label: "Research Topic", placeholder: "Transformer architecture optimizations for edge devices", required: true },
      { key: "level", label: "Expertise Level", placeholder: "Senior ML engineer", required: true },
    ],
    prompt: `Provide a comprehensive research summary on: {{topic}}

Target audience: {{level}}

Structure your response as:
1. **Overview** (2–3 sentences defining the topic and its significance)
2. **Current State of the Art** (key approaches, models, or methods as of your knowledge cutoff)
3. **Key Research Papers** (5 seminal or recent papers with authors, year, and one-sentence contribution summary)
4. **Open Problems** (3–5 unsolved challenges the research community is actively working on)
5. **Practical Applications** (real-world use cases and industry adoption)
6. **Further Reading** (recommended resources for deeper study)

Be specific, cite real work where possible, and flag anything uncertain.`,
  },
  // ── Customer Support ───────────────────────────────────────────────────────
  {
    id: "support-response",
    title: "Customer Support Response",
    description: "Draft a professional customer support reply.",
    category: "customer-support",
    targetModelIds: [],
    tags: ["support", "customer service", "email"],
    variables: [
      { key: "issue", label: "Customer Issue", placeholder: "Order delivered damaged, requesting refund", required: true },
      { key: "brand_tone", label: "Brand Tone", placeholder: "Friendly and empathetic", required: true },
      { key: "resolution", label: "Available Resolution", placeholder: "Full refund or replacement", required: true },
    ],
    prompt: `You are a customer support specialist. Draft a professional response to a customer with the following issue: {{issue}}

Brand tone: {{brand_tone}}
Available resolution: {{resolution}}

The response should:
- Open with genuine empathy and acknowledgment (no generic "I'm sorry for the inconvenience")
- Clearly state the resolution being offered and next steps
- Set accurate expectations on timeline
- Include a brief explanation of what went wrong (if appropriate)
- Close with a confidence-building statement about the brand
- Be between 100–150 words
- Never use passive voice or corporate jargon`,
  },
  // ── Education ──────────────────────────────────────────────────────────────
  {
    id: "lesson-plan",
    title: "Lesson Plan Generator",
    description: "Create a structured lesson plan for teaching a concept.",
    category: "education",
    targetModelIds: [],
    tags: ["education", "teaching", "curriculum"],
    variables: [
      { key: "topic", label: "Topic to Teach", placeholder: "Recursion in programming", required: true },
      { key: "audience", label: "Student Level", placeholder: "First-year computer science students", required: true },
      { key: "duration", label: "Session Duration", placeholder: "60 minutes", required: true },
    ],
    prompt: `Create a detailed lesson plan for teaching {{topic}} to {{audience}} in a {{duration}} session.

Include:
1. **Learning Objectives** (3 measurable outcomes using Bloom's Taxonomy verbs)
2. **Prerequisites** (what students should know beforehand)
3. **Lesson Structure**
   - Introduction / Hook (5 min): An engaging real-world analogy or question
   - Core Instruction (time allocation): Key concepts with explanations
   - Hands-on Activity (time allocation): Practical exercise with instructions
   - Q&A / Common Misconceptions (time allocation): Top 3 misconceptions and corrections
   - Summary & Recap (5 min)
4. **Assessment** (how to measure if objectives were met)
5. **Homework / Follow-up** (optional extension activity)
6. **Resources** (links, tools, or materials needed)`,
  },
];

export function getTemplateById(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(
  category: PromptTemplate["category"]
): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter((t) => t.category === category);
}

export const TEMPLATE_CATEGORY_LABELS: Record<
  PromptTemplate["category"],
  string
> = {
  "content-writing": "Content Writing",
  coding: "Coding",
  "data-analysis": "Data Analysis",
  "image-generation": "Image Generation",
  "customer-support": "Customer Support",
  research: "Research",
  education: "Education",
  general: "General",
};
