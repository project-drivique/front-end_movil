import { Platform, StyleSheet } from "react-native";

export const verificarCorreoStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contenedor: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 32 : 16,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Logo ────────────────────────────────────────────────────
  logoWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 130,
    height: 40,
    resizeMode: "contain",
  },

  // ── Card ────────────────────────────────────────────────────
  cardWrap: {
    width: "100%",
    maxWidth: 380,
  },
  barraSuperior: {
    height: 5,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  card: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  iconoWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  titulo: {
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 13.5,
    textAlign: "center",
    lineHeight: 19,
  },
  correo: {
    fontSize: 14.5,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 24,
  },

  // ── Botones / enlaces ───────────────────────────────────────
  botonWrap: {
    width: "100%",
  },
  volverRegistro: {
    marginTop: 18,
    paddingVertical: 4,
  },
  volverRegistroTexto: {
    fontSize: 13,
    fontWeight: "600",
  },

  // ── Paso 2: OTP + temporizador ──────────────────────────────
  otpWrap: {
    width: "100%",
    marginBottom: 18,
  },
  errorTexto: {
    fontSize: 12.5,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
  },
  temporizador: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 22,
  },
  temporizadorExpirado: {
    color: "#EF4444",
    fontWeight: "700",
  },
  divisor: {
    height: 1,
    width: "100%",
    marginTop: 22,
    marginBottom: 16,
  },
  filaInferior: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  filaInferiorTexto: {
    fontSize: 12.5,
    fontWeight: "600",
  },
});