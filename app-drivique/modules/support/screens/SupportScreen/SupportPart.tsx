import { View, TouchableOpacity, Text } from 'react-native'
import { styles } from '../support.styles'
import { ReporteIncidencia } from '@/store/supportStore'
import React from 'react'

export default function SupportPart({ activeTab, c, reportes, setActiveTab, t }: { activeTab: 'canales' | 'reportar' | 'mis_reportes'; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; reportes: ReporteIncidencia[]; setActiveTab: React.Dispatch<React.SetStateAction<'canales' | 'reportar' | 'mis_reportes'>>; t: any }) {
  return (
    <View style={[styles.tabBar, { backgroundColor: c.bgCard, borderBottomColor: c.border }]}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("tabs.canalesAtencion")}
            style={[styles.tabButton, activeTab === "canales" && styles.activeTabButton]}
            onPress={() => setActiveTab("canales")}
          >
            <Text style={[styles.tabText, activeTab === "canales" ? styles.activeTabText : { color: c.textSecondary }]}>
              {t("tabs.canalesAtencion")}
            </Text>
          </TouchableOpacity>
  
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("tabs.reportarIncidencia")}
            style={[styles.tabButton, activeTab === "reportar" && styles.activeTabButton]}
            onPress={() => setActiveTab("reportar")}
          >
            <Text style={[styles.tabText, activeTab === "reportar" ? styles.activeTabText : { color: c.textSecondary }]}>
              {t("tabs.reportarIncidencia")}
            </Text>
          </TouchableOpacity>
  
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("tabs.misReportes")}
            style={[styles.tabButton, activeTab === "mis_reportes" && styles.activeTabButton]}
            onPress={() => setActiveTab("mis_reportes")}
          >
            <View style={styles.tabBadgeRow}>
              <Text style={[styles.tabText, activeTab === "mis_reportes" ? styles.activeTabText : { color: c.textSecondary }]}>
                {t("tabs.misReportes")}
              </Text>
              {reportes.length > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{reportes.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
  )
}
