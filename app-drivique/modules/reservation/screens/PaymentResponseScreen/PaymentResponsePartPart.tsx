import { View, StyleSheet, Text } from 'react-native'
import { fechaCorta, fmt } from '@/modules/reservation/components/BookingSummaryModal.pieces'
import { formatHoraAmPm } from '@/modules/reservation/constants/reservation.constants'
import { useTemaColores } from '@/modules/i18n/hooks/useLanguage'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_ACENTO } from '@/constants/brandPalette'
import { COLOR_MARCA } from '@/modules/catalog/constants/catalog.constants'
import { ReservaGuardada } from '@/modules/reservation/services/reservationPersistService'

const s = StyleSheet.create({
  firmaCard: { borderWidth: 1.5, borderRadius: 16, padding: 18, alignItems: "center", marginTop: 16 },
  firmaIcono: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  firmaTitulo: { fontSize: 16, fontWeight: "800", textAlign: "center", marginBottom: 6 },
  firmaTexto: { fontSize: 13, textAlign: "center", lineHeight: 19, marginBottom: 16 },
  contratoCard: { borderWidth: 1, borderRadius: 18, padding: 20, alignItems: "center", marginTop: 8 },
  contratoIcono: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  contratoTitulo: { fontSize: 18, fontWeight: "800", textAlign: "center" },
  contratoTexto: { fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 19 },
  contratoBtn: { borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  contratoBtnTexto: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  flex: { flex: 1 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  titulo: { fontSize: 16, fontWeight: "800", textAlign: "center" },
  texto: { fontSize: 13, textAlign: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitulo: { fontSize: 16, fontWeight: "800" },
  scroll: { padding: 16, gap: 12 },
  topHeader: {
    alignItems: "center",
    marginBottom: 4,
    gap: 3,
  },
  topTituloEstado: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  topSubtituloVehiculo: {
    fontSize: 13.5,
    fontWeight: "600",
    textAlign: "center",
  },
  fotoCard: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 4,
  },
  foto: {
    width: "100%",
    height: 180,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  celda: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  celdaIcono: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  celdaContenido: {
    flex: 1,
    justifyContent: "center",
  },
  celdaLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  celdaValor: {
    fontSize: 12.5,
    lineHeight: 16,
  },
  tarjetaInformativa: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginVertical: 4,
  },
  tarjetaInfoHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tarjetaInfoTitulo: {
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
  },
  tarjetaInfoTexto: {
    fontSize: 13,
    lineHeight: 19,
  },
  tarjetaInfoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  tarjetaInfoBadgeTexto: {
    fontSize: 12,
    fontWeight: "700",
  },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  punto: { width: 7, height: 7, borderRadius: 4 },
  badgeTexto: { fontSize: 12, fontWeight: "800" },
  vehiculo: { fontSize: 17, fontWeight: "800" },
  sub: { fontSize: 12 },
  fila: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  filaLabel: { fontSize: 12, flexShrink: 0 },
  filaValor: { fontSize: 13, flex: 1, textAlign: "right" },
  aviso: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 },
  avisoTitulo: { fontSize: 13, fontWeight: "800" },
  avisoTexto: { fontSize: 12, lineHeight: 17 },
  codigo: { fontSize: 22, fontWeight: "800", letterSpacing: 2 },
  boton: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  botonTexto: { color: "#fff", fontWeight: "800", fontSize: 14 },
  botonSec: { paddingVertical: 12, borderRadius: 12, alignItems: "center", borderWidth: 1.5 },
  botonSecTexto: { fontWeight: "800", fontSize: 13 },
  cancelarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 8,
  },
  cancelarTexto: { color: "#DC2626", fontWeight: "800", fontSize: 13.5 },
});
function CeldaDato({
  c,
  icono,
  label,
  valor,
  anchoCompleto,
  esTotal,
  colorValor,
}: {
  c: ReturnType<typeof useTemaColores>;
  icono: keyof typeof Ionicons.glyphMap;
  label: string;
  valor: string;
  anchoCompleto?: boolean;
  esTotal?: boolean;
  colorValor?: string;
}) {
  return (
    <View
      style={[
        s.celda,
        {
          backgroundColor: c.oscuro ? "#1F2937" : "#F8FAFC",
          borderColor: c.border,
          width: anchoCompleto ? "100%" : "48.2%",
        },
      ]}
    >
      <View
        style={[
          s.celdaIcono,
          {
            backgroundColor: c.oscuro ? "rgba(30, 64, 175, 0.25)" : "#EFF6FF",
            borderColor: c.oscuro ? "rgba(30, 64, 175, 0.4)" : "#DBEAFE",
          },
        ]}
      >
        <Ionicons name={icono} size={16} color={c.oscuro ? COLOR_ACENTO : COLOR_MARCA} />
      </View>
      <View style={s.celdaContenido}>
        <Text style={[s.celdaLabel, { color: c.textMuted }]} numberOfLines={1}>
          {label}
        </Text>
        <Text
          style={[
            s.celdaValor,
            {
              color: colorValor || (esTotal ? (c.oscuro ? COLOR_ACENTO : COLOR_MARCA) : c.textPrimary),
              fontWeight: esTotal ? "800" : "700",
            },
          ]}
          numberOfLines={2}
        >
          {valor}
        </Text>
      </View>
    </View>
  );
}

