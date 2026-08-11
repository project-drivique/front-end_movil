import React from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const { t } = useTranslation();

  const handleContact = (type: "phone" | "email" | "whatsapp") => {
    if (type === "phone") {
      Linking.openURL("tel:+573000000000");
    } else if (type === "email") {
      Linking.openURL("mailto:soporte@drivique.com?subject=Soporte%20Drivique");
    } else if (type === "whatsapp") {
      Linking.openURL("https://wa.me/573000000000");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: c.bgCard, borderBottomColor: c.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={c.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.textPrimary }]}>{t("tabs.soporte")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introCard}>
          <View style={[styles.iconContainer, { backgroundColor: c.primaryBg }]}>
            <Ionicons name="headset-outline" size={40} color="#1D4ED8" />
          </View>
          <Text style={[styles.introTitle, { color: c.textPrimary }]}>¿Cómo podemos ayudarte?</Text>
          <Text style={[styles.introSubtitle, { color: c.textSecondary }]}>
            Nuestro equipo de soporte técnico y académico está disponible para resolver tus dudas sobre reservas, pagos y contratos.
          </Text>
        </View>

        {/* Contact Channels */}
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Canales de Atención</Text>
        
        <TouchableOpacity 
          style={[styles.contactCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
          onPress={() => handleContact("whatsapp")}
        >
          <View style={[styles.contactIconWrap, { backgroundColor: "#25D36620" }]}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          </View>
          <View style={styles.contactTextWrap}>
            <Text style={[styles.contactName, { color: c.textPrimary }]}>Chat de WhatsApp</Text>
            <Text style={[styles.contactDesc, { color: c.textSecondary }]}>Atención inmediata todos los días</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.contactCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
          onPress={() => handleContact("email")}
        >
          <View style={[styles.contactIconWrap, { backgroundColor: "#1D4ED820" }]}>
            <Ionicons name="mail-outline" size={24} color="#1D4ED8" />
          </View>
          <View style={styles.contactTextWrap}>
            <Text style={[styles.contactName, { color: c.textPrimary }]}>Correo Electrónico</Text>
            <Text style={[styles.contactDesc, { color: c.textSecondary }]}>soporte@drivique.com</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.contactCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
          onPress={() => handleContact("phone")}
        >
          <View style={[styles.contactIconWrap, { backgroundColor: "#3B82F620" }]}>
            <Ionicons name="call-outline" size={24} color="#3B82F6" />
          </View>
          <View style={styles.contactTextWrap}>
            <Text style={[styles.contactName, { color: c.textPrimary }]}>Línea Telefónica</Text>
            <Text style={[styles.contactDesc, { color: c.textSecondary }]}>+57 300 000 0000</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </TouchableOpacity>

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { color: c.textPrimary, marginTop: 24 }]}>Preguntas Frecuentes</Text>

        <View style={[styles.faqCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
          <Text style={[styles.faqQuestion, { color: c.textPrimary }]}>¿Cómo firmo mi contrato digital?</Text>
          <Text style={[styles.faqAnswer, { color: c.textSecondary }]}>
            Al finalizar tu flujo de reserva (o pago con Wompi), se generará automáticamente el PDF de tu contrato. Podrás firmarlo directamente en pantalla con tu dedo o mouse.
          </Text>
        </View>

        <View style={[styles.faqCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
          <Text style={[styles.faqQuestion, { color: c.textPrimary }]}>¿Dónde puedo descargar el PDF de mi reserva?</Text>
          <Text style={[styles.faqAnswer, { color: c.textSecondary }]}>
            Ve a {"\"Mis reservas\""}, selecciona la reserva correspondiente y haz clic en {"\"Descargar contrato\""} para obtener tu PDF firmado.
          </Text>
        </View>

        <View style={[styles.faqCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
          <Text style={[styles.faqQuestion, { color: c.textPrimary }]}>¿Qué métodos de pago son aceptados?</Text>
          <Text style={[styles.faqAnswer, { color: c.textSecondary }]}>
            Aceptamos pago seguro en línea con Wompi (Nequi, PSE, Tarjetas en modo prueba) o pago físico directamente en efectivo en la sucursal de retiro del vehículo.
          </Text>
        </View>

        <Text style={[styles.footerText, { color: c.textMuted }]}>
          Drivique · Plataforma Académica de Alquiler de Vehículos
        </Text>
      </ScrollView>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  introCard: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  introSubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  contactTextWrap: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  contactDesc: {
    fontSize: 12,
  },
  faqCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 18,
  },
  footerText: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 24,
  },
});
