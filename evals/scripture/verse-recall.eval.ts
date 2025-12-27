/**
 * Scripture Verse Recall Evaluation
 *
 * Tests LLMs' ability to accurately recall and complete famous Bible verses.
 * This is a foundational test of scripture knowledge and memorization.
 */

import { evalite } from "evalite";
import { generateText } from "ai";
import { benchmarkModels } from "../lib/models.js";
import { exactMatch, levenshteinSimilarity, containsAnswer } from "../lib/scorers.js";

const verseRecallData = [
  {
    input: "Complete this verse: 'For God so loved the world that he gave his one and only Son...'",
    expected: "that whoever believes in him shall not perish but have eternal life",
    reference: "John 3:16"
  },
  {
    input: "What does Psalm 23:1 say?",
    expected: "The Lord is my shepherd, I shall not want",
    reference: "Psalm 23:1"
  },
  {
    input: "Complete this verse: 'In the beginning was the Word, and the Word was with God...'",
    expected: "and the Word was God",
    reference: "John 1:1"
  },
  {
    input: "What does Romans 3:23 say?",
    expected: "for all have sinned and fall short of the glory of God",
    reference: "Romans 3:23"
  },
  {
    input: "Complete this verse: 'Trust in the Lord with all your heart...'",
    expected: "and lean not on your own understanding",
    reference: "Proverbs 3:5"
  },
  {
    input: "What does Romans 8:28 say?",
    expected: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose",
    reference: "Romans 8:28"
  },
  {
    input: "Complete this verse: 'I can do all things...'",
    expected: "through Christ who strengthens me",
    reference: "Philippians 4:13"
  },
  {
    input: "What does Matthew 28:19-20 say about the Great Commission?",
    expected: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you",
    reference: "Matthew 28:19-20"
  },
  {
    input: "Complete this verse: 'For the wages of sin is death...'",
    expected: "but the gift of God is eternal life in Christ Jesus our Lord",
    reference: "Romans 6:23"
  },
  {
    input: "What does 1 John 4:8 say about God?",
    expected: "God is love",
    reference: "1 John 4:8"
  }
];

// Run the evaluation for each model
for (const { name, model } of benchmarkModels) {
  evalite(`Verse Recall - ${name}`, {
    data: verseRecallData,
    task: async (input) => {
      const result = await generateText({
        model,
        prompt: `You are a Bible scholar. Answer the following question about scripture accurately and concisely. Provide only the verse text without the reference.\n\n${input}`,
        maxTokens: 200,
      });
      return result.text;
    },
    scorers: [
      levenshteinSimilarity,
      containsAnswer,
      {
        name: "Verse Accuracy",
        description: "Comprehensive verse accuracy score",
        scorer: ({ output, expected }) => {
          // Normalize text for comparison
          const normalize = (text: string) =>
            text.toLowerCase()
              .replace(/[.,;:!?"']/g, "")
              .replace(/\s+/g, " ")
              .trim();

          const normalizedOutput = normalize(output);
          const normalizedExpected = normalize(expected);

          // Calculate different levels of accuracy
          const exactMatch = normalizedOutput === normalizedExpected;
          const contains = normalizedOutput.includes(normalizedExpected);
          const wordsExpected = normalizedExpected.split(" ");
          const wordsOutput = normalizedOutput.split(" ");

          // Calculate word overlap
          const matchedWords = wordsExpected.filter(word =>
            wordsOutput.includes(word)
          ).length;
          const wordOverlap = matchedWords / wordsExpected.length;

          let score = 0;
          if (exactMatch) score = 1.0;
          else if (contains) score = 0.9;
          else if (wordOverlap > 0.8) score = 0.8;
          else if (wordOverlap > 0.6) score = 0.6;
          else if (wordOverlap > 0.4) score = 0.4;
          else score = wordOverlap * 0.4;

          return {
            score,
            metadata: {
              exactMatch,
              contains,
              wordOverlap,
              matchedWords,
              totalWords: wordsExpected.length
            }
          };
        }
      }
    ],
  });
}
