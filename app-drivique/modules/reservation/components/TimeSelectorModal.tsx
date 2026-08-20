import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { COLOR_MARCA, formatHoraAmPm } from "../constants/reservation.constants";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";

function generarHoras(): string[] {
  const horas: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      horas.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return horas;
}

const HORAS = generarHoras();

interface Props {
  visible: boolean;
  horaSeleccionada: string;
  onSeleccionar: (hora: string) => void;
  onCerrar: () => void;
}

export default function SelectorHoraModal({ visible, horaSeleccionada, onSeleccionar, onCerrar }: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <TouchableWithoutFeedback onPress={onCerrar}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, { backgroundColor: c.bgCard }]}>
              <View style={[styles.header, { borderBottomColor: c.border }]}>
                <Text style={[styles.headerTitulo, { color: c.textPrimary }]}>{t("reserva.fechasLugar.seleccionaHora")}</Text>
                <TouchableOpacity onPress={onCerrar} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.cerrarTexto}>{t("reserva.resumen.cerrar")}</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.lista} showsVerticalScrollIndicator={false}>
                {HORAS.map((hora) => {
                  const activa = hora === horaSeleccionada;
                  return (
                    <TouchableOpacity
                      key={hora}
                      style={[styles.item, activa && { backgroundColor: c.primaryBg }]}
                      onPress={() => {
                        onSeleccionar(hora);
                        onCerrar();
                      }}
                    >
                      {/* Se muestra con a. m. / p. m. para que no quede ambiguo */}
                      <Text style={[styles.itemTexto, { color: c.textSecondary }, activa && styles.itemTextoActivo]}>
                        {formatHoraAmPm(hora)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "flex-end" },
  card: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "65%",
    paddingBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitulo: { fontSize: 14, fontWeight: "800" },
  cerrarTexto: { fontSize: 13, fontWeight: "700", color: COLOR_MARCA },
  lista: { paddingHorizontal: 8, paddingTop: 4 },
  item: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10 },
  itemTexto: { fontSize: 13, fontWeight: "600" },
  itemTextoActivo: { fontWeight: "800", color: COLOR_MARCA },
});
