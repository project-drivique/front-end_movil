import React, { useEffect, useRef, useState } from "react";
import {
  Animated, Image, Modal, StyleSheet,
  Text, TouchableOpacity, View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IdiomaKey, IDIOMAS } from "@/modules/i18n";
import { useIdioma, useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { screen1Styles as styles } from "@/modules/onboarding/styles/screen1.styles";

export default function OnboardingScreen1() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { idiomaActual, cambiarIdioma, temaActual, cambiarTema } = useIdioma();
  const c = useTemaColores();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [modalConfig, setModalConfig] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, backgroundColor: c.bg }]}>

      {/* Botón configuración esquina superior derecha */}
      <TouchableOpacity
        style={[localStyles.configBtn, { backgroundColor: c.primaryBg, borderColor: c.border }]}
        onPress={() => setModalConfig(true)}
      >
        <Text style={localStyles.configBtnText}>⚙️</Text>
      </TouchableOpacity>

      {/* Hero */}
      <Animated.View style={[styles.heroWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.heroCircle, { backgroundColor: c.primaryBg, borderColor: c.border }]}>
          <Image source={require("@/assets/images/logo.png")} style={styles.heroLogo} resizeMode="contain" />
        </View>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>🇨🇴 {t("onboarding.screen1.badge")}</Text>
        </View>
      </Animated.View>

      {/* Texto */}
      <Animated.View style={[styles.textWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={[styles.title, { color: c.textPrimary }]}>
          {t("onboarding.screen1.title")}{"\n"}
          <Text style={styles.titleAccent}>{t("onboarding.screen1.titleAccent")}</Text>
        </Text>
        <Text style={styles.subtitle}>{t("onboarding.screen1.subtitle")}</Text>
        <Text style={[styles.body, { color: c.textSecondary }]}>{t("onboarding.screen1.body")}</Text>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: c.primaryBg, borderColor: c.border }]}>
          {[
            { val: t("onboarding.screen1.stat1Val"), lbl: t("onboarding.screen1.stat1Lbl") },
            { val: t("onboarding.screen1.stat2Val"), lbl: t("onboarding.screen1.stat2Lbl") },
            { val: t("onboarding.screen1.stat3Val"), lbl: t("onboarding.screen1.stat3Lbl") },
          ].map((s) => (
            <View key={s.lbl} style={styles.statCell}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={[styles.statLbl, { color: c.textSecondary }]}>{s.lbl}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Modal configuración */}
      <Modal
        visible={modalConfig}
        transparent
        animationType="slide"
        onRequestClose={() => setModalConfig(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={[localStyles.modalSheet, { backgroundColor: c.bgCard }]}>
            <View style={[localStyles.modalHandle, { backgroundColor: c.border }]} />

            {/* Header */}
            <View style={localStyles.modalHeader}>
              <Text style={[localStyles.modalTitulo, { color: c.textPrimary }]}>⚙️ {t("config.tema")}</Text>
              <TouchableOpacity
                style={localStyles.modalCloseBtnX}
                onPress={() => setModalConfig(false)}
              >
                <Text style={localStyles.modalCloseBtnXText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Tema */}
            <Text style={localStyles.seccionLabel}>{t("config.tema")}</Text>
            <View style={localStyles.temaRow}>
              <TouchableOpacity
                style={[
                  localStyles.temaBtn,
                  temaActual === "claro" && localStyles.temaBtnActive,
                ]}
                onPress={() => cambiarTema("claro")}
              >
                <Text style={localStyles.temaBtnText}>{t("config.claro")}</Text>
                {temaActual === "claro" && (
                  <Text style={localStyles.temaCheck}>✓</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  localStyles.temaBtn,
                  temaActual === "oscuro" && localStyles.temaBtnActiveDark,
                ]}
                onPress={() => cambiarTema("oscuro")}
              >
                <Text style={[
                  localStyles.temaBtnText,
                  temaActual === "oscuro" && { color: "#F0F4FF" },
                ]}>
                  {t("config.oscuro")}
                </Text>
                {temaActual === "oscuro" && (
                  <Text style={localStyles.temaCheck}>✓</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Idioma */}
            <Text style={[localStyles.seccionLabel, { marginTop: 16 }]}>
              {t("config.idioma")}
            </Text>
            {(Object.keys(IDIOMAS) as IdiomaKey[]).map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  localStyles.idiomaOption,
                  idiomaActual === key && localStyles.idiomaOptionActive,
                ]}
                onPress={() => cambiarIdioma(key)}
              >
                <Text style={localStyles.idiomaFlag}>{IDIOMAS[key].flag}</Text>
                <Text style={[
                  localStyles.idiomaLabel,
                  idiomaActual === key && localStyles.idiomaLabelActive,
                ]}>
                  {IDIOMAS[key].label}
                </Text>
                {idiomaActual === key && (
                  <View style={localStyles.idiomaCheck}>
                    <Text style={{ fontSize: 12, color: "#fff", fontWeight: "800" }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={localStyles.modalBtnCerrar}
              onPress={() => setModalConfig(false)}
            >
              <Text style={localStyles.modalBtnCerrarText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  configBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  configBtnText: { fontSize: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
    maxHeight: "85%",
  },
  modalHandle: {
    width: 40, height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12, marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitulo: {
    fontSize: 18, fontWeight: "800", color: "#111827",
  },
  modalCloseBtnX: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center", justifyContent: "center",
  },
  modalCloseBtnXText: {
    fontSize: 14, color: "#6B7280", fontWeight: "700",
  },
  seccionLabel: {
    fontSize: 11, fontWeight: "700",
    color: "#1D4ED8", letterSpacing: 1.2, marginBottom: 10,
  },
  temaRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  temaBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
    paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  temaBtnActive: { backgroundColor: "#EEF2FF", borderColor: "#1D4ED8" },
  temaBtnActiveDark: { backgroundColor: "#1C2330", borderColor: "#4A5568" },
  temaBtnText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  temaCheck: { fontSize: 14, color: "#1D4ED8", fontWeight: "800" },
  idiomaOption: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  idiomaOptionActive: { backgroundColor: "#EEF2FF", borderColor: "#1D4ED8" },
  idiomaFlag: { fontSize: 22 },
  idiomaLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: "#374151" },
  idiomaLabelActive: { color: "#1D4ED8" },
  idiomaCheck: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "#1D4ED8",
    alignItems: "center", justifyContent: "center",
  },
  modalBtnCerrar: {
    marginTop: 12, backgroundColor: "#F3F4F6",
    paddingVertical: 14, borderRadius: 12, alignItems: "center",
  },
  modalBtnCerrarText: { fontSize: 14, fontWeight: "600", color: "#374151" },
});