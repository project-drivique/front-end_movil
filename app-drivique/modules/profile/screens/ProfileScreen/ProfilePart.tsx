import { ScrollView, Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { perfilStyles as styles } from '@/modules/profile/styles/profile.styles'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

const localS = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  bannerIcono: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTextos: { flex: 1 },
  bannerTitulo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1D4ED8",
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 17,
  },
  guestCtaContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  guestBtnShadow: {
    borderRadius: 14,
    overflow: "hidden",
  },
  guestBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 10,
  },
  guestBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  guestLoginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  guestLoginText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default function ProfilePart({ c, handleCerrarSesion, handleEliminarCuenta, seccionConfig, seccionPreferencias, setCompletando, setEditando, setMostrarCambioContrasena, t, usuario }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; handleCerrarSesion: () => void; handleEliminarCuenta: () => void; seccionConfig: any; seccionPreferencias: any; setCompletando: any; setEditando: any; setMostrarCambioContrasena: any; t: any; usuario: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/profile/types/profile.types").UsuarioPerfil }) {
  return (
    <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Platform.OS === "android" ? 100 : 60 }}
        >
          {/* Card usuario */}
          <View style={[styles.userCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <View style={styles.avatar}>
              {usuario.nombres || usuario.apellidos ? (
                <Text style={styles.avatarText}>
                  {usuario.nombres.charAt(0)}{usuario.apellidos.charAt(0)}
                </Text>
              ) : (
                <Ionicons name="person" size={22} color="#fff" />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: c.textPrimary }]}>
                {usuario.nombres} {usuario.apellidos}
              </Text>
              <Text style={[styles.userEmail, { color: c.textSecondary }]}>{usuario.correo}</Text>
              {(Boolean(usuario.telefono) || Boolean(usuario.numeroDocumento)) && (
                <View style={{ marginTop: 4 }}>
                  {Boolean(usuario.telefono) && (
                    <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>
                      📞 {usuario.telefono}
                    </Text>
                  )}
                  {Boolean(usuario.numeroDocumento) && (
                    <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                      🪪 {usuario.numeroDocumento}
                    </Text>
                  )}
                </View>
              )}
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("perfil.editar")} style={styles.btnEditar} onPress={() => setEditando(true)}>
              <Text style={styles.btnEditarText}>{t("perfil.editar")}</Text>
            </TouchableOpacity>
          </View>
  
          {/* Banner completar perfil */}
          {!usuario.perfilCompleto && (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("perfil.completarPerfil")}
              style={[localS.banner, { backgroundColor: c.primaryBg, borderColor: "#1D4ED8" }]}
              onPress={() => setCompletando(true)}
              activeOpacity={0.85}
            >
              <View style={localS.bannerIcono}>
                <Ionicons name="person-circle-outline" size={22} color="#FFFFFF" />
              </View>
              <View style={localS.bannerTextos}>
                <Text style={localS.bannerTitulo}>{t("perfil.completarPerfil")}</Text>
                <Text style={[localS.bannerSub, { color: c.textSecondary }]}>{t("perfil.completarPerfilSub")}</Text>
              </View>
              <Text style={{ color: "#1D4ED8", fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          )}
  
          {/* Menú opciones */}
          <View style={[styles.menuSection, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("perfil.historial")}
              style={[styles.menuItem, styles.menuItemBorder, { borderBottomColor: c.borderLight }]}
              onPress={() => router.push("/(tabs)/my-bookings")}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: c.primaryBg }]}>
                <Ionicons name="receipt-outline" size={18} color={c.primary} />
              </View>
              <View style={styles.menuTextos}>
                <Text style={[styles.menuLabel, { color: c.textPrimary }]}>{t("perfil.historial")}</Text>
                <Text style={[styles.menuSub, { color: c.textMuted }]}>{t("perfil.historialSub")}</Text>
              </View>
              <Text style={[styles.menuArrow, { color: c.textMuted }]}>›</Text>
            </TouchableOpacity>
  
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("perfil.seguridad")}
              style={styles.menuItem}
              onPress={() => setMostrarCambioContrasena(true)}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: c.primaryBg }]}>
                <Ionicons name="lock-closed-outline" size={18} color={c.primary} />
              </View>
              <View style={styles.menuTextos}>
                <Text style={[styles.menuLabel, { color: c.textPrimary }]}>{t("perfil.seguridad")}</Text>
                <Text style={[styles.menuSub, { color: c.textMuted }]}>{t("perfil.seguridadSub")}</Text>
              </View>
              <Text style={[styles.menuArrow, { color: c.textMuted }]}>›</Text>
            </TouchableOpacity>
          </View>
  
          {seccionConfig}
  
          {seccionPreferencias}
  
          {/* Cerrar sesión */}
          <View style={[styles.cerrarSection, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("perfil.cerrarSesion")} style={styles.cerrarBtn} onPress={handleCerrarSesion}>
              <View style={styles.cerrarIconWrap}>
                <Text style={styles.menuIcon}>→</Text>
              </View>
              <Text style={styles.cerrarLabel}>{t("perfil.cerrarSesion")}</Text>
            </TouchableOpacity>
          </View>
  
          {/* Eliminar cuenta */}
          <View style={styles.eliminarWrap}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("perfil.eliminarCuenta")}
              style={styles.eliminarBtn}
              onPress={handleEliminarCuenta}
            >
              <Text style={styles.eliminarText}>{t("perfil.eliminarCuenta")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
  )
}
