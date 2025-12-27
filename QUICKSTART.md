# BibleBench Quick Start Guide

Get up and running with BibleBench in 5 minutes!

## Step 1: Install Dependencies

```bash
# Make sure you have Node.js 18+ and pnpm installed
pnpm install
```

## Step 2: Set Up API Keys

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API keys
# At minimum, you need OPENAI_API_KEY for GPT models and the judge
```

Your `.env` should look like:
```env
OPENAI_API_KEY=sk-proj-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

## Step 3: Run Your First Evaluation

```bash
# Run all evaluations with the UI
pnpm eval:dev
```

This will:
1. Start the Evalite development server
2. Run all evaluation suites
3. Open a UI at `http://localhost:3006`

## Step 4: Explore Results

The Evalite UI shows:
- **Overall scores** for each model on each evaluation
- **Detailed breakdowns** by scorer
- **Traces** showing exact inputs/outputs
- **Metadata** with reasoning from LLM-as-judge scorers

## Running Specific Evaluations

```bash
# Run only scripture tests
pnpm eval evals/scripture/

# Run only a specific test file
pnpm eval evals/theology/core-doctrines.eval.ts

# Run without caching (for production)
pnpm eval --no-cache
```

## Understanding the Results

### Score Interpretation

- **1.0** = Perfect score
- **0.7-0.9** = Good, with minor issues
- **0.4-0.6** = Partial correctness
- **0.0-0.3** = Significant problems

### Evaluation Categories

1. **Scripture/Verse Recall**: Tests memorization of verses
2. **Scripture/Reference Knowledge**: Tests knowledge of where verses are found
3. **Scripture/Context Understanding**: Tests understanding of biblical context
4. **Theology/Core Doctrines**: Tests understanding of key Christian doctrines
5. **Theology/Heresy Detection**: Tests ability to identify false teachings
6. **Theology/Denominational Nuance**: Tests fair representation of different traditions
7. **Theology/Pastoral Application**: Tests application of theology to real situations

### Scorers Explained

- **Exact Match**: Binary 0 or 1 (exact text match)
- **Contains**: Binary 0 or 1 (substring match)
- **Levenshtein**: 0-1 similarity based on edit distance
- **Theological Accuracy Judge**: LLM evaluates theological correctness (0-1)
- **Heresy Detection Judge**: LLM detects heterodox teaching (1 = orthodox, 0 = heretical)
- **Custom scorers**: Various domain-specific metrics

## Customizing Tests

### Test Fewer Models

Edit `evals/lib/models.ts` and comment out models you don't want to test:

```typescript
export const benchmarkModels = [
  { name: "GPT-4o", model: gpt4o },
  { name: "Claude Sonnet 4.5", model: sonnet45 },
  // { name: "Claude Opus 4", model: opus4 }, // Commented out
] as const;
```

### Add More Test Cases

Edit any `.eval.ts` file and add to the data array:

```typescript
const verseRecallData = [
  // ... existing test cases
  {
    input: "Your new question",
    expected: "Expected answer",
    reference: "Scripture reference"
  }
];
```

### Change the Judge Model

Edit `evals/lib/models.ts`:

```typescript
// Use a different model for judging
export const defaultJudgeModel = sonnet45; // Instead of gpt4o
```

## Common Issues

### "API key not found"

Make sure your `.env` file has the correct API keys for the models you're testing.

### "Module not found" errors

Run `pnpm install` to ensure all dependencies are installed.

### Slow evaluation

- Use `--no-cache` flag only when needed
- With caching enabled, repeated runs are much faster
- Reduce the number of models in `benchmarkModels`

### High API costs

- Caching helps reduce costs significantly
- Start with just one or two models
- Use smaller/cheaper models as judges (e.g., `gpt4oMini`)

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to add your own evaluations
- Explore the evaluation files in `evals/` to understand the structure
- Customize scorers in `evals/lib/scorers.ts`

## Tips for Best Results

1. **Use caching during development** - It saves time and money
2. **Check the metadata** - LLM-as-judge scorers include detailed rationales
3. **Run multiple times** - Some models have non-deterministic outputs
4. **Compare across models** - The UI makes cross-model comparison easy
5. **Export results** - Use `pnpm eval:ui` to view past results

## Getting Help

- Read the [README.md](README.md) for full documentation
- Check existing [GitHub Issues](https://github.com/yourusername/biblebench/issues)
- Open a new issue for bugs or questions
- See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute

---

Happy evaluating! May your models know their scripture well. 📖
