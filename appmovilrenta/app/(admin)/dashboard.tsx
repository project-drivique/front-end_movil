import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useAuthStore } from "@/store/authStore";
import { useAuditStore, EventoAuditoria } from "@/store/auditStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const usuario = useAuthStore((s) => s.usuario);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);
  const logsAuditoria = useAuditStore((s) => s.logs);

  const [tabActiva, setTabActiva] = useState<"resumen" | "auditoria">("resumen");

  const handleCerrarSesion = () => {
    cerrarSesion();
    router.replace("/(auth)/login");
  };

  const formatFechaHora = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("es-CO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.oscuro ? "#0B132B" : "#F4F7FC" }]}>
      {/* Header Gradiente Premium Drivique */}
      <LinearGradient
        colors={c.oscuro ? ["#0F172A", "#1E293B"] : ["#1E3A8A", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextWrap}>
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={13} color="#60A5FA" />
              <Text style={styles.roleBadgeText}>PANEL ADMINISTRADOR</Text>
            </View>
            <Text style={styles.welcomeText}>
              Hola, {usuario?.nombres || "Administrador"}
            </Text>
            <Text style={styles.emailText}>{usuario?.correo || "admin@drivique.com"}</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleCerrarSesion}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color="#FECDD3" />
            <Text style={styles.logoutBtnText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Selector Flotante Estilo Pill */}
        <View style={styles.pillContainer}>
          <TouchableOpacity
            style={[styles.pillBtn, tabActiva === "resumen" && styles.pillBtnActive]}
            onPress={() => setTabActiva("resumen")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="grid-outline"
              size={15}
              color={tabActiva === "resumen" ? "#1E3A8A" : "#94A3B8"}
            />
            <Text
              style={[
                styles.pillBtnText,
                tabActiva === "resumen" ? styles.pillBtnTextActive : { color: "#94A3B8" },
              ]}
            >
              Resumen General
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pillBtn, tabActiva === "auditoria" && styles.pillBtnActive]}
            onPress={() => setTabActiva("auditoria")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="list-outline"
              size={15}
              color={tabActiva === "auditoria" ? "#1E3A8A" : "#94A3B8"}
            />
            <Text
              style={[
                styles.pillBtnText,
                tabActiva === "auditoria" ? styles.pillBtnTextActive : { color: "#94A3B8" },
              ]}
            >
              Auditoría
            </Text>
            <View style={styles.counterBadge}>
              <Text style={styles.counterBadgeText}>{logsAuditoria.length}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* PESTAÑA 1: RESUMEN DE MÉTRICAS */}
      {tabActiva === "resumen" && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Título de Sección */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>
              Métricas de Operación
            </Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>En vivo</Text>
            </View>
          </View>

          {/* Grid de Tarjetas de Métricas */}
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
              <View style={[styles.metricIconBox, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="business" size={20} color="#2563EB" />
              </View>
              <Text style={[styles.metricNumber, { color: c.textPrimary }]}>8</Text>
              <Text style={[styles.metricLabel, { color: c.textSecondary }]}>Sucursales Activas</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
              <View style={[styles.metricIconBox, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="car-sport" size={20} color="#16A34A" />
              </View>
              <Text style={[styles.metricNumber, { color: c.textPrimary }]}>42</Text>
              <Text style={[styles.metricLabel, { color: c.textSecondary }]}>Autos en Flota</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
              <View style={[styles.metricIconBox, { backgroundColor: "#FAF5FF" }]}>
                <Ionicons name="people" size={20} color="#9333EA" />
              </View>
              <Text style={[styles.metricNumber, { color: c.textPrimary }]}>1,280</Text>
              <Text style={[styles.metricLabel, { color: c.textSecondary }]}>Usuarios Totales</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
              <View style={[styles.metricIconBox, { backgroundColor: "#FFFBEB" }]}>
                <Ionicons name="shield-checkmark" size={20} color="#D97706" />
              </View>
              <Text style={[styles.metricNumber, { color: c.textPrimary }]}>
                {logsAuditoria.length}
              </Text>
              <Text style={[styles.metricLabel, { color: c.textSecondary }]}>Logs de Acceso</Text>
            </View>
          </View>

          {/* Accesos Rápidos Modulares */}
          <Text style={[styles.sectionTitle, { color: c.textPrimary, marginTop: 22, marginBottom: 12 }]}>
            Acciones de Gestión
          </Text>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
            onPress={() => setTabActiva("auditoria")}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="newspaper-outline" size={22} color="#2563EB" />
            </View>
            <View style={styles.actionBody}>
              <Text style={[styles.actionTitle, { color: c.textPrimary }]}>
                Visor de Auditoría de Accesos
              </Text>
              <Text style={[styles.actionSub, { color: c.textSecondary }]}>
                Inspecciona fecha, hora, IP y resultado de cada intento de login.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
            onPress={() => router.push("/(tabs)/catalog")}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: "#F0FDF4" }]}>
              <Ionicons name="eye-outline" size={22} color="#16A34A" />
            </View>
            <View style={styles.actionBody}>
              <Text style={[styles.actionTitle, { color: c.textPrimary }]}>
                Vista Catálogo General
              </Text>
              <Text style={[styles.actionSub, { color: c.textSecondary }]}>
                Navega la interfaz pública de vehículos disponible para clientes.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* PESTAÑA 2: VISOR DE AUDITORÍA */}
      {tabActiva === "auditoria" && (
        <View style={{ flex: 1 }}>
          <View style={[styles.auditHeader, { backgroundColor: c.bgCard, borderBottomColor: c.border }]}>
            <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
            <Text style={[styles.auditHeaderDesc, { color: c.textSecondary }]}>
              Registro de eventos y validación de permisos de acceso.
            </Text>
          </View>

          <FlatList
            data={logsAuditoria}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            renderItem={({ item }: { item: EventoAuditoria }) => {
              const esExitoso = item.resultado === "Exitoso";
              const colorStatus = esExitoso ? "#16A34A" : "#DC2626";
              const bgStatus = esExitoso ? "#F0FDF4" : "#FEF2F2";
              const borderStatus = esExitoso ? "#BBF7D0" : "#FCA5A5";

              return (
                <View
                  style={[
                    styles.auditCard,
                    {
                      backgroundColor: c.bgCard,
                      borderColor: c.border,
                      borderLeftColor: colorStatus,
                    },
                  ]}
                >
                  <View style={styles.auditRowTop}>
                    <View style={styles.auditIdBox}>
                      <Ionicons
                        name={esExitoso ? "checkmark-circle" : "alert-circle"}
                        size={16}
                        color={colorStatus}
                      />
                      <Text style={[styles.auditIdCode, { color: c.textPrimary }]}>
                        {item.id}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.badgeStatus,
                        { backgroundColor: bgStatus, borderColor: borderStatus },
                      ]}
                    >
                      <Text style={[styles.badgeStatusTxt, { color: colorStatus }]}>
                        {item.resultado}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.auditGrid}>
                    <View style={styles.auditItemRow}>
                      <Ionicons name="mail-outline" size={13} color={c.textMuted} />
                      <Text style={[styles.auditVal, { color: c.textPrimary }]}>{item.correo}</Text>
                    </View>

                    <View style={styles.auditItemRow}>
                      <Ionicons name="person-outline" size={13} color={c.textMuted} />
                      <Text style={[styles.auditVal, { color: "#2563EB", fontWeight: "700" }]}>
                        {item.rol}
                      </Text>
                    </View>

                    <View style={styles.auditItemRow}>
                      <Ionicons name="time-outline" size={13} color={c.textMuted} />
                      <Text style={[styles.auditVal, { color: c.textSecondary }]}>
                        {formatFechaHora(item.fechaHora)}
                      </Text>
                    </View>

                    <View style={styles.auditItemRow}>
                      <Ionicons name="hardware-chip-outline" size={13} color={c.textMuted} />
                      <Text style={[styles.auditVal, { color: c.textSecondary }]}>
                        IP: {item.ip}
                      </Text>
                    </View>

                    {item.sucursal && (
                      <View style={styles.auditItemRow}>
                        <Ionicons name="location-outline" size={13} color={c.textMuted} />
                        <Text style={[styles.auditVal, { color: c.textPrimary }]}>
                          {item.sucursal}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTextWrap: { flex: 1 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  roleBadgeText: { color: "#DBEAFE", fontSize: 10.5, fontWeight: "900", letterSpacing: 0.8 },
  welcomeText: { color: "#FFFFFF", fontSize: 21, fontWeight: "800" },
  emailText: { color: "#93C5FD", fontSize: 13, marginTop: 2 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239,68,68,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  logoutBtnText: { color: "#FECDD3", fontSize: 12.5, fontWeight: "700" },

  pillContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  pillBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
  },
  pillBtnActive: {
    backgroundColor: "#FFFFFF",
  },
  pillBtnText: { fontSize: 12.5, fontWeight: "700" },
  pillBtnTextActive: { color: "#1E3A8A" },
  counterBadge: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  counterBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "900" },

  scrollContent: { padding: 18 },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800" },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },
  liveText: { fontSize: 11, fontWeight: "700", color: "#16A34A" },

  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  metricIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  metricNumber: { fontSize: 22, fontWeight: "900" },
  metricLabel: { fontSize: 12, marginTop: 2 },

  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionBody: { flex: 1, paddingRight: 8 },
  actionTitle: { fontSize: 14, fontWeight: "800", marginBottom: 2 },
  actionSub: { fontSize: 12, lineHeight: 16 },

  auditHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  auditHeaderDesc: { fontSize: 12.5, flex: 1 },

  auditCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  auditRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  auditIdBox: { flexDirection: "row", alignItems: "center", gap: 6 },
  auditIdCode: { fontSize: 13.5, fontWeight: "800" },
  badgeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeStatusTxt: { fontSize: 10.5, fontWeight: "800" },
  auditGrid: { gap: 6 },
  auditItemRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  auditVal: { fontSize: 12 },
});
