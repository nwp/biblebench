/**
 * Model Configuration Library
 *
 * All models are accessed through OpenRouter for unified API access.
 * OpenRouter provides access to hundreds of models from multiple providers
 * (OpenAI, Anthropic, Meta, Mistral, Google, etc.) through a single API key.
 *
 * Benefits:
 * - Single API key for all models
 * - Pay-as-you-go pricing
 * - Automatic failover
 * - Immediate access to new models
 *
 * Get your API key at: https://openrouter.ai/keys
 */

import { wrapAISDKModel } from "evalite/ai-sdk";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModelV2 } from "@ai-sdk/provider";
import { validateEnvironment, delay } from "./utils.js";
import type { ModelConfig } from "./types.js";

/**
 * Validate environment and get configuration
 */
const envConfig = validateEnvironment();

/**
 * Configure OpenRouter provider
 * Uses OPENROUTER_API_KEY from environment variables
 *
 * The headers help identify this application on OpenRouter's dashboard
 * and in their usage statistics/rankings.
 */
const openrouter = createOpenRouter({
  apiKey: envConfig.openrouterApiKey,
  headers: {
    "HTTP-Referer": "https://github.com/nwp/biblebench", // Your app URL for OpenRouter rankings
    "X-Title": "BibleBench", // Your app name for OpenRouter rankings
  },
});

/**
 * Rate limiter for free tier models
 * Automatically applies delay to models ending with ":free" suffix
 */
let lastRequestTime = 0;
const MIN_DELAY_MS = 3500; // 3.5 seconds between requests (~17 req/min, under the 16-20 limit)

/**
 * Waits for rate limit before allowing the next request
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_DELAY_MS) {
    const waitTime = MIN_DELAY_MS - timeSinceLastRequest;
    await delay(waitTime);
  }

  lastRequestTime = Date.now();
}

/**
 * Wraps a model with rate limiting for free tier models only
 */
function wrapWithRateLimit(modelName: string): LanguageModelV2 {
  const baseModel = openrouter.chat(modelName);
  const originalDoGenerate = baseModel.doGenerate.bind(baseModel);
  const originalDoStream = baseModel.doStream.bind(baseModel);

  const rateLimitedModel: LanguageModelV2 = {
    ...baseModel,
    doGenerate: async (...args: Parameters<typeof baseModel.doGenerate>) => {
      await waitForRateLimit();
      return originalDoGenerate(...args);
    },
    doStream: async (...args: Parameters<typeof baseModel.doStream>) => {
      await waitForRateLimit();
      return originalDoStream(...args);
    },
  };

  return wrapAISDKModel(rateLimitedModel);
}

/**
 * OpenAI Models (via OpenRouter)
 */
export const gpt52 = wrapAISDKModel(openrouter.chat("openai/gpt-5.2"));
export const gpt52Pro = wrapAISDKModel(openrouter.chat("openai/gpt-5.2-pro"));
export const gpt5Nano = wrapAISDKModel(openrouter.chat("openai/gpt-5-nano"));
export const gpt5Mini = wrapAISDKModel(openrouter.chat("openai/gpt-5-mini"));
export const gptOss120b = wrapAISDKModel(openrouter.chat("openai/gpt-oss-120b"));
export const gptOss120bFree = wrapWithRateLimit("openai/gpt-oss-120b:free");
export const gptOss20b = wrapAISDKModel(openrouter.chat("openai/gpt-oss-20b"));

/**
 * Anthropic Models (via OpenRouter)
 */
export const claudeHaiku45 = wrapAISDKModel(openrouter.chat("anthropic/claude-haiku-4.5"));
export const claudeSonnet45 = wrapAISDKModel(openrouter.chat("anthropic/claude-sonnet-4.5"));
export const claudeOpus45 = wrapAISDKModel(openrouter.chat("anthropic/claude-opus-4.5"));

/**
 * X.AI Models (via OpenRouter)
 */
export const grok41Fast = wrapAISDKModel(openrouter.chat("x-ai/grok-4.1-fast"));
export const grok4 = wrapAISDKModel(openrouter.chat("x-ai/grok-4"));

/**
 * Meta Models (via OpenRouter)
 */
export const llama4Maverick = wrapAISDKModel(openrouter.chat("meta-llama/llama-4-maverick"));

/**
 * Google Models (via OpenRouter)
 */
export const gemini3FlashPreview = wrapAISDKModel(openrouter.chat("google/gemini-3-flash-preview"));
export const gemini3ProPreview = wrapAISDKModel(openrouter.chat("google/gemini-3-pro-preview"));

/**
 * Mistral Models (via OpenRouter)
 */
export const mistralLarge2512 = wrapAISDKModel(openrouter.chat("mistralai/mistral-large-2512"));

/**
 * DeepSeek Models (via OpenRouter)
 */
export const deepseekV32 = wrapAISDKModel(openrouter.chat("deepseek/deepseek-v3.2"));

/**
 * Prime Intellect Models (via OpenRouter)
 */
export const intellect3 = wrapAISDKModel(openrouter.chat("prime-intellect/intellect-3"));

/**
 * Zhipu AI Models (via OpenRouter)
 */
export const glm47 = wrapAISDKModel(openrouter.chat("z-ai/glm-4.7"));

/**
 * MiniMax Models (via OpenRouter)
 */
export const minimaxM21 = wrapAISDKModel(openrouter.chat("minimax/minimax-m2.1"));

/**
 * Default model for LLM-as-judge evaluations
 * Using GPT-5 Nano for efficient high-quality judging
 */
