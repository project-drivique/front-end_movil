import { apiClient } from '@/services/http/apiClient'
import { FormCambiarCorreo, FormEditarPerfil, UsuarioPerfil } from '../types/profile.types'

export interface UserPreferencesDTO {
  userId?: string
  languageId?: string
  currencyId?: string
  themePreference?: string
  emailNotifications?: boolean
  smsNotifications?: boolean
}

export interface UserDocumentDTO {
  id: string
  documentTypeId: string
  documentTypeName: string
  documentNumber?: string
  frontUrl: string
  backUrl?: string
  status: string
  reviewNotes?: string
  createdAt?: string
}

export async function obtenerPerfil(_token?: string): Promise<UsuarioPerfil> {
  const { data } = await apiClient.get('/users/me')
  return {
    id: data.id,
    nombres: data.firstName || '',
    apellidos: data.lastName || '',
    correo: data.email || '',
    telefono: data.phone || '',
    tipoDocumento: (data.documentTypeId as any) || '',
    numeroDocumento: data.documentNumber || '',
    fechaNacimiento: data.birthDate || '',
    nacionalidad: (data.nationalityId as any) || '',
    perfilCompleto: Boolean(data.profileComplete),
  }
}

export async function actualizarPerfil(_token: string, datos: FormEditarPerfil): Promise<UsuarioPerfil> {
  const payload = {
    firstName: datos.nombres,
    lastName: datos.apellidos,
    phone: datos.telefono,
    birthDate: datos.fechaNacimiento,
    nationalityId: datos.nacionalidad || undefined,
  }
  const { data } = await apiClient.put('/users/me', payload)
  return {
    id: data.id,
    nombres: data.firstName || '',
    apellidos: data.lastName || '',
    correo: data.email || '',
    telefono: data.phone || '',
    tipoDocumento: (data.documentTypeId as any) || '',
    numeroDocumento: data.documentNumber || '',
    fechaNacimiento: data.birthDate || '',
    nacionalidad: (data.nationalityId as any) || '',
    perfilCompleto: Boolean(data.profileComplete),
  }
}

export async function obtenerPreferencias(): Promise<UserPreferencesDTO> {
  const { data } = await apiClient.get('/users/me/preferences')
  return data
}

export async function actualizarPreferencias(preferences: Partial<UserPreferencesDTO>): Promise<UserPreferencesDTO> {
  const { data } = await apiClient.put('/users/me/preferences', preferences)
  return data
}

export async function eliminarCuenta(password: string): Promise<void> {
  await apiClient.delete('/users/me', { data: { password } })
}

export async function obtenerDocumentosKYC(): Promise<UserDocumentDTO[]> {
  const { data } = await apiClient.get('/users/me/documents')
  return data
}

export async function subirDocumentoKYC(formData: FormData): Promise<UserDocumentDTO> {
  const { data } = await apiClient.post('/users/me/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function cambiarCorreo(_token: string, _datos: FormCambiarCorreo): Promise<{ mensaje: string }> {
  throw new Error('El cambio de correo requiere verificación y se habilitará en la HU-INT-04.')
}