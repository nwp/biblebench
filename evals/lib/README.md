# Evaluation Libraries

This directory contains shared utilities for the BibleBench evaluation suite.

## Files

### `types.ts`

Central type definitions for the entire evaluation system, providing strong type safety across models, scorers, and evaluations.

**Key Types:**

- `BaseTestData`, `ScriptureTestData`, `TheologyTestData`: Test data structures
- `ModelConfig`: Model configuration with metadata
- `ExtendedScorerInput`: Enhanced scorer input with optional metadata fields
- `ScorerResult<TMetadata>`: Typed scorer results
- Metadata types: `TheologicalScorerMetadata`, `HeresyScorerMetadata`, `DenominationalScorerMetadata`, etc.

**Type Guards:**

- `isScriptureTestData()`: Check if data is scripture-specific
- `isTheologyTestData()`: Check if data is theology-specific

### `utils.ts`

Common utility functions used across evaluations and scorers, eliminating code duplication.

**Text Processing:**

- `normalizeText()`: Normalize text for comparison (lowercase, no punctuation)
- `normalizeReference()`: Normalize scripture references
- `extractKeyTerms()`: Extract significant terms from text
- `calculateWordOverlap()`: Calculate word overlap between texts

**Similarity:**

- `levenshteinDistance()`: Calculate edit distance between strings
- `calculateSimilarity()`: Calculate similarity score (0-1) based on edit distance

**Validation:**

- `validateEnvironment()`: Validate required environment variables
- `isValidTranslation()`: Check if string is a valid Bible translation

**Translation Support:**

- `TRANSLATION_MARKERS`: Vocabulary markers for Bible translations (KJV, NIV, ESV, etc.)
- `BibleTranslation`: Type for supported translations

**Helpers:**

- `clamp()`: Clamp number between min and max
- `delay()`: Create delay promise for rate limiting
- `formatScore()`: Format score as percentage string

### `models.ts`

Configures and exports AI SDK models accessed through **OpenRouter** and wrapped with Evalite's tracing and caching functionality.

**Key Features:**

- All models accessed through OpenRouter (single API key)
- Automatic tracing of LLM calls
- Intelligent caching with 24-hour TTL
- Unified access to hundreds of models

**Exports:**

- Individual models: `gpt52`, `gpt51`, `gpt-5-mini`, `gpt-5-nano`, `grok4`, etc.
- `defaultJudgeModel`: The model used for LLM-as-judge evaluations (GPT-5 Mini via OpenRouter)
- `benchmarkModels`: Array of all models to test in evaluations
- Model categories: `openaiModels`, `anthropicModels`, etc.

**Usage:**

```typescript
import { selectedModels } from "./models.js";

// Models are accessed via selectedModels (respects MODELS env var)
// Used in A/B testing with evalite.each()
evalite.each(
  selectedModels.map(({ name, model }) => ({ name, input: { model } }))
)("Evaluation Name", {
  // ... evaluation config
});
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
- OpenRouter-accessed models (default: GPT-5 Mini)

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

Import scorers and models in your eval files using A/B testing:

```typescript
import { evalite } from "evalite";
import { generateText } from "ai";
import { selectedModels } from "../lib/models.js";
import { theologicalAccuracyJudge, exactMatch } from "../lib/scorers.js";

// Use evalite.each() for A/B testing across all models
evalite.each(
  selectedModels.map(({ name, model }) => ({ name, input: { model } }))
)("Test Name", {
  data: async () => testData,
  task: async (input, variant) => {
    const result = await generateText({
      model: variant.input.model,
      prompt: input
    });
    return result.text;
  },
  scorers: [theologicalAccuracyJudge, exactMatch]
});
```

**Benefits of A/B Testing:**
- All models compared side-by-side in a single evaluation
- Per-model scores visible in the UI
- Better for benchmarking and analysis

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
