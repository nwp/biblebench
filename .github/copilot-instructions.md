# BibleBench – Copilot Instructions

These instructions make AI coding agents productive immediately in this repo.

## Architecture & Intent
- Benchmark suite for LLMs focused on scripture accuracy, theological understanding, and pastoral wisdom.
- Built on **Evalite (TypeScript)** + **AI SDK v5** with models accessed via **OpenRouter**.
- Core library lives in `evals/lib/`:
  - `models.ts`: model provider setup, default judge model, benchmark lists, categories.
  - `scorers.ts`: reusable scorers (rule-based and LLM-as-judge with structured output via Zod).
- Evaluations live in `evals/{scripture,theology}/*.eval.ts` and use `evalite()` to define suites over model sets.

## Key Conventions
- **ES Modules**: use `.js` extensions in relative imports (e.g., `../lib/models.js`).
- **Judge model**: default is `openai/gpt-5-mini` (via OpenRouter) exported as `defaultJudgeModel` from `evals/lib/models.ts`.
- **Structured output**: LLM-as-judge scorers use `generateObject()` with Zod schemas.
- **Rate limits**: free-tier `:free` models are wrapped with an internal delay; long test timeouts configured in `evalite.config.ts`.
- **Model access**: single env var `OPENROUTER_API_KEY` (no per-provider keys).

## Typical Workflows
- Install and type-check:
  - `pnpm install`
  - `pnpm tsc --noEmit`
- Run evaluations:
  - All: `pnpm eval`
  - Dev/watch UI: `pnpm eval:dev` or `pnpm eval:ui`
  - Category: `pnpm eval:scripture` or `pnpm eval:theology`
  - Single file: `pnpm eval evals/scripture/verse-recall.eval.ts`
- Disable caching when needed: `pnpm eval --no-cache`

## How Evaluations Are Structured
- Import models/scorers from `evals/lib/`.
- Define `data` entries containing `input` and `expected`.
- Iterate over `benchmarkModels` or `testModels` and call `evalite()`:
  ```ts
  for (const { name, model } of benchmarkModels) {
    evalite(`Verse Recall - ${name}`, {
      data,
      task: async (input) => (await generateText({ model, prompt: input })).text,
      scorers: [exactMatch, theologicalAccuracyJudge]
    });
  }
  ```

## Library Details Agents Rely On
- `evals/lib/models.ts`
  - OpenRouter provider via `createOpenRouter()` + `wrapAISDKModel()`.
  - `defaultJudgeModel = gpt5Mini` for LLM-as-judge.
  - `benchmarkModels` for full runs; `testModels` for quick runs.
  - Categories like `openaiModels` available for subset runs.
- `evals/lib/scorers.ts`
  - Rule-based: `exactMatch`, `containsAnswer`, `levenshteinSimilarity`, `scriptureReferenceAccuracy`.
  - Judges: `theologicalAccuracyJudge`, `heresyDetectionJudge`, `denominationalBiasDetector`, translation scorers.
  - All judges use Zod schemas and return rationales in `metadata`.

## External Integration
- **AI SDK v5** only; do not apply v6 patterns.
- **OpenRouter** is the sole provider interface (catalog at openrouter.ai). Add models by `openrouter.chat("provider/model")` then include in `benchmarkModels`.

## Gotchas & Debugging
- Missing imports: ensure `.js` suffix in local ESM imports.
- Long runs: free-tier model delays → increase timeouts (already set in `evalite.config.ts`).
- Low scores: inspect scorer `metadata` (judges include rationales and flags).
- Traces/UI: use `pnpm eval:ui` to view prompts, responses, timings, and tokens.

## Safe Changes Agents Can Make
- Add new eval files under `evals/scripture/` or `evals/theology/` following patterns above.
- Add scorers in `evals/lib/scorers.ts` using `createScorer()`.
- Add models in `evals/lib/models.ts` and reference in `benchmarkModels`.
- Update docs in `README.md` and `QUICKSTART.md` for new evaluations or models.

## Environment & Keys
- Required: `OPENROUTER_API_KEY` in `.env`. No other keys needed.

## Example References
- Judge scorer structure: see `evals/lib/scorers.ts` (e.g., `theologicalAccuracyJudge`).
- Model config + judge default: see `evals/lib/models.ts`.
- End-to-end eval pattern: see `evals/scripture/verse-recall.eval.ts` and `evals/theology/pastoral-application.eval.ts`.
