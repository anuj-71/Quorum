#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Scans source files for accidental hardcoded API keys
const secretPatterns = [
  /AIza[0-9A-Za-z-_]{35}/,
  /sk-[a-zA-Z0-9]{20,}/
];

let hasError = false;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanDir(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          console.error(`[SECURITY AUDIT] Possible secret leak found in: ${fullPath}`);
          hasError = true;
        }
      }
    }
  }
}

scanDir(process.cwd());

if (hasError) {
  console.error('[SECURITY AUDIT] Failed: Hardcoded secrets detected.');
  process.exit(1);
} else {
  console.log('[SECURITY AUDIT] Passed: 0 secret leaks detected across codebase.');
  process.exit(0);
}
