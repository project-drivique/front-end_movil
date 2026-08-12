// modules/reservation/components/ModalCalificar.tsx
//
// Modal para calificar (1 a 5 estrellas) y comentar una reserva
// finalizada, o editar una calificación ya guardada. Mismo patrón visual
// que components/ui/AlertModal.tsx (overlay + card centrada).
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { SelectorEstrellas } from "./SelectorEstrellas";
import { ResenaGuardada, resenaService } from "../services/resenaService";

interface Props {
  visible: boolean;
  referenciaReserva: string;
  valorInicial?: ResenaGuardada | null;
  onCerrar: () => void;
  onGuardado: (resena: ResenaGuardada) => void;
}

export function ModalCalificar({
  visible,
  referenciaReserva,
  valorInicial,
  onCerrar,
  onGuardado,
}: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const [calificacion, setCalificacion] = useState(valorInicial?.calificacion ?? 0);
  const [comentario, setComentario] = useState(valorInicial?.comentario ?? "");

  useEffect(() => {
    if (visible) {
      setCalificacion(valorInicial?.calificacion ?? 0);
      setComentario(valorInicial?.comentario ?? "");
    }
  }, [visible, valorInicial]);

  const handleGuardar = async () => {
    if (calificacion < 1) return;
    const resena = await resenaService.guardar(referenciaReserva, { calificacion, comentario });
    onGuardado(resena);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <Pressable style={s.overlay} onPress={onCerrar}>
        <Pressable style={[s.card, { backgroundColor: c.bgCard }]} onPress={() => {}}>
          <Text style={[s.titulo, { color: c.textPrimary }]}>
            {valorInicial ? t("misReservas.editarCalificacion") : t("misReservas.calificarViaje")}
          </Text>

          <Text style={[s.label, { color: c.textSecondary }]}>{t("misReservas.tuCalificacion")}</Text>
          <View style={s.estrellasWrap}>
            <SelectorEstrellas valor={calificacion} onCambiar={setCalificacion} />
          </View>

          <TextInput
            style={[
              s.comentarioInput,
              { color: c.textPrimary, backgroundColor: c.bgInput, borderColor: c.border },
            ]}
            placeholder={t("misReservas.comentarioPlaceholder") ?? ""}
            placeholderTextColor={c.textMuted}
            value={comentario}
            onChangeText={setComentario}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={s.botones}>
            <TouchableOpacity
              style={[s.btnCancelar, { borderColor: c.border }]}
              onPress={onCerrar}
              activeOpacity={0.8}
            >
              <Text style={[s.btnCancelarTexto, { color: c.textSecondary }]}>
                {t("misReservas.cancelar")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btnGuardar, { backgroundColor: c.primary, opacity: calificacion < 1 ? 0.5 : 1 }]}
              onPress={handleGuardar}
              activeOpacity={0.85}
              disabled={calificacion < 1}
            >
              <Text style={s.btnGuardarTexto}>{t("misReservas.guardarCalificacion")}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 16,
    padding: 22,
  },
  titulo: { fontSize: 17, fontWeight: "800", textAlign: "center", marginBottom: 16 },
  label: { fontSize: 12.5, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  estrellasWrap: { alignItems: "center", marginBottom: 18 },
  comentarioInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 13.5,
    minHeight: 90,
    marginBottom: 18,
  },
  botones: { flexDirection: "row", gap: 10 },
  btnCancelar: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCancelarTexto: { fontSize: 14, fontWeight: "700" },
  btnGuardar: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGuardarTexto: { color: "#fff", fontSize: 14, fontWeight: "800" },
});
