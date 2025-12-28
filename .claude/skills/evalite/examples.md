# Evalite Examples

Practical examples for common Evalite tasks in the BibleBench project.

## Example 1: Simple Evaluation with Rule-Based Scorer

Create a basic evaluation testing scripture verse recall.

```typescript
import { evalite } from "evalite";
import { generateText } from "ai";
import { benchmarkModels } from "../lib/models.js";

const verseData = [
  {
    input: "Complete: 'For God so loved the world...'",
    expected: "that he gave his one and only Son"
  },
  {
    input: "What does John 3:16 say?",
    expected: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life"
  }
];

for (const { name, model } of benchmarkModels) {
  evalite(`Verse Completion - ${name}`, {
    data: verseData,
    task: async (input) => {
      const result = await generateText({
        model,
        prompt: `Complete this Bible verse accurately:\n\n${input}`,
        maxTokens: 100,
      });
      return result.text;
    },
    scorers: [
      {
        name: "Contains Expected",
        description: "Checks if output contains expected text",
        scorer: ({ output, expected }) => {
          const contains = output.toLowerCase()
            .includes(expected.toLowerCase());
          return {
            score: contains ? 1 : 0,
            metadata: { contains }
          };
        }
      }
    ],
  });
}
```

## Example 2: Reusable Custom Scorer

Create a reusable scorer for word overlap.

**In `evals/lib/scorers.ts`:**

```typescript
import { createScorer } from "evalite";

export const wordOverlapScorer = createScorer<string, string, string>({
  name: "Word Overlap",
  description: "Measures percentage of expected words present in output",
  scorer: ({ output, expected }) => {
    const normalize = (text: string) =>
      text.toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 0);

    const expectedWords = normalize(expected);
    const outputWords = normalize(output);

    const matchedWords = expectedWords.filter(word =>
      outputWords.includes(word)
    );

    const overlap = expectedWords.length > 0
      ? matchedWords.length / expectedWords.length
      : 0;

    return {
      score: overlap,
      metadata: {
        expectedWords: expectedWords.length,
        matchedWords: matchedWords.length,
        overlap
      }
    };
  }
});
```

**Use in evaluation:**

```typescript
import { wordOverlapScorer } from "../lib/scorers.js";

evalite("Test", {
  data: testData,
  task: myTask,
  scorers: [wordOverlapScorer]
});
```

## Example 3: LLM-as-Judge with Structured Output

Create a sophisticated LLM-based judge for theological evaluation.

**In `evals/lib/scorers.ts`:**

```typescript
import { createScorer } from "evalite";
import { generateObject } from "ai";
import { z } from "zod";
import { defaultJudgeModel } from "./models.js";

export const doctrineJudge = createScorer<string, string, string>({
  name: "Doctrine Judge",
  description: "LLM-based evaluation of doctrinal correctness",
  scorer: async ({ input, output, expected }) => {
    const result = await generateObject({
      model: defaultJudgeModel,
      schema: z.object({
        score: z.number().min(0).max(1)
          .describe("Overall doctrinal accuracy score"),
        orthodox: z.boolean()
          .describe("Whether the response is theologically orthodox"),
        biblical: z.boolean()
          .describe("Whether claims are biblically grounded"),
        errors: z.array(z.string())
          .describe("List of doctrinal errors found"),
        rationale: z.string()
          .describe("Detailed explanation of the score")
      }),
      prompt: `You are an expert in Christian theology and doctrine.

Question: ${input}

Expected Answer: ${expected}

LLM's Response: ${output}

Evaluate the LLM's response for:
1. Theological orthodoxy (alignment with historic creeds)
2. Biblical grounding (support from scripture)
3. Doctrinal accuracy (correct representation of beliefs)

Provide a score from 0 to 1, where:
- 1.0 = Perfectly orthodox and accurate
- 0.7-0.9 = Mostly accurate with minor issues
- 0.4-0.6 = Partially correct with significant gaps
- 0.0-0.3 = Theologically problematic or incorrect`
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
});
```

## Example 4: Multiple Complementary Scorers

Use multiple scorers to evaluate different aspects.

```typescript
import { evalite } from "evalite";
import { generateText } from "ai";
import { benchmarkModels } from "../lib/models.js";
import {
  exactMatch,
  containsAnswer,
  levenshteinSimilarity,
  theologicalAccuracyJudge
} from "../lib/scorers.js";

const doctrineData = [
  {
    input: "Explain the doctrine of the Trinity",
    expected: "The Trinity is the Christian doctrine that God exists as three distinct persons (Father, Son, Holy Spirit) who are coequal and coeternal, yet remain one God in essence."
  }
];

for (const { name, model } of benchmarkModels) {
  evalite(`Trinity Understanding - ${name}`, {
    data: doctrineData,
    task: async (input) => {
      const result = await generateText({
        model,
        prompt: `You are a systematic theologian. Explain concisely:\n\n${input}`,
        maxTokens: 300,
      });
      return result.text;
    },
    scorers: [
      // Rule-based quick check
      containsAnswer,

      // Similarity measure
      levenshteinSimilarity,

      // Comprehensive LLM judge
      theologicalAccuracyJudge,

      // Inline custom scorer
      {
        name: "Key Terms",
        description: "Checks for essential theological terms",
        scorer: ({ output }) => {
          const keyTerms = [
            "three persons",
            "one god",
            "father",
            "son",
            "holy spirit",
            "coequal"
          ];

          const outputLower = output.toLowerCase();
          const foundTerms = keyTerms.filter(term =>
            outputLower.includes(term)
          );

          return {
            score: foundTerms.length / keyTerms.length,
            metadata: {
              foundTerms,
              totalTerms: keyTerms.length
            }
          };
        }
      }
    ],
  });
}
```

