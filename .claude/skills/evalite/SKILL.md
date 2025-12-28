---
name: evalite
description: Expert at creating and working with Evalite evaluations for AI applications. Use when creating new .eval.ts files, designing scorers, configuring models, debugging evaluation results, or working with AI SDK integration.
allowed-tools: Read, Glob, Grep, Edit, Write
---

# Evalite Skill

You are an expert in Evalite, the TypeScript testing framework for AI-powered applications. You help create evaluations, scorers, and model configurations for testing LLMs.

## When to Use This Skill

Trigger this skill when working on:

- Creating new `.eval.ts` evaluation files
- Designing custom scorers (rule-based, heuristic, or LLM-as-judge)
- Configuring AI SDK models with Evalite integration
- Debugging evaluation results and traces
- Optimizing evaluation performance with caching
- Setting up Evalite in new projects

## Core Evalite Concepts

### 1. Evaluation Structure

Every Evalite evaluation has three components:

```typescript
evalite("Evaluation Name", {
  data: [/* test cases */],
  task: async (input) => {/* LLM task */},
  scorers: [/* scoring functions */]
});
```

### 2. AI SDK v5 Integration

Use `wrapAISDKModel` from `evalite/ai-sdk` for automatic tracing and caching:

```typescript
import { wrapAISDKModel } from "evalite/ai-sdk";
import { openai } from "@ai-sdk/openai";

const model = wrapAISDKModel(openai("gpt-4o"));
```

**Benefits:**

- Automatic tracing of all LLM calls
- Intelligent caching (24-hour TTL)
- No-op in production (safe to keep in code)

### 3. Scorer Types

**Rule-Based Scorers:**

```typescript
scorer: ({ output, expected }) => output === expected ? 1 : 0
```

**LLM-as-Judge Scorers:**

```typescript
scorer: async ({ input, output, expected }) => {
  const result = await generateObject({
    model: judgeModel,
    schema: z.object({
      score: z.number().min(0).max(1),
      rationale: z.string()
    }),
    prompt: `Evaluate...`
  });
  return {
    score: result.object.score,
    metadata: { rationale: result.object.rationale }
  };
}
```

## Project-Specific Context

This BibleBench project uses Evalite to benchmark LLMs on:

- Scripture accuracy (verse recall, references, context)
- Theological understanding (doctrines, heresy detection, nuance)
- Pastoral application (real-world wisdom)

**Key Files:**

- `evals/lib/models.ts` - Wrapped AI SDK models
- `evals/lib/scorers.ts` - Reusable scoring functions
- `evals/scripture/*.eval.ts` - Scripture evaluations
- `evals/theology/*.eval.ts` - Theology evaluations

## Best Practices

1. **Use `createScorer` for reusable scorers** - Import from `evalite`
2. **Return metadata for debugging** - Include rationales, detected issues
3. **Use TypeScript generics** - `createScorer<Input, Output, Expected>`
4. **Enable caching during development** - Saves cost and time
5. **Disable caching for production runs** - Use `--no-cache` flag
6. **Test models in parallel** - Iterate over `benchmarkModels`
7. **Use structured output for LLM judges** - AI SDK's `generateObject` with Zod

## Common Tasks

### Creating a New Evaluation

1. Determine the category (scripture/theology)
2. Define test data with input/expected pairs
3. Import models and scorers from lib/
4. Create task function using `generateText` or `generateObject`
5. Apply multiple complementary scorers
6. Test with `pnpm eval:dev`

### Creating a Custom Scorer

1. Import `createScorer` from `evalite`
2. Define type parameters: `<Input, Output, Expected>`
3. Implement scorer function (0-1 range)
4. Return metadata for debugging
5. Export from `evals/lib/scorers.ts`

### Adding a New Model

1. Import provider from AI SDK
2. Wrap with `wrapAISDKModel`
3. Add to `benchmarkModels` array
4. Ensure API key in `.env`

## Commands

```bash
# Development mode with UI
pnpm eval:dev

# Run all evaluations
pnpm eval

# Run specific file/directory
pnpm eval evals/theology/

# Disable caching
pnpm eval --no-cache

# View results UI
pnpm eval:ui
```

## Debugging

**Check traces in UI:**

- Exact prompts sent to models
- Full responses
- Token usage and timing

**Examine metadata:**

- LLM-as-judge rationales
- Detected issues
- Scoring breakdowns

**Common issues:**

- Missing `.js` extensions in imports (ES modules required)
- API key errors (check `.env`)
- Type mismatches (use proper generics)

## Important Notes

- This project uses **AI SDK v5** (not v6)
- All imports need `.js` extensions (ES modules)
- Caching helps reduce costs significantly
- LLM-as-judge scorers should use `generateObject` with Zod schemas
- The default judge model is `gpt-5-mini` (configured in `models.ts`)

For detailed reference, see `reference.md`.
For examples, see `examples.md`.
