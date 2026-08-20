import { useOnboarding } from "@/modules/onboarding/hooks/use-onboarding";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { screen5Styles as styles } from "@/modules/onboarding/styles/screen5.styles";

export default function OnboardingScreen5() {
  const { t } = useTranslation();
  const c = useTemaColores();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useOnboarding();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 55, friction: 9, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  const BENEFICIOS = [
    { icon: "✅", txt: t("onboarding.screen5.ben1") },
    { icon: "🎁", txt: t("onboarding.screen5.ben2") },
    { icon: "📞", txt: t("onboarding.screen5.ben3") },
  ];

  const handleRegistro = () => {
    completeOnboarding();
    router.replace("/(auth)/register");
  };

  const handleLogin = () => {
    completeOnboarding();
    router.replace("/(auth)/login");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, backgroundColor: c.bg }]}>
      {/* Logo */}
      <Animated.View style={[styles.logoWrap, { opacity: fadeAnim }]}>
        <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      {/* Check animado */}
      <Animated.View style={[styles.successWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.successOuter, { backgroundColor: c.primaryBg }]}>
          <View style={[styles.successInner, { backgroundColor: c.oscuro ? "#1e3a5f" : "#DBEAFE" }]}>
            <Text style={styles.successCheck}>✓</Text>
          </View>
        </View>
        <View style={styles.ring1} />
        <View style={styles.ring2} />
      </Animated.View>

      {/* Título */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: "center" }}>
        <Text style={[styles.title, { color: c.textPrimary }]}>{t("onboarding.screen5.title")}</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>{t("onboarding.screen5.subtitle")}</Text>
      </Animated.View>

      {/* Beneficios */}
      <Animated.View style={[styles.benefitsCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }], backgroundColor: c.bgInput, borderColor: c.border }]}>
        {BENEFICIOS.map((b) => (
          <View key={b.txt} style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>{b.icon}</Text>
            <Text style={[styles.benefitText, { color: c.textSecondary }]}>{b.txt}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Botones CTA */}
      <Animated.View style={[styles.ctaWrap, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.ctaBtnPrimary} onPress={handleRegistro} activeOpacity={0.85}>
          <Text style={styles.ctaBtnPrimaryText}>{t("onboarding.nav.registrate")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaBtnText} onPress={handleLogin}>
          <Text style={[styles.ctaBtnTextNormal, { color: c.textMuted }]}>
            {t("onboarding.nav.tieneCuenta")}{" "}
            <Text style={styles.ctaBtnTextLink}>{t("onboarding.nav.iniciarSesion")}</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
