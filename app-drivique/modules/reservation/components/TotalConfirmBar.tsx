// modules/reserva/components/BarraTotalConfirmar.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { GRADIENTES } from "@/constants/gradients";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { fmt, styles as piezas } from "./BookingSummaryModal.pieces";

interface Props {
  total: number;
  onConfirmar: () => void;
}

export default function BarraTotalConfirmar({ total, onConfirmar }: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();

  return (
    <View style={[styles.contenedor, { backgroundColor: c.bgCard, borderColor: c.border }]}>
      <View style={piezas.totalBlock}>
        <Text style={[piezas.totalLabelChica, { color: c.textSecondary }]}>{t("reserva.confirmacion.totalAPagar")}</Text>
        <Text style={[piezas.totalValorGrande, { color: c.textPrimary }]}>{fmt(total)}</Text>
        <Text style={[piezas.totalNota, { color: c.textMuted }]}>{t("reserva.confirmacion.notaTotalPagar")}</Text>
      </View>

      <TouchableOpacity style={styles.botonWrap} onPress={onConfirmar} activeOpacity={0.85}>
        <LinearGradient
          colors={GRADIENTES.boton.colors}
          start={GRADIENTES.boton.start}
          end={GRADIENTES.boton.end}
          style={styles.boton}
        >
          <Text style={styles.botonTexto}>{t("reserva.confirmacion.confirmarReserva")}</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 16,
    marginBottom: 4,
  },
  botonWrap: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    borderRadius: 14,
  },
  boton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
  },
  botonTexto: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
});
