/**
 * Heresy Detection Evaluation
 *
 * Tests LLMs' ability to correctly identify heretical teachings
 * and distinguish them from orthodox Christian doctrine.
 */

import { evalite } from "evalite";
import { generateText } from "ai";
import { testModels } from "../lib/models.js";
import { theologicalAccuracyJudge } from "../lib/scorers.js";

const heresyDetectionData = [
  {
    input: "A teacher says: 'Jesus was a great prophet and teacher, but he was not truly divine - he was adopted as God's son at his baptism.' Is this teaching orthodox or heretical? Explain.",
    expected: "This is heretical. It represents Adoptionism, which claims Jesus became God's son at some point (often his baptism) rather than being eternally the Son of God. Orthodox Christianity teaches that Jesus is the eternal Son of God, the second person of the Trinity, who has always been fully divine. John 1:1 affirms 'the Word was God' from the beginning, and Jesus is that Word made flesh.",
    heresyType: "Adoptionism"
  },
  {
    input: "Someone teaches: 'The Father, Son, and Holy Spirit are just different modes or roles that the one God takes on at different times, like one person wearing different hats.' Is this correct? Why or why not?",
    expected: "This is heretical modalism (also called Sabellianism). It denies the distinctness of the three persons of the Trinity. Orthodox Christianity teaches that Father, Son, and Holy Spirit are three distinct persons who exist simultaneously and eternally, not one person appearing in different modes. The baptism of Jesus shows this distinctness: the Son is baptized, the Spirit descends, and the Father speaks - all at the same time.",
    heresyType: "Modalism"
  },
  {
    input: "A preacher claims: 'Salvation is achieved through good works and moral living. If you live a good life, you will earn your way to heaven.' Is this biblical teaching?",
    expected: "This is heretical Pelagianism or works-righteousness. Orthodox Christianity teaches salvation by grace through faith, not by works (Ephesians 2:8-9). While good works are important as evidence and fruit of genuine faith, they cannot earn salvation. Salvation is a free gift of God's grace, received through faith in Christ's finished work, not merited by human effort.",
    heresyType: "Pelagianism"
  },
  {
    input: "A teacher says: 'Jesus only seemed to have a physical body. He was actually a purely spiritual being who appeared human but wasn't truly human.' Evaluate this teaching.",
    expected: "This is the heresy of Docetism. It denies the true humanity of Christ. Orthodox Christianity teaches the hypostatic union - Jesus is fully God AND fully human. He had a real physical body, experienced hunger, thirst, fatigue, and truly died on the cross. 1 John 4:2-3 explicitly condemns denying that Jesus came in the flesh, and Hebrews 2:17 states he had to be made fully human to be our high priest.",
    heresyType: "Docetism"
  },
  {
    input: "Someone teaches: 'The God of the Old Testament is different from the God of the New Testament. The Old Testament God was wrathful and evil, while Jesus revealed the true, good God.' What's wrong with this view?",
    expected: "This resembles Marcionism, a second-century heresy that rejected the Old Testament and taught there were two different gods. This is false. Orthodox Christianity affirms the unity of God across both Testaments. The same God who created the world, gave the law, and showed justice in the Old Testament is the God who sent Jesus. Jesus himself affirmed the Old Testament (Matthew 5:17-18) and revealed God's character as both just and merciful throughout scripture.",
    heresyType: "Marcionism"
  },
  {
    input: "A group teaches: 'Salvation comes through secret spiritual knowledge that has been hidden from the masses. Matter is evil, and salvation is escape from the material world into the spiritual realm.' Is this Christian teaching?",
    expected: "This is Gnosticism, an ancient heresy. It contradicts Christianity in multiple ways: Christianity teaches salvation through faith in Christ's public work (not secret knowledge), affirms the goodness of God's material creation (Genesis 1), and proclaims resurrection of the body (not escape from physicality). Gnosticism was explicitly condemned by early church fathers and the New Testament writings (especially 1 John and Colossians).",
    heresyType: "Gnosticism"
  },
  {
    input: "Is the statement 'Jesus is Lord' sufficient for orthodox Christian belief, or are there other essential beliefs?",
    expected: "While 'Jesus is Lord' is foundational (Romans 10:9), orthodox Christianity requires additional essential beliefs about WHO Jesus is. The early creeds developed to combat heresies: Jesus must be confessed as fully God and fully human (against Arianism and Docetism), the Trinity must be affirmed (against modalism), salvation by grace through faith (against works-righteousness), and the authority of Scripture. These essential doctrines form the core of historic Christian orthodoxy.",
    heresyType: "None - testing doctrinal discernment"
  }
];

// Run the evaluation for each model
for (const { name, model } of testModels) {
  evalite(`Heresy Detection - ${name}`, {
    data: heresyDetectionData,
    task: async (input) => {
      const result = await generateText({
        model,
        prompt: `You are a theologian expert in church history and doctrine. Analyze the following theological statement or question, identifying whether it represents orthodox Christian teaching or heresy, and explain why.\n\n${input}`,
      });
      return result.text;
    },
    scorers: [
      theologicalAccuracyJudge,
      {
        name: "Heresy Identification",
        description: "Checks if the response correctly identifies the heresy",
        scorer: (scoreInput: any) => {
          const { output } = scoreInput;
          const heresyType = scoreInput.heresyType;
          if (!heresyType || heresyType === "None - testing doctrinal discernment") {
            return { score: 1, metadata: { type: "no specific heresy" } };
          }

          const outputLower = output.toLowerCase();
          const identified = outputLower.includes(heresyType.toLowerCase());

          return {
            score: identified ? 1 : 0,
            metadata: {
              heresyType,
              identified,
              output: output.substring(0, 200) // First 200 chars for context
            }
          };
        }
      },
      {
        name: "Orthodox Response",
        description: "Checks if the response defends orthodox teaching",
        scorer: (scoreInput: any) => {
          const { output } = scoreInput;
          const outputLower = output.toLowerCase();

          // Keywords indicating orthodox defense
          const orthodoxKeywords = [
            'orthodox',
            'biblical',
            'scripture',
            'heretical',
            'heresy',
            'false',
            'incorrect',
            'error',
            'contradicts'
          ];

          const orthodoxCount = orthodoxKeywords.filter(keyword =>
            outputLower.includes(keyword)
          ).length;

          const score = Math.min(orthodoxCount / 3, 1); // Max score at 3+ keywords

          return {
            score,
            metadata: {
              orthodoxKeywords: orthodoxKeywords.filter(k => outputLower.includes(k)),
              count: orthodoxCount
            }
          };
        }
      }
    ],
  });
}
