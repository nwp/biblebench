/**
 * Custom Scorers Library
 *
 * Provides reusable scoring functions for theological evaluations
 * including exact match, semantic similarity, and LLM-as-judge scorers.
 */

import { createScorer } from "evalite";
import { generateObject } from "ai";
import { z } from "zod";
import { defaultJudgeModel } from "./models.js";
import { Levenshtein } from "autoevals";

/**
 * Exact Match Scorer
 * Checks if the output exactly matches the expected value (case-insensitive)
 */
export const exactMatch = createScorer<string, string, string>({
  name: "Exact Match",
  description: "Checks if the output exactly matches the expected value (case-insensitive)",
  scorer: ({ output, expected }) => {
    const match = output.trim().toLowerCase() === expected.trim().toLowerCase();
    return {
      score: match ? 1 : 0,
      metadata: { match }
    };
  }
});

/**
 * Contains Scorer
 * Checks if the output contains the expected substring
 */
export const containsAnswer = createScorer<string, string, string>({
  name: "Contains Answer",
  description: "Checks if the output contains the expected answer",
  scorer: ({ output, expected }) => {
    const contains = output.toLowerCase().includes(expected.toLowerCase());
    return {
      score: contains ? 1 : 0,
      metadata: { contains, expected }
    };
  }
});

/**
 * Levenshtein Distance Scorer
 * Measures similarity between output and expected using edit distance
 */
export const levenshteinSimilarity = createScorer<string, string, string>({
  name: "Levenshtein Similarity",
  description: "Measures text similarity using Levenshtein distance",
  scorer: ({ output, expected }) => {
    return Levenshtein({ output, expected });
  }
});

/**
 * Scripture Reference Accuracy Scorer
 * Validates that scripture references are correctly formatted and accurate
 */
export const scriptureReferenceAccuracy = createScorer<string, string, string>({
  name: "Scripture Reference Accuracy",
  description: "Validates scripture reference formatting and accuracy",
  scorer: ({ output, expected }) => {
    // Normalize references (e.g., "John 3:16" vs "John 3.16")
    const normalizeRef = (ref: string) =>
      ref.replace(/[.:]/g, ':').replace(/\s+/g, ' ').trim().toLowerCase();

    const normalizedOutput = normalizeRef(output);
    const normalizedExpected = normalizeRef(expected);

    const exactMatch = normalizedOutput === normalizedExpected;
    const contains = normalizedOutput.includes(normalizedExpected);

    return {
      score: exactMatch ? 1 : contains ? 0.5 : 0,
      metadata: {
        normalizedOutput,
        normalizedExpected,
        exactMatch,
        contains
      }
    };
  }
});

/**
 * Theological Accuracy Judge
 * LLM-as-judge scorer for evaluating theological accuracy and orthodoxy
 */
export const theologicalAccuracyJudge = createScorer<string, string, string>({
  name: "Theological Accuracy Judge",
  description: "LLM-based evaluation of theological accuracy and doctrinal correctness",
  scorer: async ({ input, output, expected }) => {
    const result = await generateObject({
      model: defaultJudgeModel,
      schema: z.object({
        score: z.number().min(0).max(1).describe("Score from 0 to 1 indicating theological accuracy"),
        doctrinally_sound: z.boolean().describe("Whether the response is doctrinally sound"),
        biblically_grounded: z.boolean().describe("Whether the response is grounded in scripture"),
        nuance_captured: z.boolean().describe("Whether important theological nuances are captured"),
        errors: z.array(z.string()).describe("List of theological errors or inaccuracies"),
        rationale: z.string().describe("Detailed explanation of the score")
      }),
      prompt: `You are an expert in Christian theology and doctrine. Evaluate the theological accuracy of an LLM's response.

Question: ${input}

Expected Answer: ${expected}

LLM's Response: ${output}

Evaluate the LLM's response for:
1. Theological accuracy - Does it correctly represent biblical teaching?
2. Doctrinal soundness - Is it consistent with historic Christian orthodoxy?
3. Biblical grounding - Are claims supported by scripture?
4. Nuance - Does it capture important theological distinctions?

Provide a score from 0 to 1, where:
- 1.0 = Perfectly accurate, doctrinally sound, well-nuanced
- 0.7-0.9 = Mostly accurate with minor issues
- 0.4-0.6 = Partially correct but with significant gaps
- 0.0-0.3 = Theologically inaccurate or misleading`
    });

    return {
      score: result.object.score,
      metadata: {
        doctrinally_sound: result.object.doctrinally_sound,
        biblically_grounded: result.object.biblically_grounded,
        nuance_captured: result.object.nuance_captured,
        errors: result.object.errors,
        rationale: result.object.rationale
      }
    };
  }
});

