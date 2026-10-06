// modules/auth/hooks/useSocialAuth.ts
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authService, SocialLoginPayload } from '../services/authService';
import { useAuthStore, Usuario } from '@/store/authStore';
import { useAuditStore } from '@/store/auditStore';
import { createPkceChallenge } from '@/utils/pkce';

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
      const { codeVerifier, nonce } = await createPkceChallenge();

      const payload: SocialLoginPayload = {
        provider: 'GOOGLE',
        idToken: 'sandbox_google_token:cliente.movil.google@drivique.com',
        codeVerifier,
        nonce,
        deviceInfo: 'Expo Mobile Client / React Native',
      };

      const res = await authService.loginGoogle(payload);
      const token = res.accessToken || res.token || 'mock_token_google';
      const userProfile = res.userProfile || res.user || res.usuario || {};

      const usuario: Usuario = {
        id: userProfile.id || 'social-google-user',
        nombres: userProfile.firstName || userProfile.nombres || 'Usuario',
        apellidos: userProfile.lastName || userProfile.apellidos || 'Google',
        correo: userProfile.email || userProfile.correo || 'cliente.movil.google@drivique.com',
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
        sucursal: 'Móvil / App (Google)',
      });

      onExito?.(usuario, token);
    } catch (err: any) {
      const msg = err?.message || t('auth.social.errorGoogle', 'Error al iniciar sesión con Google');
      setErrorSocial(msg);
      registrarAuditoria({
        correo: 'google.auth@drivique.com',
        rol: 'visitante',
        ip: ipSimulada,
        resultado: 'Fallido - Credenciales incorrectas',
      });
    } finally {
      setCargandoGoogle(false);
    }
  };

  const iniciarFacebook = async () => {
    setErrorSocial(null);
    setCargandoFacebook(true);
    const ipSimulada = `192.168.1.${Math.floor(10 + Math.random() * 80)}`;

    try {
      const { codeVerifier, nonce } = await createPkceChallenge();

      const payload: SocialLoginPayload = {
        provider: 'FACEBOOK',
        accessToken: 'sandbox_facebook_token:cliente.movil.facebook@drivique.com',
        codeVerifier,
        nonce,
        deviceInfo: 'Expo Mobile Client / React Native',
      };

      const res = await authService.loginFacebook(payload);
      const token = res.accessToken || res.token || 'mock_token_facebook';
      const userProfile = res.userProfile || res.user || res.usuario || {};

      const usuario: Usuario = {
        id: userProfile.id || 'social-fb-user',
        nombres: userProfile.firstName || userProfile.nombres || 'Usuario',
        apellidos: userProfile.lastName || userProfile.apellidos || 'Facebook',
        correo: userProfile.email || userProfile.correo || 'cliente.movil.facebook@drivique.com',
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
        sucursal: 'Móvil / App (Facebook)',
      });

      onExito?.(usuario, token);
    } catch (err: any) {
      const msg = err?.message || t('auth.social.errorFacebook', 'Error al iniciar sesión con Facebook');
      setErrorSocial(msg);
      registrarAuditoria({
        correo: 'facebook.auth@drivique.com',
        rol: 'visitante',
        ip: ipSimulada,
        resultado: 'Fallido - Credenciales incorrectas',
      });
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
