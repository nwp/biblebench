# Evaluation Libraries

This directory contains shared utilities for the BibleBench evaluation suite.

## Files

### `models.ts`

Configures and exports AI SDK models accessed through **OpenRouter** and wrapped with Evalite's tracing and caching functionality.

**Key Features:**

- All models accessed through OpenRouter (single API key)
- Automatic tracing of LLM calls
- Intelligent caching with 24-hour TTL
- Unified access to hundreds of models

**Exports:**

- Individual models: `gpt5`, `gpt4o`, `sonnet45`, `opus4`, `llama31_405b`, `grok4`, etc.
- `defaultJudgeModel`: The model used for LLM-as-judge evaluations (GPT-4o via OpenRouter)
- `benchmarkModels`: Array of all models to test in evaluations
- Model categories: `openaiModels`, `anthropicModels`, `metaModels`, etc.

**Usage:**

```typescript
import { benchmarkModels, gpt4o } from "./models.js";

// All models are pre-configured through OpenRouter
for (const { name, model } of benchmarkModels) {
  // Use model in evaluations
}
```

### `scorers.ts`

Provides reusable scoring functions for evaluating LLM outputs.

**Built-in Scorers:**

- `exactMatch`: Case-insensitive exact match comparison
- `containsAnswer`: Checks if output contains expected substring
- `levenshteinSimilarity`: Measures edit distance similarity
- `scriptureReferenceAccuracy`: Validates Bible reference formatting

**LLM-as-Judge Scorers:**

- `theologicalAccuracyJudge`: Evaluates theological correctness and biblical grounding
- `heresyDetectionJudge`: Detects heretical or unorthodox teachings
- `denominationalBiasDetector`: Measures denominational bias in responses

All LLM-as-judge scorers use:

- AI SDK v5's `generateObject` for structured output
- Zod schemas for validation
- OpenRouter-accessed models (default: GPT-4o)

## OpenRouter Configuration

All models in this project are accessed through OpenRouter:

```typescript
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { wrapAISDKModel } from "evalite/ai-sdk";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Access any model from OpenRouter's catalog
const model = wrapAISDKModel(openrouter.chat("provider/model-name"));
```

**Benefits:**

- One API key for all models
- Access to GPT, Claude, Llama, Grok, Gemini, Mistral, and more
- Pay-as-you-go pricing
- Automatic failover
- See available models: <https://openrouter.ai/docs#models>

## Usage in Evaluations

Import scorers and models in your eval files:

```typescript
import { benchmarkModels, defaultJudgeModel } from "../lib/models.js";
import { theologicalAccuracyJudge, exactMatch } from "../lib/scorers.js";

// Use in evalite() calls
for (const { name, model } of benchmarkModels) {
  evalite(`Test - ${name}`, {
    data: testData,
    task: async (input) => {
      const result = await generateText({ model, prompt: input });
      return result.text;
    },
    scorers: [theologicalAccuracyJudge, exactMatch]
  });
}
```

## Adding New Models

Add any model from OpenRouter's catalog to `models.ts`:

```typescript
// In models.ts
export const newModel = wrapAISDKModel(
  openrouter.chat("provider/model-name")
);

// Add to benchmarkModels
export const benchmarkModels = [
  // ... existing models
  { name: "New Model", model: newModel },
];
```

## Environment Setup

Only one API key needed in `.env`:

```bash
OPENROUTER_API_KEY=your_openrouter_key_here
```

Get your key at: <https://openrouter.ai/keys>
