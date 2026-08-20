// modules/catalog/components/VehicleReviews.tsx
//
// Promedio de calificación + lista de reseñas con "Ver más" incremental.
// Visible para usuarios Y visitantes (sin ninguna restricción de sesión).

import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { Comentario } from "../types/catalog.types";

interface Props {
  comentarios: Comentario[];
}

const INCREMENTO_VER_MAS = 3;
const COLORES_AVATAR = ["#1D4ED8", "#059669", "#D97706", "#DB2777", "#7C3AED", "#0891B2"];

function Estrellas({ valor, tamano = 14 }: { valor: number; tamano?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Ionicons
          key={i}
          name={i < Math.round(valor) ? "star" : "star-outline"}
          size={tamano}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

function inicialesDe(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  return partes.slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("");
}

function colorAvatar(nombre: string): string {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash = (hash + nombre.charCodeAt(i)) % COLORES_AVATAR.length;
  return COLORES_AVATAR[hash];
}

export function VehicleReviews({ comentarios }: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const [visibles, setVisibles] = useState(INCREMENTO_VER_MAS);

  if (comentarios.length === 0) {
    return (
      <View style={[s.vacio, { backgroundColor: c.bgInput }]}>
        <Ionicons name="chatbubble-ellipses-outline" size={30} color={c.textMuted} />
        <Text style={[s.vacioTexto, { color: c.textMuted }]}>
          {t("vehiculo.resenas.sinResenas")}
        </Text>
      </View>
    );
  }

  const promedio =
    comentarios.reduce((suma, r) => suma + r.calificacion, 0) / comentarios.length;
  const mostrar = comentarios.slice(0, visibles);
  const hayMas = visibles < comentarios.length;
  const seExpandio = visibles > INCREMENTO_VER_MAS;

  return (
    <View>
      <View style={[s.resumenCard, { backgroundColor: c.oscuro ? "#3A2E0F" : "#FFFBEB", borderColor: c.oscuro ? "#5C4A1A" : "#FDE68A" }]}>
        <Text style={s.promedioNumero}>{promedio.toFixed(1)}</Text>
        <View>
          <Estrellas valor={promedio} tamano={16} />
          <Text style={[s.basadoEn, { color: c.textSecondary }]}>
            {t("vehiculo.resenas.basadoEn", { count: comentarios.length })}
          </Text>
        </View>
      </View>

      {mostrar.map((r, i) => (
        <View key={i} style={[s.comentario, { backgroundColor: c.bgInput }]}>
          <View style={[s.avatar, { backgroundColor: colorAvatar(r.autor) }]}>
            <Text style={s.avatarTexto}>{inicialesDe(r.autor)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={s.comentarioHeader}>
              <Text style={[s.autor, { color: c.textPrimary }]}>{r.autor}</Text>
              <Estrellas valor={r.calificacion} />
            </View>
            <Text style={[s.texto, { color: c.textSecondary }]}>{r.texto}</Text>
            <Text style={[s.fecha, { color: c.textMuted }]}>{r.fecha}</Text>
          </View>
        </View>
      ))}

      {hayMas ? (
        <TouchableOpacity
          style={s.verMasBtn}
          onPress={() => setVisibles((v) => v + INCREMENTO_VER_MAS)}
          activeOpacity={0.7}
        >
          <Text style={[s.verMasTexto, { color: c.primary }]}>{t("vehiculo.resenas.verMas")}</Text>
          <Ionicons name="chevron-down" size={14} color={c.primary} />
        </TouchableOpacity>
      ) : (
        seExpandio && (
          <TouchableOpacity style={s.verMasBtn} onPress={() => setVisibles(INCREMENTO_VER_MAS)} activeOpacity={0.7}>
            <Text style={[s.verMasTexto, { color: c.primary }]}>{t("vehiculo.resenas.verMenos")}</Text>
            <Ionicons name="chevron-up" size={14} color={c.primary} />
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

const s = StyleSheet.create({
  vacio: { alignItems: "center", paddingVertical: 24, gap: 8, borderRadius: 14 },
  vacioTexto: { fontSize: 13, textAlign: "center" },
  resumenCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  promedioNumero: { fontSize: 34, fontWeight: "900", color: "#B45309" },
  basadoEn: { fontSize: 12, marginTop: 3 },
  comentario: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: { color: "#FFFFFF", fontSize: 12.5, fontWeight: "800" },
  comentarioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  autor: { fontSize: 13.5, fontWeight: "700" },
  texto: { fontSize: 13, lineHeight: 19, marginBottom: 4 },
  fecha: { fontSize: 11 },
  verMasBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 12 },
  verMasTexto: { fontSize: 13, fontWeight: "700" },
});