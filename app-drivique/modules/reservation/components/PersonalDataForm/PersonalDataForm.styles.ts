import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  cardPadre: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardForm: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  cardHeaderFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 4,
  },
  cardHeaderTitulo: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  cardSubtitulo: {
    fontSize: 12.5,
    fontWeight: "400",
    lineHeight: 17.5,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  campo: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    fontWeight: "400",
  },
  filaCelular: {
    flexDirection: "row",
    gap: 8,
  },
  prefijoBox: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 50,
  },
  prefijoText: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  inputCelular: {
    flex: 1,
  },
  bannerAviso: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  bannerAvisoTexto: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "500",
  },
});
