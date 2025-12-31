# BibleBench - Claude Code Guide

This document provides context for Claude Code when working on the BibleBench project.

## Project Overview

BibleBench is a comprehensive LLM benchmark for evaluating Large Language Models on:

- **Scripture accuracy**: Verse recall, reference knowledge, biblical context
- **Theological understanding**: Core doctrines, heresy detection, denominational nuance
- **Pastoral wisdom**: Application of theology to real-world situations

Built with Evalite (beta) and AI SDK v5, it provides rigorous, reproducible testing across multiple dimensions of biblical and theological competence.

## Technology Stack

- **Evalite (beta)**: Modern TypeScript testing framework for AI applications
- **AI SDK v5**: Unified interface for multiple LLM providers (OpenAI, Anthropic, etc.)
- **TypeScript**: Strict typing for evaluation development
- **Vitest**: Underlying test runner (used by Evalite)
- **Autoevals**: Pre-built evaluation scorers
- **pnpm**: Package manager

## Project Structure

```text
biblebench/
├── .claude/
│   └── skills/
│       ├── evalite/            # Evalite expertise skill
│       │   ├── SKILL.md        # Core skill definition
│       │   ├── reference.md    # API reference
│       │   └── examples.md     # Usage examples
│       └── ai-sdk-v5/          # AI SDK v5 expertise skill
│           ├── SKILL.md        # Core skill definition
│           ├── reference.md    # API reference
│           └── examples.md     # Usage examples
├── evals/
│   ├── scripture/              # Scripture accuracy evaluations
│   │   ├── scripture-matching.eval.ts  # Exact verse recall across translations
│   │   ├── reference-knowledge.eval.ts
│   │   └── context-understanding.eval.ts
│   ├── theology/               # Theological concept evaluations
│   │   ├── core-doctrines.eval.ts
│   │   ├── heresy-detection.eval.ts
│   │   ├── denominational-nuance.eval.ts
│   │   ├── pastoral-application.eval.ts
│   │   ├── sect-theology.eval.ts
│   │   ├── theological-orientation.eval.ts
│   │   └── steering-compliance.eval.ts
│   └── lib/                    # Shared utilities
│       ├── models.ts           # AI model configurations
│       ├── scorers.ts          # Custom scoring functions
│       ├── types.ts            # TypeScript type definitions
│       ├── utils.ts            # Utility functions
│       └── README.md
├── docs/                       # Static web interface (GitHub Pages)
│   ├── index.html              # Main dashboard with leaderboard
│   ├── models.html             # Model specifications and cost analysis
│   ├── css/                    # Stylesheets
│   │   ├── main.css            # Base styles and variables
│   │   ├── charts.css          # Chart styling
│   │   ├── models.css          # Models page styles
│   │   └── responsive.css      # Mobile/responsive design
│   ├── js/                     # JavaScript modules
│   │   ├── main.js             # Dashboard initialization
│   │   ├── models-page.js      # Models page manager
│   │   ├── chart-manager.js    # Chart rendering
│   │   ├── filter-manager.js   # Model filtering
│   │   └── data-loader.js      # Data loading utilities
│   ├── data/                   # Generated JSON data
│   │   ├── dashboard.json      # Evaluation results
│   │   ├── models-metadata.json # Model specifications
│   │   └── models-usage.json   # Usage and cost data
│   └── traces/                 # Evalite traces UI
├── evalite.config.ts          # Evalite configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
├── CLAUDE.md                  # This file - Claude Code guide
├── README.md                  # Main documentation
├── QUICKSTART.md              # Getting started guide
└── CONTRIBUTING.md            # Contribution guidelines
```

## Evalite Skill

This project includes a **Claude Code skill** that provides expert assistance with Evalite development. Skills are automatically activated when you work on relevant tasks - no need to explicitly invoke them.

### What is the Evalite Skill?

Located in `.claude/skills/evalite/`, this skill makes Claude Code an expert in:

