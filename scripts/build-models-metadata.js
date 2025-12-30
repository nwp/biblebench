#!/usr/bin/env node

/**
 * BibleBench Models Metadata Builder
 *
 * Extracts model specifications from OpenRouter API data and maps them
 * to BibleBench model names.
 *
 * Input:  /tmp/openrouter_models.json (OpenRouter API response)
 * Output: docs/data/models-metadata.json
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Paths
const OPENROUTER_DATA_PATH = join(projectRoot, 'docs/data/openrouter-models.json');
const DASHBOARD_PATH = join(projectRoot, 'docs/data/dashboard.json');
const OUTPUT_PATH = join(projectRoot, 'docs/data/models-metadata.json');

/**
 * Manual mapping of BibleBench model names to OpenRouter IDs
 * This handles special cases and naming differences
 */
const MODEL_NAME_MAP = {
  'GPT-5.2': 'openai/gpt-5.2',
  'GPT-5.2 Pro': 'openai/gpt-5.2-pro',
  'GPT-5 Nano': 'openai/gpt-5-nano',
  'GPT-5 Mini': 'openai/gpt-5-mini',
  'GPT-OSS-120B': 'openai/gpt-oss-120b',
  'GPT-OSS-20B': 'openai/gpt-oss-20b',
  'Claude Haiku 4.5': 'anthropic/claude-haiku-4.5',
  'Claude Sonnet 4.5': 'anthropic/claude-sonnet-4.5',
  'Claude Opus 4.5': 'anthropic/claude-opus-4.5',
  'Grok 4.1 Fast': 'x-ai/grok-4.1-fast',
  'Grok 4': 'x-ai/grok-4',
  'Llama 4 Maverick': 'meta-llama/llama-4-maverick',
  'Gemini 3 Flash Preview': 'google/gemini-3-flash-preview',
  'Gemini 3 Pro Preview': 'google/gemini-3-pro-preview',
  'Mistral Large 2512': 'mistralai/mistral-large-2512',
  'DeepSeek V3.2': 'deepseek/deepseek-v3.2',
  'Intellect-3': 'prime-intellect/intellect-3',
  'GLM-4.7': 'z-ai/glm-4.7',
  'MiniMax M2.1': 'minimax/minimax-m2.1',
};

/**
 * Converts a display name to a URL-safe ID
 */
function nameToId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Finds the OpenRouter model ID for a given BibleBench model name
 */
function findOpenRouterId(name, provider, data) {
  // Check manual mapping first
  if (MODEL_NAME_MAP[name]) {
    return MODEL_NAME_MAP[name];
  }

  // Try to find by searching OpenRouter data
  // Normalize both names for comparison
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const model of data.data) {
    const modelName = model.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (modelName.includes(normalizedName) || normalizedName.includes(modelName)) {
      return model.id;
    }
  }

  console.warn(`⚠️  Could not find OpenRouter ID for model: ${name}`);
  return null;
}

/**
 * Main build function
 */
async function buildMetadata() {
  console.log('📊 Building models metadata...\n');

  // Load OpenRouter data
  let openrouterData;
  try {
    const rawData = readFileSync(OPENROUTER_DATA_PATH, 'utf8');
    openrouterData = JSON.parse(rawData);
    console.log(`✅ Loaded ${openrouterData.data.length} models from OpenRouter`);
  } catch (error) {
    console.error(`❌ Error loading OpenRouter data: ${error.message}`);
    console.error(`   Make sure /tmp/openrouter_models.json exists`);
    process.exit(1);
  }

  // Load benchmark models from dashboard.json
  let benchmarkModels;
  try {
    const dashboardData = JSON.parse(readFileSync(DASHBOARD_PATH, 'utf8'));
    benchmarkModels = dashboardData.models.map(m => ({
      name: m.displayName,
      provider: m.provider
    }));
    console.log(`✅ Loaded ${benchmarkModels.length} benchmark models from dashboard\n`);
  } catch (error) {
    console.error(`❌ Error loading dashboard data: ${error.message}`);
    process.exit(1);
  }

  // Build metadata object
  const metadata = {};
  let successCount = 0;
  let failureCount = 0;

  for (const { name, provider } of benchmarkModels) {
    const modelId = nameToId(name);
    const openrouterId = findOpenRouterId(name, provider, openrouterData);

    if (!openrouterId) {
      failureCount++;
      continue;
    }

    const orModel = openrouterData.data.find(m => m.id === openrouterId);

    if (!orModel) {
      console.warn(`⚠️  Model not found in OpenRouter data: ${openrouterId}`);
      failureCount++;
      continue;
    }

    metadata[modelId] = {
      id: modelId,
      openrouterId: orModel.id,
      displayName: name,
      provider: provider || 'unknown',
      description: orModel.description || `${name} AI model`,
      contextLength: orModel.context_length || 0,
      cost: {
        prompt: parseFloat(orModel.pricing.prompt) || 0,
        completion: parseFloat(orModel.pricing.completion) || 0,
        currency: 'USD',
        unit: 'per token'
      },
      modalities: {
        input: orModel.architecture?.input_modalities || ['text'],
        output: orModel.architecture?.output_modalities || ['text']
      },
      capabilities: [
        ...(orModel.supported_parameters?.includes('response_format') ? ['structured output'] : []),
        ...(orModel.supported_parameters?.includes('tools') ? ['function calling'] : []),
      ],
      architecture: orModel.architecture?.instruct_type || 'Unknown',
      released: orModel.created ? new Date(orModel.created * 1000).getFullYear() : null
    };

    console.log(`✅ ${name} → ${openrouterId}`);
    successCount++;
  }

  console.log(`\n📝 Processed ${successCount} models successfully`);
  if (failureCount > 0) {
    console.log(`⚠️  ${failureCount} models failed to process`);
  }

  // Ensure output directory exists
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

  // Write metadata to file
  writeFileSync(OUTPUT_PATH, JSON.stringify(metadata, null, 2), 'utf8');
  console.log(`\n✅ Generated ${OUTPUT_PATH}`);
  console.log(`   ${Object.keys(metadata).length} models with full metadata\n`);
}

// Run the build
buildMetadata().catch(error => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
