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

  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },

  // ── Card ────────────────────────────────────────────────────
  cardWrap: {
    width: "100%",
    maxWidth: 380,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  iconoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
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