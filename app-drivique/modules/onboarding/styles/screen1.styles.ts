import { StyleSheet } from "react-native";
import { lazyStyles } from "@/utils/lazyStyles";
import { remapColor as mc } from "@/constants/brandColorMap";

const crear_screen1Styles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    alignItems: "center",
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 180,
    height: 90,
  },
  heroWrap: {
    position: "relative",
    alignItems: "center",
    marginBottom: 28,
  },
  heroCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: mc("#EFF6FF"),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: mc("#DBEAFE"),
  },
  heroLogo: {
    width: 140,
    height: 140,
  },
  heroBadge: {
    position: "absolute",
    top: 10,
    right: -8,
    backgroundColor: mc("#1D4ED8"),
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  textWrap: {
    alignItems: "center",
    paddingHorizontal: 8,
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: mc("#1D4ED8"),
    textAlign: "center",
    marginBottom: 6,
  },
  body: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: mc("#EFF6FF"),
    borderRadius: 16,
    padding: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: mc("#DBEAFE"),
  },
  statCell: {
    flex: 1,
    alignItems: "center",
  },
  statVal: {
    fontSize: 18,
    fontWeight: "800",
    color: mc("#1D4ED8"),
    marginBottom: 2,
  },
  statLbl: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  selectorWrap: {
  width: "100%",
  marginTop: 16,
},
titleAccent: {
  color: mc("#1D4ED8"),
  fontWeight: "800",
},
});
export const screen1Styles = lazyStyles(crear_screen1Styles);