## Example 5: Adding a New Model

Add support for a new LLM provider.

**In `evals/lib/models.ts`:**

```typescript
import { wrapAISDKModel } from "evalite/ai-sdk";
import { createOpenAI } from "@ai-sdk/openai";

// For OpenAI-compatible APIs (like Grok)
const xai = createOpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY,
});

export const grok4 = wrapAISDKModel(xai("grok-4"));

// Add to benchmark
export const benchmarkModels = [
  { name: "GPT-5", model: gpt5 },
  { name: "Claude Sonnet 4.5", model: sonnet45 },
  { name: "Grok 4", model: grok4 },  // New model
] as const;
```

**In `.env.example`:**

```bash
# Add new API key
XAI_API_KEY=your_xai_api_key_here
```

## Example 6: Evaluation with Metadata

Use metadata to categorize and filter test cases.

```typescript
const theologyData = [
  {
    input: "What is justification by faith?",
    expected: "Justification by faith is the doctrine...",
    category: "soteriology",
    difficulty: "foundational",
    denominational: false
  },
  {
    input: "Explain infant vs. believer baptism",
    expected: "These are two views on baptism...",
    category: "sacraments",
    difficulty: "nuanced",
    denominational: true
  }
];

for (const { name, model } of benchmarkModels) {
  evalite(`Theology - ${name}`, {
    data: theologyData,
    task: async (input) => {
      const result = await generateText({
        model,
        prompt: `Explain theologically:\n\n${input}`,
        maxTokens: 400,
      });
      return result.text;
    },
    scorers: [
      theologicalAccuracyJudge,
      {
        name: "Denominational Balance",
        description: "Checks if denominational questions are answered fairly",
        scorer: ({ output }, testCase: any) => {
          // Only score denominational questions
          if (!testCase.denominational) {
            return { score: 1, metadata: { skipped: true } };
          }

          const outputLower = output.toLowerCase();
          const balanceWords = [
            "both", "different", "various", "some believe",
            "traditions", "perspectives", "views"
          ];

          const foundBalance = balanceWords.filter(word =>
            outputLower.includes(word)
          ).length;

          return {
            score: Math.min(foundBalance / 2, 1),
            metadata: { foundBalance, balanceWords }
          };
        }
      }
    ],
  });
}
```

## Example 7: Debugging with Traces

Access detailed trace information.

```typescript
// Run evaluation
pnpm eval:dev

// In the UI at http://localhost:3006:
// 1. Click on a test case
// 2. View "Traces" tab to see:
//    - Exact prompt sent to model
//    - Full model response
//    - Token usage (input/output/total)
//    - Latency/timing
//    - Cache hit/miss status

// Scorers with rich metadata help debugging:
const debugScorer = createScorer<string, string, string>({
  name: "Debug Scorer",
  scorer: ({ input, output, expected }) => {
    return {
      score: 0.5,
      metadata: {
        inputLength: input.length,
        outputLength: output.length,
        expectedLength: expected.length,
        firstWords: output.split(" ").slice(0, 10).join(" "),
        containsExpected: output.includes(expected)
      }
    };
  }
});
```

## Example 8: Testing with Different Prompts

Compare prompt variations.

```typescript
const prompts = {
  simple: (input: string) => input,
  detailed: (input: string) =>
    `You are a biblical scholar. Answer accurately and concisely.\n\n${input}`,
  strict: (input: string) =>
    `You are a theologian who values precision. Provide an exact, well-sourced answer.\n\n${input}\n\nBe theologically precise and cite relevant scriptures.`
};

for (const [promptName, promptFn] of Object.entries(prompts)) {
  for (const { name, model } of benchmarkModels) {
    evalite(`${promptName} Prompt - ${name}`, {
      data: testData,
      task: async (input) => {
        const result = await generateText({
          model,
          prompt: promptFn(input),
          maxTokens: 300,
        });
        return result.text;
      },
      scorers: [myScorer],
    });
  }
}
```

## Example 9: Conditional Scoring

Score differently based on test case properties.