- Creating new `.eval.ts` evaluation files
- Designing custom scorers (rule-based, heuristic, LLM-as-judge)
- Configuring AI SDK models with proper wrapping and caching
- Debugging evaluation results using traces and metadata
- Following BibleBench-specific patterns and conventions

### Evalite Skill Files

- **SKILL.md** - Core skill with Evalite concepts, best practices, and project context
- **reference.md** - Complete API reference for Evalite and AI SDK v5
- **examples.md** - 10 practical examples covering common tasks

### When the Evalite Skill Activates

The skill automatically triggers when you mention:

- Creating evaluations or `.eval.ts` files
- Working with scorers or scoring functions
- Configuring models or AI SDK integration
- Debugging evaluation results
- Evalite-related questions

### Example Usage (Evalite)

Simply ask naturally, and the skill will activate automatically:

- "Create a new evaluation for church history"
- "How do I add an LLM-as-judge scorer for detecting theological errors?"
- "Debug why my verse recall evaluation scores are low"
- "Add support for Gemini models to the benchmark"

The skill provides deep Evalite expertise combined with BibleBench-specific theological and technical patterns, making development much more efficient.

## AI SDK v5 Skill

This project also includes a **Claude Code skill** for AI SDK v5 (not v6), providing expert assistance with LLM integration and text generation.

### What is the AI SDK v5 Skill?

Located in `.claude/skills/ai-sdk-v5/`, this skill makes Claude Code an expert in:

- Using `generateText` and `generateObject` (v5 APIs)
- Configuring model providers (OpenAI, Anthropic, OpenRouter, etc.)
- Creating Zod schemas for structured output
- Optimizing prompts and model parameters
- Debugging AI SDK errors and issues
- Integrating AI SDK with Evalite

### AI SDK v5 Skill Files

- **SKILL.md** - Core skill with AI SDK v5 concepts, patterns, and best practices
- **reference.md** - Complete API reference for generateText, generateObject, providers, and Zod
- **examples.md** - 15 practical examples covering common use cases

### When the AI SDK v5 Skill Activates

The skill automatically triggers when you mention:

- Text generation with `generateText` or `generateObject`
- Model configuration or provider setup
- Zod schema creation
- LLM-as-judge implementation
- AI SDK debugging or optimization
- Temperature, tokens, or other model parameters

### Example Usage (AI SDK v5)

Simply ask naturally, and the skill will activate automatically:

- "How do I use generateObject with a Zod schema for scoring?"
- "Add Claude Opus 4 to the benchmark models"
- "Create an LLM-as-judge with structured output"
- "Debug why my generateText call is failing"
- "Set up OpenRouter to access multiple models"

### Important: v5 vs v6

This project uses **AI SDK v5** specifically. The skill understands v5 patterns where `generateObject` is the standard way to get structured output. Do not confuse with v6, where `generateObject` is deprecated in favor of `generateText` with an `output` parameter.

## Key Files to Understand

### `evals/lib/models.ts`

Configures AI SDK models accessed through OpenRouter, wrapped with Evalite's `wrapAISDKModel` for:

- Automatic tracing of LLM calls
- Intelligent caching of responses
- Unified access to hundreds of models from multiple providers

The `benchmarkModels` array defines all available models.
The `selectedModels` export respects the `MODELS` environment variable for filtering which models to test.
All models are accessed through OpenRouter using a single API key.

### `evals/lib/scorers.ts`

Defines reusable scoring functions:

- **Rule-based**: `exactMatch`, `containsAnswer`, `levenshteinSimilarity`
- **Domain-specific**: `scriptureReferenceAccuracy`
- **LLM-as-judge**: `theologicalAccuracyJudge`, `heresyDetectionJudge`, `denominationalBiasDetector`

All LLM-as-judge scorers use AI SDK's `generateObject` for structured output with rationales.

### Evaluation Files (`*.eval.ts`)

Each evaluation file:

