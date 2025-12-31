#!/usr/bin/env node

/**
 * BibleBench Dashboard Data Builder
 *
 * Transforms Evalite's granular export data into an optimized dashboard.json file.
 *
 * Input:  docs/traces/data/menu-items.json (and optionally suite-*.json files)
 * Output: docs/data/dashboard.json
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Paths
const MENU_ITEMS_PATH = join(projectRoot, 'docs/traces/data/menu-items.json');
const README_PATH = join(projectRoot, 'README.md');
const OUTPUT_PATH = join(projectRoot, 'docs/data/dashboard.json');

// Category definitions
const EVALUATION_CATEGORIES = {
  'Exact Scripture Matching': 'scripture',
  'Reference Knowledge': 'scripture',
  'Context Understanding': 'scripture',
  'Core Doctrines': 'theology',
  'Heresy Detection': 'theology',
  'Denominational Nuance': 'theology',
  'Pastoral Application': 'theology',
  'Sect Theology': 'theology',
  'Theological Orientation': 'theology',
  'Steering Compliance - Conservative': 'theology',
  'Steering Compliance - Progressive': 'theology'
};

// Evaluations excluded from overall score (descriptive, not quality metrics)
const EXCLUDED_FROM_OVERALL_SCORE = [
  'Theological Orientation'
];

// Evaluation descriptions extracted from README
const EVALUATION_DESCRIPTIONS = {
  'Exact Scripture Matching': {
    description: "Tests LLMs' ability to recall Bible verses with exact wording across multiple translations.",
    methodology: "Precise recall of Bible verses across KJV, NIV, ESV, and NASB translations. Requires perfect matches—every word, comma, and punctuation mark must be correct.",
    testCases: 48,
    interpretation: "Higher scores indicate better memorization of scripture text across translations. Perfect score requires exact wording including punctuation."
  },
  'Reference Knowledge': {
    description: "Tests ability to correctly identify where specific verses are found in the Bible.",
    methodology: "Questions about verse locations, testing knowledge of Bible book/chapter/verse structure and reference formats.",
    testCases: 10,
    interpretation: "Higher scores indicate better knowledge of where verses are located in scripture. Tests both famous and obscure passages."
  },
  'Context Understanding': {
    description: "Tests understanding of biblical context, authorship, and historical background.",
    methodology: "Questions about authorship, audience, purpose, and historical context of biblical books. Uses LLM-as-judge for nuanced evaluation.",
    testCases: 8,
    interpretation: "Higher scores indicate deeper comprehension beyond mere recitation. Tests contextual and historical knowledge."
  },
  'Core Doctrines': {
    description: "Tests understanding of foundational Christian theological concepts.",
    methodology: "Questions about Trinity, Hypostatic Union, Justification, Original Sin, Divine Sovereignty, Imago Dei, Gospel, and Resurrection. Evaluated with theological accuracy judge and completeness scoring.",
    testCases: 8,
    interpretation: "Higher scores indicate better understanding of historic Christian orthodoxy. Tests non-negotiable doctrinal foundations."
  },
  'Heresy Detection': {
    description: "Tests ability to correctly identify heretical teachings vs. orthodox doctrine.",
    methodology: "Questions about historical heresies (Adoptionism, Modalism, Pelagianism, Docetism, Marcionism, Gnosticism). Tests both identification and explanation.",
    testCases: 7,
    interpretation: "Higher scores indicate better ability to distinguish orthodoxy from heterodoxy. Tests theological discernment."
  },
  'Denominational Nuance': {
    description: "Tests fair representation of theological differences between Christian traditions without bias.",
    methodology: "Questions about Catholic vs. Protestant, baptism practices, Calvinist vs. Arminian, eschatology, and spiritual gifts. Measured with bias detection and balance scoring.",
    testCases: 6,
    interpretation: "Higher scores indicate better ability to represent multiple Christian traditions fairly without denominational bias."
  },
  'Pastoral Application': {
    description: "Tests ability to apply theology to real-world situations with wisdom, sensitivity, and biblical grounding.",
    methodology: "Real-world pastoral care scenarios requiring theology + pastoral sensitivity + practical wisdom. Multi-dimensional LLM-as-judge evaluation.",
    testCases: 5,
    interpretation: "Higher scores indicate better ability to apply theology pastorally, balancing truth with grace in practical situations."
  },
  'Sect Theology': {
    description: "Tests ability to identify teachings of groups outside historic Christian orthodoxy while maintaining respect.",
    methodology: "Questions about Mormonism (LDS), Jehovah's Witnesses, Christian Science, Oneness Pentecostalism, and Unitarian Universalism. Evaluates accuracy and respectful tone.",
    testCases: 16,
    interpretation: "Higher scores indicate ability to articulate how sect teachings depart from orthodoxy while maintaining respectful tone."
  },
  'Theological Orientation': {
    description: "Descriptive assessment of where models fall on the theological spectrum (progressive to conservative).",
    methodology: "Questions across Biblical Authority, Gender & Ministry, Sexual Ethics, Gender Identity, Social Issues, and Ecclesiology. Not pass/fail—measures theological positioning.",
    testCases: 21,
    interpretation: "Scores from 0 (progressive) to 1 (conservative). Provides insight into models' theological default positions. Not prescriptive."
  },
  'Steering Compliance - Conservative': {
    description: "Tests whether models comply with system prompts adopting conservative theological perspectives.",
    methodology: "System prompts adopting conservative positions on contested theological issues. Measures whether models comply or resist the steering.",
    testCases: 10,
    interpretation: "Higher scores indicate better compliance with conservative theological framing. Low scores may indicate refusal or hedging."
  },
  'Steering Compliance - Progressive': {
    description: "Tests whether models comply with system prompts adopting progressive theological perspectives.",
    methodology: "System prompts adopting progressive positions on contested theological issues. Measures whether models comply or resist the steering.",
    testCases: 10,
    interpretation: "Higher scores indicate better compliance with progressive theological framing. Low scores may indicate refusal or hedging."
  }
};

function main() {
  console.log('🔨 Building BibleBench dashboard data...\n');

  // Read menu items
  console.log('📖 Reading Evalite export data...');
  const menuItems = JSON.parse(readFileSync(MENU_ITEMS_PATH, 'utf-8'));

  // Extract unique models and evaluations
  const modelsMap = new Map();
  const evaluationsMap = new Map();

  console.log('🔍 Processing evaluation results...');

  for (const suite of menuItems.suites) {
    const modelId = extractModelId(suite.variantName);
    const modelDisplayName = extractModelDisplayName(suite.variantName);
    const evalName = normalizeEvalName(suite.variantGroup);
    const score = suite.score;

    // Track model scores
    if (!modelsMap.has(modelId)) {
      modelsMap.set(modelId, {
        id: modelId,
        displayName: modelDisplayName,
        provider: extractProvider(modelDisplayName),
        scores: [],
        evaluationScores: {}
      });
    }

    const model = modelsMap.get(modelId);
    model.scores.push(score);

    if (!model.evaluationScores[evalName]) {
      model.evaluationScores[evalName] = [];
    }
    model.evaluationScores[evalName].push(score);

    // Track evaluation scores
    if (!evaluationsMap.has(evalName)) {
      evaluationsMap.set(evalName, {
        id: evalName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: evalName,
        category: EVALUATION_CATEGORIES[evalName] || 'other',
        modelScores: {},
        ...EVALUATION_DESCRIPTIONS[evalName]
      });
    }

    const evaluation = evaluationsMap.get(evalName);
    if (!evaluation.modelScores[modelId]) {
      evaluation.modelScores[modelId] = [];
    }
    evaluation.modelScores[modelId].push(score);
  }

  // Calculate aggregated scores
  console.log('📊 Calculating aggregated scores...');

  const models = Array.from(modelsMap.values()).map(model => {
    // Average scores for evaluations with multiple variants (e.g., Steering Compliance)
    const evaluationScores = {};
    for (const [evalName, scores] of Object.entries(model.evaluationScores)) {
      evaluationScores[evalName] = average(scores);
    }

    // Calculate overall score (excluding descriptive evaluations)
    const scoredEvaluations = Object.entries(evaluationScores)
      .filter(([name]) => !EXCLUDED_FROM_OVERALL_SCORE.includes(name))
      .map(([, score]) => score);
    const overallScore = average(scoredEvaluations);

    // Calculate category scores (excluding descriptive evaluations)
    const scriptureEvals = Object.entries(evaluationScores)
      .filter(([name]) => EVALUATION_CATEGORIES[name] === 'scripture')
      .filter(([name]) => !EXCLUDED_FROM_OVERALL_SCORE.includes(name))
      .map(([, score]) => score);

    const theologyEvals = Object.entries(evaluationScores)
      .filter(([name]) => EVALUATION_CATEGORIES[name] === 'theology')
      .filter(([name]) => !EXCLUDED_FROM_OVERALL_SCORE.includes(name))
      .map(([, score]) => score);

    return {
      id: model.id,
      displayName: model.displayName,
      provider: model.provider,
      overallScore,
      categoryScores: {
        scripture: scriptureEvals.length > 0 ? average(scriptureEvals) : null,
        theology: theologyEvals.length > 0 ? average(theologyEvals) : null
      },
      evaluationScores
    };
  });

  // Sort models by overall score (descending)
  models.sort((a, b) => b.overallScore - a.overallScore);

  // Process evaluations
  const evaluations = Array.from(evaluationsMap.values()).map(evaluation => {
    // Average scores for models with multiple test runs
    const modelScores = {};
    for (const [modelId, scores] of Object.entries(evaluation.modelScores)) {
      modelScores[modelId] = average(scores);
    }

    return {
      ...evaluation,
      modelScores
    };
  });

  // Build dashboard data
  const dashboardData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalModels: models.length,
      totalEvaluations: evaluations.length,
      totalTestCases: evaluations.reduce((sum, e) => sum + (e.testCases || 0), 0),
      overallBenchmarkScore: menuItems.score
    },
    models,
    evaluations,
    categories: {
      scripture: {
        name: 'Scripture Accuracy',
        description: 'Tests foundational knowledge of the Bible itself—verse recall, reference knowledge, and biblical context.',
        evaluations: evaluations
          .filter(e => e.category === 'scripture')
          .map(e => e.id)
      },
      theology: {
        name: 'Theological Understanding',
        description: 'Tests comprehension of Christian doctrine, orthodoxy, denominational diversity, and pastoral application.',
        evaluations: evaluations
          .filter(e => e.category === 'theology')
          .map(e => e.id)
      }
    }
  };

  // Write output
  console.log('💾 Writing dashboard.json...');
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(dashboardData, null, 2),
    'utf-8'
  );

  // Summary
  console.log('\n✅ Dashboard data built successfully!\n');
  console.log(`📈 Summary:`);
  console.log(`   Models: ${models.length}`);
  console.log(`   Evaluations: ${evaluations.length}`);
  console.log(`   Test Cases: ${dashboardData.metadata.totalTestCases}`);
  console.log(`   Output: ${OUTPUT_PATH}`);
  console.log(`   File Size: ${(readFileSync(OUTPUT_PATH, 'utf-8').length / 1024).toFixed(1)} KB\n`);
}

// Helper functions

function average(numbers) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function extractModelId(variantName) {
  // Extract model name from variant names like:
  // - "GPT-OSS-120B" -> "gpt-oss-120b"
  // - "Transgender Identity - GPT-OSS-120B" -> "gpt-oss-120b"
  // - "Same-Sex Marriage - GPT-OSS-20B" -> "gpt-oss-20b"

  const modelName = extractModelDisplayName(variantName);
  return modelName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function extractModelDisplayName(variantName) {
  // Extract just the model name from variant names like:
  // - "GPT-OSS-120B" -> "GPT-OSS-120B"
  // - "Transgender Identity - GPT-OSS-120B" -> "GPT-OSS-120B"
  // - "Abortion Ethics - GPT-OSS-20B" -> "GPT-OSS-20B"

  // Check if it contains a dash separator (Steering Compliance variants)
  const parts = variantName.split(' - ');

  if (parts.length > 1) {
    // Take the last part (the model name)
    return parts[parts.length - 1];
  }

  // Otherwise return as-is
  return variantName;
}

function extractProvider(variantName) {
  // Simple provider extraction based on model name patterns
  const name = variantName.toLowerCase();

  if (name.includes('gpt')) return 'OpenAI';
  if (name.includes('claude')) return 'Anthropic';
  if (name.includes('gemini')) return 'Google';
  if (name.includes('grok')) return 'X.AI';
  if (name.includes('llama')) return 'Meta';
  if (name.includes('mistral')) return 'Mistral';
  if (name.includes('deepseek')) return 'DeepSeek';
  if (name.includes('intellect')) return 'Prime Intellect';
  if (name.includes('olmo')) return 'AllenAI';
  if (name.includes('nemotron')) return 'NVIDIA';
  if (name.includes('glm')) return 'Zhipu AI';
  if (name.includes('minimax')) return 'MiniMax';

  return 'OpenRouter';
}

function normalizeEvalName(variantGroup) {
  // Handle Steering Compliance special case
  if (variantGroup.startsWith('Steering Compliance')) {
    // Extract just "Steering Compliance - Conservative" or "Progressive"
    const match = variantGroup.match(/Steering Compliance - (Conservative|Progressive)/);
    if (match) {
      return `Steering Compliance - ${match[1]}`;
    }
  }

  return variantGroup;
}

// Run the script
try {
  main();
} catch (error) {
  console.error('❌ Error building dashboard:', error.message);
  console.error(error.stack);
  process.exit(1);
}
