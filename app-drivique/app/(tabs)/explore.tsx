import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { useTemaColores, useTranslation } from '@/modules/i18n/hooks/useLanguage';

// Pantalla temporal de exploración — se reemplaza en módulos siguientes
export default function ExplorarScreen() {
  const c = useTemaColores();
  const { t } = useTranslation();
  return (
    <ScrollView contentContainerStyle={[styles.contenedor, { backgroundColor: c.bg }]}>
      <Text style={[styles.titulo, { color: c.textPrimary }]}>🔍 {t("tabs.explorar", { defaultValue: "Explorar" })}</Text>
      <Text style={[styles.subtitulo, { color: c.textSecondary }]}>{t("explorar.proximamente", { defaultValue: "Próximamente: filtros avanzados y mapa de sucursales." })}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
