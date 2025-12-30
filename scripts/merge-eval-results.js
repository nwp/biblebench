#!/usr/bin/env node

/**
 * Merge Evaluation Results from Multiple Model Runs
 *
 * This script combines results from separate model eval runs into a unified
 * static export that appears identical to running evalite.each() with all models.
 *
 * WORKFLOW:
 * 1. Run evals for each model: MODELS="gpt-oss-120b" pnpm eval
 * 2. Export each model: pnpm eval:export
 * 3. Run this script: pnpm eval:merge
 * 4. View combined UI: pnpm dashboard:serve
 *
 * WHAT IT DOES:
 * - Scans all suite-*.json files in docs/traces/data/
 * - Groups suites by variant group (e.g., "Reference Knowledge")
 * - Updates menu-items.json with all models' metadata
 * - Updates index.html with complete availableEvals array
 * - Organizes exactly like evalite.each() A/B test output
 *
 * It updates:
 * - docs/traces/data/menu-items.json (suite metadata for UI sidebar)
 * - docs/traces/index.html (availableEvals array)
 *
 * Usage: pnpm eval:merge
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../docs/traces/data');
const menuItemsPath = path.join(dataDir, 'menu-items.json');
const indexHtmlPath = path.join(__dirname, '../docs/traces/index.html');

console.log('🔄 Merging evaluation results from multiple model runs...\n');

// ============================================================================
// Step 1: Scan all suite files
// ============================================================================

const suiteFiles = fs.readdirSync(dataDir)
  .filter(file => file.startsWith('suite-') && file.endsWith('.json'))
  .filter(file => file !== 'suite.json')
  .sort();

console.log(`📁 Found ${suiteFiles.length} suite files\n`);

// ============================================================================
// Step 2: Build suite metadata for menu-items.json
// ============================================================================

const suiteMetadata = [];
const variantGroups = new Map(); // Track which models exist for each eval

for (const file of suiteFiles) {
  const suiteData = JSON.parse(
    fs.readFileSync(path.join(dataDir, file), 'utf-8')
  );

  if (suiteData.suite) {
    const suite = suiteData.suite;
    const variantGroup = suite.variant_group;
    const variantName = suite.variant_name;

    // Track variants per group
    if (!variantGroups.has(variantGroup)) {
      variantGroups.set(variantGroup, new Set());
    }
    variantGroups.get(variantGroup).add(variantName);

    // Build metadata entry
    suiteMetadata.push({
      filepath: suite.filepath,
      name: suite.name,
      score: suiteData.history[0]?.score || 0,
      suiteStatus: suite.status,
      variantName: variantName,
      variantGroup: variantGroup,
      hasScores: true
    });
  }
}

// Sort by variantGroup, then by variantName for clean organization
suiteMetadata.sort((a, b) => {
  if (a.variantGroup !== b.variantGroup) {
    return a.variantGroup.localeCompare(b.variantGroup);
  }
  return a.variantName.localeCompare(b.variantName);
});

console.log('📊 Variant Groups (like A/B test groups):');
for (const [group, variants] of Array.from(variantGroups.entries()).sort()) {
  console.log(`  ${group}:`);
  for (const variant of Array.from(variants).sort()) {
    const suite = suiteMetadata.find(
      s => s.variantGroup === group && s.variantName === variant
    );
    console.log(`    - ${variant} (score: ${suite.score.toFixed(4)})`);
  }
}
console.log('');

// ============================================================================
// Step 3: Update menu-items.json
// ============================================================================

const menuItems = {
  suites: suiteMetadata,
  score: suiteMetadata.reduce((sum, s) => sum + s.score, 0) / suiteMetadata.length,
  prevScore: suiteMetadata.reduce((sum, s) => sum + s.score, 0) / suiteMetadata.length,
  runStatus: 'success'
};

fs.writeFileSync(menuItemsPath, JSON.stringify(menuItems, null, 2));
console.log(`✅ Updated menu-items.json with ${suiteMetadata.length} suites`);
console.log(`   Overall score: ${menuItems.score.toFixed(4)}\n`);

// ============================================================================
// Step 4: Extract suite identifiers for availableEvals
// ============================================================================

const availableEvals = suiteFiles
  .map(file => file.replace(/^suite-/, '').replace(/\.json$/, ''))
  .sort();

console.log(`📋 Available evals: ${availableEvals.length} entries`);

// ============================================================================
// Step 5: Update index.html with availableEvals
// ============================================================================

let indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

// Find and replace the availableEvals array
const availableEvalsString = JSON.stringify(availableEvals);
const regex = /availableEvals:\s*\[[\s\S]*?\]/;

if (regex.test(indexHtml)) {
  indexHtml = indexHtml.replace(
    regex,
    `availableEvals: ${availableEvalsString}`
  );

  fs.writeFileSync(indexHtmlPath, indexHtml);
  console.log('✅ Updated index.html with availableEvals array\n');
} else {
  console.error('❌ Could not find availableEvals array in index.html\n');
  process.exit(1);
}

// ============================================================================
// Step 6: Summary
// ============================================================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✨ Merge complete! Results organized as single A/B test:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`\n📊 Evaluation Categories: ${variantGroups.size}`);
console.log(`🔬 Models per Category: ${Array.from(variantGroups.values())[0]?.size || 0}`);
console.log(`📈 Total Suite Files: ${suiteMetadata.length}`);
console.log(`⭐ Overall Score: ${menuItems.score.toFixed(4)}`);
console.log('\n💡 Next steps:');
console.log('   1. Run: pnpm dashboard:serve');
console.log('   2. Open: http://localhost:3000/traces');
console.log('   3. View side-by-side model comparison!\n');
