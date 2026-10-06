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

  const [modalConsentimiento, setModalConsentimiento] = useState<{
    visible: boolean;
    provider: 'GOOGLE' | 'FACEBOOK';
  }>({
    visible: false,
    provider: 'GOOGLE',
  });

  const procesarLoginSocial = async ({
    provider,
    email,
    firstName,
    lastName,
  }: {
    provider: 'GOOGLE' | 'FACEBOOK';
    email: string;
    firstName: string;
    lastName: string;
  }) => {
    const isGoogle = provider === 'GOOGLE';
    if (isGoogle) setCargandoGoogle(true);
    else setCargandoFacebook(true);
    setErrorSocial(null);
    const ipSimulada = `192.168.1.${Math.floor(10 + Math.random() * 80)}`;

    try {
      const { codeVerifier, nonce } = await createPkceChallenge();

      const payload: SocialLoginPayload = {
        provider,
        idToken: isGoogle ? `mobile_google_token:${email}` : undefined,
        accessToken: !isGoogle ? `mobile_fb_token:${email}` : undefined,
        codeVerifier,
        nonce,
        deviceInfo: 'Expo Mobile Client / React Native',
      };

      const res = isGoogle ? await authService.loginGoogle(payload) : await authService.loginFacebook(payload);
      const token = res.accessToken || res.token || `mock_token_${provider.toLowerCase()}`;
      const userProfile = res.userProfile || res.user || res.usuario || {};

      const usuario: Usuario = {
        id: userProfile.id || `social-${provider.toLowerCase()}-${Date.now()}`,
        nombres: firstName || userProfile.firstName || userProfile.nombres || 'Usuario',
        apellidos: lastName || userProfile.lastName || userProfile.apellidos || (isGoogle ? 'Google' : 'Facebook'),
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
        sucursal: `Móvil / App (${provider})`,
      });

      onExito?.(usuario, token);
    } catch (err: any) {
      const msg = err?.message || t('auth.social.error', 'Error al iniciar sesión');
      setErrorSocial(msg);
      registrarAuditoria({
        correo: email || 'social.auth@drivique.com',
        rol: 'visitante',
        ip: ipSimulada,
        resultado: 'Fallido - Credenciales incorrectas',
      });
    } finally {
      if (isGoogle) setCargandoGoogle(false);
      else setCargandoFacebook(false);
    }
  };

  const iniciarGoogle = () => {
    setModalConsentimiento({ visible: true, provider: 'GOOGLE' });
  };

  const iniciarFacebook = () => {
    setModalConsentimiento({ visible: true, provider: 'FACEBOOK' });
  };

  const cerrarConsentimiento = () => {
    setModalConsentimiento((prev) => ({ ...prev, visible: false }));
  };

  const confirmarConsentimiento = (datos: { email: string; firstName: string; lastName: string; provider: string }) => {
    cerrarConsentimiento();
    procesarLoginSocial({
      provider: datos.provider as 'GOOGLE' | 'FACEBOOK',
      email: datos.email,
      firstName: datos.firstName,
      lastName: datos.lastName,
    });
  };

  return {
    cargandoGoogle,
    cargandoFacebook,
    errorSocial,
    iniciarGoogle,
    iniciarFacebook,
    modalConsentimiento,
    cerrarConsentimiento,
    confirmarConsentimiento,
  };
}
