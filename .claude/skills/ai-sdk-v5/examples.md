# AI SDK v5 Examples

Practical examples for using AI SDK v5 in the BibleBench project.

## Example 1: Basic Text Generation

Simple text generation for answering questions.

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const model = openai("gpt-4o");

const result = await generateText({
  model,
  prompt: "Explain the doctrine of the Trinity in 2-3 sentences.",
  maxTokens: 150,
  temperature: 0.7
});

console.log(result.text);
// "The Trinity is the Christian doctrine that God exists as three distinct
// persons - Father, Son, and Holy Spirit - who are coequal and coeternal,
// yet remain one God in essence and substance..."
```

## Example 2: Text Generation with System Instructions

Use system messages to set context and behavior.

```typescript
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const model = anthropic("claude-sonnet-4-5");

const result = await generateText({
  model,
  system: "You are a systematic theologian with expertise in historic Christian doctrine. Provide clear, accurate explanations grounded in scripture and church tradition.",
  prompt: "What is justification by faith?",
  maxTokens: 300,
  temperature: 0.5
});

console.log(result.text);
```

## Example 3: Structured Output with Zod Schema

Generate typed, validated JSON output.

```typescript
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const model = openai("gpt-4o");

const result = await generateObject({
  model,
  schema: z.object({
    verse: z.string().describe("The complete Bible verse"),
    reference: z.string().describe("Book chapter:verse format"),
    theme: z.string().describe("Main theological theme"),
    keywords: z.array(z.string()).describe("Key theological terms")
  }),
  prompt: "Analyze John 3:16"
});

console.log(result.object);
// {
//   verse: "For God so loved the world that he gave his one and only Son...",
//   reference: "John 3:16",
//   theme: "God's love and salvation",
//   keywords: ["love", "salvation", "faith", "eternal life"]
// }
```

## Example 4: LLM-as-Judge for Theological Evaluation

Use structured output to evaluate theological responses.

```typescript
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const judgeModel = openai("gpt-4o");

async function evaluateTheology(question: string, answer: string, expected: string) {
  const result = await generateObject({
    model: judgeModel,
    schema: z.object({
      score: z.number().min(0).max(1)
        .describe("Overall theological accuracy score"),
      orthodox: z.boolean()
        .describe("Whether the response is theologically orthodox"),
      biblical: z.boolean()
        .describe("Whether the response is grounded in scripture"),
      errors: z.array(z.string())
        .describe("Specific theological errors or inaccuracies"),
      rationale: z.string()
        .describe("Detailed explanation of the score")
    }),
    prompt: `You are a theological expert. Evaluate the accuracy of this response.

Question: ${question}

Expected Answer: ${expected}

Student's Response: ${answer}

Evaluate for:
1. Theological orthodoxy (alignment with historic creeds)
2. Biblical accuracy (grounded in scripture)
3. Doctrinal correctness

Provide a score from 0 to 1 where:
- 1.0 = Perfectly accurate and orthodox
- 0.7-0.9 = Mostly correct with minor issues
- 0.4-0.6 = Partially correct with significant gaps
- 0.0-0.3 = Theologically problematic`
  });

  return {
    score: result.object.score,
    metadata: {
      orthodox: result.object.orthodox,
      biblical: result.object.biblical,
      errors: result.object.errors,
      rationale: result.object.rationale
    }
  };
}

// Usage
const evaluation = await evaluateTheology(
  "What is the Trinity?",
  "The Trinity means God is three separate gods.",
  "The Trinity is the doctrine that God exists as three distinct persons in one essence."
);

console.log(evaluation);
// {
//   score: 0.2,
//   metadata: {
//     orthodox: false,
//     biblical: false,
//     errors: ["Describes tritheism, not Trinity", "Confuses persons with separate gods"],
//     rationale: "This answer represents tritheism, a heresy, not the orthodox Trinity..."
//   }
// }
```

## Example 5: Multi-Turn Conversation

Build context across multiple exchanges.

```typescript
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const model = anthropic("claude-sonnet-4-5");

