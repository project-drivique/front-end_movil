import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Modal,
  Linking,
  Alert,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useUsuarioStore } from "@/store/userStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  useSupportStore,
  ReporteIncidencia,
  EstadoReporte,
} from "@/store/supportStore";
import {
  CANALES_CONTACTO_DUMMY,
  TIPOS_INCIDENCIA_DUMMY,
  FAQS_DUMMY,
  CanalContacto,
} from "@/modules/support/constants/support.dummy";

// Fotos de prueba para evidencia opcional (sin emojis)
const EVIDENCIAS_PRUEBA = [
  "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=400&q=80",
];

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const { t } = useTranslation();
  const usuarioProfile = useUsuarioStore((s) => s.usuario);

  const params = useLocalSearchParams<{
    reservaId?: string;
    vehiculoNombre?: string;
    placa?: string;
    tab?: string;
  }>();

  const { reportes, crearReporte } = useSupportStore();

  // Pestaña activa: 'canales' | 'reportar' | 'mis_reportes'
  const [activeTab, setActiveTab] = useState<"canales" | "reportar" | "mis_reportes">("canales");

  // Acordeón de FAQs
  const [faqsAbiertas, setFaqsAbiertas] = useState<string[]>(["faq-1"]);

  // Campos del formulario de reporte
  const [reservaId, setReservaId] = useState(params.reservaId || "");
  const [vehiculoNombre, setVehiculoNombre] = useState(params.vehiculoNombre || "");
  const [placa, setPlaca] = useState(params.placa || "");
  const [tipoSeleccionado, setTipoSeleccionado] = useState(TIPOS_INCIDENCIA_DUMMY[0].id);
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
    setContactoNombre(nombreCompleto || "Carlos Mendoza");
    setContactoTelefono(usuarioProfile.telefono || "+57 314 478 9702");
    setContactoEmail(usuarioProfile.correo || "carlos.mendoza@email.com");
  }, [usuarioProfile]);

  // Manejar parámetros de navegación si viene desde "Mis Reservas"
  useEffect(() => {
    if (params.reservaId || params.vehiculoNombre) {
      setReservaId(params.reservaId || "");
      setVehiculoNombre(params.vehiculoNombre || "");
      setPlaca(params.placa || "");
      setActiveTab("reportar");
    } else if (params.tab === "reportar") {
      setActiveTab("reportar");
    } else if (params.tab === "mis_reportes") {
      setActiveTab("mis_reportes");
    }
  }, [params.reservaId, params.vehiculoNombre, params.placa, params.tab]);

  // Objeto de tipo de incidencia seleccionado
  const tipoObj = useMemo(
    () => TIPOS_INCIDENCIA_DUMMY.find((item) => item.id === tipoSeleccionado) || TIPOS_INCIDENCIA_DUMMY[0],
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

  const agregarEvidencia = () => {
    if (evidenciasAdjuntas.length >= 3) {
      Alert.alert(t("tabs.reportarIncidencia"), "Puedes adjuntar máximo 3 fotos de evidencia.");
      return;
    }
    const foto = EVIDENCIAS_PRUEBA[evidenciasAdjuntas.length % EVIDENCIAS_PRUEBA.length];
    setEvidenciasAdjuntas([...evidenciasAdjuntas, foto]);
  };

  const eliminarEvidencia = (index: number) => {
    setEvidenciasAdjuntas(evidenciasAdjuntas.filter((_, i) => i !== index));
  };

  const validarYEnviarReporte = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!descripcion.trim() || descripcion.trim().length < 10) {
      nuevosErrores.descripcion = "Escribe una descripción detallada (mínimo 10 caracteres).";
    }
    if (!contactoNombre.trim()) {
      nuevosErrores.contactoNombre = "Ingresa el nombre de contacto.";
    }
    if (!contactoTelefono.trim()) {
      nuevosErrores.contactoTelefono = "Ingresa el número de teléfono.";
    }
    if (!contactoEmail.trim() || !contactoEmail.includes("@")) {
      nuevosErrores.contactoEmail = "Ingresa un correo electrónico válido.";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      Alert.alert(t("tabs.reportarIncidencia"), "Por favor completa todos los campos requeridos.");
      return;
    }

    setErrores({});

    const nuevo = crearReporte({
      reservaId: reservaId || undefined,
      vehiculoNombre: vehiculoNombre || undefined,
      placa: placa || undefined,
      tipoIncidencia: tipoObj.nombre,
      descripcion: descripcion.trim(),
      evidencias: evidenciasAdjuntas,
      contactoNombre: contactoNombre.trim(),
      contactoTelefono: contactoTelefono.trim(),
      contactoEmail: contactoEmail.trim(),
      tiempoEstimadoSolucion: tipoObj.tiempoEstimado,
    });

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
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("tabs.soporte")}</Text>
        <TouchableOpacity
          style={styles.headerHelpBtn}
          onPress={() => Linking.openURL(CANALES_CONTACTO_DUMMY[0].urlAction)}
        >
          <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Selector de Pestañas */}
      <View style={[styles.tabBar, { backgroundColor: c.bgCard, borderBottomColor: c.border }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "canales" && styles.activeTabButton]}
          onPress={() => setActiveTab("canales")}
        >
          <Text style={[styles.tabText, activeTab === "canales" ? styles.activeTabText : { color: c.textSecondary }]}>
            {t("tabs.canalesAtencion")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "reportar" && styles.activeTabButton]}
          onPress={() => setActiveTab("reportar")}
        >
          <Text style={[styles.tabText, activeTab === "reportar" ? styles.activeTabText : { color: c.textSecondary }]}>
            {t("tabs.reportarIncidencia")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "mis_reportes" && styles.activeTabButton]}
          onPress={() => setActiveTab("mis_reportes")}
        >
          <View style={styles.tabBadgeRow}>
            <Text style={[styles.tabText, activeTab === "mis_reportes" ? styles.activeTabText : { color: c.textSecondary }]}>
              {t("tabs.misReportes")}
            </Text>
            {reportes.length > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{reportes.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* PESTAÑA 1: CANALES DE ATENCIÓN Y FAQS */}
      {activeTab === "canales" && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Card Intro */}
          <View style={[styles.introCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: c.oscuro ? "#1E293B" : "#EFF6FF" }]}>
              <Ionicons name="headset-outline" size={32} color="#2563EB" />
            </View>
            <Text style={[styles.introTitle, { color: c.textPrimary }]}>Centro de Atención al Usuario</Text>
            <Text style={[styles.introSubtitle, { color: c.textSecondary }]}>
              Asistencia personalizada para tus alquileres de vehículos en Drivique.
            </Text>

            <TouchableOpacity
              style={styles.quickReportBtn}
              onPress={() => setActiveTab("reportar")}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={["#2563eb", "#1d4ed8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.quickReportGradient}
              >
                <Ionicons name="warning-outline" size={18} color="#FFFFFF" />
                <Text style={styles.quickReportBtnText}>{t("tabs.reportarIncidencia")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Canales de Contacto desde JSON */}
          <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>{t("tabs.canalesAtencion")}</Text>

          {CANALES_CONTACTO_DUMMY.map((canal) => (
            <TouchableOpacity
              key={canal.id}
              style={[styles.contactCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
              onPress={() => handleContactAction(canal)}
              activeOpacity={0.85}
            >
              <View style={[styles.contactIconWrap, { backgroundColor: canal.colorBg }]}>
                <Ionicons name={canal.icono as any} size={24} color={canal.colorIcono} />
              </View>
              <View style={styles.contactTextWrap}>
                <Text style={[styles.contactName, { color: c.textPrimary }]}>
                  {t(canal.nombreKey, { defaultValue: canal.nombreDefault })}
                </Text>
                <Text style={[styles.contactDesc, { color: c.textSecondary }]}>
                  {t(canal.descripcionKey, { defaultValue: canal.descripcionDefault })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
            </TouchableOpacity>
          ))}

          {/* FAQs desde JSON */}
          <Text style={[styles.sectionTitle, { color: c.textPrimary, marginTop: 24 }]}>
            {t("tabs.preguntasFrecuentes")}
          </Text>

          {FAQS_DUMMY.map((faq) => {
            const estaAbierto = faqsAbiertas.includes(faq.id);
            return (
              <View
                key={faq.id}
                style={[styles.faqCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
              >
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleFaq(faq.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.faqQuestion, { color: c.textPrimary }]}>{faq.pregunta}</Text>
                  <Ionicons
                    name={estaAbierto ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={c.textMuted}
                  />
                </TouchableOpacity>
                {estaAbierto && (
                  <Text style={[styles.faqAnswer, { color: c.textSecondary }]}>
                    {faq.respuesta}
                  </Text>
                )}
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* PESTAÑA 2: FORMULARIO DE REPORTE (DENTRO DE UN CONTENEDOR ELEGANTE Y SIN EMOJIS) */}
      {activeTab === "reportar" && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Banner de datos precargados desde Mis Reservas */}
          {params.reservaId ? (
            <View style={[styles.precargadoBanner, { backgroundColor: c.oscuro ? "#1e3a8a33" : "#EFF6FF", borderColor: c.oscuro ? "#1e3a8a" : "#BFDBFE" }]}>
              <Ionicons name="link-outline" size={20} color="#2563EB" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.precargadoTitulo, { color: c.oscuro ? "#93C5FD" : "#1E40AF" }]}>
                  Reserva vinculada desde Mis Reservas
                </Text>
                <Text style={[styles.precargadoSub, { color: c.oscuro ? "#BFDBFE" : "#1D4ED8" }]}>
                  {params.vehiculoNombre} · Ref: {params.reservaId} {params.placa ? `(Placa: ${params.placa})` : ""}
                </Text>
              </View>
            </View>
          ) : (
            <View style={[styles.infoFormBanner, { backgroundColor: c.bgCard, borderColor: c.border }]}>
              <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
              <Text style={[styles.infoFormText, { color: c.textSecondary }]}>
                Completa el formulario para reportar cualquier problema técnico o mecánico durante tu reserva.
              </Text>
            </View>
          )}

          {/* CONTENEDOR CARD DEL FORMULARIO */}
          <View style={[styles.formContainerCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <View style={styles.formCardHeader}>
              <Ionicons name="build-outline" size={22} color="#2563EB" />
              <Text style={[styles.formCardTitle, { color: c.textPrimary }]}>
                Formulario de Incidencia
              </Text>
            </View>

            {/* Vehículo y Placa */}
            <Text style={[styles.inputLabel, { color: c.textPrimary }]}>Vehículo / Reserva asociada</Text>
            <View style={styles.rowTwoInputs}>
              <TextInput
                style={[styles.input, { backgroundColor: c.bgInput, borderColor: c.border, color: c.textPrimary, flex: 1.5 }]}
                placeholder="Ej: Toyota Prado VX"
                placeholderTextColor={c.textMuted}
                value={vehiculoNombre}
                onChangeText={setVehiculoNombre}
              />
              <TextInput
                style={[styles.input, { backgroundColor: c.bgInput, borderColor: c.border, color: c.textPrimary, flex: 1 }]}
                placeholder="Placa (ej: KLS-849)"
                placeholderTextColor={c.textMuted}
                value={placa}
                onChangeText={setPlaca}
              />
            </View>

            {/* Selector de Tipo de Incidencia desde JSON */}
            <Text style={[styles.inputLabel, { color: c.textPrimary, marginTop: 14 }]}>
              Tipo de Incidencia *
            </Text>
            <View style={styles.tiposGrid}>
              {TIPOS_INCIDENCIA_DUMMY.map((tipo) => {
                const seleccionado = tipoSeleccionado === tipo.id;
                return (
                  <TouchableOpacity
                    key={tipo.id}
                    style={[
                      styles.tipoChip,
                      { backgroundColor: c.bgInput, borderColor: c.border },
                      seleccionado && styles.tipoChipSeleccionado,
                    ]}
                    onPress={() => setTipoSeleccionado(tipo.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={tipo.icono as any}
                      size={18}
                      color={seleccionado ? "#FFFFFF" : "#2563EB"}
                    />
                    <Text style={[styles.tipoChipTexto, { color: seleccionado ? "#FFFFFF" : c.textPrimary }]}>
                      {tipo.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Banner Dinámico de Tiempo Estimado */}
            <View style={[styles.tiempoEstimadoBox, { backgroundColor: c.oscuro ? "#312E8133" : "#FEF3C7", borderColor: c.oscuro ? "#3730A3" : "#FDE68A" }]}>
              <Ionicons name="time-outline" size={20} color={c.oscuro ? "#FBBF24" : "#D97706"} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.tiempoEstimadoLabel, { color: c.oscuro ? "#FDE68A" : "#B45309" }]}>
                  Tiempo estimado de atención técnica:
                </Text>
                <Text style={[styles.tiempoEstimadoValor, { color: c.oscuro ? "#FBBF24" : "#92400E" }]}>
                  {tipoObj.tiempoEstimado}
                </Text>
              </View>
            </View>

            {/* Descripción Obligatoria */}
            <Text style={[styles.inputLabel, { color: c.textPrimary, marginTop: 14 }]}>
              Descripción del problema *
            </Text>
            <TextInput
              style={[
                styles.inputMultiline,
                { backgroundColor: c.bgInput, borderColor: errores.descripcion ? "#EF4444" : c.border, color: c.textPrimary },
              ]}
              placeholder="Describe lo sucedido, ruidos, testigos en tablero o ubicación actual..."
              placeholderTextColor={c.textMuted}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              value={descripcion}
              onChangeText={(txt) => {
                setDescripcion(txt);
                if (errores.descripcion) setErrores({ ...errores, descripcion: "" });
              }}
            />
            {errores.descripcion && <Text style={styles.errorText}>{errores.descripcion}</Text>}

            {/* Evidencias Opcionales */}
            <View style={styles.evidenciaHeaderRow}>
              <Text style={[styles.inputLabel, { color: c.textPrimary, marginTop: 14 }]}>
                Evidencias (Imágenes / Video opcionales)
              </Text>
              <Text style={[styles.opcionalBadge, { color: c.textMuted }]}>Máx 3 fotos</Text>
            </View>

            <View style={styles.evidenciasFila}>
              {evidenciasAdjuntas.map((uri, idx) => (
                <View key={idx} style={styles.evidenciaPreviewWrap}>
                  <Image source={{ uri }} style={styles.evidenciaPreviewImg} />
                  <TouchableOpacity
                    style={styles.evidenciaEliminarBtn}
                    onPress={() => eliminarEvidencia(idx)}
                  >
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              {evidenciasAdjuntas.length < 3 && (
                <TouchableOpacity
                  style={[styles.agregarEvidenciaBtn, { backgroundColor: c.bgInput, borderColor: c.border }]}
                  onPress={agregarEvidencia}
                >
                  <Ionicons name="camera-outline" size={22} color="#2563EB" />
                  <Text style={styles.agregarEvidenciaTexto}>+ Adjuntar</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Datos de Contacto Auto-rellenados desde Perfil */}
            <View style={[styles.dividerSection, { backgroundColor: c.border }]} />

            <View style={styles.contactoHeaderRow}>
              <Ionicons name="person-circle-outline" size={20} color="#2563EB" />
              <Text style={[styles.sectionSubtitle, { color: c.textPrimary, marginLeft: 6 }]}>
                Datos de contacto para seguimiento
              </Text>
            </View>
            <Text style={[styles.contactoInfoHint, { color: c.textMuted }]}>
              Precargados automáticamente desde tu perfil registrado (puedes editarlos si lo requieres).
            </Text>

            <Text style={[styles.inputLabel, { color: c.textPrimary, marginTop: 8 }]}>Nombre completo *</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: c.bgInput, borderColor: errores.contactoNombre ? "#EF4444" : c.border, color: c.textPrimary },
              ]}
              value={contactoNombre}
              onChangeText={(txt) => {
                setContactoNombre(txt);
                if (errores.contactoNombre) setErrores({ ...errores, contactoNombre: "" });
              }}
            />
            {errores.contactoNombre && <Text style={styles.errorText}>{errores.contactoNombre}</Text>}

            <View style={styles.rowTwoInputs}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: c.textPrimary, marginTop: 10 }]}>Teléfono *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: c.bgInput, borderColor: errores.contactoTelefono ? "#EF4444" : c.border, color: c.textPrimary },
                  ]}
                  keyboardType="phone-pad"
                  value={contactoTelefono}
                  onChangeText={(txt) => {
                    setContactoTelefono(txt);
                    if (errores.contactoTelefono) setErrores({ ...errores, contactoTelefono: "" });
                  }}
                />
                {errores.contactoTelefono && <Text style={styles.errorText}>{errores.contactoTelefono}</Text>}
              </View>

              <View style={{ flex: 1.2 }}>
                <Text style={[styles.inputLabel, { color: c.textPrimary, marginTop: 10 }]}>Correo electrónico *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: c.bgInput, borderColor: errores.contactoEmail ? "#EF4444" : c.border, color: c.textPrimary },
                  ]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={contactoEmail}
                  onChangeText={(txt) => {
                    setContactoEmail(txt);
                    if (errores.contactoEmail) setErrores({ ...errores, contactoEmail: "" });
                  }}
                />
                {errores.contactoEmail && <Text style={styles.errorText}>{errores.contactoEmail}</Text>}
              </View>
            </View>

            {/* Botón de Enviar */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={validarYEnviarReporte}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={["#16a34a", "#15803d"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtnGradient}
              >
                <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Enviar Reporte de Incidencia</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* PESTAÑA 3: MIS REPORTES */}
      {activeTab === "mis_reportes" && (
        <View style={{ flex: 1 }}>
          {reportes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={54} color={c.textMuted} />
              <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>No tienes reportes registrados</Text>
              <Text style={[styles.emptySub, { color: c.textSecondary }]}>
                Si tienes un problema durante tu alquiler, regístralo desde la pestaña &quot;Reportar Incidencia&quot;.
              </Text>
              <TouchableOpacity
                style={styles.emptyReportBtn}
                onPress={() => setActiveTab("reportar")}
              >
                <Text style={styles.emptyReportBtnText}>Crear primer reporte</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={reportes}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              renderItem={({ item }) => {
                const colorEstado = getEstadoColor(item.estado);
                return (
                  <TouchableOpacity
                    style={[styles.reporteCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
                    onPress={() => setReporteSeleccionado(item)}
                    activeOpacity={0.88}
                  >
                    <View style={styles.reporteHeaderRow}>
                      <Text style={[styles.reporteId, { color: c.textPrimary }]}>{item.id}</Text>
                      <View style={[styles.estadoBadge, { backgroundColor: `${colorEstado}18`, borderColor: `${colorEstado}40` }]}>
                        <View style={[styles.estadoDot, { backgroundColor: colorEstado }]} />
                        <Text style={[styles.estadoTexto, { color: colorEstado }]}>{item.estado}</Text>
                      </View>
                    </View>

                    <Text style={[styles.reporteTipo, { color: "#2563EB" }]}>{item.tipoIncidencia}</Text>
                    <Text style={[styles.reporteVehiculo, { color: c.textSecondary }]}>
                      {item.vehiculoNombre} {item.placa ? `(Placa: ${item.placa})` : ""}
                    </Text>

                    <Text style={[styles.reporteDesc, { color: c.textPrimary }]} numberOfLines={2}>
                      {item.descripcion}
                    </Text>

                    <View style={styles.reporteFooterRow}>
                      <Text style={[styles.reporteTiempo, { color: c.textMuted }]}>
                        Tiempo est: {item.tiempoEstimadoSolucion}
                      </Text>
                      <Text style={[styles.reporteVerDetalle, { color: "#2563EB" }]}>Ver detalle →</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      )}

      {/* MODAL 1: CONFIRMACIÓN DE ENVÍO EXITOSO */}
      <Modal
        visible={reporteExitoso !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReporteExitoso(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <Ionicons name="checkmark-circle" size={56} color="#16A34A" style={{ alignSelf: "center", marginBottom: 10 }} />
            <Text style={[styles.modalTitle, { color: c.textPrimary, textAlign: "center" }]}>
              Reporte Registrado con Éxito
            </Text>
            <Text style={[styles.modalId, { color: "#2563EB", textAlign: "center" }]}>
              Código de caso: {reporteExitoso?.id}
            </Text>

            <View style={[styles.infoBoxModal, { backgroundColor: c.bgInput }]}>
              <View style={styles.infoRowModal}>
                <Ionicons name="time-outline" size={18} color="#D97706" />
                <Text style={[styles.infoTxtModal, { color: c.textPrimary }]}>
                  Tiempo estimado de atención: <Text style={{ fontWeight: "800" }}>{reporteExitoso?.tiempoEstimadoSolucion}</Text>
                </Text>
              </View>
              <View style={[styles.infoRowModal, { marginTop: 8 }]}>
                <Ionicons name="mail-outline" size={18} color="#2563EB" />
                <Text style={[styles.infoTxtModal, { color: c.textPrimary }]}>
                  Confirmación enviada a: <Text style={{ fontWeight: "700" }}>{reporteExitoso?.contactoEmail}</Text>
                </Text>
              </View>
            </View>

            <Text style={[styles.modalNotifAviso, { color: c.textSecondary }]}>
              El equipo administrador revisará el reporte y actualizará el estado del caso. Recibirás notificaciones por correo y en la app.
            </Text>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => {
                setReporteExitoso(null);
                setActiveTab("mis_reportes");
              }}
            >
              <Text style={styles.modalPrimaryBtnText}>Ver en Mis Reportes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: DETALLE DEL REPORTE Y VALIDACIÓN DEL ADMINISTRADOR (SIN EMOJIS, SOLO LECTURA DEL CLIENTE) */}
      <Modal
        visible={reporteSeleccionado !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setReporteSeleccionado(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCardLarge, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: c.textPrimary }]}>
                Detalle de Reporte {reporteSeleccionado?.id}
              </Text>
              <TouchableOpacity onPress={() => setReporteSeleccionado(null)}>
                <Ionicons name="close" size={24} color={c.textPrimary} />
              </TouchableOpacity>
            </View>

            {reporteSeleccionado && (
              <ScrollView style={{ flex: 1, marginVertical: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: "#2563EB" }}>
                    {reporteSeleccionado.tipoIncidencia}
                  </Text>
                  <View style={[styles.estadoBadge, { backgroundColor: `${getEstadoColor(reporteSeleccionado.estado)}18`, borderColor: `${getEstadoColor(reporteSeleccionado.estado)}40` }]}>
                    <Text style={[styles.estadoTexto, { color: getEstadoColor(reporteSeleccionado.estado) }]}>
                      {reporteSeleccionado.estado}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.modalSubHeader, { color: c.textMuted }]}>Vehículo / Reserva:</Text>
                <Text style={[styles.modalVal, { color: c.textPrimary }]}>
                  {reporteSeleccionado.vehiculoNombre} {reporteSeleccionado.placa ? `(Placa: ${reporteSeleccionado.placa})` : ""}
                </Text>

                <Text style={[styles.modalSubHeader, { color: c.textMuted, marginTop: 10 }]}>Descripción:</Text>
                <Text style={[styles.modalVal, { color: c.textSecondary, lineHeight: 18 }]}>
                  {reporteSeleccionado.descripcion}
                </Text>

                <Text style={[styles.modalSubHeader, { color: c.textMuted, marginTop: 10 }]}>Contacto registrado:</Text>
                <Text style={[styles.modalVal, { color: c.textPrimary }]}>
                  {reporteSeleccionado.contactoNombre} · {reporteSeleccionado.contactoTelefono}
                </Text>

                <Text style={[styles.modalSubHeader, { color: c.textMuted, marginTop: 10 }]}>Tiempo estimado de atención:</Text>
                <Text style={[styles.modalVal, { color: "#D97706", fontWeight: "700" }]}>
                  {reporteSeleccionado.tiempoEstimadoSolucion}
                </Text>

                {/* Historial de atención del Administrador */}
                <Text style={[styles.modalSubHeader, { color: c.textPrimary, marginTop: 16, fontWeight: "800", fontSize: 13.5 }]}>
                  Historial de atención del Administrador:
                </Text>

                <View style={styles.timelineContainer}>
                  {reporteSeleccionado.historialEstados.map((h, i) => (
                    <View key={i} style={styles.timelineItem}>
                      <View style={[styles.timelineDot, { backgroundColor: getEstadoColor(h.estado) }]} />
                      <View style={styles.timelineContent}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <Text style={[styles.timelineEstado, { color: c.textPrimary }]}>{h.estado}</Text>
                          <Text style={[styles.timelineFecha, { color: c.textMuted }]}>
                            {new Date(h.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </Text>
                        </View>
                        {h.comentario && (
                          <Text style={[styles.timelineComentario, { color: c.textSecondary }]}>
                            {h.comentario}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Nota informativa de gestión por el Administrador */}
                <View style={[styles.adminNoteBox, { backgroundColor: c.bgInput, borderColor: c.border }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#2563EB" />
                  <Text style={[styles.adminNoteText, { color: c.textSecondary }]}>
                    El estado de este reporte es validado y actualizado directamente por el equipo administrador en la central de soporte.
                  </Text>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setReporteSeleccionado(null)}
            >
              <Text style={styles.modalCloseBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  headerHelpBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: { flexDirection: "row", borderBottomWidth: 1 },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: { borderBottomColor: "#1D4ED8" },
  tabText: { fontSize: 12.5, fontWeight: "700" },
  activeTabText: { color: "#1D4ED8" },
  tabBadgeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  badgeCount: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeCountText: { color: "#FFF", fontSize: 10, fontWeight: "800" },

  scrollContent: { padding: 16 },

  introCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  introTitle: { fontSize: 18, fontWeight: "800", marginBottom: 4, textAlign: "center" },
  introSubtitle: { fontSize: 13, textAlign: "center", lineHeight: 18, marginBottom: 14 },
  quickReportBtn: { width: "100%", borderRadius: 10, overflow: "hidden" },
  quickReportGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  quickReportBtnText: { color: "#FFFFFF", fontSize: 13.5, fontWeight: "800" },

  sectionTitle: { fontSize: 15.5, fontWeight: "800", marginBottom: 12 },

  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  contactTextWrap: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  contactDesc: { fontSize: 12 },

  faqCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: { fontSize: 13.5, fontWeight: "700", flex: 1, paddingRight: 8 },
  faqAnswer: { fontSize: 13, lineHeight: 18, marginTop: 8 },

  // Banners
  precargadoBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  precargadoTitulo: { fontSize: 13, fontWeight: "800" },
  precargadoSub: { fontSize: 12, marginTop: 1 },

  infoFormBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  infoFormText: { fontSize: 12.5, flex: 1, lineHeight: 17 },

  // CONTENEDOR ELEGANTE TIPO CARD PARA EL FORMULARIO
  formContainerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  formCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB22",
  },
  formCardTitle: {
    fontSize: 16,
    fontWeight: "800",
  },

  inputLabel: { fontSize: 12.5, fontWeight: "700", marginBottom: 6 },
  rowTwoInputs: { flexDirection: "row", gap: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
  },
  inputMultiline: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    minHeight: 85,
  },
  errorText: { color: "#EF4444", fontSize: 11, marginTop: 4, fontWeight: "700" },

  tiposGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tipoChip: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  tipoChipSeleccionado: {
    backgroundColor: "#2563EB",
    borderColor: "#1D4ED8",
  },
  tipoChipTexto: { fontSize: 12, fontWeight: "700", flex: 1 },

  tiempoEstimadoBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  tiempoEstimadoLabel: { fontSize: 11, fontWeight: "700" },
  tiempoEstimadoValor: { fontSize: 14, fontWeight: "900", marginTop: 1 },

  evidenciaHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  opcionalBadge: { fontSize: 11, marginTop: 14 },
  evidenciasFila: { flexDirection: "row", gap: 10, marginTop: 8 },
  evidenciaPreviewWrap: { position: "relative", width: 68, height: 68 },
  evidenciaPreviewImg: { width: "100%", height: "100%", borderRadius: 8 },
  evidenciaEliminarBtn: { position: "absolute", top: -6, right: -6, zIndex: 10 },
  agregarEvidenciaBtn: {
    width: 68,
    height: 68,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  agregarEvidenciaTexto: { fontSize: 10.5, color: "#2563EB", fontWeight: "700", marginTop: 2 },

  dividerSection: {
    height: 1,
    marginVertical: 16,
  },
  contactoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  sectionSubtitle: { fontSize: 13.5, fontWeight: "800" },
  contactoInfoHint: { fontSize: 11, marginBottom: 8, lineHeight: 15 },

  submitBtn: { borderRadius: 10, overflow: "hidden", marginTop: 20 },
  submitBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  submitBtnText: { color: "#FFFFFF", fontSize: 14.5, fontWeight: "800" },

  // Mis Reportes
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", marginTop: 12 },
  emptySub: { fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 18 },
  emptyReportBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 18,
  },
  emptyReportBtnText: { color: "#FFF", fontSize: 13.5, fontWeight: "800" },

  reporteCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  reporteHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reporteId: { fontSize: 14, fontWeight: "800" },
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  estadoDot: { width: 6, height: 6, borderRadius: 3 },
  estadoTexto: { fontSize: 11, fontWeight: "800" },
  reporteTipo: { fontSize: 13, fontWeight: "800", marginTop: 4 },
  reporteVehiculo: { fontSize: 12, marginTop: 2 },
  reporteDesc: { fontSize: 12.5, marginTop: 6, lineHeight: 17 },
  reporteFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB22",
  },
  reporteTiempo: { fontSize: 11 },
  reporteVerDetalle: { fontSize: 11.5, fontWeight: "700" },

  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "90%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  modalCardLarge: {
    width: "92%",
    maxHeight: "85%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  modalTitle: { fontSize: 17, fontWeight: "800" },
  modalId: { fontSize: 14, fontWeight: "800", marginTop: 4 },
  infoBoxModal: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 14,
  },
  infoRowModal: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoTxtModal: { fontSize: 12.5, flex: 1 },
  modalNotifAviso: { fontSize: 12, textAlign: "center", lineHeight: 17, marginBottom: 16 },
  modalPrimaryBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalPrimaryBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },

  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalSubHeader: { fontSize: 12 },
  modalVal: { fontSize: 13, marginTop: 2 },

  timelineContainer: { marginTop: 10, paddingLeft: 6 },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: 10,
  },
  timelineContent: { flex: 1 },
  timelineEstado: { fontSize: 13, fontWeight: "800" },
  timelineFecha: { fontSize: 11 },
  timelineComentario: { fontSize: 12, marginTop: 2, lineHeight: 16 },

  adminNoteBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginTop: 16,
  },
  adminNoteText: { fontSize: 12, flex: 1, lineHeight: 16 },

  modalCloseBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  modalCloseBtnText: { color: "#FFF", fontSize: 13.5, fontWeight: "800" },
});
