import { StyleSheet } from "react-native";

export const screen3Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    alignItems: "center",
  },
  heroWrap: {
    marginBottom: 20,
    alignItems: "center",
  },
  heroCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  heroEmoji: {
    fontSize: 44,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  pasosWrap: {
    width: "100%",
    marginBottom: 24,
  },
  pasoRow: {
    flexDirection: "row",
    gap: 14,
  },
  pasoLeft: {
    alignItems: "center",
    width: 36,
  },
  pasoNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
  },
  pasoNumText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
  },
  pasoLinea: {
    width: 2,
    flex: 1,
    backgroundColor: "#DBEAFE",
    marginVertical: 4,
    minHeight: 20,
  },
  pasoCard: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pasoIcon: {
    fontSize: 26,
  },
  pasoTextos: {
    flex: 1,
  },
  pasoTitulo: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 3,
  },
  pasoDesc: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  statCell: {
    flex: 1,
    alignItems: "center",
  },
  statVal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1D4ED8",
    marginBottom: 2,
  },
  statLbl: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
});