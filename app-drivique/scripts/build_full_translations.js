const fs = require('fs');
const path = require('path');

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
    console.error('Error loading ' + filePath, e);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    return null;
  }
}

const dir = path.join(__dirname, '..', 'modules', 'i18n', 'translations');
const es = loadTsObj(path.join(dir, 'es.ts'));
const en = loadTsObj(path.join(dir, 'en.ts'));
const fr = loadTsObj(path.join(dir, 'fr.ts'));
const pt = loadTsObj(path.join(dir, 'pt.ts'));
const br = loadTsObj(path.join(dir, 'br.ts'));

// Helper to set nested property safely
function setPath(obj, keyPath, val) {
  const parts = keyPath.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!curr[parts[i]] || typeof curr[parts[i]] !== 'object') {
      curr[parts[i]] = {};
    }
    curr = curr[parts[i]];
  }
  curr[parts[parts.length - 1]] = val;
}

// Master dictionary of all missing / updated translations across the 5 languages
const TRANSLATIONS = Object.assign(
  {},
  require('./translations-data/translations.part1.js'),
  require('./translations-data/translations.part2.js'),
  require('./translations-data/translations.part3.js'),
);

// Also copy terms and welcome keys from ES if missing in other languages
const REGISTRO_KEYS = [
  'auth.registro.bienvenidaTitulo',
  'auth.registro.bienvenidaItem1',
  'auth.registro.bienvenidaItem2',
  'auth.registro.bienvenidaItem3',
  'auth.registro.bienvenidaItem4',
  'auth.registro.bienvenidaBtn',
  'auth.registro.tc7Titulo',
  'auth.registro.tc7Texto',
  'auth.registro.tc8Titulo',
  'auth.registro.tc8Texto',
  'auth.registro.tc9Titulo',
  'auth.registro.tc9Texto',
  'auth.registro.tc10Titulo',
  'auth.registro.tc10Texto',
  'auth.registro.tc11Titulo',
  'auth.registro.tc11Texto',
  'auth.registro.tc12Titulo',
  'auth.registro.tc12Texto',
  'auth.registro.tc13Titulo',
  'auth.registro.tc13Texto',
  'auth.registro.tcFooter',
];

const REGISTRO_TRANSLATIONS = Object.assign(
  {},
  require('./translations-data/registro_translations.part1.js'),
  require('./translations-data/registro_translations.part2.js'),
  require('./translations-data/registro_translations.part3.js'),
  require('./translations-data/registro_translations.part4.js'),
);

const objs = { es, en, fr, pt, br };

// Apply master translations
Object.keys(TRANSLATIONS).forEach(k => {
  const tMap = TRANSLATIONS[k];
  ['es', 'en', 'fr', 'pt', 'br'].forEach(lang => {
    if (tMap[lang]) {
      setPath(objs[lang], k, tMap[lang]);
    }
  });
});

// Apply registro terms
Object.keys(REGISTRO_TRANSLATIONS).forEach(k => {
  const tMap = REGISTRO_TRANSLATIONS[k];
  ['es', 'en', 'fr', 'pt', 'br'].forEach(lang => {
    if (tMap[lang]) {
      setPath(objs[lang], k, tMap[lang]);
    }
  });
});

// Write formatted typescript files
['es', 'en', 'fr', 'pt', 'br'].forEach(lang => {
  const jsonStr = JSON.stringify(objs[lang], null, 2);
  const tsContent = `// modules/i18n/translations/${lang}.ts\nexport default ${jsonStr};\n`;
  const targetPath = path.join(dir, `${lang}.ts`);
  fs.writeFileSync(targetPath, tsContent, 'utf8');
  console.log(`Successfully updated ${lang}.ts`);
});
