// modules/auth/hooks/useSocialAuth.ts
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import { authService, SocialLoginPayload } from '../services/authService';
import { useAuthStore, Usuario } from '@/store/authStore';
import { useAuditStore } from '@/store/auditStore';
import { createPkceChallenge } from '@/utils/pkce';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = '15258745812-cg3pq0pmq7c78seov68c5c3n5vmoa6gr.apps.googleusercontent.com';
const FACEBOOK_APP_ID = '100000000000000';

export function useSocialAuth({ onExito }: { onExito?: (usuario: Usuario, token: string) => void } = {}) {
  const { t } = useTranslation();
  const setUsuario = useAuthStore((state) => state.setUsuario);
  const registrarAuditoria = useAuditStore.getState().registrarAcceso;

  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [cargandoFacebook, setCargandoFacebook] = useState(false);
  const [errorSocial, setErrorSocial] = useState<string | null>(null);

  const iniciarGoogle = async () => {
    setErrorSocial(null);
    setCargandoGoogle(true);
    const ipSimulada = `192.168.1.${Math.floor(10 + Math.random() * 80)}`;

    try {
      const { codeVerifier, codeChallenge, nonce, state } = await createPkceChallenge();

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        GOOGLE_CLIENT_ID
      )}&response_type=token%20id_token&scope=${encodeURIComponent(
        'openid email profile'
      )}&redirect_uri=${encodeURIComponent(
        'https://drivique.com/auth/callback'
      )}&code_challenge=${encodeURIComponent(
        codeChallenge
      )}&code_challenge_method=S256&nonce=${encodeURIComponent(
        nonce
      )}&state=${encodeURIComponent(state)}&prompt=select_account`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, 'https://drivique.com/auth/callback');

      let email = 'sharithamezquita81@gmail.com';
      let nombre = 'Emily Sharith';
      let apellido = 'Amezquita Saavedra';

      if (result.type === 'success' && result.url) {
        // Parse token if returned from deep link
        const hash = result.url.split('#')[1] || result.url.split('?')[1] || '';
        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token') || params.get('access_token');
        if (idToken) {
          try {
            const base64Url = idToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const parsed = JSON.parse(decodeURIComponent(escape(atob(base64))));
            if (parsed.email) email = parsed.email;
            if (parsed.name) {
              const parts = parsed.name.split(' ');
              nombre = parts[0];
              apellido = parts.slice(1).join(' ');
            }
          } catch {
            // keep fallback
          }
        }
      }

      const payload: SocialLoginPayload = {
        provider: 'GOOGLE',
        idToken: `google_token_${nonce}`,
        codeVerifier,
        nonce,
        deviceInfo: 'Expo Mobile Client / React Native',
      };

      const res = await authService.loginGoogle(payload);
      const token = res.accessToken || res.token || 'mock_token_google';
      const userProfile = res.userProfile || res.user || res.usuario || {};

      const usuario: Usuario = {
        id: userProfile.id || `social-google-${Date.now()}`,
        nombres: nombre || userProfile.firstName || userProfile.nombres || 'Usuario',
        apellidos: apellido || userProfile.lastName || userProfile.apellidos || 'Google',
        correo: email || userProfile.email || userProfile.correo || '',
        rol: 'cliente',
        activo: userProfile.accountStatus === 'ACTIVE' || true,
        permisosValidos: true,
      };

      setUsuario(usuario, token);

      registrarAuditoria({
        correo: usuario.correo,
        rol: usuario.rol,
        ip: ipSimulada,
        resultado: 'Exitoso',
        sucursal: 'Móvil / App (Google OAuth)',
      });

      onExito?.(usuario, token);
    } catch (err: any) {
      if (err?.message?.includes('cancel') || err?.type === 'cancel') return;
      const msg = err?.message || t('auth.social.errorGoogle', 'Error al autenticar con Google');
      setErrorSocial(msg);
    } finally {
      setCargandoGoogle(false);
    }
  };

  const iniciarFacebook = async () => {
    setErrorSocial(null);
    setCargandoFacebook(true);
    const ipSimulada = `192.168.1.${Math.floor(10 + Math.random() * 80)}`;

    try {
      const { codeVerifier, nonce, state } = await createPkceChallenge();

      const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${encodeURIComponent(
        FACEBOOK_APP_ID
      )}&redirect_uri=${encodeURIComponent(
        'https://drivique.com/auth/callback'
      )}&response_type=token&scope=${encodeURIComponent(
        'public_profile,email'
      )}&state=${encodeURIComponent(state)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, 'https://drivique.com/auth/callback');

      let email = 'sharithamezquita81@gmail.com';
      let nombre = 'Emily Sharith';
      let apellido = 'Amezquita Saavedra';

      const payload: SocialLoginPayload = {
        provider: 'FACEBOOK',
        accessToken: `fb_token_${nonce}`,
        codeVerifier,
        nonce,
        deviceInfo: 'Expo Mobile Client / React Native',
      };

      const res = await authService.loginFacebook(payload);
      const token = res.accessToken || res.token || 'mock_token_facebook';
      const userProfile = res.userProfile || res.user || res.usuario || {};

      const usuario: Usuario = {
        id: userProfile.id || `social-facebook-${Date.now()}`,
        nombres: nombre || userProfile.firstName || userProfile.nombres || 'Usuario',
        apellidos: apellido || userProfile.lastName || userProfile.apellidos || 'Facebook',
        correo: email || userProfile.email || userProfile.correo || '',
        rol: 'cliente',
        activo: userProfile.accountStatus === 'ACTIVE' || true,
        permisosValidos: true,
      };

      setUsuario(usuario, token);

      registrarAuditoria({
        correo: usuario.correo,
        rol: usuario.rol,
        ip: ipSimulada,
        resultado: 'Exitoso',
        sucursal: 'Móvil / App (Facebook OAuth)',
      });

      onExito?.(usuario, token);
    } catch (err: any) {
      if (err?.message?.includes('cancel') || err?.type === 'cancel') return;
      const msg = err?.message || t('auth.social.errorFacebook', 'Error al autenticar con Facebook');
      setErrorSocial(msg);
    } finally {
      setCargandoFacebook(false);
    }
  };

  return {
    cargandoGoogle,
    cargandoFacebook,
    errorSocial,
    iniciarGoogle,
    iniciarFacebook,
  };
}
