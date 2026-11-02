import { StyleSheet } from 'react-native'

export const localS = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  bannerIcono: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTextos: { flex: 1 },
  bannerTitulo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1D4ED8",
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 17,
  },
  guestCtaContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  guestBtnShadow: {
    borderRadius: 14,
    overflow: "hidden",
  },
  guestBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 10,
  },
  guestBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  guestLoginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  guestLoginText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
