import { View, Text } from 'react-native'
import { styles } from './DatesLocationForm.styles'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_MARCA } from '../../constants/reservation.constants'

export default function DatesLocationFormPart3({ c, fechasLugar, t }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; fechasLugar: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosFechasLugar; t: any }) {
  return (
    <View style={[styles.filaDosCols, { marginTop: 14, marginBottom: 0 }]}>
          <View style={styles.columnaMedia}>
            <View style={styles.headerConIcono}>
              <Ionicons name="calendar" size={14} color={COLOR_MARCA} />
              <Text style={[styles.tituloHeaderConIcono, { color: COLOR_MARCA }]} numberOfLines={1}>
                {t("reserva.fechasLugar.fechaDeRetiro", { defaultValue: "Fecha de retiro" })}
              </Text>
            </View>
            <View style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}>
              <Text
                style={[
                  styles.selectValue,
                  { color: fechasLugar.fechaRetiro ? c.textPrimary : c.textMuted },
                ]}
                numberOfLines={1}
              >
                {fechasLugar.fechaRetiro || t("reserva.fechasLugar.seleccionar", { defaultValue: "Seleccionar" })}
              </Text>
            </View>
          </View>
  
          <View style={styles.columnaMedia}>
            <View style={styles.headerConIcono}>
              <Ionicons name="calendar" size={14} color={COLOR_MARCA} />
              <Text style={[styles.tituloHeaderConIcono, { color: COLOR_MARCA }]} numberOfLines={1}>
                {t("reserva.fechasLugar.fechaDeDevolucion", { defaultValue: "Fecha de devolución" })}
              </Text>
            </View>
            <View style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}>
              <Text
                style={[
                  styles.selectValue,
                  { color: fechasLugar.fechaDevolucion ? c.textPrimary : c.textMuted },
                ]}
                numberOfLines={1}
              >
                {fechasLugar.fechaDevolucion || t("reserva.fechasLugar.seleccionar", { defaultValue: "Seleccionar" })}
              </Text>
            </View>
          </View>
        </View>
  )
}
