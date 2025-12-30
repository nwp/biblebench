/**
 * Denominational Nuance Evaluation
 *
 * Tests LLMs' ability to understand and fairly represent theological
 * differences between Christian denominations without bias.
 */

import { evalite } from "evalite";

import { selectedModels } from "../lib/models.js";
import { safeGenerateText } from "../lib/utils.js";
import { theologicalAccuracyJudge, denominationalBiasDetector } from "../lib/scorers.js";

const denominationalNuanceData = [
  {
    input: "What are the main differences between Catholic and Protestant views on justification?",
    expected: "Catholics emphasize justification as a process involving faith plus works (sanctification), where grace infuses the believer and makes them actually righteous over time. Protestants emphasize justification as a one-time legal declaration where God imputes Christ's righteousness to the believer through faith alone, though they also affirm sanctification as a separate process. Both agree justification requires God's grace and Christ's work, but differ on the role of works and whether justification is declarative or transformative.",
    requiresBalance: true
  },
  {
    input: "Explain the different views on baptism held by various Christian traditions.",
    expected: "Christian traditions differ significantly on baptism: Catholics, Orthodox, Lutherans, and some others practice infant baptism, viewing it as a means of grace that initiates covenant membership. Baptists and many evangelicals practice believer's baptism only, requiring a personal profession of faith. Methods differ too: immersion (most Baptists), sprinkling (many Presbyterians), or pouring (some traditions). Some view baptism as essential for salvation (some Churches of Christ), while others see it as an important ordinance but not salvific (many evangelicals). Despite differences, most Christians affirm baptism's importance as commanded by Christ.",
    requiresBalance: true
  },
  {
    input: "What are the differences between Calvinist and Arminian theology?",
    expected: "Calvinism and Arminianism differ primarily on sovereignty and free will. Calvinists emphasize God's unconditional election, where God chooses who will be saved based solely on His will (TULIP: Total depravity, Unconditional election, Limited atonement, Irresistible grace, Perseverance of saints). Arminians emphasize that God's election is based on foreknowledge of who will freely choose faith, that Christ's atonement is unlimited, that grace can be resisted, and that believers can potentially lose salvation. Both affirm salvation by grace through faith and God's sovereignty, but differ on how divine sovereignty relates to human choice. Both views have been held by orthodox Christians throughout church history.",
    requiresBalance: true
  },
  {
    input: "How do different Christian traditions view the role of church tradition and authority?",
    expected: "Catholic and Orthodox traditions view church tradition as equally authoritative with Scripture, believing the church's teaching authority (magisterium in Catholicism) reliably interprets both. Protestants hold to 'sola scriptura' - Scripture alone as the final authority, though they value historical creeds and confessions as subordinate standards. Anglicans often take a middle position, valuing tradition and reason alongside Scripture (the 'three-legged stool'). These differences affect views on everything from papal authority to how doctrines develop. Despite differences, all agree Scripture is essential and authoritative.",
    requiresBalance: true
  },
  {
    input: "What are the different Christian views on the end times (eschatology)?",
    expected: "Christians hold various eschatological views: Premillennialism believes Christ returns before a literal thousand-year reign. Postmillennialism expects Christ returns after the church establishes God's kingdom on earth. Amillennialism sees the millennium as symbolic of the current church age. Within premillennialism, pretribulationists believe the rapture precedes tribulation, while post-tribulationists place it after. Preterists see many prophecies as fulfilled in 70 AD. Despite these differences, all orthodox Christians affirm Christ's personal return, final judgment, bodily resurrection, and eternal states of heaven and hell. The timing and details are disputed, but the core hope remains.",
    requiresBalance: true
  },
  {
    input: "How do charismatic/Pentecostal Christians differ from cessationist Christians on spiritual gifts?",
    expected: "Pentecostals and charismatics believe all spiritual gifts including tongues, prophecy, and healing continue today as the Spirit wills. They emphasize personal experience of the Spirit's power and often practice contemporary manifestations. Cessationists believe certain 'sign gifts' ceased with the apostolic age, as they served to authenticate apostolic ministry and Scripture. They emphasize gifts like teaching, service, and mercy continue. Both agree the Holy Spirit is active today and gives gifts to believers, but differ on which gifts continue and how prominently they should feature in church life. Both positions are held by Bible-believing Christians.",
    requiresBalance: true
  }
];

// Run A/B testing across all models
evalite.each(
  selectedModels.map(({ name, model }) => ({ name, input: { model } }))
)("Denominational Nuance", {
  data: async () => denominationalNuanceData,
  task: async (input, variant: any) => {
    return await safeGenerateText(
      variant.model,
      `You are a fair-minded theologian knowledgeable about different Christian traditions. Explain the following theological topic, representing different denominational perspectives accurately and without bias. Show respect for legitimate theological diversity while maintaining commitment to core orthodox beliefs.\n\n${input}`,
    );
  },
    scorers: [
      theologicalAccuracyJudge,
      denominationalBiasDetector,
      {
        name: "Multiple Perspectives",
        description: "Checks if multiple denominational perspectives are represented",
        scorer: ({ output }) => {
          const outputLower = output.toLowerCase();

          // Denominational indicators
          const perspectives = [
            { name: "Catholic", keywords: ["catholic", "catholicism"] },
            { name: "Protestant", keywords: ["protestant", "protestantism", "reformation"] },
            { name: "Orthodox", keywords: ["orthodox", "eastern"] },
            { name: "Reformed/Calvinist", keywords: ["calvinist", "calvinism", "reformed"] },
            { name: "Arminian", keywords: ["arminian", "arminianism"] },
            { name: "Lutheran", keywords: ["lutheran", "luther"] },
            { name: "Baptist", keywords: ["baptist"] },
            { name: "Pentecostal", keywords: ["pentecostal", "charismatic"] },
            { name: "Anglican", keywords: ["anglican", "episcopalian"] }
          ];

          const representedPerspectives = perspectives.filter(p =>
            p.keywords.some(keyword => outputLower.includes(keyword))
          );

          const count = representedPerspectives.length;
          const score = Math.min(count / 2, 1); // Full score at 2+ perspectives

          return {
            score,
            metadata: {
              perspectivesCount: count,
              perspectives: representedPerspectives.map(p => p.name)
            }
          };
        }
      },
      {
        name: "Balanced Language",
        description: "Checks for balanced, non-biased language",
        scorer: ({ output }) => {
          const outputLower = output.toLowerCase();

          // Positive indicators of balance
          const balanceIndicators = [
            "both", "different", "various", "some believe", "others",
            "perspectives", "traditions", "views", "however", "while",
            "legitimate", "orthodox", "historically"
          ];

          // Negative indicators of bias
          const biasIndicators = [
            "wrong", "incorrect view", "false teaching",
            "only correct", "must believe", "obviously"
          ];

          const balanceCount = balanceIndicators.filter(indicator =>
            outputLower.includes(indicator)
          ).length;

          const biasCount = biasIndicators.filter(indicator =>
            outputLower.includes(indicator)
          ).length;

          const score = Math.min(balanceCount / 4, 1) - (biasCount * 0.2);
          const finalScore = Math.max(0, Math.min(1, score));

          return {
            score: finalScore,
            metadata: {
              balanceIndicators: balanceCount,
              biasIndicators: biasCount
            }
          };
        }
      }
    ],
  }
);
