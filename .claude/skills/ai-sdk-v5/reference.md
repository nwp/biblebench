# AI SDK v5 Reference Guide

Complete API reference for Vercel's AI SDK v5 as used in the BibleBench project.

## Important Version Note

This project uses **AI SDK v5**, not v6. In v6, `generateObject` is deprecated in favor of `generateText` with an `output` parameter. **Do not use v6 patterns** - stick to v5 APIs documented here.

## Core Functions

### generateText

Generates text from an LLM for a given prompt.

```typescript
import { generateText } from "ai";

const result = await generateText({
  model: openai("gpt-4o"),
  prompt: "Your prompt here",
  system: "Optional system instructions",
  maxTokens: 300,
  temperature: 0.7
});
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | LanguageModel | Yes | AI SDK model instance |
| `prompt` | string | Yes* | Single string prompt |
| `messages` | CoreMessage[] | Yes* | Multi-turn conversation (alternative to prompt) |
| `system` | string | No | System instructions |
| `maxTokens` | number | No | Maximum tokens to generate |
| `temperature` | number | No | Randomness (0-1), default varies by model |
| `topP` | number | No | Nucleus sampling parameter |
| `presencePenalty` | number | No | Penalty for token presence (-2 to 2) |
| `frequencyPenalty` | number | No | Penalty for token frequency (-2 to 2) |
| `seed` | number | No | Seed for deterministic generation |
| `stopSequences` | string[] | No | Sequences that stop generation |

*Either `prompt` or `messages` must be provided.

#### Return Value

```typescript
{
  text: string;              // Generated text
  finishReason: string;      // 'stop', 'length', 'content-filter', etc.
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  response: {
    headers: Record<string, string>;
    body: any;
  };
}
```

### generateObject

Generates structured, typed output using a Zod schema.

```typescript
import { generateObject } from "ai";
import { z } from "zod";

const result = await generateObject({
  model: openai("gpt-4o"),
  schema: z.object({
    name: z.string(),
    age: z.number()
  }),
  prompt: "Extract person information: John is 30 years old"
});

// result.object is typed and validated
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | LanguageModel | Yes | AI SDK model instance |
| `schema` | ZodSchema | Yes | Zod schema defining output structure |
| `prompt` | string | Yes* | Single string prompt |
| `messages` | CoreMessage[] | Yes* | Multi-turn conversation |
| `system` | string | No | System instructions |
| `schemaName` | string | No | Name for the schema (helps LLM) |
| `schemaDescription` | string | No | Description of output |
| `maxTokens` | number | No | Maximum tokens to generate |
| `temperature` | number | No | Randomness (0-1) |

#### Return Value

```typescript
{
  object: T;                 // Typed object matching schema
  finishReason: string;      // Why generation stopped
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

## Model Providers

### OpenAI Provider

```typescript
import { openai } from "@ai-sdk/openai";

// Standard models
const gpt4o = openai("gpt-4o");
const gpt4oMini = openai("gpt-4o-mini");
const gpt5 = openai("gpt-5");

// With custom configuration
const customGPT = openai("gpt-4o", {
  user: "user-123",
  // Additional provider-specific options
});
```

**Available Models:**
- `gpt-4o` - Most capable GPT-4 model
- `gpt-4o-mini` - Faster, cheaper GPT-4 variant
- `gpt-5` - Latest flagship model
- `gpt-4-turbo` - Previous generation
- `gpt-3.5-turbo` - Fast, economical option

### Anthropic Provider

```typescript
import { anthropic } from "@ai-sdk/anthropic";

// Claude models
const sonnet45 = anthropic("claude-sonnet-4-5-20250929");
const opus4 = anthropic("claude-opus-4-20250514");
const sonnet35 = anthropic("claude-sonnet-3-5-20241022");
```

**Available Models:**
- `claude-sonnet-4-5-20250929` - Latest Sonnet
- `claude-opus-4-20250514` - Most capable Claude
- `claude-sonnet-3-5-20241022` - Previous Sonnet
- `claude-haiku-3-5-20241022` - Fast, economical

### OpenRouter Provider

OpenRouter provides unified access to hundreds of AI models from multiple providers through a single API.

```typescript
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// Configure OpenRouter provider
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Access chat models
const claudeModel = openrouter.chat("anthropic/claude-3.5-sonnet");
const gpt4Model = openrouter.chat("openai/gpt-4o");
const llamaModel = openrouter.chat("meta-llama/llama-3.1-405b-instruct");
const mistralModel = openrouter.chat("mistralai/mistral-large");