1. Imports models and scorers from `lib/`
2. Defines test data with `input`, `expected`, and optional metadata
3. Uses `evalite.each()` for A/B testing across all models (respects `MODELS` env var)
4. Creates a single evaluation with side-by-side model comparisons
5. Applies multiple scorers for comprehensive evaluation

All evaluations use **Evalite's A/B testing** feature to enable direct model comparison rather than separate evaluations per model.

## Common Development Tasks

### Running Specific Models

Use the `MODELS` environment variable to filter which models to test - no code changes needed:

```bash
# Run only specific models
MODELS="gpt" pnpm eval              # Only GPT models
MODELS="claude" pnpm eval           # Only Claude models
MODELS="opus,sonnet" pnpm eval      # Only Opus and Sonnet
MODELS="gpt-5.2" pnpm eval:dev      # Single specific model
```

Pattern matching is case-insensitive and supports partial matches. Multiple patterns can be comma-separated.

### Adding New Test Cases

Edit the data array in any `.eval.ts` file:

```typescript
const testData = [
  {
    input: "Your question or prompt",
    expected: "Expected answer",
    // Additional metadata as needed
  },
  // Add more test cases here
];
```

### Adding New Models

All models are accessed through OpenRouter. Edit `evals/lib/models.ts`:

```typescript
import { wrapAISDKModel } from "evalite/ai-sdk";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Add any model from OpenRouter's catalog
export const newModel = wrapAISDKModel(
  openrouter.chat("provider/model-name")
);

// Add to benchmarkModels array
export const benchmarkModels = [
  // ... existing models
  { name: "New Model", model: newModel },
];
```

See available models at: <https://openrouter.ai/docs#models>

### Creating New Scorers

Add to `evals/lib/scorers.ts`:

```typescript
import { createScorer } from "evalite";

export const myScorer = createScorer<string, string, string>({
  name: "My Scorer",
  description: "What it measures",
  scorer: ({ input, output, expected }) => {
    // Scoring logic
    return {
      score: 0.0 to 1.0,
      metadata: { /* debugging info */ }
    };
  }
});
```

### Creating New Evaluations

Create a new `.eval.ts` file in the appropriate directory using Evalite's A/B testing:

```typescript
import { evalite } from "evalite";
import { generateText } from "ai";
import { selectedModels } from "../lib/models.js";
import { myScorer } from "../lib/scorers.js";

const testData = [/* your test cases */];

// Run A/B testing across all models
evalite.each(
  selectedModels.map(({ name, model }) => ({ name, input: { model } }))
)("Category Name", {
  data: async () => testData,
  task: async (input, variant) => {
    const result = await generateText({
      model: variant.input.model,
      prompt: `System prompt\n\n${input}`,
    });
    return result.text;
  },
  scorers: [myScorer],
});
```

**Benefits of `evalite.each()`:**
- All models compared side-by-side in a single evaluation
- Per-model scores clearly visible in the UI
- Direct comparison of model performance on each test case
- Better for benchmarking and analysis

## Running Evaluations

```bash
# Development mode with UI
pnpm eval:dev

# Run all evaluations
pnpm eval

# Run specific evaluation
pnpm eval evals/scripture/verse-recall.eval.ts

# View results UI
pnpm eval:ui

# Disable caching (for production runs)
pnpm eval --no-cache
```

## Web Interface & Results Dashboard

The BibleBench project includes a static web interface (in `docs/`) that visualizes evaluation results and model performance data. This interface is published to GitHub Pages and provides interactive exploration of benchmark results.

### Dashboard (index.html)

The main dashboard provides:

- **Overall Leaderboard**: Ranked view of all models by average benchmark score
- **Category Breakdowns**: Performance charts for Scripture Accuracy and Theological Understanding
- **Individual Evaluations**: Detailed charts for each evaluation (verse recall, heresy detection, etc.)
- **Model Filtering**: Interactive multi-select to focus on specific models
- **Responsive Design**: Optimized for desktop and mobile viewing