/**
 * Heresy Detection Judge
 * LLM-as-judge scorer specifically for detecting heretical or unorthodox teachings
 */
export const heresyDetectionJudge = createScorer<string, string, string | undefined>({
  name: "Heresy Detection Judge",
  description: "Detects heretical or unorthodox theological statements",
  scorer: async ({ output }) => {
    const result = await generateObject({
      model: defaultJudgeModel,
      schema: z.object({
        contains_heresy: z.boolean().describe("Whether the response contains heretical teaching"),
        severity: z.enum(["none", "minor", "moderate", "severe"]).describe("Severity of any heretical content"),
        heresies_detected: z.array(z.string()).describe("List of specific heresies or errors detected"),
        explanation: z.string().describe("Explanation of detected heresies")
      }),
      prompt: `You are an expert in Christian theology and church history. Analyze this LLM response for heretical or unorthodox teachings.

Response to evaluate: ${output}

Check for common heresies including but not limited to:
- Arianism (denying Christ's divinity)
- Modalism (God as one person in three modes)
- Pelagianism (salvation by works alone)
- Gnosticism (salvation through secret knowledge)
- Docetism (Christ only appeared human)
- And other departures from historic Christian orthodoxy

Rate the severity and identify specific issues.`
    });

    const score = result.object.contains_heresy ?
      (result.object.severity === "severe" ? 0 :
       result.object.severity === "moderate" ? 0.3 :
       result.object.severity === "minor" ? 0.7 : 1) : 1;

    return {
      score,
      metadata: {
        contains_heresy: result.object.contains_heresy,
        severity: result.object.severity,
        heresies_detected: result.object.heresies_detected,
        explanation: result.object.explanation
      }
    };
  }
});

/**
 * Denominational Bias Detector
 * Detects and measures denominational bias in theological responses
 */
export const denominationalBiasDetector = createScorer<string, string, string | undefined>({
  name: "Denominational Bias Detector",
  description: "Detects denominational bias in theological responses",
  scorer: async ({ output, input }) => {
    const result = await generateObject({
      model: defaultJudgeModel,
      schema: z.object({
        bias_detected: z.boolean().describe("Whether denominational bias is present"),
        denominations: z.array(z.string()).describe("Denominations the response appears biased toward"),
        bias_strength: z.enum(["none", "slight", "moderate", "strong"]).describe("Strength of the bias"),
        ecumenical_score: z.number().min(0).max(1).describe("How ecumenical/balanced the response is"),
        explanation: z.string().describe("Explanation of any bias detected")
      }),
      prompt: `You are an expert in Christian denominational differences and theology. Evaluate this response for denominational bias.

Question: ${input}

Response: ${output}

Determine if the response:
1. Favors a particular denominational perspective (Catholic, Protestant, Orthodox, etc.)
2. Ignores valid alternative interpretations held by other traditions
3. Presents one view as definitive when there is legitimate theological diversity
4. Maintains an ecumenical, balanced approach

Rate the ecumenical score from 0 to 1, where 1 is perfectly balanced and 0 is extremely biased.`
    });

    return {
      score: result.object.ecumenical_score,
      metadata: {
        bias_detected: result.object.bias_detected,
        denominations: result.object.denominations,
        bias_strength: result.object.bias_strength,
        explanation: result.object.explanation
      }
    };
  }
});
