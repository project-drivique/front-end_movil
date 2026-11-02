import { Pressable, KeyboardAvoidingView, Platform, View, TouchableOpacity, Text, ScrollView, TextInput, ActivityIndicator, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SelectorEstrellas } from '../SelectorEstrellas'
import { LinearGradient } from 'expo-linear-gradient'
import { GRADIENTES } from '@/constants/gradients'
import { ElegibilidadResena, ResenaGuardada } from '../../services/resenaService'
import React from 'react'

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  keyboardWrap: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxHeight: Platform.OS === "web" ? 640 : "88%",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  scrollContainer: {
    flexShrink: 1,
  },
  iconoCabecera: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  titulo: {
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  subtituloVehiculo: {
    fontSize: 12.5,
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },
  bloqueEstrellas: {
    alignItems: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  labelFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  contadorTexto: {
    fontSize: 11,
    fontWeight: "600",
  },
  estrellasWrap: {
    marginBottom: 8,
  },
  etiquetaFeedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 2,
  },
  emojiFeedback: {
    fontSize: 15,
  },
  textoFeedback: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  textoPuntajeVacio: {
    fontSize: 11.5,
    marginTop: 2,
  },
  bloqueComentario: {
    marginBottom: 14,
  },
  comentarioInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    minHeight: 80,
    maxHeight: 110,
  },
  alertaModeracion: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  alertaTexto: {
    flex: 1,
    fontSize: 11.5,
    color: "#EF4444",
    fontWeight: "600",
    lineHeight: 15,
  },
  bloqueFotos: {
    marginBottom: 18,
  },
  fotosFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  fotoThumbWrap: {
    width: 68,
    height: 68,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  fotoThumb: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  btnEliminarFoto: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.65)",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAnadirFoto: {
    width: 68,
    height: 68,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  btnAnadirFotoTexto: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  botones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  btnCancelar: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCancelarTexto: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  btnGuardarWrap: {
    flex: 1.3,
    height: 44,
    borderRadius: 12,
    overflow: "hidden",
  },
  btnGuardarGradiente: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGuardarTexto: {
    color: "#FFF",
    fontSize: 13.5,
    fontWeight: "800",
  },
});
const MAX_CARACTERES = 400;

