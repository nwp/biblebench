# Evaluation Libraries

This directory contains shared utilities for the BibleBench evaluation suite.

## Files

### `models.ts`
Configures and exports AI SDK models wrapped with Evalite's tracing and caching functionality.

**Exports:**
- Individual models: `gpt5`, `gpt4o`, `sonnet45`, `opus4`, etc.
- `defaultJudgeModel`: The model used for LLM-as-judge evaluations
- `benchmarkModels`: Array of all models to test in evaluations

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

## Usage

Import scorers and models in your eval files:

```typescript
import { benchmarkModels, defaultJudgeModel } from "../lib/models.js";
import { theologicalAccuracyJudge, exactMatch } from "../lib/scorers.js";
```