// Access completion models
const completionModel = openrouter.completion("meta-llama/llama-3.1-405b-instruct");
```

**Installation:**
```bash
pnpm add @openrouter/ai-sdk-provider
```

**Benefits:**
- Single API key for hundreds of models
- Access to models from Anthropic, OpenAI, Meta, Mistral, Google, and more
- Pay-as-you-go pricing with transparent per-token costs
- Automatic failover for reliability
- Immediate access to newly released models

**Available Model Catalog:** https://openrouter.ai/docs#models

**Get API Key:** https://openrouter.ai/keys

**Usage with Evalite:**
```typescript
import { wrapAISDKModel } from "evalite/ai-sdk";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Wrap for tracing and caching
const model = wrapAISDKModel(openrouter.chat("anthropic/claude-3.5-sonnet"));
```

### Custom OpenAI-Compatible Providers

```typescript
import { createOpenAI } from "@ai-sdk/openai";

const customProvider = createOpenAI({
  baseURL: "https://api.example.com/v1",
  apiKey: process.env.CUSTOM_API_KEY,
  headers: {
    "Custom-Header": "value"
  }
});

const model = customProvider("model-name");
```

**Example: X.AI (Grok)**

```typescript
const xai = createOpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY,
});

const grok4 = xai("grok-4");
```

## Zod Schema Reference

### Basic Types

```typescript
import { z } from "zod";

// Primitives
z.string()              // String
z.number()              // Number
z.boolean()             // Boolean
z.null()                // null
z.undefined()           // undefined

// Arrays
z.array(z.string())     // Array of strings
z.string().array()      // Alternative syntax

// Objects
z.object({
  name: z.string(),
  age: z.number()
})

// Enums
z.enum(["a", "b", "c"])
z.nativeEnum(MyEnum)

// Literals
z.literal("exact")
```

### Constraints

```typescript
// Strings
z.string().min(5)
z.string().max(100)
z.string().length(10)
z.string().email()
z.string().url()
z.string().uuid()
z.string().regex(/pattern/)

// Numbers
z.number().min(0)
z.number().max(100)
z.number().int()
z.number().positive()
z.number().negative()
z.number().nonnegative()

// Arrays
z.array(z.string()).min(1)
z.array(z.string()).max(10)
z.array(z.string()).length(5)
z.array(z.string()).nonempty()
```

### Optional and Nullable

```typescript
z.string().optional()           // string | undefined
z.string().nullable()           // string | null
z.string().nullish()            // string | null | undefined
z.string().default("default")   // Provides default value
```

### Descriptions (for LLM Guidance)

```typescript
const schema = z.object({
  score: z.number().min(0).max(1)
    .describe("Accuracy score from 0 to 1"),

  category: z.enum(["good", "bad"])
    .describe("Quality category of the response"),

  issues: z.array(z.string())
    .describe("List of specific problems found")
});
```

### Union and Intersection

```typescript
// Union (OR)
z.union([z.string(), z.number()])
z.string().or(z.number())

// Intersection (AND)
z.intersection(
  z.object({ name: z.string() }),
  z.object({ age: z.number() })
)
```

### Advanced Schemas

```typescript
// Nested objects
z.object({
  user: z.object({
    name: z.string(),
    email: z.string().email()
  }),
  settings: z.object({
    theme: z.enum(["light", "dark"]),
    notifications: z.boolean()
  })
})

// Discriminated unions
z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), content: z.string() }),
  z.object({ type: z.literal("number"), value: z.number() })
])

// Records (key-value maps)
z.record(z.string(), z.number())  // { [key: string]: number }

// Tuples
z.tuple([z.string(), z.number(), z.boolean()])
```

## CoreMessage Type

For multi-turn conversations:

```typescript
type CoreMessage = {
  role: "system" | "user" | "assistant";
  content: string;
}

const messages: CoreMessage[] = [
  { role: "system", content: "You are a helpful assistant" },
  { role: "user", content: "Hello!" },
  { role: "assistant", content: "Hi! How can I help?" },
  { role: "user", content: "Tell me about AI" }
];

const result = await generateText({
  model,
  messages
});
```

## Evalite Integration

### wrapAISDKModel

Wraps AI SDK models for automatic tracing and caching.

```typescript
import { wrapAISDKModel } from "evalite/ai-sdk";

