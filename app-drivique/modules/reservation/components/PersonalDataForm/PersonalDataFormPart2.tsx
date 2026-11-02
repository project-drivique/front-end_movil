import { View, Text } from 'react-native'
import { styles } from './PersonalDataForm.styles'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_ACENTO, COLOR_ENLACE_OSCURO } from '@/constants/brandPalette'

export default function PersonalDataFormPart2({ c, t }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; t: any }) {
  return (
    <View
                style={[
                  styles.bannerAviso,
                  {
                    backgroundColor: c.oscuro ? "rgba(30, 64, 175, 0.15)" : "#EFF6FF",
                    borderColor: c.oscuro ? "#1E40AF" : "#BFDBFE",
                  },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={c.oscuro ? COLOR_ACENTO : COLOR_ENLACE_OSCURO}
                  style={{ marginTop: 1 }}
                />
                <Text
                  style={[
                    styles.bannerAvisoTexto,
                    {
                      color: c.oscuro ? "#93C5FD" : "#1E40AF",
                    },
                  ]}
                >
                  {t("reserva.datosPersonales.avisoGuardado", {
                    defaultValue: "Al confirmar la reserva, quedará guardada en tu cuenta y tendrás un plazo limitado para completar el pago antes de su cancelación automática.",
                  })}
                </Text>
              </View>
  )
}
