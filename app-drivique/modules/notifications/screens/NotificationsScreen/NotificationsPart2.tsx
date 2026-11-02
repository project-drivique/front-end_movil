import { Modal, View, TouchableOpacity, Text } from 'react-native'
import { styles } from '../notifications.styles'
import { Ionicons } from '@expo/vector-icons'
import { CuponPromocion } from '@/modules/notifications/types/promotion.types'

export default function NotificationsPart2({ activePendingCoupon, c, confirmApplyCoupon, primaryAccent, setActivePendingCoupon, t }: { activePendingCoupon: CuponPromocion | null; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; confirmApplyCoupon: () => void; primaryAccent: string; setActivePendingCoupon: any; t: any }) {
  return (
    <Modal
          visible={activePendingCoupon !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setActivePendingCoupon(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: c.bgCard, borderColor: c.border, alignItems: "center" }]}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("a11y.cerrar", "Cerrar")} 
                style={{ position: 'absolute', top: 12, right: 12, padding: 8 }} 
                onPress={() => setActivePendingCoupon(null)}
              >
                <Ionicons name="close" size={24} color={c.textMuted} />
              </TouchableOpacity>
              
              <Ionicons name="ticket-outline" size={54} color={primaryAccent} style={{ marginBottom: 12 }} />
              <Text style={[styles.modalTitle, { color: c.textPrimary, textAlign: "center" }]}>
                {t("promoCoupons.confirmTitle", "Confirmar Activación")}
              </Text>
              
              {activePendingCoupon && (
                <View style={{ width: "100%", alignItems: "center" }}>
                  <Text style={[styles.couponRewardEarnedDesc, { color: c.textSecondary, textAlign: "center", marginVertical: 10 }]}>
                    {t("promoCoupons.confirmDesc", "¿Deseas desbloquear este cupón y usarlo en tu próxima reserva?")}
                  </Text>
  
                  <View style={[styles.codeBox, { backgroundColor: c.bgInput, borderColor: c.border }]}>
                    <Text style={[styles.codeText, { color: c.textPrimary }]}>
                      {t(activePendingCoupon.codigo, { defaultValue: activePendingCoupon.codigo })}
                    </Text>
                  </View>
  
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 20, width: '100%' }}>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("coupon.cancelBtn", "Cancelar")}
                      style={[
                        styles.modalCloseBtn, 
                        { 
                          flex: 1, 
                          backgroundColor: c.bgInput, 
                          borderWidth: 1, 
                          borderColor: c.border 
                        }
                      ]}
                      onPress={() => setActivePendingCoupon(null)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.modalBtnText, { color: c.textSecondary, fontWeight: "700" }]}>
                        {t("coupon.cancelBtn", "Cancelar")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("coupon.applyAction", "Aplicar")}
                      style={[styles.modalCloseBtn, { flex: 1, backgroundColor: primaryAccent }]}
                      onPress={confirmApplyCoupon}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.modalBtnText, { color: "#FFFFFF", fontWeight: "800" }]}>
                        {t("coupon.applyAction", "Aplicar")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
  )
}
