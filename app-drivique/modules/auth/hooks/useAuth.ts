import { useState } from 'react';
import i18n from '@/modules/i18n';
import { router } from 'expo-router';
import { LoginForm, RegistroForm, OlvideContrasenaForm, AuthError } from '../types/auth.types';
import { esCorreoValido as validarCorreo, esContrasenaSegura as validarContrasenaSegura } from '@/utils/validators';
import { authService } from '../services/authService';
import { useAuthStore } from '@/store/authStore';
import { Alert } from "@/utils/alerta";

const errorMessage = (error: any, fallback: string) =>
  error?.response?.data?.detail ||
  error?.response?.data?.mensaje ||
  error?.response?.data?.message ||
  error?.response?.data?.title ||
  fallback;

// Convierte el userProfile del backend al usuario que usa el store de la app.
export function mapearUsuarioSesion(p: any) {
  const rolesArray = (p?.roles || []) as string[];
  const rol = rolesArray.includes('SUPER_ADMIN') || rolesArray.includes('ADMIN')
    ? 'administrador'
    : rolesArray.includes('BRANCH_ADMIN') || rolesArray.includes('BRANCH_MANAGER') || rolesArray.includes('EMPLOYEE')
    ? 'encargado_sucursal'
    : 'cliente';
  return {
    id: p.id,
    correo: p.email,
    nombres: p.firstName,
    apellidos: p.lastName,
    telefono: p.phone,
    rol,
    roles: rolesArray,
    activo: p.accountStatus === 'ACTIVE',
    permisosValidos: p.accountStatus === 'ACTIVE',
    permisos: p.permissions || [],
    sucursalId: p.branchId || p.sucursalId,
    sucursalNombre: p.branchName || p.sucursalNombre,
    branchId: p.branchId,
    branchName: p.branchName,
  };
}

