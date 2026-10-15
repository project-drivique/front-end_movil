export type TipoDocumento =
  | "CC"
  | "CE"
  | "Pasaporte"
  | "DNI"
  | "PPT"
  | "PEP"
  | "Doc. Extranjero";

// Nacionalidad es el UUID de GET /nationalities (nationalityId en el backend).
export type Nacionalidad = string;

export interface UsuarioPerfil {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  tipoDocumento: TipoDocumento | "";
  numeroDocumento: string;
  fechaNacimiento: string;
  nacionalidad: Nacionalidad | "";
  direccion: string;
  perfilCompleto: boolean;
}

export interface FormEditarPerfil {
  nombres: string;
  apellidos: string;
  telefono: string;
  fechaNacimiento: string;
  nacionalidad: Nacionalidad | "";
  direccion: string;
}

export interface FormCompletarPerfil {
  nombres: string;
  apellidos: string;
  telefono: string;
  fechaNacimiento: string;
  tipoDocumento: TipoDocumento | "";
  numeroDocumento: string;
  nacionalidad: Nacionalidad | "";
}

export interface FormCambiarCorreo {
  nuevoCorreo: string;
  confirmarCorreo: string;
  contrasenaActual: string;
}

export interface ErroresPerfil {
  direccion?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  fechaNacimiento?: string;
  nacionalidad?: string;
}

export interface ErroresCompletarPerfil {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  fechaNacimiento?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  nacionalidad?: string;
}

export interface ErroresCambiarCorreo {
  nuevoCorreo?: string;
  confirmarCorreo?: string;
  contrasenaActual?: string;
}
