// constants/brandColorMap.ts
//
// Sustituye en tiempo de ejecución los azules de marca "fijos" del código por los de la paleta que el
// administrador configura en la web. Se engancha en el normalizador de colores de React Native (ver
// metro.config.js), así que cubre estilos estáticos, íconos, gradientes y textos sin editar cada archivo.
import * as P from "./brandPalette";

const rgbDe = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

// Azul original -> color vivo de la paleta actual
const FIJOS: Record<string, () => string> = {
  "#2f4ea2": () => P.COLOR_MARCA,
  "#1d4ed8": () => P.COLOR_ENLACE,
  "#1e40af": () => P.COLOR_ENLACE_OSCURO,
  "#2563eb": () => P.COLOR_ACCENT,
  "#1e3a8a": () => P.GRADIENTE_INICIO,
  "#60a5fa": () => P.COLOR_ACENTO,
  "#93c5fd": () => P.GRADIENTE_CLARO,
  "#3b82f6": () => P.COLOR_MARCA_OSCURO,
  "#eff6ff": () => P.mezclar(P.COLOR_MARCA, "#FFFFFF", 0.92),
  "#eef2ff": () => P.mezclar(P.COLOR_MARCA, "#FFFFFF", 0.9),
  "#dbeafe": () => P.mezclar(P.COLOR_MARCA, "#FFFFFF", 0.82),
  "#bfdbfe": () => P.mezclar(P.COLOR_MARCA, "#FFFFFF", 0.66),
  "#b9c4e8": () => P.mezclar(P.COLOR_MARCA, "#FFFFFF", 0.7),
  "#172554": () => P.mezclar(P.GRADIENTE_INICIO, "#000000", 0.5),
  "#3730a3": () => P.COLOR_ENLACE_OSCURO,
  "#e0e7ff": () => P.mezclar(P.COLOR_MARCA, "#FFFFFF", 0.88),
  "#1e3a5f": () => P.GRADIENTE_INICIO,
  "#0c447c": () => P.COLOR_ENLACE_OSCURO,
  "#185fa5": () => P.COLOR_ENLACE,
  "#0284c7": () => P.COLOR_ACCENT,
  "#93a5d1": () => P.mezclar(P.COLOR_MARCA, "#FFFFFF", 0.55),
};

// Azules originales usados con transparencia: rgba(r, g, b, a)
const RGBA: Record<string, () => string> = {
  "47,78,162": () => P.COLOR_MARCA,
  "37,99,235": () => P.COLOR_ACCENT,
  "30,58,138": () => P.GRADIENTE_INICIO,
  "59,130,246": () => P.COLOR_MARCA_OSCURO,
  "96,165,250": () => P.COLOR_ACENTO,
  "29,78,216": () => P.COLOR_ENLACE,
};

const RGBA_RE = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i;

export function remapColor<T>(color: T): T {
  if (!P.PALETA_PERSONALIZADA || typeof color !== "string") return color;
  const c = color.trim().toLowerCase();
  if (c[0] === "#") {
    const base = FIJOS[c.slice(0, 7)];
    if (base && (c.length === 7 || c.length === 9)) return (base() + c.slice(7)) as unknown as T;
    return color;
  }
  const m = RGBA_RE.exec(c);
  if (m) {
    const base = RGBA[`${m[1]},${m[2]},${m[3]}`];
    if (base) {
      const [r, g, b] = rgbDe(base());
      return `rgba(${r}, ${g}, ${b}, ${m[4] ?? 1})` as unknown as T;
    }
  }
  return color;
}
