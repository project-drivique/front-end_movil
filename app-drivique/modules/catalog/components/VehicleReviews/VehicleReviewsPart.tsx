import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const s = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  tituloPrincipal: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 16,
  },
  resumenContenedor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 8,
  },
  columnaPuntaje: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  puntajeGrande: {
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
    marginBottom: 2,
  },
  conteoTexto: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "400",
  },
  columnaBarras: {
    flex: 1,
    gap: 4,
  },
  filaBarra: {
    flexDirection: "row",
    alignItems: "center",
  },
  barraEstrellaNum: {
    fontSize: 11,
    fontWeight: "700",
    width: 10,
    textAlign: "right",
    marginRight: 2,
  },
  barraTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 8,
  },
  barraFill: {
    height: "100%",
    borderRadius: 3,
  },
  barraConteoNum: {
    fontSize: 11,
    fontWeight: "400",
    width: 14,
    textAlign: "right",
  },
  divisor: {
    height: 1,
    width: "100%",
    marginVertical: 14,
  },
  cardVacio: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  vacioTitulo: {
    fontSize: 14.5,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  vacioSubtitulo: {
    fontSize: 12.5,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 18,
  },
  listaComentarios: {
    gap: 14,
  },
  comentarioItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: {
    fontSize: 12.5,
    fontWeight: "800",
  },
  comentarioCuerpo: {
    flex: 1,
  },
  comentarioHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  autorNombre: {
    fontSize: 13,
    fontWeight: "600",
  },
  fechaTexto: {
    fontSize: 11,
    fontWeight: "400",
    marginBottom: 4,
  },
  comentarioTexto: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
  },
  fotosResenaFila: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  fotoResenaThumbWrap: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  fotoResenaThumb: {
    width: "100%",
    height: "100%",
  },
  verMasBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
  },
  verMasTexto: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  modalFotoOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalFotoContenedor: {
    width: "100%",
    height: "80%",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  modalFotoImg: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  modalFotoCerrarBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
});
function Estrellas({ valor, tamano = 14 }: { valor: number; tamano?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => {
        const lleno = i < Math.round(valor);
        return (
          <Ionicons
            key={i}
            name={lleno ? "star" : "star-outline"}
            size={tamano}
            color={lleno ? "#F59E0B" : "#CBD5E1"}
          />
        );
      })}
    </View>
  );
}

export default function VehicleReviewsPart({ c, colorScore, counts, promedio, t, total }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; colorScore: '#93C5FD' | '#1E3A8A'; counts: { estrella: number; count: number; }[]; promedio: number; t: any; total: number }) {
  return (
    <View style={s.resumenContenedor}>
          {/* Columna Izquierda: Número grande + Estrellas + Total */}
          <View style={s.columnaPuntaje}>
            <Text style={[s.puntajeGrande, { color: colorScore }]}>{promedio.toFixed(1)}</Text>
            <Estrellas valor={promedio} tamano={15} />
            <Text style={[s.conteoTexto, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
              {total} {total === 1 ? t("extra.comun.resena") : t("extra.comun.resenas")}
            </Text>
          </View>
  
          {/* Columna Derecha: Barras de 5 a 1 estrella */}
          <View style={s.columnaBarras}>
            {counts.map(({ estrella, count }) => {
              const porcentaje = total > 0 ? (count / total) * 100 : 0;
              return (
                <View key={estrella} style={s.filaBarra}>
                  <Text style={[s.barraEstrellaNum, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
                    {estrella}
                  </Text>
                  <Ionicons name="star" size={11} color="#F59E0B" style={{ marginRight: 6 }} />
                  <View style={[s.barraTrack, { backgroundColor: c.oscuro ? "#334155" : "#EEF2F6" }]}>
                    <View
                      style={[
                        s.barraFill,
                        {
                          width: `${porcentaje}%`,
                          backgroundColor: porcentaje > 0 ? "#2563EB" : "transparent",
                        },
                      ]}
                    />
                  </View>
                  <Text style={[s.barraConteoNum, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
                    {count}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
  )
}
