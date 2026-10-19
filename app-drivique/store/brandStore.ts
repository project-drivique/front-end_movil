// store/brandStore.ts
//
// Marca de la plataforma (colores, logo y nombre) sincronizada con el servidor: lo que el administrador
// configura en la web se aplica aquí sin reinstalar la app.
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "@/services/http/apiClient";
import { Platform } from "react-native";
import { aplicarPaleta, esHex, PALETA_ARRANQUE } from "@/constants/brandPalette";

export interface MarcaApp {
  nombre: string;
  logoUrl: string | null;
  primary: string;
  secondary: string;
  accent: string;
}

interface MarcaApi {
  companyName?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

const CLAVE_CACHE = "drivique:marca";

const MARCA_INICIAL: MarcaApp = {
  nombre: "Drivique",
  logoUrl: null,
  primary: "#2563EB",
  secondary: "#1E3A8A",
  accent: "#60A5FA",
};

interface BrandState {
  marca: MarcaApp;
  /** Sube cada vez que cambia la marca: los componentes que lo leen se vuelven a pintar. */
  version: number;
  hidratar: () => Promise<void>;
  cargar: () => Promise<void>;
}

const desdeApi = (b: MarcaApi): MarcaApp | null => {
  if (!esHex(b.primaryColor) || !esHex(b.secondaryColor) || !esHex(b.accentColor)) return null;
  return {
    nombre: b.companyName || MARCA_INICIAL.nombre,
    logoUrl: b.logoUrl || null,
    primary: b.primaryColor,
    secondary: b.secondaryColor,
    accent: b.accentColor,
  };
};

const iguales = (a: MarcaApp, b: MarcaApp) => JSON.stringify(a) === JSON.stringify(b);

export const useBrandStore = create<BrandState>((set, get) => {
  const adoptar = (marca: MarcaApp) => {
    if (iguales(get().marca, marca)) return false;
    aplicarPaleta(marca);
    set((s) => ({ marca, version: s.version + 1 }));
    return true;
  };

  return {
    marca: MARCA_INICIAL,
    version: 0,

    // Última marca conocida: la app se ve con la marca correcta aunque aún no responda el servidor
    hidratar: async () => {
      try {
        const guardada = await AsyncStorage.getItem(CLAVE_CACHE);
        if (guardada) adoptar(JSON.parse(guardada) as MarcaApp);
      } catch {
        /* sin caché: se usa la marca original hasta que responda el servidor */
      }
      await get().cargar();
    },

    cargar: async () => {
      try {
        const { data } = await apiClient.get<MarcaApi>("/brand-configurations/active");
        const marca = desdeApi(data);
        if (!marca) return;
        if (adoptar(marca)) await AsyncStorage.setItem(CLAVE_CACHE, JSON.stringify(marca));
        // Web: los estilos ya están compilados con la paleta de arranque; si cambió, se recarga una sola vez
        if (Platform.OS === "web" && typeof window !== "undefined") {
          const actual = `${marca.primary}|${marca.secondary}|${marca.accent}`.toUpperCase();
          const base = PALETA_ARRANQUE || "#2563EB|#1E3A8A|#60A5FA";
          if (actual !== base) window.location.reload();
        }
      } catch {
        /* sin conexión: se conserva la marca actual */
      }
    },
  };
});

const LOGO_ORIGINAL = require("@/assets/images/logo.png");
const LOGO_USABLE = /^(https?:\/\/|data:image\/(png|jpeg|webp);base64,)/i;

/** Logo de la marca; si no hay uno configurado (o es SVG, que la app no dibuja) usa el original. */
export function useLogoMarca() {
  const url = useBrandStore((s) => s.marca.logoUrl);
  return url && LOGO_USABLE.test(url) && !/\.svg(\?|$)/i.test(url) ? { uri: url } : LOGO_ORIGINAL;
}
