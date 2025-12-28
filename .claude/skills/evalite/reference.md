# Evalite Reference Guide

Comprehensive API reference for working with Evalite in the BibleBench project.

## Core API

### `evalite(name, config)`

Creates a new evaluation test suite.

**Parameters:**

- `name` (string): Display name for the evaluation
- `config` (object):
  - `data` (array): Test cases with `input`, `expected`, and optional metadata
  - `task` (async function): Performs the LLM task, receives input, returns output
  - `scorers` (array): Scoring functions to evaluate outputs

**Example:**

```typescript
import { evalite } from "evalite";

evalite("My Evaluation", {
  data: [
    { input: "question", expected: "answer" }
  ],
  task: async (input) => {
    // Perform LLM task
    return output;
  },
  scorers: [myScorer]
});
```

### `createScorer<Input, Output, Expected>(config)`

Creates a reusable scorer function.

**Type Parameters:**

- `Input`: Type of input data
- `Output`: Type of task output
- `Expected`: Type of expected value

**Config Object:**

- `name` (string): Scorer display name
- `description` (string): What the scorer measures
- `scorer` (function): Scoring function

**Scorer Function Receives:**

- `input`: The input from test data
- `output`: The output from task function
- `expected`: The expected value from test data

**Scorer Function Returns:**

- `number` (0-1): Simple score
- `{ score: number, metadata: object }`: Score with debugging info

**Example:**

```typescript
import { createScorer } from "evalite";

export const exactMatch = createScorer<string, string, string>({
  name: "Exact Match",
  description: "Checks for exact string match",
  scorer: ({ output, expected }) => {
    const match = output.toLowerCase() === expected.toLowerCase();
    return {
      score: match ? 1 : 0,
      metadata: { match }
    };
  }
});
```

## AI SDK Integration

### `wrapAISDKModel(model, options?)`

Wraps an AI SDK model for automatic tracing and caching.

**Parameters:**

- `model`: AI SDK model instance
- `options` (optional):
  - `caching` (boolean): Enable/disable caching (default: true)

**Returns:** Wrapped model with tracing and caching

**Example:**

```typescript
import { wrapAISDKModel } from "evalite/ai-sdk";
import { openai } from "@ai-sdk/openai";

export const gpt4o = wrapAISDKModel(openai("gpt-4o"));

// Disable caching for specific model
export const noCacheModel = wrapAISDKModel(
  openai("gpt-4o"),
  { caching: false }
);
```

**Features:**

- Automatic tracing of prompts, responses, tokens, timing
- Intelligent caching with 24-hour TTL
- Cache key based on model + parameters + prompt
- No-op outside Evalite context (safe for production)

## AI SDK v5 Functions

### `generateText(config)`

Generates text from an LLM.

**Config:**

- `model`: Wrapped AI SDK model
- `prompt`: String prompt
- `messages`: Alternative to prompt (CoreMessage[])
- `maxTokens`: Maximum tokens to generate
- `temperature`: Sampling temperature (0-1)
- `system`: System message

**Returns:**

- `text`: Generated text string
- `finishReason`: Why generation stopped
- `usage`: Token usage stats

**Example:**

```typescript
import { generateText } from "ai";

const result = await generateText({
  model: gpt4o,
  prompt: "Explain the Trinity",
  maxTokens: 300,
  temperature: 0.7
});

return result.text;
```

### `generateObject(config)`

Generates structured output using Zod schema.

**Config:**

- `model`: Wrapped AI SDK model
- `schema`: Zod schema for output structure
- `prompt`: String prompt
- `messages`: Alternative to prompt

**Returns:**

- `object`: Parsed object matching schema

**Example:**

```typescript
import { generateObject } from "ai";
import { z } from "zod";

const result = await generateObject({
  model: gpt4o,
  schema: z.object({
    score: z.number().min(0).max(1),
    rationale: z.string(),
    issues: z.array(z.string())
  }),
  prompt: "Evaluate this theological response..."
});

return {
  score: result.object.score,
  metadata: {
    rationale: result.object.rationale,
    issues: result.object.issues
  }
};
```

## Built-in Scorers (from autoevals)

These are available by importing from `autoevals`:

### `Levenshtein({ output, expected })`

Calculates edit distance similarity (0-1).

### `Factuality({ output, expected, input })`

LLM-based factuality assessment.

### Other Available Scorers

- `AnswerCorrectness`
- `AnswerRelevancy`
- `AnswerSimilarity`
- `ContextRecall`
- `Faithfulness`

**Example:**

```typescript
import { Levenshtein } from "autoevals";

export const levenshteinScorer = createScorer({
  name: "Levenshtein",
  scorer: ({ output, expected }) => {
    return Levenshtein({ output, expected });
  }
});
```

## Project-Specific Patterns

### Model Configuration Pattern

In `evals/lib/models.ts`:

```typescript
import { wrapAISDKModel } from "evalite/ai-sdk";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

// Wrap individual models
export const gpt5 = wrapAISDKModel(openai("gpt-5"));
export const sonnet45 = wrapAISDKModel(anthropic("claude-sonnet-4-5"));

// Default judge model
export const defaultJudgeModel = gpt5Mini;

// Models to benchmark
export const benchmarkModels = [
  { name: "GPT-5", model: gpt5 },
  { name: "Claude Sonnet 4.5", model: sonnet45 },
] as const;
```

