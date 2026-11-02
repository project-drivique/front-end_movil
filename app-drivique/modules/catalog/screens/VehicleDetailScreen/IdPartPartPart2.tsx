import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

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

export default function IdPartPartPart2({ c, colorAzulAccion, colorBorde, colorIconoHeader, colorTextoSecundario, colorTituloCard, handleOpenPicoYPlaca, t }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; colorAzulAccion: '#93C5FD' | '#1E3A8A'; colorBorde: string; colorIconoHeader: '#93C5FD' | '#1E3A8A'; colorTextoSecundario: '#94A3B8' | '#64748B'; colorTituloCard: '#93C5FD' | '#1E3A8A'; handleOpenPicoYPlaca: () => void; t: any }) {
  return (
    <View style={[s.card, { backgroundColor: c.bgCard, borderColor: colorBorde }]}>
                  <View style={s.cardHeaderRow}>
                    <MaterialIcons name="directions-car" size={14} color={colorIconoHeader} />
                    <Text style={[s.cardHeaderTitulo, { color: colorTituloCard }]}>
                      {t("reserva.flujo.consultarPicoYPlaca", { defaultValue: "Consultar Pico y Placa" })}
                    </Text>
                  </View>
      
                  <Text style={[s.parrafoTexto, { color: colorTextoSecundario, marginBottom: 14 }]}>
                    {t(
                      "reserva.flujo.picoYPlacaDesc",
                      {
                        defaultValue:
                          "Consulta la restricción de movilidad oficial para planificar tu ruta y evitar contratiempos durante tu viaje.",
                      }
                    )}
                  </Text>
      
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("reserva.flujo.irALaPagina", { defaultValue: "Ir a la página" })}
                    style={[s.btnAccion, { borderColor: colorAzulAccion }]}
                    onPress={handleOpenPicoYPlaca}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="open-in-new" size={16} color={colorAzulAccion} />
                    <Text style={[s.btnAccionTexto, { color: colorAzulAccion }]}>
                      {t("reserva.flujo.irALaPagina", { defaultValue: "Ir a la página" })}
                    </Text>
                  </TouchableOpacity>
                </View>
  )
}
