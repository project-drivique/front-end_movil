const fs = require('fs');
const path = require('path');

function getFiles(dir, exts = ['.tsx']) {
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
const files = getFiles(baseDir);

const hardcodedTexts = [];

files.forEach(f => {
  const relPath = path.relative(baseDir, f);
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, lineIdx) => {
    // Check for raw text between tags: >Some Spanish Text<
    const tagMatch = line.match(/>([^<>{}\n]+)</);
    if (tagMatch) {
      const text = tagMatch[1].trim();
      // Ignore punctuation, numbers, simple icons, single symbols
      if (text.length > 2 && /[a-záéíóúñA-ZÁÉÍÓÚÑ]/.test(text) && !text.startsWith('http') && !text.match(/^[\d\s.,:\/+\-$€%•★—–()]+$/)) {
        hardcodedTexts.push({ file: relPath, line: lineIdx + 1, text, type: 'JSX_TEXT', lineContent: line.trim() });
      }
    }

    // Check for hardcoded string props: placeholder="...", title="...", label="...", message="..."
    const propMatch = line.match(/\b(placeholder|title|label|mensaje|subtitulo|textoBoton)=["']([^"']+)["']/);
    if (propMatch) {
      const prop = propMatch[1];
      const text = propMatch[2].trim();
      if (text.length > 2 && /[a-záéíóúñA-ZÁÉÍÓÚÑ]/.test(text) && !text.startsWith('http') && !text.includes('t(')) {
        hardcodedTexts.push({ file: relPath, line: lineIdx + 1, text: `${prop}="${text}"`, type: 'PROP', lineContent: line.trim() });
      }
    }
  });
});

console.log('Total potential hardcoded instances found:', hardcodedTexts.length);
// Group by file
const byFile = {};
hardcodedTexts.forEach(item => {
  if (!byFile[item.file]) byFile[item.file] = [];
  byFile[item.file].push(item);
});

Object.keys(byFile).forEach(f => {
  console.log(`\n=== ${f} (${byFile[f].length}) ===`);
  byFile[f].slice(0, 10).forEach(item => {
    console.log(`  L${item.line}: [${item.type}] ${item.text}`);
  });
  if (byFile[f].length > 10) {
    console.log(`  ... and ${byFile[f].length - 10} more`);
  }
});
