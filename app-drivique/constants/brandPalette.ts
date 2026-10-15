// constants/brandPalette.ts
//
// Paleta de marca "viva": la app arranca con los colores originales de Drivique y, cuando el
// administrador cambia la marca en la web, brandStore llama a aplicarPaleta() con los colores del
// servidor. Los módulos leen estas variables al renderizar, por eso se exportan como `let`.

export type PaletaMarca = { primary: string; secondary: string; accent: string };

// Colores originales de Drivique tal como están guardados en la base de datos
const ORIGINAL_SERVIDOR: PaletaMarca = { primary: "#2563EB", secondary: "#1E3A8A", accent: "#60A5FA" };

const HEX = /^#[0-9a-f]{6}$/i;

export const esHex = (v?: string | null): v is string => !!v && HEX.test(v);

export function mezclar(a: string, b: string, peso: number): string {
  const canal = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const mix = (i: number) => Math.round(canal(a, i) + (canal(b, i) - canal(a, i)) * peso).toString(16).padStart(2, "0");
  return `#${mix(0)}${mix(1)}${mix(2)}`;
}

const mismaPaleta = (p: PaletaMarca, q: PaletaMarca) =>
  p.primary.toUpperCase() === q.primary.toUpperCase() &&
  p.secondary.toUpperCase() === q.secondary.toUpperCase() &&
  p.accent.toUpperCase() === q.accent.toUpperCase();

// --- Valores vivos -------------------------------------------------------------------------
/** Color plano de marca (botones secundarios, textos de acento en modo claro). */
export let COLOR_MARCA = "#2f4ea2";
/** Azul vivo de apoyo. */
export let COLOR_ACCENT = "#2563eb";
/** Acento sobre fondos oscuros (textos e iconos en modo oscuro). */
export let COLOR_ACENTO = "#60A5FA";
/** Texto/enlaces de marca en modo claro (variantes más fuertes del azul). */
export let COLOR_ENLACE = "#1D4ED8";
export let COLOR_ENLACE_OSCURO = "#1E40AF";
/** Fondo de marca en modo oscuro. */
export let COLOR_MARCA_OSCURO = "#3B82F6";
/** Extremos del gradiente de marca: de oscuro a claro. */
export let GRADIENTE_INICIO = "#1e3a8a";
export let GRADIENTE_FIN = "#2563eb";
export let GRADIENTE_CLARO = "#93c5fd";
export let HERO_1 = "#060e2e";
export let HERO_2 = "#0c1f5c";

/** Verdadero cuando el servidor tiene una paleta distinta a la original: activa la sustitución de azules fijos. */
export let PALETA_PERSONALIZADA = false;

/** Aplica la paleta del servidor; con la paleta original conserva el diseño aprobado de la app. */
export function aplicarPaleta(paleta: PaletaMarca) {
  const p = paleta.primary.toUpperCase();
  const s = paleta.secondary.toUpperCase();
  const a = paleta.accent.toUpperCase();
  PALETA_PERSONALIZADA = !mismaPaleta(paleta, ORIGINAL_SERVIDOR);
  if (!PALETA_PERSONALIZADA) {
    COLOR_MARCA = "#2f4ea2";
    COLOR_ACCENT = "#2563eb";
    COLOR_ACENTO = "#60A5FA";
    COLOR_MARCA_OSCURO = "#3B82F6";
    COLOR_ENLACE = "#1D4ED8";
    COLOR_ENLACE_OSCURO = "#1E40AF";
    GRADIENTE_INICIO = "#1e3a8a";
    GRADIENTE_FIN = "#2563eb";
    GRADIENTE_CLARO = "#93c5fd";
    HERO_1 = "#060e2e";
    HERO_2 = "#0c1f5c";
    return;
  }
  COLOR_MARCA = p;
  COLOR_ACCENT = p;
  COLOR_ACENTO = a;
  COLOR_MARCA_OSCURO = mezclar(p, "#FFFFFF", 0.15);
  COLOR_ENLACE = mezclar(p, "#000000", 0.12);
  COLOR_ENLACE_OSCURO = mezclar(p, "#000000", 0.2);
  GRADIENTE_INICIO = s;
  GRADIENTE_FIN = p;
  GRADIENTE_CLARO = a;
  HERO_1 = mezclar(s, "#000000", 0.8);
  HERO_2 = mezclar(s, "#000000", 0.55);
}
