import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useUsuarioStore } from "./userStore";

export type RolUsuario = "cliente";

export interface Usuario {
  id: string;
  correo: string;
  nombres?: string;
  apellidos?: string;
  rol: RolUsuario;
  activo?: boolean;
  permisosValidos?: boolean;
  sucursalId?: string;
  sucursalNombre?: string;
}

interface AuthStore {
  usuario: Usuario | null;
  token: string | null;
  _hasHydrated: boolean;
  setUsuario: (usuario: Usuario, token: string) => void;
  cerrarSesion: () => void;
  setHasHydrated: (state: boolean) => void;
}

const getInitialAuth = (): { usuario: Usuario | null; token: string | null; _hasHydrated: boolean } => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = window.localStorage.getItem("drivique-auth-storage");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.usuario) {
          return {
            usuario: parsed.state.usuario,
            token: parsed.state.token || "token-demo",
            _hasHydrated: true,
          };
        }
      }
    } catch {
      // Ignorar error de parsing
    }
  }
  return {
    usuario: null,
    token: null,
    _hasHydrated: false,
  };
};

const initialAuth = getInitialAuth();

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      usuario: initialAuth.usuario,
      token: initialAuth.token,
      _hasHydrated: initialAuth._hasHydrated,
      setUsuario: (usuario, token) => set({ usuario, token }),
      cerrarSesion: () => {
        set({ usuario: null, token: null });
        try {
          useUsuarioStore.getState().limpiarUsuario();
        } catch {
          // Ignorar si no está inicializado
        }
      },
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: "drivique-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);