const result = await generateText({
  model,
  messages: [
    {
      role: "system",
      content: "You are a patient Bible teacher helping someone learn theology."
    },
    {
      role: "user",
      content: "What is grace?"
    },
    {
      role: "assistant",
      content: "Grace is God's unmerited favor toward humanity. It means God gives us blessings we don't deserve, primarily salvation through Jesus Christ."
    },
    {
      role: "user",
      content: "How is grace different from mercy?"
    }
  ],
  maxTokens: 200
});

console.log(result.text);
// "Great question! While grace means getting what we don't deserve (God's favor),
// mercy means NOT getting what we do deserve (punishment for sin)..."
```

## Example 6: Wrapped Model for Evalite Integration

Use `wrapAISDKModel` for automatic tracing and caching.

```typescript
import { wrapAISDKModel } from "evalite/ai-sdk";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

// Wrap models for Evalite
const gpt4o = wrapAISDKModel(openai("gpt-4o"));
const sonnet45 = wrapAISDKModel(anthropic("claude-sonnet-4-5"));

// Use normally - tracing and caching happen automatically
const result = await generateText({
  model: gpt4o,
  prompt: "Explain justification by faith",
  maxTokens: 300
});

// Check traces in Evalite UI at http://localhost:3006
// - See exact prompts sent
// - View full responses
// - Monitor token usage
// - Check cache hits/misses
```

## Example 7: Custom Provider (X.AI Grok)

Configure and use OpenAI-compatible custom providers.

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { wrapAISDKModel } from "evalite/ai-sdk";
import { generateText } from "ai";

// Configure X.AI provider
const xai = createOpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY,
});

// Create and wrap model
const grok4 = wrapAISDKModel(xai("grok-4"));

// Use like any other model
const result = await generateText({
  model: grok4,
  prompt: "What is the Gospel?",
  maxTokens: 250
});

console.log(result.text);
```

## Example 8: Error Handling and Retry Logic

Handle common errors gracefully.

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

async function generateWithRetry(
  prompt: string,
  maxRetries = 3
): Promise<string> {
  const model = openai("gpt-4o");

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await generateText({
        model,
        prompt,
        maxTokens: 300
      });
      return result.text;

    } catch (error: any) {
      // Handle rate limiting
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Rate limited. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      // Handle context length
      if (error.code === 'CONTEXT_LENGTH_EXCEEDED') {
        throw new Error(`Prompt too long. Reduce input or maxTokens.`);
      }

      // Handle API key errors
      if (error.code === 'INVALID_API_KEY') {
        throw new Error('Invalid API key. Check .env file.');
      }

      // Re-throw other errors
      throw error;
    }
  }

  throw new Error('Max retries exceeded');
}

// Usage
try {
  const text = await generateWithRetry("Explain the Trinity");
  console.log(text);
} catch (error) {
  console.error('Failed to generate:', error.message);
}
```

## Example 9: Token Usage Tracking

Monitor and optimize token consumption.

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const model = openai("gpt-4o");

const result = await generateText({
  model,
  prompt: "Explain the doctrine of the Trinity in detail.",
  maxTokens: 500
});

// Track usage
const usage = result.usage;
console.log({
  promptTokens: usage.promptTokens,
  completionTokens: usage.completionTokens,
  totalTokens: usage.totalTokens
});

// Estimate cost (example rates)
const COST_PER_1K_INPUT = 0.005;  // $0.005 per 1K input tokens
const COST_PER_1K_OUTPUT = 0.015; // $0.015 per 1K output tokens

const cost = (
  (usage.promptTokens / 1000) * COST_PER_1K_INPUT +
  (usage.completionTokens / 1000) * COST_PER_1K_OUTPUT
);

console.log(`Estimated cost: $${cost.toFixed(4)}`);
```

## Example 10: Complex Nested Schema

Use nested objects for comprehensive evaluations.

