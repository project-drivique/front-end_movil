import { Modal, View, Text, TouchableOpacity } from 'react-native'
import { styles } from '../notifications.styles'
import { Ionicons } from '@expo/vector-icons'
import { CuponPromocion } from '@/modules/notifications/types/promotion.types'

export default function NotificationsPart3({ activeAppliedCoupon, c, setActiveAppliedCoupon, t }: { activeAppliedCoupon: CuponPromocion | null; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; setActiveAppliedCoupon: any; t: any }) {
  return (
    <Modal
          visible={activeAppliedCoupon !== null}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setActiveAppliedCoupon(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: c.bgCard, borderColor: c.border, alignItems: "center" }]}>
              <Ionicons name="checkmark-circle" size={54} color="#10B981" style={{ marginBottom: 12 }} />
              <Text style={[styles.modalTitle, { color: c.textPrimary, textAlign: "center" }]}>
                {t("promoCoupons.modalTitle", "¡Cupón Activado con Éxito!")}
              </Text>
              
              {activeAppliedCoupon && (
                <View style={{ width: "100%", alignItems: "center" }}>
                  <Text style={[styles.couponRewardEarnedDesc, { color: c.textSecondary, textAlign: "center", marginVertical: 10 }]}>
                    {t("promoCoupons.modalSubtitle", "Has desbloqueado el cupón de recompensa por tus logros en Drivique.")}
                  </Text>
  
                  <View style={[styles.codeBox, { backgroundColor: c.bgInput, borderColor: c.border }]}>
                    <Text style={[styles.codeText, { color: c.textPrimary }]}>
                      {t(activeAppliedCoupon.codigo, { defaultValue: activeAppliedCoupon.codigo })}
                    </Text>
                  </View>
  
                  <Text style={[styles.modalInstruction, { color: c.textMuted }]}>
                  {t("promoCoupons.modalInstruction", "Usa este código en el resumen de reserva para obtener tu descuento.")}
                </Text>
                </View>
              )}
  
              <TouchableOpacity
                style={[styles.modalCloseBtn, { width: "100%", marginTop: 20 }]}
                onPress={() => setActiveAppliedCoupon(null)}
              >
                <Text style={styles.modalBtnText}>{t("promoCoupons.modalBtn", "¡Excelente!")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
  )
}
