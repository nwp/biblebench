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

```
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
│   │   ├── verse-recall.eval.ts
│   │   ├── reference-knowledge.eval.ts
│   │   └── context-understanding.eval.ts
│   ├── theology/               # Theological concept evaluations
│   │   ├── core-doctrines.eval.ts
│   │   ├── heresy-detection.eval.ts
│   │   ├── denominational-nuance.eval.ts
│   │   └── pastoral-application.eval.ts
│   └── lib/                    # Shared utilities
│       ├── models.ts           # AI model configurations
│       ├── scorers.ts          # Custom scoring functions
│       └── README.md
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

### Skill Files

- **SKILL.md** - Core skill with Evalite concepts, best practices, and project context
- **reference.md** - Complete API reference for Evalite and AI SDK v5
- **examples.md** - 10 practical examples covering common tasks

### When It Activates

The skill automatically triggers when you mention:

- Creating evaluations or `.eval.ts` files
- Working with scorers or scoring functions
- Configuring models or AI SDK integration
- Debugging evaluation results
- Evalite-related questions

### Example Usage

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

### Skill Files

- **SKILL.md** - Core skill with AI SDK v5 concepts, patterns, and best practices
- **reference.md** - Complete API reference for generateText, generateObject, providers, and Zod
- **examples.md** - 15 practical examples covering common use cases

### When It Activates

The skill automatically triggers when you mention:

- Text generation with `generateText` or `generateObject`
- Model configuration or provider setup
- Zod schema creation
- LLM-as-judge implementation
- AI SDK debugging or optimization
- Temperature, tokens, or other model parameters

### Example Usage

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

The `benchmarkModels` array defines which models are tested across all evaluations.
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
3. Iterates over `benchmarkModels` to test each model
4. Uses `evalite()` to create test suites
5. Applies multiple scorers for comprehensive evaluation

## Common Development Tasks

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

Create a new `.eval.ts` file in the appropriate directory:

```typescript
import { evalite } from "evalite";
import { generateText } from "ai";
import { benchmarkModels } from "../lib/models.js";
import { myScorer } from "../lib/scorers.js";

const testData = [/* your test cases */];

for (const { name, model } of benchmarkModels) {
  evalite(`Category - ${name}`, {
    data: testData,
    task: async (input) => {
      const result = await generateText({
        model,
        prompt: `System prompt\n\n${input}`,
        maxTokens: 300,
      });
      return result.text;
    },
    scorers: [myScorer],
  });
}
```

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
