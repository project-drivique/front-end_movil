/**
 * RF50 — Editar información del usuario
 * Hook principal del módulo de perfil
 * RF50.1: Modificar nombre de usuario
 * RF50.2: Modificar correo electrónico
 * RF50.3: Agregar o modificar teléfono
 * RF50.4: Validar contraseña actual
 * RF50.5: Guardar cambios validados
 * RF50.6: Cancelar edición perfil
 */

import { useUsuarioStore } from "@/store/userStore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { calcularEdad, esCorreoValido, esTelefonoValido } from "@/utils/validators";
import {
  ErroresCambiarCorreo,
  ErroresCompletarPerfil,
  ErroresPerfil,
  FormCambiarCorreo,
  FormCompletarPerfil,
  FormEditarPerfil,
} from "../types/profile.types";

export function usePerfil() {
  const { t } = useTranslation();
  const usuario = useUsuarioStore((s) => s.usuario);
  const actualizarUsuarioGlobal = useUsuarioStore((s) => s.actualizarUsuario);

  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mostrarModalCorreo, setMostrarModalCorreo] = useState(false);

  // Formulario editar perfil
  const [form, setForm] = useState<FormEditarPerfil>({
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    telefono: usuario.telefono,
    fechaNacimiento: usuario.fechaNacimiento,
    nacionalidad: usuario.nacionalidad,
  });

  // Si el usuario global cambia (p. ej. porque lo llenó desde el
  // formulario de reserva) y no estamos editando, refrescamos el form
  // para que al abrir "Editar" se vea lo último.
  useEffect(() => {
    if (!editando) {
      setForm({
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        telefono: usuario.telefono,
        fechaNacimiento: usuario.fechaNacimiento,
        nacionalidad: usuario.nacionalidad,
      });
    }
  }, [usuario, editando]);

  // Formulario cambiar correo
  const [formCorreo, setFormCorreo] = useState<FormCambiarCorreo>({
    nuevoCorreo: "",
    confirmarCorreo: "",
    contrasenaActual: "",
  });

  const [errores, setErrores] = useState<ErroresPerfil>({});
  const [erroresCorreo, setErroresCorreo] = useState<ErroresCambiarCorreo>({});

  // ── Actualizar campo del formulario ────────────────────────────────────────
  const actualizarCampo = (campo: keyof FormEditarPerfil, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const actualizarCampoCorreo = (
    campo: keyof FormCambiarCorreo,
    valor: string,
  ) => {
    setFormCorreo((prev) => ({ ...prev, [campo]: valor }));
    setErroresCorreo((prev) => ({ ...prev, [campo]: undefined }));
  };

  // ── Validaciones ───────────────────────────────────────────────────────────
  const validarPerfil = (): boolean => {
    const nuevosErrores: ErroresPerfil = {};

    if (!form.nombres.trim()) {
      nuevosErrores.nombres = t("perfil.validacion.nombresObligatorio");
    } else if (form.nombres.trim().length < 2) {
      nuevosErrores.nombres = t("perfil.validacion.nombresMinimo");
    }

    if (!form.apellidos.trim()) {
      nuevosErrores.apellidos = t("perfil.validacion.apellidosObligatorio");
    } else if (form.apellidos.trim().length < 2) {
      nuevosErrores.apellidos = t("perfil.validacion.apellidosMinimo");
    }

    if (!form.telefono.trim()) {
      nuevosErrores.telefono = t("perfil.validacion.telefonoObligatorio");
    } else if (!esTelefonoValido(form.telefono)) {
      nuevosErrores.telefono = t("perfil.validacion.telefonoInvalido");
    }

    if (!form.fechaNacimiento) {
      nuevosErrores.fechaNacimiento = t("perfil.validacion.fechaNacObligatoria");
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fechaNacimiento)) {
      nuevosErrores.fechaNacimiento = t("perfil.validacion.fechaFormato");
    } else {
      const edad = calcularEdad(form.fechaNacimiento);
      if (edad === null) {
        nuevosErrores.fechaNacimiento = t("perfil.validacion.fechaFormato");
      } else if (new Date() < new Date(form.fechaNacimiento)) {
        nuevosErrores.fechaNacimiento = t("perfil.validacion.fechaFutura", { defaultValue: "La fecha no puede ser futura" });
      } else if (edad < 16) {
        nuevosErrores.fechaNacimiento = t("perfil.validacion.menorEdad", { defaultValue: "Debes tener al menos 16 años" });
      }
    }

    if (!form.nacionalidad) {
      nuevosErrores.nacionalidad = t("perfil.validacion.nacionalidadSeleccionar");
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const validarCambioCorreo = (): boolean => {
    const nuevosErrores: ErroresCambiarCorreo = {};

    if (!formCorreo.nuevoCorreo.trim()) {
      nuevosErrores.nuevoCorreo = t("perfil.validacion.correoObligatorio");
    } else if (!esCorreoValido(formCorreo.nuevoCorreo)) {
      nuevosErrores.nuevoCorreo = t("perfil.validacion.correoInvalido");
    } else if (formCorreo.nuevoCorreo === usuario.correo) {
      nuevosErrores.nuevoCorreo = t("perfil.validacion.correoDebeSerDiferente");
    }

    if (!formCorreo.confirmarCorreo.trim()) {
      nuevosErrores.confirmarCorreo = t("perfil.validacion.confirmeCorreo");
    } else if (formCorreo.nuevoCorreo !== formCorreo.confirmarCorreo) {
      nuevosErrores.confirmarCorreo = t("perfil.validacion.correosNoCoinciden");
    }

    if (!formCorreo.contrasenaActual.trim()) {
      nuevosErrores.contrasenaActual = t("perfil.validacion.contrasenaActualObligatoria");
    }

    setErroresCorreo(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // ── Guardar cambios perfil ─────────────────────────────────────────────────
  const guardarCambios = (onExito: () => void, onError: () => void) => {
    if (!validarPerfil()) {
      onError();
      return;
    }

    setCargando(true);
    // Simula llamada API — se reemplaza por servicio real
    setTimeout(() => {
      actualizarUsuarioGlobal({
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        telefono: form.telefono.trim(),
        fechaNacimiento: form.fechaNacimiento,
        nacionalidad: form.nacionalidad,
      });
      setEditando(false);
      setCargando(false);
      onExito();
    }, 1000);
  };

  // ── Cancelar edición ───────────────────────────────────────────────────────
  const cancelarEdicion = () => {
    setForm({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      fechaNacimiento: usuario.fechaNacimiento,
      nacionalidad: usuario.nacionalidad,
    });
    setErrores({});
    setEditando(false);
  };

  // ── Guardar cambio de correo ───────────────────────────────────────────────
  const guardarCambioCorreo = (
    onExito: () => void,
    _onError: (msg: string) => void,
  ) => {
    if (!validarCambioCorreo()) return;

    setCargando(true);
    // Simula llamada API — se reemplaza por servicio real
    setTimeout(() => {
      // Mock: simula verificación de contraseña — en producción se valida contra la API
      actualizarUsuarioGlobal({ correo: formCorreo.nuevoCorreo });
      setFormCorreo({
        nuevoCorreo: "",
        confirmarCorreo: "",
        contrasenaActual: "",
      });
      setMostrarModalCorreo(false);
      setCargando(false);
      onExito();
    }, 1000);
  };

  const cerrarModalCorreo = () => {
    setFormCorreo({
      nuevoCorreo: "",
      confirmarCorreo: "",
      contrasenaActual: "",
    });
    setErroresCorreo({});
    setMostrarModalCorreo(false);
  };

  const marcarPerfilCompleto = () => {
    actualizarUsuarioGlobal({ perfilCompleto: true });
  };

  return {
    usuario,
    editando,
    setEditando,
    cargando,
    form,
    formCorreo,
    errores,
    erroresCorreo,
    actualizarCampo,
    actualizarCampoCorreo,
    guardarCambios,
    cancelarEdicion,
    mostrarModalCorreo,
    setMostrarModalCorreo,
    guardarCambioCorreo,
    cerrarModalCorreo,
    marcarPerfilCompleto,
  };
}

export function useCompletarPerfil() {
  const { t } = useTranslation();
  const usuario = useUsuarioStore((s) => s.usuario);
  const actualizarUsuarioGlobal = useUsuarioStore((s) => s.actualizarUsuario);

  const [form, setForm] = useState<FormCompletarPerfil>({
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    telefono: usuario.telefono,
    fechaNacimiento: usuario.fechaNacimiento,
    tipoDocumento: usuario.tipoDocumento,
    numeroDocumento: usuario.numeroDocumento,
    nacionalidad: usuario.nacionalidad,
  });
  const [errores, setErrores] = useState<ErroresCompletarPerfil>({});
  const [cargando, setCargando] = useState(false);

  const actualizarCampo = (campo: keyof FormCompletarPerfil, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const validar = (): boolean => {
    const e: ErroresCompletarPerfil = {};

    if (!form.nombres.trim()) e.nombres = t("perfil.validacion.nombresObligatorio");
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(form.nombres))
      e.nombres = t("perfil.validacion.nombresSoloLetras");

    if (!form.apellidos.trim()) e.apellidos = t("perfil.validacion.apellidosObligatorio");
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(form.apellidos))
      e.apellidos = t("perfil.validacion.apellidosSoloLetras");

    if (!form.telefono.trim()) e.telefono = t("perfil.validacion.telefonoObligatorio");
    else if (!esTelefonoValido(form.telefono))
      e.telefono = t("perfil.validacion.telefonoInvalido");

    if (!form.fechaNacimiento) {
      e.fechaNacimiento = t("perfil.validacion.fechaNacObligatoria");
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fechaNacimiento)) {
      e.fechaNacimiento = t("perfil.validacion.fechaFormato");
    } else {
      const edad = calcularEdad(form.fechaNacimiento);
      if (edad === null) {
        e.fechaNacimiento = t("perfil.validacion.fechaFormato");
      } else if (new Date() < new Date(form.fechaNacimiento)) {
        e.fechaNacimiento = t("perfil.validacion.fechaFutura", { defaultValue: "La fecha no puede ser futura" });
      } else if (edad < 16) {
        e.fechaNacimiento = t("perfil.validacion.menorEdad", { defaultValue: "Debes tener al menos 16 años" });
      }
    }

    if (!form.tipoDocumento)
      e.tipoDocumento = t("perfil.validacion.tipoDocumentoSeleccionar");

    if (!form.numeroDocumento.trim())
      e.numeroDocumento = t("perfil.validacion.numeroDocumentoObligatorio");
    else if (!/^\d{6,10}$/.test(form.numeroDocumento))
      e.numeroDocumento = t("perfil.validacion.numeroDocumentoFormato");

    if (!form.nacionalidad) e.nacionalidad = t("perfil.validacion.nacionalidadSeleccionar");

    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const guardar = (onExito: () => void, onError: () => void) => {
    if (!validar()) {
      onError();
      return;
    }
    setCargando(true);
    setTimeout(() => {
      actualizarUsuarioGlobal({
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        telefono: form.telefono.trim(),
        fechaNacimiento: form.fechaNacimiento,
        tipoDocumento: form.tipoDocumento,
        numeroDocumento: form.numeroDocumento.trim(),
        nacionalidad: form.nacionalidad,
        perfilCompleto: true,
      });
      setCargando(false);
      onExito();
    }, 1000);
  };

  return { form, errores, cargando, actualizarCampo, guardar };
}
