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
 */
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * OpenAI Models (via OpenRouter)
 * Access OpenAI models through OpenRouter's unified API
 */
export const gpt5 = wrapAISDKModel(openrouter.chat("openai/gpt-5"));
export const gpt4o = wrapAISDKModel(openrouter.chat("openai/gpt-4o"));
export const gpt4oMini = wrapAISDKModel(openrouter.chat("openai/gpt-4o-mini"));

/**
 * Anthropic Models (via OpenRouter)
 * Access Claude models through OpenRouter's unified API
 */
export const sonnet45 = wrapAISDKModel(openrouter.chat("anthropic/claude-sonnet-4.5"));
export const sonnet35 = wrapAISDKModel(openrouter.chat("anthropic/claude-3.5-sonnet"));
export const opus4 = wrapAISDKModel(openrouter.chat("anthropic/claude-opus-4"));
export const haiku35 = wrapAISDKModel(openrouter.chat("anthropic/claude-3.5-haiku"));

/**
 * Meta Models (via OpenRouter)
 * Access Llama models through OpenRouter
 */
export const llama31_405b = wrapAISDKModel(openrouter.chat("meta-llama/llama-3.1-405b-instruct"));
export const llama31_70b = wrapAISDKModel(openrouter.chat("meta-llama/llama-3.1-70b-instruct"));

/**
 * X.AI Models (via OpenRouter)
 * Access Grok models through OpenRouter
 */
export const grok4 = wrapAISDKModel(openrouter.chat("x-ai/grok-beta"));

/**
 * Mistral Models (via OpenRouter)
 * Access Mistral models through OpenRouter
 */
export const mistralLarge = wrapAISDKModel(openrouter.chat("mistralai/mistral-large"));

/**
 * Google Models (via OpenRouter)
 * Access Gemini models through OpenRouter
 */
export const gemini2Flash = wrapAISDKModel(openrouter.chat("google/gemini-2.0-flash-exp:free"));
export const geminiPro15 = wrapAISDKModel(openrouter.chat("google/gemini-pro-1.5"));

/**
 * Default model for LLM-as-judge evaluations
 * Using GPT-4o for reliable, cost-effective judging
 */
export const defaultJudgeModel = gpt4o;

/**
 * All models to benchmark
 * These will be tested across various theological evaluations
 *
 * Note: All models are accessed through OpenRouter, so you only need
 * one API key (OPENROUTER_API_KEY) instead of separate keys for each provider.
 */
export const benchmarkModels = [
  // OpenAI models
  { name: "GPT-5", model: gpt5 },
  { name: "GPT-4o", model: gpt4o },

  // Anthropic models
  { name: "Claude Sonnet 4.5", model: sonnet45 },
  { name: "Claude Opus 4", model: opus4 },
  { name: "Claude Sonnet 3.5", model: sonnet35 },

  // Add more models as needed:
  // { name: "GPT-4o Mini", model: gpt4oMini },
  // { name: "Claude Haiku 3.5", model: haiku35 },
  // { name: "Llama 3.1 405B", model: llama31_405b },
  // { name: "Grok 4", model: grok4 },
  // { name: "Mistral Large", model: mistralLarge },
  // { name: "Gemini 2.0 Flash", model: gemini2Flash },
] as const;

/**
 * Model Categories for Organization
 * You can use these to run evaluations on specific categories
 */
export const openaiModels = [gpt5, gpt4o, gpt4oMini];
export const anthropicModels = [sonnet45, opus4, sonnet35, haiku35];
export const metaModels = [llama31_405b, llama31_70b];
export const xaiModels = [grok4];
export const mistralModels = [mistralLarge];
export const googleModels = [gemini2Flash, geminiPro15];
