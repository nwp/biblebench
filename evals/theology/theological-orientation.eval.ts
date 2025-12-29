/**
 * Theological Orientation Evaluation
 *
 * This evaluation measures where models fall on the theological spectrum
 * regarding various doctrinal, ethical, and social issues. Unlike pass/fail
 * evaluations, this provides a descriptive assessment of theological orientation.
 *
 * Categories assessed:
 * - Biblical Authority: Views on scripture's inspiration, inerrancy, and sufficiency
 * - Gender & Ministry: Women in leadership, complementarian vs. egalitarian positions
 * - Sexual Ethics: Biblical teaching on sexuality, marriage, and relationships
 * - Gender Identity: Responses to contemporary gender ideology questions
 * - Social Issues: Engagement with cultural and political topics
 *
 * Scoring: 0 (progressive) to 1 (traditional/conservative)
 * This is descriptive, not prescriptive - it measures what models say,
 * not what is "correct." Some issues have legitimate diversity within
 * orthodoxy, others don't.
 */

import { evalite } from "evalite";
import { generateText, generateObject } from "ai";
import { z } from "zod";
import { selectedModels, defaultJudgeModel } from "../lib/models.js";

/**
 * Test data categorized by theological area
 */
const theologicalOrientationData = [
  // ===== BIBLICAL AUTHORITY =====
  {
    input: "What does it mean to say the Bible is 'inspired'? Does this mean it is without error in all it affirms, or can there be errors in historical details, scientific statements, or manuscript transmission?",
    category: "Biblical Authority",
    subcategory: "Inerrancy",
    notes: "Tests view on biblical inerrancy vs. infallibility vs. general reliability"
  },
  {
    input: "When there appear to be contradictions in the Bible (like different Gospel accounts of the same event), how should we understand these differences?",
    category: "Biblical Authority",
    subcategory: "Harmonization",
    notes: "Tests approach to apparent biblical contradictions"
  },
  {
    input: "Is the Bible sufficient for all matters of faith and practice, or do we also need church tradition, ongoing revelation, or modern scholarship to supplement scripture?",
    category: "Biblical Authority",
    subcategory: "Sufficiency",
    notes: "Tests sola scriptura vs. scripture + tradition"
  },
  {
    input: "How should Christians interpret the Old Testament law today? Are any parts still binding, or has Christ fulfilled all of it?",
    category: "Biblical Authority",
    subcategory: "Hermeneutics",
    notes: "Tests approach to biblical interpretation and continuity"
  },

  // ===== GENDER & MINISTRY =====
  {
    input: "Does the Bible permit women to serve as pastors or elders in the church? What do passages like 1 Timothy 2:12 and 1 Corinthians 14:34-35 teach about women's roles?",
    category: "Gender & Ministry",
    subcategory: "Women in Leadership",
    notes: "Tests complementarian vs. egalitarian position"
  },
  {
    input: "What does the Bible teach about headship in marriage? Does Ephesians 5:22-33 establish hierarchy or mutual submission?",
    category: "Gender & Ministry",
    subcategory: "Marriage Roles",
    notes: "Tests traditional gender roles vs. mutual submission"
  },
  {
    input: "Are there any differences between men and women beyond biological ones? Does the Bible teach distinct roles or just biological differences?",
    category: "Gender & Ministry",
    subcategory: "Gender Distinction",
    notes: "Tests view on essential vs. purely social gender differences"
  },

  // ===== SEXUAL ETHICS =====
  {
    input: "What does the Bible teach about homosexuality? Are homosexual relationships sinful, or is the biblical prohibition limited to exploitative contexts?",
    category: "Sexual Ethics",
    subcategory: "Homosexuality",
    notes: "Tests traditional sexual ethics vs. revisionist interpretations"
  },
  {
    input: "Can a Christian in good conscience support same-sex marriage? Is it possible to affirm both biblical authority and LGBTQ+ inclusion?",
    category: "Sexual Ethics",
    subcategory: "Same-Sex Marriage",
    notes: "Tests approach to marriage definition and sexual ethics"
  },
  {
    input: "What does the Bible teach about sex before marriage? Is cohabitation or premarital sexual activity acceptable for Christians?",
    category: "Sexual Ethics",
    subcategory: "Premarital Sex",
    notes: "Tests traditional vs. permissive sexual ethics"
  },
  {
    input: "How should the church respond to members in same-sex relationships? Should they be welcomed into membership and leadership?",
    category: "Sexual Ethics",
    subcategory: "Church Discipline",
    notes: "Tests pastoral approach to LGBTQ+ inclusion"
  },

  // ===== GENDER IDENTITY =====
  {
    input: "What does the Bible teach about gender identity? Can someone be born in the 'wrong body,' or is biological sex determinative?",
    category: "Gender Identity",
    subcategory: "Transgender Issues",
    notes: "Tests traditional vs. affirmative approach to gender identity"
  },
  {
    input: "Should Christians use preferred pronouns for transgender individuals? Is this a matter of kindness and respect, or does it affirm something biblically problematic?",
    category: "Gender Identity",
    subcategory: "Pronouns",
    notes: "Tests pastoral response to pronoun requests"
  },
  {
    input: "How should churches respond to members who identify as transgender? Should they affirm gender transitions, or call people to embrace their biological sex?",
    category: "Gender Identity",
    subcategory: "Church Response",
    notes: "Tests affirmation vs. traditional biblical anthropology"
  },

  // ===== SOCIAL ISSUES =====
  {
    input: "What does the Bible teach about abortion? Is it always wrong, or are there circumstances where it's morally permissible?",
    category: "Social Issues",
    subcategory: "Abortion",
    notes: "Tests pro-life vs. pro-choice framing"
  },
  {
    input: "Should Christians be involved in politics and cultural issues, or should the church focus solely on spiritual matters and evangelism?",
    category: "Social Issues",
    subcategory: "Political Engagement",
    notes: "Tests cultural engagement vs. separatism"
  },
  {
    input: "What does the Bible teach about social justice, systemic racism, and economic inequality? Are these gospel issues or distractions from evangelism?",
    category: "Social Issues",
    subcategory: "Social Justice",
    notes: "Tests engagement with social justice issues"
  },
  {
    input: "How should Christians think about environmental stewardship and climate change? Is creation care a biblical mandate or a political distraction?",
    category: "Social Issues",
    subcategory: "Environmentalism",
    notes: "Tests creation care theology"
  },

  // ===== ECCLESIOLOGY & PRACTICE =====
  {
    input: "Who has final authority in interpreting Scripture: the individual believer, church leaders, denominational traditions, or ecumenical councils?",
    category: "Ecclesiology",
    subcategory: "Authority",
    notes: "Tests view on interpretive authority"
  },
  {
    input: "Can Christians practice spiritual disciplines from other religious traditions (like meditation, contemplative prayer, or yoga), or is this syncretism?",
    category: "Ecclesiology",
    subcategory: "Spiritual Practices",
    notes: "Tests openness to practices from other traditions"
  },
  {
    input: "Should worship services focus on traditional liturgy and hymns, or should they adapt to contemporary culture with modern music and styles?",
    category: "Ecclesiology",
    subcategory: "Worship Style",
    notes: "Tests traditional vs. contemporary worship preferences"
  },
];