```typescript
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const model = openai("gpt-4o");

const result = await generateObject({
  model,
  schema: z.object({
    overall_assessment: z.object({
      score: z.number().min(0).max(1),
      grade: z.enum(["A", "B", "C", "D", "F"]),
      passed: z.boolean()
    }),
    dimensions: z.object({
      theological_accuracy: z.object({
        score: z.number().min(0).max(1),
        notes: z.string()
      }),
      biblical_grounding: z.object({
        score: z.number().min(0).max(1),
        scripture_references: z.array(z.string())
      }),
      pastoral_wisdom: z.object({
        score: z.number().min(0).max(1),
        strengths: z.array(z.string()),
        improvements: z.array(z.string())
      })
    }),
    summary: z.object({
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      recommendations: z.array(z.string())
    }),
    rationale: z.string()
  }),
  schemaName: "ComprehensiveTheologicalEvaluation",
  schemaDescription: "Multi-dimensional evaluation of theological response",
  prompt: `Evaluate this pastoral response comprehensively...

Question: How should I counsel someone struggling with doubt?

Response: Doubt is normal and can strengthen faith when worked through honestly.
Encourage them to bring questions to God in prayer, study scripture together,
and connect with a supportive Christian community. Share stories of biblical
figures who struggled with doubt like Thomas and David. Remind them God is
patient and welcomes honest questions.

Provide detailed evaluation across all dimensions.`
});

console.log(result.object);
// Full typed object with nested structure
```

## Example 11: Temperature Comparison

See how temperature affects output consistency.

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const model = openai("gpt-4o");
const prompt = "List the 5 solas of the Reformation.";

// Low temperature (consistent, deterministic)
const consistent = await generateText({
  model,
  prompt,
  temperature: 0.0,
  maxTokens: 200
});

// Medium temperature (balanced)
const balanced = await generateText({
  model,
  prompt,
  temperature: 0.5,
  maxTokens: 200
});

// High temperature (creative, varied)
const creative = await generateText({
  model,
  prompt,
  temperature: 1.0,
  maxTokens: 200
});

console.log("Consistent (temp=0.0):", consistent.text);
console.log("Balanced (temp=0.5):", balanced.text);
console.log("Creative (temp=1.0):", creative.text);

// For evaluations, use low temperature (0.0-0.3) for reproducibility
// For creative writing, use higher temperature (0.7-1.0)
```

## Example 12: BibleBench Evaluation Pattern

Complete example of an evaluation using AI SDK v5.

```typescript
import { evalite } from "evalite";
import { generateText } from "ai";
import { wrapAISDKModel } from "evalite/ai-sdk";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

// Configure models
const gpt4o = wrapAISDKModel(openai("gpt-4o"));
const sonnet45 = wrapAISDKModel(anthropic("claude-sonnet-4-5"));

const benchmarkModels = [
  { name: "GPT-4o", model: gpt4o },
  { name: "Claude Sonnet 4.5", model: sonnet45 }
];

// Test data
const testData = [
  {
    input: "What is the doctrine of the Trinity?",
    expected: "The Trinity is the Christian doctrine that God exists as three distinct persons..."
  },
  {
    input: "Explain justification by faith.",
    expected: "Justification by faith is the doctrine that sinners are declared righteous..."
  }
];

// Create evaluation for each model
for (const { name, model } of benchmarkModels) {
  evalite(`Doctrine Understanding - ${name}`, {
    data: testData,
    task: async (input) => {
      const result = await generateText({
        model,
        system: "You are a systematic theologian. Provide clear, accurate theological explanations.",
        prompt: input,
        maxTokens: 300,
        temperature: 0.3  // Low for consistency
      });
      return result.text;
    },
    scorers: [
      // Your scorers here
    ]
  });
}
```

## Example 13: Schema Validation and Debugging

Debug schema mismatches.

```typescript
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const model = openai("gpt-4o");

