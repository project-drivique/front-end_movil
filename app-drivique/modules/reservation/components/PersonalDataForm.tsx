// modules/reserva/components/FormDatosPersonales.tsx
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { useReferenceStore } from "@/store/referenceStore";
import { useReservaStore } from "@/store/reservationStore";
import { useUsuarioStore } from "@/store/userStore";
import { obtenerPerfil, actualizarPerfil } from "@/modules/profile/services/profileService";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet, Text, TextInput, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { AlertModal } from "../../../components/ui/AlertModal";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import {
  COLOR_MARCA,
  getPrefijoPorNacionalidad,
  getSiglaDocumento,
  getNacionalidades,
  esNacionalidadColombiana,
  getTiposDocumento,
} from "../constants/reservation.constants";
import { getHorarioSucursal } from "@/modules/catalog/constants/catalog.constants";
import { TipoDocumento } from "../types/reservation.types";
import { aCentavos, construirUrlCheckout } from "../services/wompiService";
import {
  ReservaGuardada,
  mensajeDeError,
  reservaPersistService,
} from "../services/reservationPersistService";
import { documentosService } from "../services/documentsService";
import BarraTotalConfirmar from "./TotalConfirmBar";
import CampoSelectorLista from "./ListSelectorField";
import ModalReservaRegistrada from "./BookingRegisteredModal";
import { BranchCashPaymentModal } from "./BranchCashPaymentModal";
import { diasEntre } from "./BookingSummaryModal.pieces";
import TarjetaTerminosCondiciones from "./TermsConditionsCard";
import TarjetaVerificacionDocumental from "./DocumentVerificationCard";
import CouponSection from "./CouponSection";
import SecurityCaptcha from "./SecurityCaptcha";
import { useServerQuote } from "../hooks/useServerQuote";
import { COLOR_ACENTO, COLOR_ENLACE_OSCURO, COLOR_MARCA_OSCURO } from "@/constants/brandPalette";
import { Alert } from "@/utils/alerta";

function combinarNombreCompleto(nombres: string, apellidos: string): string {
  return [nombres, apellidos].filter(Boolean).join(" ").trim();
}

function separarNombreCompleto(nombreCompleto: string): {
  nombres: string;
  apellidos: string;
} {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return { nombres: "", apellidos: "" };
  if (partes.length === 1) return { nombres: partes[0], apellidos: "" };
  const mitad = Math.ceil(partes.length / 2);
  return {
    nombres: partes.slice(0, mitad).join(" "),
    apellidos: partes.slice(mitad).join(" "),
  };
}

interface Props {
  vehiculo: Vehiculo;
}

