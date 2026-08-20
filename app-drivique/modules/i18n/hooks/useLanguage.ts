/**
 * RF28 — Cambio de idioma automático
 * RF28.1: Establecer idioma por defecto
 * RF28.2: Cambiar idioma (5)
 * RF28.3: Aplicar traducción automática
 * RF28.4: Guardar preferencia por usuario
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import i18n, { IdiomaKey } from "../index";

export type TemaApp = "claro" | "oscuro";

interface IdiomaStore {
  // Idioma
  idiomaActual: IdiomaKey;
  cambiarIdioma: (idioma: IdiomaKey) => void;
  // Tema
  temaActual: TemaApp;
  cambiarTema: (tema: TemaApp) => void;
  toggleTema: () => void;
}

export const useIdioma = create<IdiomaStore>()(
  persist(
    (set, get) => ({
      // ── Idioma ────────────────────────────────────────────────
      idiomaActual: "es",

      // RF28.2 / RF28.3 / RF28.4 — Cambiar idioma y guardar
      cambiarIdioma: (idioma: IdiomaKey) => {
        i18n.changeLanguage(idioma);
        set({ idiomaActual: idioma });
      },

      // ── Tema ──────────────────────────────────────────────────
      temaActual: "claro",

      cambiarTema: (tema: TemaApp) => {
        set({ temaActual: tema });
      },

      toggleTema: () => {
        const actual = get().temaActual;
        set({ temaActual: actual === "claro" ? "oscuro" : "claro" });
      },
    }),
    {
      name: "idioma-tema-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Al rehidratar, aplicar el idioma guardado — RF28.4
      onRehydrateStorage: () => (state) => {
        if (state?.idiomaActual) {
          i18n.changeLanguage(state.idiomaActual);
        }
      },
    }
  )
);

// Hook para obtener colores según tema
export function useTemaColores() {
  const { temaActual } = useIdioma();
  const oscuro = temaActual === "oscuro";

  return {
    // Fondos
    bg: oscuro ? "#0D1117" : "#E9EDF8",
    bgCard: oscuro ? "#1C2330" : "#FFFFFF",
    bgInput: oscuro ? "#161B22" : "#F9FAFB",
    bgHeader: oscuro ? "#161B22" : "#FFFFFF",
    // Textos
    textPrimary: oscuro ? "#F0F4FF" : "#111827",
    textSecondary: oscuro ? "#8B9AB1" : "#6B7280",
    textMuted: oscuro ? "#4A5568" : "#9CA3AF",
    // Bordes
    border: oscuro ? "#2D3748" : "#E5E7EB",
    borderLight: oscuro ? "#1C2330" : "#F3F4F6",
    // Primario
    primary: "#1D4ED8",
    primaryBg: oscuro ? "#1D4ED820" : "#EEF2FF",
    // Estado
    success: "#16A34A",
    error: "#DC2626",
    warning: "#D97706",
    // Es oscuro
    oscuro,
  };
}