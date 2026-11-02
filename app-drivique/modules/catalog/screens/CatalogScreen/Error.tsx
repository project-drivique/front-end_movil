import { FlatList, View, Text, TouchableOpacity } from 'react-native'
import VehiculoCard from '@/modules/catalog/components/VehicleCard'
import { styles } from '../catalog.styles'
import { Ionicons } from '@expo/vector-icons'
import { useTemaColores } from '@/modules/i18n/hooks/useLanguage'
import { useTranslation } from 'react-i18next'
import React from 'react'
import type { AlertTipo } from '../../../../app/(tabs)/catalog'

function ListFooter({
  paginaActual,
  totalPaginas,
  onAnterior,
  onSiguiente,
  c,
}: {
  paginaActual: number;
  totalPaginas: number;
  onAnterior: () => void;
  onSiguiente: () => void;
  c: ReturnType<typeof useTemaColores>;
}) {
  const { t } = useTranslation();
  if (totalPaginas <= 1) return null;
  return (
    <View style={styles.paginacionContainer}>
      <TouchableOpacity
        style={[
          styles.paginaBtn,
          paginaActual === 1 && [styles.paginaBtnDisabled, { backgroundColor: c.bgInput }],
        ]}
        onPress={onAnterior}
        disabled={paginaActual === 1}
        activeOpacity={0.7}
      >
        <Ionicons
          name="arrow-back"
          size={16}
          color={paginaActual === 1 ? c.textMuted : "#1E40AF"}
        />
        <Text
          style={[
            styles.paginaBtnText,
            paginaActual === 1 && [styles.paginaBtnTextDisabled, { color: c.textMuted }],
          ]}
        >
          {t("catalogo.anterior")}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.paginaInfoTexto, { color: c.textSecondary }]}>
        {paginaActual} / {totalPaginas}
      </Text>

      <TouchableOpacity
        style={[
          styles.paginaBtn,
          paginaActual === totalPaginas && [styles.paginaBtnDisabled, { backgroundColor: c.bgInput }],
        ]}
        onPress={onSiguiente}
        disabled={paginaActual === totalPaginas}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.paginaBtnText,
            paginaActual === totalPaginas && [styles.paginaBtnTextDisabled, { color: c.textMuted }],
          ]}
        >
          {t("catalogo.siguiente")}
        </Text>
        <Ionicons
          name="arrow-forward"
          size={16}
          color={paginaActual === totalPaginas ? c.textMuted : "#1E40AF"}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function Error({ abrirSweetAlert, c, datosPrecargaReserva, esFavorito, favoritos, filtrosActivos, flatListRef, handleLimpiarFiltros, paginaActual, paginaAnterior, paginaSiguiente, soloFavoritos, t, toggleFavorito, totalPaginas, usuario, vehiculosAMostrar }: { abrirSweetAlert: (tipo: AlertTipo) => void; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; datosPrecargaReserva: { lugarRetiro: string; fechaRetiro: string; fechaDevolucion: string; } | undefined; esFavorito: (vehiculoId: string | number) => boolean; favoritos: string[]; filtrosActivos: boolean; flatListRef: React.RefObject<FlatList<any> | null>; handleLimpiarFiltros: () => void; paginaActual: number; paginaAnterior: () => void; paginaSiguiente: () => void; soloFavoritos: boolean; t: any; toggleFavorito: (vehiculoId: string | number) => Promise<void>; totalPaginas: number; usuario: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/store/authStore").Usuario | null; vehiculosAMostrar: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Vehiculo[] }) {
  return (
    <FlatList
            ref={flatListRef}
            data={vehiculosAMostrar}
            keyExtractor={(item) => item.id.toString()}
            extraData={[paginaActual, favoritos, soloFavoritos]}
            renderItem={({ item }) => (
              <VehiculoCard
                vehiculo={item as any}
                invitado={!usuario}
                esFavorito={esFavorito(item.id)}
                onAccionRestringida={!usuario ? abrirSweetAlert : undefined}
                onToggleFavorito={usuario ? () => toggleFavorito((item as any).uuid ?? item.id) : undefined}
                datosPrecarga={datosPrecargaReserva}
              />
            )}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              soloFavoritos && favoritos.length === 0 ? (
                <View style={styles.estadoCentro}>
                  <Ionicons name="heart-outline" size={48} color={c.textMuted} />
                  <Text style={[styles.emptyText, { color: c.textMuted }]}>
                    {t("catalogo.sinFavoritosGuardados")}
                  </Text>
                </View>
              ) : (
                <View style={styles.estadoCentro}>
                  <Ionicons name="car-outline" size={48} color={c.textMuted} />
                  <Text style={[styles.emptyText, { color: c.textMuted }]}>
                    {t("catalogo.sinResultadosFiltros")}
                  </Text>
                  {filtrosActivos && (
                    <TouchableOpacity style={styles.limpiarFiltrosBtn} onPress={handleLimpiarFiltros}>
                      <Text style={styles.limpiarFiltrosBtnText}>{t("catalogo.limpiarFiltros")}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )
            }
            ListFooterComponent={() => (
              <ListFooter
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                onAnterior={paginaAnterior}
                onSiguiente={paginaSiguiente}
                c={c}
              />
            )}
          />
  )
}
