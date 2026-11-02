
import { Text, View, TouchableOpacity, FlatList, ScrollView, Modal, RefreshControl } from 'react-native'





import { GRADIENTES, SOMBRA_BOTON_GRADIENTE } from "@/constants/gradients";



import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";



import { styles } from '../../modules/notifications/screens/notifications.styles'
import NotificationsPart4 from '../../modules/notifications/screens/NotificationsScreen/NotificationsPart4'
import NotificationsPart3 from '../../modules/notifications/screens/NotificationsScreen/NotificationsPart3'
import NotificationsPart2 from '../../modules/notifications/screens/NotificationsScreen/NotificationsPart2'
import NotificationsPart from '../../modules/notifications/screens/NotificationsScreen/NotificationsPart'
import Length from '../../modules/notifications/screens/NotificationsScreen/Length'
import useNotificationsScreenLogic1 from '../../modules/notifications/screens/NotificationsScreen/useNotificationsScreenLogic1'

export default function NotificationsScreen() {
  const { insets, c, t, primaryAccent, usuario, cargando, marcarTodasComoLeidas, monedaActual, tasaUSD, activeTab, setActiveTab, appliedCoupons, refreshing, selectedConditionsCoupon, setSelectedConditionsCoupon, activeAppliedCoupon, setActiveAppliedCoupon, activePendingCoupon, setActivePendingCoupon, selectedNotification, setSelectedNotification, handleRefresh, generalNotifications, cupones, vehiculoPromos, handleApplyCoupon, confirmApplyCoupon, getCouponVehicleImages, formatDateTime, formatDateShort, daysUntilExpiry, renderGeneralItem } = useNotificationsScreenLogic1()

  if (!usuario) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        {/* Gradient Header */}
        <LinearGradient
          colors={["#1e3a8a", "#2563eb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("a11y.volver", "Volver")} style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("tabs.notificaciones")}</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView
          contentContainerStyle={{ padding: 24, alignItems: "center", justifyContent: "center", flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: c.primaryBg,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons name="notifications-outline" size={42} color={c.primary} />
          </View>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: c.textPrimary,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {t("tabs.alertaMisReservasTitulo", "Inicia sesión")}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: c.textSecondary,
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 32,
              paddingHorizontal: 12,
            }}
          >
            {t("tabs.notificacionesInvitadoMsg", {
              defaultValue:
                "Para consultar tus alertas del sistema, avisos de reservas y cupones de promociones exclusivas, inicia sesión o crea una cuenta en Drivique.",
            })}
          </Text>

          <View style={{ width: "100%", gap: 14 }}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("perfil.registrateYa", "Crear una cuenta")}
              style={[SOMBRA_BOTON_GRADIENTE, { borderRadius: 14, overflow: "hidden" }]}
              onPress={() => router.push("/(auth)/register")}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={GRADIENTES.boton.colors}
                start={GRADIENTES.boton.start}
                end={GRADIENTES.boton.end}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  gap: 10,
                }}
              >
                <Ionicons name="person-add" size={19} color="#FFFFFF" />
                <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>
                  {t("perfil.registrateYa", "Crear una cuenta")}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("perfil.iniciarSesionInvitado", { defaultValue: "¿Ya tienes una cuenta? Inicia sesión" })}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 13,
                paddingHorizontal: 20,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: c.border,
                backgroundColor: c.bgCard,
                gap: 8,
              }}
              onPress={() => router.push("/(auth)/login")}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in-outline" size={19} color="#1D4ED8" />
              <Text style={{ color: c.textPrimary, fontSize: 14, fontWeight: "600" }}>
                {t("perfil.iniciarSesionInvitado", { defaultValue: "¿Ya tienes una cuenta? Inicia sesión" })}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Gradient Header */}
      <LinearGradient
        colors={["#1e3a8a", "#2563eb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("a11y.volver", "Volver")} style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("tabs.notificaciones")}</Text>
        {activeTab === "general" ? (
          <TouchableOpacity accessibilityRole="button" style={styles.readAllBtn} onPress={marcarTodasComoLeidas}>
            <Ionicons name="checkmark-done-circle-outline" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </LinearGradient>

      {/* Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: c.bgCard, borderBottomColor: c.border }]}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("tabs.generales")}
          style={[styles.tabButton, activeTab === "general" && styles.activeTabButton]}
          onPress={() => setActiveTab("general")}
        >
          <Text style={[styles.tabText, activeTab === "general" ? styles.activeTabText : { color: c.textSecondary }]}>
            {t("tabs.generales")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("tabs.promociones")}
          style={[styles.tabButton, activeTab === "promocion" && styles.activeTabButton]}
          onPress={() => setActiveTab("promocion")}
        >
          <Text style={[styles.tabText, activeTab === "promocion" ? styles.activeTabText : { color: c.textSecondary }]}>
            {t("tabs.promociones")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === "general" ? (
        <FlatList
          data={generalNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderGeneralItem}
          contentContainerStyle={styles.generalList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || cargando}
              onRefresh={handleRefresh}
              colors={["#2563EB"]}
              tintColor="#2563EB"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={60} color={c.textMuted} />
              <Text style={[styles.emptyText, { color: c.textSecondary, marginTop: 12 }]}>
                {t("tabs.sinNotificacionesGenerales", "No tienes notificaciones pendientes.")}
              </Text>
            </View>
          }
        />
      ) : cupones.length === 0 && vehiculoPromos.length === 0 ? (
        <ScrollView
          style={styles.promosScroll}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || cargando}
              onRefresh={handleRefresh}
              colors={["#2563EB"]}
              tintColor="#2563EB"
            />
          }
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetags-outline" size={60} color={c.textMuted} />
            <Text style={[styles.emptyText, { color: c.textSecondary, marginTop: 12 }]}>
              {t("tabs.sinPromociones", "No tienes promociones ni cupones activos en este momento.")}
            </Text>
            <Text style={{ fontSize: 13, color: c.textMuted, textAlign: "center", marginTop: 6, maxWidth: 280, lineHeight: 18 }}>
              {t("tabs.sinPromocionesDesc", "Cuando haya nuevos cupones o beneficios exclusivos para tus reservas, los verás aquí.")}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <Length appliedCoupons={appliedCoupons} c={c} cupones={cupones} daysUntilExpiry={daysUntilExpiry} formatDateShort={formatDateShort} formatDateTime={formatDateTime} getCouponVehicleImages={getCouponVehicleImages} handleApplyCoupon={handleApplyCoupon} monedaActual={monedaActual} primaryAccent={primaryAccent} setSelectedConditionsCoupon={setSelectedConditionsCoupon} t={t} tasaUSD={tasaUSD} vehiculoPromos={vehiculoPromos} />
      )}

      {/* 1. Modal: Terms & Conditions */}
      <NotificationsPart c={c} formatDateShort={formatDateShort} monedaActual={monedaActual} primaryAccent={primaryAccent} selectedConditionsCoupon={selectedConditionsCoupon} setSelectedConditionsCoupon={setSelectedConditionsCoupon} t={t} tasaUSD={tasaUSD} />

      {/* 2.5 Modal: Confirm Apply Coupon */}
      <NotificationsPart2 activePendingCoupon={activePendingCoupon} c={c} confirmApplyCoupon={confirmApplyCoupon} primaryAccent={primaryAccent} setActivePendingCoupon={setActivePendingCoupon} t={t} />

      {/* 2. Modal: Coupon Code Applied Success */}
      <NotificationsPart3 activeAppliedCoupon={activeAppliedCoupon} c={c} setActiveAppliedCoupon={setActiveAppliedCoupon} t={t} />

      {/* 3. Modal: Notification Detail */}
      <NotificationsPart4 c={c} formatDateTime={formatDateTime} primaryAccent={primaryAccent} selectedNotification={selectedNotification} setSelectedNotification={setSelectedNotification} t={t} />
    </View>
  );
}


