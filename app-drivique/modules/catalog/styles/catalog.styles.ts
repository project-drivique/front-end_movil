import { Dimensions, Platform, StyleSheet } from "react-native";

const P = "#1D4ED8";
const { width } = Dimensions.get("window");
// Escala para pantallas pequeñas
const isSmall = width < 380;

export const catalogoStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9EDF8",
  },
  // Header
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  logo: {
    width: isSmall ? 100 : 120,
    height: isSmall ? 44 : 52,
  },
  // Búsqueda
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "android" ? 8 : 11,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontSize: isSmall ? 13 : 14,
    color: "#111827",
    padding: 0,
  },
  searchClear: {
    fontSize: 14,
    color: "#9CA3AF",
    paddingHorizontal: 4,
  },
  // Categorías
  catsRow: {
    maxHeight: 48,
    backgroundColor: "#FFFFFF",
  },
  catsContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    alignItems: "center",
  },
  catChip: {
    paddingHorizontal: isSmall ? 12 : 18,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  catChipActive: {
    backgroundColor: P,
    borderColor: P,
  },
  catChipText: {
    fontSize: isSmall ? 12 : 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  catChipTextActive: {
    color: "#FFFFFF",
  },
  // Contador
  contadorWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  contadorText: {
    fontSize: isSmall ? 11 : 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  // Lista
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 14,
  },
  // Tarjeta
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: isSmall ? 150 : 180,
    backgroundColor: "#F0F4FF",
  },
  cardBody: {
    padding: isSmall ? 10 : 14,
  },
  cardNombre: {
    fontSize: isSmall ? 15 : 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  cardSubtitulo: {
    fontSize: isSmall ? 12 : 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  cardChipsRow: {
    gap: 8,
    marginBottom: 10,
    paddingRight: 4,
  },
  cardChip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardChipText: {
    fontSize: isSmall ? 11 : 12,
    color: "#374151",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPrecioWrap: {
    flex: 1,
  },
  cardEstadoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  cardEstadoDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  cardEstadoText: {
    fontSize: isSmall ? 11 : 12,
    fontWeight: "600",
  },
  cardPrecio: {
    fontSize: isSmall ? 17 : 20,
    fontWeight: "800",
    color: P,
  },
  cardPrecioDia: {
    fontSize: isSmall ? 10 : 11,
    color: "#9CA3AF",
  },
  cardBtns: {
    gap: 6,
    alignItems: "flex-end",
  },
  btnReservar: {
    backgroundColor: P,
    paddingHorizontal: isSmall ? 14 : 18,
    paddingVertical: isSmall ? 8 : 10,
    borderRadius: 10,
  },
  btnReservarText: {
    fontSize: isSmall ? 12 : 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  btnReservarOff: {
    backgroundColor: "#9CA3AF",
  },
  btnDetalles: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  btnDetallesText: {
    fontSize: isSmall ? 11 : 12,
    fontWeight: "600",
    color: P,
    textDecorationLine: "underline",
  },
  // Empty state
  empty: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
    paddingBottom: 40,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: isSmall ? 16 : 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySub: {
    fontSize: isSmall ? 13 : 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: P,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});