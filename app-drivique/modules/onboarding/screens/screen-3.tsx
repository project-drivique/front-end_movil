import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { screen3Styles as styles } from "@/modules/onboarding/styles/screen3.styles";

export default function OnboardingScreen3() {
  const { t } = useTranslation();
  const c = useTemaColores();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const PASOS = [
    { num: "1", icon: "🔍", titulo: t("onboarding.screen3.paso1Titulo"), desc: t("onboarding.screen3.paso1Desc") },
    { num: "2", icon: "📅", titulo: t("onboarding.screen3.paso2Titulo"), desc: t("onboarding.screen3.paso2Desc") },
    { num: "3", icon: "🔑", titulo: t("onboarding.screen3.paso3Titulo"), desc: t("onboarding.screen3.paso3Desc") },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 32, backgroundColor: c.bg }]}>
      {/* Hero */}
      <Animated.View style={[styles.heroWrap, { opacity: fadeAnim }]}>
        <View style={[styles.heroCircle, { backgroundColor: c.primaryBg, borderColor: c.border }]}>
          <Text style={styles.heroEmoji}>⚡</Text>
        </View>
      </Animated.View>

      {/* Título */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: "center" }}>
        <Text style={[styles.title, { color: c.textPrimary }]}>{t("onboarding.screen3.title")}</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>{t("onboarding.screen3.subtitle")}</Text>
      </Animated.View>

      {/* Pasos */}
      <Animated.View style={[styles.pasosWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {PASOS.map((paso, i) => (
          <View key={paso.num}>
            <View style={styles.pasoRow}>
              <View style={styles.pasoLeft}>
                <View style={styles.pasoNum}>
                  <Text style={styles.pasoNumText}>{paso.num}</Text>
                </View>
                {i < PASOS.length - 1 && <View style={[styles.pasoLinea, { backgroundColor: c.border }]} />}
              </View>
              <View style={[styles.pasoCard, { backgroundColor: c.bgInput, borderColor: c.border }]}>
                <Text style={styles.pasoIcon}>{paso.icon}</Text>
                <View style={styles.pasoTextos}>
                  <Text style={[styles.pasoTitulo, { color: c.textPrimary }]}>{paso.titulo}</Text>
                  <Text style={[styles.pasoDesc, { color: c.textSecondary }]}>{paso.desc}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </Animated.View>

      {/* Stats */}
      <Animated.View style={[styles.statsRow, { opacity: fadeAnim, backgroundColor: c.primaryBg, borderColor: c.border }]}>
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
      </Animated.View>
    </View>
  );
}