### LLM-as-Judge Pattern

In `evals/lib/scorers.ts`:

```typescript
import { createScorer } from "evalite";
import { generateObject } from "ai";
import { z } from "zod";
import { defaultJudgeModel } from "./models.js";

export const theologicalAccuracyJudge = createScorer<string, string, string>({
  name: "Theological Accuracy Judge",
  description: "Evaluates theological correctness",
  scorer: async ({ input, output, expected }) => {
    const result = await generateObject({
      model: defaultJudgeModel,
      schema: z.object({
        score: z.number().min(0).max(1),
        doctrinally_sound: z.boolean(),
        rationale: z.string()
      }),
      prompt: `You are a theology expert...

Question: ${input}
Expected: ${expected}
Response: ${output}

Evaluate the response...`
    });

    return {
      score: result.object.score,
      metadata: {
        doctrinally_sound: result.object.doctrinally_sound,
        rationale: result.object.rationale
      }
    };
  }
});
```

### Evaluation File Pattern

In `evals/theology/*.eval.ts`:

```typescript
import { evalite } from "evalite";
import { generateText } from "ai";
import { benchmarkModels } from "../lib/models.js";
import { myScorer } from "../lib/scorers.js";

const testData = [
  {
    input: "What is the Trinity?",
    expected: "God exists as three persons...",
    metadata: { difficulty: "foundational" }
  }
];

// Test each model
for (const { name, model } of benchmarkModels) {
  evalite(`Category - ${name}`, {
    data: testData,
    task: async (input) => {
      const result = await generateText({
        model,
        prompt: `You are a theologian. ${input}`,
        maxTokens: 400,
      });
      return result.text;
    },
    scorers: [
      myScorer,
      // Additional scorers
    ],
  });
}
```

## Environment Variables

Required in `.env`:

```bash
# OpenAI (for GPT models and default judge)
OPENAI_API_KEY=sk-proj-...

# Anthropic (for Claude models)
ANTHROPIC_API_KEY=sk-ant-...

# Additional providers as needed
```

## CLI Commands

```bash
# Development mode with live UI
pnpm eval:dev

# Run all evaluations
pnpm eval

# Run specific file
pnpm eval evals/theology/core-doctrines.eval.ts

# Run specific directory
pnpm eval evals/scripture/

# Disable caching (for production runs)
pnpm eval --no-cache

# View results UI (past runs)
pnpm eval:ui
```

## Configuration

### `evalite.config.ts`

```typescript
import { defineConfig } from "evalite";

export default defineConfig({
  // Caching enabled by default
  // Override with --no-cache flag
});
```

### `tsconfig.json`

Must use ES modules:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "type": "module"
  }
}
```

### `package.json`

Must include:

```json
{
  "type": "module",
  "scripts": {
    "eval:dev": "evalite watch",
    "eval": "evalite run",
    "eval:ui": "evalite ui"
  }
}
```

## Common Issues and Solutions

### Import Errors

**Problem:** `Cannot find module` errors

**Solution:** Ensure `.js` extensions on all imports (ES modules requirement):

```typescript
// ✓ Correct
import { models } from "../lib/models.js";

// ✗ Wrong
import { models } from "../lib/models";
```

### API Key Errors

**Problem:** `API key not found`

**Solution:**

1. Create `.env` file from `.env.example`
2. Add required API keys
3. Ensure keys for models being tested

### Type Errors

**Problem:** Type mismatches in scorers

**Solution:** Use proper generics:

```typescript
// Match your data types
createScorer<string, string, string>({
  // input, output, expected are all strings
});
```

### Low Scores

**Problem:** Unexpectedly low evaluation scores

**Solution:**

1. Check traces in UI to see exact prompts/responses
2. Verify expected answers are correct
3. Adjust prompts for clarity
4. Consider if scorer is too strict

### Caching Issues

**Problem:** Changes not reflected in results

**Solution:** Use `--no-cache` flag:

```bash
pnpm eval --no-cache
```

## Performance Optimization

### Caching Strategy

- **Development:** Keep caching enabled (default)
- **Production:** Disable with `--no-cache`
- **Cache duration:** 24 hours
- **Cache key:** Model + parameters + prompt

### Model Selection

- **Judge model:** Balance cost vs. quality
- **Benchmark models:** Start with few, expand later
- **Test data:** Start small, iterate, then expand

### Parallel Execution

Models are tested in sequence within the loop, but you can structure data for efficient testing:

```typescript
// Tests all models across all test cases
for (const { name, model } of benchmarkModels) {
  evalite(`Test - ${name}`, {
    data: testData, // All test cases
    task: async (input) => { /* ... */ },
    scorers: [/* ... */]
  });
}
```

## Links

- [Evalite Documentation](https://evalite.dev)
- [AI SDK Documentation](https://sdk.vercel.ai)
- [Autoevals Library](https://github.com/braintrustdata/autoevals)
- [Zod Schema Validation](https://zod.dev)
