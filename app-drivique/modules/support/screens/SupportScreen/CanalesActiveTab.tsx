import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { styles } from '../support.styles'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { CANALES_CONTACTO, FAQS, CanalContacto } from '@/modules/support/constants/supportCatalog'
import React from 'react'

export default function CanalesActiveTab({ c, faqsAbiertas, handleContactAction, setActiveTab, t, toggleFaq }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; faqsAbiertas: string[]; handleContactAction: (canal: CanalContacto) => void; setActiveTab: React.Dispatch<React.SetStateAction<'canales' | 'reportar' | 'mis_reportes'>>; t: any; toggleFaq: (id: string) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Card Intro */}
            <View style={[styles.introCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
              <View style={[styles.iconContainer, { backgroundColor: c.oscuro ? "#1E293B" : "#EFF6FF" }]}>
                <Ionicons name="headset-outline" size={32} color="#2563EB" />
              </View>
              <Text style={[styles.introTitle, { color: c.textPrimary }]}>
                {t("soporte.centroAtencionTitulo", { defaultValue: "Centro de Atención al Usuario" })}
              </Text>
              <Text style={[styles.introSubtitle, { color: c.textSecondary }]}>
                {t("soporte.centroAtencionSub", { defaultValue: "Asistencia personalizada para tus alquileres de vehículos en Drivique." })}
              </Text>
  
              <TouchableOpacity
                style={styles.quickReportBtn}
                onPress={() => setActiveTab("reportar")}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={["#2563eb", "#1d4ed8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.quickReportGradient}
                >
                  <Ionicons name="warning-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.quickReportBtnText}>{t("tabs.reportarIncidencia")}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
  
            {/* Canales de Contacto desde JSON */}
            <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>{t("tabs.canalesAtencion")}</Text>
  
            {CANALES_CONTACTO.map((canal) => (
              <TouchableOpacity
                key={canal.id}
                style={[styles.contactCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
                onPress={() => handleContactAction(canal)}
                activeOpacity={0.85}
              >
                <View style={[styles.contactIconWrap, { backgroundColor: canal.colorBg }]}>
                  <Ionicons name={canal.icono as any} size={24} color={canal.colorIcono} />
                </View>
                <View style={styles.contactTextWrap}>
                  <Text style={[styles.contactName, { color: c.textPrimary }]}>
                    {t(canal.nombreKey, { defaultValue: canal.nombreDefault })}
                  </Text>
                  <Text style={[styles.contactDesc, { color: c.textSecondary }]}>
                    {t(canal.descripcionKey, { defaultValue: canal.descripcionDefault })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
              </TouchableOpacity>
            ))}
  
            {/* FAQs desde JSON */}
            <Text style={[styles.sectionTitle, { color: c.textPrimary, marginTop: 24 }]}>
              {t("tabs.preguntasFrecuentes")}
            </Text>
  
            {FAQS.map((faq) => {
              const estaAbierto = faqsAbiertas.includes(faq.id);
              return (
                <View
                  key={faq.id}
                  style={[styles.faqCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
                >
                  <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() => toggleFaq(faq.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.faqQuestion, { color: c.textPrimary }]}>
                      {t(`soporte.faq.${faq.id}.q`, { defaultValue: faq.pregunta })}
                    </Text>
                    <Ionicons
                      name={estaAbierto ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={c.textMuted}
                    />
                  </TouchableOpacity>
                  {estaAbierto && (
                    <Text style={[styles.faqAnswer, { color: c.textSecondary }]}>
                      {t(`soporte.faq.${faq.id}.a`, { defaultValue: faq.respuesta })}
                    </Text>
                  )}
                </View>
              );
            })}
            <View style={{ height: 40 }} />
          </ScrollView>
  )
}
