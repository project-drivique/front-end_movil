import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import { styles } from '../support.styles'
import { Ionicons } from '@expo/vector-icons'
import { ReporteIncidencia, EstadoReporte } from '@/store/supportStore'
import React from 'react'

export default function MisReportesActiveTab({ abrirReporte, c, getEstadoColor, getEstadoTexto, getTiempoEstimadoTexto, getTipoIncidenciaTexto, reportes, setActiveTab, t }: { abrirReporte: (reporte: ReporteIncidencia) => Promise<void>; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; getEstadoColor: (estado: EstadoReporte) => '#6B7280' | '#3B82F6' | '#F59E0B' | '#8B5CF6' | '#10B981'; getEstadoTexto: (estado: string) => string; getTiempoEstimadoTexto: (tiempo: string) => string; getTipoIncidenciaTexto: (idOrNombre: string) => string; reportes: ReporteIncidencia[]; setActiveTab: React.Dispatch<React.SetStateAction<'canales' | 'reportar' | 'mis_reportes'>>; t: any }) {
  return (
    <View style={{ flex: 1 }}>
            {reportes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="clipboard-outline" size={54} color={c.textMuted} />
                <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>
                  {t("soporte.incidencia.sinReportesTitulo", { defaultValue: "No tienes reportes registrados" })}
                </Text>
                <Text style={[styles.emptySub, { color: c.textSecondary }]}>
                  {t("soporte.incidencia.sinReportesSub", { defaultValue: "Si tienes un problema durante tu alquiler, regístralo desde la pestaña \"Reportar Incidencia\"." })}
                </Text>
                <TouchableOpacity
                  style={styles.emptyReportBtn}
                  onPress={() => setActiveTab("reportar")}
                >
                  <Text style={styles.emptyReportBtnText}>
                    {t("soporte.incidencia.crearPrimerReporte", { defaultValue: "Crear primer reporte" })}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={reportes}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                renderItem={({ item }) => {
                  const colorEstado = getEstadoColor(item.estado);
                  return (
                    <TouchableOpacity
                      style={[styles.reporteCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
                      onPress={() => abrirReporte(item)}
                      activeOpacity={0.88}
                    >
                      <View style={styles.reporteHeaderRow}>
                        <Text style={[styles.reporteId, { color: c.textPrimary }]}>{item.id}</Text>
                        <View style={[styles.estadoBadge, { backgroundColor: `${colorEstado}18`, borderColor: `${colorEstado}40` }]}>
                          <View style={[styles.estadoDot, { backgroundColor: colorEstado }]} />
                          <Text style={[styles.estadoTexto, { color: colorEstado }]}>{getEstadoTexto(item.estado)}</Text>
                        </View>
                      </View>
  
                      <Text style={[styles.reporteTipo, { color: "#2563EB" }]}>{getTipoIncidenciaTexto(item.tipoIncidencia)}</Text>
                      <Text style={[styles.reporteVehiculo, { color: c.textSecondary }]}>
                        {item.vehiculoNombre} {item.placa ? `(${t("soporte.incidencia.placa", { defaultValue: "Placa" })}: ${item.placa})` : ""}
                      </Text>
  
                      <Text style={[styles.reporteDesc, { color: c.textPrimary }]} numberOfLines={2}>
                        {t(item.descripcion, { defaultValue: item.descripcion })}
                      </Text>
  
                      <View style={styles.reporteFooterRow}>
                        <Text style={[styles.reporteTiempo, { color: c.textMuted }]}>
                          {t("soporte.incidencia.tiempoEstimadoSolucion", { defaultValue: "Tiempo est." })}: {getTiempoEstimadoTexto(item.tiempoEstimadoSolucion)}
                        </Text>
                        <Text style={[styles.reporteVerDetalle, { color: "#2563EB" }]}>
                          {t("soporte.incidencia.verDetalle", { defaultValue: "Ver detalle →" })}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
  )
}
