import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { styles } from '../support.styles'
import { Ionicons } from '@expo/vector-icons'
import { EstadoReporte, ReporteIncidencia } from '@/store/supportStore'
import React from 'react'

export default function SupportPart4({ c, getEstadoColor, getEstadoTexto, getTiempoEstimadoTexto, getTipoIncidenciaTexto, reporteSeleccionado, setReporteSeleccionado, t }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; getEstadoColor: (estado: EstadoReporte) => '#6B7280' | '#3B82F6' | '#F59E0B' | '#8B5CF6' | '#10B981'; getEstadoTexto: (estado: string) => string; getTiempoEstimadoTexto: (tiempo: string) => string; getTipoIncidenciaTexto: (idOrNombre: string) => string; reporteSeleccionado: ReporteIncidencia | null; setReporteSeleccionado: React.Dispatch<React.SetStateAction<ReporteIncidencia | null>>; t: any }) {
  return (
    <Modal
          visible={reporteSeleccionado !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setReporteSeleccionado(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCardLarge, { backgroundColor: c.bgCard, borderColor: c.border, height: '82%' }]}>
              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalTitle, { color: c.textPrimary }]}>
                  {t("soporte.incidencia.detalleReporte", { defaultValue: "Detalle de Reporte" })} {reporteSeleccionado?.id}
                </Text>
                <TouchableOpacity onPress={() => setReporteSeleccionado(null)}>
                  <Ionicons name="close" size={24} color={c.textPrimary} />
                </TouchableOpacity>
              </View>
  
              {reporteSeleccionado && (
                <ScrollView style={{ flex: 1, marginVertical: 10 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: "#2563EB" }}>
                      {getTipoIncidenciaTexto(reporteSeleccionado.tipoIncidencia)}
                    </Text>
                    <View style={[styles.estadoBadge, { backgroundColor: `${getEstadoColor(reporteSeleccionado.estado)}18`, borderColor: `${getEstadoColor(reporteSeleccionado.estado)}40` }]}>
                      <Text style={[styles.estadoTexto, { color: getEstadoColor(reporteSeleccionado.estado) }]}>
                        {getEstadoTexto(reporteSeleccionado.estado)}
                      </Text>
                    </View>
                  </View>
  
                  <Text style={[styles.modalSubHeader, { color: c.textMuted }]}>
                    {t("soporte.incidencia.vehiculoReserva", { defaultValue: "Vehículo / Reserva:" })}
                  </Text>
                  <Text style={[styles.modalVal, { color: c.textPrimary }]}>
                    {reporteSeleccionado.vehiculoNombre} {reporteSeleccionado.placa ? `(${t("soporte.incidencia.placa", { defaultValue: "Placa" })}: ${reporteSeleccionado.placa})` : ""}
                  </Text>
  
                  <Text style={[styles.modalSubHeader, { color: c.textMuted, marginTop: 10 }]}>
                    {t("soporte.incidencia.descripcion", { defaultValue: "Descripción:" })}
                  </Text>
                  <Text style={[styles.modalVal, { color: c.textSecondary, lineHeight: 18 }]}>
                    {t(reporteSeleccionado.descripcion, { defaultValue: reporteSeleccionado.descripcion })}
                  </Text>
  
                  <Text style={[styles.modalSubHeader, { color: c.textMuted, marginTop: 10 }]}>
                    {t("soporte.incidencia.contactoRegistrado", { defaultValue: "Contacto registrado:" })}
                  </Text>
                  <Text style={[styles.modalVal, { color: c.textPrimary }]}>
                    {reporteSeleccionado.contactoNombre} · {reporteSeleccionado.contactoTelefono}
                  </Text>
  
                  <Text style={[styles.modalSubHeader, { color: c.textMuted, marginTop: 10 }]}>
                    {t("soporte.incidencia.tiempoEstimadoAtencion", { defaultValue: "Tiempo estimado de atención:" })}
                  </Text>
                  <Text style={[styles.modalVal, { color: "#D97706", fontWeight: "700" }]}>
                    {getTiempoEstimadoTexto(reporteSeleccionado.tiempoEstimadoSolucion)}
                  </Text>
  
                  {/* Historial de atención del Administrador */}
                  {reporteSeleccionado.estado === "Recibido" ? (
                    <View style={[styles.adminNoteBox, { backgroundColor: c.bgInput, borderColor: c.border, marginTop: 16 }]}>
                      <Ionicons name="time-outline" size={18} color="#2563EB" />
                      <Text style={[styles.adminNoteText, { color: c.textSecondary }]}>
                        {t("soporte.incidencia.reporteRecibidoAviso", { defaultValue: "Tu reporte ha sido recibido y está a la espera de ser asignado a un técnico. Recibirás una notificación cuando cambie de estado." })}
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text style={[styles.modalSubHeader, { color: c.textPrimary, marginTop: 16, fontWeight: "800", fontSize: 13.5 }]}>
                        {t("soporte.incidencia.historialAdmin", { defaultValue: "Historial de atención del Administrador:" })}
                      </Text>
  
                      <View style={styles.timelineContainer}>
                        {reporteSeleccionado.historialEstados.map((h, i) => (
                          <View key={i} style={styles.timelineItem}>
                            <View style={[styles.timelineDot, { backgroundColor: getEstadoColor(h.estado) }]} />
                            <View style={styles.timelineContent}>
                              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={[styles.timelineEstado, { color: c.textPrimary }]}>{getEstadoTexto(h.estado)}</Text>
                                <Text style={[styles.timelineFecha, { color: c.textMuted }]}>
                                  {new Date(h.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </Text>
                              </View>
                              {h.comentario && (
                                <Text style={[styles.timelineComentario, { color: c.textSecondary }]}>
                                  {t(h.comentario, { defaultValue: h.comentario })}
                                </Text>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
  
                  {/* Nota informativa de gestión por el Administrador */}
                  <View style={[styles.adminNoteBox, { backgroundColor: c.bgInput, borderColor: c.border, marginTop: 12 }]}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#2563EB" />
                    <Text style={[styles.adminNoteText, { color: c.textSecondary }]}>
                      {t("soporte.incidencia.estadoValidadoAviso", { defaultValue: "El estado de este reporte es validado y actualizado directamente por el equipo administrador en la central de soporte." })}
                    </Text>
                  </View>
                </ScrollView>
              )}
  
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setReporteSeleccionado(null)}
              >
                <Text style={styles.modalCloseBtnText}>{t("comun.cerrar", { defaultValue: "Cerrar" })}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
  )
}
