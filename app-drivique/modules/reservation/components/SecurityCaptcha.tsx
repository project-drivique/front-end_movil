import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { COLOR_MARCA } from "../constants/reservation.constants";
import { useBrandStore } from "@/store/brandStore";

interface Props {
  isVerified: boolean;
  onVerified: (verified: boolean) => void;
  hasError?: boolean;
  style?: ViewStyle;
}

export default function SecurityCaptcha({
  isVerified,
  onVerified,
  hasError = false,
  style,
}: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const [isVerifying, setIsVerifying] = useState(false);

  const marca = useBrandStore((s) => s.marca);
  const primaryAccent = marca?.primary || (c.oscuro ? "#3B82F6" : COLOR_MARCA);

  const handlePressCheckbox = () => {
    if (isVerified || isVerifying) return;

    setIsVerifying(true);
    // Simula verificación heurística anti-bot (estilo Cloudflare Turnstile en móvil)
    setTimeout(() => {
      setIsVerifying(false);
      onVerified(true);
    }, 650);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={isVerified ? 1 : 0.75}
        onPress={handlePressCheckbox}
        style={[
          styles.card,
          {
            backgroundColor: c.oscuro ? c.bgCard : "#FFFFFF",
            borderColor:
              hasError && !isVerified
                ? "#EF4444"
                : isVerified
                ? "#10B981"
                : c.border || "#E2E8F0",
          },
        ]}
      >
        {/* Zona izquierda interactiva: Checkbox + Textos */}
        <View style={styles.leftContent}>
          {/* Casilla Checkbox / Spinner / Check */}
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: isVerified
                  ? "#10B981"
                  : c.oscuro
                  ? "#0F172A"
                  : "#FFFFFF",
                borderColor: isVerified
                  ? "#10B981"
                  : hasError
                  ? "#EF4444"
                  : "#94A3B8",
              },
            ]}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color={primaryAccent} />
            ) : isVerified ? (
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            ) : null}
          </View>

          {/* Textos descriptivos */}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                {
                  color: isVerified
                    ? c.oscuro
                      ? "#34D399"
                      : "#059669"
                    : c.textPrimary,
                },
              ]}
              numberOfLines={1}
            >
              {isVerifying
                ? t("captcha.verifying", { defaultValue: "Verificando seguridad..." })
                : isVerified
                ? t("captcha.successLabel", { defaultValue: "Humano verificado con éxito" })
                : t("captcha.verifyHuman", { defaultValue: "Confirmar que soy una persona" })}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: isVerified
                    ? c.oscuro
                      ? "#10B981"
                      : "#047857"
                    : c.textMuted,
                },
              ]}
              numberOfLines={1}
            >
              {isVerified
                ? t("captcha.verifiedDesc", {
                    defaultValue: "Verificación completada. Ya puedes confirmar tu reserva.",
                  })
                : t("captcha.clickToVerify", {
                    defaultValue: "Toca la casilla para verificar seguridad",
                  })}
            </Text>
          </View>
        </View>

        {/* Zona derecha: Insignia de seguridad Drivique */}
        <View
          style={[
            styles.badgeContainer,
            {
              borderLeftColor: c.oscuro ? "rgba(255,255,255,0.08)" : "#E2E8F0",
            },
          ]}
        >
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isVerified
                  ? "rgba(16, 185, 129, 0.12)"
                  : "rgba(2, 132, 199, 0.1)",
              },
            ]}
          >
            <Ionicons
              name={isVerified ? "shield-checkmark" : "shield-outline"}
              size={18}
              color={isVerified ? "#10B981" : primaryAccent}
            />
          </View>
          <View style={styles.badgeTextWrapper}>
            <Text
              style={[
                styles.badgeTitle,
                { color: c.textPrimary },
              ]}
            >
              DRIVIQUE
            </Text>
            <Text style={[styles.badgeSub, { color: c.textMuted }]}>
              {t("captcha.antiBotBadge", { defaultValue: "Anti-bot" })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Alerta de error si intentan avanzar sin verificar */}
      {hasError && !isVerified && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text style={styles.errorText}>
            {t("captcha.mustVerify", {
              defaultValue:
                "Debes completar la verificación de seguridad antes de confirmar la reserva.",
            })}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    borderLeftWidth: 1,
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  badgeTextWrapper: {
    alignItems: "flex-end",
  },
  badgeTitle: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  badgeSub: {
    fontSize: 8,
    fontWeight: "500",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    paddingLeft: 4,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },
});
