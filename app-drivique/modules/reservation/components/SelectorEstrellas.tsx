// modules/reservation/components/SelectorEstrellas.tsx
//
// Versión interactiva del componente "Estrellas" de solo lectura que ya
// existe en modules/catalog/components/VehicleReviews.tsx — mismo
// lenguaje visual (Ionicons star/star-outline, color #F59E0B), pero
// tocable para que el usuario elija su calificación (1 a 5).
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLOR_ESTRELLA = "#F59E0B";

interface Props {
  valor: number;
  onCambiar: (valor: number) => void;
  tamano?: number;
}

export function SelectorEstrellas({ valor, onCambiar, tamano = 32 }: Props) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {Array.from({ length: 5 }, (_, i) => {
        const posicion = i + 1;
        return (
          <TouchableOpacity
            key={posicion}
            onPress={() => onCambiar(posicion)}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={posicion <= valor ? "star" : "star-outline"}
              size={tamano}
              color={COLOR_ESTRELLA}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
