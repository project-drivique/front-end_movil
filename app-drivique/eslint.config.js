// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // El resolvedor de imports de ESLint (ni "node" ni "typescript") no
    // entiende los archivos con sufijo de plataforma de Expo/Metro
    // (cross-pager.native.tsx / cross-pager.web.tsx) — es una limitación
    // conocida de esas librerías, no del código. Metro (el empaquetador
    // real) y TypeScript (con "moduleSuffixes" en tsconfig.json) sí los
    // resuelven bien; esto es solo para que ESLint deje de marcarlo como
    // error falso.
    files: ['app/onboarding/index.tsx'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
