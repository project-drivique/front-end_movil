// modules/auth/services/authService.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api';

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
}

export const authService = {
  async login(correo: string, contrasena: string) {
    const response = await fetch(`${API_URL}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: correo, password: contrasena }),
    });
    if (!response.ok) throw new Error('Credenciales incorrectas');
    return response.json();
  },

  async registro(datos: object) {
    const response = await fetch(`${API_URL}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error en el registro');
    return response.json();
  },

  async socialLogin(payload: SocialLoginPayload) {
    const endpoint = payload.provider === 'FACEBOOK' ? '/v1/auth/facebook' : '/v1/auth/google';
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || 'Error en autenticación social');
    }
    return response.json();
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
    const response = await fetch(`${API_URL}/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: correo }),
    });
    if (!response.ok) throw new Error('Correo no registrado');
    return response.json();
  },

  async cambiarContrasena(
    token: string,
    datos: { contrasenaActual: string; nuevaContrasena: string },
  ) {
    const response = await fetch(`${API_URL}/v1/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.mensaje || error?.message || 'No fue posible actualizar la contraseña');
    }
    return response.json();
  },
};
