/**
 * Scripture Translation Recall Evaluation
 *
 * Tests LLMs' ability to accurately recall Bible verses in specific translations
 * (KJV, NIV, ESV, NASB, NLT, etc.) and distinguish between translation variations.
 */

import { evalite } from "evalite";
import { generateText } from "ai";
import { benchmarkModels } from "../lib/models.js";
import { levenshteinSimilarity, containsAnswer } from "../lib/scorers.js";

const translationRecallData = [
  // John 3:16 - Most famous verse in different translations
  {
    input: "Quote John 3:16 in the King James Version (KJV)",
    expected: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life",
    reference: "John 3:16",
    translation: "KJV",
    keyPhrases: ["only begotten Son", "whosoever believeth", "everlasting life"]
  },
  {
    input: "Quote John 3:16 in the New International Version (NIV)",
    expected: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life",
    reference: "John 3:16",
    translation: "NIV",
    keyPhrases: ["one and only Son", "whoever believes", "eternal life"]
  },
  {
    input: "Quote John 3:16 in the English Standard Version (ESV)",
    expected: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life",
    reference: "John 3:16",
    translation: "ESV",
    keyPhrases: ["only Son", "whoever believes", "eternal life"]
  },

  // Psalm 23:1 - Shepherd psalm
  {
    input: "Quote Psalm 23:1 in the King James Version (KJV)",
    expected: "The Lord is my shepherd; I shall not want",
    reference: "Psalm 23:1",
    translation: "KJV",
    keyPhrases: ["I shall not want"]
  },
  {
    input: "Quote Psalm 23:1 in the New International Version (NIV)",
    expected: "The Lord is my shepherd, I lack nothing",
    reference: "Psalm 23:1",
    translation: "NIV",
    keyPhrases: ["I lack nothing"]
  },
  {
    input: "Quote Psalm 23:1 in the New Living Translation (NLT)",
    expected: "The Lord is my shepherd; I have all that I need",
    reference: "Psalm 23:1",
    translation: "NLT",
    keyPhrases: ["I have all that I need"]
  },

  // Genesis 1:1 - Creation
  {
    input: "Quote Genesis 1:1 in the King James Version (KJV)",
    expected: "In the beginning God created the heaven and the earth",
    reference: "Genesis 1:1",
    translation: "KJV",
    keyPhrases: ["the heaven and the earth"]
  },
  {
    input: "Quote Genesis 1:1 in the English Standard Version (ESV)",
    expected: "In the beginning, God created the heavens and the earth",
    reference: "Genesis 1:1",
    translation: "ESV",
    keyPhrases: ["the heavens and the earth"]
  },

  // Philippians 4:13 - "I can do all things"
  {
    input: "Quote Philippians 4:13 in the King James Version (KJV)",
    expected: "I can do all things through Christ which strengtheneth me",
    reference: "Philippians 4:13",
    translation: "KJV",
    keyPhrases: ["which strengtheneth me"]
  },
  {
    input: "Quote Philippians 4:13 in the New International Version (NIV)",
    expected: "I can do all this through him who gives me strength",
    reference: "Philippians 4:13",
    translation: "NIV",
    keyPhrases: ["through him who gives me strength"]
  },
  {
    input: "Quote Philippians 4:13 in the New American Standard Bible (NASB)",
    expected: "I can do all things through Him who strengthens me",
    reference: "Philippians 4:13",
    translation: "NASB",
    keyPhrases: ["through Him who strengthens me"]
  },

  // Proverbs 3:5 - Trust in the Lord
  {
    input: "Quote Proverbs 3:5 in the King James Version (KJV)",
    expected: "Trust in the Lord with all thine heart; and lean not unto thine own understanding",
    reference: "Proverbs 3:5",
    translation: "KJV",
    keyPhrases: ["thine heart", "lean not unto thine own understanding"]
  },
  {
    input: "Quote Proverbs 3:5 in the New International Version (NIV)",
    expected: "Trust in the Lord with all your heart and lean not on your own understanding",
    reference: "Proverbs 3:5",
    translation: "NIV",
    keyPhrases: ["your heart", "lean not on your own understanding"]
  },
  {
    input: "Quote Proverbs 3:5 in the Christian Standard Bible (CSB)",
    expected: "Trust in the Lord with all your heart, and do not rely on your own understanding",
    reference: "Proverbs 3:5",
    translation: "CSB",
    keyPhrases: ["do not rely on your own understanding"]
  },

  // Romans 8:28 - All things work together
  {
    input: "Quote Romans 8:28 in the King James Version (KJV)",
    expected: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose",
    reference: "Romans 8:28",
    translation: "KJV",
    keyPhrases: ["work together for good", "them that love God", "the called"]
  },
  {
    input: "Quote Romans 8:28 in the English Standard Version (ESV)",
    expected: "And we know that for those who love God all things work together for good, for those who are called according to his purpose",
    reference: "Romans 8:28",
    translation: "ESV",
    keyPhrases: ["for those who love God", "work together for good", "called according to his purpose"]
  },

  // Matthew 6:33 - Seek first the kingdom
  {
    input: "Quote Matthew 6:33 in the King James Version (KJV)",
    expected: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you",
    reference: "Matthew 6:33",
    translation: "KJV",
    keyPhrases: ["seek ye first", "shall be added unto you"]
  },
  {
    input: "Quote Matthew 6:33 in the New International Version (NIV)",
    expected: "But seek first his kingdom and his righteousness, and all these things will be given to you as well",
    reference: "Matthew 6:33",
    translation: "NIV",
    keyPhrases: ["seek first", "will be given to you"]
  },

  // Isaiah 40:31 - Waiting on the Lord
  {
    input: "Quote Isaiah 40:31 in the King James Version (KJV)",
    expected: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint",
    reference: "Isaiah 40:31",
    translation: "KJV",
    keyPhrases: ["wait upon the Lord", "mount up with wings as eagles", "not be weary", "not faint"]
  },
  {
    input: "Quote Isaiah 40:31 in the New International Version (NIV)",
    expected: "but those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint",
    reference: "Isaiah 40:31",
    translation: "NIV",
    keyPhrases: ["hope in the Lord", "soar on wings like eagles", "not grow weary", "not be faint"]
  },

  // Jeremiah 29:11 - Plans to prosper
  {
    input: "Quote Jeremiah 29:11 in the King James Version (KJV)",
    expected: "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end",
    reference: "Jeremiah 29:11",
    translation: "KJV",
    keyPhrases: ["thoughts that I think", "saith the Lord", "expected end"]
  },
  {
    input: "Quote Jeremiah 29:11 in the New International Version (NIV)",
    expected: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future",
    reference: "Jeremiah 29:11",
    translation: "NIV",
    keyPhrases: ["plans I have for you", "declares the Lord", "hope and a future"]
  },
  {
    input: "Quote Jeremiah 29:11 in the New Living Translation (NLT)",
    expected: "For I know the plans I have for you, says the Lord. They are plans for good and not for disaster, to give you a future and a hope",
    reference: "Jeremiah 29:11",
    translation: "NLT",
    keyPhrases: ["plans for good", "not for disaster", "future and a hope"]
  },

  // 1 Corinthians 13:4-5 - Love is patient (partial)
  {
    input: "Quote 1 Corinthians 13:4-5 in the King James Version (KJV)",
    expected: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up, Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil",
    reference: "1 Corinthians 13:4-5",
    translation: "KJV",
    keyPhrases: ["Charity suffereth long", "vaunteth not", "puffed up", "thinketh no evil"]
  },
  {
    input: "Quote 1 Corinthians 13:4-5 in the New International Version (NIV)",
    expected: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs",
    reference: "1 Corinthians 13:4-5",
    translation: "NIV",
    keyPhrases: ["Love is patient", "does not boast", "not proud", "keeps no record of wrongs"]
  },

  // Translation identification test
  {
    input: "Which Bible translation uses the phrase 'only begotten Son' in John 3:16?",
    expected: "King James Version (KJV) or New King James Version (NKJV)",
    reference: "John 3:16",
    translation: "Identification",
    keyPhrases: ["KJV", "King James"]
  },
  {
    input: "Which modern Bible translation says 'I lack nothing' in Psalm 23:1?",
    expected: "New International Version (NIV)",
    reference: "Psalm 23:1",
    translation: "Identification",
    keyPhrases: ["NIV", "New International"]
  }
];

