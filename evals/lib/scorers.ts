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
    // Calculate Levenshtein distance
    const levenshteinDistance = (a: string, b: string): number => {
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
    };

    const distance = levenshteinDistance(output.toLowerCase(), expected.toLowerCase());
    const maxLength = Math.max(output.length, expected.length);
    const similarity = maxLength === 0 ? 1 : 1 - (distance / maxLength);
    
    return {
      score: Math.max(0, Math.min(1, similarity)),
      metadata: {
        distance,
        maxLength,
        similarity
      }
    };
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

/**
 * Translation-Specific Phrase Matcher
 * Checks if translation-specific key phrases are present in the output
 */
export const translationPhraseMatch = createScorer<string, string, { keyPhrases?: string[], translation?: string }>({
  name: "Translation Phrase Match",
  description: "Checks if translation-specific key phrases are accurately reproduced",
  scorer: (scoreInput) => {
    const { output, expected } = scoreInput;
    const keyPhrases = (scoreInput as any).keyPhrases || [];
    if (keyPhrases.length === 0) {
      return { score: 1, metadata: { na: true } };
    }

    const normalize = (text: string) =>
      text.toLowerCase()
        .replace(/[.,;:!?"'–—]/g, "")
        .trim();

    const outputNorm = normalize(output);
    const phrasesFound = keyPhrases.filter((phrase: string) =>
      outputNorm.includes(normalize(phrase))
    );

    const score = phrasesFound.length / keyPhrases.length;

    return {
      score,
      metadata: {
        keyPhrasesFound: phrasesFound.length,
        totalKeyPhrases: keyPhrases.length,
        phrasesMatched: phrasesFound,
        phrasesMissed: keyPhrases.filter((p: string) => !phrasesFound.includes(p)),
        translation: (scoreInput as any).translation
      }
    };
  }
});

/**
 * Translation Vocabulary Fidelity
 * Checks if the output uses vocabulary appropriate to the requested translation
 */
export const translationVocabularyFidelity = createScorer<string, string, { translation?: string, keyPhrases?: string[] }>({
  name: "Translation Vocabulary Fidelity",
  description: "Validates use of translation-appropriate vocabulary and style",
  scorer: (scoreInput) => {
    const { output } = scoreInput;
    const translation = (scoreInput as any).translation || "";
    const keyPhrases = (scoreInput as any).keyPhrases || [];

    // Define characteristic markers for each major translation
    const translationMarkers: Record<string, { positive: string[], negative: string[] }> = {
      "KJV": {
        positive: ["thee", "thou", "thy", "thine", "saith", "unto", "ye", "hath", "doth", "begotten", "whosoever"],
        negative: ["you", "your", "says", "declares", "to", "will be"]
      },
      "NKJV": {
        positive: ["you", "your", "begotten"],
        negative: ["thee", "thou", "thy"]
      },
      "NIV": {
        positive: ["one and only", "will be", "declares", "you", "your"],
        negative: ["thee", "thou", "begotten", "saith"]
      },
      "ESV": {
        positive: ["should", "will", "only son"],
        negative: ["thee", "thou", "begotten"]
      },
      "NASB": {
        positive: ["him who", "through him"],
        negative: ["thee", "thou"]
      },
      "NLT": {
        positive: ["says the", "like this", "you", "your"],
        negative: ["thee", "thou", "saith", "declares"]
      },
      "CSB": {
        positive: ["do not", "will", "you"],
        negative: ["thee", "thou", "saith"]
      }
    };

    if (!translation || !translationMarkers[translation]) {
      return { score: 1, metadata: { translation, notEvaluated: true } };
    }

    const outputLower = output.toLowerCase();
    const markers = translationMarkers[translation];

    // Check for positive markers (should be present)
    const positiveFound = markers.positive.filter(marker =>
      outputLower.includes(marker.toLowerCase())
    );

    // Check for negative markers (should NOT be present)
    const negativeFound = markers.negative.filter(marker =>
      outputLower.includes(marker.toLowerCase())
    );

    // Score calculation
    let score = 1.0;

    // Penalty for using markers from wrong translations
    if (negativeFound.length > 0) {
      score -= (negativeFound.length * 0.2);
    }

    // Check if key phrases are present (if provided)
    if (keyPhrases.length > 0) {
      const phrasesFound = keyPhrases.filter((phrase: string) =>
        outputLower.includes(phrase.toLowerCase())
      );
      const phraseScore = phrasesFound.length / keyPhrases.length;
      score = (score * 0.4) + (phraseScore * 0.6); // Weight key phrases more heavily
    }

    score = Math.max(0, Math.min(1, score)); // Clamp to [0, 1]

    return {
      score,
      metadata: {
        translation,
        positiveMarkersFound: positiveFound,
        negativeMarkersFound: negativeFound,
        keyPhrasesChecked: keyPhrases.length,
        appropriateVocabulary: negativeFound.length === 0
      }
    };
  }
});

/**
 * Translation Identification Judge
 * LLM-as-judge scorer for identifying which translation a verse comes from
 */
export const translationIdentificationJudge = createScorer<string, string, { reference?: string }>({
  name: "Translation Identification Judge",
  description: "Evaluates ability to correctly identify Bible translations",
  scorer: async ({ input, output, expected }) => {
    const result = await generateObject({
      model: defaultJudgeModel,
      schema: z.object({
        correct_translation: z.boolean().describe("Whether the identified translation is correct"),
        confidence: z.number().min(0).max(1).describe("Confidence in the identification"),
        reasoning: z.string().describe("Reasoning for the identification"),
        alternative_possibilities: z.array(z.string()).describe("Other possible translations mentioned")
      }),
      prompt: `You are a Bible translation expert. Evaluate whether the LLM correctly identified the Bible translation.

Question: ${input}

Expected Answer: ${expected}

LLM's Response: ${output}

Major English translations include:
- KJV (King James Version) - Uses "thee/thou/thy", "saith", "begotten"
- NKJV (New King James Version) - Modern language but keeps "begotten"
- NIV (New International Version) - "one and only", modern phrasing
- ESV (English Standard Version) - Literal, modern language
- NASB (New American Standard Bible) - Very literal
- NLT (New Living Translation) - Thought-for-thought
- CSB (Christian Standard Bible) - Balance of literal and readable

Determine if the LLM correctly identified the translation based on distinctive vocabulary and phrasing.`
    });

    const score = result.object.correct_translation ? result.object.confidence : 0;

    return {
      score,
      metadata: {
        correct_translation: result.object.correct_translation,
        confidence: result.object.confidence,
        reasoning: result.object.reasoning,
        alternative_possibilities: result.object.alternative_possibilities
      }
    };
  }
});
