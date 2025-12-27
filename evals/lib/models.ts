/**
 * Model Configuration Library
 *
 * Provides wrapped AI SDK models for various LLM providers
 * with automatic tracing and caching enabled for Evalite.
 */

import { wrapAISDKModel } from "evalite/ai-sdk";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

/**
 * OpenAI Models
 */
export const gpt5 = wrapAISDKModel(openai("gpt-5"));
export const gpt4o = wrapAISDKModel(openai("gpt-4o"));
export const gpt4oMini = wrapAISDKModel(openai("gpt-4o-mini"));

/**
 * Anthropic Models
 */
export const sonnet45 = wrapAISDKModel(anthropic("claude-sonnet-4-5-20250929"));
export const sonnet35 = wrapAISDKModel(anthropic("claude-sonnet-3-5-20241022"));
export const opus4 = wrapAISDKModel(anthropic("claude-opus-4-20250514"));

/**
 * Note: For Grok and GPT-OSS-120B, you would need to add the appropriate
 * AI SDK providers or use OpenAI-compatible endpoints:
 *
 * import { createOpenAI } from "@ai-sdk/openai";
 *
 * const grok = createOpenAI({
 *   baseURL: "https://api.x.ai/v1",
 *   apiKey: process.env.XAI_API_KEY,
 * });
 *
 * export const grok4 = wrapAISDKModel(grok("grok-4"));
 */

/**
 * Default model for LLM-as-judge evaluations
 * Using GPT-4o for reliable, cost-effective judging
 */
export const defaultJudgeModel = gpt4o;

/**
 * All models to benchmark
 * These will be tested across various theological evaluations
 */
export const benchmarkModels = [
  { name: "GPT-5", model: gpt5 },
  { name: "GPT-4o", model: gpt4o },
  { name: "Claude Sonnet 4.5", model: sonnet45 },
  { name: "Claude Opus 4", model: opus4 },
  { name: "Claude Sonnet 3.5", model: sonnet35 },
  // Add more models as they become available
] as const;
