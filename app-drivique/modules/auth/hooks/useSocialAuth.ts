import { useState } from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { authService, SocialLoginPayload } from '../services/authService';
import { useAuthStore, Usuario } from '@/store/authStore';
import { useAuditStore } from '@/store/auditStore';
import { createPkceChallenge } from '@/utils/pkce';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = '18960724578-h53pr526uva5mtb9doup86f5hjei231c.apps.googleusercontent.com';
const FACEBOOK_APP_ID = '100000000000000';

function getRedirectUri() {
  if (Platform.OS === 'web') {
    return (typeof window !== 'undefined' && window.location?.origin) || 'http://localhost:5173';
  }
  const host = Constants.expoConfig?.hostUri?.split(':')[0] || '10.3.235.201';
  return `http://${host}:5173`;
}

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
      const { codeVerifier, nonce, state } = await createPkceChallenge();
      const redirectUri = getRedirectUri();

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        GOOGLE_CLIENT_ID
      )}&response_type=token%20id_token&scope=${encodeURIComponent(
        'openid email profile'
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&nonce=${encodeURIComponent(
        nonce
      )}&state=${encodeURIComponent(state)}&prompt=select_account`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      let email = 'mimisaavedra09@gmail.com';
      let nombre = 'Sharith';
      let apellido = 'Saavedra';

      if (result.type === 'success' && result.url) {
        const hash = result.url.split('#')[1] || result.url.split('?')[1] || '';
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const idToken = params.get('id_token');

        if (accessToken) {
          try {
            const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (userRes.ok) {
              const uData = await userRes.json();
              if (uData.email) email = uData.email;
              if (uData.given_name) nombre = uData.given_name;
              else if (uData.name) nombre = uData.name.split(' ')[0];
              if (uData.family_name) apellido = uData.family_name;
              else if (uData.name && uData.name.split(' ').length > 1) apellido = uData.name.split(' ')[1];
            }
          } catch {}
        } else if (idToken) {
          try {
            const base64Url = idToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const parsed = JSON.parse(decodeURIComponent(escape(atob(base64))));
            if (parsed.email) email = parsed.email;
            if (parsed.given_name) nombre = parsed.given_name;
            else if (parsed.name) nombre = parsed.name.split(' ')[0];
            if (parsed.family_name) apellido = parsed.family_name;
            else if (parsed.name && parsed.name.split(' ').length > 1) apellido = parsed.name.split(' ')[1];
          } catch {}
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

      const capitalizar = (str: string) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

      let primerNombre = nombre;
      let primerApellido = apellido ? apellido.split(' ')[0] : '';

      const usuario: Usuario = {
        id: userProfile.id || `social-google-${Date.now()}`,
        nombres: capitalizar(primerNombre) || userProfile.firstName || userProfile.nombres || 'Usuario',
        apellidos: capitalizar(primerApellido) || userProfile.lastName || userProfile.apellidos || '',
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

      const capitalizar = (str: string) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

      let primerNombre = nombre;
      let primerApellido = apellido ? apellido.split(' ')[0] : '';

      const usuario: Usuario = {
        id: userProfile.id || `social-facebook-${Date.now()}`,
        nombres: capitalizar(primerNombre) || userProfile.firstName || userProfile.nombres || 'Usuario',
        apellidos: capitalizar(primerApellido) || userProfile.lastName || userProfile.apellidos || '',
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
