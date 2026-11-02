import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { styles } from '../notifications.styles'
import { Ionicons } from '@expo/vector-icons'
import { rutaDesdeActionPath } from '@/modules/notifications/services/deepLink'
import { router } from 'expo-router'
import { Notificacion } from '@/store/notificationStore'

export default function NotificationsPart4({ c, formatDateTime, primaryAccent, selectedNotification, setSelectedNotification, t }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; formatDateTime: (isoString?: string) => string; primaryAccent: string; selectedNotification: Notificacion | null; setSelectedNotification: any; t: any }) {
  return (
    <Modal
          visible={selectedNotification !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedNotification(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
              <View style={styles.modalHeaderRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, paddingRight: 8 }}>
                  <View style={[styles.iconWrapper, { backgroundColor: c.bgInput, width: 38, height: 38, borderRadius: 19 }]}>
                    <Ionicons
                      name={(selectedNotification?.icono as any) || "notifications-outline"}
                      size={20}
                      color={selectedNotification?.iconoColor || primaryAccent}
                    />
                  </View>
                  <Text style={[styles.modalTitle, { color: c.textPrimary, flex: 1 }]} numberOfLines={2}>
                    {selectedNotification ? t(selectedNotification.titulo, { defaultValue: selectedNotification.titulo }) : ""}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedNotification(null)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Ionicons name="close" size={24} color={c.textPrimary} />
                </TouchableOpacity>
              </View>
  
              {selectedNotification && (
                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 6 }}>
                    <View style={styles.timeRow}>
                      <Ionicons name="time-outline" size={13} color={c.textMuted} style={{ marginRight: 4 }} />
                      <Text style={[styles.time, { color: c.textMuted, fontSize: 12 }]}>
                        {formatDateTime(selectedNotification.fecha)}
                      </Text>
                    </View>
                    {selectedNotification.criticidad && (
                      <View style={[
                        styles.criticalityBadge,
                        {
                          backgroundColor: selectedNotification.criticidad === "HIGH" ? (c.oscuro ? "#450a0a" : "#FEF2F2") : (c.oscuro ? "#172554" : "#EFF6FF"),
                          borderColor: selectedNotification.criticidad === "HIGH" ? "#EF4444" : "#3B82F6",
                        }
                      ]}>
                        <Text style={{
                          fontSize: 10,
                          fontWeight: "700",
                          color: selectedNotification.criticidad === "HIGH" ? "#DC2626" : "#2563EB",
                        }}>
                          {selectedNotification.criticidad}
                        </Text>
                      </View>
                    )}
                  </View>
  
                  <View style={[styles.infoDivider, { backgroundColor: c.border, marginVertical: 10 }]} />
  
                  <Text style={[styles.modalDescription, { color: c.textSecondary, lineHeight: 22, fontSize: 14 }]}>
                    {t(selectedNotification.mensaje, { defaultValue: selectedNotification.mensaje })}
                  </Text>
  
                  {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
                    <View style={[styles.metadataBox, { backgroundColor: c.bgInput, borderColor: c.border }]}>
                      <Text style={[styles.metadataTitle, { color: c.textPrimary }]}>
                        {t("notificaciones.detallesEvento", "Detalles del evento")}
                      </Text>
                      {Object.entries(selectedNotification.metadata).map(([key, val]) => (
                        <View key={key} style={styles.metadataRow}>
                          <Text style={[styles.metadataKey, { color: c.textMuted }]}>{key}:</Text>
                          <Text style={[styles.metadataVal, { color: c.textPrimary }]}>{String(val)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </ScrollView>
              )}
  
              {Boolean(selectedNotification?.metadata?.actionPath) && (
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: primaryAccent, marginTop: 14 }]}
                  onPress={() => {
                    const destino = rutaDesdeActionPath(String(selectedNotification?.metadata?.actionPath));
                    setSelectedNotification(null);
                    if (destino) router.push(destino as any);
                  }}
                >
                  <Ionicons name="open-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.modalCloseBtnText}>{t("notificaciones.verDetalle", "Ver detalle")}</Text>
                </TouchableOpacity>
              )}
  
              {!selectedNotification?.metadata?.actionPath && Boolean(
                selectedNotification?.referenceId ||
                selectedNotification?.tipo?.toUpperCase().includes("RESERV") ||
                selectedNotification?.titulo?.toLowerCase().includes("reserva") ||
                selectedNotification?.mensaje?.toLowerCase().includes("reserva")
              ) && (
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: primaryAccent, marginTop: 14 }]}
                  onPress={() => {
                    setSelectedNotification(null);
                    router.push("/(tabs)/my-bookings");
                  }}
                >
                  <Ionicons name="car-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.modalCloseBtnText}>
                    {t("notificaciones.verReserva", "Ver Reserva / Continuar")}
                  </Text>
                </TouchableOpacity>
              )}
  
              <TouchableOpacity
                style={[
                  styles.modalCloseBtn,
                  {
                    backgroundColor: Boolean(
                      selectedNotification?.referenceId ||
                      selectedNotification?.tipo?.toUpperCase().includes("RESERV") ||
                      selectedNotification?.titulo?.toLowerCase().includes("reserva")
                    )
                      ? (c.oscuro ? "#334155" : "#E2E8F0")
                      : primaryAccent,
                    marginTop: 10,
                  },
                ]}
                onPress={() => setSelectedNotification(null)}
              >
                <Text
                  style={[
                    styles.modalCloseBtnText,
                    {
                      color: Boolean(
                        selectedNotification?.referenceId ||
                        selectedNotification?.tipo?.toUpperCase().includes("RESERV") ||
                        selectedNotification?.titulo?.toLowerCase().includes("reserva")
                      )
                        ? (c.oscuro ? "#F8FAFC" : "#334155")
                        : "#FFFFFF",
                    },
                  ]}
                >
                  {t("perfil.ok", "Entendido")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
  )
}
