// store/usuarioStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UsuarioPerfil } from "@/modules/profile/types/profile.types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Única fuente de verdad del perfil del usuario autenticado.
// Se sincroniza desde dos lugares:
//  1. modules/perfil (cuando edita su perfil o lo completa por primera vez)
//  2. modules/reserva/components/FormDatosPersonales (campos equivalentes)
// En producción, se hidrata con obtenerPerfil(token) al iniciar sesión.
function usuarioVacio(): UsuarioPerfil {
  return {
    id: "",
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    tipoDocumento: "",
    numeroDocumento: "",
    fechaNacimiento: "",
    nacionalidad: "",
    perfilCompleto: false,
  };
}

interface UsuarioStore {
  usuario: UsuarioPerfil;
  _hasHydrated: boolean;
  setUsuario: (usuario: UsuarioPerfil) => void;
  actualizarUsuario: (data: Partial<UsuarioPerfil>) => void;
  limpiarUsuario: () => void;
  setHasHydrated: (state: boolean) => void;
}

const getInitialUser = (): { usuario: UsuarioPerfil; _hasHydrated: boolean } => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = window.localStorage.getItem("drivique-user-profile-storage");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.usuario) {
          return {
            usuario: { ...usuarioVacio(), ...parsed.state.usuario },
            _hasHydrated: true,
          };
        }
      }
    } catch {
      // Ignorar error
    }
  }
  return {
    usuario: usuarioVacio(),
    _hasHydrated: false,
  };
};

const initialUser = getInitialUser();

export const useUsuarioStore = create<UsuarioStore>()(
  persist(
    (set) => ({
      usuario: initialUser.usuario,
      _hasHydrated: initialUser._hasHydrated,
      setUsuario: (usuario) => set({ usuario }),
      actualizarUsuario: (data) =>
        set((state) => ({ usuario: { ...state.usuario, ...data } })),
      limpiarUsuario: () => set({ usuario: usuarioVacio() }),
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: "drivique-user-profile-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);


