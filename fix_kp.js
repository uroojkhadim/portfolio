const fs = require('fs');
const p = 'server/services/portfolioKnowledge.js';
let src = fs.readFileSync(p, 'utf8');
// Normalize line endings
src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
// Find the answerPortfolioQuestion function and its closing brace
const start = src.indexOf('export function answerPortfolioQuestion');
if (start === -1) { console.log('function not found'); process.exit(1); }
let depth = 0;
let end = start;
for (let i = start; i < src.length; i++) {
  const ch = src[i];
  if (ch === '{') depth++;
  if (ch === '}') depth--;
  if (depth === 0 && i > start) { end = i + 1; break; }
}
const fixed = src.slice(0, end);
fs.writeFileSync(p, fixed, 'utf8');
console.log('wrote fixed file, length', fixed.length, 'end line', (fixed.match(/\n/g) || '').length);
