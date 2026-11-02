import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from './DatesLocationForm.styles'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_MARCA } from '../../constants/reservation.constants'
import React from 'react'

export default function DatesLocationFormPart2({ c, fechasLugar, labelLugarDevolucion, labelLugarRetiro, setModalTipo, t }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; fechasLugar: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosFechasLugar; labelLugarDevolucion: string; labelLugarRetiro: string; setModalTipo: React.Dispatch<React.SetStateAction<'retiro' | 'devolucion' | null>>; t: any }) {
  return (
    <View style={styles.filaDosCols}>
          <View style={styles.columnaMedia}>
            <View style={styles.headerConIcono}>
              <Ionicons name="location" size={14} color={COLOR_MARCA} />
              <Text style={[styles.tituloHeaderConIcono, { color: COLOR_MARCA }]} numberOfLines={1}>
                {t("reserva.fechasLugar.lugarDeRetiro")}
              </Text>
            </View>
            <TouchableOpacity accessibilityRole="button"
              style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
              onPress={() => setModalTipo("retiro")}
              activeOpacity={0.8}
            >
              <View style={styles.selectValorRow}>
                <Text
                  style={[
                    styles.selectValue,
                    { color: fechasLugar.lugarRetiro ? c.textPrimary : c.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {labelLugarRetiro}
                </Text>
                <Ionicons name="chevron-down" size={14} color={c.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
  
          <View style={styles.columnaMedia}>
            <View style={styles.headerConIcono}>
              <Ionicons name="location" size={14} color={COLOR_MARCA} />
              <Text style={[styles.tituloHeaderConIcono, { color: COLOR_MARCA }]} numberOfLines={1}>
                {t("reserva.fechasLugar.lugarDeDevolucion")}
              </Text>
            </View>
            <TouchableOpacity accessibilityRole="button"
              style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
              onPress={() => setModalTipo("devolucion")}
              activeOpacity={0.8}
            >
              <View style={styles.selectValorRow}>
                <Text
                  style={[
                    styles.selectValue,
                    { color: fechasLugar.lugarDevolucion ? c.textPrimary : c.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {labelLugarDevolucion}
                </Text>
                <Ionicons name="chevron-down" size={14} color={c.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
  )
}
