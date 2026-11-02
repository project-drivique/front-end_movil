import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 6,
    paddingBottom: 10,
  },
  calendar: {
    borderRadius: 12,
  },
  arrowBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "#F1F5F9",
    marginTop: 6,
    marginBottom: 6,
  },
  leyenda: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginTop: 2,
    marginBottom: 2,
  },
  leyendaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 5.5, height: 5.5, borderRadius: 3 },
  leyendaText: { fontSize: 9.5, fontWeight: "500" },
});
