import { cambiarContrasenaUsuarioDemo } from "@/mocks/demoUsers";
import { authService } from "@/modules/auth/services/authService";

export type ResultadoCambioContrasena = "actualizada" | "incorrecta";

export async function cambiarContrasena(params: {
  correo: string;
  token: string | null;
  contrasenaActual: string;
  nuevaContrasena: string;
}): Promise<ResultadoCambioContrasena> {
  const resultadoDemo = cambiarContrasenaUsuarioDemo(
    params.correo,
    params.contrasenaActual,
    params.nuevaContrasena,
  );

  if (resultadoDemo === "actualizada" || resultadoDemo === "incorrecta") {
    return resultadoDemo;
  }

  if (!params.token) throw new Error("missing-session");
  await authService.cambiarContrasena(params.token, {
    contrasenaActual: params.contrasenaActual,
    nuevaContrasena: params.nuevaContrasena,
  });
  return "actualizada";
}
