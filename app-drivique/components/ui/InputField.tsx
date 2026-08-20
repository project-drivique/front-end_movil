import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { inputFieldStyles as styles } from './InputField.styles';

interface ColoresTema {
  textSecondary: string;
  border: string;
  bgInput: string;
  textPrimary: string;
}

interface Props extends TextInputProps {
  label: string;
  error?: string;
  /** Opcional — si no se pasa, usa los colores fijos de siempre (pensados
   *  para tema claro). Pásalo cuando el formulario deba respetar tema
   *  oscuro/claro (ver CompleteProfileForm.tsx). */
  colores?: ColoresTema;
}

export function InputField({ label, error, colores: c, ...props }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={[styles.label, c && { color: c.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          c && { borderColor: c.border, backgroundColor: c.bgInput, color: c.textPrimary },
          error ? styles.inputError : undefined,
        ]}
        placeholderTextColor="#9CA3AF"
        autoCorrect={false}
        {...props}
      />
      {error ? <Text style={styles.textoError}>{error}</Text> : null}
    </View>
  );
}
