import { View, Text, TextInput } from 'react-native'
import { styles } from './DatesLocationForm.styles'
import { COLOR_MARCA } from '../../constants/reservation.constants'
import { Ionicons } from '@expo/vector-icons'

export default function MostrarDomicilioRetiro({ actualizarFechasLugar, c, ciudadEntregaNombre, fechasLugar, mostrarDomicilioDevolucion, mostrarDomicilioRetiro, t }: { actualizarFechasLugar: (data: Partial<import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosFechasLugar>) => void; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; ciudadEntregaNombre: string; fechasLugar: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosFechasLugar; mostrarDomicilioDevolucion: boolean; mostrarDomicilioRetiro: boolean; t: any }) {
  return (
    <View style={[styles.domicilioCard, { borderColor: c.border }]}>
            <Text style={[styles.domicilioTitulo, { color: COLOR_MARCA }]}>
              {mostrarDomicilioRetiro && mostrarDomicilioDevolucion
                ? t("reserva.fechasLugar.infoDomicilio", { defaultValue: "Información de entrega y devolución a domicilio" })
                : mostrarDomicilioRetiro
                ? t("reserva.fechasLugar.infoEntregaDomicilio", { defaultValue: "Información de entrega a domicilio" })
                : t("reserva.fechasLugar.infoDevolucionDomicilio", { defaultValue: "Información de devolución a domicilio" })}
            </Text>
  
            <View style={[styles.ciudadBox, { backgroundColor: c.primaryBg }]}>
              <View style={styles.selectLabelRow}>
                <Ionicons name="location" size={13} color={COLOR_MARCA} />
                <Text style={[styles.ciudadLabel, { color: c.textMuted }]}>{t("reserva.fechasLugar.ciudadEntrega")}</Text>
              </View>
              <View style={styles.ciudadValorRow}>
                <Text style={[styles.ciudadValor, { color: c.textPrimary }]}>{ciudadEntregaNombre}</Text>
                <Text style={[styles.autoDetectado, { color: COLOR_MARCA }]}>{t("reserva.fechasLugar.autoDetectado")}</Text>
              </View>
            </View>
  
            <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.barrio")}</Text>
            <TextInput accessibilityLabel={t("reserva.fechasLugar.placeholderBarrio")}
              style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
              placeholder={t("reserva.fechasLugar.placeholderBarrio")}
              placeholderTextColor={c.textMuted}
              value={fechasLugar.barrioRetiro || fechasLugar.barrioDevolucion || ""}
              onChangeText={(texto) => actualizarFechasLugar({ barrioRetiro: texto, barrioDevolucion: texto })}
            />
  
            <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.direccion")}</Text>
            <TextInput accessibilityLabel={t("reserva.fechasLugar.placeholderDireccion")}
              style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
              placeholder={t("reserva.fechasLugar.placeholderDireccion")}
              placeholderTextColor={c.textMuted}
              value={fechasLugar.direccionRetiro || fechasLugar.direccionDevolucion || ""}
              onChangeText={(texto) => actualizarFechasLugar({ direccionRetiro: texto, direccionDevolucion: texto })}
            />
  
            <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.referenciasEntrega")}</Text>
            <TextInput accessibilityLabel={t("reserva.fechasLugar.placeholderReferencias")}
              style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
              placeholder={t("reserva.fechasLugar.placeholderReferencias")}
              placeholderTextColor={c.textMuted}
              value={fechasLugar.referenciasRetiro || fechasLugar.referenciasDevolucion || ""}
              onChangeText={(texto) => actualizarFechasLugar({ referenciasRetiro: texto, referenciasDevolucion: texto })}
            />
          </View>
  )
}
