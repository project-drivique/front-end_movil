import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { sessionTokens } from './sessionTokens'

const baseURL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '')

if (!baseURL) {
  throw new Error('EXPO_PUBLIC_API_URL es obligatoria.')
}

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

let refreshRequest: Promise<string> | null = null

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
    const isRefreshRequest = request?.url?.includes('/auth/refresh')

    if (error.response?.status !== 401 || !request || request._retried || isRefreshRequest) {
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
  return data.accessToken
}