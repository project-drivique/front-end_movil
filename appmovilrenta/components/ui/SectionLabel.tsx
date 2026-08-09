import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  icono: keyof typeof Ionicons.glyphMap;
  texto: string;
  primaryBg: string;
  /** Opcional — para secciones con su propio color temático (ej. verde
   *  para tarifas, azul para seguros). Por defecto usa el azul de marca. */
  color?: string;
}

// Encabezado de sección liviano: ícono de color + texto — sin envolver los
// campos en una caja con borde (evita que los formularios se vean "muy
// blancos"/cargados; el color se usa en el encabezado, no en contenedores).
export function SectionLabel({ icono, texto, primaryBg, color = "#1D4ED8" }: Props) {
  return (
    <View style={s.row}>
      <View style={[s.iconWrap, { backgroundColor: primaryBg }]}>
        <Ionicons name={icono} size={13} color={color} />
      </View>
      <Text style={[s.texto, { color }]}>{texto}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  texto: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1D4ED8",
    letterSpacing: 1,
  },
});
