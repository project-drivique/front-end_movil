import React, { useState, useEffect, useMemo } from "react";
import { Text, View, TouchableOpacity, Linking } from 'react-native'
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useUsuarioStore } from "@/store/userStore";
import {
  reservaPersistService,
  ReservaGuardada,
  calcularGrupoReserva,
} from "@/modules/reservation/services/reservationPersistService";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  useSupportStore,
  ReporteIncidencia,
  EstadoReporte,
} from "@/store/supportStore";
import {
  CANALES_CONTACTO,
  TIPOS_INCIDENCIA,
  FAQS,
  CanalContacto,
} from "@/modules/support/constants/supportCatalog";

import * as DocumentPicker from "expo-document-picker";
import { Alert } from "@/utils/alerta";
import { styles } from '../../modules/support/screens/support.styles'
import SupportPart4 from '../../modules/support/screens/SupportScreen/SupportPart4'
import SupportPart3 from '../../modules/support/screens/SupportScreen/SupportPart3'
import SupportPart2 from '../../modules/support/screens/SupportScreen/SupportPart2'
import MisReportesActiveTab from '../../modules/support/screens/SupportScreen/MisReportesActiveTab'
import ReportarActiveTab from '../../modules/support/screens/SupportScreen/ReportarActiveTab'
import CanalesActiveTab from '../../modules/support/screens/SupportScreen/CanalesActiveTab'
import SupportPart from '../../modules/support/screens/SupportScreen/SupportPart'

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const { t } = useTranslation();
  const usuarioProfile = useUsuarioStore((s) => s.usuario);

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case "Recibido":
        return t("soporte.estado.recibido", { defaultValue: "Recibido" });
      case "En revisión":
        return t("soporte.estado.enRevision", { defaultValue: "En revisión" });
      case "En atención":
        return t("soporte.estado.enAtencion", { defaultValue: "En atención" });
      case "Resuelto":
        return t("soporte.estado.resuelto", { defaultValue: "Resuelto" });
      default:
        return estado;
    }
  };

  const getTipoIncidenciaTexto = (idOrNombre: string) => {
    switch (idOrNombre) {
      case "mecanica":
      case "Avería mecánica":
        return t("soporte.tipo.mecanica", { defaultValue: "Avería mecánica" });
      case "electrica":
      case "Falla eléctrica / Batería":
        return t("soporte.tipo.electrica", { defaultValue: "Falla eléctrica / Batería" });
      case "neumatico":
      case "Pinchazo / Neumático":
        return t("soporte.tipo.neumatico", { defaultValue: "Pinchazo / Neumático" });
      case "limpieza":
      case "Limpieza / Estética":
        return t("soporte.tipo.limpieza", { defaultValue: "Limpieza / Estética" });
      case "documentacion":
      case "Documentación / Licencia":
        return t("soporte.tipo.documentacion", { defaultValue: "Documentación / Licencia" });
      case "otro":
      case "Otro problema":
        return t("soporte.tipo.otro", { defaultValue: "Otro problema" });
      default:
        return idOrNombre;
    }
  };

  const getTiempoEstimadoTexto = (tiempo: string) => {
    switch (tiempo) {
      case "2 a 4 horas":
        return t("soporte.tiempo.2a4horas", { defaultValue: "2 a 4 horas" });
      case "1 a 3 horas":
        return t("soporte.tiempo.1a3horas", { defaultValue: "1 a 3 horas" });
      case "1 a 2 horas":
        return t("soporte.tiempo.1a2horas", { defaultValue: "1 a 2 horas" });
      case "12 horas":
        return t("soporte.tiempo.12horas", { defaultValue: "12 horas" });
      case "24 horas":
        return t("soporte.tiempo.24horas", { defaultValue: "24 horas" });
      case "12 a 24 horas":
        return t("soporte.tiempo.12a24horas", { defaultValue: "12 a 24 horas" });
      default:
        return tiempo;
    }
  };

  const params = useLocalSearchParams<{
    reservaId?: string;
    vehiculoNombre?: string;
    placa?: string;
    tab?: string;
    reporteId?: string;
  }>();

  const { reportes, crearReporte, cargar, abrirDetalle } = useSupportStore();
  const [enviando, setEnviando] = useState(false);

  // Reportes del usuario: vienen del servidor
  useEffect(() => {
    cargar().catch(() => {});
  }, [cargar]);

  // Abre el detalle con el seguimiento y las fotos que guarda el servidor
  const abrirReporte = async (reporte: ReporteIncidencia) => {
    setReporteSeleccionado(reporte);
    try {
      setReporteSeleccionado(await abrirDetalle(reporte));
    } catch {
      /* se queda con lo que ya hay en la lista */
    }
  };

  // Pestaña activa: 'canales' | 'reportar' | 'mis_reportes'
  const [activeTab, setActiveTab] = useState<"canales" | "reportar" | "mis_reportes">("canales");

  // Acordeón de FAQs
  const [faqsAbiertas, setFaqsAbiertas] = useState<string[]>(["faq-1"]);

  // Reservas activas/confirmadas del usuario
  const [reservasValidas, setReservasValidas] = useState<ReservaGuardada[]>([]);
  const [cargandoReservas, setCargandoReservas] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Campos del formulario de reporte
  const [reservaId, setReservaId] = useState(params.reservaId || "");
  const [vehiculoNombre, setVehiculoNombre] = useState(params.vehiculoNombre || "");
  const [placa, setPlaca] = useState(params.placa || "");
  const [tipoSeleccionado, setTipoSeleccionado] = useState(TIPOS_INCIDENCIA[0].id);
  const [descripcion, setDescripcion] = useState("");
  const [evidenciasAdjuntas, setEvidenciasAdjuntas] = useState<string[]>([]);

  // Datos de contacto auto-rellenados desde el Perfil del usuario autenticado
  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoTelefono, setContactoTelefono] = useState("");
  const [contactoEmail, setContactoEmail] = useState("");

  // Cargar datos automáticos del perfil al montar
  useEffect(() => {
    const nombreCompleto =
      `${usuarioProfile.nombres || ""} ${usuarioProfile.apellidos || ""}`.trim();
    setContactoNombre(nombreCompleto);
    setContactoTelefono(usuarioProfile.telefono || "");
    setContactoEmail(usuarioProfile.correo || "");
  }, [usuarioProfile]);

  // Cargar reservas válidas (confirmadas o en_curso)
  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const data = await reservaPersistService.getReservasUsuario();
        if (activo) {
          const filtradas = data.filter((r) => {
            const grupo = calcularGrupoReserva(r);
            return grupo === "en_curso";
          });
          setReservasValidas(filtradas);
        }
      } catch (err) {
        console.error("Error cargando reservas para soporte:", err);
      } finally {
        if (activo) setCargandoReservas(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [usuarioProfile]);

  // Manejar parámetros de navegación si viene desde "Mis Reservas"
  useEffect(() => {
    if (params.reservaId || params.vehiculoNombre) {
      // La reserva puede llegar por id (UUID) o por referencia: se busca para autocompletar carro y placa
      const reservaParam = reservasValidas.find(
        (r) => r.id === params.reservaId || r.referencia === params.reservaId,
      );
      const snap = reservaParam?.vehiculoSnapshot as any;
      setReservaId(reservaParam?.referencia || params.reservaId || "");
      setVehiculoNombre(params.vehiculoNombre || reservaParam?.vehiculoNombre || "");
      setPlaca(
        params.placa ||
          (reservaParam as any)?.vehiclePlate ||
          reservaParam?.vehiculoPlaca ||
          snap?.placa ||
          snap?.plate ||
          "",
      );
      setActiveTab("reportar");
    } else if (params.tab === "reportar") {
      setActiveTab("reportar");
    } else if (params.tab === "mis_reportes") {
      setActiveTab("mis_reportes");
      if (params.reporteId) {
        const found = reportes.find(r => r.id === params.reporteId);
        if (found) {
          abrirReporte(found);
        }
      }
    }
  }, [params.reservaId, params.vehiculoNombre, params.placa, params.tab, params.reporteId, reportes, reservasValidas]);

  // Objeto de tipo de incidencia seleccionado
  const tipoObj = useMemo(
    () => TIPOS_INCIDENCIA.find((item) => item.id === tipoSeleccionado) || TIPOS_INCIDENCIA[0],
    [tipoSeleccionado]
  );

  // Errores de validación
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Modales
  const [reporteExitoso, setReporteExitoso] = useState<ReporteIncidencia | null>(null);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteIncidencia | null>(null);

  const toggleFaq = (id: string) => {
    if (faqsAbiertas.includes(id)) {
      setFaqsAbiertas(faqsAbiertas.filter((f) => f !== id));
    } else {
      setFaqsAbiertas([...faqsAbiertas, id]);
    }
  };

  const handleContactAction = (canal: CanalContacto) => {
    Linking.openURL(canal.urlAction);
  };

  const agregarEvidencia = async () => {
    if (evidenciasAdjuntas.length >= 3) {
      Alert.alert(
        t("tabs.reportarIncidencia", { defaultValue: "Reportar incidencia" }),
        t("soporte.incidencia.maxFotosAlerta", { defaultValue: "Puedes adjuntar un máximo de 3 fotos de evidencia." })
      );
      return;
    }

    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (resultado.canceled || !resultado.assets || resultado.assets.length === 0) {
        return;
      }

      const nuevasUris = resultado.assets.map((a) => a.uri).filter(Boolean);
      const combinadas = [...evidenciasAdjuntas, ...nuevasUris].slice(0, 3);
      setEvidenciasAdjuntas(combinadas);
    } catch (error) {
      console.error("[SupportScreen] Error seleccionando imagen", error);
      Alert.alert(
        t("comun.error", { defaultValue: "Error" }),
        t("soporte.errorSeleccionImagen", { defaultValue: "No fue posible seleccionar la imagen." })
      );
    }
  };

  const eliminarEvidencia = (index: number) => {
    setEvidenciasAdjuntas(evidenciasAdjuntas.filter((_, i) => i !== index));
  };

  const validarYEnviarReporte = async () => {
    const nuevosErrores: Record<string, string> = {};

    if (!reservaId || !vehiculoNombre) {
      nuevosErrores.vehiculoNombre = t("soporte.incidencia.errorReservaRequerida", { defaultValue: "Debes asociar una reserva válida para enviar la incidencia." });
    }
    if (!descripcion.trim() || descripcion.trim().length < 10) {
      nuevosErrores.descripcion = t("soporte.incidencia.errorDescripcionMin", { defaultValue: "Escribe una descripción detallada (mínimo 10 caracteres)." });
    }
    if (!contactoNombre.trim()) {
      nuevosErrores.contactoNombre = t("soporte.incidencia.errorNombre", { defaultValue: "Ingresa el nombre de contacto." });
    }
    if (!contactoTelefono.trim()) {
      nuevosErrores.contactoTelefono = t("soporte.incidencia.errorTelefono", { defaultValue: "Ingresa el número de teléfono." });
    }
    if (!contactoEmail.trim() || !contactoEmail.includes("@")) {
      nuevosErrores.contactoEmail = t("soporte.incidencia.errorEmail", { defaultValue: "Ingresa un correo electrónico válido." });
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      Alert.alert(
        t("tabs.reportarIncidencia", { defaultValue: "Reportar incidencia" }),
        t("soporte.incidencia.alertaCamposRequeridos", { defaultValue: "Por favor completa todos los campos requeridos." })
      );
      return;
    }

    setErrores({});

    const reserva = reservasValidas.find((r) => r.referencia === reservaId || r.id === reservaId);
    const categoria = ["mecanica", "electrica", "neumatico", "limpieza"].includes(tipoObj.id)
      ? "VEHICLE"
      : tipoObj.id === "documentacion"
      ? "RESERVATION"
      : "OTHER";

    setEnviando(true);
    let nuevo: ReporteIncidencia;
    try {
      nuevo = await crearReporte({
        reservaUuid: reserva?.id,
        vehiculoUuid: reserva?.vehiculoId,
        tipoIncidencia: tipoObj.nombre,
        categoria,
        descripcion: descripcion.trim(),
        evidencias: evidenciasAdjuntas,
        contactoNombre: contactoNombre.trim(),
        contactoTelefono: contactoTelefono.trim(),
        contactoEmail: contactoEmail.trim(),
      });
    } catch (error: any) {
      Alert.alert(
        t("comun.error", { defaultValue: "Error" }),
        error?.response?.data?.detail ||
          t("soporte.incidencia.errorEnviar", { defaultValue: "No fue posible registrar el reporte. Inténtalo de nuevo." })
      );
      return;
    } finally {
      setEnviando(false);
    }

    setReporteExitoso(nuevo);
    setDescripcion("");
    setEvidenciasAdjuntas([]);
  };

  const getEstadoColor = (estado: EstadoReporte) => {
    switch (estado) {
      case "Recibido":
        return "#3B82F6";
      case "En revisión":
        return "#F59E0B";
      case "En atención":
        return "#8B5CF6";
      case "Resuelto":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Header Gradiente */}
      <LinearGradient
        colors={["#1e3a8a", "#2563eb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("a11y.volver", "Volver")} style={styles.backBtn} onPress={() => router.replace("/(tabs)/my-bookings")}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("tabs.soporte")}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("a11y.contactar", "Contactar")}
          style={styles.headerHelpBtn}
          onPress={() => Linking.openURL(CANALES_CONTACTO[0].urlAction)}
        >
          <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Selector de Pestañas */}
      <SupportPart activeTab={activeTab} c={c} reportes={reportes} setActiveTab={setActiveTab} t={t} />

      {/* PESTAÑA 1: CANALES DE ATENCIÓN Y FAQS */}
      {activeTab === "canales" && (
        <CanalesActiveTab c={c} faqsAbiertas={faqsAbiertas} handleContactAction={handleContactAction} setActiveTab={setActiveTab} t={t} toggleFaq={toggleFaq} />
      )}

      {/* PESTAÑA 2: FORMULARIO DE REPORTE (DENTRO DE UN CONTENEDOR ELEGANTE Y SIN EMOJIS) */}
      {activeTab === "reportar" && (
        <ReportarActiveTab agregarEvidencia={agregarEvidencia} c={c} cargandoReservas={cargandoReservas} contactoEmail={contactoEmail} contactoNombre={contactoNombre} contactoTelefono={contactoTelefono} descripcion={descripcion} eliminarEvidencia={eliminarEvidencia} enviando={enviando} errores={errores} evidenciasAdjuntas={evidenciasAdjuntas} getTiempoEstimadoTexto={getTiempoEstimadoTexto} getTipoIncidenciaTexto={getTipoIncidenciaTexto} params={params} placa={placa} reservasValidas={reservasValidas} setContactoEmail={setContactoEmail} setContactoNombre={setContactoNombre} setContactoTelefono={setContactoTelefono} setDescripcion={setDescripcion} setErrores={setErrores} setIsDropdownOpen={setIsDropdownOpen} setTipoSeleccionado={setTipoSeleccionado} t={t} tipoObj={tipoObj} tipoSeleccionado={tipoSeleccionado} validarYEnviarReporte={validarYEnviarReporte} vehiculoNombre={vehiculoNombre} />
      )}

      {/* PESTAÑA 3: MIS REPORTES */}
      {activeTab === "mis_reportes" && (
        <MisReportesActiveTab abrirReporte={abrirReporte} c={c} getEstadoColor={getEstadoColor} getEstadoTexto={getEstadoTexto} getTiempoEstimadoTexto={getTiempoEstimadoTexto} getTipoIncidenciaTexto={getTipoIncidenciaTexto} reportes={reportes} setActiveTab={setActiveTab} t={t} />
      )}

      {/* MODAL 3: SELECTOR DE VEHÍCULO / RESERVA ACTIVA */}
      <SupportPart2 c={c} cargandoReservas={cargandoReservas} errores={errores} isDropdownOpen={isDropdownOpen} reservaId={reservaId} reservasValidas={reservasValidas} setErrores={setErrores} setIsDropdownOpen={setIsDropdownOpen} setPlaca={setPlaca} setReservaId={setReservaId} setVehiculoNombre={setVehiculoNombre} t={t} />

      {/* MODAL 1: CONFIRMACIÓN DE ENVÍO EXITOSO */}
      <SupportPart3 c={c} getTiempoEstimadoTexto={getTiempoEstimadoTexto} reporteExitoso={reporteExitoso} setActiveTab={setActiveTab} setReporteExitoso={setReporteExitoso} t={t} />

      {/* MODAL 2: DETALLE DEL REPORTE Y VALIDACIÓN DEL ADMINISTRADOR (SIN EMOJIS, SOLO LECTURA DEL CLIENTE) */}
      <SupportPart4 c={c} getEstadoColor={getEstadoColor} getEstadoTexto={getEstadoTexto} getTiempoEstimadoTexto={getTiempoEstimadoTexto} getTipoIncidenciaTexto={getTipoIncidenciaTexto} reporteSeleccionado={reporteSeleccionado} setReporteSeleccionado={setReporteSeleccionado} t={t} />
    </View>
  );
}


