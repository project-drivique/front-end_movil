import { create } from "zustand";
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
  setUsuario: (usuario: Usuario, token: string) => void;
  cerrarSesion: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  usuario: null,
  token: null,
  setUsuario: (usuario, token) => set({ usuario, token }),
  cerrarSesion: () => {
    set({ usuario: null, token: null });
    try {
      useUsuarioStore.getState().limpiarUsuario();
    } catch {
      // Ignorar si no está inicializado
    }
  },
}));
