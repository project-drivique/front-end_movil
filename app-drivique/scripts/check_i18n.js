const fs = require('fs');
const path = require('path');

function getFiles(dir, exts = ['.tsx', '.ts']) {
  let files = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.expo', 'dist', 'scripts'].includes(file)) {
        files = files.concat(getFiles(fullPath, exts));
      }
    } else if (exts.includes(path.extname(file))) {
      files.push(fullPath);
    }
  }
  return files;
}

const baseDir = path.resolve(__dirname, '..');
const allFiles = getFiles(baseDir);
console.log('Total TS/TSX files:', allFiles.length);

const tCalls = new Set();
const tRegex = /\bt\(\s*["'`]([^"'`]+)["'`]/g;

allFiles.forEach(f => {
  if (f.includes(path.join('modules', 'i18n', 'translations'))) return;
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    if (!match[1].includes('${')) {
      tCalls.add(match[1]);
    }
  }
});

console.log('Total unique static t(...) keys found in code:', tCalls.size);

function loadTsObj(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/^import .*?;/gm, '');
  content = content.replace(/export default/g, 'module.exports =');
  content = content.replace(/const \w+.*?=\s*{/, 'module.exports = {');
  content = content.replace(/export const \w+.*?=\s*{/, 'module.exports = {');
  const tempPath = path.resolve(__dirname, 'temp_' + path.basename(filePath) + '.cjs');
  fs.writeFileSync(tempPath, content);
  try {
    delete require.cache[tempPath];
    const res = require(tempPath);
    fs.unlinkSync(tempPath);
    return res;
  } catch (e) {
    console.error('Error in ' + filePath, e);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    return null;
  }
}

function getAllKeys(obj, prefix = '') {
  let keys = new Set();
  if (!obj) return keys;
  for (const k in obj) {
    const full = prefix ? prefix + '.' + k : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      const sub = getAllKeys(obj[k], full);
      sub.forEach(x => keys.add(x));
    } else {
      keys.add(full);
    }
  }
  return keys;
}

const translationsDir = path.join(baseDir, 'modules', 'i18n', 'translations');
const esObj = loadTsObj(path.join(translationsDir, 'es.ts'));
const esKeys = getAllKeys(esObj);

const missingFromEs = Array.from(tCalls).filter(k => !esKeys.has(k));
console.log('\n--- Keys called with t(...) but missing in es.ts (' + missingFromEs.length + ') ---');
console.log(missingFromEs);

const langs = ['en', 'fr', 'pt', 'br'];
langs.forEach(lang => {
  const langObj = loadTsObj(path.join(translationsDir, lang + '.ts'));
  const langKeys = getAllKeys(langObj);
  const missing = Array.from(esKeys).filter(k => !langKeys.has(k));
  console.log(`\n--- Missing in ${lang}.ts (${missing.length}) ---`);
  console.log(missing);
});
