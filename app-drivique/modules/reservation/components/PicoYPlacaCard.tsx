import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { COLOR_ACENTO } from "@/constants/brandPalette";
import { COLOR_MARCA } from "../constants/reservation.constants";

export function PicoYPlacaCard() {
  const c = useTemaColores();
  const { t } = useTranslation();
  const primaryAccent = c.oscuro ? COLOR_ACENTO : COLOR_MARCA;

  const handleIrPagina = () => {
    Linking.openURL("https://www.pyphoy.com/");
  };

  return (
    <View style={[styles.card, { backgroundColor: c.bgCard, borderColor: c.border }]}>
      <View style={styles.headerRow}>
        <Ionicons name="car-sport-outline" size={16} color={primaryAccent} />
        <Text style={[styles.titulo, { color: primaryAccent }]}>
          {t("vehiculo.picoYPlacaTitle", { defaultValue: "Consultar Pico y Placa" })}
        </Text>
      </View>

      <Text style={[styles.descripcion, { color: c.textSecondary }]}>
        {t("vehiculo.picoYPlacaDesc", {
          defaultValue:
            "¿No estás seguro de si este vehículo tiene restricción de movilidad hoy? Consulta la información oficial a nivel nacional para planificar tu ruta y evitar multas o contratiempos durante tu reserva. Recuerda que las restricciones varían según la ciudad y el día de la semana.",
        })}
      </Text>

      <TouchableOpacity
        style={[styles.boton, { borderColor: primaryAccent, backgroundColor: c.oscuro ? "rgba(30, 58, 138, 0.2)" : "rgba(37, 99, 235, 0.06)" }]}
        onPress={handleIrPagina}
        activeOpacity={0.8}
      >
        <Text style={[styles.botonTexto, { color: primaryAccent }]}>
          {t("vehiculo.goToPage", { defaultValue: "Ir a la página oficial" })}
        </Text>
        <Ionicons name="open-outline" size={14} color={primaryAccent} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  titulo: {
    fontSize: 13,
    fontWeight: "700",
  },
  descripcion: {
    fontSize: 11.5,
    lineHeight: 17,
    marginBottom: 12,
  },
  boton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.2,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },
  botonTexto: {
    fontSize: 12,
    fontWeight: "700",
  },
});
