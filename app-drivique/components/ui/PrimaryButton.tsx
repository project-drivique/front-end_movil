import { GRADIENTES, SOMBRA_BOTON_GRADIENTE } from '@/constants/gradients';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { primaryButtonStyles as styles } from './PrimaryButton.styles';

interface Props {
  titulo: string;
  onPress: () => void;
  cargando?: boolean;
  deshabilitado?: boolean;
  variante?: 'primario' | 'secundario' | 'texto';
}

export function PrimaryButton({
  titulo,
  onPress,
  cargando = false,
  deshabilitado = false,
  variante = 'primario',
}: Props) {
  const estaDeshabilitado = deshabilitado || cargando;

  const contenido = cargando ? (
    <ActivityIndicator
      size="small"
      color={variante === 'primario' ? '#FFFFFF' : '#1D4ED8'}
    />
  ) : (
    <Text
      style={[
        styles.texto,
        variante === 'secundario' && styles.textoSecundario,
        variante === 'texto' && styles.textoEnlace,
      ]}
    >
      {titulo}
    </Text>
  );

  // Botón principal (CTA) — azul gradiente de marca
  if (variante === 'primario') {
    return (
      <TouchableOpacity
        style={[
          styles.botonSombra,
          !estaDeshabilitado && SOMBRA_BOTON_GRADIENTE,
          estaDeshabilitado && styles.botonDeshabilitado,
        ]}
        onPress={onPress}
        disabled={estaDeshabilitado}
        activeOpacity={0.75}
      >
        <LinearGradient
          colors={GRADIENTES.boton.colors}
          start={GRADIENTES.boton.start}
          end={GRADIENTES.boton.end}
          style={styles.boton}
        >
          {contenido}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.boton,
        variante === 'secundario' && styles.botonSecundario,
        variante === 'texto' && styles.botonTexto,
        estaDeshabilitado && styles.botonDeshabilitado,
      ]}
      onPress={onPress}
      disabled={estaDeshabilitado}
      activeOpacity={0.75}
    >
      {contenido}
    </TouchableOpacity>
  );
}
