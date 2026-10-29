import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'
import i18n from '@/modules/i18n'
import { sessionTokens } from './sessionTokens'

const baseURL = (process.env.EXPO_PUBLIC_API_URL || 'https://drivique.tech/api/v1').trim().replace(/\/$/, '')

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

let refreshRequest: Promise<string> | null = null

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  // El servidor escribe los correos en el idioma que la persona está usando en la app
  const language = i18n.resolvedLanguage || i18n.language
  if (language) config.headers['X-App-Language'] = language
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
    const isRefreshRequest = request?.url?.includes('/auth/refresh')

    // Solo se renueva la sesión si la petición iba con sesión: un visitante (sin token) no debe quedar logueado
    const teniaSesion = Boolean(request?.headers?.Authorization);

    if (error.response?.status !== 401 || !request || request._retried || isRefreshRequest || !teniaSesion) {
      return Promise.reject(error)
    }

    request._retried = true
    try {
      refreshRequest ??= refreshSession()
      const accessToken = await refreshRequest
      request.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(request)
    } catch (refreshError) {
      await sessionTokens.clearRefreshToken()
      useAuthStore.getState().cerrarSesion()
      return Promise.reject(refreshError)
    } finally {
      refreshRequest = null
    }
  },
)

async function refreshSession(): Promise<string> {
  const refreshToken = await sessionTokens.getRefreshToken()
  if (!refreshToken) throw new Error('La sesión expiró. Inicia sesión nuevamente.')

  const { data } = await apiClient.post('/auth/refresh', { refreshToken })
  await sessionTokens.saveRefreshToken(data.refreshToken)
  useAuthStore.setState({ token: data.accessToken })
  if (data.userProfile) {
    useAuthStore.getState().actualizarUsuario(data.userProfile)
  }
  return data.accessToken
}