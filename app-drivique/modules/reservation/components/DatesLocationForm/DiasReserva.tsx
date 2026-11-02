import { View, Text } from 'react-native'
import { styles } from './DatesLocationForm.styles'
import { Ionicons } from '@expo/vector-icons'

export default function DiasReserva({ c, devolucionAnticipadaText, diasReserva, primaryAccent, t }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; devolucionAnticipadaText: string; diasReserva: number; primaryAccent: string; t: any }) {
  return (
    <View style={{ gap: 8, marginTop: 12 }}>
            {/* Fila 1: Duración del alquiler */}
            <View
              style={[
                styles.summaryRowCard,
                {
                  backgroundColor: c.oscuro ? "rgba(47, 78, 162, 0.12)" : "rgba(47, 78, 162, 0.05)",
                  borderColor: c.oscuro ? "rgba(47, 78, 162, 0.3)" : "rgba(47, 78, 162, 0.15)",
                },
              ]}
            >
              <View style={styles.summaryRowLeft}>
                <Ionicons name="hourglass-outline" size={15} color={c.textSecondary} />
                <Text style={[styles.summaryRowLabel, { color: c.textSecondary }]}>
                  {t("vehiculo.rentalDuration", { defaultValue: "Duración del alquiler" })}
                </Text>
              </View>
              <Text style={[styles.summaryRowValue, { color: primaryAccent }]}>
                {diasReserva} {diasReserva === 1 ? t("vehiculo.day", { defaultValue: "día" }) : t("vehiculo.days", { defaultValue: "días" })}
              </Text>
            </View>
  
            {/* Fila 2: Devolución anticipada (solo si minutosDevolucion < minutosRetiro) */}
            {!!devolucionAnticipadaText && (
              <View
                style={[
                  styles.summaryRowCard,
                  {
                    backgroundColor: c.oscuro ? "rgba(47, 78, 162, 0.12)" : "rgba(47, 78, 162, 0.05)",
                    borderColor: c.oscuro ? "rgba(47, 78, 162, 0.3)" : "rgba(47, 78, 162, 0.15)",
                  },
                ]}
              >
                <View style={styles.summaryRowLeft}>
                  <Ionicons name="time-outline" size={15} color={c.textSecondary} />
                  <Text style={[styles.summaryRowLabel, { color: c.textSecondary }]}>
                    {t("vehiculo.earlyReturn", { defaultValue: "Devolución anticipada" })}
                  </Text>
                </View>
                <Text style={[styles.summaryRowValue, { color: primaryAccent }]}>
                  {devolucionAnticipadaText}
                </Text>
              </View>
            )}
          </View>
  )
}
