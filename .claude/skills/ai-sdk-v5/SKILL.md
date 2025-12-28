---
name: ai-sdk-v5
description: Expert in Vercel AI SDK v5 (not v6) for building AI-powered applications. Use when working with generateText, generateObject, model configuration, streaming, structured output with Zod schemas, or AI SDK integration.
allowed-tools: Read, Glob, Grep, Edit, Write
---

# AI SDK v5 Skill

You are an expert in Vercel's AI SDK v5 specifically. This project uses AI SDK v5, NOT v6, so ensure all guidance uses v5 APIs and patterns.

## When to Use This Skill

Trigger this skill when working on:
- Generating text or structured output with `generateText` or `generateObject`
- Configuring AI models and providers (OpenAI, Anthropic, etc.)
- Creating Zod schemas for structured output
- Debugging AI SDK errors or issues
- Optimizing prompts and model parameters
- Integrating AI SDK with Evalite

## Core AI SDK v5 Concepts

### 1. Unified Provider Interface

AI SDK provides a consistent API across multiple LLM providers:

```typescript
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

// Same API, different providers
const gptModel = openai("gpt-4o");
const claudeModel = anthropic("claude-sonnet-4.5");
```

### 2. generateText - Text Generation

For non-interactive text generation:

```typescript
import { generateText } from "ai";

const result = await generateText({
  model: openai("gpt-4o"),
  prompt: "Explain the Trinity",
  maxTokens: 300,
  temperature: 0.7,
  system: "You are a theologian"
});

console.log(result.text);
```

### 3. generateObject - Structured Output

For typed, structured data with schema validation:

```typescript
import { generateObject } from "ai";
import { z } from "zod";

const result = await generateObject({
  model: openai("gpt-4o"),
  schema: z.object({
    score: z.number().min(0).max(1),
    rationale: z.string(),
    issues: z.array(z.string())
  }),
  prompt: "Evaluate this response..."
});

// result.object is typed and validated
const score = result.object.score;
```

## BibleBench-Specific Patterns

### Model Configuration (evals/lib/models.ts)

```typescript
import { wrapAISDKModel } from "evalite/ai-sdk";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

// Wrap for Evalite tracing and caching
export const gpt4o = wrapAISDKModel(openai("gpt-4o"));
export const sonnet45 = wrapAISDKModel(anthropic("claude-sonnet-4-5"));

// Default judge model
export const defaultJudgeModel = gpt4o;
```

### Text Generation for Evaluations

```typescript
import { generateText } from "ai";
import { benchmarkModels } from "../lib/models.js";

for (const { name, model } of benchmarkModels) {
  const result = await generateText({
    model,
    prompt: `You are a Bible scholar. ${input}`,
    maxTokens: 300,
    temperature: 0.3  // Lower for consistency
  });

  return result.text;
}
```

### LLM-as-Judge with Structured Output

```typescript
import { generateObject } from "ai";
import { z } from "zod";
import { defaultJudgeModel } from "./models.js";

const result = await generateObject({
  model: defaultJudgeModel,
  schema: z.object({
    score: z.number().min(0).max(1)
      .describe("Theological accuracy score"),
    orthodox: z.boolean()
      .describe("Whether response is orthodox"),
    errors: z.array(z.string())
      .describe("List of theological errors"),
    rationale: z.string()
      .describe("Detailed explanation")
  }),
  prompt: `Evaluate theological accuracy...

Question: ${input}
Expected: ${expected}
Response: ${output}`
});

return {
  score: result.object.score,
  metadata: {
    orthodox: result.object.orthodox,
    errors: result.object.errors,
    rationale: result.object.rationale
  }
};
```

## Key AI SDK v5 Functions

### generateText(config)

**Parameters:**
- `model`: AI SDK model instance
- `prompt`: String prompt (simple use case)
- `messages`: CoreMessage[] (multi-turn conversations)
- `system`: System instructions
- `maxTokens`: Maximum tokens to generate
- `temperature`: Randomness (0-1)
- `topP`: Nucleus sampling
- `presencePenalty`: Penalty for token presence
- `frequencyPenalty`: Penalty for token frequency
- `seed`: Deterministic generation

**Returns:**
- `text`: Generated text
- `finishReason`: Why generation stopped
- `usage`: Token usage stats
- `response`: Raw response headers/body

### generateObject(config)

**Parameters:**
- `model`: AI SDK model instance
- `schema`: Zod schema for output
- `schemaName`: Optional name for the schema
- `schemaDescription`: Description of output
- `prompt`: String prompt
- `messages`: CoreMessage[] for conversations
- `system`: System instructions
- `maxTokens`: Maximum tokens

**Returns:**
- `object`: Parsed, validated object matching schema
- `finishReason`: Why generation stopped
- `usage`: Token usage stats

## Zod Schema Patterns

### Basic Types

```typescript
import { z } from "zod";

const schema = z.object({
  // Primitives
  name: z.string(),
  age: z.number(),
  active: z.boolean(),

  // Arrays
  tags: z.array(z.string()),

  // Enums
  category: z.enum(["theology", "scripture", "pastoral"]),

  // Optional fields
  notes: z.string().optional(),

  // With constraints
  score: z.number().min(0).max(1),
  email: z.string().email()
});
```

