import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  SafeAreaView,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { TAWK_CONFIG } from "@/modules/support/constants/tawk.config";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function FloatingSupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const c = useTemaColores();

  // URL del chat de Tawk.to
  const chatUrl = TAWK_CONFIG.chatUrl;

  return (
    <>
      {/* Botón Flotante (FAB) */}
      {!isOpen && (
        <TouchableOpacity
          style={[
            styles.fab,
            {
              bottom: insets.bottom + 85, // Sits above the tab bar (which is approx 60 + safe area)
              backgroundColor: c.oscuro ? "#3B82F6" : "#2563EB",
              shadowColor: c.oscuro ? "#000" : "#2563EB",
            },
          ]}
          onPress={() => setIsOpen(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubble-ellipses" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Contenedor del Chat (se oculta offscreen para no desmontar el WebView y no perder el historial) */}
      <View
        style={[
          styles.chatContainer,
          isOpen ? styles.chatOpen : styles.chatClosed,
          {
            backgroundColor: c.bgCard,
            borderColor: c.border,
            paddingTop: Platform.OS === "ios" ? insets.top : 10,
          },
        ]}
      >
        {/* Cabecera del Chat */}
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <View style={styles.headerInfo}>
            <View style={styles.onlineIndicator} />
            <View>
              <Text style={[styles.headerTitle, { color: c.textPrimary }]}>
                Soporte Drivique
              </Text>
              <Text style={[styles.headerSubtitle, { color: c.textSecondary }]}>
                En línea - Tawk.to
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: c.oscuro ? "#374151" : "#F3F4F6" }]}
            onPress={() => setIsOpen(false)}
          >
            <Ionicons name="close" size={22} color={c.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* WebView con el Chat */}
        <View style={styles.webviewWrapper}>
          <WebView
            source={{ uri: chatUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 999,
  },
  chatContainer: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 1000,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 24,
  },
  chatOpen: {
    top: 0,
    left: 0,
  },
  chatClosed: {
    top: -99999,
    left: -99999,
    height: 1,
    width: 1,
    opacity: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981", // Emerald green
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  webviewWrapper: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
