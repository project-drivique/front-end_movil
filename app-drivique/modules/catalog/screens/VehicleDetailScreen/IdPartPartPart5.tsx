import { View, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { formatCurrency } from '@/utils/currencyUtils'

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

export default function IdPartPartPart5({ c, colorBorde, colorIconoHeader, colorTextoPrimario, colorTituloCard, monedaActual, t, tarifas, tasaUSD }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; colorBorde: string; colorIconoHeader: '#93C5FD' | '#1E3A8A'; colorTextoPrimario: '#F8FAFC' | '#0F172A'; colorTituloCard: '#93C5FD' | '#1E3A8A'; monedaActual: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/utils/currencyUtils").Moneda; t: any; tarifas: { kmLimitado?: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Tarifa; kmIlimitado?: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Tarifa; }; tasaUSD: number }) {
  return (
    <View style={[s.card, { backgroundColor: c.bgCard, borderColor: colorBorde }]}>
                  <View style={s.cardHeaderRow}>
                    <MaterialCommunityIcons name="road-variant" size={14} color={colorIconoHeader} />
                    <Text style={[s.cardHeaderTitulo, { color: colorTituloCard }]}>
                      {t("vehiculo.tarifas", { defaultValue: "Tarifas por kilometraje" })}
                    </Text>
                  </View>
      
                  <View style={[s.subCardInner, { borderColor: colorBorde, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}>
                    <View style={s.filaTarifa}>
                      <Text style={[s.filaTarifaLabel, { color: colorTextoPrimario }]}>
                        {t("catalogo.detalles.kmLimitado", { defaultValue: "Kilometraje limitado" })}
                      </Text>
                      <Text style={[s.filaTarifaPrecio, { color: tarifas.kmLimitado?.precio === 0 ? '#10b981' : colorTextoPrimario }]}>
                        {tarifas.kmLimitado?.precio === 0 ? (
                          t("vehiculo.includedInBaseRate", { defaultValue: "Incluido en la tarifa" }) + " (+$0)"
                        ) : (
                          <>
                            {formatCurrency(tarifas.kmLimitado?.precio ?? 60000, monedaActual, tasaUSD)}
                            {t("vehiculo.porDia", { defaultValue: "/día" }).startsWith("/")
                              ? t("vehiculo.porDia", { defaultValue: "/día" })
                              : ` /${t("vehiculo.porDia", { defaultValue: "día" })}`}
                          </>
                        )}
                      </Text>
                    </View>
                    <View style={[s.divisorFila, { backgroundColor: colorBorde }]} />
                    <View style={s.filaTarifa}>
                      <Text style={[s.filaTarifaLabel, { color: colorTextoPrimario }]}>
                        {t("catalogo.detalles.kmIlimitado", { defaultValue: "Kilometraje ilimitado" })}
                      </Text>
                      <Text style={[s.filaTarifaPrecio, { color: colorTextoPrimario }]}>
                        {formatCurrency(tarifas.kmIlimitado?.precio ?? 75000, monedaActual, tasaUSD)}
                        {t("vehiculo.porDia", { defaultValue: "/día" }).startsWith("/")
                          ? t("vehiculo.porDia", { defaultValue: "/día" })
                          : ` /${t("vehiculo.porDia", { defaultValue: "día" })}`}
                      </Text>
                    </View>
                  </View>
                </View>
  )
}