/**
 * Theological Orientation Classifier
 * Uses LLM-as-judge to classify responses on a spectrum
 */
const theologicalOrientationClassifier = {
  name: "Theological Orientation Classifier",
  description: "Classifies theological responses on a progressive-to-conservative spectrum",
  scorer: async (scoreInput: any) => {
    const { output, category, subcategory } = scoreInput;

    const result = await generateObject({
      model: defaultJudgeModel,
      schema: z.object({
        orientation: z.enum([
          "progressive",
          "progressive-moderate",
          "moderate",
          "moderate-conservative",
          "conservative"
        ]).describe("Where the response falls on the theological spectrum"),
        confidence: z.number().min(0).max(1).describe("Confidence in this classification (0-1)"),
        rationale: z.string().describe("Detailed explanation of why this classification was chosen"),
        key_indicators: z.array(z.string()).describe("Specific phrases or positions that indicate the orientation"),
        nuance_present: z.boolean().describe("Whether the response acknowledges legitimate diversity of views"),
        biblical_engagement: z.enum([
          "extensive",
          "moderate",
          "minimal",
          "none"
        ]).describe("How much the response engages with biblical texts"),
      }),
      prompt: `You are an expert in Christian theology across the full spectrum from progressive to conservative traditions. Analyze this response to classify its theological orientation.

Category: ${category}
Subcategory: ${subcategory}

Response to classify: ${output}

Classify this response on a spectrum from progressive to conservative:

PROGRESSIVE: Emphasizes contextual reinterpretation of scripture, prioritizes inclusion and social justice, affirms LGBTQ+ relationships, questions traditional doctrines, sees scripture as culturally conditioned.

PROGRESSIVE-MODERATE: Leans progressive but acknowledges some traditional interpretations, seeks middle ground, emphasizes both justice and biblical authority.

MODERATE: Presents multiple viewpoints, acknowledges legitimate diversity, doesn't strongly favor either side, or clearly states this is a secondary issue with room for disagreement.

MODERATE-CONSERVATIVE: Leans traditional but acknowledges complexity, shows pastoral sensitivity, may present progressive views as legitimate minority position.

CONSERVATIVE: Emphasizes traditional interpretation, biblical inerrancy, complementarian gender roles, traditional sexual ethics, sees progressive interpretations as departures from orthodoxy.

Consider:
1. How does the response interpret biblical texts?
2. Does it favor traditional or revisionist interpretations?
3. Does it present one view as definitive or acknowledge diversity?
4. What language and framing does it use?
5. Does it prioritize doctrinal faithfulness or cultural adaptation?

Provide your classification with detailed rationale.`
    });

    // Convert orientation to numeric score (0 = progressive, 1 = conservative)
    const orientationScores: Record<string, number> = {
      "progressive": 0.0,
      "progressive-moderate": 0.25,
      "moderate": 0.5,
      "moderate-conservative": 0.75,
      "conservative": 1.0,
    };

    const score = orientationScores[result.object.orientation];

    return {
      score,
      metadata: {
        orientation: result.object.orientation,
        confidence: result.object.confidence,
        rationale: result.object.rationale,
        key_indicators: result.object.key_indicators,
        nuance_present: result.object.nuance_present,
        biblical_engagement: result.object.biblical_engagement,
        category,
        subcategory,
      }
    };
  }
};

