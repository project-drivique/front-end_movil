import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 6,
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerTitulo: {
    fontSize: 16,
    fontWeight: "800",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  cardMaestra: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  vehiculoBanner: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  vehiculoBannerLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.88)",
  },
  vehiculoBannerNombre: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 3,
  },

  seccionCard: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  seccionHeaderFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seccionSubHeaderFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  seccionEditarTexto: {
    fontSize: 12,
    fontWeight: "700",
  },
  seccionTituloAzul: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  bloqueDato: {
    marginBottom: 2,
  },
  sublabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  valorPrincipal: {
    fontSize: 13.5,
    fontWeight: "800",
  },
  valorSecundario: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  valorUbicacion: {
    fontSize: 13.5,
    fontWeight: "800",
    marginTop: 6,
  },
  valorServicios: {
    fontSize: 12.5,
    fontWeight: "500",
  },

  listaServiciosExtras: {
    marginTop: 4,
    gap: 6,
  },
  filaServicioExtra: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filaServicioExtraIzq: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  puntoVina: {
    fontSize: 14,
    marginRight: 6,
    fontWeight: "800",
  },
  servicioExtraNombre: {
    fontSize: 13,
    fontWeight: "700",
  },
  servicioExtraDias: {
    fontSize: 11.5,
    fontWeight: "500",
  },
  servicioExtraPrecio: {
    fontSize: 13,
    fontWeight: "800",
  },

  divisorPunteado: {
    borderBottomWidth: 1,
    borderStyle: "dashed",
    marginVertical: 12,
  },
  divisorSolido: {
    height: 1,
  },
  divisorFino: {
    height: 1,
    marginVertical: 10,
  },

  desgloseTitulo: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginBottom: 14,
  },
  filaDesglose: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  filaDesgloseLabel: {
    fontSize: 12.5,
    fontWeight: "500",
  },
  filaDesgloseValor: {
    fontSize: 13,
    fontWeight: "800",
  },

  totalBoxCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 14,
  },
  totalFinalLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  totalFinalValor: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 4,
  },
  totalFinalSub: {
    fontSize: 11,
    marginTop: 4,
  },

  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cerrarBtnWrap: {
    borderRadius: 12,
    overflow: "hidden",
  },
  cerrarBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cerrarBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  avisoPuntualidadResumen: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  avisoPuntualidadResumenTexto: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "500",
  },
});
