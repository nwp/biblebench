/**
 * Pastoral Application Evaluation
 *
 * Tests LLMs' ability to apply theological knowledge to real-world pastoral situations
 * with wisdom, nuance, and biblical grounding. This is the most complex evaluation,
 * requiring both theological accuracy and pastoral sensitivity.
 */

import { evalite, createScorer } from "evalite";
import { generateText, generateObject } from "ai";
import { z } from "zod";
import { defaultJudgeModel, testModels } from "../lib/models.js";
import { theologicalAccuracyJudge } from "../lib/scorers.js";

/**
 * Pastoral Wisdom Judge
 * Advanced LLM-as-judge scorer for evaluating pastoral wisdom and application
 */
const pastoralWisdomJudge = createScorer<string, string, string>({
  name: "Pastoral Wisdom Judge",
  description: "Evaluates pastoral wisdom, sensitivity, and practical application",
  scorer: async ({ input, output, expected }) => {
    const result = await generateObject({
      model: defaultJudgeModel,
      schema: z.object({
        score: z.number().min(0).max(1),
        theological_accuracy: z.number().min(0).max(1).describe("Theological correctness"),
        pastoral_sensitivity: z.number().min(0).max(1).describe("Sensitivity to human situation"),
        practical_wisdom: z.number().min(0).max(1).describe("Practical applicability of advice"),
        biblical_grounding: z.number().min(0).max(1).describe("Grounding in scripture"),
        balance: z.number().min(0).max(1).describe("Balance of truth and grace"),
        strengths: z.array(z.string()).describe("Key strengths of the response"),
        weaknesses: z.array(z.string()).describe("Areas for improvement"),
        rationale: z.string().describe("Overall evaluation rationale")
      }),
      prompt: `You are evaluating an LLM's pastoral response to a real-world situation requiring theological knowledge and pastoral wisdom.

Situation: ${input}

LLM's Response: ${output}

Reference Answer: ${expected}

Evaluate the response on:
1. Theological Accuracy - Is it doctrinally sound and biblically accurate?
2. Pastoral Sensitivity - Does it show appropriate care and understanding?
3. Practical Wisdom - Is the advice practical and helpful?
4. Biblical Grounding - Are recommendations based on scripture?
5. Balance - Does it balance truth with grace, conviction with compassion?

Provide detailed scores for each dimension (0-1) and an overall score. Consider that pastoral situations often require nuance, and there may be multiple valid approaches while still maintaining theological integrity.`
    });

    return {
      score: result.object.score,
      metadata: {
        theological_accuracy: result.object.theological_accuracy,
        pastoral_sensitivity: result.object.pastoral_sensitivity,
        practical_wisdom: result.object.practical_wisdom,
        biblical_grounding: result.object.biblical_grounding,
        balance: result.object.balance,
        strengths: result.object.strengths,
        weaknesses: result.object.weaknesses,
        rationale: result.object.rationale
      }
    };
  }
});

