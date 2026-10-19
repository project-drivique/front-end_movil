// utils/normalizeColorWebBrand.ts
//
// En web, react-native-web devuelve los colores hex tal cual y nunca pasan por el reemplazo de la paleta de
// marca. Este módulo reemplaza al normalizeColor del compilador de estilos de react-native-web (ver
// metro.config.js) para aplicar la paleta vigente antes de generar el CSS.
import { remapColor } from "@/constants/brandColorMap";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const original = require("react-native-web/dist/cjs/exports/StyleSheet/compiler/normalizeColor.js");
const base = original.default ?? original;

function normalizeColor(color: unknown, opacity?: number) {
  return base(remapColor(color), opacity);
}

module.exports = normalizeColor;
module.exports.default = normalizeColor;
