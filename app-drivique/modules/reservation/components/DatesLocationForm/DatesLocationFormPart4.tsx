import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from './DatesLocationForm.styles'
import { Ionicons } from '@expo/vector-icons'
import { formatHoraAmPm } from '../../constants/reservation.constants'
import React from 'react'

export default function DatesLocationFormPart4({ c, fechasLugar, handleAbrirHoraDevolucion, primaryAccent, setHoraVisible, t }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; fechasLugar: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosFechasLugar; handleAbrirHoraDevolucion: () => void; primaryAccent: string; setHoraVisible: React.Dispatch<React.SetStateAction<'retiro' | 'devolucion' | null>>; t: any }) {
  return (
    <View style={[styles.filaDosCols, { marginTop: 12, marginBottom: 0 }]}>
          <View style={styles.columnaMedia}>
            <View style={styles.headerConIcono}>
              <Ionicons name="time" size={14} color={primaryAccent} />
              <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
                {t("vehiculo.selectPickupTime", { defaultValue: "Selecciona Hora de Retiro" })}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
              onPress={() => setHoraVisible("retiro")}
              activeOpacity={0.8}
            >
              <View style={styles.selectValorRow}>
                <Text
                  style={[
                    styles.selectValue,
                    { color: fechasLugar.horaRetiro ? c.textPrimary : c.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {fechasLugar.horaRetiro
                    ? formatHoraAmPm(fechasLugar.horaRetiro)
                    : t("reserva.fechasLugar.seleccionarHora", { defaultValue: "Seleccionar" })}
                </Text>
                <Ionicons name="chevron-down" size={14} color={c.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
  
          <View style={styles.columnaMedia}>
            <View style={styles.headerConIcono}>
              <Ionicons name="time" size={14} color={primaryAccent} />
              <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
                {t("vehiculo.selectReturnTime", { defaultValue: "Selecciona Hora de Devolución" })}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
              onPress={handleAbrirHoraDevolucion}
              activeOpacity={0.8}
            >
              <View style={styles.selectValorRow}>
                <Text
                  style={[
                    styles.selectValue,
                    { color: fechasLugar.horaDevolucion ? c.textPrimary : c.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {fechasLugar.horaDevolucion
                    ? formatHoraAmPm(fechasLugar.horaDevolucion)
                    : t("reserva.fechasLugar.seleccionarHora", { defaultValue: "Seleccionar" })}
                </Text>
                <Ionicons name="chevron-down" size={14} color={c.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
  )
}
