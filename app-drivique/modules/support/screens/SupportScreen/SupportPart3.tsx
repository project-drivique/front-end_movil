import { Modal, View, Text, TouchableOpacity } from 'react-native'
import { styles } from '../support.styles'
import { Ionicons } from '@expo/vector-icons'
import { ReporteIncidencia } from '@/store/supportStore'
import React from 'react'

export default function SupportPart3({ c, getTiempoEstimadoTexto, reporteExitoso, setActiveTab, setReporteExitoso, t }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; getTiempoEstimadoTexto: (tiempo: string) => string; reporteExitoso: ReporteIncidencia | null; setActiveTab: React.Dispatch<React.SetStateAction<'canales' | 'reportar' | 'mis_reportes'>>; setReporteExitoso: React.Dispatch<React.SetStateAction<ReporteIncidencia | null>>; t: any }) {
  return (
    <Modal
          visible={reporteExitoso !== null}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setReporteExitoso(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
              <Ionicons name="checkmark-circle" size={56} color="#16A34A" style={{ alignSelf: "center", marginBottom: 10 }} />
              <Text style={[styles.modalTitle, { color: c.textPrimary, textAlign: "center" }]}>
                {t("soporte.incidencia.reporteRegistradoExito", { defaultValue: "Reporte Registrado con Éxito" })}
              </Text>
              <Text style={[styles.modalId, { color: "#2563EB", textAlign: "center" }]}>
                {t("soporte.incidencia.codigoCaso", { defaultValue: "Código de caso:" })} {reporteExitoso?.id}
              </Text>
  
              <View style={[styles.infoBoxModal, { backgroundColor: c.bgInput }]}>
                <View style={styles.infoRowModal}>
                  <Ionicons name="time-outline" size={18} color="#D97706" />
                  <Text style={[styles.infoTxtModal, { color: c.textPrimary }]}>
                    {t("soporte.incidencia.tiempoEstimadoAtencion", { defaultValue: "Tiempo estimado de atención:" })} <Text style={{ fontWeight: "800" }}>{reporteExitoso?.tiempoEstimadoSolucion ? getTiempoEstimadoTexto(reporteExitoso.tiempoEstimadoSolucion) : ""}</Text>
                  </Text>
                </View>
                <View style={[styles.infoRowModal, { marginTop: 8 }]}>
                  <Ionicons name="mail-outline" size={18} color="#2563EB" />
                  <Text style={[styles.infoTxtModal, { color: c.textPrimary }]}>
                    {t("soporte.incidencia.confirmacionEnviadaA", { defaultValue: "Confirmación enviada a:" })} <Text style={{ fontWeight: "700" }}>{reporteExitoso?.contactoEmail}</Text>
                  </Text>
                </View>
              </View>
  
              <Text style={[styles.modalNotifAviso, { color: c.textSecondary }]}>
                {t("soporte.incidencia.notifAvisoModal", { defaultValue: "El equipo administrador revisará el reporte y actualizará el estado del caso. Recibirás notificaciones por correo y en la app." })}
              </Text>
  
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("soporte.incidencia.verEnMisReportes", { defaultValue: "Ver en Mis Reportes" })}
                style={styles.modalPrimaryBtn}
                onPress={() => {
                  setReporteExitoso(null);
                  setActiveTab("mis_reportes");
                }}
              >
                <Text style={styles.modalPrimaryBtnText}>
                  {t("soporte.incidencia.verEnMisReportes", { defaultValue: "Ver en Mis Reportes" })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
  )
}