export function useLogin() {
  const [form, setForm] = useState<LoginForm>({ correo: '', contrasena: '' }); const [errores, setErrores] = useState<AuthError[]>([]); const [cargando, setCargando] = useState(false); const bloqueado = false;
  const actualizarCampo = (campo: keyof LoginForm, valor: string) => { setForm((p) => ({ ...p, [campo]: valor })); setErrores((p) => p.filter((e) => e.campo !== campo)) };
  const iniciarSesion = async (onExito: (usuario: any, token: string) => void, onRequireVerification?: (correo: string) => void) => {
    const e: AuthError[] = [];
    if (!validarCorreo(form.correo)) e.push({ campo: 'correo', mensaje: i18n.t('auth.errores.correoInvalido') });
    if (!form.contrasena) e.push({ campo: 'contrasena', mensaje: i18n.t('auth.errores.contrasenaObligatoria') });
    if (e.length) { setErrores(e); return };
    setCargando(true);
    try {
      const session = await authService.login(form.correo, form.contrasena);
      onExito(mapearUsuarioSesion(session.userProfile), session.accessToken);
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data || {};
      // El servidor entrega un código estable por cada caso: el mensaje se arma aquí, en el idioma de la persona
      const serverCode = data.errors?.[0]?.code || '';
      const meta = data.meta || {};
      const code = data.code || data.errorCode || serverCode;
      const msg = errorMessage(error, '');
      if (!error?.response) {
        setErrores([{ mensaje: i18n.t('auth.errores.sinConexion') }]);
        return;
      }
      if (serverCode === 'ACCOUNT_NOT_FOUND' || status === 404) {
        // Aviso bajo el campo y además el modal de error
        setErrores([{ campo: 'correo', mensaje: i18n.t('auth.errores.cuentaNoExiste') }, { mensaje: i18n.t('auth.errores.cuentaNoExiste'), titulo: i18n.t('auth.errores.cuentaNoEncontrada') }]);
        return;
      }
      if (serverCode === 'INVALID_PASSWORD') {
        const mensaje = meta.remainingAttempts !== undefined
          ? i18n.t('auth.errores.contrasenaIncorrecta', { remaining: meta.remainingAttempts })
          : i18n.t('auth.errores.contrasenaIncorrectaSimple');
        // Aviso bajo el campo y además el modal de error
        setErrores([{ campo: 'contrasena', mensaje }, { mensaje, titulo: i18n.t('auth.errores.contrasenaIncorrectaTitulo') }]);
        return;
      }
      if (serverCode === 'ACCOUNT_LOCKED' || status === 423 || status === 429) {
        setErrores([{ mensaje: i18n.t('auth.errores.cuentaBloqueada', { minutes: Number(meta.lockedMinutes) || 30 }) }]);
        return;
      }
      if (serverCode === 'ACCOUNT_DISABLED') {
        setErrores([{ mensaje: i18n.t('auth.errores.cuentaDesactivada') }]);
        return;
      }
      const isNotVerified =
        code === 'EMAIL_NOT_VERIFIED' ||
        code === 'USER_NOT_VERIFIED' ||
        code === 'PENDING_VERIFICATION' ||
        code === 'UNVERIFIED_ACCOUNT' ||
        msg.toLowerCase().includes('verifi') ||
        (status === 403 && (msg.toLowerCase().includes('correo') || msg.toLowerCase().includes('cuenta')));
      
      if (isNotVerified) {
        authService.setCredencialesPendientes(form.correo, form.contrasena);
        if (onRequireVerification) {
          onRequireVerification(form.correo);
        } else {
          // Fallback a router push directo
          router.push({ pathname: "/(auth)/verify-email", params: { correo: form.correo } });
        }
      } else {
        setErrores([{ mensaje: errorMessage(error, i18n.t('auth.errores.loginFallido')) }]);
      }
    } finally {
      setCargando(false);
    }
  };
  return { form, errores, cargando, bloqueado, actualizarCampo, iniciarSesion };
}
export function useRegistro() {
  const [form, setForm] = useState<RegistroForm>({ correo: '', contrasena: '', confirmarContrasena: '', aceptaTerminos: false });
  const [errores, setErrores] = useState<AuthError[]>([]);
  const [cargando, setCargando] = useState(false);
  const actualizarCampo = (campo: keyof RegistroForm, valor: string | boolean) => {
    setForm((p) => ({ ...p, [campo]: valor }));
    setErrores((p) => p.filter((e) => e.campo !== campo));
  };
  const registrar = async (onExito: () => void, onError: (msg?: string) => void) => {
    const e: AuthError[] = [];
    if (!validarCorreo(form.correo)) e.push({ campo: 'correo', mensaje: i18n.t('auth.errores.correoInvalido') });
    if (!validarContrasenaSegura(form.contrasena)) e.push({ campo: 'contrasena', mensaje: i18n.t('auth.errores.passwordDebil') });
    if (form.contrasena !== form.confirmarContrasena) e.push({ campo: 'confirmarContrasena', mensaje: i18n.t('auth.errores.noCoinciden') });
    if (!form.aceptaTerminos) e.push({ campo: 'aceptaTerminos', mensaje: i18n.t('auth.errores.aceptarTerminos') });
    if (e.length) {
      setErrores(e);
      onError(e[0]?.mensaje);
      return;
    }
    setCargando(true);
    try {
      await authService.registro(form);
      authService.setCredencialesPendientes(form.correo, form.contrasena);
      onExito();
    } catch (error: any) {
      const msg = errorMessage(error, error?.message || i18n.t('auth.errores.registroFallido'));
      setErrores([{ mensaje: msg }]);
      onError(msg);
    } finally {
      setCargando(false);
    }
  };
  const getError = (campo: string) => errores.find((e) => e.campo === campo)?.mensaje;
  const errorGlobal = errores.find((e) => !e.campo)?.mensaje;
  return { form, errores, errorGlobal, cargando, actualizarCampo, registrar, getError };
}
export function useOlvideContrasena() {
  const [form, setForm] = useState<OlvideContrasenaForm>({ correo: '', codigo: '', nuevaContrasena: '', confirmarContrasena: '' }); const [errores, setErrores] = useState<AuthError[]>([]); const [cargando, setCargando] = useState(false); const [fase, setFase] = useState<1 | 2 | 3 | 4>(1);
  const actualizarCampo = (campo: keyof OlvideContrasenaForm, valor: string) => { setForm((p) => ({ ...p, [campo]: valor })); setErrores((p) => p.filter((e) => e.campo !== campo)) };
  const enviarEnlace = async () => { if (!validarCorreo(form.correo)) { setErrores([{ campo: 'correo', mensaje: i18n.t('auth.errores.correoInvalido') }]); return }; setCargando(true); try { await authService.recuperarContrasena(form.correo); setFase(2) } catch (error: any) { if (error?.response?.status === 404) { Alert.alert(i18n.t('auth.errores.cuentaNoEncontrada'), errorMessage(error, i18n.t('auth.errores.cuentaNoExiste'))); return }; setErrores([{ campo: 'correo', mensaje: errorMessage(error, i18n.t('auth.errores.envioCodigoFallido')) }]) } finally { setCargando(false) } };
  const validarCodigo = async () => { if (!/^\d{6}$/.test(form.codigo || '')) { setErrores([{ campo: 'codigo', mensaje: i18n.t('auth.errores.codigo6') }]); return }; setCargando(true); try { await authService.validarCodigoRecuperacion(form.correo, form.codigo!); setFase(3) } catch (error) { setErrores([{ campo: 'codigo', mensaje: errorMessage(error, i18n.t('auth.errores.codigoInvalido')) }]) } finally { setCargando(false) } };
  const cambiarContrasena = async (onSuccess?: () => void) => { if (!validarContrasenaSegura(form.nuevaContrasena || '') || form.nuevaContrasena !== form.confirmarContrasena) { setErrores([{ campo: 'nuevaContrasena', mensaje: i18n.t('auth.errores.verificaNueva') }]); return }; setCargando(true); try { await authService.restablecerContrasena(form.correo, form.codigo!, form.nuevaContrasena!); onSuccess?.() || setFase(4) } catch (error) { setErrores([{ campo: 'nuevaContrasena', mensaje: errorMessage(error, i18n.t('auth.errores.restablecerFallido')) }]) } finally { setCargando(false) } };
  return { form, errores, setErrores, cargando, fase, setFase, actualizarCampo, enviarEnlace, validarCodigo, cambiarContrasena };
}
export function useVerificarCorreo(correo: string, inicialEnviado = false) {
  const [cargando, setCargando] = useState(false); const [codigoEnviado, setCodigoEnviado] = useState(inicialEnviado); const [verificando, setVerificando] = useState(false); const [codigoIncorrecto, setCodigoIncorrecto] = useState(false);
  const enviarCodigo = async () => { setCargando(true); try { await authService.reenviarVerificacion(correo); setCodigoEnviado(true) } finally { setCargando(false) } };
  const verificarCodigo = async (codigo: string) => {
    setVerificando(true);
    try {
      const data = await authService.verificarCorreo(correo, codigo);
      
      // Si el backend retorna los tokens directamente (auto-login tras verificar)
      if (data?.accessToken && data?.userProfile) {
        const p = data.userProfile;
        useAuthStore.getState().setUsuario({
          id: p.id,
          correo: p.email,
          nombres: p.firstName,
          apellidos: p.lastName,
          rol: 'cliente',
          activo: p.accountStatus === 'ACTIVE',
          permisosValidos: p.accountStatus === 'ACTIVE',
          sucursalId: (p as any).sucursalId,
          sucursalNombre: (p as any).sucursalNombre
        }, data.accessToken);
      }
      setCodigoIncorrecto(false);

      // El backend solo confirma la verificación; si tenemos las credenciales
      // del registro/login en memoria, se inicia sesión real automáticamente.
      const cred = authService.consumirCredencialesPendientes(correo);
      if (cred) {
        try {
          const session = await authService.login(cred.correo, cred.contrasena);
          const { useAuthStore } = require('@/store/authStore');
          useAuthStore.getState().setUsuario(mapearUsuarioSesion(session.userProfile), session.accessToken);
          return 'logueado' as const;
        } catch {
          return 'verificado' as const;
        }
      }
      return 'verificado' as const;
    } catch {
      setCodigoIncorrecto(true);
      return false;
    } finally {
      setVerificando(false);
    }
  };
  return { correo, cargando, codigoEnviado, verificando, codigoIncorrecto, setCodigoIncorrecto, enviarCodigo, verificarCodigo };
}