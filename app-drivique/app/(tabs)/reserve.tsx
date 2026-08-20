import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useReservaStore } from "@/store/reservationStore";
import FlujoReserva from "@/modules/reservation/components/BookingFlow";
import { GRADIENTES } from "@/constants/gradients";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";

export default function ReservarScreen() {
  const insets = useSafeAreaInsets();
  const vehiculo = useReservaStore((s) => s.vehiculoSeleccionado);
  const c = useTemaColores();
  const { t } = useTranslation();

  if (!vehiculo) {
    return (
      <View style={[styles.vacioContainer, { paddingTop: insets.top, backgroundColor: c.bg }]}>
        <Ionicons name="car-sport-outline" size={56} color={c.textMuted} />
        <Text style={[styles.vacioTitulo, { color: c.textPrimary }]}>{t("reserva.flujo.vacioTitulo")}</Text>
        <Text style={[styles.vacioTexto, { color: c.textMuted }]}>
          {t("reserva.flujo.vacioTexto")}
        </Text>
        <TouchableOpacity style={styles.vacioBtnWrap} onPress={() => router.push("/(tabs)/catalog")} activeOpacity={0.85}>
          <LinearGradient
            colors={GRADIENTES.boton.colors}
            start={GRADIENTES.boton.start}
            end={GRADIENTES.boton.end}
            style={styles.vacioBtn}
          >
            <Text style={styles.vacioBtnText}>{t("reserva.flujo.irAlCatalogo")}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return <FlujoReserva vehiculo={vehiculo} />;
}

const styles = StyleSheet.create({
  vacioContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  vacioTitulo: { fontSize: 16, fontWeight: "800", marginTop: 16 },
  vacioTexto: { fontSize: 13, textAlign: "center", marginTop: 6, marginBottom: 20 },
  vacioBtnWrap: { borderRadius: 10 },
  vacioBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  vacioBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
