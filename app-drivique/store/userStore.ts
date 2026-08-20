// store/usuarioStore.ts
import { UsuarioPerfil } from "@/modules/profile/types/profile.types";
import { create } from "zustand";

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
  setUsuario: (usuario: UsuarioPerfil) => void;
  actualizarUsuario: (data: Partial<UsuarioPerfil>) => void;
  limpiarUsuario: () => void;
}

export const useUsuarioStore = create<UsuarioStore>()((set) => ({
  usuario: usuarioVacio(),
  setUsuario: (usuario) => set({ usuario }),
  actualizarUsuario: (data) =>
    set((state) => ({ usuario: { ...state.usuario, ...data } })),
  limpiarUsuario: () => set({ usuario: usuarioVacio() }),
}));
