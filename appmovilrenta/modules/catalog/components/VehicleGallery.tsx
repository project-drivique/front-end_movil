// modules/catalog/components/VehicleGallery.tsx
//
// Foto principal + fila de miniaturas navegables (toca una miniatura para
// que pase a ser la foto principal). Página completa del vehículo — no es
// el carrusel deslizable de la tarjeta del catálogo.

import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";

interface Props {
  imagenes: string[];
  calificacion?: number;
}

const PADDING_FILA = 12;
const GAP_FILA = 10;
const MINIATURA_MIN = 64;
const MINIATURA_MAX = 110;

export function VehicleGallery({ imagenes, calificacion }: Props) {
  const c = useTemaColores();
  const { width: anchoPantalla } = useWindowDimensions();
  const [activa, setActiva] = useState(0);

  // Las miniaturas se agrandan para ocupar todo el ancho disponible cuando
  // hay pocas fotos (ej. 3 fotos = cuadros grandes); si hay muchas, se
  // limitan a un tamaño mínimo y la fila se vuelve deslizable.
  const anchoDisponible = anchoPantalla - PADDING_FILA * 2;
  const anchoIdeal = (anchoDisponible - GAP_FILA * (imagenes.length - 1)) / imagenes.length;
  const miniaturaSize = Math.max(MINIATURA_MIN, Math.min(MINIATURA_MAX, anchoIdeal));

  if (imagenes.length === 0) {
    return (
      <View style={[s.principal, s.principalVacio, { backgroundColor: c.bgInput }]}>
        <Ionicons name="car-outline" size={64} color={c.textMuted} />
      </View>
    );
  }

  return (
    <View>
      <View>
        <Image source={{ uri: imagenes[activa] }} style={s.principal} resizeMode="cover" />

        {!!calificacion && (
          <View style={s.badgeCalificacion}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={s.badgeCalificacionTexto}>{calificacion.toFixed(1)}</Text>
          </View>
        )}

        {imagenes.length > 1 && (
          <View style={s.contador}>
            <Text style={s.contadorTexto}>{activa + 1}/{imagenes.length}</Text>
          </View>
        )}
      </View>

      {imagenes.length > 1 && (
        <View style={[s.miniaturasContenedor, { backgroundColor: c.bgCard, borderTopColor: c.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[s.miniaturasFila, { minWidth: "100%" }]}
          >
            {imagenes.map((uri, i) => {
              const esActiva = i === activa;
              return (
                <TouchableOpacity key={i} onPress={() => setActiva(i)} activeOpacity={0.8}>
                  <Image
                    source={{ uri }}
                    style={[
                      s.miniatura,
                      {
                        width: miniaturaSize,
                        height: miniaturaSize,
                        borderColor: esActiva ? c.primary : "transparent",
                        opacity: esActiva ? 1 : 0.5,
                      },
                    ]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  principal: { width: "100%", height: 280 },
  principalVacio: { alignItems: "center", justifyContent: "center" },
  badgeCalificacion: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(17,24,39,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeCalificacionTexto: { color: "#FFFFFF", fontSize: 12.5, fontWeight: "800" },
  contador: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(17,24,39,0.65)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  contadorTexto: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  miniaturasContenedor: { borderTopWidth: 1 },
  miniaturasFila: { gap: GAP_FILA, padding: PADDING_FILA, justifyContent: "center" },
  miniatura: { borderRadius: 10, borderWidth: 2 },
});