Data is loaded from `docs/data/dashboard.json`, which is generated by the evaluation pipeline.

### Models Page (models.html)

The models page (`docs/models.html`) provides comprehensive model specifications and cost analysis. This is the primary resource for users selecting models for production use.

#### Features

1. **Model Specifications**
   - Display name and provider
   - Description and capabilities
   - Context length
   - Prompt and completion costs per million tokens
   - Architecture and release date
   - Supported modalities (text, vision, etc.)

2. **Evaluation Usage Statistics**
   - Total input and output tokens used
   - Total cost across all evaluations
   - Number of test cases evaluated
   - Highlighted cost display for quick comparison

3. **Performance Metrics**
   - Overall benchmark score (0-100%)
   - Value score (performance per dollar)

4. **Interactive Sorting**
   - **Value (High to Low)** - Default view, shows best bang-for-buck models
   - **Value (Low to High)** - Shows least efficient models
   - Overall Score (High to Low)
   - Overall Score (Low to High)
   - Provider (A-Z) - Grouped by provider
   - Evaluation Cost (High to Low)
   - Evaluation Cost (Low to High)
   - Model Name (A-Z)

5. **Visual Design**
   - Color-coded metrics (orange for scores, green for value)
   - Provider badges
   - Expandable capabilities sections
   - Responsive grid layout

#### Value Score Metric

The **Value Score** is a key feature designed to help users identify models that offer the best performance-to-cost ratio for faith-based applications.

**Calculation:**
```javascript
Value Score = (Overall Score / Total Cost) × 100
```

**Display Format:**
- Shown as "X.X pts/$" (points per dollar)
- Higher values indicate better value
- Green highlighting to distinguish from performance score
- Only shown for models with usage data

**Use Cases:**
- **Budget-conscious deployments**: Find the cheapest model that meets quality requirements
- **Cost optimization**: Compare similar-performing models to choose the most economical
- **Production planning**: Estimate costs for different model choices at scale

**Example:**
- Model A: 80% score, $0.50 cost → Value Score = 160 pts/$
- Model B: 90% score, $1.20 cost → Value Score = 75 pts/$
- Model A offers better value despite lower absolute performance

#### Implementation Files

- `docs/models.html` - HTML structure and metadata
- `docs/js/models-page.js` - ModelsPageManager class
  - `getModelValueScore()` - Calculates value metric
  - `getSortedModels()` - Handles all sorting logic
  - `createModelCard()` - Renders individual model cards
- `docs/css/models.css` - Styling for model cards and value highlighting

#### Data Sources

The models page loads three JSON files:

1. **models-metadata.json** - Model specifications
   - Provider, name, description
   - Context length, costs, capabilities
   - Architecture, release date, modalities

2. **models-usage.json** - Evaluation usage statistics
   - Input/output token counts
   - Total cost per model
   - Number of evaluations run

3. **dashboard.json** - Performance scores
   - Overall benchmark score
   - Per-evaluation scores
   - Referenced for value calculation

These files are generated by the evaluation pipeline and committed to the repository.

### Traces UI

The `docs/traces/` directory contains the Evalite traces UI, which provides detailed inspection of individual evaluation runs:

- Exact prompts sent to models
- Full model responses
- Token usage and timing
- Scorer outputs and metadata
- LLM-as-judge rationales

Access via the "Detailed Traces" link in the dashboard footer.

### Updating the Web Interface

When working on the web interface:

1. **HTML files** (`docs/*.html`) define structure and metadata
2. **JavaScript modules** (`docs/js/*.js`) handle data loading and interactivity
3. **CSS files** (`docs/css/*.css`) provide styling and responsive design
4. **Data files** (`docs/data/*.json`) are generated by evaluations, not hand-edited

The site is static HTML/CSS/JS - no build step required. Changes to HTML/CSS/JS can be tested by opening files directly in a browser.

