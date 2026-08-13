import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useAuthStore } from "@/store/authStore";
import { useAuditStore, EventoAuditoria } from "@/store/auditStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function BranchDashboardScreen() {
  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const usuario = useAuthStore((s) => s.usuario);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);
  const logsAuditoria = useAuditStore((s) => s.logs);

  const sucursalNombre = usuario?.sucursalNombre || "Sucursal Asignada";

  // Filtrar logs que correspondan a la sede del usuario o su correo
  const logsSucursal = logsAuditoria.filter(
    (l) => l.sucursal && (l.sucursal === sucursalNombre || l.correo === usuario?.correo)
  );

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
              <Ionicons name="business" size={13} color="#60A5FA" />
              <Text style={styles.roleBadgeText}>ENCARGADO DE SUCURSAL</Text>
            </View>
            <Text style={styles.welcomeText}>
              {usuario?.nombres || "Encargado"} {usuario?.apellidos || ""}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color="#93C5FD" />
              <Text style={styles.branchNameText}>{sucursalNombre}</Text>
            </View>
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
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Informativo de Sucursal */}
        <View style={[styles.branchBanner, { backgroundColor: c.bgCard, borderColor: c.border }]}>
          <View style={[styles.bannerIconWrap, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="storefront-outline" size={24} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.branchBannerTitle, { color: c.textPrimary }]}>
              Panel Operativo - {sucursalNombre}
            </Text>
            <Text style={[styles.branchBannerSub, { color: c.textSecondary }]}>
              Recepción, entrega y gestión de mantenimiento de la sede.
            </Text>
          </View>
        </View>

        {/* Métricas Operativas */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>
            Operación Diaria
          </Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Sede activa</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <View style={[styles.metricIconBox, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="car-sport" size={20} color="#2563EB" />
            </View>
            <Text style={[styles.metricNumber, { color: c.textPrimary }]}>14</Text>
            <Text style={[styles.metricLabel, { color: c.textSecondary }]}>Autos en Sede</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <View style={[styles.metricIconBox, { backgroundColor: "#F0FDF4" }]}>
              <Ionicons name="calendar" size={20} color="#16A34A" />
            </View>
            <Text style={[styles.metricNumber, { color: c.textPrimary }]}>6</Text>
            <Text style={[styles.metricLabel, { color: c.textSecondary }]}>Reservas Hoy</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <View style={[styles.metricIconBox, { backgroundColor: "#FFFBEB" }]}>
              <Ionicons name="key" size={20} color="#D97706" />
            </View>
            <Text style={[styles.metricNumber, { color: c.textPrimary }]}>3</Text>
            <Text style={[styles.metricLabel, { color: c.textSecondary }]}>Entregas Pendientes</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <View style={[styles.metricIconBox, { backgroundColor: "#FAF5FF" }]}>
              <Ionicons name="checkmark-done-circle" size={20} color="#9333EA" />
            </View>
            <Text style={[styles.metricNumber, { color: c.textPrimary }]}>5</Text>
            <Text style={[styles.metricLabel, { color: c.textSecondary }]}>Devoluciones Hoy</Text>
          </View>
        </View>

        {/* Acciones de Operación */}
        <Text style={[styles.sectionTitle, { color: c.textPrimary, marginTop: 22, marginBottom: 12 }]}>
          Herramientas de Sucursal
        </Text>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
          onPress={() => router.push("/(tabs)/support")}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: "#FFFBEB" }]}>
            <Ionicons name="build-outline" size={22} color="#D97706" />
          </View>
          <View style={styles.actionBody}>
            <Text style={[styles.actionTitle, { color: c.textPrimary }]}>
              Gestión de Incidencias Técnico/Mecánicas
            </Text>
            <Text style={[styles.actionSub, { color: c.textSecondary }]}>
              Atención a reportes de vehículo generados por los clientes.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
          onPress={() => router.push("/(tabs)/catalog")}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="car-sport-outline" size={22} color="#2563EB" />
          </View>
          <View style={styles.actionBody}>
            <Text style={[styles.actionTitle, { color: c.textPrimary }]}>
              Catálogo General de Flota
            </Text>
            <Text style={[styles.actionSub, { color: c.textSecondary }]}>
              Consulta la disponibilidad global de modelos de la empresa.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </TouchableOpacity>

        {/* Historial de Auditoría de la Sede */}
        <Text style={[styles.sectionTitle, { color: c.textPrimary, marginTop: 22, marginBottom: 12 }]}>
          Últimos Accesos de la Sede
        </Text>

        {logsSucursal.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <Ionicons name="shield-outline" size={24} color={c.textMuted} />
            <Text style={[styles.emptyTxt, { color: c.textMuted }]}>
              No hay accesos recientes registrados para esta sede.
            </Text>
          </View>
        ) : (
          logsSucursal.map((item: EventoAuditoria) => {
            const esExito = item.resultado === "Exitoso";
            const col = esExito ? "#16A34A" : "#DC2626";
            return (
              <View
                key={item.id}
                style={[
                  styles.auditCard,
                  { backgroundColor: c.bgCard, borderColor: c.border, borderLeftColor: col },
                ]}
              >
                <View style={styles.auditRowTop}>
                  <Text style={[styles.auditId, { color: c.textPrimary }]}>{item.id}</Text>
                  <Text style={[styles.auditBadgeTxt, { color: col }]}>{item.resultado}</Text>
                </View>
                <Text style={[styles.auditSubTxt, { color: c.textSecondary }]}>
                  {item.correo} · {formatFechaHora(item.fechaHora)}
                </Text>
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  branchNameText: { color: "#93C5FD", fontSize: 12.5, fontWeight: "700" },
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

  scrollContent: { padding: 18 },

  branchBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  bannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  branchBannerTitle: { fontSize: 15, fontWeight: "800" },
  branchBannerSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },

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

  emptyBox: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  emptyTxt: { fontSize: 12.5 },

  auditCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  auditRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  auditId: { fontSize: 13.5, fontWeight: "800" },
  auditBadgeTxt: { fontSize: 11, fontWeight: "800" },
  auditSubTxt: { fontSize: 11.5, marginTop: 4 },
});
