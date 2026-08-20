import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useOnboarding } from "@/modules/onboarding/hooks/use-onboarding";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { GRADIENTES } from "@/constants/gradients";

interface Props {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

export default function OnboardingNavigation({
  currentPage,
  totalPages,
  onNext,
  onPrevious,
  onSkip,
}: Props) {
  const { completeOnboarding } = useOnboarding();
  const c = useTemaColores();
  const { t } = useTranslation();
  const isFirst = currentPage === 0;
  const isLast = currentPage === totalPages - 1;

  const handleRegistro = () => {
    completeOnboarding();
    router.replace("/(auth)/register");
  };

  const handleLogin = () => {
    completeOnboarding();
    router.replace("/(auth)/login");
  };

  if (isLast) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.btnPrimaryWrap} onPress={handleRegistro} activeOpacity={0.85}>
          <LinearGradient
            colors={GRADIENTES.boton.colors}
            start={GRADIENTES.boton.start}
            end={GRADIENTES.boton.end}
            style={styles.btnPrimary}
          >
            <Text style={styles.btnPrimaryText}>{t("onboarding.nav.registrate")}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnText} onPress={handleLogin}>
          <Text style={[styles.btnTextText, { color: c.textMuted }]}>
            {t("onboarding.nav.tieneCuenta")}{" "}
            <Text style={styles.btnTextLink}>{t("onboarding.nav.iniciarSesion")}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btnGhost, { backgroundColor: c.bgInput, borderColor: c.border }]}
          onPress={isFirst ? onSkip : onPrevious}
        >
          <Text style={[styles.btnGhostText, { color: c.textSecondary }]}>
            {isFirst ? t("onboarding.nav.saltar") : t("onboarding.nav.atras")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimaryWrap} onPress={onNext} activeOpacity={0.85}>
          <LinearGradient
            colors={GRADIENTES.boton.colors}
            start={GRADIENTES.boton.start}
            end={GRADIENTES.boton.end}
            style={styles.btnPrimary}
          >
            <Text style={styles.btnPrimaryText}>{t("onboarding.nav.siguiente")}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  btnPrimaryWrap: {
    flex: 1,
    borderRadius: 12,
  },
  btnPrimary: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  btnGhost: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  btnGhostText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  btnText: {
    alignItems: "center",
    paddingVertical: 10,
  },
  btnTextText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  btnTextLink: {
    color: "#1D4ED8",
    fontWeight: "600",
  },
});