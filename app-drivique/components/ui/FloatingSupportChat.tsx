import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname } from "expo-router";
import { useIdioma, useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import {
  ChatMessage,
  obtenerMensajeBienvenida,
  obtenerHoraActual,
  procesarMensajeChatbot,
} from "@/modules/support/services/chatbotEngine";

export function FloatingSupportChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const { idiomaActual } = useIdioma();
  const scrollViewRef = useRef<ScrollView>(null);

  // Historial inicial de mensajes según idioma activo
  const [mensajes, setMensajes] = useState<ChatMessage[]>([
    obtenerMensajeBienvenida(idiomaActual),
  ]);

  // Actualizar bienvenida si el usuario cambia de idioma
  useEffect(() => {
    if (mensajes.length === 1 && mensajes[0].sender === "bot") {
      setMensajes([obtenerMensajeBienvenida(idiomaActual)]);
    }
  }, [idiomaActual, mensajes]);

  // Scroll automático al último mensaje
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isOpen, mensajes, isTyping]);

  // Ocultar chat en pantallas de inicio de sesión, registro, recuperación y onboarding inicial
  const isAuthRoute =
    pathname.includes("login") ||
    pathname.includes("register") ||
    pathname.includes("forgot") ||
    pathname.includes("verify") ||
    pathname.includes("auth");

  const isOnboardingRoute =
    pathname.includes("onboarding") ||
    pathname === "/" ||
    pathname === "/index" ||
    pathname === "";

  if (isAuthRoute || isOnboardingRoute) {
    return null;
  }

  const enviarMensaje = (texto: string, actionValue?: string) => {
    if (!texto.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: texto.trim(),
      timestamp: obtenerHoraActual(),
    };

    setMensajes((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Respuesta inteligente del motor con contexto multilenguaje y de negocio
    setTimeout(() => {
      const botResponse = procesarMensajeChatbot(actionValue || texto, idiomaActual);
      const botMsg: ChatMessage = {
        ...botResponse,
        id: `bot-${Date.now()}`,
        timestamp: obtenerHoraActual(),
      };
      setMensajes((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const reiniciarChat = () => {
    setMensajes([obtenerMensajeBienvenida(idiomaActual)]);
  };

  return (
    <>
      {/* Botón Flotante (FAB) */}
      {!isOpen && (
        <TouchableOpacity
          style={[
            styles.fab,
            {
              bottom: insets.bottom + 85, // Posicionado arriba de las pestañas de navegación
              backgroundColor: c.oscuro ? "#3B82F6" : "#2563EB",
              shadowColor: c.oscuro ? "#000" : "#2563EB",
            },
          ]}
          onPress={() => setIsOpen(true)}
          activeOpacity={0.88}
        >
          <Ionicons name="chatbubbles" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Contenedor del Chat (Se oculta fuera de pantalla para mantener la sesión viva) */}
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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Cabecera del Chatbot */}
          <View style={[styles.header, { borderBottomColor: c.border, backgroundColor: c.bgCard }]}>
            <View style={styles.headerInfo}>
              <View style={styles.botAvatarWrap}>
                <Ionicons name="car-sport" size={20} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.headerTitle, { color: c.textPrimary }]}>
                  Drivibot — Soporte Drivique
                </Text>
                <View style={styles.statusRow}>
                  <View style={styles.onlineDot} />
                  <Text style={[styles.headerSubtitle, { color: c.textSecondary }]}>
                    En línea · {idiomaActual.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconActionBtn} onPress={reiniciarChat}>
                <Ionicons name="trash-outline" size={20} color={c.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: c.oscuro ? "#374151" : "#F3F4F6" }]}
                onPress={() => setIsOpen(false)}
              >
                <Ionicons name="close" size={22} color={c.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Cuerpo de Mensajes */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {mensajes.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isBot ? styles.messageRowLeft : styles.messageRowRight,
                  ]}
                >
                  {isBot && (
                    <View style={styles.botIconMini}>
                      <Ionicons name="car" size={14} color="#FFFFFF" />
                    </View>
                  )}

                  <View style={{ maxWidth: "82%" }}>
                    <View
                      style={[
                        styles.bubble,
                        isBot
                          ? [
                              styles.botBubble,
                              {
                                backgroundColor: c.oscuro ? "#1E293B" : "#F1F5F9",
                                borderColor: c.border,
                              },
                            ]
                          : styles.userBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          { color: isBot ? c.textPrimary : "#FFFFFF" },
                        ]}
                      >
                        {msg.text}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.timestampText,
                        { color: c.textMuted, textAlign: isBot ? "left" : "right" },
                      ]}
                    >
                      {msg.timestamp}
                    </Text>

                    {/* Opciones rápidas asociadas al mensaje del Bot */}
                    {isBot && msg.options && msg.options.length > 0 && (
                      <View style={styles.optionsContainer}>
                        {msg.options.map((opt, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={[
                              styles.optionChip,
                              {
                                backgroundColor: c.oscuro ? "#312E8133" : "#EFF6FF",
                                borderColor: c.oscuro ? "#3730A3" : "#BFDBFE",
                              },
                            ]}
                            onPress={() => enviarMensaje(opt.label, opt.actionValue)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.optionChipText}>{opt.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            {/* Indicador de "Escribiendo..." */}
            {isTyping && (
              <View style={[styles.messageRow, styles.messageRowLeft]}>
                <View style={styles.botIconMini}>
                  <Ionicons name="car" size={14} color="#FFFFFF" />
                </View>
                <View
                  style={[
                    styles.bubble,
                    styles.botBubble,
                    {
                      backgroundColor: c.oscuro ? "#1E293B" : "#F1F5F9",
                      borderColor: c.border,
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 10,
                    },
                  ]}
                >
                  <ActivityIndicator size="small" color="#2563EB" />
                  <Text style={[styles.typingText, { color: c.textSecondary, marginLeft: 8 }]}>
                    Drivibot respondiendo...
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Barra de entrada de texto */}
          <View
            style={[
              styles.inputBar,
              {
                backgroundColor: c.bgCard,
                borderTopColor: c.border,
                paddingBottom: Platform.OS === "ios" ? insets.bottom + 8 : 12,
              },
            ]}
          >
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: c.bgInput,
                  color: c.textPrimary,
                  borderColor: c.border,
                },
              ]}
              placeholder="Escribe tu consulta aquí..."
              placeholderTextColor={c.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => enviarMensaje(inputText)}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: inputText.trim() ? "#2563EB" : c.oscuro ? "#374151" : "#CBD5E1" },
              ]}
              onPress={() => enviarMensaje(inputText)}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "100%",
    zIndex: 1000,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 24,
  },
  chatOpen: {
    display: "flex",
  },
  chatClosed: {
    display: "none",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  botAvatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 11.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconActionBtn: {
    padding: 8,
    marginRight: 4,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  messageRowLeft: {
    justifyContent: "flex-start",
  },
  messageRowRight: {
    justifyContent: "flex-end",
  },
  botIconMini: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 16,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  botBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "#2563EB",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timestampText: {
    fontSize: 10,
    marginTop: 4,
    marginHorizontal: 4,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 4,
  },
  optionChipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#2563EB",
  },
  typingText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
