/* global __dirname */
require('./setupTestEnv.js');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const dirTraducciones = path.join(raiz, 'modules', 'i18n', 'translations');
const IDIOMAS = ['es', 'en', 'fr', 'pt', 'br'];

const aplanar = (objeto, prefijo = '', salida = {}) => {
  for (const [clave, valor] of Object.entries(objeto)) {
    const ruta = prefijo ? `${prefijo}.${clave}` : clave;
    if (valor && typeof valor === 'object' && !Array.isArray(valor)) aplanar(valor, ruta, salida);
    else salida[ruta] = valor;
  }
  return salida;
};

// Los archivos son "export default { ... };" con un JSON adentro
const cargar = (idioma) => {
  const texto = fs.readFileSync(path.join(dirTraducciones, `${idioma}.ts`), 'utf8');
  return aplanar(JSON.parse(texto.replace(/^[\s\S]*?export default /, '').replace(/;\s*$/, '')));
};
const traducciones = Object.fromEntries(IDIOMAS.map((idioma) => [idioma, cargar(idioma)]));

const archivosDeCodigo = () => {
  const archivos = [];
  const recorrer = (dir) => {
    for (const nombre of fs.readdirSync(dir)) {
      const ruta = path.join(dir, nombre);
      if (fs.statSync(ruta).isDirectory()) {
        if (!['node_modules', 'translations', '__tests__', '.expo', 'dist', 'scripts'].includes(nombre)) recorrer(ruta);
      } else if (/\.(ts|tsx)$/.test(nombre)) archivos.push(ruta);
    }
  };
  ['app', 'modules', 'components', 'services', 'store', 'hooks', 'utils'].forEach((d) => {
    const ruta = path.join(raiz, d);
    if (fs.existsSync(ruta)) recorrer(ruta);
  });
  return archivos;
};

describe('Traducciones de la app', () => {
  it('los cinco idiomas tienen exactamente las mismas claves', () => {
    const todas = new Set(IDIOMAS.flatMap((idioma) => Object.keys(traducciones[idioma])));
    for (const idioma of IDIOMAS) {
      const faltan = [...todas].filter((clave) => !(clave in traducciones[idioma]));
      assert.deepEqual(faltan, [], `A ${idioma} le faltan ${faltan.length} claves: ${faltan.slice(0, 5).join(', ')}`);
    }
  });

  it('ninguna traducción está vacía', () => {
    for (const idioma of IDIOMAS) {
      const vacias = Object.entries(traducciones[idioma]).filter(([, valor]) => typeof valor === 'string' && valor.trim() === '');
      assert.deepEqual(vacias.map(([clave]) => clave), [], `Hay textos vacíos en ${idioma}`);
    }
  });

  it('toda clave escrita en el código existe en el idioma base', () => {
    const es = traducciones.es;
    const existe = (clave) => clave in es || `${clave}_one` in es || `${clave}_other` in es;
    const faltan = new Set();
    for (const archivo of archivosDeCodigo()) {
      const texto = fs.readFileSync(archivo, 'utf8');
      for (const coincidencia of texto.matchAll(/\bt\(\s*(['"`])([A-Za-z0-9_.-]+\.[A-Za-z0-9_.-]*)\1/g)) {
        const clave = coincidencia[2];
        if (!clave.endsWith('.') && !existe(clave)) faltan.add(clave);
      }
    }
    assert.deepEqual([...faltan], [], `Claves usadas sin traducción: ${[...faltan].slice(0, 8).join(', ')}`);
  });
});
