import { View, TouchableOpacity, Text } from 'react-native'
import { styles } from '../catalog.styles'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'

export default function CatalogPart2({ c, filtrosActivos, ordenLabel, ordenVisible, setFiltrosVisible, setOrdenVisible, t, vehiculosFiltrados }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; filtrosActivos: boolean; ordenLabel: string; ordenVisible: boolean; setFiltrosVisible: React.Dispatch<React.SetStateAction<boolean>>; setOrdenVisible: React.Dispatch<React.SetStateAction<boolean>>; t: any; vehiculosFiltrados: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Vehiculo[] }) {
  return (
    <View style={[styles.controlsBar, { backgroundColor: c.bgHeader, borderBottomColor: c.border }]}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("catalogo.filtrosBtn")}
            style={[styles.filtrosBtn, { backgroundColor: c.bgInput }, filtrosActivos && styles.filtrosBtnActivo]}
            onPress={() => setFiltrosVisible(true)}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons
                name="options-outline"
                size={16}
                color={filtrosActivos ? "#fff" : c.textSecondary}
              />
              <Text
                style={[
                  styles.filtrosBtnText,
                  { color: c.textSecondary },
                  filtrosActivos && styles.filtrosBtnTextActivo,
                ]}
              >
                {t("catalogo.filtrosBtn")}
              </Text>
            </View>
          </TouchableOpacity>
  
          <View style={styles.controlsRight}>
            <Text style={[styles.contadorText, { color: c.textSecondary }]}>
              {t("catalogo.vehiculosContador", { count: vehiculosFiltrados.length })}
            </Text>
            <TouchableOpacity accessibilityRole="button"
              style={[styles.ordenBtn, { backgroundColor: c.bgInput, borderColor: c.border }]}
              onPress={() => setOrdenVisible(!ordenVisible)}
            >
              <Text style={[styles.ordenBtnText, { color: c.textPrimary }]} numberOfLines={1}>
                {ordenLabel} ▼
              </Text>
            </TouchableOpacity>
          </View>
        </View>
  )
}
