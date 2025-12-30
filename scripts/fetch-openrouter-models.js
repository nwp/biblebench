#!/usr/bin/env node

/**
 * Fetch OpenRouter Models Data
 *
 * Downloads the latest model catalog from OpenRouter API and saves it locally.
 * This should be run periodically to keep model metadata up to date.
 *
 * Requires: OPENROUTER_API_KEY environment variable
 * Output: docs/data/openrouter-models.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Paths
const OUTPUT_PATH = join(projectRoot, 'docs/data/openrouter-models.json');

// Check for API key
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error('❌ Error: OPENROUTER_API_KEY environment variable not set');
  console.error('   Get your API key at: https://openrouter.ai/keys');
  process.exit(1);
}

/**
 * Fetch models from OpenRouter API
 */
async function fetchModels() {
  console.log('🌐 Fetching models from OpenRouter API...\n');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/nwp/biblebench',
        'X-Title': 'BibleBench'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from OpenRouter API');
    }

    console.log(`✅ Fetched ${data.data.length} models from OpenRouter`);

    // Ensure output directory exists
    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

    // Write to file
    writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf8');

    console.log(`✅ Saved to ${OUTPUT_PATH}`);
    console.log(`   File size: ${(JSON.stringify(data).length / 1024).toFixed(1)}KB\n`);

    // Show summary statistics
    const withStructuredOutput = data.data.filter(m =>
      m.supported_parameters?.includes('response_format') ||
      m.supported_parameters?.includes('structured_outputs') ||
      m.supported_parameters?.includes('tools')
    ).length;

    console.log('📊 Summary:');
    console.log(`   Total models: ${data.data.length}`);
    console.log(`   With structured output: ${withStructuredOutput}`);
    console.log(`   Updated: ${new Date().toISOString()}\n`);

  } catch (error) {
    console.error('❌ Failed to fetch models:', error.message);
    process.exit(1);
  }
}

// Run the fetch
fetchModels();
