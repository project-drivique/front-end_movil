import { View, TouchableOpacity, Text } from 'react-native'
import { styles } from '../catalog.styles'
import React from 'react'

export default function OrdenVisible({ ORDEN_OPCIONES, c, filtros, setFiltro, setOrdenVisible }: { ORDEN_OPCIONES: { valor: string; label: string; }[]; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; filtros: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").FiltrosCatalogoState; setFiltro: (campo: keyof import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").FiltrosCatalogoState, valor: string) => void; setOrdenVisible: React.Dispatch<React.SetStateAction<boolean>> }) {
  return (
    <View style={[styles.ordenDropdown, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            {ORDEN_OPCIONES.map((op) => (
              <TouchableOpacity
                key={op.valor}
                style={[
                  styles.ordenOpcion,
                  filtros.orden === op.valor && { backgroundColor: c.primaryBg },
                ]}
                onPress={() => {
                  setFiltro("orden", op.valor);
                  setOrdenVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.ordenOpcionText,
                    { color: c.textPrimary },
                    filtros.orden === op.valor && styles.ordenOpcionTextActiva,
                  ]}
                >
                  {op.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
  )
}
