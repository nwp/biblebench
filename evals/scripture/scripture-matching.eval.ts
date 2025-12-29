/**
 * Exact Scripture Matching Evaluation
 *
 * Tests LLMs' ability to recall Bible verses with EXACT wording across multiple translations.
 * Since scripture is sacred, this evaluation requires precise matches rather than fuzzy similarity.
 * Tests the same verses across KJV, NIV, ESV, and NASB to ensure translation-specific accuracy.
 *
 * Includes both well-known verses (John 3:16, Psalm 23:1) and less common verses
 * (Micah 6:8, Lamentations 3:22-23) for comprehensive testing.
 */

import { evalite } from "evalite";
import { generateText } from "ai";
import { selectedModels } from "../lib/models.js";
import { exactMatch } from "../lib/scorers.js";
import type { ScriptureTestData } from "../lib/types.js";

/**
 * Test data: Same verses across multiple translations for exact matching
 * Each verse is tested in 2-4 translations to verify translation-specific accuracy
 */
const exactScriptureData: ScriptureTestData[] = [
  // John 3:16 - The most famous verse in multiple translations
  {
    input: "Quote John 3:16 from the King James Version (KJV) exactly as written",
    expected: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life",
    reference: "John 3:16",
    translation: "KJV",
    keyPhrases: ["only begotten Son", "whosoever believeth", "everlasting life"]
  },
  {
    input: "Quote John 3:16 from the New International Version (NIV) exactly as written",
    expected: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life",
    reference: "John 3:16",
    translation: "NIV",
    keyPhrases: ["one and only Son", "whoever believes", "eternal life"]
  },
  {
    input: "Quote John 3:16 from the English Standard Version (ESV) exactly as written",
    expected: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life",
    reference: "John 3:16",
    translation: "ESV",
    keyPhrases: ["only Son", "whoever believes", "eternal life"]
  },
  {
    input: "Quote John 3:16 from the New American Standard Bible (NASB) exactly as written",
    expected: "For God so loved the world, that He gave His only begotten Son, that whoever believes in Him shall not perish, but have eternal life",
    reference: "John 3:16",
    translation: "NASB",
    keyPhrases: ["only begotten Son", "whoever believes", "eternal life"]
  },

  // Psalm 23:1 - The shepherd psalm
  {
    input: "Quote Psalm 23:1 from the King James Version (KJV) exactly as written",
    expected: "The Lord is my shepherd; I shall not want",
    reference: "Psalm 23:1",
    translation: "KJV",
    keyPhrases: ["I shall not want"]
  },
  {
    input: "Quote Psalm 23:1 from the New International Version (NIV) exactly as written",
    expected: "The Lord is my shepherd, I lack nothing",
    reference: "Psalm 23:1",
    translation: "NIV",
    keyPhrases: ["I lack nothing"]
  },
  {
    input: "Quote Psalm 23:1 from the English Standard Version (ESV) exactly as written",
    expected: "The Lord is my shepherd; I shall not want",
    reference: "Psalm 23:1",
    translation: "ESV",
    keyPhrases: ["I shall not want"]
  },

  // Genesis 1:1 - Creation
  {
    input: "Quote Genesis 1:1 from the King James Version (KJV) exactly as written",
    expected: "In the beginning God created the heaven and the earth",
    reference: "Genesis 1:1",
    translation: "KJV",
    keyPhrases: ["the heaven and the earth"]
  },
  {
    input: "Quote Genesis 1:1 from the New International Version (NIV) exactly as written",
    expected: "In the beginning God created the heavens and the earth",
    reference: "Genesis 1:1",
    translation: "NIV",
    keyPhrases: ["the heavens and the earth"]
  },
  {
    input: "Quote Genesis 1:1 from the English Standard Version (ESV) exactly as written",
    expected: "In the beginning, God created the heavens and the earth",
    reference: "Genesis 1:1",
    translation: "ESV",
    keyPhrases: ["the heavens and the earth"]
  },

  // Romans 3:23 - Universal sinfulness
  {
    input: "Quote Romans 3:23 from the King James Version (KJV) exactly as written",
    expected: "For all have sinned, and come short of the glory of God",
    reference: "Romans 3:23",
    translation: "KJV",
    keyPhrases: ["come short"]
  },
  {
    input: "Quote Romans 3:23 from the New International Version (NIV) exactly as written",
    expected: "for all have sinned and fall short of the glory of God",
    reference: "Romans 3:23",
    translation: "NIV",
    keyPhrases: ["fall short"]
  },
  {
    input: "Quote Romans 3:23 from the English Standard Version (ESV) exactly as written",
    expected: "for all have sinned and fall short of the glory of God",
    reference: "Romans 3:23",
    translation: "ESV",
    keyPhrases: ["fall short"]
  },

  // Proverbs 3:5-6 - Trust in the Lord
  {
    input: "Quote Proverbs 3:5-6 from the King James Version (KJV) exactly as written",
    expected: "Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths",
    reference: "Proverbs 3:5-6",
    translation: "KJV",
    keyPhrases: ["thine heart", "lean not unto", "he shall direct thy paths"]
  },
  {
    input: "Quote Proverbs 3:5-6 from the New International Version (NIV) exactly as written",
    expected: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight",
    reference: "Proverbs 3:5-6",
    translation: "NIV",
    keyPhrases: ["submit to him", "make your paths straight"]
  },
  {
    input: "Quote Proverbs 3:5-6 from the English Standard Version (ESV) exactly as written",
    expected: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths",
    reference: "Proverbs 3:5-6",
    translation: "ESV",
    keyPhrases: ["do not lean", "make straight your paths"]
  },

  // Philippians 4:13 - Strength in Christ
  {
    input: "Quote Philippians 4:13 from the King James Version (KJV) exactly as written",
    expected: "I can do all things through Christ which strengtheneth me",
    reference: "Philippians 4:13",
    translation: "KJV",
    keyPhrases: ["through Christ", "strengtheneth me"]
  },
  {
    input: "Quote Philippians 4:13 from the New International Version (NIV) exactly as written",
    expected: "I can do all this through him who gives me strength",
    reference: "Philippians 4:13",
    translation: "NIV",
    keyPhrases: ["all this", "gives me strength"]
  },
  {
    input: "Quote Philippians 4:13 from the English Standard Version (ESV) exactly as written",
    expected: "I can do all things through him who strengthens me",
    reference: "Philippians 4:13",
    translation: "ESV",
    keyPhrases: ["all things", "strengthens me"]
  },

  // Isaiah 40:31 - Waiting on the Lord
  {
    input: "Quote Isaiah 40:31 from the King James Version (KJV) exactly as written",
    expected: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint",
    reference: "Isaiah 40:31",
    translation: "KJV",
    keyPhrases: ["wait upon", "mount up with wings as eagles"]
  },
  {
    input: "Quote Isaiah 40:31 from the New International Version (NIV) exactly as written",
    expected: "but those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint",
    reference: "Isaiah 40:31",
    translation: "NIV",
    keyPhrases: ["hope in", "soar on wings like eagles"]
  },

  // Jeremiah 29:11 - God's plans
  {
    input: "Quote Jeremiah 29:11 from the King James Version (KJV) exactly as written",
    expected: "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end",
    reference: "Jeremiah 29:11",
    translation: "KJV",
    keyPhrases: ["saith the Lord", "expected end"]
  },
  {
    input: "Quote Jeremiah 29:11 from the New International Version (NIV) exactly as written",
    expected: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future",
    reference: "Jeremiah 29:11",
    translation: "NIV",
    keyPhrases: ["declares the Lord", "hope and a future"]
  },
  {
    input: "Quote Jeremiah 29:11 from the English Standard Version (ESV) exactly as written",
    expected: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope",
    reference: "Jeremiah 29:11",
    translation: "ESV",
    keyPhrases: ["declares the Lord", "future and a hope"]
  },

  // Romans 8:28 - All things work together
  {
    input: "Quote Romans 8:28 from the King James Version (KJV) exactly as written",
    expected: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose",
    reference: "Romans 8:28",
    translation: "KJV",
    keyPhrases: ["work together for good", "them that love God"]
  },
  {
    input: "Quote Romans 8:28 from the New International Version (NIV) exactly as written",
    expected: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose",
    reference: "Romans 8:28",
    translation: "NIV",
    keyPhrases: ["God works for the good", "those who love him"]
  },
  {
    input: "Quote Romans 8:28 from the English Standard Version (ESV) exactly as written",
    expected: "And we know that for those who love God all things work together for good, for those who are called according to his purpose",
    reference: "Romans 8:28",
    translation: "ESV",
    keyPhrases: ["for those who love God", "work together for good"]
  },

  // Matthew 28:19-20 - The Great Commission
  {
    input: "Quote Matthew 28:19-20 from the King James Version (KJV) exactly as written",
    expected: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world",
    reference: "Matthew 28:19-20",
    translation: "KJV",
    keyPhrases: ["teach all nations", "Holy Ghost", "end of the world"]
  },
  {
    input: "Quote Matthew 28:19-20 from the New International Version (NIV) exactly as written",
    expected: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age",
    reference: "Matthew 28:19-20",
    translation: "NIV",
    keyPhrases: ["make disciples", "Holy Spirit", "end of the age"]
  },
  {
    input: "Quote Matthew 28:19-20 from the English Standard Version (ESV) exactly as written",
    expected: "Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, teaching them to observe all that I have commanded you. And behold, I am with you always, to the end of the age",
    reference: "Matthew 28:19-20",
    translation: "ESV",
    keyPhrases: ["make disciples", "Holy Spirit", "end of the age"]
  },

  // LESS COMMON VERSES - Testing depth of knowledge

  // Micah 6:8 - Justice, mercy, humility
  {
    input: "Quote Micah 6:8 from the King James Version (KJV) exactly as written",
    expected: "He hath shewed thee, O man, what is good; and what doth the Lord require of thee, but to do justly, and to love mercy, and to walk humbly with thy God",
    reference: "Micah 6:8",
    translation: "KJV",
    keyPhrases: ["He hath shewed thee", "do justly", "love mercy"]
  },
  {
    input: "Quote Micah 6:8 from the New International Version (NIV) exactly as written",
    expected: "He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God",
    reference: "Micah 6:8",
    translation: "NIV",
    keyPhrases: ["O mortal", "act justly", "love mercy"]
  },
  {
    input: "Quote Micah 6:8 from the English Standard Version (ESV) exactly as written",
    expected: "He has told you, O man, what is good; and what does the Lord require of you but to do justice, and to love kindness, and to walk humbly with your God",
    reference: "Micah 6:8",
    translation: "ESV",
    keyPhrases: ["He has told you", "do justice", "love kindness"]
  },

  // 2 Timothy 3:16 - Scripture is God-breathed
  {
    input: "Quote 2 Timothy 3:16 from the King James Version (KJV) exactly as written",
    expected: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness",
    reference: "2 Timothy 3:16",
    translation: "KJV",
    keyPhrases: ["given by inspiration of God", "profitable for doctrine"]
  },
  {
    input: "Quote 2 Timothy 3:16 from the New International Version (NIV) exactly as written",
    expected: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness",
    reference: "2 Timothy 3:16",
    translation: "NIV",
    keyPhrases: ["God-breathed", "useful for teaching"]
  },
  {
    input: "Quote 2 Timothy 3:16 from the English Standard Version (ESV) exactly as written",
    expected: "All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness",
    reference: "2 Timothy 3:16",
    translation: "ESV",
    keyPhrases: ["breathed out by God", "profitable for teaching"]
  },

  // James 1:5 - Ask for wisdom
  {
    input: "Quote James 1:5 from the King James Version (KJV) exactly as written",
    expected: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him",
    reference: "James 1:5",
    translation: "KJV",
    keyPhrases: ["giveth to all men liberally", "upbraideth not"]
  },
  {
    input: "Quote James 1:5 from the New International Version (NIV) exactly as written",
    expected: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you",
    reference: "James 1:5",
    translation: "NIV",
    keyPhrases: ["gives generously", "without finding fault"]
  },
  {
    input: "Quote James 1:5 from the English Standard Version (ESV) exactly as written",
    expected: "If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him",
    reference: "James 1:5",
    translation: "ESV",
    keyPhrases: ["gives generously", "without reproach"]
  },

  // Lamentations 3:22-23 - Mercies new every morning
  {
    input: "Quote Lamentations 3:22-23 from the King James Version (KJV) exactly as written",
    expected: "It is of the Lord's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness",
    reference: "Lamentations 3:22-23",
    translation: "KJV",
    keyPhrases: ["Lord's mercies", "new every morning", "thy faithfulness"]
  },
  {
    input: "Quote Lamentations 3:22-23 from the New International Version (NIV) exactly as written",
    expected: "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness",
    reference: "Lamentations 3:22-23",
    translation: "NIV",
    keyPhrases: ["Lord's great love", "new every morning", "your faithfulness"]
  },
  {
    input: "Quote Lamentations 3:22-23 from the English Standard Version (ESV) exactly as written",
    expected: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness",
    reference: "Lamentations 3:22-23",
    translation: "ESV",
    keyPhrases: ["steadfast love", "new every morning", "your faithfulness"]
  },

  // Colossians 3:23 - Work as for the Lord
  {
    input: "Quote Colossians 3:23 from the King James Version (KJV) exactly as written",
    expected: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men",
    reference: "Colossians 3:23",
    translation: "KJV",
    keyPhrases: ["whatsoever ye do", "do it heartily", "as to the Lord"]
  },
  {
    input: "Quote Colossians 3:23 from the New International Version (NIV) exactly as written",
    expected: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters",
    reference: "Colossians 3:23",
    translation: "NIV",
    keyPhrases: ["work at it with all your heart", "working for the Lord"]
  },
  {
    input: "Quote Colossians 3:23 from the English Standard Version (ESV) exactly as written",
    expected: "Whatever you do, work heartily, as for the Lord and not for men",
    reference: "Colossians 3:23",
    translation: "ESV",
    keyPhrases: ["work heartily", "as for the Lord"]
  },

  // 1 Peter 3:15 - Always be ready to give an answer
  {
    input: "Quote 1 Peter 3:15 from the King James Version (KJV) exactly as written",
    expected: "But sanctify the Lord God in your hearts: and be ready always to give an answer to every man that asketh you a reason of the hope that is in you with meekness and fear",
    reference: "1 Peter 3:15",
    translation: "KJV",
    keyPhrases: ["sanctify the Lord God", "give an answer", "meekness and fear"]
  },
  {
    input: "Quote 1 Peter 3:15 from the New International Version (NIV) exactly as written",
    expected: "But in your hearts revere Christ as Lord. Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have. But do this with gentleness and respect",
    reference: "1 Peter 3:15",
    translation: "NIV",
    keyPhrases: ["revere Christ as Lord", "give an answer", "gentleness and respect"]
  },
  {
    input: "Quote 1 Peter 3:15 from the English Standard Version (ESV) exactly as written",
    expected: "but in your hearts honor Christ the Lord as holy, always being prepared to make a defense to anyone who asks you for a reason for the hope that is in you; yet do it with gentleness and respect",
    reference: "1 Peter 3:15",
    translation: "ESV",
    keyPhrases: ["honor Christ the Lord", "make a defense", "gentleness and respect"]
  },
];

// Run A/B testing across all models
evalite.each(
  selectedModels.map(({ name, model }) => ({ name, input: { model } }))
)("Exact Scripture Matching", {
  data: async () => exactScriptureData,
  task: async (input, variant: any) => {
    const result = await generateText({
      model: variant.model,
      prompt: `You are a Bible scholar with expertise in various Bible translations.
Your task is to quote the exact verse text from the specified translation.
Be EXTREMELY PRECISE with the wording - every word, comma, and punctuation mark matters.
Quote ONLY the verse text itself without adding the reference, quotation marks, or any additional commentary.

${input}`,
    });
    return result.text;
  },
  scorers: [exactMatch],
});
