// mocks/usuariosDemo.ts
// Usuarios de prueba para el login mock — se reemplaza por backend real más adelante

export interface UsuarioDemo {
  correo: string;
  contrasena: string;
  id: string;
  nombres: string;
  apellidos: string;
  rol: "cliente" | "administrador" | "encargado_sucursal" | "operador" | "supervisor";
  activo: boolean;
  permisosValidos: boolean;
  sucursalId?: string;
  sucursalNombre?: string;
}

export const USUARIOS_DEMO: UsuarioDemo[] = [
  {
    correo: "cliente@drivique.com",
    contrasena: "Cliente123*",
    id: "1",
    nombres: "Cliente",
    apellidos: "Demo",
    rol: "cliente",
    activo: true,
    permisosValidos: true,
  },
  {
    correo: "admin@drivique.com",
    contrasena: "Admin123*",
    id: "2",
    nombres: "Administrador",
    apellidos: "Principal",
    rol: "administrador",
    activo: true,
    permisosValidos: true,
  },
  {
    correo: "encargado.neiva@drivique.com",
    contrasena: "Encargado123*",
    id: "3",
    nombres: "Encargado",
    apellidos: "Sucursal Neiva",
    rol: "encargado_sucursal",
    activo: true,
    permisosValidos: true,
    sucursalId: "suc-neiva",
    sucursalNombre: "Sucursal Neiva - Centro",
  },
  {
    correo: "encargado.bogota@drivique.com",
    contrasena: "Encargado123*",
    id: "4",
    nombres: "Encargado",
    apellidos: "Sucursal Bogotá",
    rol: "encargado_sucursal",
    activo: true,
    permisosValidos: true,
    sucursalId: "suc-bogota",
    sucursalNombre: "Sucursal Bogotá - Aeropuerto",
  },
  {
    correo: "inactivo@drivique.com",
    contrasena: "Inactivo123*",
    id: "5",
    nombres: "Usuario",
    apellidos: "Sin Permisos",
    rol: "encargado_sucursal",
    activo: false,
    permisosValidos: false,
    sucursalId: "suc-cali",
    sucursalNombre: "Sucursal Cali",
  },
];

export function buscarUsuarioDemo(
  correo: string,
  contrasena: string,
): UsuarioDemo | null {
  const encontrado = USUARIOS_DEMO.find(
    (u) =>
      u.correo.toLowerCase() === correo.trim().toLowerCase() &&
      u.contrasena === contrasena,
  );
  return encontrado ?? null;
}

// RF52 — Eliminar cuenta (mock). Como todavía no hay backend, simulamos
// el borrado quitando al usuario de USUARIOS_DEMO: mientras la app
// siga abierta, ese correo ya no podrá volver a iniciar sesión. En
// producción esto se reemplaza por la llamada real DELETE /usuarios/:id.
export function eliminarUsuarioDemo(correo: string): void {
  const indice = USUARIOS_DEMO.findIndex(
    (u) => u.correo.toLowerCase() === correo.trim().toLowerCase(),
  );
  if (indice !== -1) USUARIOS_DEMO.splice(indice, 1);
}