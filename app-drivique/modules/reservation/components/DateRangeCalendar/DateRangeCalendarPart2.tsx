import { View, Text } from 'react-native'
import { styles } from './DateRangeCalendar.styles'
import { COLOR_MARCA } from '../../constants/reservation.constants'

const COLOR_DISPONIBLE = "#10B981";
const COLOR_RESERVADO = "#EF4444";
const COLOR_MANTENIMIENTO = "#64748B";

export default function DateRangeCalendarPart2({ c, t }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; t: any }) {
  return (
    <View style={styles.leyenda}>
          <View style={styles.leyendaItem}>
            <View style={[styles.dot, { backgroundColor: COLOR_DISPONIBLE }]} />
            <Text style={[styles.leyendaText, { color: c.textSecondary }]}>
              {t("reserva.fechasLugar.leyendaDisponible", { defaultValue: "Disponible" })}
            </Text>
          </View>
          <View style={styles.leyendaItem}>
            <View style={[styles.dot, { backgroundColor: COLOR_RESERVADO }]} />
            <Text style={[styles.leyendaText, { color: c.textSecondary }]}>
              {t("reserva.fechasLugar.leyendaReservado", { defaultValue: "Reservado" })}
            </Text>
          </View>
          <View style={styles.leyendaItem}>
            <View style={[styles.dot, { backgroundColor: COLOR_MANTENIMIENTO }]} />
            <Text style={[styles.leyendaText, { color: c.textSecondary }]}>
              {t("reserva.fechasLugar.leyendaMantenimiento", { defaultValue: "Mantenimiento" })}
            </Text>
          </View>
          <View style={styles.leyendaItem}>
            <View style={[styles.dot, { backgroundColor: COLOR_MARCA }]} />
            <Text style={[styles.leyendaText, { color: c.textSecondary }]}>
              {t("reserva.fechasLugar.leyendaSeleccionado", { defaultValue: "Seleccionado" })}
            </Text>
          </View>
        </View>
  )
}
