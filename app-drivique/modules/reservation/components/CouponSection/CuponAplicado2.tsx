import { View, TextInput, TouchableOpacity, Text } from 'react-native'
import { styles } from './CouponSection.styles'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'

export default function CuponAplicado2({ c, codigoManual, errorMsg, handleAplicarManual, primaryAccent, setCodigoManual, setErrorMsg, setErrorMsgModal, setModalVisible, setSelectedConditionsCoupon, t, validando }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; codigoManual: string; errorMsg: string; handleAplicarManual: () => void; primaryAccent: string; setCodigoManual: React.Dispatch<React.SetStateAction<string>>; setErrorMsg: React.Dispatch<React.SetStateAction<string>>; setErrorMsgModal: React.Dispatch<React.SetStateAction<string>>; setModalVisible: React.Dispatch<React.SetStateAction<boolean>>; setSelectedConditionsCoupon: React.Dispatch<any>; t: any; validando: boolean }) {
  return (
    <View>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                    borderColor: c.border,
                    color: c.textPrimary,
                  },
                ]}
                placeholder={t("coupon.placeholder", "Ingresa un código")}
                placeholderTextColor={c.textMuted}
                value={codigoManual}
                onChangeText={setCodigoManual}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[styles.aplicarBtn, { backgroundColor: primaryAccent }, codigoManual.length === 0 && { opacity: 0.5 }]}
                disabled={codigoManual.length === 0 || validando}
                onPress={handleAplicarManual}
              >
                <Text style={styles.aplicarBtnText}>{t("coupon.applyBtn", "APLICAR")}</Text>
              </TouchableOpacity>
            </View>
            
            {errorMsg ? (
              <View style={[styles.errorAlertBanner, { backgroundColor: c.oscuro ? "#450a0a" : "#FEF2F2", borderColor: c.oscuro ? "#7f1d1d" : "#FCA5A5" }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Ionicons name="alert-circle" size={16} color={c.oscuro ? "#f87171" : "#EF4444"} />
                  <Text style={[styles.errorAlertText, { color: c.oscuro ? "#fca5a5" : "#B91C1C" }]}>{errorMsg}</Text>
                </View>
                <TouchableOpacity onPress={() => setErrorMsg("")}>
                  <Ionicons name="close" size={16} color={c.oscuro ? "#f87171" : "#EF4444"} />
                </TouchableOpacity>
              </View>
            ) : null}
            
            <TouchableOpacity onPress={() => { setModalVisible(true); setSelectedConditionsCoupon(null); setErrorMsgModal(""); }} style={styles.verCuponesBtn}>
              <Text style={[styles.verCuponesText, { color: primaryAccent }]}>{t("coupon.viewAvailable", "Ver cupones disponibles")}</Text>
            </TouchableOpacity>
          </View>
  )
}
