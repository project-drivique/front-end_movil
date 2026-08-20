import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

interface Props {
  password: string;
}

export function PasswordRequirements({ password }: Props) {
  const { t } = useTranslation();

  const requisitos = [
    { key: "auth.pass.min8",      ok: password.length >= 8 },
    { key: "auth.pass.mayuscula", ok: /[A-Z]/.test(password) },
    { key: "auth.pass.minuscula", ok: /[a-z]/.test(password) },
    { key: "auth.pass.numero",    ok: /[0-9]/.test(password) },
    { key: "auth.pass.simbolo",   ok: /[@$!%*?&]/.test(password) },
  ];

  const cumplidos   = requisitos.filter(r => r.ok).length;
  const todosCumplidos = cumplidos === requisitos.length;
  const visible     = password.length > 0 && !todosCumplidos;

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 240,
      useNativeDriver: false,
    }).start();
  }, [visible, anim]);

  const maxHeight     = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 170] });
  const opacity       = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const marginTop     = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });
  const marginBottom  = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  const barColor =
    todosCumplidos ? "#10B981" :
    cumplidos >= 3 ? "#F59E0B" : "#EF4444";

  const barWidth = `${(cumplidos / requisitos.length) * 100}%` as `${number}%`;

  return (
    <Animated.View style={[s.wrap, { maxHeight, opacity, marginTop, marginBottom }]}>
      {/* Barra de progreso */}
      <View style={s.barFondo}>
        <View style={[s.barRelleno, { width: barWidth, backgroundColor: barColor }]} />
      </View>

      {/* Requisitos */}
      {requisitos.map(({ key, ok }) => (
        <View key={key} style={s.fila}>
          <View style={[s.dot, ok ? s.dotOk : s.dotNo]}>
            <Text style={[s.dotTxt, ok ? s.dotTxtOk : s.dotTxtNo]}>
              {ok ? "✓" : "·"}
            </Text>
          </View>
          <Text style={[s.label, ok ? s.labelOk : s.labelNo]}>
            {t(key)}
          </Text>
        </View>
      ))}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    backgroundColor: "#F8FAFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E7FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 7,
  },
  barFondo: {
    height: 3,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: 4,
    overflow: "hidden",
  },
  barRelleno: {
    height: 3,
    borderRadius: 2,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dotOk:  { backgroundColor: "#D1FAE5" },
  dotNo:  { backgroundColor: "#F3F4F6" },
  dotTxt: { fontSize: 10, fontWeight: "800", lineHeight: 12 },
  dotTxtOk: { color: "#10B981" },
  dotTxtNo: { color: "#9CA3AF" },
  label:    { fontSize: 12, fontWeight: "500" },
  labelOk:  { color: "#10B981" },
  labelNo:  { color: "#6B7280" },
});
