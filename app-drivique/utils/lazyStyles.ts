// utils/lazyStyles.ts
//
// Estilos que se vuelven a crear cuando cambia la paleta de marca. Un StyleSheet.create normal se evalúa una
// sola vez al importar el módulo (antes de conocer la paleta del servidor); con esto los colores de marca
// se leen al renderizar y siguen la paleta vigente.
import { StyleSheet } from "react-native";
import { COLOR_MARCA, COLOR_ACCENT, COLOR_ACENTO, GRADIENTE_INICIO } from "@/constants/brandPalette";

const firma = () => `${COLOR_MARCA}|${COLOR_ACCENT}|${COLOR_ACENTO}|${GRADIENTE_INICIO}`;

export function lazyStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(crear: () => T): T {
  let cache: T | null = null;
  let version = "";
  const actual = () => {
    const f = firma();
    if (!cache || f !== version) {
      cache = crear();
      version = f;
    }
    return cache;
  };
  return new Proxy({} as T, {
    get: (_t, clave) => (actual() as any)[clave],
    ownKeys: () => Reflect.ownKeys(actual() as object),
    getOwnPropertyDescriptor: (_t, clave) => ({ enumerable: true, configurable: true, value: (actual() as any)[clave] }),
  });
}
