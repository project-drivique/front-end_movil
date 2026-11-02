import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from './CouponSection.styles'
import { Ionicons } from '@expo/vector-icons'
import { formatCurrency } from '@/utils/currencyUtils'

export default function CuponAplicado({ c, cuponAplicado, monedaActual, removerCupon, t, tasaUSD }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; cuponAplicado: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").Cupon; monedaActual: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/utils/currencyUtils").Moneda; removerCupon: () => void; t: any; tasaUSD: number }) {
  return (
    <View
            style={[
              styles.appliedContainer,
              {
                backgroundColor: c.oscuro ? "rgba(30, 64, 175, 0.12)" : "#F0F7FF",
                borderColor: c.oscuro ? "rgba(59, 130, 246, 0.3)" : "#BFDBFE",
              },
            ]}
          >
            <View style={styles.appliedLeft}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#1D4ED8",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                <Ionicons name="checkmark" size={15} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.appliedCode, { color: c.oscuro ? "#93C5FD" : "#1E40AF" }]}>
                  {cuponAplicado.codigo}
                </Text>
                <Text style={[styles.appliedDesc, { color: c.textSecondary }]}>
                  {cuponAplicado.descuentoPorcentaje
                    ? `${cuponAplicado.descuentoPorcentaje}% ${t("coupon.offApplied", { defaultValue: "OFF aplicado" })}`
                    : `-${formatCurrency(Number(cuponAplicado.descuentoFijo), monedaActual, tasaUSD)} ${t("coupon.applied", { defaultValue: "aplicado" })}`}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={removerCupon} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={c.oscuro ? "#9CA3AF" : "#64748B"} />
            </TouchableOpacity>
          </View>
  )
}
