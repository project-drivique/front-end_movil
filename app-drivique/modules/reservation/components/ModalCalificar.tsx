// modules/reservation/components/ModalCalificar.tsx
//
// Modal interactivo para calificar (1 a 5 estrellas libres), comentar
// sobre un vehículo tras una reserva finalizada.
// Incluye moderación en tiempo real (ofensas, datos personales, links, longitud).
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { GRADIENTES } from "@/constants/gradients";
import { SelectorEstrellas } from "./SelectorEstrellas";
import { ElegibilidadResena, ResenaGuardada, resenaService } from "../services/resenaService";
import { validarComentarioResena } from "../utils/reviewModeration";
import { Alert } from "@/utils/alerta";

const MAX_CARACTERES = 400;

interface Props {
  visible: boolean;
  referenciaReserva: string;
  usuarioId: string;
  usuarioNombre?: string;
  vehiculoId?: number | string;
  vehiculoNombre?: string;
  valorInicial?: ResenaGuardada | null;
  onCerrar: () => void;
  onGuardado: (resena: ResenaGuardada | null) => void;
}

const ETIQUETAS_ESTRELLAS: Record<number, { texto: string; emoji: string }> = {
  1: { texto: "extra.calificar.e1", emoji: "😞" },
  2: { texto: "extra.calificar.e2", emoji: "😐" },
  3: { texto: "extra.calificar.e3", emoji: "🙂" },
  4: { texto: "extra.calificar.e4", emoji: "😊" },
  5: { texto: "extra.calificar.e5", emoji: "🤩" },
};

export function ModalCalificar({
  visible,
  referenciaReserva,
  usuarioId,
  usuarioNombre,
  vehiculoId,
  vehiculoNombre,
  valorInicial,
  onCerrar,
  onGuardado,
}: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();

  const [calificacion, setCalificacion] = useState(valorInicial?.calificacion ?? 0);
  const [comentario, setComentario] = useState(valorInicial?.comentario ?? "");
  const [guardando, setGuardando] = useState(false);
  const [elegibilidad, setElegibilidad] = useState<ElegibilidadResena | null>(null);
  const [calificacionSuc, setCalificacionSuc] = useState(0);
  const [comentarioSuc, setComentarioSuc] = useState("");

  useEffect(() => {
    if (visible) {
      setCalificacion(valorInicial?.calificacion ?? 0);
      setComentario(valorInicial?.comentario ?? "");
      setCalificacionSuc(0);
      setComentarioSuc("");
      setGuardando(false);
    }
  }, [visible, valorInicial]);

  // Igual que la web: el servidor dice si se puede reseñar el vehículo y/o la sucursal
  useEffect(() => {
    if (!visible || !referenciaReserva) return;
    let activo = true;
    resenaService
      .obtenerElegibilidad(referenciaReserva)
      .then((e) => activo && setElegibilidad(e))
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, [visible, referenciaReserva]);

  const mostrarVehiculo = !valorInicial && (!elegibilidad || elegibilidad.puedeVehiculo);
  const mostrarSucursal = !!elegibilidad?.puedeSucursal && !!elegibilidad.sucursalId;

  // Validación de moderación en tiempo real
  const validacion = useMemo(() => {
    return validarComentarioResena(comentario);
  }, [comentario]);
  const validacionSuc = useMemo(() => validarComentarioResena(comentarioSuc), [comentarioSuc]);

  const getMensajeModeracion = () => {
    if (!validacion.tipo) return validacion.mensajeError;
    switch (validacion.tipo) {
      case "length":
        return comentario.length > 400
          ? t("reserva.calificar.moderacion.lengthMax", { defaultValue: "El comentario no puede exceder los 400 caracteres." })
          : t("reserva.calificar.moderacion.lengthMin", { defaultValue: "El comentario debe tener al menos 8 caracteres." });
      case "links":
        return t("reserva.calificar.moderacion.links", { defaultValue: "Por seguridad, no se permiten enlaces o páginas web en la reseña." });
      case "privacy":
        return t("reserva.calificar.moderacion.privacy", { defaultValue: "Por tu seguridad, no incluyas datos personales, correos ni teléfonos." });
      case "spam":
        return t("reserva.calificar.moderacion.spam", { defaultValue: "Por favor evita la repetición excesiva de caracteres." });
      case "profanity":
        return t("reserva.calificar.moderacion.profanity", { defaultValue: "Por favor mantén un lenguaje respetuoso y cordial en tu reseña." });
      default:
        return validacion.mensajeError;
    }
  };

  const handleGuardar = async () => {
    const enviarVehiculo = mostrarVehiculo && calificacion >= 1;
    const enviarSucursal = mostrarSucursal && calificacionSuc >= 1;

    if (!enviarVehiculo && !enviarSucursal) {
      Alert.alert(
        t("reserva.calificar.calificarVehiculo", { defaultValue: "Calificar vehículo" }),
        t("reserva.calificar.seleccionaEstrellasAlerta", {
          defaultValue: "Por favor selecciona una calificación de 1 a 5 estrellas.",
        })
      );
      return;
    }

    if ((enviarVehiculo && !validacion.valido) || (enviarSucursal && !validacionSuc.valido)) {
      Alert.alert(
        t("reserva.calificar.calificarVehiculo", { defaultValue: "Calificar vehículo" }),
        enviarVehiculo && !validacion.valido ? getMensajeModeracion() : validacionSuc.mensajeError
      );
      return;
    }

    if (guardando) return;

    setGuardando(true);
    try {
      let resena: ResenaGuardada | null = null;
      if (enviarVehiculo) {
        resena = await resenaService.guardar(referenciaReserva, usuarioId, {
          calificacion,
          comentario: comentario.trim(),
          vehiculoId,
          vehiculoNombre,
          usuarioNombre,
        });
      }
      if (enviarSucursal && elegibilidad?.sucursalId) {
        await resenaService.guardarSucursal(referenciaReserva, elegibilidad.sucursalId, {
          calificacion: calificacionSuc,
          comentario: comentarioSuc.trim(),
        });
      }
      onGuardado(resena);
    } catch (error) {
      console.error("[ModalCalificar] Error guardando reseña", error);
      Alert.alert(
        t("comun.error", { defaultValue: "Error" }),
        t("reserva.calificar.errorGuardarCalificacion", { defaultValue: "Ocurrió un error al guardar la calificación." })
      );
    } finally {
      setGuardando(false);
    }
  };

  const etiquetaActual = ETIQUETAS_ESTRELLAS[calificacion];
  const puedeGuardar =
    ((mostrarVehiculo && calificacion >= 1 && validacion.valido) ||
      (mostrarSucursal && calificacionSuc >= 1 && validacionSuc.valido)) &&
    !guardando;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
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
    </Modal>
  );
}

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
