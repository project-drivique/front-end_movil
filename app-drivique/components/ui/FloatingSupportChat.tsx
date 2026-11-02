import React, { useState, useRef, useEffect } from "react";
import { View, TouchableOpacity, Text, TextInput, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native'
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname } from "expo-router";
import { useIdioma, useTemaColores, useTranslation } from "@/modules/i18n/hooks/useLanguage";
import {
  ChatMessage,
  obtenerMensajeBienvenida,
  obtenerHoraActual,
  procesarMensajeChatbot,
} from "@/modules/support/services/chatbotEngine";
import { COLOR_ACCENT, COLOR_MARCA_OSCURO } from "@/constants/brandPalette";
import { styles } from './FloatingSupportChat/FloatingSupportChat.styles'

export function FloatingSupportChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const { idiomaActual } = useIdioma();
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);

  // Historial inicial de mensajes según idioma activo
  const [mensajes, setMensajes] = useState<ChatMessage[]>([
    obtenerMensajeBienvenida(idiomaActual),
  ]);

  // Actualizar bienvenida si el usuario cambia de idioma
  useEffect(() => {
    setMensajes((prev) => {
      if (prev.length === 1 && prev[0].sender === "bot") {
        return [obtenerMensajeBienvenida(idiomaActual)];
      }
      return prev;
    });
  }, [idiomaActual]);

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
      const currentLang = useIdioma.getState().idiomaActual;
      const botResponse = procesarMensajeChatbot(actionValue || texto, currentLang);
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
    const currentLang = useIdioma.getState().idiomaActual;
    setMensajes([obtenerMensajeBienvenida(currentLang)]);
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
              backgroundColor: c.oscuro ? COLOR_MARCA_OSCURO : COLOR_ACCENT,
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
              placeholder={t("soporte.chat.placeholder", { defaultValue: "Escribe tu consulta aquí..." })}
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


