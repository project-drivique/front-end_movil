import { useRef, useState } from 'react';
import { LoginForm, RegistroForm, OlvideContrasenaForm, AuthError } from '../types/auth.types';
import { buscarUsuarioDemo, UsuarioDemo } from '../../../mocks/demoUsers';
import { esCorreoValido as validarCorreo, esContrasenaSegura as validarContrasenaSegura } from '@/utils/validators';

// ── useLogin (RF43) ──────────────────────────────────────────────────────────

export function useLogin() {
  const [form, setForm] = useState<LoginForm>({ correo: '', contrasena: '' });
  const [errores, setErrores] = useState<AuthError[]>([]);
  const [cargando, setCargando] = useState(false);
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);

  function actualizarCampo(campo: keyof LoginForm, valor: string) {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setErrores(prev => prev.filter(e => e.campo !== campo));
  }

  function validar(): boolean {
    const e: AuthError[] = [];
    if (!form.correo.trim())
      e.push({ campo: 'correo', mensaje: 'El correo es obligatorio' });
    else if (!validarCorreo(form.correo))
      e.push({ campo: 'correo', mensaje: 'Formato de correo inválido' });
    if (!form.contrasena.trim())
      e.push({ campo: 'contrasena', mensaje: 'La contraseña es obligatoria' });
    setErrores(e);
    return e.length === 0;
  }

  async function iniciarSesion(onExito: (usuario: UsuarioDemo) => void) {
    if (bloqueado) {
      setErrores([{ mensaje: 'Cuenta bloqueada tras 3 intentos fallidos. Intenta más tarde.' }]);
      return;
    }
    if (!validar()) return;

    setCargando(true);
    try {
      await new Promise(r => setTimeout(r, 1000));

      // Mock: valida contra los usuarios de prueba — en producción se reemplaza por llamada real
      const usuario = buscarUsuarioDemo(form.correo, form.contrasena);

      if (usuario) {
        setIntentosFallidos(0);
        onExito(usuario);
      } else {
        const intentos = intentosFallidos + 1;
        setIntentosFallidos(intentos);
        if (intentos >= 3) {
          setBloqueado(true);
          setErrores([{ mensaje: 'Cuenta bloqueada tras 3 intentos fallidos.' }]);
        } else {
          setErrores([{ mensaje: `Correo o contraseña incorrectos. Intento ${intentos}/3` }]);
        }
      }
    } finally {
      setCargando(false);
    }
  }

  return { form, errores, cargando, bloqueado, actualizarCampo, iniciarSesion };
}

// ── useRegistro (RF42) ───────────────────────────────────────────────────────

export function useRegistro() {
  const [form, setForm] = useState<RegistroForm>({
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    aceptaTerminos: false,
  });
  const [errores, setErrores] = useState<AuthError[]>([]);
  const [cargando, setCargando] = useState(false);

  function actualizarCampo(campo: keyof RegistroForm, valor: string | boolean) {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setErrores(prev => prev.filter(e => e.campo !== campo));
  }

  function validar(): boolean {
    const e: AuthError[] = [];

    if (!form.correo.trim())
      e.push({ campo: 'correo', mensaje: 'El correo es obligatorio' });
    else if (!validarCorreo(form.correo))
      e.push({ campo: 'correo', mensaje: 'Formato de correo inválido' });

    if (!form.contrasena)
      e.push({ campo: 'contrasena', mensaje: 'La contraseña es obligatoria' });
    else if (!validarContrasenaSegura(form.contrasena))
      e.push({ campo: 'contrasena', mensaje: 'Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (@$!%*?&)' });

    if (!form.confirmarContrasena)
      e.push({ campo: 'confirmarContrasena', mensaje: 'Debes confirmar tu contraseña' });
    else if (form.contrasena !== form.confirmarContrasena)
      e.push({ campo: 'confirmarContrasena', mensaje: 'Las contraseñas no coinciden' });

    if (!form.aceptaTerminos)
      e.push({ campo: 'aceptaTerminos', mensaje: 'Debes aceptar los términos y condiciones' });

    setErrores(e);
    return e.length === 0;
  }

  async function registrar(onExito: () => void, onError: () => void) {
    if (!validar()) {
      onError();
      return;
    }
    setCargando(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      onExito();
    } catch {
      onError();
    } finally {
      setCargando(false);
    }
  }

  function getError(campo: string): string | undefined {
    return errores.find(e => e.campo === campo)?.mensaje;
  }

  return { form, errores, cargando, actualizarCampo, registrar, getError };
}

// ── useOlvideContrasena (RF43) ────────────────────────────────────────────────

export function useOlvideContrasena() {
  const [form, setForm] = useState<OlvideContrasenaForm>({ correo: '' });
  const [errores, setErrores] = useState<AuthError[]>([]);
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  function actualizarCorreo(valor: string) {
    setForm({ correo: valor });
    setErrores([]);
  }

  function validar(): boolean {
    const e: AuthError[] = [];
    if (!form.correo.trim())
      e.push({ campo: 'correo', mensaje: 'El correo es obligatorio' });
    else if (!validarCorreo(form.correo))
      e.push({ campo: 'correo', mensaje: 'Formato de correo inválido' });
    setErrores(e);
    return e.length === 0;
  }

  async function enviarEnlace() {
    if (!validar()) return;
    setCargando(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      setEnviado(true);
    } finally {
      setCargando(false);
    }
  }

  return { form, errores, cargando, enviado, actualizarCorreo, enviarEnlace };
}

// ── useVerificarCorreo (HU: verificación de correo tras registro) ────────────
// Genera un código de 6 dígitos "del lado del servidor" (simulado, guardado
// en memoria — en producción esto lo enviaría un servicio de correo real) y
// lo valida contra lo que el usuario escribe en las 6 casillas.

export function useVerificarCorreo(correo: string) {
  const [cargando, setCargando] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [codigoIncorrecto, setCodigoIncorrecto] = useState(false);
  const codigoActualRef = useRef<string | null>(null);

  function generarCodigo(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  async function enviarCodigo(): Promise<string> {
    setCargando(true);
    setCodigoIncorrecto(false);
    try {
      await new Promise((r) => setTimeout(r, 800));
      // Mock: no hay backend de correo real — el "envío" es generar el
      // código acá mismo y guardarlo en memoria para compararlo después.
      const codigo = generarCodigo();
      codigoActualRef.current = codigo;
      setCodigoEnviado(true);
      return codigo;
    } finally {
      setCargando(false);
    }
  }

  async function verificarCodigo(codigoIngresado: string): Promise<boolean> {
    setVerificando(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const esValido =
        !!codigoActualRef.current && codigoIngresado === codigoActualRef.current;
      setCodigoIncorrecto(!esValido);
      return esValido;
    } finally {
      setVerificando(false);
    }
  }

  return {
    correo,
    cargando,
    codigoEnviado,
    verificando,
    codigoIncorrecto,
    setCodigoIncorrecto,
    enviarCodigo,
    verificarCodigo,
  };
}