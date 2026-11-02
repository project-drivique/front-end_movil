import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_ACENTO } from '@/constants/brandPalette'
import { COLOR_MARCA } from '@/modules/catalog/constants/catalog.constants'

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

export default function EnRevision({ c, sucursalEfectivo, t, vehiculo }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; sucursalEfectivo: string; t: any; vehiculo: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Vehiculo | undefined }) {
  return (
    <View
                style={[
                  s.tarjetaInformativa,
                  {
                    backgroundColor: c.oscuro ? "rgba(30, 58, 138, 0.25)" : "#EFF6FF",
                    borderColor: c.oscuro ? "#1E40AF" : "#BFDBFE",
                  },
                ]}
              >
                <View style={s.tarjetaInfoHead}>
                  <Ionicons name="shield-checkmark" size={24} color={c.oscuro ? COLOR_ACENTO : COLOR_MARCA} />
                  <Text style={[s.tarjetaInfoTitulo, { color: c.oscuro ? "#93C5FD" : "#1E3A8A" }]}>
                    {t("misReservas.detalle.enRevisionDocumentos", { defaultValue: "Documentación en Proceso de Validación" })}
                  </Text>
                </View>
                <Text style={[s.tarjetaInfoTexto, { color: c.oscuro ? "#DBEAFE" : "#1E3A8A" }]}>
                  {t("misReservas.detalle.enRevisionTexto", {
                    defaultValue: `Tus documentos de identidad y licencia de conducción están siendo revisados por el encargado de la sucursal ${vehiculo?.sucursal || sucursalEfectivo || "Drivique"}. En cuanto los documentos sean aprobados, tu reserva se confirmará automáticamente y se habilitará la firma digital del contrato.`,
                  })}
                </Text>
                <View
                  style={[
                    s.tarjetaInfoBadge,
                    {
                      backgroundColor: c.oscuro ? "rgba(30, 64, 175, 0.4)" : "#DBEAFE",
                    },
                  ]}
                >
                  <Ionicons name="time" size={14} color={c.oscuro ? "#93C5FD" : "#1E3A8A"} />
                  <Text style={[s.tarjetaInfoBadgeTexto, { color: c.oscuro ? "#93C5FD" : "#1E3A8A" }]}>
                    {t("reservas.docsEnRevisionEstado", { defaultValue: "Estado: En revisión por encargado de sucursal" })}
                  </Text>
                </View>
              </View>
  )
}
