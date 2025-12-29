/**
 * Scripture Context Understanding Evaluation
 *
 * Tests LLMs' ability to understand the context, authorship,
 * and historical background of biblical passages.
 */

import { evalite } from "evalite";
import { generateText } from "ai";
import { selectedModels } from "../lib/models.js";
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

// Run A/B testing across all models
evalite.each(
  selectedModels.map(({ name, model }) => ({ name, input: { model } }))
)("Context Understanding", {
  data: async () => contextUnderstandingData,
  task: async (input, variant: any) => {
    const result = await generateText({
      model: variant.model,
      prompt: `You are a Bible scholar with deep knowledge of scripture, history, and context.

Answer the question directly and concisely. Provide the essential facts without preambles, hedging, or unnecessary elaboration.

Examples of good answers:
- Question: "Who wrote Romans?"
  Answer: "The Apostle Paul"
- Question: "What was the purpose of Revelation?"
  Answer: "To encourage persecuted Christians with visions of God's ultimate victory and Christ's return"

Do NOT add phrases like "According to tradition" or "The text was written by" - just state the facts directly.

${input}`,
    });
    return result.text;
  },
    scorers: [
      theologicalAccuracyJudge,
      {
        name: "Key Points Coverage",
        description: "Checks if the response includes key factual points using word overlap",
        scorer: (scoreInput: any) => {
          const { output } = scoreInput;
          const keyPoints = scoreInput.keyPoints || [];
          const outputLower = output.toLowerCase();

          // Count how many key points are present (flexible matching)
          let pointsFound = 0;
          const matchedPoints: string[] = [];
          const missedPoints: string[] = [];

          for (const point of keyPoints) {
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

          const coverage = keyPoints.length > 0 ?
            pointsFound / keyPoints.length : 0;

          return {
            score: coverage,
            metadata: {
              keyPoints,
              matchedPoints,
              missedPoints,
              coverage,
              totalPoints: keyPoints.length,
              pointsFound
            }
          };
        }
      }
    ],
  }
);
