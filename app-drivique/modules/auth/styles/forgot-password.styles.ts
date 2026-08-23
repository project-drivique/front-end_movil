import { StyleSheet, Platform } from "react-native";

export const olvideStyles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Fondo gris muy claro para resaltar la tarjeta blanca
  },
  contenedor: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 48,
    alignItems: 'center', // Para centrar la tarjeta
    justifyContent: 'center',
  },
  // Botón volver estilo tarjeta
  botonVolver: {
    alignSelf: "flex-start",
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginBottom: 32,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  textoVolver: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },
  
  // Tarjeta principal
  tarjeta: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },

  // ── Encabezado ──────────────────────────────────────────────
  logoWrapper: {
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
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 32,
    lineHeight: 22,
    textAlign: "center",
  },
  formulario: {
    width: '100%',
  },

  // ── Reenvío ─────────────────────────────────────────────────
  contenedorReenvio: {
    marginTop: 24,
    alignItems: "center",
  },
  textoReenvio: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  botonReenvio: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
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
    marginTop: 8,
  },

  // ── Enlace inferior (Fuera de tarjeta) ─────────────────────
  contenedorRegistro: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoRegistroGris: {
    color: '#6B7280',
    fontSize: 14,
  },
  textoRegistroAzul: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '700',
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
});
