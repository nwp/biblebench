/**
 * Scripture Reference Knowledge Evaluation
 *
 * Tests LLMs' ability to correctly identify where specific verses
 * or passages are found in the Bible.
 */

import { evalite } from "evalite";
import { generateText } from "ai";
import { selectedModels } from "../lib/models.js";
import { scriptureReferenceAccuracy, containsAnswer } from "../lib/scorers.js";

const referenceKnowledgeData = [
  {
    input: "Where in the Bible does it say 'For God so loved the world that he gave his one and only Son'?",
    expected: "John 3:16"
  },
  {
    input: "What is the reference for 'The Lord is my shepherd'?",
    expected: "Psalm 23:1"
  },
  {
    input: "Where is the verse 'In the beginning, God created the heavens and the earth'?",
    expected: "Genesis 1:1"
  },
  {
    input: "What is the reference for the Ten Commandments?",
    expected: "Exodus 20"
  },
  {
    input: "Where does Paul write about the armor of God?",
    expected: "Ephesians 6:10-18"
  },
  {
    input: "Where is the Beatitudes (Blessed are the poor in spirit...)?",
    expected: "Matthew 5:3-12"
  },
  {
    input: "What is the reference for the love chapter that starts with 'If I speak in the tongues of men or of angels'?",
    expected: "1 Corinthians 13"
  },
  {
    input: "Where does it say 'Jesus wept'?",
    expected: "John 11:35"
  },
  {
    input: "What is the reference for the Great Commission?",
    expected: "Matthew 28:19-20"
  },
  {
    input: "Where is the prophecy 'For to us a child is born, to us a son is given'?",
    expected: "Isaiah 9:6"
  }
];

// Run the evaluation for each model
for (const { name, model } of selectedModels) {
  evalite(`Reference Knowledge - ${name}`, {
    data: referenceKnowledgeData,
    task: async (input) => {
      const result = await generateText({
        model,
        prompt: `You are a Bible scholar. Provide the exact scripture reference (book, chapter, and verse) for the following question. Give only the reference in standard format (e.g., "John 3:16").\n\n${input}`,
      });
      return result.text;
    },
    scorers: [
      scriptureReferenceAccuracy,
      containsAnswer,
      {
        name: "Reference Format",
        description: "Checks if the reference is in correct format",
        scorer: ({ output }) => {
          // Check if output matches common Bible reference patterns
          const patterns = [
            /\b\d?\s?[A-Za-z]+\s+\d+:\d+(-\d+)?\b/,  // "John 3:16" or "1 John 3:16"
            /\b\d?\s?[A-Za-z]+\s+\d+\b/,              // "Genesis 1" (chapter only)
          ];

          const validFormat = patterns.some(pattern => pattern.test(output));

          return {
            score: validFormat ? 1 : 0,
            metadata: { validFormat, output }
          };
        }
      }
    ],
  });
}
