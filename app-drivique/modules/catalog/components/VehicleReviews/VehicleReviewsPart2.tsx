import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Comentario } from '../../types/catalog.types'
import React from 'react'

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
function inicialesDe(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  return partes.slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("");
}
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

export default function VehicleReviewsPart2({ c, colorBorde, listaComentarios, setFotoModalUri, t, usuarioNombreActual, visibles }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; colorBorde: string; listaComentarios: (Comentario & { fotos?: string[]; })[]; setFotoModalUri: React.Dispatch<React.SetStateAction<string | null>>; t: any; usuarioNombreActual: string; visibles: number }) {
  return (
    <View style={s.listaComentarios}>
          {listaComentarios.slice(0, visibles).map((r, i) => (
            <View
              key={i}
              style={[
                s.comentarioItem,
                i > 0 && { borderTopWidth: 1, borderTopColor: colorBorde, paddingTop: 14 },
              ]}
            >
              {/* Avatar circular con iniciales */}
              <View style={[s.avatarWrap, { backgroundColor: c.oscuro ? "#334155" : "#F1F5F9" }]}>
                <Text style={[s.avatarTexto, { color: c.oscuro ? "#93C5FD" : "#1E3A8A" }]}>
                  {inicialesDe(r.autor)}
                </Text>
              </View>
  
              {/* Contenido de la reseña */}
              <View style={s.comentarioCuerpo}>
                <View style={s.comentarioHeaderRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[s.autorNombre, { color: c.oscuro ? "#F8FAFC" : "#0F172A" }]}>
                      {r.autor}
                    </Text>
                    {(Boolean(usuarioNombreActual && r.autor?.trim().toLowerCase() === usuarioNombreActual) || (r as any).esPropia) && (
                      <View style={{ backgroundColor: c.primaryBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: "700", color: c.primary }}>
                          {t("vehiculo.resenas.tuResena", { defaultValue: "Tu reseña" })}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Estrellas valor={r.calificacion} tamano={13} />
                </View>
  
                {!!r.fecha && (
                  <Text style={[s.fechaTexto, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
                    {r.fecha}
                  </Text>
                )}
  
                {!!r.texto && (
                  <Text style={[s.comentarioTexto, { color: c.oscuro ? "#F8FAFC" : "#0F172A" }]}>
                    {r.texto}
                  </Text>
                )}
  
                {/* Galería de fotos si la reseña tiene imágenes */}
                {r.fotos && r.fotos.length > 0 && (
                  <View style={s.fotosResenaFila}>
                    {r.fotos.map((fotoUri, fIdx) => (
                      <TouchableOpacity
                        key={fIdx}
                        activeOpacity={0.8}
                        onPress={() => setFotoModalUri(fotoUri)}
                        style={s.fotoResenaThumbWrap}
                      >
                        <Image source={{ uri: fotoUri }} style={s.fotoResenaThumb} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
  )
}
