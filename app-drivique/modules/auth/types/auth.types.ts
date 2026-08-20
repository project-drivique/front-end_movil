export interface LoginForm {
  correo: string;
  contrasena: string;
}

export interface RegistroForm {
  correo: string;
  contrasena: string;
  confirmarContrasena: string;
  aceptaTerminos: boolean;
}

export interface OlvideContrasenaForm {
  correo: string;
}

export interface AuthError {
  campo?: string;
  mensaje: string;
}