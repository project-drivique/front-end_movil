// components/ui/OtpInput.tsx
//
// Casillas individuales para códigos de un solo uso (OTP) — avanza el foco
// automáticamente al escribir y retrocede con backspace en una casilla vacía.

import React, { useRef } from "react";
import { NativeSyntheticEvent, StyleSheet, TextInput, TextInputKeyPressEventData, View } from "react-native";

interface ColoresOtp {
  border: string;
  bgInput: string;
  textPrimary: string;
  primary: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  editable?: boolean;
  colores: ColoresOtp;
}

export function OtpInput({ value, onChange, length = 6, error, editable = true, colores: c }: Props) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const digitos = Array.from({ length }, (_, i) => value[i] ?? "");

  const handleChangeText = (texto: string, indice: number) => {
    const limpio = texto.replace(/[^0-9]/g, "");
    if (!limpio) {
      onChange(value.slice(0, indice) + value.slice(indice + 1));
      return;
    }
    const digito = limpio[limpio.length - 1];
    const siguiente = (value.slice(0, indice) + digito + value.slice(indice + 1)).slice(0, length);
    onChange(siguiente);
    if (indice < length - 1) inputs.current[indice + 1]?.focus();
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    indice: number,
  ) => {
    if (e.nativeEvent.key === "Backspace" && !digitos[indice] && indice > 0) {
      inputs.current[indice - 1]?.focus();
    }
  };

  return (
    <View style={s.fila}>
      {digitos.map((digito, i) => (
        <TextInput
          key={i}
          ref={(ref) => {
            inputs.current[i] = ref;
          }}
          style={[
            s.casilla,
            {
              borderColor: error ? "#EF4444" : digito ? c.primary : c.border,
              backgroundColor: c.bgInput,
              color: c.textPrimary,
            },
          ]}
          value={digito}
          onChangeText={(t) => handleChangeText(t, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          editable={editable}
          selectTextOnFocus
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  casilla: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: "700",
  },
});