const model = wrapAISDKModel(openai("gpt-4o"), {
  caching: true  // Default, can be disabled
});
```

**Features:**
- Automatic tracing of all LLM calls
- Intelligent caching (24-hour TTL)
- Cache key based on model + parameters + prompt
- No-op in production (outside Evalite context)
- Visible in Evalite UI

**Cache Control:**

```typescript
// Disable caching for specific model
const noCacheModel = wrapAISDKModel(
  openai("gpt-4o"),
  { caching: false }
);

// Or use CLI flag
// pnpm eval --no-cache
```

## Error Handling

### Common Error Codes

```typescript
try {
  const result = await generateText({ model, prompt });
} catch (error) {
  switch (error.code) {
    case 'RATE_LIMIT_EXCEEDED':
      // Too many requests
      break;

    case 'CONTEXT_LENGTH_EXCEEDED':
      // Input too long for model
      break;

    case 'CONTENT_FILTER':
      // Content policy violation
      break;

    case 'INSUFFICIENT_QUOTA':
      // API quota exceeded
      break;

    case 'INVALID_API_KEY':
      // Authentication failed
      break;

    default:
      // Other errors
      throw error;
  }
}
```

### Retry Logic

```typescript
async function generateWithRetry(config: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateText(config);
    } catch (error) {
      if (error.code === 'RATE_LIMIT_EXCEEDED' && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

## Performance Optimization

### Token Usage

```typescript
const result = await generateText({
  model,
  prompt,
  maxTokens: 300  // Limit to reduce costs
});

console.log({
  prompt: result.usage.promptTokens,
  completion: result.usage.completionTokens,
  total: result.usage.totalTokens,
  cost: estimateCost(result.usage) // Your cost calculation
});
```

### Temperature Settings

```typescript
// For consistent, deterministic output (evaluations)
temperature: 0.0 to 0.3

// For balanced creativity and consistency
temperature: 0.5 to 0.7

// For creative, varied output
temperature: 0.8 to 1.0
```

### Model Selection

**Choose models based on task:**
- **Simple tasks**: GPT-4o Mini, Claude Haiku (fast, cheap)
- **Complex reasoning**: GPT-4o, Claude Sonnet (balanced)
- **Critical evaluation**: GPT-5, Claude Opus (most capable)
- **LLM-as-judge**: GPT-4o (good balance of quality and cost)

## BibleBench Patterns

### Standard Evaluation Task

```typescript
import { generateText } from "ai";

task: async (input) => {
  const result = await generateText({
    model,
    prompt: `You are a Bible scholar. Answer accurately.\n\n${input}`,
    maxTokens: 300,
    temperature: 0.3  // Lower for consistency
  });
  return result.text;
}
```

### LLM-as-Judge Scorer

```typescript
import { generateObject } from "ai";
import { z } from "zod";

scorer: async ({ input, output, expected }) => {
  const result = await generateObject({
    model: defaultJudgeModel,
    schema: z.object({
      score: z.number().min(0).max(1),
      rationale: z.string(),
      issues: z.array(z.string())
    }),
    prompt: `Evaluate this response...

Input: ${input}
Expected: ${expected}
Output: ${output}`
  });

  return {
    score: result.object.score,
    metadata: {
      rationale: result.object.rationale,
      issues: result.object.issues
    }
  };
}
```

### Multi-Step Judge with Complex Schema

```typescript
const result = await generateObject({
  model: defaultJudgeModel,
  schema: z.object({
    overall_score: z.number().min(0).max(1),
    dimensions: z.object({
      theological_accuracy: z.number().min(0).max(1),
      pastoral_sensitivity: z.number().min(0).max(1),
      biblical_grounding: z.number().min(0).max(1)
    }),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    rationale: z.string()
  }),
  schemaName: "TheologicalEvaluation",
  schemaDescription: "Comprehensive theological response evaluation",
  prompt: evaluationPrompt
});
```

## Environment Setup

### .env Configuration

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# OpenRouter (access to hundreds of models from multiple providers)
OPENROUTER_API_KEY=...

# X.AI (Grok)
XAI_API_KEY=...

# Google (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=...
```

### Accessing in Code

```typescript
// Environment variables are auto-loaded by AI SDK providers
import { openai } from "@ai-sdk/openai";

// Uses process.env.OPENAI_API_KEY automatically
const model = openai("gpt-4o");
```

## Links

- [AI SDK Documentation](https://ai-sdk.dev)
- [AI SDK Core Reference](https://ai-sdk.dev/docs/ai-sdk-core)
- [generateText Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text)
- [generateObject Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-object)
- [Zod Documentation](https://zod.dev)
- [OpenAI Models](https://platform.openai.com/docs/models)
- [Anthropic Models](https://docs.anthropic.com/en/docs/models-overview)