export default function ModalCalificarPart({ c, calificacion, calificacionSuc, comentario, comentarioSuc, elegibilidad, etiquetaActual, getMensajeModeracion, guardando, handleGuardar, mostrarSucursal, mostrarVehiculo, onCerrar, puedeGuardar, setCalificacion, setCalificacionSuc, setComentario, setComentarioSuc, t, validacion, validacionSuc, valorInicial, vehiculoNombre }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; calificacion: number; calificacionSuc: number; comentario: string; comentarioSuc: string; elegibilidad: ElegibilidadResena | null; etiquetaActual: { texto: string; emoji: string; }; getMensajeModeracion: () => string | undefined; guardando: boolean; handleGuardar: () => Promise<void>; mostrarSucursal: boolean; mostrarVehiculo: boolean; onCerrar: () => void; puedeGuardar: boolean; setCalificacion: React.Dispatch<React.SetStateAction<number>>; setCalificacionSuc: React.Dispatch<React.SetStateAction<number>>; setComentario: React.Dispatch<React.SetStateAction<string>>; setComentarioSuc: React.Dispatch<React.SetStateAction<string>>; t: any; validacion: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/utils/reviewModeration").ResultadoValidacion; validacionSuc: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/utils/reviewModeration").ResultadoValidacion; valorInicial: ResenaGuardada | null | undefined; vehiculoNombre: string | undefined }) {
  return (
    <Pressable style={s.overlay} onPress={onCerrar}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={s.keyboardWrap}
          >
            <Pressable
              style={[s.card, { backgroundColor: c.bgCard, borderColor: c.border }]}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Cabecera con botón de cerrar X */}
              <View style={s.header}>
                <TouchableOpacity
                  style={s.closeBtn}
                  onPress={onCerrar}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={22} color={c.textMuted} />
                </TouchableOpacity>
                <View style={[s.iconoCabecera, { backgroundColor: c.primaryBg }]}>
                  <Ionicons name="star" size={22} color="#F59E0B" />
                </View>
                <Text style={[s.titulo, { color: c.textPrimary }]}>
                  {!mostrarVehiculo && mostrarSucursal
                    ? t("reserva.calificar.calificarSucursal", { defaultValue: "Calificar sucursal" })
                    : valorInicial
                    ? t("reserva.calificar.editarCalificacion", { defaultValue: "Editar calificación" })
                    : t("reserva.calificar.calificarVehiculo", { defaultValue: "Calificar vehículo" })}
                </Text>
                {!!vehiculoNombre && (
                  <Text style={[s.subtituloVehiculo, { color: c.textSecondary }]} numberOfLines={1}>
                    {vehiculoNombre}
                  </Text>
                )}
              </View>
  
              {/* Contenido scrolleable para estrellas, comentario y fotos */}
              <ScrollView
                style={s.scrollContainer}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingVertical: 4, paddingBottom: 10 }}
                keyboardShouldPersistTaps="handled"
              >
                {mostrarVehiculo && (<>
                {/* Selector de Estrellas */}
                <View style={s.bloqueEstrellas}>
                  <Text style={[s.label, { color: c.textSecondary }]}>
                    {t("reserva.calificar.comoCalificarias", { defaultValue: "¿Cómo calificarías el vehículo y tu experiencia?" })}
                  </Text>
                  <View style={s.estrellasWrap}>
                    <SelectorEstrellas valor={calificacion} onCambiar={setCalificacion} tamano={34} />
                  </View>
  
                  {etiquetaActual ? (
                    <View style={[s.etiquetaFeedback, { backgroundColor: c.bgInput }]}>
                      <Text style={s.emojiFeedback}>{etiquetaActual.emoji}</Text>
                      <Text style={[s.textoFeedback, { color: c.textPrimary }]}>
                        {t(`reserva.calificar.estrellas.${calificacion}`, { defaultValue: t(etiquetaActual.texto) })}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[s.textoPuntajeVacio, { color: c.textMuted }]}>
                      {t("reserva.calificar.tocaEstrellas", { defaultValue: "Toca las estrellas para calificar (1 a 5)" })}
                    </Text>
                  )}
                </View>
  
                {/* Campo de Comentarios */}
                <View style={s.bloqueComentario}>
                  <View style={s.labelFila}>
                    <Text style={[s.label, { color: c.textSecondary }]}>
                      {t("reserva.calificar.cuentanosOpinion", { defaultValue: "Cuéntanos tu opinión (opcional)" })}
                    </Text>
                    <Text
                      style={[
                        s.contadorTexto,
                        { color: comentario.length > MAX_CARACTERES ? "#EF4444" : c.textMuted },
                      ]}
                    >
                      {comentario.length}/{MAX_CARACTERES}
                    </Text>
                  </View>
  
                  <TextInput
                    style={[
                      s.comentarioInput,
                      {
                        color: c.textPrimary,
                        backgroundColor: c.bgInput,
                        borderColor: !validacion.valido ? "#EF4444" : c.border,
                      },
                    ]}
                    placeholder={t("reserva.calificar.placeholderComentario", { defaultValue: "Describe el estado del auto, limpieza, confort o rendimiento..." })}
                    placeholderTextColor={c.textMuted}
                    value={comentario}
                    onChangeText={setComentario}
                    multiline
                    numberOfLines={4}
                    maxLength={MAX_CARACTERES}
                    textAlignVertical="top"
                  />
  
                  {/* Alerta de Moderación */}
                  {!validacion.valido && validacion.mensajeError && (
                    <View style={s.alertaModeracion}>
                      <Ionicons name="alert-circle" size={15} color="#EF4444" style={{ marginTop: 1 }} />
                      <Text style={s.alertaTexto}>{getMensajeModeracion()}</Text>
                    </View>
                  )}
                </View>
  
                </>)}
  
                {mostrarSucursal && (
                  <View style={[s.bloqueComentario, mostrarVehiculo && { marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border }]}>
                    <Text style={[s.label, { color: c.textPrimary, fontWeight: "700" }]}>
                      {t("reserva.calificar.sucursalTitulo", { defaultValue: "Cuéntanos tu experiencia en la sucursal" })}
                    </Text>
                    {!!elegibilidad?.sucursalNombre && (
                      <Text style={[s.label, { color: c.textSecondary, marginBottom: 6 }]}>{elegibilidad.sucursalNombre}</Text>
                    )}
                    <View style={s.estrellasWrap}>
                      <SelectorEstrellas valor={calificacionSuc} onCambiar={setCalificacionSuc} tamano={34} />
                    </View>
                    <View style={[s.labelFila, { marginTop: 10 }]}>
                      <Text style={[s.label, { color: c.textSecondary }]}>
                        {t("reserva.calificar.sucursalResena", { defaultValue: "Tu reseña (opcional)" })}
                      </Text>
                      <Text style={[s.contadorTexto, { color: c.textMuted }]}>
                        {comentarioSuc.length}/{MAX_CARACTERES}
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        s.comentarioInput,
                        { color: c.textPrimary, backgroundColor: c.bgInput, borderColor: !validacionSuc.valido ? "#EF4444" : c.border },
                      ]}
                      placeholder={t("reserva.calificar.sucursalPlaceholder", { defaultValue: "¿Cómo fue la atención, la entrega y la devolución del vehículo?" })}
                      placeholderTextColor={c.textMuted}
                      value={comentarioSuc}
                      onChangeText={setComentarioSuc}
                      multiline
                      numberOfLines={4}
                      maxLength={MAX_CARACTERES}
                      textAlignVertical="top"
                    />
                    {!validacionSuc.valido && !!validacionSuc.mensajeError && (
                      <View style={s.alertaModeracion}>
                        <Ionicons name="alert-circle" size={15} color="#EF4444" style={{ marginTop: 1 }} />
                        <Text style={s.alertaTexto}>{validacionSuc.mensajeError}</Text>
                      </View>
                    )}
                  </View>
                )}
  
              </ScrollView>
  
              {/* Botones de Acción FIJOS en la parte inferior del Modal */}
              <View style={[s.botones, { borderTopColor: c.border }]}>
                <TouchableOpacity
                  style={[s.btnCancelar, { borderColor: c.border, backgroundColor: c.bgInput }]}
                  onPress={onCerrar}
                  activeOpacity={0.8}
                  disabled={guardando}
                >
                  <Text style={[s.btnCancelarTexto, { color: c.textSecondary }]}>
                    {t("comun.cancelar", { defaultValue: "Cancelar" })}
                  </Text>
                </TouchableOpacity>
  
                <TouchableOpacity
                  style={[s.btnGuardarWrap, { opacity: guardando ? 0.7 : 1 }]}
                  onPress={handleGuardar}
                  activeOpacity={0.85}
                  disabled={guardando}
                >
                  <LinearGradient
                    colors={puedeGuardar ? GRADIENTES.boton.colors : ["#94A3B8", "#64748B"]}
                    start={GRADIENTES.boton.start}
                    end={GRADIENTES.boton.end}
                    style={s.btnGuardarGradiente}
                  >
                    {guardando ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                        <Text style={s.btnGuardarTexto}>
                          {t("reserva.calificar.publicarResena", { defaultValue: "Publicar reseña" })}
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
  )
}
