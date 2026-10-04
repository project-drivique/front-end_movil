import { apiClient } from '@/services/http/apiClient'
import { FormCambiarCorreo, FormEditarPerfil, UsuarioPerfil } from '../types/profile.types'

export async function obtenerPerfil(_token: string): Promise<UsuarioPerfil> {
  return apiClient.get('/users/me').then(({ data }) => data)
}

export async function actualizarPerfil(_token: string, datos: FormEditarPerfil): Promise<UsuarioPerfil> {
  return apiClient.put('/users/me', datos).then(({ data }) => data)
}

export async function cambiarCorreo(_token: string, _datos: FormCambiarCorreo): Promise<{ mensaje: string }> {
  throw new Error('El cambio de correo requiere verificación y se habilitará en la HU-INT-04.')
}