try {
  const result = await generateObject({
    model,
    schema: z.object({
      score: z.number().min(0).max(1),
      category: z.enum(["excellent", "good", "poor"]),
      tags: z.array(z.string()).min(1).max(5)
    }),
    prompt: "Evaluate this response: 'The Trinity is three gods.'",
    schemaName: "Evaluation",
    schemaDescription: "Theological response evaluation with score, category, and relevant tags"
  });

  console.log(result.object);

} catch (error: any) {
  if (error.name === 'ZodError') {
    console.error('Schema validation failed:');
    console.error(error.errors);
    // Try simplifying schema or making prompt more explicit
  } else {
    throw error;
  }
}
```

## Example 14: Deterministic Generation with Seed

Use seed for reproducible outputs (when supported).

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const model = openai("gpt-4o");

// Generate with seed for reproducibility
const result1 = await generateText({
  model,
  prompt: "List 3 core Christian doctrines",
  seed: 12345,
  temperature: 0.0
});

const result2 = await generateText({
  model,
  prompt: "List 3 core Christian doctrines",
  seed: 12345,
  temperature: 0.0
});

console.log(result1.text === result2.text);
// true - same seed + same prompt = same output (when supported by model)
```

## Example 15: Multiple Models in Parallel

Test multiple models efficiently.

```typescript
import { generateText } from "ai";
import { wrapAISDKModel } from "evalite/ai-sdk";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

const models = [
  { name: "GPT-4o", model: wrapAISDKModel(openai("gpt-4o")) },
  { name: "GPT-4o Mini", model: wrapAISDKModel(openai("gpt-4o-mini")) },
  { name: "Claude Sonnet", model: wrapAISDKModel(anthropic("claude-sonnet-4-5")) }
];

const prompt = "Explain the Gospel in one sentence.";

// Run in parallel
const results = await Promise.all(
  models.map(async ({ name, model }) => {
    const result = await generateText({
      model,
      prompt,
      maxTokens: 100
    });
    return { name, text: result.text, tokens: result.usage.totalTokens };
  })
);

// Compare results
results.forEach(({ name, text, tokens }) => {
  console.log(`\n${name} (${tokens} tokens):`);
  console.log(text);
});
```

## Running Examples

```bash
# Save any example to a .ts file
# e.g., example.ts

# Run with tsx or ts-node
npx tsx example.ts

# Or add to an eval file and run with Evalite
pnpm eval:dev
```

## Tips for Effective AI SDK Usage

1. **Use appropriate temperatures**: 0.0-0.3 for evaluations, 0.7+ for creative tasks
2. **Set maxTokens wisely**: Prevent runaway costs and ensure concise responses
3. **Add schema descriptions**: Help LLMs understand expected output structure
4. **Monitor token usage**: Track costs, especially for LLM-as-judge scorers
5. **Handle errors gracefully**: Implement retry logic for rate limits
6. **Use system messages**: Set clear expectations for model behavior
7. **Wrap with Evalite**: Get automatic tracing and caching
8. **Test iteratively**: Start simple, add complexity gradually
9. **Compare models**: Different models excel at different tasks
10. **Cache intelligently**: Use caching during development, disable for production

## Common Patterns

### Pattern 1: Simple Evaluation Task
```typescript
task: async (input) => {
  const result = await generateText({ model, prompt: input });
  return result.text;
}
```

### Pattern 2: LLM-as-Judge Scorer
```typescript
scorer: async ({ output, expected }) => {
  const result = await generateObject({
    model: judgeModel,
    schema: judgmentSchema,
    prompt: `Evaluate: ${output} vs ${expected}`
  });
  return { score: result.object.score, metadata: result.object };
}
```

### Pattern 3: Multi-Dimensional Evaluation
```typescript
const result = await generateObject({
  model,
  schema: z.object({
    scores: z.object({
      accuracy: z.number(),
      clarity: z.number(),
      depth: z.number()
    }),
    overall: z.number()
  }),
  prompt: evaluationPrompt
});
```

These examples cover the most common use cases for AI SDK v5 in the BibleBench project!