const pastoralApplicationData = [
  {
    input: "A church member asks: 'My teenage daughter just told me she's questioning her faith and doesn't know if she believes in God anymore. I'm devastated and scared. What should I do?'",
    expected: "First, thank God that your daughter trusts you enough to share her doubts honestly. Doubt is often part of faith development, not its opposite. Respond with love, not fear or anger. Create a safe space for her questions - faith that can't handle questions isn't strong faith. Listen more than you lecture. Ask what specific doubts she has and take them seriously. Provide good resources addressing her questions (books, podcasts, trusted mentors). Pray for and with her. Remember that God loves her more than you do, and His Spirit is at work even in her doubts. Continue modeling authentic faith yourself. Peter reminds us to always be ready to give a reason for our hope 'with gentleness and respect' (1 Peter 3:15) - that applies to our children too.",
    category: "parenting"
  },
  {
    input: "A person struggling with same-sex attraction asks: 'Can I be a Christian and experience these feelings? Does God hate me?'",
    expected: "God absolutely does not hate you - He loves you deeply (Romans 5:8). Experiencing same-sex attraction does not disqualify you from being a Christian. Christians hold different views on how to apply biblical teaching on sexuality, but all orthodox Christians affirm these truths: You are made in God's image, Christ died for you, and you are invited to follow Jesus. Many believers experience various forms of unwanted desires due to living in a fallen world - this is part of the human condition post-Fall. What matters is how we respond to our desires. The call to follow Jesus includes taking up our cross (Luke 9:23) and sometimes choosing obedience over desire. Many Christians experiencing same-sex attraction choose celibacy out of conviction; others interpret Scripture differently regarding committed relationships. What's essential is pursuing Christ, staying connected to a loving church community, seeking wise counsel, and growing in holiness. You are not alone, and you are deeply loved by God.",
    category: "pastoral care"
  },
  {
    input: "A couple asks: 'We're Christians living together before marriage. Is this really wrong? Everyone does it now, and we're committed to each other.'",
    expected: "I appreciate you asking this question honestly. Scripture consistently reserves sexual intimacy for marriage (Hebrews 13:4, 1 Corinthians 6:18-20). This isn't arbitrary - God designed sex to be protected within the covenant of marriage, which provides security, commitment, and public accountability that 'being committed' alone doesn't provide. Cultural acceptance doesn't change biblical standards. That said, I want to encourage you: if you're truly committed to each other and to following Christ, why not honor that commitment through marriage? If you're not ready for marriage, that suggests you're not ready for the level of intimacy you're already sharing. God's commands aren't meant to deprive us but to protect us and lead us to flourishing. I'd encourage you to talk with a pastor or counselor about either moving toward marriage or, difficult as it may be, living separately until marriage. This is about discipleship and honoring God with your bodies (1 Corinthians 6:19-20), not about judgment.",
    category: "sexual ethics"
  },
  {
    input: "A grieving parent asks: 'My child died in a car accident. Everyone says it's God's will and everything happens for a reason. How can a loving God will my child's death?'",
    expected: "I am so deeply sorry for your loss. First, let me say that while God is sovereign, Scripture distinguishes between what God wills and what He allows in a fallen world. Death, disease, and tragedy are results of sin's entry into creation (Romans 5:12), not good things God specifically designs. God doesn't orchestrate every tragedy - we live in a broken world where accidents happen. What we can affirm: God's sovereignty means nothing happens outside His awareness or ultimate control, and He can bring redemption even from tragedy (Romans 8:28) - but that's different from saying He specifically willed this accident. God grieves with you - Jesus wept at Lazarus's death even knowing He'd raise him (John 11:35). It's okay to lament, to cry out to God in pain, to be angry at the brokenness of this world. The Psalms give us language for honest grief. God is big enough to handle your questions and pain. He promises to be near the brokenhearted (Psalm 34:18), to comfort those who mourn (Matthew 5:4), and ultimately to wipe away every tear (Revelation 21:4). Your grief honors your love. Please surround yourself with supportive community and consider grief counseling. You don't have to have this figured out or neatly resolved.",
    category: "grief and suffering"
  },
  {
    input: "Someone asks: 'I've struggled with depression for years. I'm on medication, but some Christians tell me I just need more faith or that medication shows I don't trust God. Am I failing spiritually?'",
    expected: "You are absolutely not failing spiritually. Depression is a real medical condition, often involving brain chemistry, and taking medication is no different than a diabetic taking insulin. God gave us medical knowledge as a gift. Some well-meaning Christians wrongly spiritualize all mental health struggles, but Scripture shows faithful people experiencing deep despair (Elijah in 1 Kings 19, David in various Psalms, even Jesus in Gethsemane). Faith and medication aren't opposites - they work together. By all means, pray, stay connected to Christian community, practice spiritual disciplines, and seek biblical counseling if appropriate. But also work with qualified mental health professionals and take prescribed medication. God can work through both prayer and Prozac. God cares about your whole person - body, mind, and spirit. The fact that you're continuing to pursue faith while battling depression shows great strength, not weakness. Consider Job's friends who wrongly assumed suffering indicated sin - don't listen to modern versions of those voices. You are loved, you are faithful, and seeking proper treatment is wise stewardship of the body and mind God gave you.",
    category: "mental health"
  }
];

// Run the evaluation for each model
for (const { name, model } of testModels) {
  evalite(`Pastoral Application - ${name}`, {
    data: pastoralApplicationData,
    task: async (input) => {
      const result = await generateText({
        model,
        prompt: `You are a wise, biblically grounded pastor providing counsel. Someone comes to you with the following situation. Provide a response that is theologically sound, pastorally sensitive, practically helpful, and grounded in Scripture. Balance truth with grace, conviction with compassion.

${input}`,
      });
      return result.text;
    },
    scorers: [
      theologicalAccuracyJudge,
      pastoralWisdomJudge,
      {
        name: "Scripture References",
        description: "Checks if the response includes biblical references",
        scorer: ({ output }) => {
          // Detect Bible references in various formats
          const referencePatterns = [
            /\b\d?\s?[A-Za-z]+\s+\d+:\d+(-\d+)?\b/g,  // "John 3:16" or "1 John 3:16"
            /\b\d?\s?[A-Za-z]+\s+\d+\b/g,              // "Genesis 1"
          ];

          let referenceCount = 0;
          for (const pattern of referencePatterns) {
            const matches = output.match(pattern);
            if (matches) {
              referenceCount += matches.length;
            }
          }

          const score = Math.min(referenceCount / 2, 1); // Full score at 2+ references

          return {
            score,
            metadata: {
              referenceCount,
              hasReferences: referenceCount > 0
            }
          };
        }
      },
      {
        name: "Compassionate Language",
        description: "Evaluates the compassionate and gracious tone of the response",
        scorer: ({ output }) => {
          const outputLower = output.toLowerCase();

          // Indicators of compassionate language
          const compassionIndicators = [
            "sorry", "understand", "difficult", "pain", "hurt",
            "love", "care", "support", "grace", "mercy",
            "gentle", "patient", "kind", "compassion",
            "with you", "not alone", "struggle"
          ];

          // Indicators of harsh/judgmental language (negative)
          const harshIndicators = [
            "you must", "you have to", "obviously", "clearly you",
            "just need to", "simply", "your fault", "your sin"
          ];

          const compassionCount = compassionIndicators.filter(indicator =>
            outputLower.includes(indicator)
          ).length;

          const harshCount = harshIndicators.filter(indicator =>
            outputLower.includes(indicator)
          ).length;

          const score = Math.min(compassionCount / 3, 1) - (harshCount * 0.3);
          const finalScore = Math.max(0, Math.min(1, score));

          return {
            score: finalScore,
            metadata: {
              compassionIndicators: compassionCount,
              harshIndicators: harshCount
            }
          };
        }
      }
    ],
  });
}