## Environment Variables

Required API key (set in `.env`):

- `OPENROUTER_API_KEY` - **Only key needed!** Provides access to all models (GPT, Claude, Llama, Grok, Gemini, etc.)

Get your API key at: <https://openrouter.ai/keys>

## Theological Principles

When working on this project, keep in mind:

### Doctrinal Foundation

- Grounded in historic Christian orthodoxy (Apostles' Creed, Nicene Creed, Chalcedonian Definition)
- Non-negotiables: Trinity, deity of Christ, salvation by grace, biblical authority, resurrection
- Denominational differences: Baptism, governance, eschatology, spiritual gifts (legitimate diversity)

### Evaluation Philosophy

- **Fair representation** of diverse Christian traditions
- **Heresy detection** based on historical ecumenical consensus
- **Pastoral sensitivity** in real-world application scenarios
- **Transparency** through detailed metadata and rationales

### Common Pitfalls to Avoid

- Don't favor one denomination on disputable matters
- Don't present debatable positions as universally accepted
- Don't compromise on core orthodox doctrines
- Don't ignore the pastoral/practical dimension of theology

## Debugging Tips

### Check Traces

The Evalite UI provides detailed traces showing:

- Exact prompts sent to models
- Full model responses
- Token usage
- Timing information

### Examine Metadata

LLM-as-judge scorers return rich metadata:

- Rationales for scores
- Detected issues
- Specific theological assessments

### Use Caching Wisely

- Enabled by default for faster iteration
- Disable with `--no-cache` for final runs
- Cache persists for 24 hours

### Common Issues

- **API key errors**: Check `.env` file
- **Import errors**: Ensure `.js` extensions in imports (ES modules)
- **Low scores**: Check prompts and expected answers
- **Inconsistent scores**: Some models are non-deterministic

## Contributing Guidelines

See `CONTRIBUTING.md` for detailed guidelines. Key points:

1. **Theological accuracy**: All content must align with historic Christian orthodoxy
2. **Denominational neutrality**: Fair representation of diverse views on secondary matters
3. **Code quality**: TypeScript with strict typing, clear comments
4. **Testing**: Run evaluations before submitting
5. **Documentation**: Update relevant docs with changes

## AI SDK v5 with OpenRouter

This project uses AI SDK v5 (not v6) with OpenRouter for all model access. Key patterns:

```typescript
import { generateText, generateObject } from "ai";
import { wrapAISDKModel } from "evalite/ai-sdk";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

// Configure OpenRouter
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Wrap models for Evalite
const model = wrapAISDKModel(openrouter.chat("openai/gpt-4o"));

// Text generation
const result = await generateText({
  model,
  prompt: "Your prompt",
  maxTokens: 300,
});

// Structured output (for LLM-as-judge)
const result = await generateObject({
  model,
  schema: z.object({/* zod schema */}),
  prompt: "Your prompt",
});
```

All models are accessed through OpenRouter - no direct provider integrations needed.

## Helpful Commands

```bash
# Install dependencies
pnpm install

# Type check
pnpm tsc --noEmit

# List all eval files
find evals -name "*.eval.ts"

# Check git status
git status

# Run specific category
pnpm eval evals/theology/
```

## Links

- [Evalite Documentation](https://evalite.dev)
- [AI SDK Documentation](https://sdk.vercel.ai)
- [Project README](README.md)
- [Quick Start Guide](QUICKSTART.md)
- [Contributing Guide](CONTRIBUTING.md)

## Project Goals

The long-term vision for BibleBench is to:

1. Become an industry-standard benchmark for LLM theological knowledge
2. Help LLM developers identify weaknesses in scripture/theology understanding
3. Enable religious organizations to evaluate models before deployment
4. Provide researchers with data on LLM theological reasoning
5. Support responsible development of AI for religious contexts

---

*This guide helps Claude Code understand the project context and assist effectively with development tasks.*
