import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { screen2Styles as styles } from "@/modules/onboarding/styles/screen2.styles";

export default function OnboardingScreen2() {
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

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, backgroundColor: c.bg }]}>
      {/* Hero mapa */}
      <Animated.View style={[styles.heroWrap, { opacity: fadeAnim }]}>
        <View style={[styles.mapCard, { borderColor: c.border }]}>
          <View style={[styles.mapBg, { backgroundColor: c.oscuro ? "#1a2535" : "#E8F4F8" }]}>
            <View style={[styles.streetH1, { backgroundColor: c.oscuro ? "#2D3748" : "#CBD5E1" }]} />
            <View style={[styles.streetH2, { backgroundColor: c.oscuro ? "#2D3748" : "#CBD5E1" }]} />
            <View style={[styles.streetV1, { backgroundColor: c.oscuro ? "#2D3748" : "#CBD5E1" }]} />
            <View style={[styles.streetV2, { backgroundColor: c.oscuro ? "#2D3748" : "#CBD5E1" }]} />
            <View style={styles.pinWrap}>
              <View style={styles.pin}>
                <Text style={{ fontSize: 16, color: "#fff" }}>📍</Text>
              </View>
            </View>
            <View style={[styles.carDot, { top: 55, left: 45 }]}>
              <Text style={{ fontSize: 20 }}>🚗</Text>
            </View>
            <View style={[styles.carDot, { top: 95, right: 35 }]}>
              <Text style={{ fontSize: 20 }}>🚙</Text>
            </View>
            <View style={[styles.carDot, { bottom: 55, left: 75 }]}>
              <Text style={{ fontSize: 20 }}>🚘</Text>
            </View>
          </View>

          {/* Card reserva flotante */}
          <View style={[styles.reservaOverlay, { backgroundColor: c.bgCard }]}>
            <Text style={[styles.reservaTitle, { color: c.textPrimary }]}>{t("onboarding.screen2.reservaTitle")}</Text>
            <View style={styles.reservaRow}>
              <Text style={styles.reservaIcon}>📍</Text>
              <Text style={[styles.reservaText, { color: c.textSecondary }]}>{t("onboarding.screen2.sucursal")}</Text>
            </View>
            <View style={styles.reservaRow}>
              <Text style={styles.reservaIcon}>📅</Text>
              <Text style={[styles.reservaText, { color: c.textSecondary }]}>{t("onboarding.screen2.fecha")}</Text>
            </View>
            <View style={styles.reservaBtn}>
              <Text style={styles.reservaBtnText}>{t("onboarding.screen2.btnSiguiente")}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Texto */}
      <Animated.View style={[styles.textWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={[styles.title, { color: c.textPrimary }]}>{t("onboarding.screen2.title")}</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>{t("onboarding.screen2.subtitle")}</Text>
      </Animated.View>
    </View>
  );
}
