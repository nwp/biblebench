/**
 * Scripture Context Understanding Evaluation
 *
 * Tests LLMs' ability to understand the context, authorship,
 * and historical background of biblical passages.
 */

import { evalite } from "evalite";

import { selectedModels } from "../lib/models.js";
import { safeGenerateText } from "../lib/utils.js";
import { historicalAccuracyJudge } from "../lib/scorers.js";
import type { ExtendedScorerInput } from "../lib/types.js";

const contextUnderstandingData = [
  {
    input: "Who wrote the Gospel of John and what was his relationship to Jesus?",
    expected: "John the Apostle, one of Jesus' twelve disciples, known as 'the disciple whom Jesus loved'",
    keyPhrases: ["John", "apostle", "disciple", "loved"]
  },
  {
    input: "What was Paul's background before his conversion?",
    expected: "Paul was a Pharisee and a zealous persecutor of Christians before his conversion on the road to Damascus",
    keyPhrases: ["Pharisee", "persecutor", "Damascus", "conversion"]
  },
  {
    input: "To whom was the book of Romans written and why?",
    expected: "The book of Romans was written to the church in Rome to explain the gospel and prepare for Paul's visit",
    keyPhrases: ["church in Rome", "gospel", "Paul"]
  },
  {
    input: "What was the historical context of the book of Exodus?",
    expected: "Exodus describes the Israelites' slavery in Egypt and their deliverance by God through Moses",
    keyPhrases: ["slavery", "Egypt", "deliverance", "Moses"]
  },
  {
    input: "Who was the primary audience of the Sermon on the Mount?",
    expected: "Jesus' disciples and the crowds who followed him",
    keyPhrases: ["disciples", "crowds", "Jesus"]
  },
  {
    input: "What was the purpose of the book of Revelation?",
    expected: "To encourage persecuted Christians with visions of God's ultimate victory and the return of Christ",
    keyPhrases: ["encourage", "persecuted", "victory", "return of Christ"]
  },
  {
    input: "What was the relationship between the books of Kings and Chronicles?",
    expected: "Chronicles retells much of the history in Kings but from a priestly perspective, emphasizing temple worship and God's covenant with David",
    keyPhrases: ["retells", "Kings", "priestly", "temple", "David"]
  },
  {
    input: "Why did Jesus use parables in his teaching?",
    expected: "Jesus used parables to reveal truth to those with receptive hearts while concealing it from those who rejected him, and to make spiritual truths memorable through everyday stories",
    keyPhrases: ["reveal truth", "receptive", "concealing", "memorable", "stories"]
  }
];

// Create a lookup map for keyPhrases indexed by input question
// Since Evalite only passes {input, output, expected} to scorers,
// we use this map to look up metadata using the input string as the key
const keyPhrasesMap = new Map(
  contextUnderstandingData.map(item => [item.input, item.keyPhrases || []])
);

// Run A/B testing across all models
evalite.each(
  selectedModels.map(({ name, model }) => ({ name, input: { model } }))
)("Context Understanding", {
  data: async () => contextUnderstandingData,
  task: async (input, variant: any) => {
    return await safeGenerateText(
      variant.model,
      `You are a Bible scholar with expertise in biblical history, authorship, and historical context.

Provide a clear, accurate answer to the question. Include the essential facts and key information needed to fully answer the question.

When discussing topics with scholarly debate (such as authorship), it's appropriate to indicate the traditional or majority view while noting if there are alternative perspectives.

Question: ${input}`,
    );
  },
    scorers: [
      historicalAccuracyJudge,
      {
        name: "Key Points Coverage",
        description: "Checks if the response includes key factual points using word overlap",
        scorer: (scoreInput: any) => {
          const { input, output } = scoreInput;

          // Look up keyPhrases using the input question as the key
          // Evalite only passes {input, output, expected} to scorers,
          // so we use the Map to retrieve metadata
          const keyPhrases = keyPhrasesMap.get(input) || [];

          const outputLower = output.toLowerCase();

          // Count how many key points are present (flexible matching)
          let pointsFound = 0;
          const matchedPoints: string[] = [];
          const missedPoints: string[] = [];

          for (const point of keyPhrases) {
            const pointLower = point.toLowerCase();
            const pointWords = pointLower.split(/\s+/).filter((word: string) => word.length > 2);

            // Check if at least 50% of the significant words appear in output
            const matchingWords = pointWords.filter((word: string) =>
              outputLower.includes(word)
            );

            if (matchingWords.length >= Math.max(1, pointWords.length * 0.5)) {
              pointsFound++;
              matchedPoints.push(point);
            } else {
              missedPoints.push(point);
            }
          }

          const coverage = keyPhrases.length > 0 ?
            pointsFound / keyPhrases.length : 0;

          return {
            score: coverage,
            metadata: {
              keyPhrases,
              matchedPoints,
              missedPoints,
              coverage,
              totalPoints: keyPhrases.length,
              pointsFound
            }
          };
        }
      }
    ],
  }
);
