import React from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { COLOR_MARCA } from "../constants/reservation.constants";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  icono: keyof typeof Ionicons.glyphMap;
  titulo: string;
  resumen?: string;
  completo?: boolean;
  abierto: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function SeccionAcordeon({
  icono,
  titulo,
  resumen,
  completo = false,
  abierto,
  onToggle,
  children,
}: Props) {
  const c = useTemaColores();

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  const primaryAccent = c.oscuro ? "#60A5FA" : COLOR_MARCA;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.bgCard, borderColor: c.border },
        abierto && { borderColor: primaryAccent },
      ]}
    >
      <TouchableOpacity style={styles.header} onPress={handleToggle} activeOpacity={0.7}>
        <View
          style={[
            styles.iconoWrap,
            { backgroundColor: c.primaryBg },
            completo && styles.iconoWrapCompleto,
          ]}
        >
          <Ionicons
            name={completo ? "checkmark" : icono}
            size={16}
            color={completo ? "#fff" : primaryAccent}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.titulo, { color: c.textPrimary }]}>{titulo}</Text>
          {!abierto && resumen && (
            <Text style={[styles.resumen, { color: c.textSecondary }]} numberOfLines={1}>
              {resumen}
            </Text>
          )}
        </View>

        <Ionicons
          name={abierto ? "chevron-up" : "chevron-down"}
          size={18}
          color={c.textMuted}
        />
      </TouchableOpacity>

      {abierto && <View style={styles.contenido}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  iconoWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconoWrapCompleto: {
    backgroundColor: "#16a34a",
  },
  titulo: { fontSize: 13, fontWeight: "700" },
  resumen: { fontSize: 11, marginTop: 2 },
  contenido: { paddingHorizontal: 14, paddingBottom: 14 },
});