// Run the evaluation for each model
for (const { name, model } of benchmarkModels) {
  evalite(`Translation Recall - ${name}`, {
    data: translationRecallData,
    task: async (input) => {
      const result = await generateText({
        model,
        prompt: `You are a Bible scholar with expertise in various Bible translations. Provide the exact verse text from the specified translation. Be precise with the wording - different translations use different phrases. Quote only the verse text without the reference.\n\n${input}`,
      });
      return result.text;
    },
    scorers: [
      levenshteinSimilarity,
      {
        name: "Translation Accuracy",
        description: "Measures accuracy of translation-specific wording",
        scorer: (scoreInput: any) => {
          const { output, expected } = scoreInput;
          // Normalize text for comparison
          const normalize = (text: string) =>
            text.toLowerCase()
              .replace(/[.,;:!?"'–—]/g, "")
              .replace(/\s+/g, " ")
              .trim();

          const normalizedOutput = normalize(output);
          const normalizedExpected = normalize(expected);

          // Check for exact match
          const exactMatch = normalizedOutput === normalizedExpected;

          // Calculate word overlap
          const wordsExpected = normalizedExpected.split(" ");
          const wordsOutput = normalizedOutput.split(" ");
          const matchedWords = wordsExpected.filter(word =>
            wordsOutput.includes(word)
          ).length;
          const wordOverlap = matchedWords / wordsExpected.length;

          // Check if key phrases are present (translation-specific markers)
          const keyPhrases = scoreInput.keyPhrases || [];
          const keyPhrasesFound = keyPhrases.filter((phrase: string) =>
            normalizedOutput.includes(normalize(phrase))
          );
          const keyPhraseScore = keyPhrases.length > 0 ?
            keyPhrasesFound.length / keyPhrases.length : 1;

          // Final score calculation
          let score = 0;
          if (exactMatch) {
            score = 1.0;
          } else {
            // Weight word overlap (60%) and key phrases (40%)
            score = (wordOverlap * 0.6) + (keyPhraseScore * 0.4);
          }

          return {
            score,
            metadata: {
              exactMatch,
              wordOverlap,
              matchedWords: matchedWords,
              totalWords: wordsExpected.length,
              keyPhrasesFound: keyPhrasesFound.length,
              totalKeyPhrases: keyPhrases.length,
              keyPhraseScore,
              translation: scoreInput.translation
            }
          };
        }
      },
      {
        name: "Translation Fidelity",
        description: "Checks if response uses the correct translation's distinctive vocabulary",
        scorer: (scoreInput: any) => {
          const { output } = scoreInput;
          const keyPhrases = scoreInput.keyPhrases || [];
          if (keyPhrases.length === 0) return { score: 1, metadata: { na: true } };

          const outputLower = output.toLowerCase();
          const normalize = (text: string) => text.toLowerCase().replace(/[.,;:!?"']/g, "").trim();

          const phrasesPresent = keyPhrases.filter((phrase: string) =>
            outputLower.includes(normalize(phrase))
          );

          const fidelityScore = phrasesPresent.length / keyPhrases.length;

          // Bonus: check for incorrect translation markers
          const translationMarkers: Record<string, string[]> = {
            "KJV": ["thee", "thou", "thy", "thine", "saith", "unto", "ye", "begotten"],
            "NIV": ["one and only", "will be", "declares"],
            "NLT": ["says the", "is like this"],
            "ESV": ["should", "will"],
          };

          const currentTranslation = scoreInput.translation;
          let penaltyApplied = false;

          // Check if wrong translation markers are present
          for (const [trans, markers] of Object.entries(translationMarkers)) {
            if (trans !== currentTranslation) {
              for (const marker of markers) {
                if (outputLower.includes(marker.toLowerCase())) {
                  penaltyApplied = true;
                  break;
                }
              }
            }
            if (penaltyApplied) break;
          }

          const finalScore = penaltyApplied ? fidelityScore * 0.7 : fidelityScore;

          return {
            score: finalScore,
            metadata: {
              keyPhrasesPresent: phrasesPresent,
              totalKeyPhrases: keyPhrases.length,
              penaltyApplied,
              translation: currentTranslation
            }
          };
        }
      }
    ],
  });
}
