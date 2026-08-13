import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordRequirements } from "@/modules/auth/components/PasswordRequirements";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { esContrasenaSegura } from "@/utils/validators";
import { cambiarContrasena } from "../services/passwordService";

type Props = {
  visible: boolean;
  correo: string;
  token: string | null;
  onCerrar: () => void;
  onExito: () => void;
  onError: () => void;
};

export function ChangePasswordModal({ visible, correo, token, onCerrar, onExito, onError }: Props) {
  const { t } = useTranslation();
  const c = useTemaColores();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);

  const limpiar = () => {
    setActual(""); setNueva(""); setConfirmacion(""); setErrores({}); setGuardando(false);
  };

  useEffect(() => { if (!visible) limpiar(); }, [visible]);

  const cancelar = () => { limpiar(); onCerrar(); };

  const guardar = async () => {
    const siguientes: Record<string, string> = {};
    if (!actual) siguientes.actual = t("perfil.cambiarContrasena.actualRequerida");
    if (!esContrasenaSegura(nueva)) siguientes.nueva = t("perfil.cambiarContrasena.nuevaInsegura");
    if (!confirmacion) siguientes.confirmacion = t("perfil.cambiarContrasena.confirmacionRequerida");
    else if (nueva !== confirmacion) siguientes.confirmacion = t("perfil.cambiarContrasena.noCoinciden");
    if (actual && actual === nueva) siguientes.nueva = t("perfil.cambiarContrasena.debeSerDiferente");
    setErrores(siguientes);
    if (Object.keys(siguientes).length) return;

    setGuardando(true);
    try {
      const resultado = await cambiarContrasena({ correo, token, contrasenaActual: actual, nuevaContrasena: nueva });
      if (resultado === "incorrecta") {
        setErrores({ actual: t("perfil.cambiarContrasena.actualIncorrecta") });
        onError();
        return;
      }
      limpiar();
      onExito();
    } catch {
      onError();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={cancelar}>
      <Pressable style={s.overlay} onPress={cancelar}>
        <Pressable style={[s.card, { backgroundColor: c.bgCard }]} onPress={() => {}}>
          <View style={s.header}>
            <View style={[s.icono, { backgroundColor: c.primaryBg }]}><Ionicons name="shield-checkmark-outline" size={22} color={c.primary} /></View>
            <View style={s.headerTextos}>
              <Text style={[s.titulo, { color: c.textPrimary }]}>{t("perfil.cambiarContrasena.titulo")}</Text>
              <Text style={[s.subtitulo, { color: c.textMuted }]}>{t("perfil.cambiarContrasena.subtitulo")}</Text>
            </View>
            <TouchableOpacity onPress={cancelar}><Ionicons name="close" size={24} color={c.textMuted} /></TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <PasswordInput label={t("perfil.cambiarContrasena.actual")} value={actual} onChangeText={(v) => { setActual(v); setErrores((e) => ({ ...e, actual: "" })); }} error={errores.actual} />
            <PasswordInput label={t("perfil.cambiarContrasena.nueva")} value={nueva} onChangeText={(v) => { setNueva(v); setErrores((e) => ({ ...e, nueva: "", confirmacion: "" })); }} error={errores.nueva} />
            <PasswordRequirements password={nueva} />
            <PasswordInput label={t("perfil.cambiarContrasena.confirmar")} value={confirmacion} onChangeText={(v) => { setConfirmacion(v); setErrores((e) => ({ ...e, confirmacion: "" })); }} error={errores.confirmacion} />
          </ScrollView>

          <View style={s.acciones}>
            <TouchableOpacity style={[s.cancelar, { borderColor: c.border }]} onPress={cancelar} disabled={guardando}><Text style={[s.cancelarTexto, { color: c.textSecondary }]}>{t("perfil.cambiarContrasena.cancelar")}</Text></TouchableOpacity>
            <TouchableOpacity style={[s.guardar, { backgroundColor: c.primary }, guardando && { opacity: .6 }]} onPress={guardar} disabled={guardando}>
              {guardando ? <ActivityIndicator color="#fff" /> : <Text style={s.guardarTexto}>{t("perfil.cambiarContrasena.actualizar")}</Text>}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(15,23,42,.62)", justifyContent: "flex-end" },
  card: { maxHeight: "92%", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 28 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  icono: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTextos: { flex: 1 }, titulo: { fontSize: 18, fontWeight: "800" }, subtitulo: { fontSize: 12.5, marginTop: 2 },
  acciones: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelar: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cancelarTexto: { fontSize: 14, fontWeight: "700" },
  guardar: { flex: 1.4, minHeight: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  guardarTexto: { color: "#fff", fontSize: 14, fontWeight: "800" },
});