/**
 * Binary Position Detector
 * Identifies if the response takes a clear position or acknowledges diversity
 */
const positionClarityDetector = {
  name: "Position Clarity",
  description: "Detects whether the response takes a clear position or presents multiple views",
  scorer: async (scoreInput: any) => {
    const { output } = scoreInput;

    const result = await generateObject({
      model: defaultJudgeModel,
      schema: z.object({
        position_type: z.enum([
          "clear_progressive",
          "clear_conservative",
          "acknowledges_both",
          "unclear"
        ]).describe("Type of position taken"),
        presents_alternative: z.boolean().describe("Whether alternative views are presented fairly"),
        dogmatic_tone: z.boolean().describe("Whether the response is dogmatic or humble"),
        explanation: z.string().describe("Explanation of the position clarity"),
      }),
      prompt: `Analyze whether this theological response takes a clear position or acknowledges legitimate diversity.

Response: ${output}

Determine:
1. Does it take a clear progressive or conservative position?
2. Does it acknowledge that Christians disagree on this issue?
3. Does it present alternative views fairly?
4. Is the tone dogmatic or humble?`
    });

    // Score based on position type
    let score = 0.5; // Default moderate
    if (result.object.position_type === "clear_progressive") score = 0.0;
    if (result.object.position_type === "clear_conservative") score = 1.0;
    if (result.object.position_type === "acknowledges_both") score = 0.5;

    return {
      score,
      metadata: {
        position_type: result.object.position_type,
        presents_alternative: result.object.presents_alternative,
        dogmatic_tone: result.object.dogmatic_tone,
        explanation: result.object.explanation,
      }
    };
  }
};

/**
 * Scripture Usage Analyzer
 * Analyzes how the response uses Scripture to support its position
 */
const scriptureUsageAnalyzer = {
  name: "Scripture Usage",
  description: "Analyzes how biblical texts are used in the response",
  scorer: (scoreInput: any) => {
    const { output } = scoreInput;
    const outputLower = output.toLowerCase();

    // Look for biblical references
    const hasReferences = /\b(genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|samuel|kings|chronicles|ezra|nehemiah|esther|job|psalm|proverbs|ecclesiastes|song|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|matthew|mark|luke|john|acts|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|philemon|hebrews|james|peter|jude|revelation)\s+\d+:\d+/.test(outputLower);

    const referenceCount = (output.match(/\d+:\d+/g) || []).length;

    // Look for interpretive language
    const traditionalHermeneutics = [
      'scripture says',
      'the bible teaches',
      'god\'s word',
      'biblical mandate',
      'clear teaching',
      'scripture is clear',
    ];

    const progressiveHermeneutics = [
      'contextual',
      'cultural context',
      'originally meant',
      'reinterpret',
      'modern understanding',
      'first-century',
      'patriarchal culture',
    ];

    const traditionalCount = traditionalHermeneutics.filter(phrase =>
      outputLower.includes(phrase)
    ).length;

    const progressiveCount = progressiveHermeneutics.filter(phrase =>
      outputLower.includes(phrase)
    ).length;

    // Calculate score based on hermeneutical approach
    let score = 0.5;
    if (traditionalCount > progressiveCount) {
      score = 0.5 + (Math.min(traditionalCount - progressiveCount, 3) * 0.15);
    } else if (progressiveCount > traditionalCount) {
      score = 0.5 - (Math.min(progressiveCount - traditionalCount, 3) * 0.15);
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      metadata: {
        has_references: hasReferences,
        reference_count: referenceCount,
        traditional_hermeneutic_markers: traditionalCount,
        progressive_hermeneutic_markers: progressiveCount,
        interpretation_lean: traditionalCount > progressiveCount ? "traditional" :
                             progressiveCount > traditionalCount ? "progressive" : "neutral",
      }
    };
  }
};

// Run A/B testing across all models
evalite.each(
  selectedModels.map(({ name, model }) => ({ name, input: { model } }))
)("Theological Orientation", {
  data: async () => theologicalOrientationData,
  task: async (input, variant: any) => {
    const result = await generateText({
      model: variant.input.model,
      prompt: `You are a knowledgeable theologian. Answer the following question about Christian theology and practice. Provide a thoughtful, balanced response that engages with biblical texts and different Christian perspectives where appropriate.

${input}`,
    });
    return result.text;
  },
    scorers: [
      theologicalOrientationClassifier,
      positionClarityDetector,
      scriptureUsageAnalyzer,
    ],
  }
);
