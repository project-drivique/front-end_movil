// modules/catalogo/components/BannerRegistro.tsx

import { GRADIENTES } from "@/constants/gradients";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

interface BannerRegistroProps {
  visible: boolean;
  onCerrar: () => void;
  mensaje?: string;
}

export function BannerRegistro({
  visible,
  onCerrar,
  mensaje,
}: BannerRegistroProps) {
  const { t } = useTranslation();
  if (!visible) return null;
  const mensajeFinal = mensaje ?? t("catalogo.bannerRegistro.mensaje");

  return (
    <View style={styles.overlay}>
      <View style={styles.banner}>
        <Text style={styles.icono}>🔒</Text>
        <Text style={styles.titulo}>{t("catalogo.bannerRegistro.titulo")}</Text>
        <Text style={styles.mensaje}>{mensajeFinal}</Text>

        <View style={styles.botones}>
          <TouchableOpacity
            style={styles.botonRegistroWrap}
            onPress={() => {
              onCerrar();
              router.push("/(auth)/register");
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={GRADIENTES.boton.colors}
              start={GRADIENTES.boton.start}
              end={GRADIENTES.boton.end}
              style={styles.botonRegistro}
            >
              <Text style={styles.botonRegistroTexto}>{t("catalogo.bannerRegistro.registrarme")}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonLogin}
            onPress={() => {
              onCerrar();
              router.push("/(auth)/login");
            }}
          >
            <Text style={styles.botonLoginTexto}>{t("catalogo.bannerRegistro.iniciarSesion")}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.botonCerrar} onPress={onCerrar}>
          <Text style={styles.botonCerrarTexto}>{t("catalogo.bannerRegistro.continuarInvitado")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    zIndex: 100,
  },
  banner: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  icono: {
    fontSize: 40,
    marginBottom: 4,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a2e",
    textAlign: "center",
  },
  mensaje: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  botones: {
    width: "100%",
    gap: 10,
  },
  botonRegistroWrap: {
    borderRadius: 12,
    overflow: "hidden",
  },
  botonRegistro: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  botonRegistroTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  botonLogin: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  botonLoginTexto: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "600",
  },
  botonCerrar: {
    marginTop: 4,
    paddingVertical: 8,
  },
  botonCerrarTexto: {
    color: "#999",
    fontSize: 14,
  },
});
