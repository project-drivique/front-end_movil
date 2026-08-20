import { StyleSheet } from "react-native";

export const olvideStyles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contenedor: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 48,
  },
  botonVolver: {
    alignSelf: "flex-start",
    marginBottom: 32,
    paddingVertical: 4,
  },
  textoVolver: {
    color: "#1D4ED8",
    fontSize: 15,
    fontWeight: "600",
  },

  // ── Encabezado ──────────────────────────────────────────────
  encabezado: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logo: {
    width: 65,
    height: 65,
    resizeMode: "contain",
  },
  titulo: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 32,
    lineHeight: 22,
    textAlign: "center",
  },

  // ── Reenvío ─────────────────────────────────────────────────
  contenedorReenvio: {
    marginTop: 16,
    alignItems: "center",
  },
  textoReenvio: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  botonReenvio: {
    marginTop: 6,
    paddingVertical: 4,
  },
  textoBotonReenvio: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  textoContador: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
  },

  // ── Pantalla de éxito ────────────────────────────────────────
  contenedorExito: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingVertical: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  iconoExito: {
    fontSize: 64,
    marginBottom: 20,
  },
  tituloExito: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  mensajeExito: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  enlaceRegistro: {
    marginTop: 12,
    paddingVertical: 4,
  },
  textoEnlaceRegistro: {
    color: "#1D4ED8",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
