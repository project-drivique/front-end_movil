/* global __dirname */
// Permite probar módulos TypeScript de la app con `node --test`: los compila al vuelo,
// resuelve el alias "@/" y reemplaza las librerías nativas por versiones en memoria.
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');

const raiz = path.join(__dirname, '..', '..');

const memoria = () => {
  const datos = new Map();
  return {
    getItem: async (k) => (datos.has(k) ? datos.get(k) : null),
    setItem: async (k, v) => { datos.set(k, String(v)); },
    removeItem: async (k) => { datos.delete(k); },
    getItemAsync: async (k) => (datos.has(k) ? datos.get(k) : null),
    setItemAsync: async (k, v) => { datos.set(k, String(v)); },
    deleteItemAsync: async (k) => { datos.delete(k); },
  };
};

// la app consulta `window` para saber si hay almacenamiento del navegador
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

const reemplazos = {
  'react-native': { Platform: { OS: 'web' }, Alert: { alert() {} }, Linking: { openURL: async () => {} } },
  '@react-native-async-storage/async-storage': { __esModule: true, default: memoria(), ...memoria() },
  'expo-secure-store': memoria(),
  '@/modules/i18n': { __esModule: true, default: { resolvedLanguage: 'es', language: 'es' } },
};

const resolverOriginal = Module._resolveFilename;
const virtuales = new Map();
Module._resolveFilename = function (peticion, padre, ...resto) {
  if (reemplazos[peticion]) {
    virtuales.set(peticion, reemplazos[peticion]);
    return `virtual:${peticion}`;
  }
  if (peticion.startsWith('@/')) peticion = path.join(raiz, peticion.slice(2));
  for (const ext of ['', '.ts', '.tsx', '/index.ts']) {
    try { return resolverOriginal.call(this, peticion + ext, padre, ...resto); } catch { /* siguiente */ }
  }
  return resolverOriginal.call(this, peticion, padre, ...resto);
};

const cargarOriginal = Module._load;
Module._load = function (peticion, padre, esMain) {
  if (typeof peticion === 'string' && peticion.startsWith('virtual:')) return virtuales.get(peticion.slice(8));
  const resuelto = (() => { try { return Module._resolveFilename(peticion, padre); } catch { return null; } })();
  if (resuelto && resuelto.startsWith('virtual:')) {
    const modulo = virtuales.get(resuelto.slice(8));
    return modulo;
  }
  return cargarOriginal.call(this, peticion, padre, esMain);
};

require.extensions['.ts'] = function (modulo, archivo) {
  const codigo = fs.readFileSync(archivo, 'utf8');
  const salida = ts.transpileModule(codigo, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  modulo._compile(salida.outputText, archivo);
};

module.exports = { cargar: (relativa) => require(path.join(raiz, relativa)), raiz };
