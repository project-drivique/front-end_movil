// utils/validators.ts
//
// Reglas de validación compartidas — antes estaban copiadas y pegadas en
// modules/auth/hooks/useAuth.ts y modules/profile/hooks/useProfile.ts
// (el regex de correo, el de teléfono y el cálculo de edad por fecha de
// nacimiento existían dos veces cada uno, con pequeñas diferencias entre
// copias). Un solo punto de verdad para cada regla.

export function esCorreoValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) && !correo.includes(" ");
}

export function esTelefonoValido(telefono: string): boolean {
  return /^\+?[\d\s\-(). ]{7,20}$/.test(telefono.trim());
}

export function esContrasenaSegura(contrasena: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
    contrasena,
  );
}

/**
 * Edad en años cumplidos a partir de una fecha "YYYY-MM-DD".
 * Devuelve null si la fecha no es válida.
 */
export function calcularEdad(fechaNacimiento: string): number | null {
  const fecha = new Date(fechaNacimiento);
  if (isNaN(fecha.getTime())) return null;

  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const mesDiff = hoy.getMonth() - fecha.getMonth();
  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }
  return edad;
}
