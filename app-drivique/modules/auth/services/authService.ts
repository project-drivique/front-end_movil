import { apiClient } from '@/services/http/apiClient'
import { sessionTokens } from '@/services/http/sessionTokens'

export interface AuthSession {
  accessToken: string
  refreshToken: string
  expiresIn: number
  userProfile: { id: string; firstName: string; lastName: string; email: string; phone?: string; roles: string[]; profileComplete: boolean; accountStatus: string }
}

export const authService = {
  async login(correo: string, contrasena: string): Promise<AuthSession> {
    const { data } = await apiClient.post<AuthSession>('/auth/login', { email: correo, password: contrasena, deviceInfo: 'Drivique móvil' })
    await sessionTokens.saveRefreshToken(data.refreshToken)
    return data
  },
  async registro(datos: { correo: string; contrasena: string }) { return apiClient.post('/auth/register', { firstName: 'Usuario', lastName: 'Drivique', email: datos.correo, password: datos.contrasena }).then(({ data }) => data) },
  async recuperarContrasena(correo: string) { return apiClient.post('/auth/forgot-password', { email: correo }).then(({ data }) => data) },
  async validarCodigoRecuperacion(correo: string, codigo: string) { return apiClient.post('/auth/validate-reset-code', { email: correo, code: codigo }).then(({ data }) => data) },
  async restablecerContrasena(correo: string, codigo: string, nuevaContrasena: string) { return apiClient.post('/auth/reset-password', { email: correo, code: codigo, newPassword: nuevaContrasena }).then(({ data }) => data) },
  async reenviarVerificacion(correo: string) { return apiClient.post('/auth/resend-verification', { email: correo }).then(({ data }) => data) },
  async verificarCorreo(correo: string, codigo: string) { return apiClient.post('/auth/verify-email', { email: correo, code: codigo }).then(({ data }) => data) },
  async cambiarContrasena(token: string, datos: { contrasenaActual: string; nuevaContrasena: string }) {
    return apiClient.put('/users/me', { currentPassword: datos.contrasenaActual, newPassword: datos.nuevaContrasena }, { headers: { Authorization: `Bearer ${token}` } }).then(({ data }) => data)
  },
}