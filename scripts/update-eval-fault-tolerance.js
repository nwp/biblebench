#!/usr/bin/env node

/**
 * Update all eval files to use safeGenerateText for fault tolerance
 *
 * This script replaces:
 * - import { generateText } from "ai"
 * - generateText({ model, prompt })
 *
 * With:
 * - import { safeGenerateText } from "../lib/utils.js"
 * - safeGenerateText(model, prompt)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const evalsDir = path.join(__dirname, '../evals');

console.log('🔄 Updating eval files to use safeGenerateText...\n');

// Find all .eval.ts files recursively
function findEvalFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findEvalFiles(filePath, fileList);
    } else if (file.endsWith('.eval.ts')) {
      fileList.push(path.relative(evalsDir, filePath));
    }
  }
  return fileList;
}

const evalFiles = findEvalFiles(evalsDir);

let updatedCount = 0;
let skippedCount = 0;

for (const file of evalFiles) {
  const filePath = path.join(evalsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Skip if already using safeGenerateText
  if (content.includes('safeGenerateText')) {
    console.log(`⏭️  ${file} (already updated)`);
    skippedCount++;
    continue;
  }

  // Replace import statement
  if (content.includes('import { generateText } from "ai"')) {
    content = content.replace(
      'import { generateText } from "ai";',
      ''
    );

    // Add safeGenerateText import
    const modelsImportMatch = content.match(/import .* from "\.\.\/lib\/models\.js";/);
    if (modelsImportMatch) {
      content = content.replace(
        modelsImportMatch[0],
        modelsImportMatch[0] + '\nimport { safeGenerateText } from "../lib/utils.js";'
      );
      modified = true;
    }
  }

  // Replace generateText usage with safeGenerateText
  // Pattern: const result = await generateText({ model: variant.model, prompt: `...` });
  //          return result.text;
  // Replace with: return await safeGenerateText(variant.model, `...`);
  const generateTextPattern = /const result = await generateText\(\{\s*model: (variant\.(?:model|input\.model)),\s*prompt: ([\s\S]*?)\s*\}\);\s*return result\.text;/g;

  content = content.replace(generateTextPattern, (match, modelRef, promptContent) => {
    modified = true;
    return `return await safeGenerateText(\n      ${modelRef},\n      ${promptContent}\n    );`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${file}`);
    updatedCount++;
  } else {
    console.log(`⏭️  ${file} (no changes needed)`);
    skippedCount++;
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✨ Update complete!`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✅ Updated: ${updatedCount} files`);
console.log(`⏭️  Skipped: ${skippedCount} files`);
console.log(`\n💡 All eval files now use safeGenerateText for fault tolerance!`);
