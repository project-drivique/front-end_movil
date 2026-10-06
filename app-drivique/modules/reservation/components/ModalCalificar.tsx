// modules/reservation/components/ModalCalificar.tsx
//
// Modal interactivo para calificar (1 a 5 estrellas libres), comentar
// y subir hasta 3 fotos sobre un vehículo tras una reserva finalizada.
// Incluye moderación en tiempo real (ofensas, datos personales, links, longitud).
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import * as DocumentPicker from "expo-document-picker";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { GRADIENTES } from "@/constants/gradients";
import { SelectorEstrellas } from "./SelectorEstrellas";
import { ResenaGuardada, resenaService } from "../services/resenaService";
import { validarComentarioResena } from "../utils/reviewModeration";

const MAX_FOTOS = 3;
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
  onGuardado: (resena: ResenaGuardada) => void;
}

const ETIQUETAS_ESTRELLAS: Record<number, { texto: string; emoji: string }> = {
  1: { texto: "Mala experiencia", emoji: "😞" },
  2: { texto: "Regular", emoji: "😐" },
  3: { texto: "Bueno", emoji: "🙂" },
  4: { texto: "Muy bueno", emoji: "😊" },
  5: { texto: "¡Excelente experiencia!", emoji: "🤩" },
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
  const [fotos, setFotos] = useState<string[]>(valorInicial?.fotos ?? []);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (visible) {
      setCalificacion(valorInicial?.calificacion ?? 0);
      setComentario(valorInicial?.comentario ?? "");
      setFotos(valorInicial?.fotos ?? []);
      setGuardando(false);
    }
  }, [visible, valorInicial]);

  // Validación de moderación en tiempo real
  const validacion = useMemo(() => {
    return validarComentarioResena(comentario);
  }, [comentario]);

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

  const handleSeleccionarFotos = async () => {
    if (fotos.length >= MAX_FOTOS) {
      Alert.alert(
        t("reserva.calificar.limiteFotosTitulo", { defaultValue: "Límite de fotos" }),
        t("reserva.calificar.limiteFotosMensaje", {
          max: MAX_FOTOS,
          defaultValue: `Puedes adjuntar un máximo de ${MAX_FOTOS} fotos.`,
        })
      );
      return;
    }

    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (resultado.canceled || !resultado.assets || resultado.assets.length === 0) {
        return;
      }

      const nuevasUris = resultado.assets.map((a) => a.uri).filter(Boolean);
      const combinadas = [...fotos, ...nuevasUris].slice(0, MAX_FOTOS);
      setFotos(combinadas);
    } catch (error) {
      console.error("[ModalCalificar] Error seleccionando imagen", error);
      Alert.alert(
        t("comun.error", { defaultValue: "Error" }),
        t("reserva.calificar.errorSeleccionImagen", { defaultValue: "No fue posible seleccionar la imagen." })
      );
    }
  };

  const handleEliminarFoto = (indice: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== indice));
  };

  const handleGuardar = async () => {
    if (calificacion < 1) {
      Alert.alert(
        t("reserva.calificar.calificarVehiculo", { defaultValue: "Calificar vehículo" }),
        t("reserva.calificar.seleccionaEstrellasAlerta", {
          defaultValue: "Por favor selecciona una calificación de 1 a 5 estrellas.",
        })
      );
      return;
    }

    if (!validacion.valido) {
      Alert.alert(
        t("reserva.calificar.calificarVehiculo", { defaultValue: "Calificar vehículo" }),
        getMensajeModeracion()
      );
      return;
    }

    if (guardando) return;

    setGuardando(true);
    try {
      const resena = await resenaService.guardar(referenciaReserva, usuarioId, {
        calificacion,
        comentario: comentario.trim(),
        fotos,
        vehiculoId,
        vehiculoNombre,
        usuarioNombre,
      });
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
  const puedeGuardar = calificacion >= 1 && validacion.valido && !guardando;

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
                {valorInicial
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
                      {t(`reserva.calificar.estrellas.${calificacion}`, { defaultValue: etiquetaActual.texto })}
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

              {/* Selector de Fotos */}
              <View style={s.bloqueFotos}>
                <View style={s.labelFila}>
                  <Text style={[s.label, { color: c.textSecondary }]}>
                    {t("reserva.calificar.fotosOpcional", { defaultValue: "Fotos del vehículo (opcional)" })}
                  </Text>
                  <Text style={[s.contadorTexto, { color: c.textMuted }]}>
                    {fotos.length}/{MAX_FOTOS}
                  </Text>
                </View>

                <View style={s.fotosFila}>
                  {fotos.map((uri, index) => (
                    <View key={index} style={s.fotoThumbWrap}>
                      <Image source={{ uri }} style={s.fotoThumb} />
                      <TouchableOpacity
                        style={s.btnEliminarFoto}
                        onPress={() => handleEliminarFoto(index)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="close" size={14} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {fotos.length < MAX_FOTOS && (
                    <TouchableOpacity
                      style={[
                        s.btnAnadirFoto,
                        { backgroundColor: c.bgInput, borderColor: c.border },
                      ]}
                      onPress={handleSeleccionarFotos}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="camera-outline" size={22} color={c.primary} />
                      <Text style={[s.btnAnadirFotoTexto, { color: c.primary }]}>
                        {t("reserva.calificar.anadirFoto", { defaultValue: "+ Añadir" })}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
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
                        {valorInicial
                          ? t("reserva.calificar.actualizarResena", { defaultValue: "Actualizar reseña" })
                          : t("reserva.calificar.publicarResena", { defaultValue: "Publicar reseña" })}
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
