import { ScrollView, View, Text, TouchableOpacity, TextInput } from 'react-native'
import { styles } from './EditDatesLocationSection.styles'
import { Ionicons } from '@expo/vector-icons'
import CalendarioRango from '../DateRangeCalendar'
import { formatHoraAmPm } from '../../constants/reservation.constants'
import React from 'react'
import { Vehiculo } from '@/modules/catalog/types/catalog.types'

export default function EditDatesLocationSectionPart({ METODOS_PAGO, c, ciudadEntregaNombre, devolucionAnticipadaText, diasReserva, draft, efectivoPermitido, handleAbrirHoraDevolucion, infoComputo, labelLugarDevolucion, labelLugarRetiro, mostrarDomicilioDevolucion, mostrarDomicilioRetiro, nombreSucursal, primaryAccent, setAlertaEfectivoVisible, setAlertaModal, setDraft, setHoraVisible, setModalTipo, t, vehiculo }: { METODOS_PAGO: ({ id: 'wompi'; titulo: string; descripcion: string; } | { id: 'efectivo'; titulo: string; descripcion: string; })[]; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; ciudadEntregaNombre: string; devolucionAnticipadaText: string; diasReserva: number; draft: { metodoPago: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").MetodoPago | null; lugarRetiro: string; lugarDevolucion: string; fechaRetiro: string | null; fechaDevolucion: string | null; horaRetiro: string; horaDevolucion: string; barrioRetiro: string; direccionRetiro: string; referenciasRetiro: string; barrioDevolucion: string; direccionDevolucion: string; referenciasDevolucion: string; descuentoPromocion?: number; fueraDeHorarioAceptado?: boolean; }; efectivoPermitido: boolean; handleAbrirHoraDevolucion: () => void; infoComputo: { titulo: string; desc: string; } | null; labelLugarDevolucion: string; labelLugarRetiro: string; mostrarDomicilioDevolucion: boolean; mostrarDomicilioRetiro: boolean; nombreSucursal: string; primaryAccent: string; setAlertaEfectivoVisible: React.Dispatch<React.SetStateAction<boolean>>; setAlertaModal: React.Dispatch<React.SetStateAction<{ visible: boolean; icono?: keyof typeof Ionicons.glyphMap; titulo: string; mensaje: string; botones?: { texto: string; onPress: () => void; variante?: 'primario' | 'secundario'; }[]; }>>; setDraft: React.Dispatch<React.SetStateAction<{ metodoPago: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").MetodoPago | null; lugarRetiro: string; lugarDevolucion: string; fechaRetiro: string | null; fechaDevolucion: string | null; horaRetiro: string; horaDevolucion: string; barrioRetiro: string; direccionRetiro: string; referenciasRetiro: string; barrioDevolucion: string; direccionDevolucion: string; referenciasDevolucion: string; descuentoPromocion?: number; fueraDeHorarioAceptado?: boolean; }>>; setHoraVisible: React.Dispatch<React.SetStateAction<'retiro' | 'devolucion' | null>>; setModalTipo: React.Dispatch<React.SetStateAction<'retiro' | 'devolucion' | null>>; t: any; vehiculo: Vehiculo }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            {/* 1. Método de pago preferido */}
            <View style={styles.headerConIcono}>
              <Ionicons name="card-outline" size={14} color={primaryAccent} />
              <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]}>
                {t("reserva.fechasLugar.metodoPagoPreferido")}
              </Text>
            </View>
            <View style={styles.metodosFila}>
              {METODOS_PAGO.map((metodo) => {
                const activo = draft.metodoPago === metodo.id;
                return (
                  <TouchableOpacity
                    key={metodo.id}
                    style={[
                      styles.metodoCard,
                      {
                        borderColor: c.border,
                        backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                      },
                      activo && [styles.metodoCardActivo, { borderColor: primaryAccent, backgroundColor: c.primaryBg }],
                    ]}
                    onPress={() => {
                      if (metodo.id === "efectivo" && !efectivoPermitido) {
                        setAlertaModal({
                          visible: true,
                          icono: "alert-circle-outline",
                          titulo: t("reserva.fechasLugar.efectivoNoDisponibleTitulo", { defaultValue: "Pago en efectivo no disponible" }),
                          mensaje: t("reserva.fechasLugar.efectivoNoDisponibleMensaje", {
                            sucursal: nombreSucursal,
                            defaultValue: "La sucursal {{sucursal}} no recibe pagos en efectivo. Elige pago en línea o un vehículo de otra sucursal.",
                          }),
                        });
                        return;
                      }
                      setDraft((prev) => ({
                        ...prev,
                        metodoPago: metodo.id,
                        ...(metodo.id === "efectivo"
                          ? {
                              lugarRetiro: nombreSucursal,
                              lugarDevolucion: nombreSucursal,
                            }
                          : {}),
                      }));
                      if (metodo.id === "efectivo") setAlertaEfectivoVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.metodoHeaderRow}>
                      <Text style={[styles.metodoTitulo, { color: c.textPrimary }, activo && { color: primaryAccent }]}>
                        {metodo.titulo}
                      </Text>
                      <View
                        style={[
                          styles.radio,
                          { borderColor: c.border },
                          activo && [styles.radioActivo, { borderColor: primaryAccent }],
                        ]}
                      >
                        {activo && <View style={[styles.radioPunto, { backgroundColor: primaryAccent }]} />}
                      </View>
                    </View>
                    <Text style={[styles.metodoDesc, { color: c.textMuted }]}>{metodo.descripcion}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
  
            {/* 2. Punto autorizado para pago en efectivo */}
            {draft.metodoPago === "efectivo" && (
              <View style={styles.puntoAutorizadoContainer}>
                <View style={styles.headerConIcono}>
                  <Ionicons name="location" size={14} color={primaryAccent} />
                  <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]}>
                    {t("reserva.fechasLugar.puntoAutorizadoEfectivo", {
                      defaultValue: "Punto autorizado para pago en efectivo",
                    })}
                  </Text>
                </View>
                <View
                  style={[
                    styles.puntoAutorizadoBox,
                    { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" },
                  ]}
                >
                  <Text style={[styles.puntoAutorizadoTexto, { color: c.textPrimary }]} numberOfLines={1}>
                    {`${nombreSucursal}${ciudadEntregaNombre ? ` · ${ciudadEntregaNombre}` : ""}`}
                  </Text>
                </View>
              </View>
            )}
  
            {/* 3. Lugares de retiro y devolución */}
            <View style={styles.filaDosCols}>
              <View style={styles.columnaMedia}>
                <View style={styles.headerConIcono}>
                  <Ionicons name="location" size={14} color={primaryAccent} />
                  <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
                    {t("reserva.fechasLugar.lugarDeRetiro")}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
                  onPress={() => setModalTipo("retiro")}
                  activeOpacity={0.8}
                >
                  <View style={styles.selectValorRow}>
                    <Text
                      style={[styles.selectValue, { color: draft.lugarRetiro ? c.textPrimary : c.textMuted }]}
                      numberOfLines={1}
                    >
                      {labelLugarRetiro}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={c.textMuted} />
                  </View>
                </TouchableOpacity>
              </View>
  
              <View style={styles.columnaMedia}>
                <View style={styles.headerConIcono}>
                  <Ionicons name="location" size={14} color={primaryAccent} />
                  <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
                    {t("reserva.fechasLugar.lugarDeDevolucion")}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
                  onPress={() => setModalTipo("devolucion")}
                  activeOpacity={0.8}
                >
                  <View style={styles.selectValorRow}>
                    <Text
                      style={[styles.selectValue, { color: draft.lugarDevolucion ? c.textPrimary : c.textMuted }]}
                      numberOfLines={1}
                    >
                      {labelLugarDevolucion}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={c.textMuted} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
  
            {/* Domicilio info (unificado, idéntico a web) */}
            {(mostrarDomicilioRetiro || mostrarDomicilioDevolucion) && (
              <View style={[styles.domicilioCard, { borderColor: c.border }]}>
                <Text style={[styles.domicilioTitulo, { color: primaryAccent }]}>
                  {mostrarDomicilioRetiro && mostrarDomicilioDevolucion
                    ? t("reserva.fechasLugar.infoDomicilio", { defaultValue: "Información de entrega y devolución a domicilio" })
                    : mostrarDomicilioRetiro
                    ? t("reserva.fechasLugar.infoEntregaDomicilio", { defaultValue: "Información de entrega a domicilio" })
                    : t("reserva.fechasLugar.infoDevolucionDomicilio", { defaultValue: "Información de devolución a domicilio" })}
                </Text>
                <View style={[styles.ciudadBox, { backgroundColor: c.primaryBg }]}>
                  <View style={styles.selectLabelRow}>
                    <Ionicons name="location" size={13} color={primaryAccent} />
                    <Text style={[styles.ciudadLabel, { color: c.textMuted }]}>
                      {t("reserva.fechasLugar.ciudadEntrega")}
                    </Text>
                  </View>
                  <View style={styles.ciudadValorRow}>
                    <Text style={[styles.ciudadValor, { color: c.textPrimary }]}>{ciudadEntregaNombre}</Text>
                    <Text style={[styles.autoDetectado, { color: primaryAccent }]}>
                      {t("reserva.fechasLugar.autoDetectado")}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.barrio")}</Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" },
                  ]}
                  placeholder={t("reserva.fechasLugar.placeholderBarrio")}
                  placeholderTextColor={c.textMuted}
                  value={draft.barrioRetiro || draft.barrioDevolucion || ""}
                  onChangeText={(texto) => setDraft((prev) => ({ ...prev, barrioRetiro: texto, barrioDevolucion: texto }))}
                />
                <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.direccion")}</Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" },
                  ]}
                  placeholder={t("reserva.fechasLugar.placeholderDireccion")}
                  placeholderTextColor={c.textMuted}
                  value={draft.direccionRetiro || draft.direccionDevolucion || ""}
                  onChangeText={(texto) => setDraft((prev) => ({ ...prev, direccionRetiro: texto, direccionDevolucion: texto }))}
                />
                <Text style={[styles.inputLabel, { color: c.textSecondary }]}>
                  {t("reserva.fechasLugar.referenciasEntrega")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" },
                  ]}
                  placeholder={t("reserva.fechasLugar.placeholderReferencias")}
                  placeholderTextColor={c.textMuted}
                  value={draft.referenciasRetiro || draft.referenciasDevolucion || ""}
                  onChangeText={(texto) => setDraft((prev) => ({ ...prev, referenciasRetiro: texto, referenciasDevolucion: texto }))}
                />
              </View>
            )}
  
            {/* 4. Calendario de disponibilidad */}
            <View style={styles.headerCalendarioContainer}>
              <Ionicons name="calendar" size={14} color={primaryAccent} style={styles.iconoCalendario} />
              <Text style={[styles.tituloCalendario, { color: primaryAccent }]}>
                {t("reserva.fechasLugar.calendarioDisponibilidad", {
                  defaultValue: "Selecciona un rango de fechas en el calendario de disponibilidad",
                })}
              </Text>
            </View>
            <CalendarioRango
              vehiculo={vehiculo}
              fechaRetiro={draft.fechaRetiro}
              fechaDevolucion={draft.fechaDevolucion}
              onCambiarFechas={(retiro, devolucion) =>
                setDraft((prev) => ({ ...prev, fechaRetiro: retiro, fechaDevolucion: devolucion }))
              }
            />
  
            {/* 5. Fechas automáticas seleccionadas */}
            <View style={[styles.filaDosCols, { marginTop: 14, marginBottom: 0 }]}>
              <View style={styles.columnaMedia}>
                <View style={styles.headerConIcono}>
                  <Ionicons name="calendar" size={14} color={primaryAccent} />
                  <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
                    {t("reserva.fechasLugar.fechaDeRetiro", { defaultValue: "Fecha de retiro" })}
                  </Text>
                </View>
                <View
                  style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
                >
                  <Text
                    style={[styles.selectValue, { color: draft.fechaRetiro ? c.textPrimary : c.textMuted }]}
                    numberOfLines={1}
                  >
                    {draft.fechaRetiro || t("reserva.fechasLugar.seleccionar", { defaultValue: "Seleccionar" })}
                  </Text>
                </View>
              </View>
  
              <View style={styles.columnaMedia}>
                <View style={styles.headerConIcono}>
                  <Ionicons name="calendar" size={14} color={primaryAccent} />
                  <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
                    {t("reserva.fechasLugar.fechaDeDevolucion", { defaultValue: "Fecha de devolución" })}
                  </Text>
                </View>
                <View
                  style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
                >
                  <Text
                    style={[styles.selectValue, { color: draft.fechaDevolucion ? c.textPrimary : c.textMuted }]}
                    numberOfLines={1}
                  >
                    {draft.fechaDevolucion || t("reserva.fechasLugar.seleccionar", { defaultValue: "Seleccionar" })}
                  </Text>
                </View>
              </View>
            </View>
  
            {/* INFO ALERT: CÓMPUTO DE DÍAS (IDÉNTICO A WEB) */}
            {!!infoComputo && (
              <View
                style={[
                  styles.computoAlertCard,
                  {
                    backgroundColor: c.oscuro ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.08)",
                    borderColor: c.oscuro ? "rgba(59, 130, 246, 0.35)" : "rgba(59, 130, 246, 0.25)",
                  },
                ]}
              >
                <Ionicons name="information-circle" size={20} color="#2563EB" style={{ marginTop: 2, flexShrink: 0 }} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.computoAlertTitulo, { color: c.textPrimary }]}>
                    {infoComputo.titulo}
                  </Text>
                  <Text style={[styles.computoAlertDesc, { color: c.oscuro ? "#CBD5E1" : "#475569" }]}>
                    {infoComputo.desc}
                  </Text>
                </View>
              </View>
            )}
  
            {/* 6. Horas de retiro y devolución */}
            <View style={[styles.filaDosCols, { marginTop: 12, marginBottom: 0 }]}>
              <View style={styles.columnaMedia}>
                <View style={styles.headerConIcono}>
                  <Ionicons name="time" size={14} color={primaryAccent} />
                  <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
                    {t("vehiculo.selectPickupTime", { defaultValue: "Selecciona Hora de Retiro" })}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
                  onPress={() => setHoraVisible("retiro")}
                  activeOpacity={0.8}
                >
                  <View style={styles.selectValorRow}>
                    <Text
                      style={[styles.selectValue, { color: draft.horaRetiro ? c.textPrimary : c.textMuted }]}
                      numberOfLines={1}
                    >
                      {draft.horaRetiro
                        ? formatHoraAmPm(draft.horaRetiro)
                        : t("reserva.fechasLugar.seleccionarHora", { defaultValue: "Seleccionar" })}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={c.textMuted} />
                  </View>
                </TouchableOpacity>
              </View>
  
              <View style={styles.columnaMedia}>
                <View style={styles.headerConIcono}>
                  <Ionicons name="time" size={14} color={primaryAccent} />
                  <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
                    {t("vehiculo.selectReturnTime", { defaultValue: "Selecciona Hora de Devolución" })}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
                  onPress={handleAbrirHoraDevolucion}
                  activeOpacity={0.8}
                >
                  <View style={styles.selectValorRow}>
                    <Text
                      style={[styles.selectValue, { color: draft.horaDevolucion ? c.textPrimary : c.textMuted }]}
                      numberOfLines={1}
                    >
                      {draft.horaDevolucion
                        ? formatHoraAmPm(draft.horaDevolucion)
                        : t("reserva.fechasLugar.seleccionarHora", { defaultValue: "Seleccionar" })}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={c.textMuted} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
  
            {/* 7. Duración del alquiler y Devolución anticipada (IDÉNTICO A WEB) */}
            {diasReserva > 0 && (
              <View style={{ gap: 8, marginTop: 12 }}>
                <View
                  style={[
                    styles.summaryRowCard,
                    {
                      backgroundColor: c.oscuro ? "rgba(47, 78, 162, 0.12)" : "rgba(47, 78, 162, 0.05)",
                      borderColor: c.oscuro ? "rgba(47, 78, 162, 0.3)" : "rgba(47, 78, 162, 0.15)",
                    },
                  ]}
                >
                  <View style={styles.summaryRowLeft}>
                    <Ionicons name="hourglass-outline" size={15} color={c.textSecondary} />
                    <Text style={[styles.summaryRowLabel, { color: c.textSecondary }]}>
                      {t("vehiculo.rentalDuration", { defaultValue: "Duración del alquiler" })}
                    </Text>
                  </View>
                  <Text style={[styles.summaryRowValue, { color: primaryAccent }]}>
                    {diasReserva} {diasReserva === 1 ? t("vehiculo.day", { defaultValue: "día" }) : t("vehiculo.days", { defaultValue: "días" })}
                  </Text>
                </View>
  
                {!!devolucionAnticipadaText && (
                  <View
                    style={[
                      styles.summaryRowCard,
                      {
                        backgroundColor: c.oscuro ? "rgba(47, 78, 162, 0.12)" : "rgba(47, 78, 162, 0.05)",
                        borderColor: c.oscuro ? "rgba(47, 78, 162, 0.3)" : "rgba(47, 78, 162, 0.15)",
                      },
                    ]}
                  >
                    <View style={styles.summaryRowLeft}>
                      <Ionicons name="time-outline" size={15} color={c.textSecondary} />
                      <Text style={[styles.summaryRowLabel, { color: c.textSecondary }]}>
                        {t("vehiculo.earlyReturn", { defaultValue: "Devolución anticipada" })}
                      </Text>
                    </View>
                    <Text style={[styles.summaryRowValue, { color: primaryAccent }]}>
                      {devolucionAnticipadaText}
                    </Text>
                  </View>
                )}
              </View>
            )}
  
          </View>
        </ScrollView>
  )
}
