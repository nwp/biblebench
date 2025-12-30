/**
 * Shared Type Definitions
 *
 * Central type definitions for the BibleBench evaluation system.
 * Provides type safety across evaluations, scorers, and models.
 */

import type { LanguageModelV2 } from "@ai-sdk/provider";

/**
 * Base test data structure for all evaluations
 */
export interface BaseTestData {
  /** The input question or prompt for the LLM */
  input: string;
  /** The expected answer or response */
  expected: string;
  /** Optional scripture reference (e.g., "John 3:16") */
  reference?: string;
}

/**
 * Scripture-specific test data
 */
export interface ScriptureTestData extends BaseTestData {
  reference: string;
  /** Bible translation (KJV, NIV, ESV, etc.) */
  translation?: string;
  /** Key phrases specific to a translation */
  keyPhrases?: string[];
}

/**
 * Theology-specific test data
 */
export interface TheologyTestData extends BaseTestData {
  /** Importance level of the theological concept */
  theologicalImportance?: "foundational" | "core" | "nuanced" | "disputable";
  /** Type of heresy being tested (if applicable) */
  heresyType?: string;
  /** Denominational context (if applicable) */
  denominationalContext?: string[];
}

/**
 * Model configuration with metadata
 */
export interface ModelConfig {
  /** Display name for the model */
  name: string;
  /** Wrapped AI SDK model instance */
  model: LanguageModelV2;
  /** Optional provider name (OpenAI, Anthropic, etc.) */
  provider?: string;
  /** Optional cost per token for tracking */
  costPerToken?: number;
}

/**
 * Scorer metadata for theological accuracy
 */
export interface TheologicalScorerMetadata {
  doctrinally_sound?: boolean;
  biblically_grounded?: boolean;
  nuance_captured?: boolean;
  errors?: string[];
  rationale?: string;
  scoringError?: boolean;
}

/**
 * Scorer metadata for heresy detection
 */
export interface HeresyScorerMetadata {
  contains_heresy?: boolean;
  severity?: "none" | "minor" | "moderate" | "severe";
  heresies_detected?: string[];
  explanation?: string;
  scoringError?: boolean;
}

/**
 * Scorer metadata for denominational bias
 */
export interface DenominationalScorerMetadata {
  bias_detected?: boolean;
  denominations?: string[];
  bias_strength?: "none" | "slight" | "moderate" | "strong";
  ecumenical_score?: number;
  explanation?: string;
  scoringError?: boolean;
}

/**
 * Scorer metadata for translation accuracy
 */
export interface TranslationScorerMetadata {
  translation?: string;
  keyPhrasesFound?: number;
  totalKeyPhrases?: number;
  phrasesMatched?: string[];
  phrasesMissed?: string[];
  positiveMarkersFound?: string[];
  negativeMarkersFound?: string[];
  keyPhrasesChecked?: number;
  appropriateVocabulary?: boolean;
  notEvaluated?: boolean;
}

/**
 * Scorer metadata for text similarity
 */
export interface SimilarityScorerMetadata {
  distance?: number;
  maxLength?: number;
  similarity?: number;
  exactMatch?: boolean;
  contains?: boolean;
  wordOverlap?: number;
  matchedWords?: number;
  totalWords?: number;
}

/**
 * Extended scorer input with optional metadata fields
 */
export interface ExtendedScorerInput<TInput = string, TOutput = string, TExpected = string> {
  input: TInput;
  output: TOutput;
  expected: TExpected;
  // Optional fields for specialized scorers
  reference?: string;
  translation?: string;
  keyPhrases?: string[];
  heresyType?: string;
  theologicalImportance?: string;
  denominationalContext?: string[];
}

/**
 * Common scorer result structure
 */
export interface ScorerResult<TMetadata = Record<string, unknown>> {
  score: number;
  metadata?: TMetadata;
}

/**
 * Model provider category
 */
export type ModelProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "xai"
  | "mistral"
  | "deepseek"
  | "prime-intellect"
  | "allenai"
  | "nvidia"
  | "zhipu"
  | "minimax"
  | "other";

/**
 * Evaluation category
 */
export type EvaluationCategory =
  | "scripture"
  | "theology"
  | "pastoral"
  | "hermeneutics"
  | "church-history";

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  /** OpenRouter API key (required) */
  openrouterApiKey: string;
  /** Model filter patterns (optional) */
  modelFilters?: string[];
}

/**
 * Type guard to check if data is ScriptureTestData
 */
export function isScriptureTestData(data: BaseTestData): data is ScriptureTestData {
  return "reference" in data && typeof data.reference === "string";
}

/**
 * Type guard to check if data is TheologyTestData
 */
export function isTheologyTestData(data: BaseTestData): data is TheologyTestData {
  return "theologicalImportance" in data || "heresyType" in data;
}
