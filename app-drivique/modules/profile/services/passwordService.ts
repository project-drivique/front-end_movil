import { authService } from "@/modules/auth/services/authService";
export type ResultadoCambioContrasena = "actualizada" | "incorrecta";
export async function cambiarContrasena(params: { correo: string; token: string | null; contrasenaActual: string; nuevaContrasena: string }): Promise<ResultadoCambioContrasena> {
  if (!params.token) throw new Error("missing-session");
  try { await authService.cambiarContrasena(params.token, { contrasenaActual: params.contrasenaActual, nuevaContrasena: params.nuevaContrasena }); return "actualizada"; }
  catch (error: any) { if (error?.response?.status === 400 || error?.response?.status === 401) return "incorrecta"; throw error; }
}