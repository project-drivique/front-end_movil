// app/vehicle/[id].tsx
//
// Pantalla completa de detalles del vehículo accesible desde "Ver detalles" en la tarjeta del catálogo.

import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Linking, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useAuthStore } from "@/store/authStore";
import { useMonedaStore } from "@/store/currencyStore";
import { useReservaStore } from "@/store/reservationStore";

import { AlertModal } from "@/components/ui/AlertModal";

import {
  getDireccionSucursal,
  getCiudadPorSucursal,
  getHorarioSucursal,
} from "@/modules/catalog/constants/catalog.constants";
import { useReferenceStore } from "@/store/referenceStore";
import { apiClient } from "@/services/http/apiClient";

import BranchDirectionsModal from "@/modules/reservation/components/BranchDirectionsModal";
import { catalogoService } from "@/modules/catalog/services/catalogService";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import IdPart2 from '../../modules/catalog/screens/VehicleDetailScreen/IdPart2'
import IdPart from '../../modules/catalog/screens/VehicleDetailScreen/IdPart'

const COLOR_BORDE_CARD = "#E2E8F0";

export default function VehiculoDetallePage() {
  const { t } = useTranslation();
  const c = useTemaColores();
  const insets = useSafeAreaInsets();
  const { id, from, descuentoPorcentaje } = useLocalSearchParams<{
    id: string;
    from?: string;
    promoId?: string;
    descuentoPorcentaje?: string;
  }>();
  const usuario = useAuthStore((s) => s.usuario);
  const monedaActual = useMonedaStore((s) => s.monedaActual);
  const tasaUSD = useMonedaStore((s) => s.tasaUSD);

  useReferenceStore((st) => st.sucursales);
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [caracteristicas, setCaracteristicas] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (id) {
      setCargando(true);
      catalogoService.getVehiculoPorId(id)
        .then((v) => {
          if (v) setVehiculo(v);
        })
        .catch(() => {})
        .finally(() => setCargando(false));
    }
  }, [id]);

  useEffect(() => {
    if (!vehiculo?.uuid) return;
    apiClient
      .get(`/vehicles/${vehiculo.uuid}/features`)
      .then(({ data }) => setCaracteristicas(Array.isArray(data) ? data.filter((f: any) => f.isActive !== false) : []))
      .catch(() => setCaracteristicas([]));
  }, [vehiculo?.uuid]);

  const descuentoCalculado = descuentoPorcentaje ? Math.max(0, Number(descuentoPorcentaje)) : 0;

  const descuentoNum = descuentoCalculado;
  const tieneDescuento = descuentoNum > 0 && vehiculo?.disponible !== false;

  const [alertaReservaVisible, setAlertaReservaVisible] = useState(false);
  const [modalComoLlegarVisible, setModalComoLlegarVisible] = useState(false);
  const opacidad = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacidad, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [opacidad]);

  const volver = () => {
    if (router.canGoBack()) {
      router.back();
    } else if (from === "favorites") {
      router.replace("/(tabs)/favorites");
    } else {
      router.replace("/(tabs)/catalog");
    }
  };

  if (cargando) {
    return (
      <View style={[s.contenedorVacio, { backgroundColor: c.bg, paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!vehiculo) {
    return (
      <View style={[s.contenedorVacio, { backgroundColor: c.bg, paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={40} color={c.textMuted} />
        <Text style={[s.vacioTexto, { color: c.textSecondary }]}>{t("vehiculo.noDisponible")}</Text>
        <TouchableOpacity accessibilityRole="button" style={s.vacioBtn} onPress={volver}>
          <Text style={[s.vacioBtnTexto, { color: c.primary }]}>
            {from === "favorites" ? t("tabs.misFavoritos", { defaultValue: "Volver a favoritos" }) : t("vehiculo.volverCatalogo")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const disponible = vehiculo.disponible !== false;
  const tarifas = vehiculo.tarifas ?? {};
  const seguros = vehiculo.seguros ?? [];
  const nombreSucursal = vehiculo.sucursal || "";
  const ciudadSucursal = getCiudadPorSucursal(nombreSucursal);
  const direccionBase = getDireccionSucursal(nombreSucursal) || "";
  const direccionCompleta = ciudadSucursal ? `${direccionBase}, ${ciudadSucursal}` : direccionBase;
  const horarioAtencion = getHorarioSucursal(nombreSucursal).textoHorario;

  // Comentarios reales del vehículo (sin mock forzado)
  const comentariosMostrar = vehiculo.comentarios ?? [];

  const precioOriginal = vehiculo.precio;
  const precioConDescuento = tieneDescuento
    ? Math.round(precioOriginal * (1 - descuentoNum / 100))
    : precioOriginal;
  const precioFinal = precioConDescuento;

  const handleReservar = () => {
    if (!disponible) return;
    if (!usuario) {
      setAlertaReservaVisible(true);
      return;
    }
    useReservaStore.getState().seleccionarVehiculo(
      tieneDescuento
        ? {
            ...vehiculo,
            precioOriginal: vehiculo.precio,
            precio: precioConDescuento,
          }
        : vehiculo,
      {
        descuentoPromocion: tieneDescuento ? descuentoNum : undefined,
      }
    );
    router.push("/(tabs)/reserve");
  };

  const handleOpenPicoYPlaca = () => {
    Linking.openURL("https://www.pyphoy.com").catch(() => {});
  };

  const colorIconoHeader = c.oscuro ? "#93C5FD" : "#1E3A8A";
  const colorTituloCard = colorIconoHeader;
  const colorTextoPrimario = c.oscuro ? "#F8FAFC" : "#0F172A";
  const colorTextoSecundario = c.oscuro ? "#94A3B8" : "#64748B";
  const colorAzulAccion = c.oscuro ? "#93C5FD" : "#1E3A8A";
  const colorBorde = c.oscuro ? c.border : COLOR_BORDE_CARD;
  const bgPantalla = c.oscuro ? c.bg : "#FFFFFF";

  return (
    <View style={[s.flex, { backgroundColor: bgPantalla, paddingTop: insets.top }]}>
      <StatusBar barStyle={c.oscuro ? "light-content" : "dark-content"} translucent backgroundColor={bgPantalla} />

      {/* Top Header con botón Volver (<) */}
      <View style={[s.topHeader, { backgroundColor: bgPantalla, borderBottomColor: colorBorde }]}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("a11y.volver", "Volver")}
          onPress={volver}
          style={s.volverBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={colorAzulAccion} />
        </TouchableOpacity>
        <Text style={[s.headerTitulo, { color: colorTextoPrimario }]} numberOfLines={1}>
          {vehiculo.nombre}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <IdPart c={c} caracteristicas={caracteristicas} colorAzulAccion={colorAzulAccion} colorBorde={colorBorde} colorIconoHeader={colorIconoHeader} colorTextoPrimario={colorTextoPrimario} colorTextoSecundario={colorTextoSecundario} colorTituloCard={colorTituloCard} comentariosMostrar={comentariosMostrar} descuentoNum={descuentoNum} direccionCompleta={direccionCompleta} handleOpenPicoYPlaca={handleOpenPicoYPlaca} horarioAtencion={horarioAtencion} insets={insets} monedaActual={monedaActual} nombreSucursal={nombreSucursal} opacidad={opacidad} precioConDescuento={precioConDescuento} precioOriginal={precioOriginal} seguros={seguros} setModalComoLlegarVisible={setModalComoLlegarVisible} t={t} tarifas={tarifas} tasaUSD={tasaUSD} tieneDescuento={tieneDescuento} vehiculo={vehiculo} />

      {/* Barra inferior fija: Precio + Reservar ahora */}
      <IdPart2 c={c} colorBorde={colorBorde} colorTituloCard={colorTituloCard} disponible={disponible} handleReservar={handleReservar} insets={insets} monedaActual={monedaActual} precioFinal={precioFinal} t={t} tasaUSD={tasaUSD} />

      {/* Modal de Cómo llegar */}
      <BranchDirectionsModal
        visible={modalComoLlegarVisible}
        nombreSucursal={nombreSucursal}
        direccion={direccionCompleta}
        horario={horarioAtencion}
        onCerrar={() => setModalComoLlegarVisible(false)}
      />

      {/* Modal Alerta Registro / Inicio de Sesión */}
      <AlertModal
        visible={alertaReservaVisible}
        icono="car-sport-outline"
        titulo={t("catalogo.alertas.reservarTitulo", { defaultValue: "Inicia sesión" })}
        mensaje={t("catalogo.alertas.reservarMensaje", { defaultValue: "Debes iniciar sesión para reservar este vehículo." })}
        botones={[
          {
            texto: t("catalogo.alertas.cancelar", { defaultValue: "Cancelar" }),
            variante: "secundario",
            onPress: () => setAlertaReservaVisible(false),
          },
          {
            texto: t("catalogo.alertas.iniciarSesion", { defaultValue: "Iniciar sesión" }),
            variante: "primario",
            onPress: () => {
              setAlertaReservaVisible(false);
              router.push("/(auth)/login");
            },
          },
        ]}
        onCerrar={() => setAlertaReservaVisible(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  contenedorVacio: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  vacioTexto: { fontSize: 14, textAlign: "center" },
  vacioBtn: { marginTop: 8, paddingVertical: 8, paddingHorizontal: 16 },
  vacioBtnTexto: { fontSize: 14, fontWeight: "700" },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  volverBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitulo: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },
  cardHeaderTitulo: {
    fontSize: 13,
    fontWeight: "700",
  },

  precioCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeDescuento: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeDescuentoTexto: {
    fontSize: 11,
    fontWeight: "800",
    color: "#047857",
  },

  reservarBtnInline: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  reservarBtnInlineTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  sucursalNombre: {
    fontSize: 13.5,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  infoRowTexto: {
    fontSize: 13,
    fontWeight: "400",
  },

  btnAccion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    width: "100%",
  },
  btnAccionTexto: {
    fontSize: 13,
    fontWeight: "700",
  },

  parrafoTexto: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "400",
  },

  subCardInner: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filaTarifa: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  filaTarifaLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  filaTarifaPrecio: {
    fontSize: 13,
    fontWeight: "600",
  },
  divisorFila: {
    height: 1,
    width: "100%",
  },
  divisorSeccion: {
    height: 1,
    width: "100%",
    marginBottom: 14,
  },

  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
    marginTop: 2,
  },
  chipItem: {
    width: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipTexto: {
    fontSize: 12,
    fontWeight: "500",
    flexShrink: 1,
  },

  caracteristicasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 14,
    marginTop: 4,
  },
  columnaCaracteristica: {
    width: "50%",
    paddingRight: 8,
  },
  labelCaracteristica: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 2,
  },
  valorCaracteristica: {
    fontSize: 13,
    fontWeight: "600",
  },

  requisitosLista: {
    gap: 12,
    marginTop: 4,
  },
  requisitoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  requisitoIcono: {
    marginTop: 2,
  },
  requisitoTextCol: {
    flex: 1,
  },
  requisitoTitulo: {
    fontSize: 13.5,
    fontWeight: "600",
    marginBottom: 2,
  },
  requisitoDesc: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "400",
  },

  barraInferior: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  barraPrecioLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  barraPrecio: {
    fontSize: 19,
    fontWeight: "900",
    color: "#1E3A8A",
  },
  barraPrecioDia: {
    fontSize: 12,
    fontWeight: "500",
  },
  reservarBtnWrap: {
    borderRadius: 10,
    overflow: "hidden",
  },
  reservarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  reservarBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});