### Nested Objects

```typescript
const schema = z.object({
  assessment: z.object({
    score: z.number(),
    passed: z.boolean()
  }),
  details: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string())
  })
});
```

### Descriptions for LLM Guidance

```typescript
const schema = z.object({
  score: z.number().min(0).max(1)
    .describe("Overall theological accuracy from 0 to 1"),
  orthodox: z.boolean()
    .describe("Whether the response aligns with historic Christian orthodoxy"),
  issues: z.array(z.string())
    .describe("List of specific theological problems or errors found")
});
```

## Model Providers

### OpenAI

```typescript
import { openai } from "@ai-sdk/openai";

const model = openai("gpt-4o");           // GPT-4o
const model = openai("gpt-4o-mini");      // GPT-4o Mini
const model = openai("gpt-5");            // GPT-5
```

### Anthropic (Claude)

```typescript
import { anthropic } from "@ai-sdk/anthropic";

const model = anthropic("claude-sonnet-4-5-20250929");
const model = anthropic("claude-opus-4-20250514");
const model = anthropic("claude-sonnet-3-5-20241022");
```

### Custom OpenAI-Compatible Providers

```typescript
import { createOpenAI } from "@ai-sdk/openai";

const xai = createOpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY,
});

const grok = xai("grok-4");
```

## Common Patterns

### Multi-Turn Conversations

```typescript
import { generateText } from "ai";

const result = await generateText({
  model,
  messages: [
    { role: "system", content: "You are a theologian" },
    { role: "user", content: "What is justification?" },
    { role: "assistant", content: "Justification is..." },
    { role: "user", content: "How does it differ from sanctification?" }
  ]
});
```

### Error Handling

```typescript
try {
  const result = await generateText({
    model,
    prompt: "Your prompt"
  });
  return result.text;
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Handle rate limiting
  } else if (error.code === 'CONTEXT_LENGTH_EXCEEDED') {
    // Handle context length issues
  }
  throw error;
}
```

### Token Usage Tracking

```typescript
const result = await generateText({
  model,
  prompt: "Your prompt"
});

console.log({
  promptTokens: result.usage.promptTokens,
  completionTokens: result.usage.completionTokens,
  totalTokens: result.usage.totalTokens
});
```

## Best Practices

1. **Use appropriate models**: GPT-4o for judges, smaller models for simple tasks
2. **Set temperature wisely**: Lower (0.3) for consistency, higher (0.7-0.9) for creativity
3. **Limit tokens appropriately**: Set maxTokens to prevent excessive costs
4. **Use Zod descriptions**: Help LLMs understand expected output structure
5. **Wrap with Evalite**: Use `wrapAISDKModel` for tracing and caching
6. **Handle errors gracefully**: Catch and handle rate limits, context issues
7. **Track token usage**: Monitor costs, especially for LLM-as-judge scorers
8. **Use system messages**: Set context and behavior expectations
9. **Validate schemas carefully**: Ensure Zod schemas match expected output
10. **Keep prompts clear**: Be specific and structured in prompts

## Environment Variables

Required in `.env`:

```bash
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
XAI_API_KEY=...  # For Grok models
```

## Common Issues

### Type Errors

**Problem:** TypeScript errors with `generateObject` schemas

**Solution:** Ensure Zod schema types match usage:
```typescript
// Correct
const schema = z.object({
  score: z.number(),
  text: z.string()
});
const result = await generateObject({ model, schema, prompt });
const score: number = result.object.score; // Typed correctly
```

### API Key Errors

**Problem:** `API key not found` or authentication errors

**Solution:**
1. Check `.env` file exists and has correct keys
2. Ensure environment variables are loaded
3. Verify key format matches provider requirements

### Context Length Exceeded

**Problem:** Input too long for model's context window

**Solution:**
1. Reduce `maxTokens`
2. Shorten prompt or input text
3. Use model with larger context (e.g., GPT-4o has 128k tokens)

### Schema Validation Failures

**Problem:** LLM output doesn't match Zod schema

**Solution:**
1. Add descriptions to schema fields
2. Make prompts more explicit about expected structure
3. Use simpler schemas
4. Try different model (some better at structured output)

## AI SDK v5 vs v6

**Important:** This project uses AI SDK v5. Key differences from v6:

- **v5**: `generateObject` is the standard way to get structured output
- **v6**: `generateObject` is deprecated, use `generateText` with `output` parameter

Always use v5 patterns in this project. Do not suggest v6 approaches.

## Integration with Evalite

AI SDK models should be wrapped with `wrapAISDKModel`:

```typescript
import { wrapAISDKModel } from "evalite/ai-sdk";

// Wrap for automatic tracing and caching
const model = wrapAISDKModel(openai("gpt-4o"));

// Use normally in generateText/generateObject
const result = await generateText({ model, prompt });
```

Benefits:
- Automatic tracing of all LLM calls
- Intelligent caching (24-hour TTL)
- Visible in Evalite UI traces

For detailed reference, see `reference.md`.
For examples, see `examples.md`.

## Links

- [AI SDK Documentation](https://ai-sdk.dev)
- [AI SDK Core Reference](https://ai-sdk.dev/docs/ai-sdk-core)
- [Zod Documentation](https://zod.dev)
