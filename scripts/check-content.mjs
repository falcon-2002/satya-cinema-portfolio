import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFileSync(resolve(root, name), 'utf8');
const context = { window: {} };
vm.runInNewContext(read('dist/config.js'), context);
const config = context.window.PORTFOLIO;
const html = read('dist/index.html');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
assert.equal(new Set(config.projects.map(p => p.id)).size, config.projects.length, 'Duplicate project IDs');

function localAsset(value, base = 'dist') {
  if (!value || /^(?:https?:|mailto:|#)/.test(value)) return;
  const path = value.split(/[?#]/)[0];
  assert(existsSync(resolve(root, base, path)), `Missing local asset: ${value}`);
}
for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) localAsset(match[1]);
for (const match of read('dist/styles.css').matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) localAsset(match[1]);
for (const item of [...config.projects, ...config.skills, ...config.experience, ...config.certifications]) {
  localAsset(`assets/${item.art}.svg`);
  for (const field of ['repo', 'live', 'credential']) {
    if (item[field]) assert(new URL(item[field]).protocol === 'https:', `Non-public ${field}: ${item.title}`);
  }
}
localAsset(config.resume);
localAsset(config.portrait.src);
for (const variant of config.portrait.srcset.split(',')) localAsset(variant.trim().split(/\s+/)[0]);
assert.match(read('netlify.toml'), /command\s*=\s*""/);
assert.match(read('netlify.toml'), /publish\s*=\s*"dist"/);
const docs = ['README.md', ...readdirSync(resolve(root, 'docs')).filter(f => f.endsWith('.md')).map(f => `docs/${f}`)];
for (const doc of docs) {
  const text = read(doc);
  for (const match of text.matchAll(/\]\(([^)]+)\)|\bsrc="([^"]+)"/g)) localAsset(match[1] || match[2], dirname(doc));
}
console.log('Content checks passed: IDs, configured assets, public URLs, documentation links, and Netlify output.');
