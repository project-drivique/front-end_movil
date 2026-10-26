import { authService } from "@/modules/auth/services/authService";

export type EstadoCambioContrasena = "actualizada" | "incorrecta" | "debil" | "igual" | "bloqueada";
export interface ResultadoCambioContrasena {
  estado: EstadoCambioContrasena;
  intentosRestantes?: number;
  minutosBloqueo?: number;
}

export async function cambiarContrasena(params: { correo: string; token: string | null; contrasenaActual: string; nuevaContrasena: string }): Promise<ResultadoCambioContrasena> {
  if (!params.token) throw new Error("missing-session");
  try {
    await authService.cambiarContrasena(params.token, { contrasenaActual: params.contrasenaActual, nuevaContrasena: params.nuevaContrasena });
    return { estado: "actualizada" };
  } catch (error: any) {
    // El servidor entrega un código estable por cada caso; solo los fallos reales de red o servidor se relanzan
    const data = error?.response?.data ?? {};
    const code = data.errors?.[0]?.code;
    if (code === "INVALID_PASSWORD") return { estado: "incorrecta", intentosRestantes: data.meta?.remainingAttempts };
    if (code === "WEAK_PASSWORD") return { estado: "debil" };
    if (code === "SAME_PASSWORD") return { estado: "igual" };
    if (code === "ACCOUNT_LOCKED" || error?.response?.status === 423) return { estado: "bloqueada", minutosBloqueo: Number(data.meta?.lockedMinutes) || 30 };
    throw error;
  }
}
