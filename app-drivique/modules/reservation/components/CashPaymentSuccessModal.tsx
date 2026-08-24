import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Clipboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { LinearGradient } from "expo-linear-gradient";
import { GRADIENTES } from "@/constants/gradients";
import { COLOR_MARCA } from "@/modules/catalog/constants/catalog.constants";

interface Props {
  visible: boolean;
  codigoVerificacion: string;
  lugarPago?: string;
  onFinalizar: (sucursalesSeleccionadas: string[]) => void;
}

export function CashPaymentSuccessModal({
  visible,
  codigoVerificacion,
  lugarPago,
  onFinalizar,
}: Props) {
  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = () => {
    Clipboard.setString(codigoVerificacion);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleFinalizar = () => onFinalizar([lugarPago ?? ""]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleFinalizar}>
      <View style={[styles.container, { paddingTop: Platform.OS === "android" ? insets.top : 0 }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Encabezado */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: `${COLOR_MARCA}12` }]}>
              <Ionicons name="cash-outline" size={44} color={COLOR_MARCA} />
            </View>
            <Text style={[styles.title, { color: c.textPrimary }]}>
              !Reserva Registrada!
            </Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              Tu reserva esta{" "}
              <Text style={styles.pendienteText}>Pendiente de Pago</Text>.{"\n"}
              Acercate a la sucursal para completarla.
            </Text>
          </View>

          {/* Tarjeta con codigo de verificacion */}
          <View style={styles.card}>
            <Text style={[styles.codeLabel, { color: c.textMuted }]}>
              Codigo de Verificacion
            </Text>
            <View style={styles.codeRow}>
              <Text style={[styles.codeValue, { color: COLOR_MARCA }]}>
                {codigoVerificacion}
              </Text>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopiar} activeOpacity={0.7}>
                <Ionicons
                  name={copiado ? "checkmark" : "copy-outline"}
                  size={20}
                  color={copiado ? "#16a34a" : COLOR_MARCA}
                />
                <Text style={[styles.copyBtnText, { color: copiado ? "#16a34a" : COLOR_MARCA }]}>
                  {copiado ? "Copiado" : "Copiar"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.warningContainer}>
              <Ionicons name="time-outline" size={18} color="#dc2626" />
              <Text style={styles.warningText}>
                Tienes <Text style={styles.boldText}>72 horas</Text> para acercarte a pagar. De lo contrario la reserva se cancelara automaticamente.
              </Text>
            </View>
          </View>

          {/* Sucursal de pago fija */}
          <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Donde pagar?</Text>
          <Text style={[styles.sectionDesc, { color: c.textMuted }]}>
            El pago debe realizarse en la misma sucursal donde se encuentra el vehiculo reservado.
          </Text>

          <View style={styles.sucursalCard}>
            <View style={styles.sucursalFranja} />
            <View style={styles.sucursalBody}>
              <View style={styles.sucursalIconoWrap}>
                <Ionicons name="storefront-outline" size={22} color="#b45309" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sucursalLabel}>Sucursal de pago</Text>
                <Text style={styles.sucursalNombre}>
                  {lugarPago ?? "Sucursal del vehiculo"}
                </Text>
              </View>
            </View>
            <View style={styles.sucursalInfoRow}>
              <Ionicons name="information-circle-outline" size={14} color="#6b7280" />
              <Text style={styles.sucursalInfoTexto}>
                Muestra tu codigo de verificacion al encargado al momento de pagar.
              </Text>
            </View>
          </View>

          {/* Pasos */}
          <Text style={[styles.sectionTitle, { color: c.textPrimary, marginTop: 8 }]}>Pasos a seguir</Text>
          {([
            ["navigate-outline", "Ve a la sucursal donde se encuentra el vehiculo."],
            ["cash-outline", "Realiza el pago en efectivo al encargado."],
            ["qr-code-outline", "Muestra tu codigo de verificacion."],
            ["mail-outline", "Recibiras un correo con el link para firmar el contrato."],
            ["document-text-outline", "Firma el contrato desde la app para confirmar tu reserva."],
          ] as const).map(([icono, texto], i) => (
            <View key={i} style={styles.pasoRow}>
              <View style={styles.pasoNumero}>
                <Text style={styles.pasoNumeroTexto}>{i + 1}</Text>
              </View>
              <Ionicons name={icono} size={17} color={COLOR_MARCA} style={{ marginRight: 8 }} />
              <Text style={[styles.pasoTexto, { color: c.textSecondary }]}>{texto}</Text>
            </View>
          ))}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
          <TouchableOpacity onPress={handleFinalizar} activeOpacity={0.85}>
            <LinearGradient
              colors={GRADIENTES.boton.colors}
              start={GRADIENTES.boton.start}
              end={GRADIENTES.boton.end}
              style={styles.finishBtn}
            >
              <Ionicons name="receipt-outline" size={20} color="#fff" />
              <Text style={styles.finishBtnText}>Ver en Mis Reservas</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: { padding: 24 },
  header: { alignItems: "center", marginTop: 16, marginBottom: 24 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { fontSize: 26, fontWeight: "900", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  pendienteText: { fontWeight: "800", color: "#f59e0b" },
  card: {
    backgroundColor: "#ffffff", borderRadius: 16, borderWidth: 1.3, borderColor: "#e5e7eb",
    padding: 20, alignItems: "center", marginBottom: 28,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  codeLabel: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 },
  codeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, width: "100%", marginBottom: 20 },
  codeValue: { fontSize: 32, fontWeight: "900", letterSpacing: 2 },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f3f4f6", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  copyBtnText: { fontSize: 12, fontWeight: "700" },
  warningContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", padding: 12, borderRadius: 12, gap: 10, width: "100%" },
  warningText: { flex: 1, fontSize: 12, color: "#7f1d1d", lineHeight: 18 },
  boldText: { fontWeight: "800" },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  sectionDesc: { fontSize: 13, lineHeight: 20, marginBottom: 16 },
  sucursalCard: {
    backgroundColor: "#ffffff", borderRadius: 14, borderWidth: 1.5, borderColor: "#fbbf24",
    overflow: "hidden", marginBottom: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  sucursalFranja: { height: 5, backgroundColor: "#f59e0b" },
  sucursalBody: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, paddingBottom: 12 },
  sucursalIconoWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center" },
  sucursalLabel: { fontSize: 10, fontWeight: "800", color: "#b45309", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  sucursalNombre: { fontSize: 15, fontWeight: "800", color: "#78350f" },
  sucursalInfoRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginHorizontal: 16, paddingBottom: 14, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#fef3c7" },
  sucursalInfoTexto: { flex: 1, fontSize: 12, color: "#6b7280", lineHeight: 17 },
  pasoRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14, gap: 4 },
  pasoNumero: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLOR_MARCA, alignItems: "center", justifyContent: "center", marginRight: 6, flexShrink: 0 },
  pasoNumeroTexto: { color: "#fff", fontSize: 11, fontWeight: "900" },
  pasoTexto: { flex: 1, fontSize: 13, lineHeight: 19 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#ffffff", paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  finishBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18, borderRadius: 16 },
  finishBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
});