export default function FormDatosPersonales({ vehiculo }: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const OPCIONES_TIPO_DOCUMENTO = useMemo(() => getTiposDocumento(t), [t]);
  const datosPersonales = useReservaStore((s) => s.datosPersonales);
  const nacionalidadesApi = useReferenceStore((st) => st.nacionalidades);
  const cargarNacionalidades = useReferenceStore((st) => st.cargarNacionalidades);

  useEffect(() => {
    cargarNacionalidades().catch(() => {});
  }, [cargarNacionalidades]);

  const OPCIONES_NACIONALIDAD = useMemo(
    () => getNacionalidades().map((n) => ({ id: n.id, label: n.nombre })),
    [nacionalidadesApi],
  );

  const opcionesTipoDocumentoFiltradas = useMemo(() => {
    if (!datosPersonales.nacionalidad) return OPCIONES_TIPO_DOCUMENTO;
    if (esNacionalidadColombiana(datosPersonales.nacionalidad)) {
      return OPCIONES_TIPO_DOCUMENTO.filter(
        (o) => o.id === "CC" || o.id === "CE" || o.id === "Pasaporte"
      );
    }
    return OPCIONES_TIPO_DOCUMENTO.filter(
      (o) => o.id === "Pasaporte" || o.id === "CE"
    );
  }, [datosPersonales.nacionalidad, OPCIONES_TIPO_DOCUMENTO]);
  const actualizarDatosPersonales = useReservaStore(
    (s) => s.actualizarDatosPersonales,
  );
  const actualizarFechasLugar = useReservaStore((s) => s.actualizarFechasLugar);
  const fechasLugar = useReservaStore((s) => s.fechasLugar);
  const planes = useReservaStore((s) => s.planes);
  const documentos = useReservaStore((s) => s.documentos);
  const cuponAplicado = useReservaStore((s) => s.cuponAplicado);

  const usuarioGlobal = useUsuarioStore((s) => s.usuario);
  const actualizarUsuarioGlobal = useUsuarioStore((s) => s.actualizarUsuario);
  const limpiarReserva = useReservaStore((s) => s.limpiarReserva);

  const [modalReservaVisible, setModalReservaVisible] = useState(false);
  const [docsVerificados, setDocsVerificados] = useState(false);

  useEffect(() => {
    let activo = true;
    documentosService.tieneDocumentos().then((valor) => {
      if (activo) setDocsVerificados(valor);
    });
    return () => {
      activo = false;
    };
  }, [usuarioGlobal.id]);

  useEffect(() => {
    let activo = true;
    obtenerPerfil()
      .then((perfil) => {
        if (!activo || !perfil) return;
        actualizarUsuarioGlobal(perfil);
        const nombreCompleto = combinarNombreCompleto(perfil.nombres, perfil.apellidos);
        const tel = String(perfil.telefono || "").replace(/\D/g, "");
        const celular = tel.startsWith("57") && tel.length > 10 ? tel.slice(2) : tel;
        const tipoDocStr = String(perfil.tipoDocumento || "");
        const tipoDoc =
          tipoDocStr === "DRIVER_LICENSE" || tipoDocStr === "Licencia de Conducción" || tipoDocStr === "LIC"
            ? null
            : perfil.tipoDocumento;

        const precarga: Partial<typeof datosPersonales> = {};
        if (nombreCompleto) precarga.nombreCompleto = nombreCompleto;
        if (perfil.correo) precarga.correo = perfil.correo;
        if (celular) precarga.celular = celular;
        if (perfil.nacionalidad) precarga.nacionalidad = perfil.nacionalidad;
        if (tipoDoc) precarga.tipoDocumento = tipoDoc as any;
        if (perfil.numeroDocumento) precarga.numeroDocumento = perfil.numeroDocumento;

        if (Object.keys(precarga).length > 0) {
          actualizarDatosPersonales(precarga);
        }
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  const [alertaFaltantesVisible, setAlertaFaltantesVisible] = useState(false);
  const [alertaHorarioVisible, setAlertaHorarioVisible] = useState(false);
  const [alertaEfectivoVisible, setAlertaEfectivoVisible] = useState(false);
  const [alertaErrorPagoVisible, setAlertaErrorPagoVisible] = useState(false);
  const [alertaCancelarProcesoVisible, setAlertaCancelarProcesoVisible] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const isSubmittingRef = useRef(false);
  const [reservaCreada, setReservaCreada] = useState<ReservaGuardada | null>(null);
  const [errorServidor, setErrorServidor] = useState("");
  const [tipoErrorAlerta, setTipoErrorAlerta] = useState<"general" | "documento" | "reserva" | "vehiculo_ocupado">("general");
  const [modalInstruccionesEfectivoVisible, setModalInstruccionesEfectivoVisible] = useState(false);
  const [captchaVerificado, setCaptchaVerificado] = useState(false);
  const [errorCaptcha, setErrorCaptcha] = useState(false);

  const primaryAccent = c.oscuro ? COLOR_ACENTO : COLOR_MARCA;
  const brandBg = c.oscuro ? COLOR_MARCA_OSCURO : COLOR_MARCA;

  useEffect(() => {
    if (!usuarioGlobal) return;
    const precarga: Partial<typeof datosPersonales> = {};
    const nombreCompleto = combinarNombreCompleto(
      usuarioGlobal.nombres,
      usuarioGlobal.apellidos,
    );
    if (!datosPersonales.nombreCompleto && nombreCompleto) {
      precarga.nombreCompleto = nombreCompleto;
    }
    if (!datosPersonales.correo && usuarioGlobal.correo) {
      precarga.correo = usuarioGlobal.correo;
    }
    if (!datosPersonales.nacionalidad && usuarioGlobal.nacionalidad) {
      precarga.nacionalidad = usuarioGlobal.nacionalidad;
    }
    const tipoDocGlobalStr = String(usuarioGlobal.tipoDocumento || "");
    const tipoDoc =
      tipoDocGlobalStr === "DRIVER_LICENSE" || tipoDocGlobalStr === "Licencia de Conducción" || tipoDocGlobalStr === "LIC"
        ? null
        : usuarioGlobal.tipoDocumento;
    if (!datosPersonales.tipoDocumento && tipoDoc) {
      precarga.tipoDocumento = tipoDoc as any;
    }
    if (!datosPersonales.numeroDocumento && usuarioGlobal.numeroDocumento) {
      precarga.numeroDocumento = usuarioGlobal.numeroDocumento;
    }
    if (!datosPersonales.celular && usuarioGlobal.telefono) {
      const tel = String(usuarioGlobal.telefono).replace(/\D/g, "");
      precarga.celular = tel.startsWith("57") && tel.length > 10 ? tel.slice(2) : tel;
    }
    if (Object.keys(precarga).length > 0) {
      actualizarDatosPersonales(precarga);
    }
  }, [usuarioGlobal]);

  const prefijoTelefono = useMemo(() => {
    return getPrefijoPorNacionalidad(datosPersonales.nacionalidad || null);
  }, [datosPersonales.nacionalidad, nacionalidadesApi]);
  const hayPrefijo = !!datosPersonales.nacionalidad;

  const datosCompletos =
    !!datosPersonales.nombreCompleto.trim() &&
    !!datosPersonales.nacionalidad &&
    // Mismas reglas que la web: correo con formato válido y celular de al menos 10 dígitos
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosPersonales.correo.trim()) &&
    datosPersonales.celular.trim().length >= 10 &&
    !!datosPersonales.tipoDocumento &&
    !!datosPersonales.numeroDocumento.trim() &&
    (docsVerificados || !!documentos.cedulaFrente) &&
    (docsVerificados || !!documentos.licenciaConduccion) &&
    !!datosPersonales.terminosAceptados;

  const totalLocal = useMemo(() => {
    const seguros = vehiculo.seguros ?? [];
    const kmLimitado = vehiculo.tarifas?.kmLimitado;
    const kmIlimitado = vehiculo.tarifas?.kmIlimitado;
    const servicios = (vehiculo.servicios ?? []).filter(
      (s) => !s.nombre.toLowerCase().includes("otra ciudad")
    );

    const seguroElegido =
      seguros.find((s) => s.nombre === planes.proteccion) ?? null;
    const kmElegido =
      planes.tipoKilometraje === "limitado"
        ? kmLimitado
        : planes.tipoKilometraje === "ilimitado"
          ? kmIlimitado
          : null;

    const dias = diasEntre(
      fechasLugar.fechaRetiro,
      fechasLugar.fechaDevolucion,
      fechasLugar.horaRetiro,
      fechasLugar.horaDevolucion,
    );
    const diarias = vehiculo.precio * dias;
    const proteccion = seguroElegido ? seguroElegido.precio * dias : 0;
    const kilometraje = kmElegido ? kmElegido.precio * dias : 0;
    const servAdic = servicios
      .filter((s) => planes.serviciosSeleccionados.includes(s.nombre))
      .reduce((a, s) => a + s.precio * dias, 0);
    const subtotalBase = diarias + proteccion + kilometraje + servAdic;
    const subtotalBruto = subtotalBase;
      
    let descuentoCupon = 0;
    if (cuponAplicado) {
      if (cuponAplicado.descuentoPorcentaje) {
        descuentoCupon = Math.round(subtotalBruto * (cuponAplicado.descuentoPorcentaje / 100));
      } else if (cuponAplicado.descuentoFijo) {
        descuentoCupon = cuponAplicado.descuentoFijo;
      }
    }
    
    const subtotal = Math.max(subtotalBruto - descuentoCupon, 0);
    return subtotal;
  }, [
    vehiculo,
    fechasLugar.fechaRetiro,
    fechasLugar.fechaDevolucion,
    fechasLugar.lugarRetiro,
    fechasLugar.lugarDevolucion,
    planes,
    cuponAplicado,
  ]);

  // El total (cargo administrativo, IVA y descuento incluidos) lo calcula el servidor
  const cotizacion = useServerQuote({ vehiculo, fechasLugar, planes, cuponCodigo: cuponAplicado?.codigo });
  const total = cotizacion ? Number(cotizacion.estimatedTotal) : totalLocal;

  const branchName = fechasLugar.lugarRetiro || vehiculo.sucursal || "";
  const horario = useMemo(() => getHorarioSucursal(branchName), [branchName]);

  const checkOutsideSchedule = () => {
    if (fechasLugar.fueraDeHorarioAceptado) return false;
    let nowBogota = "12:00";
    try {
      nowBogota = new Intl.DateTimeFormat("en-GB", {
        timeZone: "America/Bogota",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());
    } catch {
      const now = new Date();
      nowBogota = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    }

    const openRaw = (horario.horaApertura || "08:00").slice(0, 5);
    const closeRaw = (horario.horaCierre || "18:00").slice(0, 5);

    const is24h =
      (openRaw === "00:00" && (closeRaw === "23:59" || closeRaw === "23:30" || closeRaw === "24:00")) ||
      openRaw === closeRaw;
    if (is24h) return false;

    if (openRaw < closeRaw) {
      return nowBogota < openRaw || nowBogota > closeRaw;
    } else {
      return nowBogota < openRaw && nowBogota > closeRaw;
    }
  };

  const ejecutarCreacionReserva = async (fueraDeHorario = false) => {
    if (isSubmittingRef.current) {
      console.warn("[PersonalDataForm] Petición de reserva ya en curso, ignorando duplicado.");
      return;
    }

    isSubmittingRef.current = true;
    setProcesandoPago(true);
    setErrorServidor("");

    try {
      if (documentos.cedulaFrente || documentos.licenciaConduccion) {
        const sucursales = useReferenceStore.getState().sucursales;
        const sedeVehiculo = sucursales.find(
          (b) =>
            b.id === vehiculo.sucursalId ||
            (vehiculo.sucursal && b.name.toLowerCase() === vehiculo.sucursal.toLowerCase())
        );
        const idSucursal =
          (vehiculo as any).sucursalId ||
          (vehiculo as any).branchId ||
          (vehiculo as any).currentBranchId ||
          sedeVehiculo?.id ||
          sucursales[0]?.id ||
          "";

        await documentosService.subir({
          tipoDocumento: datosPersonales.tipoDocumento,
          numeroDocumento: datosPersonales.numeroDocumento,
          sucursalId: idSucursal,
          identificacion: documentos.cedulaFrente,
          identificacionReverso: documentos.cedulaReverso,
          licencia: documentos.licenciaConduccion,
        });
      }

      // Persistir cambios de datos personales en el perfil de usuario (BD y store)
      try {
        const { nombres, apellidos } = separarNombreCompleto(datosPersonales.nombreCompleto);
        const perfilActualizado = await actualizarPerfil("", {
          nombres: nombres || usuarioGlobal.nombres,
          apellidos: apellidos || usuarioGlobal.apellidos,
          telefono: datosPersonales.celular,
          numeroDocumento: datosPersonales.numeroDocumento,
          tipoDocumento: datosPersonales.tipoDocumento ?? undefined,
          nacionalidad: datosPersonales.nacionalidad,
          direccion: usuarioGlobal.direccion || "",
          fechaNacimiento: usuarioGlobal.fechaNacimiento || "",
        });
        if (perfilActualizado) {
          actualizarUsuarioGlobal(perfilActualizado);
        }
      } catch (errPerfil: any) {
        if (errPerfil?.response?.status === 409) {
          console.warn("[PersonalDataForm] Conflicto 409 al actualizar perfil, continuando con reserva.");
        } else {
          console.warn("No se pudo actualizar el perfil en BD:", errPerfil);
        }
      }

      const fechasAUsar = fueraDeHorario
        ? { ...fechasLugar, fueraDeHorarioAceptado: true }
        : fechasLugar;

      const creada = await reservaPersistService.crear({
        vehiculo,
        fechasLugar: fechasAUsar,
        planes,
        cupon: cuponAplicado,
      });
      setReservaCreada(creada);

      if (creada.metodoPago === "efectivo") {
        setModalInstruccionesEfectivoVisible(true);
      } else if (creada.estado === "PENDIENTE_HORARIO" || fueraDeHorario || fechasLugar.fueraDeHorarioAceptado) {
        limpiarReserva();
        router.replace("/(tabs)/my-bookings");
      } else if (creada.estado === "PENDIENTE") {
        setModalReservaVisible(true);
      } else {
        limpiarReserva();
        router.replace(`/payment-response?ref=${encodeURIComponent(creada.id)}` as any);
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "";
      const errorMsgLower = String(errorMsg).toLowerCase();

      const esErrorDocDuplicado =
        error?.response?.status === 409 &&
        (errorMsgLower.includes("document") ||
          errorMsgLower.includes("cedula") ||
          errorMsgLower.includes("cédula") ||
          errorMsgLower.includes("duplicate") ||
          errorMsgLower.includes("unique") ||
          errorMsgLower.includes("registrado con otra") ||
          errorMsgLower.includes("uq_users_document_number"));

      const esErrorVehiculoOcupado =
        error?.response?.status === 409 &&
        (errorMsgLower.includes("debido a otra reserva") ||
          errorMsgLower.includes("no se encuentra disponible en las fechas") ||
          errorMsgLower.includes("overlapping") ||
          errorMsgLower.includes("overlap"));

      if (esErrorDocDuplicado) {
        setTipoErrorAlerta("documento");
        setErrorServidor(
          t("reserva.confirmacion.errorDocumentoDuplicado", {
            defaultValue: "El número de documento ingresado ya se encuentra registrado con otra cuenta de usuario. Por favor verifica tus datos o inicia sesión con tu cuenta registrada.",
          })
        );
      } else if (esErrorVehiculoOcupado) {
        setTipoErrorAlerta("vehiculo_ocupado");
        setErrorServidor(
          t("reserva.confirmacion.errorVehiculoOcupado", {
            defaultValue: "Otro usuario acaba de apartar este vehículo para estas fechas mientras completabas el formulario. Si esa persona no completa su pago en 15 minutos, el vehículo quedará libre nuevamente. También puedes explorar otros vehículos disponibles en el catálogo.",
          })
        );
      } else if (error?.response?.status === 409) {
        setTipoErrorAlerta("reserva");
        setErrorServidor(
          errorMsg ||
          t("reserva.confirmacion.error409", {
            defaultValue: "Ya se está procesando una reserva para este vehículo o fechas. Por favor verifica en 'Mis reservas'.",
          })
        );
      } else {
        setTipoErrorAlerta("general");
        const apiErrors = error?.response?.data?.errors;
        const detailsErrors = Array.isArray(apiErrors) && apiErrors.length > 0
          ? apiErrors.map((e: any) => e.message || `${e.field}: inválido`).join("\n")
          : "";
        const msg =
          detailsErrors ||
          errorMsg ||
          t("reserva.confirmacion.errorCrearMensaje", { defaultValue: "No se pudo registrar la reserva. Verifica que todos los datos y documentos sean válidos." });
        setErrorServidor(msg);
      }
    } finally {
      setProcesandoPago(false);
      isSubmittingRef.current = false;
    }
  };

  const handleConfirmarReserva = async () => {
    if (procesandoPago || isSubmittingRef.current) return;

    if (!datosCompletos) {
      setAlertaFaltantesVisible(true);
      return;
    }

    if (!captchaVerificado) {
      setErrorCaptcha(true);
      return;
    }
    setErrorCaptcha(false);

    if (checkOutsideSchedule() && !fechasLugar.fueraDeHorarioAceptado) {
      setAlertaHorarioVisible(true);
      return;
    }

    await ejecutarCreacionReserva(false);
  };

  const handleIrAMisReservas = () => {
    setModalInstruccionesEfectivoVisible(false);
    limpiarReserva();
    router.replace("/(tabs)/my-bookings");
  };

  const handleVolverAlInicio = () => {
    setModalInstruccionesEfectivoVisible(false);
    limpiarReserva();
    router.replace("/(tabs)");
  };

  const handlePagarMasTarde = () => {
    setModalReservaVisible(false);
    limpiarReserva();
    router.replace("/(tabs)/my-bookings");
  };

  const handleConfirmarCancelarProceso = () => {
    setAlertaCancelarProcesoVisible(false);
    limpiarReserva();
    router.replace("/(tabs)");
  };

  const handlePagarWompi = async () => {
    if (!reservaCreada) return;
    setProcesandoPago(true);

    try {
      const amountInCents = aCentavos(reservaCreada.total);

      const url = await construirUrlCheckout({
        reference: reservaCreada.id,
        amountInCents,
      });

      setModalReservaVisible(false);

      if (Platform.OS === "web" && typeof window !== "undefined") {
        limpiarReserva();
        window.location.href = url;
        return;
      }

      router.push({
        pathname: "/wompi-checkout" as any,
        params: {
          url: encodeURIComponent(url),
          ref: encodeURIComponent(reservaCreada.id),
        },
      });

      setTimeout(() => {
        limpiarReserva();
      }, 500);
    } catch (error) {
      Alert.alert(
        t("comun.error", { defaultValue: "Error" }),
        t("reserva.confirmacion.errorWompi", { defaultValue: "No se pudo abrir la pasarela de pago de Wompi." })
      );
    } finally {
      setProcesandoPago(false);
    }
  };

  return (
    <View>
      {/* Tarjeta Padre Contenedora */}
      <View style={[styles.cardPadre, { backgroundColor: c.bgCard, borderColor: c.border }]}>
        {/* Tarjeta de Formulario de Datos Personales */}
        <View style={[styles.cardForm, { backgroundColor: c.oscuro ? "#111827" : "#FFFFFF", borderColor: c.oscuro ? "#334155" : "#E2E8F0" }]}>
          <View style={styles.cardHeaderFila}>
            <Ionicons name="person" size={15} color={primaryAccent} />
            <Text style={[styles.cardHeaderTitulo, { color: primaryAccent }]}>
              {t("reserva.datosPersonales.titulo", { defaultValue: "Datos personales" })}
            </Text>
          </View>

          <Text style={[styles.cardSubtitulo, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
            {t("reserva.datosPersonales.subtitulo", {
              defaultValue: "Completa tus datos de contacto para la reserva y el contrato digital",
            })}
          </Text>

          <View style={[styles.divider, { backgroundColor: c.oscuro ? c.border : "#E2E8F0" }]} />

          <View style={styles.campo}>
            <Text style={[styles.inputLabel, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
              {t("reserva.datosPersonales.nombreCompleto", { defaultValue: "Nombre completo *" })}
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: c.oscuro ? c.bgInput : "#F8FAFC", borderColor: c.oscuro ? c.border : "#E2E8F0", color: c.oscuro ? "#F8FAFC" : "#0F172A" },
              ]}
              value={datosPersonales.nombreCompleto}
              onChangeText={(v) => {
                actualizarDatosPersonales({ nombreCompleto: v });
                const { nombres, apellidos } = separarNombreCompleto(v);
                actualizarUsuarioGlobal({ nombres, apellidos });
              }}
              placeholder={t("perfil.placeholders.nombreCompleto", { defaultValue: "Ej. Juan Pérez" })}
              placeholderTextColor={c.textMuted}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.campo}>
            <CampoSelectorLista
              etiqueta={t("reserva.datosPersonales.nacionalidad", { defaultValue: "Nacionalidad *" })}
              valorSeleccionado={datosPersonales.nacionalidad || null}
              opciones={OPCIONES_NACIONALIDAD}
              placeholder={t("perfil.seleccionar", { defaultValue: "Seleccionar" })}
              onSeleccionar={(id) => {
                actualizarDatosPersonales({ nacionalidad: id });
                actualizarUsuarioGlobal({ nacionalidad: id });
                if (esNacionalidadColombiana(id)) {
                  if (
                    datosPersonales.tipoDocumento &&
                    !["CC", "CE", "Pasaporte"].includes(datosPersonales.tipoDocumento)
                  ) {
                    actualizarDatosPersonales({ tipoDocumento: null });
                    actualizarUsuarioGlobal({ tipoDocumento: "" });
                  }
                } else {
                  if (
                    datosPersonales.tipoDocumento &&
                    !["Pasaporte", "CE"].includes(datosPersonales.tipoDocumento)
                  ) {
                    actualizarDatosPersonales({ tipoDocumento: null });
                    actualizarUsuarioGlobal({ tipoDocumento: "" });
                  }
                }
              }}
            />
          </View>

          <View style={styles.campo}>
            <Text style={[styles.inputLabel, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
              {t("reserva.datosPersonales.correoElectronico", { defaultValue: "Correo electrónico *" })}
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: c.oscuro ? c.bgInput : "#F8FAFC", borderColor: c.oscuro ? c.border : "#E2E8F0", color: c.oscuro ? "#F8FAFC" : "#0F172A" },
              ]}
              value={datosPersonales.correo}
              onChangeText={(v) => {
                actualizarDatosPersonales({ correo: v });
                actualizarUsuarioGlobal({ correo: v });
              }}
              placeholder={t("perfil.placeholders.correo", { defaultValue: "cliente@drivique.com" })}
              placeholderTextColor={c.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.campo}>
            <Text style={[styles.inputLabel, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
              {t("reserva.datosPersonales.numeroCelular", { defaultValue: "Teléfono celular *" })}
            </Text>
            <View style={styles.filaCelular}>
              {prefijoTelefono ? (
                <View
                  style={[
                    styles.prefijoBox,
                    {
                      backgroundColor: c.oscuro ? "rgba(255,255,255,0.05)" : "#F8FAFC",
                      borderColor: c.oscuro ? c.border : "#E2E8F0",
                    },
                  ]}
                >
                  <Text style={[styles.prefijoText, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
                    {prefijoTelefono}
                  </Text>
                </View>
              ) : null}
              <TextInput
                style={[
                  styles.input,
                  styles.inputCelular,
                  {
                    backgroundColor: c.oscuro ? c.bgInput : (hayPrefijo ? "#F8FAFC" : "#F3F4F6"),
                    borderColor: c.oscuro ? c.border : "#E2E8F0",
                    color: c.oscuro ? "#F8FAFC" : "#0F172A",
                    opacity: !hayPrefijo ? 0.6 : 1,
                  },
                ]}
                editable={hayPrefijo}
                value={datosPersonales.celular}
                onChangeText={(v) => {
                  const digits = v.replace(/\D/g, "").slice(0, 12);
                  actualizarDatosPersonales({ celular: digits });
                  actualizarUsuarioGlobal({ telefono: digits });
                }}
                keyboardType="phone-pad"
                placeholder={
                  !hayPrefijo
                    ? t("vehiculo.selectNationalityFirst", { defaultValue: "Primero selecciona tu nacionalidad" })
                    : t("perfil.placeholders.telefono", { defaultValue: "Ej. 3144214909" })
                }
                placeholderTextColor={c.textMuted}
              />
            </View>
          </View>

          <View style={styles.campo}>
            <CampoSelectorLista
              etiqueta={t("reserva.datosPersonales.tipoDeDocumento", { defaultValue: "Tipo de documento *" })}
              valorSeleccionado={datosPersonales.tipoDocumento}
              opciones={opcionesTipoDocumentoFiltradas}
              deshabilitado={!hayPrefijo}
              placeholder={
                !hayPrefijo
                  ? t("vehiculo.selectNationalityFirst", { defaultValue: "Primero selecciona tu nacionalidad" })
                  : t("perfil.seleccionar", { defaultValue: "Seleccionar" })
              }
              onSeleccionar={(id) => {
                actualizarDatosPersonales({
                  tipoDocumento: id as typeof datosPersonales.tipoDocumento,
                });
                actualizarUsuarioGlobal({
                  tipoDocumento: id as TipoDocumento,
                });
              }}
            />
          </View>

          <View style={[styles.campo, { marginBottom: 0 }]}>
            <Text style={[styles.inputLabel, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
              {t("reserva.datosPersonales.numeroDeDocumento", { defaultValue: "Número de documento *" })}
            </Text>
            <View style={styles.filaCelular}>
              {datosPersonales.tipoDocumento ? (
                <View
                  style={[
                    styles.prefijoBox,
                    {
                      backgroundColor: c.oscuro ? "rgba(255,255,255,0.05)" : "#F8FAFC",
                      borderColor: c.oscuro ? c.border : "#E2E8F0",
                    },
                  ]}
                >
                  <Text style={[styles.prefijoText, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
                    {getSiglaDocumento(datosPersonales.tipoDocumento)}
                  </Text>
                </View>
              ) : null}
              <TextInput
                style={[
                  styles.input,
                  styles.inputCelular,
                  {
                    backgroundColor: c.oscuro ? c.bgInput : (datosPersonales.tipoDocumento ? "#F8FAFC" : "#F3F4F6"),
                    borderColor: c.oscuro ? c.border : "#E2E8F0",
                    color: c.oscuro ? "#F8FAFC" : "#0F172A",
                    opacity: !datosPersonales.tipoDocumento ? 0.6 : 1,
                  },
                ]}
                editable={!!datosPersonales.tipoDocumento}
                value={datosPersonales.numeroDocumento}
                onChangeText={(v) => {
                  const upper = v.toUpperCase();
                  actualizarDatosPersonales({ numeroDocumento: upper });
                  actualizarUsuarioGlobal({ numeroDocumento: upper });
                }}
                placeholder={
                  !hayPrefijo
                    ? t("vehiculo.selectNationalityFirst", { defaultValue: "Primero selecciona tu nacionalidad" })
                    : !datosPersonales.tipoDocumento
                      ? t("vehiculo.selectDocTypeFirst", { defaultValue: "Primero selecciona tu tipo de documento" })
                      : datosPersonales.tipoDocumento === "Pasaporte"
                        ? "Ej. P12345678"
                        : "Ej. 1075228306"
                }
                placeholderTextColor={c.textMuted}
                keyboardType={
                  datosPersonales.tipoDocumento === "CC"
                    ? "numeric"
                    : "default"
                }
              />
            </View>
          </View>
        </View>
      </View>

      {/* 2. Tarjeta Padre de Verificación Documental */}
      <View style={[styles.cardPadre, { backgroundColor: c.bgCard, borderColor: c.border }]}>
        <TarjetaVerificacionDocumental
          tipoDocumento={datosPersonales.tipoDocumento ?? undefined}
          docsVerificados={docsVerificados}
        />
      </View>

      {/* 3. Tarjeta Padre de Cupón y Políticas */}
      <View style={[styles.cardPadre, { backgroundColor: c.bgCard, borderColor: c.border }]}>
        <CouponSection vehiculo={vehiculo} />
        <TarjetaTerminosCondiciones />
      </View>

      {/* Aviso informativo previo a la confirmación */}
      {(() => {
        const horasLimite = reservaCreada?.fechaLimitePago
          ? Math.max(1, Math.ceil((new Date(reservaCreada.fechaLimitePago).getTime() - Date.now()) / 3600000))
          : undefined;

        return (
          <>
            <View
              style={[
                styles.bannerAviso,
                {
                  backgroundColor: c.oscuro ? "rgba(30, 64, 175, 0.15)" : "#EFF6FF",
                  borderColor: c.oscuro ? "#1E40AF" : "#BFDBFE",
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={c.oscuro ? COLOR_ACENTO : COLOR_ENLACE_OSCURO}
                style={{ marginTop: 1 }}
              />
              <Text
                style={[
                  styles.bannerAvisoTexto,
                  {
                    color: c.oscuro ? "#93C5FD" : "#1E40AF",
                  },
                ]}
              >
                {t("reserva.datosPersonales.avisoGuardado", {
                  defaultValue: "Al confirmar la reserva, quedará guardada en tu cuenta y tendrás un plazo limitado para completar el pago antes de su cancelación automática.",
                })}
              </Text>
            </View>

            <SecurityCaptcha
              isVerified={captchaVerificado}
              onVerified={(verified) => {
                setCaptchaVerificado(verified);
                if (verified) setErrorCaptcha(false);
              }}
              hasError={errorCaptcha}
            />

            <BarraTotalConfirmar
              total={total}
              cargando={procesandoPago}
              onConfirmar={handleConfirmarReserva}
              onCancelar={() => setAlertaCancelarProcesoVisible(true)}
            />

            <ModalReservaRegistrada
              visible={modalReservaVisible}
              horasLimitePago={horasLimite}
              cargando={procesandoPago}
              onPagarWompi={handlePagarWompi}
              onCerrar={handlePagarMasTarde}
            />

            <BranchCashPaymentModal
              visible={modalInstruccionesEfectivoVisible}
              referencia={reservaCreada?.referencia || ""}
              codigoPago={reservaCreada?.codigoPagoEfectivo}
              nombreSucursal={vehiculo.sucursal || ""}
              total={reservaCreada?.total ?? total}
              horasLimitePago={horasLimite}
              onIrAMisReservas={handleIrAMisReservas}
              onVolverAlInicio={handleVolverAlInicio}
            />
          </>
        );
      })()}

      <AlertModal
        visible={alertaCancelarProcesoVisible}
        icono="alert-circle-outline"
        titulo={t("reserva.confirmacion.cancelarProcesoTitulo", { defaultValue: "¿Cancelar proceso de reserva?" })}
        mensaje={t("reserva.confirmacion.cancelarProcesoMensaje", {
          defaultValue: "Se descartarán los datos ingresados en este proceso y regresarás al catálogo de vehículos.",
        })}
        botones={[
          {
            texto: t("comun.no", { defaultValue: "No, continuar" }),
            variante: "secundario",
            onPress: () => setAlertaCancelarProcesoVisible(false),
          },
          {
            texto: t("reserva.confirmacion.siCancelar", { defaultValue: "Sí, cancelar reserva" }),
            variante: "primario",
            onPress: handleConfirmarCancelarProceso,
          },
        ]}
        onCerrar={() => setAlertaCancelarProcesoVisible(false)}
      />

      <AlertModal
        visible={alertaFaltantesVisible}
        icono="alert-circle-outline"
        titulo={t("reserva.datosPersonales.alertaFaltantesTitulo", { defaultValue: "Información incompleta" })}
        mensaje={t("reserva.datosPersonales.alertaFaltantesMensaje", {
          defaultValue: "Por favor completa todos los campos obligatorios y adjunta los documentos requeridos para confirmar tu reserva.",
        })}
        botones={[
          {
            texto: t("comun.entendido", { defaultValue: "Entendido" }),
            variante: "primario",
            onPress: () => setAlertaFaltantesVisible(false),
          },
        ]}
        onCerrar={() => setAlertaFaltantesVisible(false)}
      />

      <AlertModal
        visible={alertaHorarioVisible}
        icono="time-outline"
        titulo={t("reserva.horario.titulo", { defaultValue: "Sucursal fuera de horario de atención" })}
        mensaje={t("reserva.horario.mensaje", {
          sucursal: branchName || t("reserva.horario.laSucursal", { defaultValue: "la sucursal" }),
          apertura: horario.horaApertura,
          cierre: horario.horaCierre,
          defaultValue: `La sucursal ${branchName} tiene un horario de atención de ${horario.horaApertura} a ${horario.horaCierre}.\n\n⏱️ En este momento se encuentra cerrada, pero puedes registrar tu reserva ahora y quedará en estado PENDIENTE.\n\nMañana a las ${horario.horaApertura} te notificaremos por correo electrónico, notificación web y push para que puedas continuar con tu reserva.`,
        })}
        botones={[
          {
            texto: t("reserva.horario.modificar", { defaultValue: "Regresar" }),
            variante: "secundario",
            onPress: () => setAlertaHorarioVisible(false),
          },
          {
            texto: t("reserva.horario.aceptar", { defaultValue: "Registrar como pendiente" }),
            variante: "primario",
            onPress: () => {
              actualizarFechasLugar({ fueraDeHorarioAceptado: true });
              setAlertaHorarioVisible(false);
              ejecutarCreacionReserva(true);
            },
          },
        ]}
        onCerrar={() => setAlertaHorarioVisible(false)}
      />

      <AlertModal
        visible={alertaEfectivoVisible}
        icono="checkmark-circle-outline"
        titulo={t("reserva.confirmacion.efectivoConfirmadaTitulo")}
        mensaje={t("reserva.confirmacion.efectivoConfirmadaMensaje", {
          horas: reservaCreada?.fechaLimitePago
            ? Math.max(1, Math.ceil((new Date(reservaCreada.fechaLimitePago).getTime() - Date.now()) / 3600000))
            : "",
        })}
        botones={[
          {
            texto: t("reserva.confirmacion.entendidoIrAMisReservas"),
            variante: "primario",
            onPress: () => {
              setAlertaEfectivoVisible(false);
              limpiarReserva();
              router.replace("/(tabs)/my-bookings");
            },
          },
        ]}
        onCerrar={() => setAlertaEfectivoVisible(false)}
      />

      <AlertModal
        visible={!!errorServidor}
        icono={tipoErrorAlerta === "reserva" || tipoErrorAlerta === "vehiculo_ocupado" ? "warning-outline" : "close-circle-outline"}
        titulo={
          tipoErrorAlerta === "documento"
            ? t("reserva.confirmacion.docDuplicadoTitulo", { defaultValue: "Documento ya registrado" })
            : tipoErrorAlerta === "vehiculo_ocupado"
            ? t("reserva.confirmacion.vehiculoOcupadoTitulo", { defaultValue: "Vehículo no disponible" })
            : tipoErrorAlerta === "reserva"
            ? t("reserva.confirmacion.reservaEnProcesoTitulo", { defaultValue: "Reserva en proceso" })
            : t("reserva.confirmacion.errorCrearTitulo", { defaultValue: "Error al registrar la reserva" })
        }
        mensaje={errorServidor}
        botones={
          tipoErrorAlerta === "vehiculo_ocupado"
            ? [
                {
                  texto: t("reserva.confirmacion.verCatalogo", { defaultValue: "Ver otros vehículos" }),
                  variante: "primario",
                  onPress: () => {
                    setErrorServidor("");
                    limpiarReserva();
                    router.replace("/(tabs)/catalog");
                  },
                },
              ]
            : tipoErrorAlerta === "reserva"
            ? [
                {
                  texto: t("reserva.confirmacion.verMisReservas", { defaultValue: "Ver mis reservas" }),
                  variante: "primario",
                  onPress: () => {
                    setErrorServidor("");
                    limpiarReserva();
                    router.replace("/(tabs)/my-bookings");
                  },
                },
              ]
            : undefined
        }
        onCerrar={() => setErrorServidor("")}
      />

      <AlertModal
        visible={alertaErrorPagoVisible}
        icono="close-circle-outline"
        titulo={t("reserva.confirmacion.errorPagoTitulo", { defaultValue: "No se pudo completar el pago" })}
        mensaje={t("reserva.confirmacion.errorPagoMensaje", { defaultValue: "Hubo un error al procesar el pago con la pasarela. Intenta de nuevo." })}
        botones={[]}
        onCerrar={() => setAlertaErrorPagoVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardPadre: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardForm: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  cardHeaderFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 4,
  },
  cardHeaderTitulo: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  cardSubtitulo: {
    fontSize: 12.5,
    fontWeight: "400",
    lineHeight: 17.5,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  campo: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    fontWeight: "400",
  },
  filaCelular: {
    flexDirection: "row",
    gap: 8,
  },
  prefijoBox: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 50,
  },
  prefijoText: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  inputCelular: {
    flex: 1,
  },
  bannerAviso: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  bannerAvisoTexto: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "500",
  },
});
