import { StyleSheet } from 'react-native'
import { COLOR_MARCA } from '../../constants/reservation.constants'

export const styles = StyleSheet.create({
  seccionLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  cardHeaderFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    marginTop: 2,
  },
  cardHeaderTitulo: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    color: COLOR_MARCA,
    includeFontPadding: false,
    textAlignVertical: "center",
  },

  opcionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  opcionCardActiva: {
    borderWidth: 1.2,
  },

  escudosNivelRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
    marginBottom: 6,
  },
  planNombreGrande: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  planPrecioRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginTop: 4,
  },
  planPrecioValor: {
    fontSize: 19,
    fontWeight: "800",
  },
  planPrecioUnidad: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
    marginBottom: 2,
  },
  planDivisor: {
    height: 1,
    marginVertical: 14,
  },

  kmDescripcionTexto: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 6,
  },

  btnPlanNoSeleccionado: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
    marginTop: 12,
  },
  btnPlanNoSeleccionadoTexto: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  btnPlanSeleccionado: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 9,
    marginTop: 12,
  },
  btnPlanSeleccionadoTexto: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    marginLeft: 5,
  },

  kmFila: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 8,
  },
  kmOpcionCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginVertical: 4,
  },
  opcionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  opcionTitulo: { fontSize: 12.5, fontWeight: "700" },
  opcionTituloActiva: {},
  opcionDesc: { fontSize: 10.5, marginTop: 4 },
  opcionDescActiva: {},

  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  radioActivo: {},
  radioPunto: { width: 8, height: 8, borderRadius: 4 },

  beneficiosLista: { gap: 8, marginTop: 4 },
  beneficioFila: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  beneficioTexto: { flex: 1, fontSize: 12, lineHeight: 17 },
  beneficioTextoTachado: { textDecorationLine: "line-through" },

  servicioCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  servicioCardActiva: {
    borderWidth: 1.2,
  },
  servicioIzquierdaRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  servicioNombre: {
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  servicioPrecioRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  servicioPrecioValor: {
    fontSize: 12,
    fontWeight: "800",
  },
  servicioPrecioUnidad: {
    fontSize: 10,
    fontWeight: "500",
    marginLeft: 3,
    marginBottom: 1,
  },
  servicioPrecioGratis: {
    fontSize: 12,
    fontWeight: "800",
  },

  footerTotalTarjeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerTotalLabel: { fontSize: 12, fontWeight: "700" },
  footerTotalValor: { fontSize: 15, fontWeight: "800" },

  confirmarBtnWrap: {
    alignSelf: "center",
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  confirmarBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmarBtnText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
});
