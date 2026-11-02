import { Modal, View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native'
import { styles } from '../support.styles'
import { Ionicons } from '@expo/vector-icons'
import { fechaCorta } from '@/modules/reservation/components/BookingSummaryModal.pieces'
import { ReservaGuardada } from '@/modules/reservation/services/reservationPersistService'
import React from 'react'

export default function SupportPart2({ c, cargandoReservas, errores, isDropdownOpen, reservaId, reservasValidas, setErrores, setIsDropdownOpen, setPlaca, setReservaId, setVehiculoNombre, t }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; cargandoReservas: boolean; errores: Record<string, string>; isDropdownOpen: boolean; reservaId: string; reservasValidas: ReservaGuardada[]; setErrores: React.Dispatch<React.SetStateAction<Record<string, string>>>; setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>; setPlaca: React.Dispatch<React.SetStateAction<string>>; setReservaId: React.Dispatch<React.SetStateAction<string>>; setVehiculoNombre: React.Dispatch<React.SetStateAction<string>>; t: any }) {
  return (
    <Modal
          visible={isDropdownOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsDropdownOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCardLarge, { backgroundColor: c.bgCard, borderColor: c.border }]}>
              <View style={[styles.modalHeaderRow, { marginBottom: 16 }]}>
                <Text style={[styles.modalTitle, { color: c.textPrimary }]}>
                  {t("soporte.incidencia.seleccionaVehiculo", { defaultValue: "Selecciona tu Vehículo en Alquiler" })}
                </Text>
                <TouchableOpacity onPress={() => setIsDropdownOpen(false)}>
                  <Ionicons name="close" size={24} color={c.textPrimary} />
                </TouchableOpacity>
              </View>
  
              {cargandoReservas ? (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <ActivityIndicator size="large" color="#2563EB" />
                  <Text style={{ marginTop: 10, color: c.textSecondary }}>
                    {t("soporte.incidencia.cargandoReservas", { defaultValue: "Cargando reservas..." })}
                  </Text>
                </View>
              ) : reservasValidas.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: "center", paddingHorizontal: 16 }}>
                  <Ionicons name="warning-outline" size={48} color={c.textMuted} />
                  <Text style={{ fontSize: 15, fontWeight: "800", color: c.textPrimary, marginTop: 12, textAlign: "center" }}>
                    {t("soporte.incidencia.noReservasActivasTitulo", { defaultValue: "No tienes reservas activas o confirmadas" })}
                  </Text>
                  <Text style={{ fontSize: 12.5, color: c.textSecondary, marginTop: 6, textAlign: "center", lineHeight: 18 }}>
                    {t("soporte.incidencia.noReservasActivasSub", { defaultValue: "Solo puedes reportar incidencias técnicas en vehículos con alquileres confirmados o en curso en este momento." })}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={reservasValidas}
                  keyExtractor={(item) => item.referencia}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  renderItem={({ item }) => {
                    const vehSnap = item.vehiculoSnapshot as any;
                    const itemPlaca = (item as any).vehiclePlate || item.vehiculoPlaca || vehSnap?.placa || vehSnap?.plate || "";
                    const esSeleccionada = item.referencia === reservaId;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.reservaSeleccionCard,
                          {
                            backgroundColor: esSeleccionada ? (c.oscuro ? "#1E3A8A44" : "#EFF6FF") : c.bgInput,
                            borderColor: esSeleccionada ? "#2563EB" : c.border,
                          },
                        ]}
                        onPress={() => {
                          setReservaId(item.referencia);
                          setVehiculoNombre(item.vehiculoNombre);
                          setPlaca(itemPlaca || t("soporte.incidencia.sinPlaca", { defaultValue: "Sin placa" }));
                          if (errores.vehiculoNombre) {
                            setErrores((prev) => ({ ...prev, vehiculoNombre: "" }));
                          }
                          setIsDropdownOpen(false);
                        }}
                        activeOpacity={0.85}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.reservaSeleccionNombre, { color: c.textPrimary }]}>
                            {item.vehiculoNombre}
                          </Text>
                          <Text style={[styles.reservaSeleccionDetalle, { color: c.textSecondary }]}>
                            {t("soporte.incidencia.placa", { defaultValue: "Placa" })}: <Text style={{ fontWeight: "700" }}>{itemPlaca || t("soporte.incidencia.sinPlaca", { defaultValue: "Sin placa" })}</Text> · Ref: {item.referencia}
                          </Text>
                          <Text style={[styles.reservaSeleccionFechas, { color: c.textMuted }]}>
                            {item.fechaRetiro ? fechaCorta(String(item.fechaRetiro)) : ""} - {item.fechaDevolucion ? fechaCorta(String(item.fechaDevolucion)) : ""}
                          </Text>
                        </View>
                        {esSeleccionada && (
                          <Ionicons name="checkmark-circle" size={22} color="#2563EB" />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
  
              <TouchableOpacity
                style={[styles.modalCloseBtn, { marginTop: 10 }]}
                onPress={() => setIsDropdownOpen(false)}
              >
                <Text style={styles.modalCloseBtnText}>{t("comun.cancelar", { defaultValue: "Cancelar" })}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
  )
}
