import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { COLOR_MARCA } from "../constants/reservation.constants";
import { useBrandStore } from "@/store/brandStore";

const CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 5;

function generateRandomCode(length = CODE_LENGTH): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

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

  const [captchaCode, setCaptchaCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [localError, setLocalError] = useState("");

  const refreshCaptcha = useCallback(() => {
    const newCode = generateRandomCode();
    setCaptchaCode(newCode);
    setUserInput("");
    setLocalError("");
    onVerified(false);
  }, [onVerified]);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  const handleValidar = () => {
    const cleanInput = userInput.trim().toUpperCase();
    if (!cleanInput) {
      setLocalError(
        t("captcha.emptyCode", {
          defaultValue: "Por favor ingresa el código de seguridad.",
        })
      );
      onVerified(false);
      return;
    }

    if (cleanInput === captchaCode.toUpperCase()) {
      setLocalError("");
      onVerified(true);
    } else {
      setLocalError(
        t("captcha.invalidCode", {
          defaultValue: "Código incorrecto. Generamos uno nuevo.",
        })
      );
      onVerified(false);
      const newCode = generateRandomCode();
      setCaptchaCode(newCode);
      setUserInput("");
    }
  };

  const marca = useBrandStore((s) => s.marca);
  const primaryAccent = marca?.primary || (c.oscuro ? "#3B82F6" : COLOR_MARCA);

  // Variaciones de rotación para cada uno de los caracteres del código para efecto anti-bot
  const rotations = ["-10deg", "8deg", "-6deg", "12deg", "-8deg"];
  const charColorsLight = ["#1D4ED8", "#0284C7", "#4338CA", "#6D28D9", "#BE185D"];
  const charColorsDark = ["#60A5FA", "#38BDF8", "#818CF8", "#A78BFA", "#F472B6"];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: c.oscuro ? c.bgCard : "#FFFFFF",
          borderColor: isVerified
            ? "#10B981"
            : hasError || localError
            ? "#EF4444"
            : c.border,
        },
        style,
      ]}
    >
      {/* Encabezado */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isVerified
                  ? "rgba(16, 185, 129, 0.15)"
                  : c.oscuro
                  ? "#1E3A8A33"
                  : "#EFF6FF",
              },
            ]}
          >
            <Ionicons
              name={isVerified ? "checkmark-circle" : "shield-checkmark-outline"}
              size={18}
              color={isVerified ? "#10B981" : primaryAccent}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={[styles.titulo, { color: c.textPrimary }]}>
                {t("captcha.title", { defaultValue: "Verificación de Seguridad" })}
              </Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isVerified
                      ? "#ECFDF5"
                      : c.oscuro
                      ? "#334155"
                      : "#F1F5F9",
                    borderColor: isVerified ? "#A7F3D0" : "transparent",
                    borderWidth: isVerified ? 1 : 0,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: isVerified
                        ? "#047857"
                        : c.oscuro
                        ? "#94A3B8"
                        : "#64748B",
                    },
                  ]}
                >
                  {isVerified
                    ? t("captcha.verifiedBadge", { defaultValue: "Verificado ✓" })
                    : t("captcha.antiBotBadge", { defaultValue: "Anti-bot" })}
                </Text>
              </View>
            </View>
            <Text style={[styles.subtitulo, { color: c.textSecondary }]}>
              {isVerified
                ? t("captcha.verifiedDesc", {
                    defaultValue:
                      "Verificación completada. Ya puedes confirmar tu reserva.",
                  })
                : t("captcha.promptDesc", {
                    defaultValue:
                      "Ingresa los 5 caracteres mostrados para confirmar que eres humano.",
                  })}
            </Text>
          </View>
        </View>
      </View>

      {isVerified ? (
        /* Vista de Verificación Exitosa */
        <View
          style={[
            styles.successBanner,
            {
              backgroundColor: c.oscuro ? "#064E3B33" : "#ECFDF5",
              borderColor: "#A7F3D0",
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text
              style={[
                styles.successText,
                { color: c.oscuro ? "#A7F3D0" : "#065F46" },
              ]}
            >
              {t("captcha.successLabel", { defaultValue: "Humano verificado con éxito" })}
            </Text>
          </View>
          <TouchableOpacity onPress={refreshCaptcha} hitSlop={8}>
            <Text style={[styles.resetText, { color: c.textSecondary }]}>
              {t("captcha.reset", { defaultValue: "Cambiar" })}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Formulario de Captcha */
        <View style={styles.formContainer}>
          <View style={styles.captchaRow}>
            {/* Caja Visual del Código con distorsión */}
            <View
              style={[
                styles.codeBox,
                {
                  backgroundColor: c.oscuro ? "#0F172A" : "#F1F5F9",
                  borderColor: c.border,
                },
              ]}
            >
              {captchaCode.split("").map((char, idx) => (
                <Text
                  key={idx}
                  style={[
                    styles.codeChar,
                    {
                      color: c.oscuro
                        ? charColorsDark[idx % charColorsDark.length]
                        : charColorsLight[idx % charColorsLight.length],
                      transform: [
                        { rotate: rotations[idx % rotations.length] },
                      ],
                    },
                  ]}
                >
                  {char}
                </Text>
              ))}

              <TouchableOpacity
                onPress={refreshCaptcha}
                style={[
                  styles.refreshBtn,
                  { backgroundColor: c.oscuro ? "#1E293B" : "#FFFFFF" },
                ]}
                hitSlop={6}
              >
                <Ionicons
                  name="reload-outline"
                  size={15}
                  color={c.textPrimary}
                />
              </TouchableOpacity>
            </View>

            {/* Input para el Código */}
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                  borderColor:
                    localError || hasError ? "#EF4444" : c.border,
                  color: c.textPrimary,
                },
              ]}
              placeholder={t("captcha.placeholder", { defaultValue: "Código" })}
              placeholderTextColor={c.textMuted}
              value={userInput}
              maxLength={CODE_LENGTH}
              autoCapitalize="characters"
              onChangeText={(txt) => {
                setUserInput(txt.toUpperCase());
                setLocalError("");
              }}
              onSubmitEditing={handleValidar}
            />

            {/* Botón Verificar */}
            <TouchableOpacity
              style={[
                styles.verifyBtn,
                {
                  backgroundColor: userInput.trim() ? primaryAccent : c.oscuro ? "#334155" : "#94A3B8",
                },
              ]}
              disabled={!userInput.trim()}
              onPress={handleValidar}
            >
              <Text style={styles.verifyBtnText}>
                {t("captcha.validateBtn", { defaultValue: "Verificar" })}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {localError || hasError ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.errorText}>
                {localError ||
                  t("captcha.mustVerify", {
                    defaultValue:
                      "Debes completar la verificación de seguridad antes de confirmar la reserva.",
                  })}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flex: 1,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  titulo: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  subtitulo: {
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 15,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  formContainer: {
    marginTop: 12,
  },
  captchaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    position: "relative",
    minWidth: 110,
  },
  codeChar: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 3,
    marginHorizontal: 1,
  },
  refreshBtn: {
    position: "absolute",
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
  },
  input: {
    flex: 1,
    height: 42,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 13.5,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  verifyBtn: {
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyBtnText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 11.5,
    color: "#EF4444",
    fontWeight: "600",
    flex: 1,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
  },
  successText: {
    fontSize: 12,
    fontWeight: "700",
  },
  resetText: {
    fontSize: 11,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