export default function PaymentResponsePartPart({ c, color, puntoDevolucion, puntoRetiro, reserva, sucursalEfectivo, t, tituloEstado, vehiculo }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; color: string; puntoDevolucion: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/services/reservationPersistService").PuntoEntrega | undefined; puntoRetiro: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/services/reservationPersistService").PuntoEntrega | undefined; reserva: ReservaGuardada; sucursalEfectivo: string; t: any; tituloEstado: string; vehiculo: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Vehiculo | undefined }) {
  return (
    <View style={s.grid}>
              {/* Vehículo */}
              <CeldaDato
                c={c}
                icono="car-sport-outline"
                label={t("reservas.vehicle", { defaultValue: "Vehículo" })}
                valor={reserva.vehiculoNombre}
              />
    
              {/* Fecha de retiro */}
              <CeldaDato
                c={c}
                icono="calendar-outline"
                label={t("reservas.pickupDate", { defaultValue: "Fecha de retiro" })}
                valor={fechaCorta(reserva.fechaRetiro)}
              />
    
              {/* Hora de retiro */}
              <CeldaDato
                c={c}
                icono="time-outline"
                label={t("reservas.pickupTime", { defaultValue: "Hora de retiro" })}
                valor={formatHoraAmPm(reserva.horaRetiro) || "—"}
              />
    
              {/* Fecha de devolución */}
              <CeldaDato
                c={c}
                icono="calendar-outline"
                label={t("reservas.returnDate", { defaultValue: "Fecha de devolución" })}
                valor={fechaCorta(reserva.fechaDevolucion)}
              />
    
              {/* Hora de devolución */}
              <CeldaDato
                c={c}
                icono="time-outline"
                label={t("reservas.returnTime", { defaultValue: "Hora de devolución" })}
                valor={formatHoraAmPm(reserva.horaDevolucion) || "—"}
              />
    
              {/* Lugar de retiro */}
              <CeldaDato
                c={c}
                icono="location-outline"
                label={puntoRetiro?.domicilio
                  ? t("reservas.homePickupLocation", { defaultValue: "Entrega a domicilio" })
                  : t("reservas.pickupLocation", { defaultValue: "Lugar de retiro" })}
                valor={puntoRetiro?.lugar || vehiculo?.sucursal || sucursalEfectivo || "Drivique Principal"}
              />
    
              {/* Lugar de devolución */}
              <CeldaDato
                c={c}
                icono="location-outline"
                label={puntoDevolucion?.domicilio
                  ? t("reservas.homeReturnLocation", { defaultValue: "Recogida a domicilio" })
                  : t("reservas.returnLocation", { defaultValue: "Lugar de devolución" })}
                valor={puntoDevolucion?.lugar || vehiculo?.sucursal || sucursalEfectivo || "Drivique Principal"}
              />
    
              {/* Medio de pago */}
              <CeldaDato
                c={c}
                icono="card-outline"
                label={t("reservas.paymentMethod", { defaultValue: "Medio de pago" })}
                valor={reserva.metodoPago === "efectivo" ? t("reserva.confirmacion.pagoEnSucursalCorto", { defaultValue: "Pago en sucursal" }) : "Pago Wompi"}
              />
    
              {/* Protección */}
              <CeldaDato
                c={c}
                icono="shield-checkmark-outline"
                label={t("reservas.protection", { defaultValue: "Protección" })}
                valor={reserva.proteccion || "Protección Básica Estándar"}
              />
    
              {/* Referencia */}
              <CeldaDato
                c={c}
                icono="receipt-outline"
                label={t("reserva.confirmacion.respuesta.referencia", { defaultValue: "Referencia" })}
                valor={reserva.referencia}
              />
    
              {/* Total */}
              <CeldaDato
                c={c}
                icono="cash-outline"
                label={t("reserva.confirmacion.respuesta.total", { defaultValue: "Total" })}
                valor={fmt(reserva.total)}
                esTotal={true}
              />
    
              {/* Estado */}
              <CeldaDato
                c={c}
                icono="checkmark-circle-outline"
                label={t("reservas.status", { defaultValue: "Estado" })}
                valor={tituloEstado}
                colorValor={color}
              />
            </View>
  )
}
