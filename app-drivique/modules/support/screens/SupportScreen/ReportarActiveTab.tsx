import { ScrollView, View, Text, TouchableOpacity, TextInput, Image } from 'react-native'
import { styles } from '../support.styles'
import { Ionicons } from '@expo/vector-icons'
import { TIPOS_INCIDENCIA } from '@/modules/support/constants/supportCatalog'
import { LinearGradient } from 'expo-linear-gradient'
import { ReservaGuardada } from '@/modules/reservation/services/reservationPersistService'
import React from 'react'

export default function ReportarActiveTab({ agregarEvidencia, c, cargandoReservas, contactoEmail, contactoNombre, contactoTelefono, descripcion, eliminarEvidencia, enviando, errores, evidenciasAdjuntas, getTiempoEstimadoTexto, getTipoIncidenciaTexto, params, placa, reservasValidas, setContactoEmail, setContactoNombre, setContactoTelefono, setDescripcion, setErrores, setIsDropdownOpen, setTipoSeleccionado, t, tipoObj, tipoSeleccionado, validarYEnviarReporte, vehiculoNombre }: { agregarEvidencia: () => Promise<void>; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; cargandoReservas: boolean; contactoEmail: string; contactoNombre: string; contactoTelefono: string; descripcion: string; eliminarEvidencia: (index: number) => void; enviando: boolean; errores: Record<string, string>; evidenciasAdjuntas: string[]; getTiempoEstimadoTexto: (tiempo: string) => string; getTipoIncidenciaTexto: (idOrNombre: string) => string; params: { reservaId?: string; vehiculoNombre?: string; placa?: string; tab?: string; reporteId?: string; }; placa: string; reservasValidas: ReservaGuardada[]; setContactoEmail: React.Dispatch<React.SetStateAction<string>>; setContactoNombre: React.Dispatch<React.SetStateAction<string>>; setContactoTelefono: React.Dispatch<React.SetStateAction<string>>; setDescripcion: React.Dispatch<React.SetStateAction<string>>; setErrores: React.Dispatch<React.SetStateAction<Record<string, string>>>; setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>; setTipoSeleccionado: React.Dispatch<React.SetStateAction<string>>; t: any; tipoObj: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/support/constants/supportCatalog").TipoIncidencia; tipoSeleccionado: string; validarYEnviarReporte: () => Promise<void>; vehiculoNombre: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Banner de datos precargados desde Mis Reservas */}
            {params.reservaId ? (
              <View style={[styles.precargadoBanner, { backgroundColor: c.oscuro ? "#1e3a8a33" : "#EFF6FF", borderColor: c.oscuro ? "#1e3a8a" : "#BFDBFE" }]}>
                <Ionicons name="link-outline" size={20} color="#2563EB" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.precargadoTitulo, { color: c.oscuro ? "#93C5FD" : "#1E40AF" }]}>
                    {t("soporte.incidencia.reservaVinculadaTitulo", { defaultValue: "Reserva vinculada desde Mis Reservas" })}
                  </Text>
                  <Text style={[styles.precargadoSub, { color: c.oscuro ? "#BFDBFE" : "#1D4ED8" }]}>
                    {params.vehiculoNombre} · Ref: {params.reservaId} {params.placa ? `(${t("soporte.incidencia.placa", { defaultValue: "Placa" })}: ${params.placa})` : ""}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={[styles.infoFormBanner, { backgroundColor: c.bgCard, borderColor: c.border }]}>
                <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
                <Text style={[styles.infoFormText, { color: c.textSecondary }]}>
                  {t("soporte.infoBanner", { defaultValue: "Completa el formulario para reportar cualquier problema técnico o mecánico durante tu reserva." })}
                </Text>
              </View>
            )}
  
            {/* CONTENEDOR CARD DEL FORMULARIO */}
            <View style={[styles.formContainerCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
              <View style={styles.formCardHeader}>
                <Ionicons name="build-outline" size={22} color="#2563EB" />
                <Text style={[styles.formCardTitle, { color: c.textPrimary }]}>
                  {t("soporte.incidencia.formularioTitulo", { defaultValue: "Formulario de Incidencia" })}
                </Text>
              </View>
  
              {/* Vehículo y Placa */}
              <Text style={[styles.inputLabel, { color: c.textPrimary }]}>
                {t("soporte.incidencia.vehiculoAsociado", { defaultValue: "Vehículo / Reserva asociada" })}
              </Text>
              {!params.reservaId && !cargandoReservas && reservasValidas.length === 0 ? (
                <View style={[styles.infoBoxModal, { backgroundColor: c.bgInput, marginVertical: 4, padding: 12 }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name="warning-outline" size={20} color="#EF4444" />
                    <Text style={{ color: c.textPrimary, fontSize: 13, fontWeight: "700", flex: 1 }}>
                      {t("soporte.incidencia.sinReservasActivasTitulo", { defaultValue: "No tienes reservas activas o confirmadas" })}
                    </Text>
                  </View>
                  <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 6, lineHeight: 16 }}>
                    {t("soporte.incidencia.sinReservasActivasMensaje", { defaultValue: "Solo puedes reportar incidencias técnicas si tienes reservas activas o confirmadas en este momento." })}
                  </Text>
                </View>
              ) : params.reservaId ? (
                // Case A: Preloaded from bookings screen (Read-only view)
                <View style={styles.rowTwoInputs}>
                  <View style={[styles.input, { backgroundColor: c.oscuro ? "#1F2937" : "#F3F4F6", borderColor: c.border, flex: 1.5, justifyContent: "center" }]}>
                    <Text style={{ color: c.textSecondary, fontSize: 13.5 }}>{vehiculoNombre}</Text>
                  </View>
                  <View style={[styles.input, { backgroundColor: c.oscuro ? "#1F2937" : "#F3F4F6", borderColor: c.border, flex: 1, justifyContent: "center" }]}>
                    <Text style={{ color: c.textSecondary, fontSize: 13.5 }}>{placa || t("soporte.incidencia.sinPlaca", { defaultValue: "Sin Placa" })}</Text>
                  </View>
                </View>
              ) : (
                // Case B: Direct navigation (Dropdown selector + read-only Plate)
                <View style={{ gap: 10 }}>
                  <View style={styles.rowTwoInputs}>
                    {/* Vehículo Selector Dropdown */}
                    <TouchableOpacity accessibilityRole="button"
                      style={[
                        styles.input,
                        {
                          backgroundColor: c.bgInput,
                          borderColor: errores.vehiculoNombre ? "#EF4444" : c.border,
                          flex: 1.5,
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        },
                      ]}
                      onPress={() => setIsDropdownOpen(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={{ color: vehiculoNombre ? c.textPrimary : c.textMuted, fontSize: 13.5 }} numberOfLines={1}>
                        {vehiculoNombre || t("perfil.seleccionar", { defaultValue: "Seleccionar" })}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={c.textSecondary} />
                    </TouchableOpacity>
  
                    {/* Plate Read-only Input */}
                    <View style={[styles.input, { backgroundColor: c.oscuro ? "#1F2937" : "#F3F4F6", borderColor: c.border, flex: 1, justifyContent: "center" }]}>
                      <Text style={{ color: placa ? c.textPrimary : c.textMuted, fontSize: 13.5 }}>
                        {placa || t("soporte.incidencia.placa", { defaultValue: "Placa" })}
                      </Text>
                    </View>
                  </View>
                  {errores.vehiculoNombre && <Text style={styles.errorText}>{errores.vehiculoNombre}</Text>}
                </View>
              )}
  
              {/* Selector de Tipo de Incidencia desde JSON */}
              <Text style={[styles.inputLabel, { color: c.textPrimary, marginTop: 14 }]}>
                {t("soporte.incidencia.tipoIncidencia", { defaultValue: "Tipo de Incidencia *" })}
              </Text>
              <View style={styles.tiposGrid}>
                {TIPOS_INCIDENCIA.map((tipo) => {
                  const seleccionado = tipoSeleccionado === tipo.id;
                  return (
                    <TouchableOpacity accessibilityRole="button"
                      key={tipo.id}
                      style={[
                        styles.tipoChip,
                        { backgroundColor: c.bgInput, borderColor: c.border },
                        seleccionado && styles.tipoChipSeleccionado,
                      ]}
                      onPress={() => setTipoSeleccionado(tipo.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={tipo.icono as any}
                        size={18}
                        color={seleccionado ? "#FFFFFF" : "#2563EB"}
                      />
                      <Text style={[styles.tipoChipTexto, { color: seleccionado ? "#FFFFFF" : c.textPrimary }]}>
                        {getTipoIncidenciaTexto(tipo.id)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
  
              {/* Banner Dinámico de Tiempo Estimado */}
              <View style={[styles.tiempoEstimadoBox, { backgroundColor: c.oscuro ? "#312E8133" : "#FEF3C7", borderColor: c.oscuro ? "#3730A3" : "#FDE68A" }]}>
                <Ionicons name="time-outline" size={20} color={c.oscuro ? "#FBBF24" : "#D97706"} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.tiempoEstimadoLabel, { color: c.oscuro ? "#FDE68A" : "#B45309" }]}>
                    {t("soporte.incidencia.tiempoEstimadoLabel", { defaultValue: "Tiempo estimado de atención técnica:" })}
                  </Text>
                  <Text style={[styles.tiempoEstimadoValor, { color: c.oscuro ? "#FBBF24" : "#92400E" }]}>
                    {getTiempoEstimadoTexto(tipoObj.tiempoEstimado)}
                  </Text>
                </View>
              </View>
  
              {/* Descripción Obligatoria */}
              <Text style={[styles.inputLabel, { color: c.textPrimary, marginTop: 14 }]}>
                {t("soporte.incidencia.descripcionLabel", { defaultValue: "Descripción del problema *" })}
              </Text>
              <TextInput accessibilityLabel={t("soporte.incidencia.descripcionPlaceholder", { defaultValue: "Describe lo sucedido, ruidos, testigos en tablero o ubicación actual..." })}
                style={[
                  styles.inputMultiline,
                  { backgroundColor: c.bgInput, borderColor: errores.descripcion ? "#EF4444" : c.border, color: c.textPrimary },
                ]}
                placeholder={t("soporte.incidencia.descripcionPlaceholder", { defaultValue: "Describe lo sucedido, ruidos, testigos en tablero o ubicación actual..." })}
                placeholderTextColor={c.textMuted}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                value={descripcion}
                onChangeText={(txt) => {
                  setDescripcion(txt);
                  if (errores.descripcion) setErrores({ ...errores, descripcion: "" });
                }}
              />
              {errores.descripcion && <Text style={styles.errorText}>{errores.descripcion}</Text>}
  
              {/* Evidencias Opcionales */}
              <View style={styles.evidenciaHeaderRow}>
                <Text style={[styles.inputLabel, { color: c.textPrimary, marginTop: 14 }]}>
                  {t("soporte.incidencia.evidenciasLabel", { defaultValue: "Evidencias (Imágenes / Video opcionales)" })}
                </Text>
                <Text style={[styles.opcionalBadge, { color: c.textMuted }]}>
                  {t("soporte.incidencia.maxFotos", { defaultValue: "Máx 3 fotos" })}
                </Text>
              </View>
  
              <View style={styles.evidenciasFila}>
                {evidenciasAdjuntas.map((uri, idx) => (
                  <View key={idx} style={styles.evidenciaPreviewWrap}>
                    <Image source={{ uri }} style={styles.evidenciaPreviewImg} />
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("a11y.cerrar", "Cerrar")}
                      style={styles.evidenciaEliminarBtn}
                      onPress={() => eliminarEvidencia(idx)}
                    >
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
  
                {evidenciasAdjuntas.length < 3 && (
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("soporte.incidencia.adjuntar", { defaultValue: "+ Adjuntar" })}
                    style={[styles.agregarEvidenciaBtn, { backgroundColor: c.bgInput, borderColor: c.border }]}
                    onPress={agregarEvidencia}
                  >
                    <Ionicons name="camera-outline" size={22} color="#2563EB" />
                    <Text style={styles.agregarEvidenciaTexto}>
                      {t("soporte.incidencia.adjuntar", { defaultValue: "+ Adjuntar" })}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
  
              {/* Datos de Contacto Auto-rellenados desde Perfil */}
              <View style={[styles.dividerSection, { backgroundColor: c.border }]} />
  
              <View style={styles.contactoHeaderRow}>
                <Ionicons name="person-circle-outline" size={20} color="#2563EB" />
                <Text style={[styles.sectionSubtitle, { color: c.textPrimary, marginLeft: 6 }]}>
                  {t("soporte.incidencia.datosSeguimiento", { defaultValue: "Datos de contacto para seguimiento" })}
                </Text>
              </View>
              <Text style={[styles.contactoInfoHint, { color: c.textMuted }]}>
                {t("soporte.incidencia.datosSeguimientoHint", { defaultValue: "Precargados automáticamente desde tu perfil registrado (puedes editarlos si lo requieres)." })}
              </Text>
  
              <Text style={[styles.inputLabel, { color: c.textPrimary, marginTop: 8 }]}>
                {t("soporte.incidencia.nombreLabel", { defaultValue: "Nombre completo *" })}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: c.bgInput, borderColor: errores.contactoNombre ? "#EF4444" : c.border, color: c.textPrimary },
                ]}
                value={contactoNombre}
                onChangeText={(txt) => {
                  setContactoNombre(txt);
                  if (errores.contactoNombre) setErrores({ ...errores, contactoNombre: "" });
                }}
              />
              {errores.contactoNombre && <Text style={styles.errorText}>{errores.contactoNombre}</Text>}
  
              <View style={styles.rowTwoInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: c.textPrimary, marginTop: 10 }]}>
                    {t("soporte.incidencia.telefonoLabel", { defaultValue: "Teléfono *" })}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: c.bgInput, borderColor: errores.contactoTelefono ? "#EF4444" : c.border, color: c.textPrimary },
                    ]}
                    keyboardType="phone-pad"
                    value={contactoTelefono}
                    onChangeText={(txt) => {
                      setContactoTelefono(txt);
                      if (errores.contactoTelefono) setErrores({ ...errores, contactoTelefono: "" });
                    }}
                  />
                  {errores.contactoTelefono && <Text style={styles.errorText}>{errores.contactoTelefono}</Text>}
                </View>
  
                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.inputLabel, { color: c.textPrimary, marginTop: 10 }]}>
                    {t("soporte.incidencia.emailLabel", { defaultValue: "Correo electrónico *" })}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: c.bgInput, borderColor: errores.contactoEmail ? "#EF4444" : c.border, color: c.textPrimary },
                    ]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={contactoEmail}
                    onChangeText={(txt) => {
                      setContactoEmail(txt);
                      if (errores.contactoEmail) setErrores({ ...errores, contactoEmail: "" });
                    }}
                  />
                  {errores.contactoEmail && <Text style={styles.errorText}>{errores.contactoEmail}</Text>}
                </View>
              </View>
  
              {/* Botón de Enviar */}
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("soporte.incidencia.btnEnviar", { defaultValue: "Enviar Reporte de Incidencia" })}
                style={[styles.submitBtn, (!params.reservaId && reservasValidas.length === 0) && { opacity: 0.5 }]}
                onPress={(!params.reservaId && reservasValidas.length === 0) ? undefined : validarYEnviarReporte}
                activeOpacity={0.88}
                disabled={enviando || (!params.reservaId && reservasValidas.length === 0)}
              >
                <LinearGradient
                  colors={["#16a34a", "#15803d"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitBtnGradient}
                >
                  <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>
                    {t("soporte.incidencia.btnEnviar", { defaultValue: "Enviar Reporte de Incidencia" })}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
  )
}
