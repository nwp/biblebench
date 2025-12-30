/**
 * Shared Utility Functions
 *
 * Common utilities used across evaluations and scorers.
 * Centralizes text processing, normalization, and validation logic.
 */

import { generateText } from "ai";
import type { LanguageModelV2 } from "@ai-sdk/provider";
import type { EnvironmentConfig } from "./types.js";

/**
 * Normalizes text for comparison by removing punctuation and standardizing whitespace
 *
 * @param text - Text to normalize
 * @returns Normalized text (lowercase, no punctuation, single spaces)
 *
 * @example
 * normalizeText("Hello, World!") // "hello world"
 * normalizeText("  Multiple   spaces  ") // "multiple spaces"
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,;:!?"'–—]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes scripture references for comparison
 * Handles variations in formatting (colons vs periods, spacing)
 *
 * @param reference - Scripture reference to normalize
 * @returns Normalized reference
 *
 * @example
 * normalizeReference("John 3:16") // "john 3:16"
 * normalizeReference("John 3.16") // "john 3:16"
 * normalizeReference("  John  3 : 16  ") // "john 3:16"
 */
export function normalizeReference(reference: string): string {
  return reference
    .replace(/[.:]/g, ":")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Calculates Levenshtein distance between two strings
 * Measures the minimum number of single-character edits needed to transform one string into another
 *
 * @param a - First string
 * @param b - Second string
 * @returns Edit distance
 *
 * @example
 * levenshteinDistance("kitten", "sitting") // 3
 * levenshteinDistance("hello", "hello") // 0
 */
export function levenshteinDistance(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;

  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  const matrix: number[][] = Array(bLen + 1)
    .fill(null)
    .map(() => Array(aLen + 1).fill(0));

  for (let i = 0; i <= aLen; i++) matrix[0][i] = i;
  for (let j = 0; j <= bLen; j++) matrix[j][0] = j;

  for (let j = 1; j <= bLen; j++) {
    for (let i = 1; i <= aLen; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }

  return matrix[bLen][aLen];
}

/**
 * Calculates similarity score based on Levenshtein distance
 *
 * @param a - First string
 * @param b - Second string
 * @returns Similarity score from 0 to 1 (1 = identical)
 *
 * @example
 * calculateSimilarity("hello", "hello") // 1.0
 * calculateSimilarity("hello", "hallo") // 0.8
 */
export function calculateSimilarity(a: string, b: string): number {
  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

/**
 * Extracts key terms from text, filtering out common words
 * Used for comparing semantic content
 *
 * @param text - Text to extract terms from
 * @returns Array of significant terms
 *
 * @example
 * extractKeyTerms("The Trinity is God in three persons")
 * // ["trinity", "three", "persons"]
 */
export function extractKeyTerms(text: string): string[] {
  const commonWords = new Set([
    "the",
    "is",
    "are",
    "and",
    "or",
    "but",
    "in",
    "of",
    "to",
    "a",
    "that",
    "this",
    "it",
    "by",
    "for",
    "with",
    "as",
    "not",
    "be",
    "from",
    "at",
    "on",
    "was",
    "were",
    "been",
    "has",
    "have",
    "had",
  ]);

  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3 && !commonWords.has(word));
}

/**
 * Calculates word overlap between two texts
 *
 * @param text1 - First text
 * @param text2 - Second text
 * @returns Object with overlap statistics
 *
 * @example
 * calculateWordOverlap("the cat sat", "the dog sat")
 * // { overlap: 0.667, matchedWords: 2, totalWords: 3 }
 */
export function calculateWordOverlap(
  text1: string,
  text2: string
): {
  overlap: number;
  matchedWords: number;
  totalWords: number;
} {
  const words1 = normalizeText(text1).split(" ");
  const words2 = normalizeText(text2).split(" ");

  const matchedWords = words1.filter((word) => words2.includes(word)).length;
  const totalWords = words1.length;
  const overlap = totalWords === 0 ? 0 : matchedWords / totalWords;

  return { overlap, matchedWords, totalWords };
}

/**
 * Validates and retrieves environment configuration
 * Throws descriptive errors if required values are missing
 *
 * @returns Environment configuration
 * @throws Error if OPENROUTER_API_KEY is not set
 *
 * @example
 * const config = validateEnvironment()
 * console.log(config.openrouterApiKey) // "sk-or-..."
 */
export function validateEnvironment(): EnvironmentConfig {
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;

  if (!openrouterApiKey) {
    throw new Error(
      "Missing required environment variable: OPENROUTER_API_KEY\n" +
        "Get your API key at: https://openrouter.ai/keys\n" +
        "Set it in your .env file: OPENROUTER_API_KEY=your-key-here"
    );
  }

  const modelFilters = process.env.MODELS
    ? process.env.MODELS.split(",").map((s) => s.trim().toLowerCase())
    : undefined;

  return {
    openrouterApiKey,
    modelFilters,
  };
}

/**
 * Clamps a number between min and max values
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 *
 * @example
 * clamp(1.5, 0, 1) // 1.0
 * clamp(-0.5, 0, 1) // 0.0
 * clamp(0.5, 0, 1) // 0.5
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Safely parses a number, returning a default value if parsing fails
 *
 * @param value - Value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed number or default
 *
 * @example
 * safeParseNumber("42", 0) // 42
 * safeParseNumber("invalid", 0) // 0
 * safeParseNumber(undefined, 10) // 10
 */
export function safeParseNumber(
  value: string | undefined,
  defaultValue: number
): number {
  if (!value) return defaultValue;
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Creates a delay promise for rate limiting
 *
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 *
 * @example
 * await delay(1000) // Wait 1 second
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Formats a score as a percentage string
 *
 * @param score - Score between 0 and 1
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage
 *
 * @example
 * formatScore(0.856) // "85.6%"
 * formatScore(0.856, 0) // "86%"
 */
export function formatScore(score: number, decimals: number = 1): string {
  return `${(score * 100).toFixed(decimals)}%`;
}

/**
 * Translation-specific vocabulary markers
 * Maps Bible translation abbreviations to characteristic words and phrases
 */
export const TRANSLATION_MARKERS = {
  KJV: {
    positive: [
      "thee",
      "thou",
      "thy",
      "thine",
      "saith",
      "unto",
      "ye",
      "hath",
      "doth",
      "begotten",
      "whosoever",
    ],
    negative: ["you", "your", "says", "declares", "to", "will be"],
  },
  NKJV: {
    positive: ["you", "your", "begotten"],
    negative: ["thee", "thou", "thy"],
  },
  NIV: {
    positive: ["one and only", "will be", "declares", "you", "your"],
    negative: ["thee", "thou", "begotten", "saith"],
  },
  ESV: {
    positive: ["should", "will", "only son"],
    negative: ["thee", "thou", "begotten"],
  },
  NASB: {
    positive: ["him who", "through him"],
    negative: ["thee", "thou"],
  },
  NLT: {
    positive: ["says the", "like this", "you", "your"],
    negative: ["thee", "thou", "saith", "declares"],
  },
  CSB: {
    positive: ["do not", "will", "you"],
    negative: ["thee", "thou", "saith"],
  },
} as const;

/**
 * Type for supported Bible translations
 */
export type BibleTranslation = keyof typeof TRANSLATION_MARKERS;

/**
 * Checks if a string is a valid Bible translation abbreviation
 *
 * @param translation - Translation code to check
 * @returns True if valid translation
 */
export function isValidTranslation(
  translation: string
): translation is BibleTranslation {
  return translation in TRANSLATION_MARKERS;
}

/**
 * Fault-tolerant wrapper for generateText that handles API failures gracefully
 *
 * When a model fails (API errors, rate limits, etc.), this function:
 * - Retries with exponential backoff (3 attempts)
 * - Returns a fallback error message instead of crashing
 * - Logs the error for debugging
 *
 * This prevents individual model failures from crashing entire eval runs.
 *
 * @param model - The language model to use
 * @param prompt - The prompt to generate text from
 * @param options - Optional configuration (system prompt, maxRetries)
 * @returns Generated text or error fallback
 *
 * @example
 * const result = await safeGenerateText(model, "Question: ...")
 * // If model fails after retries: "[MODEL_ERROR: Provider returned error]"
 *
 * @example
 * const result = await safeGenerateText(model, "Question: ...", { system: "You are a theologian" })
 */
export async function safeGenerateText(
  model: LanguageModelV2,
  prompt: string,
  options?: { system?: string; maxRetries?: number }
): Promise<string> {
  const maxRetries = options?.maxRetries ?? 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await generateText({
        model,
        prompt,
        ...(options?.system && { system: options.system }),
        maxRetries: 2, // AI SDK internal retries
      });
      return result.text;
    } catch (error) {
      lastError = error as Error;

      // Log the error for debugging
      console.error(
        `[Attempt ${attempt + 1}/${maxRetries}] Model generation failed:`,
        error instanceof Error ? error.message : String(error)
      );

      // Wait before retrying (exponential backoff: 1s, 2s, 4s)
      if (attempt < maxRetries - 1) {
        const delayMs = Math.pow(2, attempt) * 1000;
        await delay(delayMs);
      }
    }
  }

  // All retries failed - return error message instead of crashing
  const errorMessage = lastError instanceof Error
    ? lastError.message
    : String(lastError);

  console.error(
    `❌ Model failed after ${maxRetries} attempts. Returning error fallback.`
  );

  return `[MODEL_ERROR: ${errorMessage}]`;
}
