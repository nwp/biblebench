#!/usr/bin/env node

/**
 * BibleBench Models Usage Aggregator
 *
 * Aggregates token usage from Evalite trace files and calculates costs
 * based on model pricing from models-metadata.json.
 *
 * Input:  docs/traces/data/*.json (trace files)
 *         docs/data/models-metadata.json (pricing data)
 * Output: docs/data/models-usage.json
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Paths
const TRACES_DIR = join(projectRoot, 'docs/traces/data');
const METADATA_PATH = join(projectRoot, 'docs/data/models-metadata.json');
const OUTPUT_PATH = join(projectRoot, 'docs/data/models-usage.json');

/**
 * Converts a display name to a URL-safe ID
 */
function nameToId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Main aggregation function
 */
async function aggregateUsage() {
  console.log('📊 Aggregating token usage from trace files...\n');

  // Load metadata for pricing
  let metadata;
  try {
    metadata = JSON.parse(readFileSync(METADATA_PATH, 'utf8'));
    console.log(`✅ Loaded pricing for ${Object.keys(metadata).length} models`);
  } catch (error) {
    console.error(`❌ Error loading metadata: ${error.message}`);
    console.error(`   Run build-models-metadata.js first`);
    process.exit(1);
  }

  // Read all trace files
  let traceFiles;
  try {
    traceFiles = readdirSync(TRACES_DIR).filter(f => f.endsWith('.json') && f !== 'menu-items.json');
    console.log(`✅ Found ${traceFiles.length} trace files\n`);
  } catch (error) {
    console.error(`❌ Error reading traces directory: ${error.message}`);
    process.exit(1);
  }

  // Initialize usage tracking
  const usage = {};
  let filesProcessed = 0;
  let filesSkipped = 0;

  // Process each trace file
  for (const filename of traceFiles) {
    try {
      const filePath = join(TRACES_DIR, filename);
      const trace = JSON.parse(readFileSync(filePath, 'utf8'));

      // Extract model name from suite.variant_name
      const modelName = trace.suite?.variant_name;
      if (!modelName) {
        filesSkipped++;
        continue;
      }

      const modelId = nameToId(modelName);

      // Initialize model usage if not exists
      if (!usage[modelId]) {
        usage[modelId] = {
          modelId,
          displayName: modelName,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          evaluationsCount: 0,
          lastUpdated: null
        };
      }

      // Aggregate tokens from eval.traces array
      if (trace.eval?.traces && Array.isArray(trace.eval.traces)) {
        for (const t of trace.eval.traces) {
          usage[modelId].inputTokens += t.input_tokens || 0;
          usage[modelId].outputTokens += t.output_tokens || 0;
          usage[modelId].totalTokens += t.total_tokens || 0;
        }
      }

      usage[modelId].evaluationsCount++;
      usage[modelId].lastUpdated = trace.eval?.created_at || new Date().toISOString();

      filesProcessed++;
    } catch (error) {
      filesSkipped++;
      // Silently skip files that can't be parsed
    }
  }

  console.log(`📝 Processed ${filesProcessed} trace files`);
  if (filesSkipped > 0) {
    console.log(`⚠️  Skipped ${filesSkipped} files (missing data or parse errors)\n`);
  }

  // Calculate costs for each model
  console.log('\n💰 Calculating costs...\n');

  for (const modelId in usage) {
    const modelUsage = usage[modelId];
    const modelMeta = metadata[modelId];

    if (!modelMeta) {
      console.warn(`⚠️  No metadata found for ${modelUsage.displayName} (${modelId})`);
      modelUsage.promptCost = 0;
      modelUsage.completionCost = 0;
      modelUsage.totalCost = 0;
      continue;
    }

    // Calculate costs using pricing from metadata
    const promptCost = modelUsage.inputTokens * modelMeta.cost.prompt;
    const completionCost = modelUsage.outputTokens * modelMeta.cost.completion;
    const totalCost = promptCost + completionCost;

    modelUsage.promptCost = promptCost;
    modelUsage.completionCost = completionCost;
    modelUsage.totalCost = totalCost;

    console.log(`✅ ${modelUsage.displayName}`);
    console.log(`   Input: ${modelUsage.inputTokens.toLocaleString()} tokens → $${promptCost.toFixed(4)}`);
    console.log(`   Output: ${modelUsage.outputTokens.toLocaleString()} tokens → $${completionCost.toFixed(4)}`);
    console.log(`   Total: $${totalCost.toFixed(4)} (${modelUsage.evaluationsCount} tests)\n`);
  }

  // Calculate overall statistics
  const totalTokens = Object.values(usage).reduce((sum, u) => sum + u.totalTokens, 0);
  const totalCost = Object.values(usage).reduce((sum, u) => sum + u.totalCost, 0);

  console.log(`📊 Overall Statistics:`);
  console.log(`   Total tokens: ${totalTokens.toLocaleString()}`);
  console.log(`   Total cost: $${totalCost.toFixed(4)}`);
  console.log(`   Models tracked: ${Object.keys(usage).length}\n`);

  // Ensure output directory exists
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

  // Write usage data to file
  writeFileSync(OUTPUT_PATH, JSON.stringify(usage, null, 2), 'utf8');
  console.log(`✅ Generated ${OUTPUT_PATH}`);
  console.log(`   ${Object.keys(usage).length} models with usage data\n`);
}

// Run the aggregation
aggregateUsage().catch(error => {
  console.error('❌ Aggregation failed:', error);
  process.exit(1);
});
