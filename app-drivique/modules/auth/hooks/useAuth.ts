import { useState } from 'react';
import { router } from 'expo-router';
import { LoginForm, RegistroForm, OlvideContrasenaForm, AuthError } from '../types/auth.types';
import { esCorreoValido as validarCorreo, esContrasenaSegura as validarContrasenaSegura } from '@/utils/validators';
import { authService } from '../services/authService';
import { useAuthStore } from '@/store/authStore';

const errorMessage = (error: any, fallback: string) => error?.response?.data?.mensaje || error?.response?.data?.message || fallback;
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
      const p = session.userProfile;
      onExito({ id: p.id, correo: p.email, nombres: p.firstName, apellidos: p.lastName, rol: 'cliente', activo: p.accountStatus === 'ACTIVE', permisosValidos: p.accountStatus === 'ACTIVE', sucursalId: (p as any).sucursalId, sucursalNombre: (p as any).sucursalNombre }, session.accessToken);
    } catch (error: any) {
      const code = error?.response?.data?.code || error?.response?.data?.errorCode;
      const msg = errorMessage(error, '');
      const isNotVerified = code === 'USER_NOT_VERIFIED' || code === 'PENDING_VERIFICATION' || msg.includes('not verified') || msg.includes('PENDING_VERIFICATION');
      
      if (isNotVerified) {
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
  const [form, setForm] = useState<RegistroForm>({ correo: '', contrasena: '', confirmarContrasena: '', aceptaTerminos: false }); const [errores, setErrores] = useState<AuthError[]>([]); const [cargando, setCargando] = useState(false);
  const actualizarCampo = (campo: keyof RegistroForm, valor: string | boolean) => { setForm((p) => ({ ...p, [campo]: valor })); setErrores((p) => p.filter((e) => e.campo !== campo)) };
  const registrar = async (onExito: () => void, onError: () => void) => { const e: AuthError[] = []; if (!validarCorreo(form.correo)) e.push({ campo: 'correo', mensaje: 'Ingresa un correo válido' }); if (!validarContrasenaSegura(form.contrasena)) e.push({ campo: 'contrasena', mensaje: 'La contraseña no cumple la política.' }); if (form.contrasena !== form.confirmarContrasena) e.push({ campo: 'confirmarContrasena', mensaje: 'Las contraseñas no coinciden' }); if (!form.aceptaTerminos) e.push({ campo: 'aceptaTerminos', mensaje: 'Debes aceptar los términos y condiciones' }); if (e.length) { setErrores(e); onError(); return }; setCargando(true); try { await authService.registro(form); onExito() } catch (error) { setErrores([{ mensaje: errorMessage(error, 'No fue posible crear la cuenta.') }]); onError() } finally { setCargando(false) } };
  const getError = (campo: string) => errores.find((e) => e.campo === campo)?.mensaje; return { form, errores, cargando, actualizarCampo, registrar, getError };
}
export function useOlvideContrasena() {
  const [form, setForm] = useState<OlvideContrasenaForm>({ correo: '', codigo: '', nuevaContrasena: '', confirmarContrasena: '' }); const [errores, setErrores] = useState<AuthError[]>([]); const [cargando, setCargando] = useState(false); const [fase, setFase] = useState<1 | 2 | 3 | 4>(1);
  const actualizarCampo = (campo: keyof OlvideContrasenaForm, valor: string) => { setForm((p) => ({ ...p, [campo]: valor })); setErrores((p) => p.filter((e) => e.campo !== campo)) };
  const enviarEnlace = async () => { if (!validarCorreo(form.correo)) { setErrores([{ campo: 'correo', mensaje: 'Ingresa un correo válido' }]); return }; setCargando(true); try { await authService.recuperarContrasena(form.correo); setFase(2) } catch (error) { setErrores([{ campo: 'correo', mensaje: errorMessage(error, 'No fue posible enviar el código.') }]) } finally { setCargando(false) } };
  const validarCodigo = async () => { if (!/^\d{6}$/.test(form.codigo || '')) { setErrores([{ campo: 'codigo', mensaje: 'El código debe tener 6 dígitos.' }]); return }; setCargando(true); try { await authService.validarCodigoRecuperacion(form.correo, form.codigo!); setFase(3) } catch (error) { setErrores([{ campo: 'codigo', mensaje: errorMessage(error, 'Código inválido o expirado.') }]) } finally { setCargando(false) } };
  const cambiarContrasena = async (onSuccess?: () => void) => { if (!validarContrasenaSegura(form.nuevaContrasena || '') || form.nuevaContrasena !== form.confirmarContrasena) { setErrores([{ campo: 'nuevaContrasena', mensaje: 'Verifica la nueva contraseña.' }]); return }; setCargando(true); try { await authService.restablecerContrasena(form.correo, form.codigo!, form.nuevaContrasena!); onSuccess?.() || setFase(4) } catch (error) { setErrores([{ campo: 'nuevaContrasena', mensaje: errorMessage(error, 'No fue posible restablecer la contraseña.') }]) } finally { setCargando(false) } };
  return { form, errores, setErrores, cargando, fase, setFase, actualizarCampo, enviarEnlace, validarCodigo, cambiarContrasena };
}
export function useVerificarCorreo(correo: string) {
  const [cargando, setCargando] = useState(false); const [codigoEnviado, setCodigoEnviado] = useState(false); const [verificando, setVerificando] = useState(false); const [codigoIncorrecto, setCodigoIncorrecto] = useState(false);
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
      return true;
    } catch {
      setCodigoIncorrecto(true);
      return false;
    } finally {
      setVerificando(false);
    }
  };
  return { correo, cargando, codigoEnviado, verificando, codigoIncorrecto, setCodigoIncorrecto, enviarCodigo, verificarCodigo };
}