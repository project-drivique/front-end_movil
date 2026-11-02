import { View, TouchableOpacity, Text } from 'react-native'
import { styles } from './EditDatesLocationSection.styles'
import { LinearGradient } from 'expo-linear-gradient'
import { GRADIENTES } from '@/constants/gradients'

export default function EditDatesLocationSectionPart2({ c, handleGuardar, onCancelar, t }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; handleGuardar: () => void; onCancelar: () => void; t: any }) {
  return (
    <View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.bg }]}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("comun.cancelar", { defaultValue: "Cancelar" })}
            style={[
              styles.cancelarBtn,
              { borderColor: c.border, backgroundColor: c.oscuro ? c.bgCard : "#FFFFFF" },
            ]}
            onPress={onCancelar}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelarBtnTexto, { color: c.textPrimary }]}>
              {t("comun.cancelar", { defaultValue: "Cancelar" })}
            </Text>
          </TouchableOpacity>
  
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("reserva.edicion.guardarCambios", { defaultValue: "Guardar cambios" })} style={styles.guardarBtnWrap} onPress={handleGuardar} activeOpacity={0.85}>
            <LinearGradient
              colors={GRADIENTES.boton.colors}
              start={GRADIENTES.boton.start}
              end={GRADIENTES.boton.end}
              style={styles.guardarBtn}
            >
              <Text style={styles.guardarBtnTexto}>
                {t("reserva.edicion.guardarCambios", { defaultValue: "Guardar cambios" })}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
  )
}