export const defaultJudgeModel = gpt5Nano;

/**
 * All models to benchmark
 * These will be tested across various theological evaluations
 *
 * Note: All models are accessed through OpenRouter, so you only need
 * one API key (OPENROUTER_API_KEY) instead of separate keys for each provider.
 */
export const benchmarkModels: readonly ModelConfig[] = [
  // OpenAI models
  { name: "GPT-5.2", model: gpt52, provider: "openai" },
  { name: "GPT-5.2 Pro", model: gpt52Pro, provider: "openai" },
  { name: "GPT-5 Nano", model: gpt5Nano, provider: "openai" },
  { name: "GPT-OSS-120B", model: gptOss120b, provider: "openai" },
  { name: "GPT-OSS-20B", model: gptOss20b, provider: "openai" },

  // Anthropic models
  { name: "Claude Haiku 4.5", model: claudeHaiku45, provider: "anthropic" },
  { name: "Claude Sonnet 4.5", model: claudeSonnet45, provider: "anthropic" },
  { name: "Claude Opus 4.5", model: claudeOpus45, provider: "anthropic" },

  // X.AI models
  { name: "Grok 4.1 Fast", model: grok41Fast, provider: "xai" },
  { name: "Grok 4", model: grok4, provider: "xai" },

  // Meta models
  { name: "Llama 4 Maverick", model: llama4Maverick, provider: "meta" },

  // Google models
  { name: "Gemini 3 Flash Preview", model: gemini3FlashPreview, provider: "google" },
  { name: "Gemini 3 Pro Preview", model: gemini3ProPreview, provider: "google" },

  // Mistral models
  { name: "Mistral Large 2512", model: mistralLarge2512, provider: "mistral" },

  // DeepSeek models
  { name: "DeepSeek V3.2", model: deepseekV32, provider: "deepseek" },

  // Prime Intellect models
  { name: "Intellect-3", model: intellect3, provider: "prime-intellect" },

  // Zhipu AI models
  { name: "GLM-4.7", model: glm47, provider: "zhipu" },

  // MiniMax models
  { name: "MiniMax M2.1", model: minimaxM21, provider: "minimax" },
] as const;

/**
 * Model Categories for Organization
 * You can use these to run evaluations on specific categories
 */
export const openaiModels = [gpt52, gpt52Pro, gpt5Nano, gptOss120b, gptOss20b];
export const anthropicModels = [claudeHaiku45, claudeSonnet45, claudeOpus45];
export const xaiModels = [grok41Fast, grok4];
export const metaModels = [llama4Maverick];
export const googleModels = [gemini3FlashPreview, gemini3ProPreview];
export const mistralModels = [mistralLarge2512];
export const deepseekModels = [deepseekV32];
export const primeIntellectModels = [intellect3];
export const zhipuModels = [glm47];
export const minimaxModels = [minimaxM21];

/**
 * Test subset of models (for quick testing with lower API costs)
 * Using openai/gpt-oss-120b:free for free tier testing
 */
export const testModels: readonly ModelConfig[] = [
  { name: "GPT-OSS-120B:free", model: gptOss120bFree, provider: "openai" },
] as const;

/**
 * Filter models by name based on environment variable
 *
 * Usage:
 *   MODELS="gpt,claude" pnpm eval
 *   MODELS="sonnet" pnpm eval
 *   MODELS="gpt-5.2,opus" pnpm eval:dev
 *
 * Supports:
 * - Comma-separated values: MODELS="gpt,claude"
 * - Case-insensitive partial matching: MODELS="opus" matches "Claude Opus 4.5"
 * - Multiple patterns: MODELS="gpt-5,claude haiku"
 *
 * If MODELS is not set, all benchmarkModels are used.
 */
function getSelectedModels(): readonly ModelConfig[] {
  const modelsEnv = envConfig.modelFilters;

  // If no MODELS env var, return all models
  if (!modelsEnv || modelsEnv.length === 0) {
    return benchmarkModels;
  }

  // Filter models by matching any pattern (case-insensitive partial match)
  const filtered = benchmarkModels.filter(({ name }) => {
    const lowerName = name.toLowerCase();
    return modelsEnv.some((pattern) => lowerName.includes(pattern));
  });

  // Log which models were selected
  if (filtered.length > 0) {
    console.log(`\n🎯 Running with ${filtered.length} selected model(s):`);
    filtered.forEach(({ name, provider }) => {
      const providerTag = provider ? ` [${provider}]` : "";
      console.log(`   - ${name}${providerTag}`);
    });
    console.log("");
  } else {
    const originalPattern = process.env.MODELS || "";
    console.warn(`\n⚠️  Warning: No models matched pattern "${originalPattern}"`);
    console.warn("   Available model names:");
    benchmarkModels.forEach(({ name, provider }) => {
      const providerTag = provider ? ` [${provider}]` : "";
      console.warn(`   - ${name}${providerTag}`);
    });
    console.warn("   Falling back to all models.\n");
    return benchmarkModels;
  }

  return filtered;
}

/**
 * Selected models for evaluation
 *
 * By default, includes all benchmarkModels.
 * Can be filtered using the MODELS environment variable.
 *
 * Examples:
 *   MODELS="gpt" pnpm eval              # Only GPT models
 *   MODELS="claude,grok" pnpm eval      # Claude and Grok models
 *   MODELS="opus" pnpm eval:dev         # Only Opus model
 */
export const selectedModels = getSelectedModels();

