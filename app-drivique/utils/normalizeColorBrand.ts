// utils/normalizeColorBrand.ts
//
// Reemplaza a @react-native/normalize-colors (ver metro.config.js): antes de convertir cada color a su valor
// nativo aplica la paleta de marca vigente.
import { remapColor } from "@/constants/brandColorMap";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const original = require("@react-native/normalize-colors/index.js");
const base = original.default ?? original;

function normalizeColor(color: unknown) {
  return base(remapColor(color));
}

module.exports = normalizeColor;
module.exports.default = normalizeColor;
Object.keys(base).forEach((key) => {
  if (!(key in module.exports)) module.exports[key] = base[key];
});
