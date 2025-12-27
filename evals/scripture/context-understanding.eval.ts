/**
 * Scripture Context Understanding Evaluation
 *
 * Tests LLMs' ability to understand the context, authorship,
 * and historical background of biblical passages.
 */

import { evalite } from "evalite";
import { generateText } from "ai";
import { benchmarkModels } from "../lib/models.js";
import { containsAnswer, theologicalAccuracyJudge } from "../lib/scorers.js";

const contextUnderstandingData = [
  {
    input: "Who wrote the Gospel of John and what was his relationship to Jesus?",
    expected: "John the Apostle, one of Jesus' twelve disciples, known as 'the disciple whom Jesus loved'",
    keyPoints: ["John", "apostle", "disciple", "loved"]
  },
  {
    input: "What was Paul's background before his conversion?",
    expected: "Paul was a Pharisee and a zealous persecutor of Christians before his conversion on the road to Damascus",
    keyPoints: ["Pharisee", "persecutor", "Damascus", "conversion"]
  },
  {
    input: "To whom was the book of Romans written and why?",
    expected: "The book of Romans was written to the church in Rome to explain the gospel and prepare for Paul's visit",
    keyPoints: ["church in Rome", "gospel", "Paul"]
  },
  {
    input: "What was the historical context of the book of Exodus?",
    expected: "Exodus describes the Israelites' slavery in Egypt and their deliverance by God through Moses",
    keyPoints: ["slavery", "Egypt", "deliverance", "Moses"]
  },
  {
    input: "Who was the primary audience of the Sermon on the Mount?",
    expected: "Jesus' disciples and the crowds who followed him",
    keyPoints: ["disciples", "crowds", "Jesus"]
  },
  {
    input: "What was the purpose of the book of Revelation?",
    expected: "To encourage persecuted Christians with visions of God's ultimate victory and the return of Christ",
    keyPoints: ["encourage", "persecuted", "victory", "return of Christ"]
  },
  {
    input: "What was the relationship between the books of Kings and Chronicles?",
    expected: "Chronicles retells much of the history in Kings but from a priestly perspective, emphasizing temple worship and God's covenant with David",
    keyPoints: ["retells", "Kings", "priestly", "temple", "David"]
  },
  {
    input: "Why did Jesus use parables in his teaching?",
    expected: "Jesus used parables to reveal truth to those with receptive hearts while concealing it from those who rejected him, and to make spiritual truths memorable through everyday stories",
    keyPoints: ["reveal truth", "receptive", "concealing", "memorable", "stories"]
  }
];

// Run the evaluation for each model
for (const { name, model } of benchmarkModels) {
  evalite(`Context Understanding - ${name}`, {
    data: contextUnderstandingData,
    task: async (input) => {
      const result = await generateText({
        model,
        prompt: `You are a Bible scholar with deep knowledge of scripture, history, and context. Answer the following question accurately and concisely.\n\n${input}`,
        maxTokens: 300,
      });
      return result.text;
    },
    scorers: [
      theologicalAccuracyJudge,
      {
        name: "Key Points Coverage",
        description: "Checks if the response includes key factual points",
        scorer: ({ output, expected }, testCase: any) => {
          const keyPoints = testCase.keyPoints || [];
          const outputLower = output.toLowerCase();

          const coveredPoints = keyPoints.filter((point: string) =>
            outputLower.includes(point.toLowerCase())
          );

          const coverage = keyPoints.length > 0 ?
            coveredPoints.length / keyPoints.length : 0;

          return {
            score: coverage,
            metadata: {
              keyPoints,
              coveredPoints,
              coverage,
              totalPoints: keyPoints.length
            }
          };
        }
      }
    ],
  });
}
