/**
 * RF50 — Editar información del usuario
 * Capa de servicios del módulo de perfil
 * Se conectará a la API REST cuando esté disponible
 */

import { FormCambiarCorreo, FormEditarPerfil, UsuarioPerfil } from "../types/profile.types";

// URL base de la API — se configura con variable de entorno
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

// ── Obtener perfil del usuario autenticado ────────────────────────────────────
export async function obtenerPerfil(token: string): Promise<UsuarioPerfil> {
  const response = await fetch(`${API_URL}/usuarios/perfil`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener el perfil");
  }

  return response.json();
}

// ── Actualizar datos del perfil ───────────────────────────────────────────────
export async function actualizarPerfil(
  token: string,
  datos: FormEditarPerfil
): Promise<UsuarioPerfil> {
  const response = await fetch(`${API_URL}/usuarios/perfil`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar el perfil");
  }

  return response.json();
}

// ── Cambiar correo electrónico ────────────────────────────────────────────────
export async function cambiarCorreo(
  token: string,
  datos: FormCambiarCorreo
): Promise<{ mensaje: string }> {
  const response = await fetch(`${API_URL}/usuarios/cambiar-correo`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.mensaje ?? "Error al cambiar el correo");
  }

  return response.json();
}
