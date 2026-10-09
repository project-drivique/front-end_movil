// modules/auth/services/authService.ts
import { apiClient } from '@/services/http/apiClient';
import { sessionTokens } from '@/services/http/sessionTokens';

export interface SocialLoginPayload {
  provider: 'GOOGLE' | 'FACEBOOK';
  idToken?: string;
  accessToken?: string;
  authCode?: string;
  codeVerifier?: string;
  redirectUri?: string;
  nonce?: string;
  deviceInfo?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  userProfile: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    roles: string[];
    profileComplete?: boolean;
    accountStatus: string;
  };
}

export const authService = {
  async login(correo: string, contrasena: string): Promise<AuthSession> {
    try {
      const { data } = await apiClient.post<AuthSession>('/auth/login', {
        email: correo,
        password: contrasena,
        deviceInfo: 'Drivique móvil',
      });
      if (data?.refreshToken) {
        await sessionTokens.saveRefreshToken(data.refreshToken);
      }
      return data;
    } catch (e) {
      const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api';
      const response = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo, password: contrasena }),
      });
      if (!response.ok) throw new Error('Credenciales incorrectas');
      return response.json();
    }
  },

  async registro(datos: { correo: string; contrasena: string } | object) {
    try {
      const payload = 'correo' in datos
        ? { firstName: 'Usuario', lastName: 'Drivique', email: datos.correo, password: datos.contrasena }
        : datos;
      const { data } = await apiClient.post('/auth/register', payload);
      return data;
    } catch {
      const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api';
      const response = await fetch(`${API_URL}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error('Error en el registro');
      return response.json();
    }
  },

  async socialLogin(payload: SocialLoginPayload) {
    const requestPayload: SocialLoginPayload = {
      provider: payload.provider,
      idToken: payload.idToken,
      accessToken: payload.accessToken,
      authCode: payload.authCode,
      codeVerifier: payload.codeVerifier,
      redirectUri: payload.redirectUri,
      nonce: payload.nonce,
      deviceInfo: payload.deviceInfo || 'Drivique móvil',
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
    try {
      const endpoint = requestPayload.provider === 'FACEBOOK' ? '/auth/facebook' : '/auth/google';
      const { data } = await apiClient.post<any>(endpoint, requestPayload);
      if (data?.refreshToken) {
        await sessionTokens.saveRefreshToken(data.refreshToken);
      }
      return data;
    } catch (primaryError) {
      try {
        const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api';
        const endpoint = requestPayload.provider === 'FACEBOOK' ? '/v1/auth/facebook' : '/v1/auth/google';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          return await response.json();
        }
        throw new Error('El proveedor social rechazó la autenticación.');
      } catch (fallbackError) {
        throw fallbackError instanceof Error ? fallbackError : primaryError;
      }
    }
  },

  async loginGoogle(payload: Partial<SocialLoginPayload> | string) {
    const body: SocialLoginPayload = typeof payload === 'string'
      ? { provider: 'GOOGLE', idToken: payload }
      : { provider: 'GOOGLE', ...payload };
    return this.socialLogin(body);
  },

  async loginFacebook(payload: Partial<SocialLoginPayload> | string) {
    const body: SocialLoginPayload = typeof payload === 'string'
      ? { provider: 'FACEBOOK', accessToken: payload }
      : { provider: 'FACEBOOK', ...payload };
    return this.socialLogin(body);
  },

  async recuperarContrasena(correo: string) {
    return apiClient.post('/auth/forgot-password', { email: correo }).then(({ data }) => data);
  },

  async validarCodigoRecuperacion(correo: string, codigo: string) {
    return apiClient.post('/auth/validate-reset-code', { email: correo, code: codigo }).then(({ data }) => data);
  },

  async restablecerContrasena(correo: string, codigo: string, nuevaContrasena: string) {
    return apiClient.post('/auth/reset-password', { email: correo, code: codigo, newPassword: nuevaContrasena }).then(({ data }) => data);
  },

  async reenviarVerificacion(correo: string) {
    return apiClient.post('/auth/resend-verification', { email: correo }).then(({ data }) => data);
  },

  async verificarCorreo(correo: string, codigo: string) {
    return apiClient.post('/auth/verify-email', { email: correo, code: codigo }).then(({ data }) => data);
  },

  async eliminarCuenta(contrasena: string) {
    await apiClient.delete('/users/me', { data: { password: contrasena } });
  },

  async cambiarContrasena(token: string, datos: { contrasenaActual: string; nuevaContrasena: string }) {
    return apiClient.put(
      '/users/me',
      { currentPassword: datos.contrasenaActual, newPassword: datos.nuevaContrasena },
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(({ data }) => data);
  },
};
