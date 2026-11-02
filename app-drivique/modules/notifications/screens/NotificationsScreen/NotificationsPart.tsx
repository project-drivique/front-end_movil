import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { styles } from '../notifications.styles'
import { Ionicons } from '@expo/vector-icons'
import { formatCurrency } from '@/utils/currencyUtils'
import { CuponPromocion } from '@/modules/notifications/types/promotion.types'

export default function NotificationsPart({ c, formatDateShort, monedaActual, primaryAccent, selectedConditionsCoupon, setSelectedConditionsCoupon, t, tasaUSD }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; formatDateShort: (isoString?: string) => string; monedaActual: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/utils/currencyUtils").Moneda; primaryAccent: string; selectedConditionsCoupon: CuponPromocion | null; setSelectedConditionsCoupon: any; t: any; tasaUSD: number }) {
  return (
    <Modal
          visible={selectedConditionsCoupon !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedConditionsCoupon(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalTitle, { color: c.textPrimary }]}>
                  {t("coupon.conditionsTitle", "Condiciones del Cupón")}
                </Text>
                <TouchableOpacity onPress={() => setSelectedConditionsCoupon(null)}>
                  <Ionicons name="close" size={24} color={c.textPrimary} />
                </TouchableOpacity>
              </View>
              
              {selectedConditionsCoupon && (
                <ScrollView style={styles.modalScroll}>
                  <Text style={[styles.modalSubtitle, { color: primaryAccent, fontWeight: "800", fontSize: 16, marginBottom: 4 }]}>
                    {t(selectedConditionsCoupon.tituloPremio, { defaultValue: selectedConditionsCoupon.tituloPremio })}
                  </Text>
  
                  <Text style={[styles.modalDescription, { color: c.textSecondary, lineHeight: 20, marginBottom: 12 }]}>
                    {t(selectedConditionsCoupon.recompensaDetalle, { defaultValue: selectedConditionsCoupon.recompensaDetalle })}
                  </Text>
                  
                  <View style={[styles.infoDivider, { backgroundColor: c.border, marginVertical: 12 }]} />
  
                  <Text style={[styles.modalTitle, { color: c.textPrimary, fontSize: 14, marginBottom: 8 }]}>
                    {t("coupon.termsTitle", "Términos y condiciones:")}
                  </Text>
                  <Text style={[styles.conditionText, { color: c.textSecondary, lineHeight: 20 }]}>
                    • Código: {selectedConditionsCoupon.codigo}{"\n"}
                    {t("coupon.term1", "• Válido para pagos digitales e iniciales.")}{"\n"}
                    {t("coupon.term2", "• No transferible a otros usuarios.")}{"\n"}
                    {t("coupon.term3", "• Solo se puede aplicar un cupón por reserva.")}
                    {selectedConditionsCoupon.condicionesDetalladas ? `\n• ${t(selectedConditionsCoupon.condicionesDetalladas, { defaultValue: selectedConditionsCoupon.condicionesDetalladas })}` : ''}
                    {selectedConditionsCoupon.minimoValor ? `\n• ${t("reserva.resumen.montoMinimo", "Monto mínimo:")} ${formatCurrency(selectedConditionsCoupon.minimoValor, monedaActual, tasaUSD)}` : ''}
                    {selectedConditionsCoupon.expiracion ? `\n• ${t("coupon.expires", "Vence:")} ${formatDateShort(selectedConditionsCoupon.expiracion)}` : `\n• ${t("coupon.validAllMonth", "Válido durante todo el mes.")}`}
                  </Text>
                </ScrollView>
              )}
  
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: primaryAccent, marginTop: 16 }]}
                onPress={() => setSelectedConditionsCoupon(null)}
              >
                <Text style={styles.modalCloseBtnText}>{t("coupon.understoodBtn", "Entendido")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
  )
}
