import { useState } from 'react';
import { router } from 'expo-router';
import { LoginForm, RegistroForm, OlvideContrasenaForm, AuthError } from '../types/auth.types';
import { esCorreoValido as validarCorreo, esContrasenaSegura as validarContrasenaSegura } from '@/utils/validators';
import { authService } from '../services/authService';
import { useAuthStore } from '@/store/authStore';

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
    if (!validarCorreo(form.correo)) e.push({ campo: 'correo', mensaje: 'Ingresa un correo válido' });
    if (!form.contrasena) e.push({ campo: 'contrasena', mensaje: 'La contraseña es obligatoria' });
    if (e.length) { setErrores(e); return };
    setCargando(true);
    try {
      const session = await authService.login(form.correo, form.contrasena);
      onExito(mapearUsuarioSesion(session.userProfile), session.accessToken);
    } catch (error: any) {
      const status = error?.response?.status;
      const code = error?.response?.data?.code || error?.response?.data?.errorCode;
      const msg = errorMessage(error, '');
      const isNotVerified =
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
        setErrores([{ mensaje: errorMessage(error, 'No fue posible iniciar sesión.') }]);
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
    if (!validarCorreo(form.correo)) e.push({ campo: 'correo', mensaje: 'Ingresa un correo válido' });
    if (!validarContrasenaSegura(form.contrasena)) e.push({ campo: 'contrasena', mensaje: 'La contraseña debe tener al menos 12 caracteres, mayúscula, minúscula, número y símbolo.' });
    if (form.contrasena !== form.confirmarContrasena) e.push({ campo: 'confirmarContrasena', mensaje: 'Las contraseñas no coinciden' });
    if (!form.aceptaTerminos) e.push({ campo: 'aceptaTerminos', mensaje: 'Debes aceptar los términos y condiciones' });
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
      const msg = errorMessage(error, error?.message || 'No fue posible crear la cuenta.');
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
  const enviarEnlace = async () => { if (!validarCorreo(form.correo)) { setErrores([{ campo: 'correo', mensaje: 'Ingresa un correo válido' }]); return }; setCargando(true); try { await authService.recuperarContrasena(form.correo); setFase(2) } catch (error) { setErrores([{ campo: 'correo', mensaje: errorMessage(error, 'No fue posible enviar el código.') }]) } finally { setCargando(false) } };
  const validarCodigo = async () => { if (!/^\d{6}$/.test(form.codigo || '')) { setErrores([{ campo: 'codigo', mensaje: 'El código debe tener 6 dígitos.' }]); return }; setCargando(true); try { await authService.validarCodigoRecuperacion(form.correo, form.codigo!); setFase(3) } catch (error) { setErrores([{ campo: 'codigo', mensaje: errorMessage(error, 'Código inválido o expirado.') }]) } finally { setCargando(false) } };
  const cambiarContrasena = async (onSuccess?: () => void) => { if (!validarContrasenaSegura(form.nuevaContrasena || '') || form.nuevaContrasena !== form.confirmarContrasena) { setErrores([{ campo: 'nuevaContrasena', mensaje: 'Verifica la nueva contraseña.' }]); return }; setCargando(true); try { await authService.restablecerContrasena(form.correo, form.codigo!, form.nuevaContrasena!); onSuccess?.() || setFase(4) } catch (error) { setErrores([{ campo: 'nuevaContrasena', mensaje: errorMessage(error, 'No fue posible restablecer la contraseña.') }]) } finally { setCargando(false) } };
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