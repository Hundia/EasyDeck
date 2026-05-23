#!/usr/bin/env node
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const BUDGET_KB = 200; // gzipped JS budget
const OUT_DIR = process.env.OUT_DIR || 'out';

async function getFiles(dir, ext) {
  const results = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...await getFiles(path, ext));
      } else if (entry.name.endsWith(ext)) {
        results.push(path);
      }
    }
  } catch { /* dir doesn't exist */ }
  return results;
}

function getEntryAssets(ext) {
  try {
    const html = readFileSync(join(OUT_DIR, 'index.html'), 'utf8');
    const pattern = ext === '.js' ? /\/_next[^"']*\.js/g : /\/_next[^"']*\.css/g;
    return [...new Set((html.match(pattern) ?? []).map((asset) => join(OUT_DIR, asset.replace(/^\//, ''))))];
  } catch {
    return [];
  }
}

async function audit() {
  console.log('📦 Bundle Size Audit\n');

  const jsFiles = getEntryAssets('.js');
  const cssFiles = getEntryAssets('.css');
  const resolvedJsFiles = jsFiles.length > 0 ? jsFiles : await getFiles(OUT_DIR, '.js');
  const resolvedCssFiles = cssFiles.length > 0 ? cssFiles : await getFiles(OUT_DIR, '.css');

  let totalJsRaw = 0;
  let totalJsGzip = 0;
  let totalCssRaw = 0;

  for (const file of resolvedJsFiles) {
    const content = readFileSync(file);
    const gzipped = gzipSync(content);
    totalJsRaw += content.length;
    totalJsGzip += gzipped.length;
  }

  for (const file of resolvedCssFiles) {
    const content = readFileSync(file);
    totalCssRaw += content.length;
  }

  const jsKb = (totalJsGzip / 1024).toFixed(1);
  const jsRawKb = (totalJsRaw / 1024).toFixed(1);
  const cssKb = (totalCssRaw / 1024).toFixed(1);

  console.log(`  JS files:  ${resolvedJsFiles.length}`);
  console.log(`  CSS files: ${resolvedCssFiles.length}`);
  console.log(`  JS (raw):  ${jsRawKb} KB`);
  console.log(`  JS (gzip): ${jsKb} KB`);
  console.log(`  CSS (raw): ${cssKb} KB`);
  console.log(`  Budget:    ${BUDGET_KB} KB (gzipped JS)\n`);

  if (parseFloat(jsKb) > BUDGET_KB) {
    console.log(`  ⚠️  OVER BUDGET by ${(parseFloat(jsKb) - BUDGET_KB).toFixed(1)} KB`);
    process.exitCode = 1;
  } else {
    console.log(`  ✅ Within budget (${(BUDGET_KB - parseFloat(jsKb)).toFixed(1)} KB remaining)`);
  }
}

audit();