```typescript
const adaptiveScorer = createScorer<string, string, string>({
  name: "Adaptive Scorer",
  description: "Adjusts scoring based on difficulty",
  scorer: ({ output, expected }, testCase: any) => {
    const difficulty = testCase.difficulty || "medium";

    // Calculate base similarity
    const similarity = calculateSimilarity(output, expected);

    // Adjust threshold based on difficulty
    const threshold = {
      easy: 0.8,      // Require 80% similarity
      medium: 0.6,    // Require 60% similarity
      hard: 0.4       // Require 40% similarity (more lenient)
    }[difficulty] || 0.6;

    const score = similarity >= threshold ? 1 : similarity / threshold;

    return {
      score,
      metadata: {
        difficulty,
        threshold,
        similarity,
        passed: similarity >= threshold
      }
    };
  }
});
```

## Example 10: Full Evaluation File

Complete example of a production-ready evaluation.

**File: `evals/theology/salvation.eval.ts`**

```typescript
/**
 * Salvation Doctrine Evaluation
 *
 * Tests LLMs' understanding of salvation (soteriology) including
 * justification, sanctification, and glorification.
 */

import { evalite } from "evalite";
import { generateText } from "ai";
import { benchmarkModels } from "../lib/models.js";
import {
  theologicalAccuracyJudge,
  heresyDetectionJudge,
  wordOverlapScorer
} from "../lib/scorers.js";

const salvationData = [
  {
    input: "What is justification by faith?",
    expected: "Justification by faith is the doctrine that sinners are declared righteous before God solely through faith in Jesus Christ, not by their own works. It is a legal declaration by God where Christ's righteousness is imputed to believers.",
    category: "justification",
    difficulty: "foundational"
  },
  {
    input: "How do justification and sanctification differ?",
    expected: "Justification is a one-time legal declaration of righteousness, while sanctification is the ongoing process of becoming holy. Justification changes our standing before God; sanctification changes our character and behavior.",
    category: "comparison",
    difficulty: "intermediate"
  },
  {
    input: "Can salvation be lost?",
    expected: "Christians hold different views: Some believe in eternal security (once saved, always saved), while others believe salvation can be lost through apostasy. Both views have biblical arguments and are held within orthodox Christianity, though they differ on the perseverance of the saints.",
    category: "disputed",
    difficulty: "nuanced",
    requiresBalance: true
  }
];

// Run evaluation for each model
for (const { name, model } of benchmarkModels) {
  evalite(`Salvation Doctrine - ${name}`, {
    data: salvationData,
    task: async (input) => {
      const result = await generateText({
        model,
        prompt: `You are a systematic theologian. Explain the following doctrine clearly and accurately, representing diverse Christian perspectives where appropriate.\n\n${input}`,
        maxTokens: 400,
        temperature: 0.3, // Lower temperature for consistency
      });
      return result.text;
    },
    scorers: [
      // LLM-based comprehensive evaluation
      theologicalAccuracyJudge,

      // Check for heresies
      heresyDetectionJudge,

      // Word overlap for quick similarity
      wordOverlapScorer,

      // Check for balanced perspective on disputed topics
      {
        name: "Balanced Perspective",
        description: "For disputed doctrines, checks if multiple views are presented",
        scorer: ({ output }, testCase: any) => {
          if (!testCase.requiresBalance) {
            return { score: 1, metadata: { skipped: true } };
          }

          const indicators = [
            "some believe", "others", "different views",
            "traditions", "perspectives", "both", "various"
          ];

          const outputLower = output.toLowerCase();
          const found = indicators.filter(ind =>
            outputLower.includes(ind)
          ).length;

          return {
            score: Math.min(found / 2, 1),
            metadata: {
              indicators: found,
              isBalanced: found >= 2
            }
          };
        }
      },

      // Check for scripture references
      {
        name: "Scripture References",
        description: "Checks if biblical support is provided",
        scorer: ({ output }) => {
          // Match Bible references like "Romans 3:23" or "1 John 4:8"
          const refPattern = /\b\d?\s?[A-Z][a-z]+\s+\d+:\d+\b/g;
          const matches = output.match(refPattern) || [];

          return {
            score: Math.min(matches.length / 2, 1),
            metadata: {
              references: matches.length,
              examples: matches.slice(0, 3)
            }
          };
        }
      }
    ],
  });
}
```

## Running Examples

```bash
# Run all examples above
pnpm eval:dev

# Run specific example
pnpm eval evals/theology/salvation.eval.ts

# Run without caching (fresh results)
pnpm eval --no-cache evals/theology/salvation.eval.ts

# View results in UI
# Navigate to http://localhost:3006
# - Compare models side-by-side
# - Drill into individual test cases
# - Examine scorer metadata
# - View full traces
```

## Tips for Creating Effective Evaluations

1. **Start simple** - Begin with rule-based scorers, add LLM judges later
2. **Use multiple scorers** - Combine fast rule-based and thorough LLM-based
3. **Add rich metadata** - Helps debugging and understanding scores
4. **Test incrementally** - Add test cases one at a time and verify
5. **Check traces** - Always verify prompts look correct in the UI
6. **Use caching** - Saves time and money during development
7. **Type everything** - TypeScript catches errors early
8. **Export reusable scorers** - Build up a library in `lib/scorers.ts`
