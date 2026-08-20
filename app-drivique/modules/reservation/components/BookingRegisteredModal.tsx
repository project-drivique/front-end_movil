// modules/reserva/components/ModalReservaRegistrada.tsx
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { COLOR_MARCA } from "../constants/reservation.constants";
import { GRADIENTES, SOMBRA_BOTON_GRADIENTE } from "@/constants/gradients";
import { useTranslation } from "react-i18next";

interface Props {
  visible: boolean;
  onPagarWompi: () => void;
  onCerrar: () => void;
}

export default function ModalReservaRegistrada({ visible, onPagarWompi, onCerrar }: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const primaryAccent = c.oscuro ? "#60A5FA" : COLOR_MARCA;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: c.bgCard }]}>
          <View style={[styles.iconoWrap, { backgroundColor: c.primaryBg }]}>
            <Ionicons name="checkmark-circle" size={40} color={primaryAccent} />
          </View>

          <Text style={[styles.titulo, { color: c.textPrimary }]}>{t("reserva.confirmacion.reservaRegistradaTitulo")}</Text>

          <Text style={[styles.descripcion, { color: c.textSecondary }]}>
            {t("reserva.confirmacion.reservaRegistradaDescripcion")}
          </Text>

          <Text style={[styles.linkTexto, { color: primaryAccent }]}>{t("reserva.confirmacion.redirigidoWompi")}</Text>
          <Text style={[styles.subTexto, { color: c.textMuted }]}>{t("reserva.confirmacion.confirmacionCuandoExitoso")}</Text>

          <TouchableOpacity style={styles.botonWompiWrap} onPress={onPagarWompi} activeOpacity={0.85}>
            <LinearGradient
              colors={GRADIENTES.boton.colors}
              start={GRADIENTES.boton.start}
              end={GRADIENTES.boton.end}
              style={styles.botonWompi}
            >
              <Ionicons name="card-outline" size={16} color="#fff" />
              <Text style={styles.botonWompiTexto}>{t("reserva.confirmacion.pagarConWompi")}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: "center",
  },
  iconoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  titulo: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  descripcion: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 14,
  },
  linkTexto: {
    fontSize: 12.5,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  subTexto: {
    fontSize: 11.5,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 16,
  },
  botonWompiWrap: {
    width: "100%",
    borderRadius: 14,
    ...SOMBRA_BOTON_GRADIENTE,
  },
  botonWompi: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
  },
  botonWompiTexto: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
});
