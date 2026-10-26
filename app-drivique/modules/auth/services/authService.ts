// modules/auth/services/authService.ts
import { apiClient } from '@/services/http/apiClient';
import i18n from "@/modules/i18n";
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

// Credenciales del registro/login pendiente de verificación. Solo en memoria
// (nunca se persisten) para iniciar sesión automáticamente tras verificar el correo.
let credencialesPendientes: { correo: string; contrasena: string } | null = null;

export const authService = {
  setCredencialesPendientes(correo: string, contrasena: string) {
    credencialesPendientes = { correo: correo.trim().toLowerCase(), contrasena };
  },
  consumirCredencialesPendientes(correo: string) {
    const c = credencialesPendientes;
    credencialesPendientes = null;
    return c && c.correo === correo.trim().toLowerCase() ? c : null;
  },

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
    } catch (e: any) {
      // Si el backend respondió (401/403/409...), se propaga el error real.
      if (e?.response) throw e;
      const rawApi = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';
      const base = rawApi.replace(/\/$/, '');
      const url = base.endsWith('/v1') ? `${base}/auth/login` : `${base}/v1/auth/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo, password: contrasena }),
      });
      if (!response.ok) throw new Error('Credenciales incorrectas');
      const data = await response.json();
      if (data?.refreshToken) {
        await sessionTokens.saveRefreshToken(data.refreshToken);
      }
      return data;
    }
  },

  async registro(datos: { correo: string; contrasena: string } | object) {
    const rawData = datos as any;
    const correo = (rawData.correo || rawData.email || '').trim().toLowerCase();
    const contrasena = rawData.contrasena || rawData.password || '';

    // Derivar nombres amigables del prefijo del correo
    const emailPrefix = correo.split('@')[0].replace(/[0-9]+$/, '').trim();
    const parts = emailPrefix.split(/[._\-\s]+/).filter(Boolean);
    const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '');
    const derivedFirst = parts.length > 0 ? cap(parts[0]) : i18n.t("extra.comun.usuario");
    const derivedLast = parts.length > 1 ? parts.slice(1).map(cap).join(' ') : 'Drivique';

    const payload = {
      firstName: rawData.firstName || derivedFirst,
      lastName: rawData.lastName || derivedLast,
      email: correo,
      password: contrasena,
    };

    try {
      const { data } = await apiClient.post('/auth/register', payload);
      return data;
    } catch (primaryError: any) {
      if (primaryError?.response) throw primaryError;
      try {
        const rawApi = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';
        const base = rawApi.replace(/\/$/, '');
        const url = base.endsWith('/v1') ? `${base}/auth/register` : `${base}/v1/auth/register`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const resData = await response.json().catch(() => null);
        if (response.ok) {
          return resData;
        }
        const errDetail = resData?.detail || resData?.message || resData?.mensaje || primaryError?.response?.data?.detail || primaryError?.response?.data?.message || i18n.t("extra.errores.registro");
        throw new Error(errDetail);
      } catch (fallbackError) {
        throw fallbackError instanceof Error ? fallbackError : primaryError;
      }
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
        const rawApi = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';
        const base = rawApi.replace(/\/$/, '');
        const endpoint = requestPayload.provider === 'FACEBOOK' ? '/auth/facebook' : '/auth/google';
        const url = base.endsWith('/v1') ? `${base}${endpoint}` : `${base}/v1${endpoint}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });
        if (response.ok) {
          const data = await response.json();
          if (data?.refreshToken) {
            await sessionTokens.saveRefreshToken(data.refreshToken);
          }
          return data;
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
    // Endpoint propio del cambio de contraseña: valida la actual, aplica la política y cierra las sesiones
    return apiClient.post(
      '/auth/change-password',
      { currentPassword: datos.contrasenaActual, newPassword: datos.nuevaContrasena },
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(({ data }) => data);
  },
};
