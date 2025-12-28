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

/**
 * Configure OpenRouter provider
 * Uses OPENROUTER_API_KEY from environment variables
 * 
 * The headers help identify this application on OpenRouter's dashboard
 * and in their usage statistics/rankings.
 */
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
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

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_DELAY_MS) {
    const waitTime = MIN_DELAY_MS - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

/**
 * Wraps a model with rate limiting for free tier models only
 */
function wrapWithRateLimit(modelName: string) {
  const model = openrouter.chat(modelName);
  
  return wrapAISDKModel({
    ...model,
    doGenerate: async (...args: Parameters<typeof model.doGenerate>) => {
      await waitForRateLimit();
      return model.doGenerate(...args);
    },
  } as any);
}

/**
 * OpenAI Models (via OpenRouter)
 */
export const gpt52 = wrapAISDKModel(openrouter.chat("openai/gpt-5.2"));
export const gpt51 = wrapAISDKModel(openrouter.chat("openai/gpt-5.1"));
export const gpt5Nano = wrapAISDKModel(openrouter.chat("openai/gpt-5-nano"));
export const gptOss120b = wrapAISDKModel(openrouter.chat("openai/gpt-oss-120b"));
export const gptOss120bFree = wrapWithRateLimit("openai/gpt-oss-120b:free");
export const gptOss20b = wrapAISDKModel(openrouter.chat("openai/gpt-oss-20b"));

/**
 * Anthropic Models (via OpenRouter)
 */
export const claudeHaiku45 = wrapAISDKModel(openrouter.chat("anthropic/claude-haiku-4.5"));

/**
 * X.AI Models (via OpenRouter)
 */
export const grok41Fast = wrapAISDKModel(openrouter.chat("x-ai/grok-4.1-fast"));
export const grok4 = wrapAISDKModel(openrouter.chat("x-ai/grok-4"));

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
 * AllenAI Models (via OpenRouter)
 */
export const olmo3132bThink = wrapAISDKModel(openrouter.chat("allenai/olmo-3.1-32b-think"));

/**
 * NVIDIA Models (via OpenRouter)
 */
export const nemotron3Nano30b = wrapAISDKModel(openrouter.chat("nvidia/nemotron-3-nano-30b-a3b"));

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
 * Using GPT-5.2 for high-quality judging
 */
export const defaultJudgeModel = gpt52;

/**
 * All models to benchmark
 * These will be tested across various theological evaluations
 *
 * Note: All models are accessed through OpenRouter, so you only need
 * one API key (OPENROUTER_API_KEY) instead of separate keys for each provider.
 */
export const benchmarkModels = [
  // OpenAI models
  { name: "GPT-5.2", model: gpt52 },
  { name: "GPT-5.1", model: gpt51 },
  { name: "GPT-5 Nano", model: gpt5Nano },
  { name: "GPT-OSS-120B", model: gptOss120b },
  { name: "GPT-OSS-20B", model: gptOss20b },

  // Anthropic models
  { name: "Claude Haiku 4.5", model: claudeHaiku45 },

  // X.AI models
  { name: "Grok 4.1 Fast", model: grok41Fast },
  { name: "Grok 4", model: grok4 },

  // Google models
  { name: "Gemini 3 Flash Preview", model: gemini3FlashPreview },
  { name: "Gemini 3 Pro Preview", model: gemini3ProPreview },

  // Mistral models
  { name: "Mistral Large 2512", model: mistralLarge2512 },

  // DeepSeek models
  { name: "DeepSeek V3.2", model: deepseekV32 },

  // Prime Intellect models
  { name: "Intellect-3", model: intellect3 },

  // AllenAI models
  { name: "OLMo 3.1 32B Think", model: olmo3132bThink },

  // NVIDIA models
  { name: "Nemotron 3 Nano 30B", model: nemotron3Nano30b },

  // Zhipu AI models
  { name: "GLM-4.7", model: glm47 },

  // MiniMax models
  { name: "MiniMax M2.1", model: minimaxM21 },
] as const;

/**
 * Model Categories for Organization
 * You can use these to run evaluations on specific categories
 */
export const openaiModels = [gpt52, gpt51, gpt5Nano, gptOss120b, gptOss20b];
export const anthropicModels = [claudeHaiku45];
export const xaiModels = [grok41Fast, grok4];
export const googleModels = [gemini3FlashPreview, gemini3ProPreview];
export const mistralModels = [mistralLarge2512];
export const deepseekModels = [deepseekV32];
export const primeIntellectModels = [intellect3];
export const allenaiModels = [olmo3132bThink];
export const nvidiaModels = [nemotron3Nano30b];
export const zhipuModels = [glm47];
export const minimaxModels = [minimaxM21];

/**
 * Test subset of models (for quick testing with lower API costs)
 * Using openai/gpt-oss-120b:free for free tier testing
 */
export const testModels = [
  { name: "GPT-OSS-120B:Free", model: gptOss120bFree },
] as const;

