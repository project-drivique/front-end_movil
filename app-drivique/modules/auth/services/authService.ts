import { apiClient } from '@/services/http/apiClient'
import { sessionTokens } from '@/services/http/sessionTokens'

export interface AuthSession {
  accessToken: string
  refreshToken: string
  expiresIn: number
  userProfile: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    roles: string[]
    profileComplete: boolean
    accountStatus: string
  }
}

export const authService = {
  async login(correo: string, contrasena: string): Promise<AuthSession> {
    const { data } = await apiClient.post<AuthSession>('/auth/login', {
      email: correo,
      password: contrasena,
      deviceInfo: 'Drivique móvil',
    })
    await sessionTokens.saveRefreshToken(data.refreshToken)
    return data
  },

  async registro(datos: object) {
    return apiClient.post('/auth/register', datos).then(({ data }) => data)
  },

  async recuperarContrasena(correo: string) {
    return apiClient.post('/auth/forgot-password', { email: correo }).then(({ data }) => data)
  },

  async cambiarContrasena(token: string, datos: { contrasenaActual: string; nuevaContrasena: string }) {
    return apiClient.put('/users/me', {
      currentPassword: datos.contrasenaActual,
      newPassword: datos.nuevaContrasena,
    }, { headers: { Authorization: `Bearer ${token}` } }).then(({ data }) => data)
  },}