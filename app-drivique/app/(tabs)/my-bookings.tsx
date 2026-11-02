import { Ionicons } from "@expo/vector-icons";
import i18n from "@/modules/i18n";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useState } from 'react'
import { Image, SectionList, StatusBar, Text, TouchableOpacity, View } from 'react-native'


import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { GRADIENTES } from "@/constants/gradients";
import { COLOR_MARCA } from '@/modules/catalog/constants/catalog.constants'
import { IdiomaKey } from "@/modules/i18n";
import { useIdioma, useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import {
  GrupoReserva,
  ReservaGuardada,
  calcularGrupoReserva,
  mensajeDeError,
  reservaPersistService,
} from "@/modules/reservation/services/reservationPersistService";
import { fmt, fechaCorta } from "@/modules/reservation/components/BookingSummaryModal.pieces";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { useUsuarioStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { aCentavos, construirUrlCheckout } from "@/modules/reservation/services/wompiService";
import { Platform } from "react-native";
import { Alert } from "@/utils/alerta";
import { styles } from '../../modules/reservation/screens/my-bookings.styles'
import Cargando from '../../modules/reservation/screens/MyBookingsScreen/Cargando'

const COLOR_GRUPO: Record<GrupoReserva, string> = {
  pendiente: "#f59e0b",
  confirmada: "#2563eb",
  en_curso: "#16a34a",
  finalizada: "#6b7280",
  cancelada: "#dc2626",
};



// Mapa de idioma de la app -> locale BCP-47 para nombres de mes localizados
const LOCALE_POR_IDIOMA: Record<IdiomaKey, string> = {
  es: "es-CO",
  en: "en-US",
  fr: "fr-FR",
  pt: "pt-PT",
  br: "pt-BR",
};

function claveMes(fecha: string): string {
  return fecha.slice(0, 7); // "YYYY-MM"
}

function etiquetaMes(claveYYYYMM: string, locale: string): string {
  const fecha = new Date(claveYYYYMM + "-01T00:00:00");
  const texto = fecha.toLocaleDateString(locale, { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function etiquetaMesCorto(claveYYYYMM: string, locale: string): string {
  const fecha = new Date(claveYYYYMM + "-01T00:00:00");
  const texto = fecha.toLocaleDateString(locale, { month: "short" }).replace(".", "");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatFechaReserva(fechaStr?: string | null): string {
  if (!fechaStr) return "—";
  const clean = String(fechaStr).split("T")[0];
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, "0");
  const day = String(ahora.getDate()).padStart(2, "0");
  const hoyStr = `${year}-${month}-${day}`;

  if (clean === hoyStr) {
    return "Hoy";
  }
  return fechaCorta(clean);
}





function obtenerTituloSeccionFecha(fechaIsoStr?: string | null, locale: string = "es-CO"): string {
  if (!fechaIsoStr) return i18n.t("extra.misReservas.otras");
  const clean = String(fechaIsoStr).split("T")[0];
  const [y, m, d] = clean.split("-").map(Number);
  if (!y || !m || !d) return i18n.t("extra.misReservas.otras");

  const ahora = new Date();
  const yearHoy = ahora.getFullYear();
  const mesHoy = String(ahora.getMonth() + 1).padStart(2, "0");
  const diaHoy = String(ahora.getDate()).padStart(2, "0");
  const hoyStr = `${yearHoy}-${mesHoy}-${diaHoy}`;

  const ayerDate = new Date(ahora);
  ayerDate.setDate(ayerDate.getDate() - 1);
  const ayerStr = `${ayerDate.getFullYear()}-${String(ayerDate.getMonth() + 1).padStart(2, "0")}-${String(ayerDate.getDate()).padStart(2, "0")}`;

  if (clean === hoyStr) {
    return i18n.t("extra.misReservas.hoy");
  }
  if (clean === ayerStr) {
    return i18n.t("extra.misReservas.ayer");
  }

  const fechaItem = new Date(y, m - 1, d);
  const hoyMid = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const diffDias = Math.round((hoyMid.getTime() - fechaItem.getTime()) / (1000 * 60 * 60 * 24));

  const fechaFormateada = fechaItem.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: ahora.getFullYear() === y ? undefined : "numeric",
  });

  if (diffDias > 1 && diffDias <= 7) {
    return i18n.t("extra.misReservas.haceDias", { n: diffDias, fecha: fechaFormateada });
  }

  return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
}

function getTimestampCreacion(r: ReservaGuardada): number {
  if (r.fechaReserva) {
    const t = new Date(r.fechaReserva).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  const match = String(r.referencia || "").match(/\d{10,}/);
  if (match) {
    const t = parseInt(match[0], 10);
    if (!isNaN(t) && t > 0) return t;
  }
  return 0;
}

const ordenarPorCreacionDesc = (a: ReservaGuardada, b: ReservaGuardada) => {
  return getTimestampCreacion(b) - getTimestampCreacion(a);
};

export default function MisReservasScreen() {
  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const { t } = useTranslation();
  const { idiomaActual, temaActual, toggleTema } = useIdioma();
  const usuario = useUsuarioStore((state) => state.usuario);
  const usuarioAuth = useAuthStore((state) => state.usuario);
  const usuarioKey = usuario.id || usuarioAuth?.id || "";
  const [reservas, setReservas] = useState<ReservaGuardada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const [filtroGrupo, setFiltroGrupo] = useState<GrupoReserva | "todas">("todas");
  const [modalEstadoVisible, setModalEstadoVisible] = useState(false);
  const [modalMesVisible, setModalMesVisible] = useState(false);
  const [filtroMes, setFiltroMes] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const cargar = async (silencioso = false) => {
        try {
          const data = await reservaPersistService.getReservasUsuario();
          if (activo) setReservas([...data].sort(ordenarPorCreacionDesc));
        } catch (e) {
          if (activo && !silencioso) {
            setErrorCarga(mensajeDeError(e, t("misReservas.errorCarga", { defaultValue: "No se pudieron cargar tus reservas." })));
          }
        } finally {
          if (activo && !silencioso) setCargando(false);
        }
      };

      cargar(false);
      const interval = setInterval(() => {
        cargar(true);
      }, 4000);

      return () => {
        activo = false;
        clearInterval(interval);
      };
    }, [t])
  );

  const hayFiltrosActivos = filtroGrupo !== "todas" || !!filtroMes;

  const limpiarFiltros = () => {
    setFiltroGrupo("todas");
    setFiltroMes(null);
  };

  const locale = LOCALE_POR_IDIOMA[idiomaActual] ?? "es-CO";

  const anioActual = new Date().getFullYear();
  const mesesDelAnio = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const clave = `${anioActual}-${String(i + 1).padStart(2, "0")}`;
      return { clave, etiqueta: etiquetaMesCorto(clave, locale) };
    });
  }, [anioActual, locale]);

  const hayReservaEnMes = (claveDelMes: string) =>
    reservas.some((r) => {
      const fecha = r.fechaRetiro ? String(r.fechaRetiro) : r.fechaReserva;
      return !!fecha && claveMes(fecha) === claveDelMes;
    });

  const seleccionarMes = (clave: string | null) => {
    setFiltroMes(clave);
    setModalMesVisible(false);
    if (clave && !hayReservaEnMes(clave)) {
      Alert.alert(t("misReservas.sinResultadosFiltroTitulo"), t("misReservas.sinReservasEnMes", { mes: etiquetaMes(clave, locale) }));
    }
  };

  const reservasFiltradas = useMemo(() => {
    return reservas.filter((r) => {
      if (filtroGrupo !== "todas" && calcularGrupoReserva(r) !== filtroGrupo) return false;
      if (filtroMes) {
        const fecha = r.fechaRetiro ? String(r.fechaRetiro) : r.fechaReserva;
        if (!fecha || claveMes(fecha) !== filtroMes) return false;
      }
      return true;
    });
  }, [reservas, filtroGrupo, filtroMes]);

  const seccionesReservas = useMemo(() => {
    const mapa = new Map<string, ReservaGuardada[]>();
    for (const r of reservasFiltradas) {
      const fechaKey = String(r.fechaReserva || "").split("T")[0] || String(r.fechaRetiro || "").split("T")[0] || "desconocida";
      const lista = mapa.get(fechaKey) || [];
      lista.push(r);
      mapa.set(fechaKey, lista);
    }
    const fechasOrdenadas = Array.from(mapa.keys()).sort((a, b) => b.localeCompare(a));
    return fechasOrdenadas.map((fechaKey) => ({
      fechaKey,
      titulo: obtenerTituloSeccionFecha(fechaKey === "desconocida" ? null : fechaKey, locale),
      data: (mapa.get(fechaKey) || []).sort(ordenarPorCreacionDesc),
    }));
  }, [reservasFiltradas, locale]);

  const irADetalle = (referencia: string) =>
    router.push(`/payment-response?ref=${encodeURIComponent(referencia)}`);

  const handlePagarWompi = async (reserva: ReservaGuardada) => {
    try {
      const amountInCents = aCentavos(reserva.total);
      const url = await construirUrlCheckout({
        reference: reserva.id,
        amountInCents,
      });

      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.location.href = url;
        return;
      }

      router.push({
        pathname: "/wompi-checkout" as any,
        params: {
          url: encodeURIComponent(url),
          ref: encodeURIComponent(reserva.id),
        },
      });
    } catch {
      Alert.alert(
        t("comun.error", { defaultValue: "Error" }),
        t("reserva.confirmacion.errorWompi", { defaultValue: "No se pudo abrir la pasarela de pago de Wompi." })
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      <LinearGradient
        colors={GRADIENTES.boton.colors}
        start={GRADIENTES.boton.start}
        end={GRADIENTES.boton.end}
        style={styles.header}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={[styles.headerTitulo, { color: "#ffffff" }]}>{t("misReservas.titulo")}</Text>
            <Text style={[styles.headerSubtitulo, { color: "rgba(255,255,255,0.7)" }]}>
              {t("misReservas.subtitulo")}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {!cargando && reservas.length > 0 && (
        <Cargando c={c} filtroGrupo={filtroGrupo} filtroMes={filtroMes} hayFiltrosActivos={hayFiltrosActivos} limpiarFiltros={limpiarFiltros} locale={locale} mesesDelAnio={mesesDelAnio} modalEstadoVisible={modalEstadoVisible} modalMesVisible={modalMesVisible} seleccionarMes={seleccionarMes} setFiltroGrupo={setFiltroGrupo} setModalEstadoVisible={setModalEstadoVisible} setModalMesVisible={setModalMesVisible} t={t} />
      )}

      {!cargando && reservas.length > 0 && reservasFiltradas.length > 0 && (
        <SectionList
          sections={seccionesReservas}
          keyExtractor={(item) => item.referencia}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section: { titulo } }) => (
            <View style={styles.seccionHeader}>
              <View style={[styles.seccionPunto, { backgroundColor: c.primary }]} />
              <Text style={[styles.seccionTitulo, { color: c.textPrimary }]}>{titulo}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TarjetaReserva
              reserva={item}
              usuarioId={usuarioKey}
              c={c}
              t={t}
              onPress={() => irADetalle(item.referencia)}
              onPressResena={() => irADetalle(item.referencia)}
            />
          )}
        />
      )}

      {!cargando && reservas.length > 0 && reservasFiltradas.length === 0 && (
        <View style={styles.vacioContainer}>
          <Ionicons name="search-outline" size={40} color={c.textMuted} />
          <Text style={[styles.vacioTitulo, { color: c.textPrimary }]}>{t("misReservas.sinResultadosFiltroTitulo")}</Text>
          <Text style={[styles.vacioTexto, { color: c.textMuted }]}>{t("misReservas.sinResultadosFiltro")}</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("misReservas.limpiarFiltros")} onPress={limpiarFiltros}>
            <Text style={[styles.limpiarBtnTexto, { color: c.primary, fontSize: 13 }]}>{t("misReservas.limpiarFiltros")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!cargando && reservas.length === 0 && (
        <View style={styles.vacioContainer}>
          <View style={[styles.vacioIconoWrap, { backgroundColor: c.primaryBg }]}>
            <Ionicons name="receipt-outline" size={40} color={COLOR_MARCA} />
          </View>
          <Text style={[styles.vacioTitulo, { color: c.textPrimary }]}>{t("misReservas.vacioTitulo")}</Text>
          <Text style={[styles.vacioTexto, { color: c.textMuted }]}>
            {errorCarga || t("misReservas.vacioTexto")}
          </Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("misReservas.explorarVehiculos")}
            style={styles.vacioBtnWrap}
            onPress={() => router.push("/(tabs)/catalog")}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={GRADIENTES.boton.colors}
              start={GRADIENTES.boton.start}
              end={GRADIENTES.boton.end}
              style={styles.vacioBtn}
            >
              <Ionicons name="car-sport-outline" size={16} color="#fff" />
              <Text style={styles.vacioBtnText}>{t("misReservas.explorarVehiculos")}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}



function TarjetaReserva({
  reserva,
  usuarioId,
  c,
  t,
  onPress,
  onPressResena,
}: {
  reserva: ReservaGuardada;
  usuarioId: string;
  c: ReturnType<typeof useTemaColores>;
  t: (key: string, opts?: any) => string;
  onPress: () => void;
  onPressResena?: () => void;
}) {
  const grupo = calcularGrupoReserva(reserva);
  const vehiculoSnap = reserva.vehiculoSnapshot as Vehiculo | undefined;
  const foto = vehiculoSnap?.imagenes?.[0];

  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("reserva.confirmacion.respuesta.total", { defaultValue: "Total" })}
      activeOpacity={0.85}
      style={[styles.tarjeta, { backgroundColor: c.bgCard, borderColor: c.border }]}
      onPress={onPress}
    >
      <View style={styles.tarjetaFila}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.tarjetaFoto} />
        ) : (
          <View style={[styles.tarjetaFotoVacia, { backgroundColor: c.bgInput }]}>
            <Ionicons name="car-sport-outline" size={24} color={c.textMuted} />
          </View>
        )}

        <View style={styles.tarjetaInfo}>
          <View style={styles.tarjetaHeader}>
            <Text style={[styles.tarjetaVehiculo, { color: c.textPrimary }]} numberOfLines={1}>
              {reserva.vehiculoNombre}
            </Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: `${COLOR_GRUPO[grupo]}18`,
                  borderColor: `${COLOR_GRUPO[grupo]}40`,
                },
              ]}
            >
              <View style={[styles.badgeDot, { backgroundColor: COLOR_GRUPO[grupo] }]} />
              <Text style={[styles.badgeTexto, { color: COLOR_GRUPO[grupo] }]} numberOfLines={1}>
                {reserva.estado === "PENDIENTE_VALIDACION"
                  ? t("misReservas.detalle.enRevisionDocumentos", { defaultValue: "En revisión de documentos" })
                  : (reserva.estado === "PENDIENTE_FIRMA"
                    ? t("misReservas.detalle.pendienteFirma", { defaultValue: "Pendiente de firma" })
                    : t(`misReservas.grupos.${grupo}`))}
              </Text>
            </View>
          </View>

          {/* Fechas de la reserva */}
          <Text style={[styles.tarjetaFechas, { color: c.textSecondary }]} numberOfLines={1}>
            {formatFechaReserva(reserva.fechaRetiro ? String(reserva.fechaRetiro) : null)}
            {" → "}
            {formatFechaReserva(reserva.fechaDevolucion ? String(reserva.fechaDevolucion) : null)}
          </Text>

          <View style={styles.tarjetaFooter}>
            <Text style={[styles.tarjetaTotalLabel, { color: c.textSecondary }]}>
              {t("reserva.confirmacion.respuesta.total", { defaultValue: "Total" })}
            </Text>
            <Text style={[styles.tarjetaTotal, { color: c.textPrimary }]}>{fmt(reserva.total)}</Text>
          </View>

          {grupo === "en_curso" && (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("tabs.hacerReporte", { defaultValue: "Soporte de incidencias" })}
              style={[styles.reportarBtn, { backgroundColor: c.primaryBg, borderColor: c.primary }]}
              onPress={(e) => {
                e.stopPropagation();
                router.push({
                  pathname: "/(tabs)/support",
                  params: {
                    reservaId: reserva.id,
                    tab: "nueva",
                  },
                } as any);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="build-outline" size={13} color={c.primary} />
              <Text style={[styles.reportarBtnText, { color: c.primary, fontWeight: "700" }]}>
                {t("tabs.hacerReporte", { defaultValue: "Soporte de incidencias" })}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}



