// modules/i18n/components/ConfiguracionModal.tsx
//
// Bottom-sheet con tema / idioma / moneda, pensado para el modo invitado
// del catálogo (donde no hay tab de Perfil desde donde llegar a esto).
// Mismo contenido que la sección de configuración de perfil.tsx, pero
// como modal independiente y reutilizable.

import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { IdiomaKey, IDIOMAS } from "@/modules/i18n";
import { useIdioma, useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useMoneda } from "@/hooks/useCurrency";
import { AlertModal } from "@/components/ui/AlertModal";
import { Moneda } from "@/utils/currencyUtils";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ConfiguracionModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const c = useTemaColores();
  const { idiomaActual, cambiarIdioma, temaActual, cambiarTema } = useIdioma();
  const { monedaActual, cambiarMoneda } = useMoneda();
  const [mostrarAvisoUSD, setMostrarAvisoUSD] = useState(false);

  // Al elegir USD solo cambia la referencia visual de los precios; el
  // cobro real con Wompi siempre se hace en COP (mismo aviso que Perfil).
  const handleCambiarMoneda = (moneda: Moneda) => {
    cambiarMoneda(moneda);
    if (moneda === "USD") setMostrarAvisoUSD(true);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: c.bgCard }]} onPress={() => {}}>
          <View style={[styles.handle, { backgroundColor: c.border }]} />

          <View style={styles.header}>
            <Text style={[styles.titulo, { color: c.textPrimary }]}>{t("config.ajustes")}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={c.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.labelRow}>
              <Ionicons name="color-palette-outline" size={16} color="#1D4ED8" />
              <Text style={[styles.label, { color: c.textPrimary }]}>{t("config.tema")}</Text>
            </View>
            <View style={styles.fila}>
              <TouchableOpacity
                style={[
                  styles.opcionBtn,
                  { borderColor: c.border, backgroundColor: c.bgInput },
                  temaActual === "claro" && styles.opcionBtnActivo,
                ]}
                onPress={() => cambiarTema("claro")}
              >
                <Ionicons
                  name="sunny-outline"
                  size={15}
                  color={temaActual === "claro" ? "#1D4ED8" : c.textSecondary}
                />
                <Text
                  style={[
                    styles.opcionBtnTexto,
                    { color: c.textPrimary },
                    temaActual === "claro" && styles.opcionBtnTextoActivo,
                  ]}
                >
                  {t("config.claro")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.opcionBtn,
                  { borderColor: c.border, backgroundColor: c.bgInput },
                  temaActual === "oscuro" && styles.opcionBtnActivo,
                ]}
                onPress={() => cambiarTema("oscuro")}
              >
                <Ionicons
                  name="moon-outline"
                  size={15}
                  color={temaActual === "oscuro" ? "#1D4ED8" : c.textSecondary}
                />
                <Text
                  style={[
                    styles.opcionBtnTexto,
                    { color: c.textPrimary },
                    temaActual === "oscuro" && styles.opcionBtnTextoActivo,
                  ]}
                >
                  {t("config.oscuro")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.labelRow, { marginTop: 18 }]}>
              <Ionicons name="language-outline" size={16} color="#1D4ED8" />
              <Text style={[styles.label, { color: c.textPrimary }]}>{t("config.idioma")}</Text>
            </View>
            <View style={styles.idiomasWrap}>
              {(Object.keys(IDIOMAS) as IdiomaKey[]).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.idiomaBtn,
                    { borderColor: c.border, backgroundColor: c.bgInput },
                    idiomaActual === key && styles.opcionBtnActivo,
                  ]}
                  onPress={() => cambiarIdioma(key)}
                >
                  <Text style={styles.idiomaFlag}>{IDIOMAS[key].flag}</Text>
                  <Text
                    style={[
                      styles.idiomaLabel,
                      { color: c.textPrimary },
                      idiomaActual === key && styles.opcionBtnTextoActivo,
                    ]}
                  >
                    {IDIOMAS[key].label}
                  </Text>
                  {idiomaActual === key && (
                    <Ionicons name="checkmark-circle" size={18} color="#1D4ED8" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.labelRow, { marginTop: 18 }]}>
              <Ionicons name="cash-outline" size={16} color="#1D4ED8" />
              <Text style={[styles.label, { color: c.textPrimary }]}>{t("config.moneda")}</Text>
            </View>
            <View style={styles.fila}>
              <TouchableOpacity
                style={[
                  styles.opcionBtn,
                  { borderColor: c.border, backgroundColor: c.bgInput },
                  monedaActual === "COP" && styles.opcionBtnActivo,
                ]}
                onPress={() => handleCambiarMoneda("COP")}
              >
                <Text
                  style={[
                    styles.opcionBtnTexto,
                    { color: c.textPrimary },
                    monedaActual === "COP" && styles.opcionBtnTextoActivo,
                  ]}
                >
                  🇨🇴 COP
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.opcionBtn,
                  { borderColor: c.border, backgroundColor: c.bgInput },
                  monedaActual === "USD" && styles.opcionBtnActivo,
                ]}
                onPress={() => handleCambiarMoneda("USD")}
              >
                <Text
                  style={[
                    styles.opcionBtnTexto,
                    { color: c.textPrimary },
                    monedaActual === "USD" && styles.opcionBtnTextoActivo,
                  ]}
                >
                  🇺🇸 USD
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>

      <AlertModal
        visible={mostrarAvisoUSD}
        icono="information-circle-outline"
        titulo={t("config.monedaUsdTitulo")}
        mensaje=""
        contenido={
          <Text style={{ fontSize: 13.5, color: "#4B5563", textAlign: "center", lineHeight: 20, marginBottom: 24, marginTop: -16 }}>
            {t("config.monedaUsdParte1")}
            <Text style={{ fontWeight: "700" }}>{t("config.monedaUsdDolares")}</Text>
            {t("config.monedaUsdParte2")}
            {"\n\n"}
            {t("config.monedaUsdParte3")}
            <Text style={{ fontWeight: "700" }}>{t("config.monedaUsdPesos")}</Text>
            {t("config.monedaUsdParte4")}
          </Text>
        }
        onCerrar={() => setMostrarAvisoUSD(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "android" ? 28 : 20,
    maxHeight: "75%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  titulo: {
    fontSize: 17,
    fontWeight: "800",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  fila: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  opcionBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  opcionBtnActivo: {
    backgroundColor: "#EEF2FF",
    borderColor: "#1D4ED8",
  },
  opcionBtnTexto: {
    fontSize: 13,
    fontWeight: "600",
  },
  opcionBtnTextoActivo: {
    color: "#1D4ED8",
  },
  idiomasWrap: {
    gap: 8,
  },
  idiomaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  idiomaFlag: {
    fontSize: 20,
  },
  idiomaLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
});
