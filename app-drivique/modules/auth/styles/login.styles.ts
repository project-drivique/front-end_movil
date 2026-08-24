import { StyleSheet } from "react-native";

export const loginStyles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContenedor: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingBottom: 40,
  },

  // ── Header (azul gradiente) ──────────────────────────────────────
  header: {
    position: "relative",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
  },
  invitadoBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 1,
  },
  invitadoBtnTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  marcaWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  marca: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  marcaTagline: {
    fontSize: 10,
    color: "#93A5D1",
    letterSpacing: 1.1,
    marginTop: 2,
    textTransform: "uppercase",
  },

  // ── Switch de pestañas ─────────────────────────────────────────
  tabsWrapper: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 999,
    alignItems: "center",
  },
  tabBtnActivo: {
    backgroundColor: "#FFFFFF",
  },
  tabBtnTexto: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B9C4E8",
  },
  tabBtnTextoActivo: {
    color: "#1E3A8A",
  },

  // ── Cuerpo (donde flota la card) ───────────────────────────────
  cuerpo: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 24,
  },

  // ── Wrapper que permite al logo "salirse" de la card ────────────
  cardWrapper: {
    position: "relative",
  },

  // ── Logo circular a caballo entre header y card ─────────────────
  logoBadge: {
    position: "absolute",
    top: -34,
    right: 24,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoBadgeImg: {
    width: 42,
    height: 42,
    resizeMode: "contain",
  },

  // ── Card blanca flotante ────────────────────────────────────────
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  encabezado: {
    alignItems: "center",
    marginBottom: 22,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Formulario ───────────────────────────────────────────────
  formulario: {
    gap: 6,
  },
  enlaceOlvide: {
    alignSelf: "flex-end",
    marginTop: 2,
    paddingVertical: 4,
  },
  textoEnlace: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // ── Acciones ─────────────────────────────────────────────────
  acciones: {
    marginTop: 20,
  },
  hintBloqueado: {
    fontSize: 12,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },

  // ── Pestaña "Bienvenida" ─────────────────────────────────────────
  accesosRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
    marginBottom: 22,
  },
  accesoBtn: {
    flex: 1,
    backgroundColor: "#1E3A8A",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
  accesoBtnTexto: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  beneficiosCol: {
    alignItems: "center",
    gap: 10,
  },
  beneficioTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  // ── Footer copyright ───────────────────────────────────────────
  footer: {
    backgroundColor: "#F9FAFB",
    paddingTop: 14,
    paddingBottom: 28,
    alignItems: "center",
  },
  footerTexto: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },
  
  // ── Toast ──────────────────────────────────────────────────────
  toastContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // ── Bienvenida (Diseño Blanco) ──────────────────────────────────
  cardBienvenida: {
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  logoWrapperBienvenida: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 32, // Increased spacing
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4,
    elevation: 2,
  },
  logoBienvenida: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  subtituloBienvenida: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    lineHeight: 22,
  },
  accesoBtnBienvenida: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accesoBtnTextoBienvenida: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#1E3A8A",
    textAlign: "center",
  },
  dividerBienvenida: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 24,
  },
  beneficiosColBienvenida: {
    gap: 16,
    paddingLeft: 8,
  },
  beneficioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  beneficioTextoBienvenida: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  registroRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registroTexto: {
    fontSize: 13.5,
    color: "#6B7280",
  },
  registroLink: {
    fontSize: 13.5,
    color: "#1D4ED8",
    fontWeight: "700",
  },
});