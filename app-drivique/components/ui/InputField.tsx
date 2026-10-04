import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { inputFieldStyles as styles } from './InputField.styles';

import { useTemaColores } from '@/modules/i18n/hooks/useLanguage';

interface ColoresTema {
  textSecondary: string;
  border: string;
  bgInput: string;
  textPrimary: string;
}

interface Props extends TextInputProps {
  label: string;
  error?: string;
  /** Opcional — si no se pasa, usa los colores dinámicos del tema actual. */
  colores?: ColoresTema;
  iconLeft?: React.ReactNode;
  pill?: boolean;
}

export function InputField({ label, error, placeholderTextColor, colores: cProp, iconLeft, pill, ...props }: Props) {
  const cTema = useTemaColores();
  const c = cProp || cTema;
  const colorPlaceholder = placeholderTextColor || (cTema.oscuro ? '#94A3B8' : '#9CA3AF');

  return (
    <View style={styles.contenedor}>
      <Text style={[styles.label, { color: c.textPrimary }]}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        { borderColor: c.border, backgroundColor: c.bgInput },
        error ? styles.inputErrorWrapper : undefined,
        pill ? styles.pillWrapper : undefined,
      ]}>
        {iconLeft && <View style={styles.iconContainer}>{iconLeft}</View>}
        <TextInput
          style={[
            styles.input,
            { color: c.textPrimary },
            iconLeft ? { paddingLeft: 8 } : undefined,
          ]}
          placeholderTextColor={colorPlaceholder}
          autoCorrect={false}
          {...props}
        />
      </View>
      {error ? <Text style={styles.textoError}>{error}</Text> : null}
    </View>
  );
}
