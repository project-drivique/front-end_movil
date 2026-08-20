import React from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR_MARCA } from "../constants/reservation.constants";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";

export interface OpcionLugar {
  value: string;
  label: string;
  icono?: keyof typeof Ionicons.glyphMap;
}

interface Props {
  visible: boolean;
  titulo?: string;
  opciones: OpcionLugar[];
  onSeleccionar: (value: string) => void;
  onCerrar: () => void;
}

export default function SelectorSucursalModal({ visible, titulo, opciones, onSeleccionar, onCerrar }: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCerrar}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCerrar}>
        <View style={[styles.sheet, { backgroundColor: c.bgCard }]} onStartShouldSetResponder={() => true}>
          <View style={[styles.header, { borderBottomColor: c.border }]}>
            <Text style={[styles.headerTitulo, { color: c.textPrimary }]}>{titulo ?? t("reserva.fechasLugar.eligeElLugar")}</Text>
            <TouchableOpacity onPress={onCerrar}>
              <Ionicons name="close" size={22} color={c.textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={opciones}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.opcion, { borderBottomColor: c.border }]} onPress={() => onSeleccionar(item.value)}>
                <Ionicons name={item.icono ?? "location-outline"} size={16} color={COLOR_MARCA} />
                <Text style={[styles.opcionText, { color: c.textPrimary }]}>{item.label}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: c.textMuted }]}>{t("reserva.fechasLugar.sinOpcionesDisponibles")}</Text>
            }
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitulo: { fontSize: 15, fontWeight: "800" },
  opcion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  opcionText: { fontSize: 13, fontWeight: "600" },
  emptyText: { fontSize: 12, textAlign: "center", padding: 20 },
});
