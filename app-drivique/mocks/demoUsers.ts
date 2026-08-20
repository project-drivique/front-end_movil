import usuariosDemoJson from "./demoUsers.json";

export interface UsuarioDemo {
  correo: string;
  contrasena: string;
  id: string;
  nombres: string;
  apellidos: string;
  rol: "cliente";
  activo: boolean;
  permisosValidos: boolean;
  sucursalId?: string;
  sucursalNombre?: string;
}

// Copia mutable en memoria de la fuente JSON. En producción estas operaciones
// corresponden a endpoints del backend.
export const USUARIOS_DEMO: UsuarioDemo[] = usuariosDemoJson.map((usuario) => ({
  ...usuario,
  rol: usuario.rol as UsuarioDemo["rol"],
}));

export function buscarUsuarioDemo(correo: string, contrasena: string): UsuarioDemo | null {
  return USUARIOS_DEMO.find(
    (usuario) =>
      usuario.correo.toLowerCase() === correo.trim().toLowerCase() &&
      usuario.contrasena === contrasena,
  ) ?? null;
}

export function eliminarUsuarioDemo(correo: string): void {
  const indice = USUARIOS_DEMO.findIndex(
    (usuario) => usuario.correo.toLowerCase() === correo.trim().toLowerCase(),
  );
  if (indice !== -1) USUARIOS_DEMO.splice(indice, 1);
}

export function cambiarContrasenaUsuarioDemo(
  correo: string,
  contrasenaActual: string,
  nuevaContrasena: string,
): "actualizada" | "incorrecta" | "no_encontrado" {
  const usuario = USUARIOS_DEMO.find(
    (item) => item.correo.toLowerCase() === correo.trim().toLowerCase(),
  );
  if (!usuario) return "no_encontrado";
  if (usuario.contrasena !== contrasenaActual) return "incorrecta";
  usuario.contrasena = nuevaContrasena;
  return "actualizada";
}
