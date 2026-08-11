import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ConfiguracionModal } from "@/modules/i18n/components/ConfiguracionModal";
import { AlertModal } from "@/components/ui/AlertModal";
import { LinearGradient } from "expo-linear-gradient";
import { useNotificationStore } from "@/store/notificationStore";

export default function MasMenuScreen() {
  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const { t } = useTranslation();
  const usuario = useAuthStore((s) => s.usuario);
  const [configVisible, setConfigVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ titulo: "", mensaje: "" });
  const unreadCount = useNotificationStore((s) => s.notificaciones.filter((n) => !n.leido).length);

  const handleNavigation = (route: string, authRequired: boolean = false, params?: Record<string, string>) => {
    if (authRequired && !usuario) {
      setAlertConfig({
        titulo: t("tabs.alertaMisReservasTitulo"),
        mensaje: t("tabs.alertaMisReservasMensaje"),
      });
      setAlertVisible(true);
      return;
    }

    if (route === "config") {
      setConfigVisible(true);
    } else {
      router.push({ pathname: route as any, params });
    }
  };

  const getInitials = () => {
    if (!usuario) return null;
    const name = usuario.nombre && usuario.nombre.trim() !== "" 
      ? usuario.nombre 
      : (usuario.correo ? usuario.correo.split("@")[0] : "");
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const userName = usuario
    ? (usuario.nombre && usuario.nombre.trim() !== "" 
        ? usuario.nombre 
        : (usuario.correo ? usuario.correo.split("@")[0] : ""))
    : "Invitado";

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Brand Header with Gradient */}
      <LinearGradient
        colors={["#1e3a8a", "#2563eb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Text style={styles.logoText}>Drivique</Text>

        {/* Welcome message & User Icon */}
        <TouchableOpacity
          style={styles.profileRow}
          onPress={() => handleNavigation("/(tabs)/profile")}
          activeOpacity={0.7}
        >
          <Text style={styles.welcomeText} numberOfLines={1}>
            {t("tabs.bienvenido", { nombre: userName })}
          </Text>
          <View style={styles.avatarContainer}>
            {usuario ? (
              <Text style={styles.avatarInitials}>{getInitials()}</Text>
            ) : (
              <Ionicons name="person" size={18} color="#1D4ED8" />
            )}
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.menuList} showsVerticalScrollIndicator={false}>
        {/* Main Section */}
        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>MENÚ PRINCIPAL</Text>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: c.bgCard, borderColor: c.border }]}
          onPress={() => handleNavigation("/(tabs)/favorites", true)}
        >
          <Ionicons name="heart-outline" size={22} color={c.textSecondary} />
          <Text style={[styles.menuItemText, { color: c.textPrimary }]}>
            {t("tabs.misFavoritos")}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: c.bgCard, borderColor: c.border }]}
          onPress={() => handleNavigation("/(tabs)/notifications")}
        >
          <Ionicons name="notifications-outline" size={22} color={c.textSecondary} />
          <Text style={[styles.menuItemText, { color: c.textPrimary }]}>
            {t("tabs.notificaciones")}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: c.bgCard, borderColor: c.border }]}
          onPress={() => handleNavigation("/(tabs)/support")}
        >
          <Ionicons name="headset-outline" size={22} color={c.textSecondary} />
          <Text style={[styles.menuItemText, { color: c.textPrimary }]}>
            {t("tabs.soporte")}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
        </TouchableOpacity>

        {/* Settings Section */}
        <Text style={[styles.sectionTitle, { color: c.textMuted, marginTop: 24 }]}>AJUSTES Y PREFERENCIAS</Text>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: c.bgCard, borderColor: c.border }]}
          onPress={() => handleNavigation("config", false)}
        >
          <Ionicons name="settings-outline" size={22} color={c.textSecondary} />
          <Text style={[styles.menuItemText, { color: c.textPrimary }]}>
            {t("tabs.configuracion")}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
        </TouchableOpacity>
      </ScrollView>

      {/* Config Sheet Modal */}
      <ConfiguracionModal visible={configVisible} onClose={() => setConfigVisible(false)} />

      {/* Auth Alert Modal */}
      <AlertModal
        visible={alertVisible}
        icono="lock-closed-outline"
        titulo={alertConfig.titulo}
        mensaje={alertConfig.mensaje}
        botones={[
          {
            texto: t("catalogo.alertas.cancelar"),
            variante: "secundario",
            onPress: () => setAlertVisible(false),
          },
          {
            texto: t("catalogo.alertas.iniciarSesion"),
            variante: "primario",
            onPress: () => {
              setAlertVisible(false);
              router.push("/(auth)/login");
            },
          },
        ]}
        onCerrar={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoText: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: "#FFFFFF",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "65%",
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: "700",
    marginRight: 10,
    textAlign: "right",
    color: "#FFFFFF",
  },
  avatarContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF40",
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  menuList: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 14,
  },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginRight: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});
