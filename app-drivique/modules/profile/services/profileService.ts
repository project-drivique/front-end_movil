import { apiClient } from '@/services/http/apiClient'
import { useReferenceStore } from '@/store/referenceStore'
import { FormCambiarCorreo, FormEditarPerfil, UsuarioPerfil } from '../types/profile.types'

export interface UserPreferencesDTO {
  userId?: string
  languageId?: string
  currencyId?: string
  themePreference?: string
  emailNotifications?: boolean
  smsNotifications?: boolean
  pushNotifications?: boolean
  inAppNotifications?: boolean
  marketingNotifications?: boolean
  updatedAt?: string
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

const CODIGO_DOCUMENTO: Record<string, string> = {
  PASSPORT: 'Pasaporte',
  DRIVER_LICENSE: 'Licencia de Conducción',
  CC: 'CC',
  CE: 'CE',
}

export function mapPerfil(data: any): UsuarioPerfil {
  const codigo = String(data.documentTypeCode || '')
  return {
    id: data.id,
    nombres: data.firstName || '',
    apellidos: data.lastName || '',
    correo: data.email || '',
    telefono: data.phone || '',
    tipoDocumento: (CODIGO_DOCUMENTO[codigo] || codigo) as any,
    numeroDocumento: data.documentNumber || '',
    fechaNacimiento: data.birthDate ? String(data.birthDate).slice(0, 10) : '',
    nacionalidad: data.nationalityId || '',
    direccion: data.address || '',
    perfilCompleto: Boolean(data.profileComplete),
  }
}

export async function obtenerPerfil(_token?: string): Promise<UsuarioPerfil> {
  const { data } = await apiClient.get('/users/me')
  return mapPerfil(data)
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// El servidor guarda la nacionalidad por UUID: si llegó un nombre o código (lista aún sin cargar) se busca su id
function resolverNacionalidadId(valor?: string): string | undefined {
  if (!valor) return undefined;
  if (UUID_RE.test(valor)) return valor;
  const v = valor.trim().toLowerCase();
  const n = useReferenceStore.getState().nacionalidades.find((x) => x.name.toLowerCase() === v || x.isoCode?.toLowerCase() === v);
  return n?.id;
}

// La app usa etiquetas ("Pasaporte", "Doc. Extranjero"); el servidor guarda códigos (PASSPORT, CE...)
function codigoDocumento(tipo?: string): string | undefined {
  if (!tipo) return undefined;
  const t = tipo.trim().toUpperCase();
  if (t === 'PASAPORTE' || t === 'PAS') return 'PASSPORT';
  if (t === 'DOC. EXTRANJERO' || t === 'DOCEXTRANJERO') return 'CE';
  return t;
}

export async function actualizarPerfil(
  _token: string,
  datos: FormEditarPerfil & { numeroDocumento?: string; tipoDocumento?: string }
): Promise<UsuarioPerfil> {
  const payload = {
    firstName: datos.nombres.trim(),
    lastName: datos.apellidos.trim(),
    phone: datos.telefono.trim(),
    birthDate: datos.fechaNacimiento || undefined,
    nationalityId: resolverNacionalidadId(datos.nacionalidad),
    address: datos.direccion ? datos.direccion.trim() : undefined,
    documentNumber: datos.numeroDocumento ? datos.numeroDocumento.trim() : undefined,
    documentTypeCode: codigoDocumento(datos.tipoDocumento),
  }
  const { data } = await apiClient.put('/users/me', payload)
  return mapPerfil(data)
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
