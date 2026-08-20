import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTemaColores } from '@/modules/i18n/hooks/useLanguage';

export default function ModalScreen() {
  const c = useTemaColores();
  return (
    <View style={[styles.contenedor, { backgroundColor: c.bg }]}>
      <Text style={[styles.texto, { color: c.textPrimary }]}>Modal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    fontSize: 18,
  },
});
