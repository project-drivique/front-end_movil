import { useTranslation } from 'react-i18next'
import { useIdioma, useTemaColores } from '@/modules/i18n/hooks/useLanguage'
import { useMoneda } from '@/hooks/useCurrency'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState, useEffect, useMemo } from 'react'
import { Moneda } from '@/utils/currencyUtils'
import { useAuthStore } from '@/store/authStore'
import { useUsuarioStore } from '@/store/userStore'
import { useNotificationStore } from '@/store/notificationStore'
import { UserPreferencesDTO, obtenerPreferencias, actualizarPreferencias } from '@/modules/profile/services/profileService'
import { usePerfil } from '@/modules/profile/hooks/useProfile'
import { getPrefijoPorNacionalidad, getNacionalidades } from '@/modules/reservation/constants/reservation.constants'
import { useReferenceStore } from '@/store/referenceStore'
import { Alert } from '@/utils/alerta'
import { router } from 'expo-router'
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { IDIOMAS, IdiomaKey } from '@/modules/i18n'
import { mezclar, COLOR_MARCA } from '@/constants/brandPalette'
import { sessionTokens } from '@/services/http/sessionTokens'

const configStyles = StyleSheet.create({
  seccion: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  seccionTitulo: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1D4ED8",
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  filaLabel: {
    marginBottom: 8,
  },
  filaLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  monedaSub: {
    fontSize: 11,
    marginTop: 2,
  },
  temaRow: {
    flexDirection: "row",
    gap: 10,
  },
  temaBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  temaBtnActivo: {
    backgroundColor: "#EEF2FF",
    borderColor: "#1D4ED8",
  },
  temaBtnActivoDark: {
    backgroundColor: "#1C2330",
    borderColor: "#4A5568",
  },
  temaBtnTexto: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  temaBtnTextoActivo: {
    color: "#1D4ED8",
  },
  idiomasWrap: {
    gap: 8,
  },
  idiomaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  idiomaBtnActivo: {
    backgroundColor: "#EEF2FF",
    borderColor: "#1D4ED8",
  },
  idiomaFlag: {
    fontSize: 20,
  },
  idiomaLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  idiomaLabelActivo: {
    color: "#1D4ED8",
  },
  idiomaCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  prefInfo: {
    flex: 1,
    paddingRight: 12,
  },
  prefLabel: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  prefSub: {
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16,
  },
});

export default function usePerfilScreenLogic1() {
  const { t } = useTranslation();
    const { idiomaActual, cambiarIdioma, temaActual, cambiarTema } = useIdioma();
    const { monedaActual, cambiarMoneda } = useMoneda();
    const c = useTemaColores();
    const insets = useSafeAreaInsets();
    const [editando, setEditando] = useState(false);
    const [completando, setCompletando] = useState(false);
    const [mostrarAvisoUSD, setMostrarAvisoUSD] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMensaje, setErrorMensaje] = useState("");
    const [mostrarCambioContrasena, setMostrarCambioContrasena] = useState(false);
    const [resultadoContrasena, setResultadoContrasena] = useState<"exito" | "error" | null>(null);
    const [mostrarEliminarCuenta, setMostrarEliminarCuenta] = useState(false);
  
    // Al elegir USD, la moneda solo cambia la referencia visual de los
    // precios; el cobro real con Wompi siempre se hace en COP. Se avisa
    // con un modal cada vez que la persona selecciona USD.
    const handleCambiarMoneda = (moneda: Moneda) => {
      cambiarMoneda(moneda);
      if (moneda === "USD") setMostrarAvisoUSD(true);
    };
  
    const authUsuario = useAuthStore((s) => s.usuario);
    const authToken = useAuthStore((s) => s.token);
    const cerrarSesionAuth = useAuthStore((s) => s.cerrarSesion);
    const limpiarUsuario = useUsuarioStore((s) => s.limpiarUsuario);
    const agregarNotificacion = useNotificationStore((s) => s.agregarNotificacion);
  
    // HU-INT-17: Preferencias de entrega de notificaciones
    const [preferencias, setPreferencias] = useState<UserPreferencesDTO>({
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      inAppNotifications: true,
      marketingNotifications: false,
    });
  
    useEffect(() => {
      if (authUsuario) {
        obtenerPreferencias()
          .then((prefs) => {
            if (prefs) setPreferencias((prev) => ({ ...prev, ...prefs }));
          })
          .catch((err) => console.warn("Error cargando preferencias de usuario:", err));
      }
    }, [authUsuario]);
  
    const handleTogglePref = async (key: keyof UserPreferencesDTO) => {
      const nuevoValor = !preferencias[key];
      const nuevasPrefs = { ...preferencias, [key]: nuevoValor };
      setPreferencias(nuevasPrefs);
      try {
        await actualizarPreferencias({ [key]: nuevoValor });
      } catch (err) {
        console.warn(`Error guardando preferencia ${key}:`, err);
        setPreferencias(preferencias);
      }
    };
  
    const {
      usuario,
      cargando,
      form,
      formCorreo,
      errores,
      erroresCorreo,
      actualizarCampo,
      actualizarCampoCorreo,
      guardarCambios,
      cancelarEdicion,
      mostrarModalCorreo,
      guardarCambioCorreo,
      cerrarModalCorreo,
      marcarPerfilCompleto,
    } = usePerfil();
  
    const prefijoTelefono = getPrefijoPorNacionalidad(form.nacionalidad || null);
    const nacionalidadesApi = useReferenceStore((st) => st.nacionalidades);
    const OPCIONES_NACIONALIDAD = useMemo(
      () => getNacionalidades().map((n) => ({ id: n.id, label: n.nombre })),
      [nacionalidadesApi],
    );
  
    const handleGuardar = () => {
      guardarCambios(
        () => {
          setSuccessModalVisible(true);
        },
        () => {
          setErrorMensaje(t("perfil.errorMsg"));
          setErrorModalVisible(true);
        }
      );
    };
  
    const handleCancelar = () => {
      cancelarEdicion();
      setEditando(false);
    };
  
    const handleGuardarCorreo = () => {
      guardarCambioCorreo(
        () => {
          Alert.alert(
            t("perfil.correoActualizadoTitulo"),
            t("perfil.correoActualizadoMsg"),
            [{ text: t("perfil.ok") }]
          );
        },
        (msg) => {
          Alert.alert(t("perfil.errorTitulo"), msg, [{ text: t("perfil.errorBtn") }]);
        }
      );
    };
  
    const handleCerrarSesion = () => {
      cerrarSesionAuth();
      limpiarUsuario();
      router.replace("/(auth)/login");
    };
  
    // El usuario navega en modo invitado cuando no hay sesión iniciada
    // (ver app/(auth)/login.tsx → handleInvitado, que entra directo al
    // catálogo sin llamar a setUsuario).
    const esInvitado = !authUsuario;
  
    const irARegistro = () => router.push("/(auth)/register");
  
    const cambioContrasenaExitoso = () => {
      setMostrarCambioContrasena(false);
      setResultadoContrasena("exito");
      agregarNotificacion({
        tipo: "general",
        titulo: t("perfil.cambiarContrasena.notificacionTitulo"),
        mensaje: t("perfil.cambiarContrasena.notificacionMensaje"),
        icono: "shield-checkmark-outline",
      });
    };
  
    // Sección de Tema / Idioma / Moneda — se reutiliza igual en la vista
    // normal y en la vista reducida de modo invitado.
    const seccionConfig = (
      <View style={[configStyles.seccion, { backgroundColor: c.bgCard, borderColor: c.border }]}>
        <Text style={configStyles.seccionTitulo}>
          {t("config.tema")} &amp; {t("config.idioma")}
        </Text>
  
        <View style={[configStyles.filaLabel, configStyles.filaLabelRow]}>
          <Ionicons name="color-palette-outline" size={16} color="#1D4ED8" />
          <Text style={[configStyles.label, { color: c.textPrimary }]}>{t("config.tema")}</Text>
        </View>
        <View style={configStyles.temaRow}>
          <TouchableOpacity
            style={[configStyles.temaBtn, { borderColor: c.border, backgroundColor: c.bgInput }, temaActual === "claro" && configStyles.temaBtnActivo]}
            onPress={() => cambiarTema("claro")}
          >
            <Ionicons name="sunny-outline" size={15} color={temaActual === "claro" ? "#1D4ED8" : c.textSecondary} />
            <Text style={[configStyles.temaBtnTexto, { color: c.textPrimary }, temaActual === "claro" && configStyles.temaBtnTextoActivo]}>
              {t("config.claro")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[configStyles.temaBtn, { borderColor: c.border, backgroundColor: c.bgInput }, temaActual === "oscuro" && configStyles.temaBtnActivoDark]}
            onPress={() => cambiarTema("oscuro")}
          >
            <Ionicons name="moon-outline" size={15} color={temaActual === "oscuro" ? "#F0F4FF" : c.textSecondary} />
            <Text style={[configStyles.temaBtnTexto, { color: c.textPrimary }, temaActual === "oscuro" && { color: "#F0F4FF" }]}>
              {t("config.oscuro")}
            </Text>
          </TouchableOpacity>
        </View>
  
        <View style={[configStyles.filaLabel, configStyles.filaLabelRow, { marginTop: 16 }]}>
          <Ionicons name="language-outline" size={16} color="#1D4ED8" />
          <Text style={[configStyles.label, { color: c.textPrimary }]}>{t("config.idioma")}</Text>
        </View>
        <View style={configStyles.idiomasWrap}>
          {(Object.keys(IDIOMAS) as IdiomaKey[]).map((key) => (
            <TouchableOpacity
              key={key}
              style={[configStyles.idiomaBtn, { borderColor: c.border, backgroundColor: c.bgInput }, idiomaActual === key && configStyles.idiomaBtnActivo]}
              onPress={() => cambiarIdioma(key)}
            >
              <Text style={configStyles.idiomaFlag}>{IDIOMAS[key].flag}</Text>
              <Text style={[configStyles.idiomaLabel, { color: c.textPrimary }, idiomaActual === key && configStyles.idiomaLabelActivo]}>
                {IDIOMAS[key].label}
              </Text>
              {idiomaActual === key && (
                <View style={configStyles.idiomaCheck}>
                  <Text style={{ fontSize: 10, color: "#fff", fontWeight: "800" }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
  
        <View style={[configStyles.filaLabel, configStyles.filaLabelRow, { marginTop: 16 }]}>
          <Ionicons name="cash-outline" size={16} color="#1D4ED8" />
          <Text style={[configStyles.label, { color: c.textPrimary }]}>{t("config.moneda")}</Text>
        </View>
        <View style={configStyles.temaRow}>
          <TouchableOpacity
            style={[configStyles.temaBtn, { borderColor: c.border, backgroundColor: c.bgInput }, monedaActual === "COP" && configStyles.temaBtnActivo]}
            onPress={() => handleCambiarMoneda("COP")}
          >
            <Text style={[configStyles.temaBtnTexto, { color: c.textPrimary }, monedaActual === "COP" && configStyles.temaBtnTextoActivo]}>
              🇨🇴 COP
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[configStyles.temaBtn, { borderColor: c.border, backgroundColor: c.bgInput }, monedaActual === "USD" && configStyles.temaBtnActivo]}
            onPress={() => handleCambiarMoneda("USD")}
          >
            <Text style={[configStyles.temaBtnTexto, { color: c.textPrimary }, monedaActual === "USD" && configStyles.temaBtnTextoActivo]}>
              🇺🇸 USD
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  
    const seccionPreferencias = (
      <View style={[configStyles.seccion, { backgroundColor: c.bgCard, borderColor: c.border, marginTop: 14 }]}>
        <Text style={configStyles.seccionTitulo}>
          {t("perfil.preferenciasEntrega", "PREFERENCIAS DE NOTIFICACIONES")}
        </Text>
        <Text style={{ fontSize: 12.5, color: c.textSecondary, marginBottom: 12, lineHeight: 18 }}>
          {t("perfil.preferenciasEntregaDesc", "Elige los canales por los cuales deseas recibir actualizaciones de reservas, contratos y alertas de tu cuenta.")}
        </Text>
  
        {/* Email */}
        <View style={[configStyles.prefRow, { borderBottomColor: c.border }]}>
          <View style={configStyles.prefInfo}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="mail-outline" size={17} color="#2563EB" />
              <Text style={[configStyles.prefLabel, { color: c.textPrimary }]}>
                {t("perfil.prefEmail", "Correo electrónico")}
              </Text>
            </View>
            <Text style={[configStyles.prefSub, { color: c.textMuted }]}>
              {t("perfil.prefEmailSub", "Confirmaciones, facturas y contratos")}
            </Text>
          </View>
          <Switch
            value={Boolean(preferencias.emailNotifications)}
            onValueChange={() => handleTogglePref("emailNotifications")}
            trackColor={{ false: c.border, true: mezclar(COLOR_MARCA, "#FFFFFF", 0.55) }}
            thumbColor={preferencias.emailNotifications ? COLOR_MARCA : "#F3F4F6"}
            {...({ activeThumbColor: COLOR_MARCA } as object)}
          />
        </View>
  
        {/* Push */}
        <View style={[configStyles.prefRow, { borderBottomColor: c.border }]}>
          <View style={configStyles.prefInfo}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="phone-portrait-outline" size={17} color="#10B981" />
              <Text style={[configStyles.prefLabel, { color: c.textPrimary }]}>
                {t("perfil.prefPush", "Notificaciones Push")}
              </Text>
            </View>
            <Text style={[configStyles.prefSub, { color: c.textMuted }]}>
              {t("perfil.prefPushSub", "Alertas instantáneas en tu dispositivo móvil")}
            </Text>
          </View>
          <Switch
            value={Boolean(preferencias.pushNotifications)}
            onValueChange={() => handleTogglePref("pushNotifications")}
            trackColor={{ false: c.border, true: mezclar(COLOR_MARCA, "#FFFFFF", 0.55) }}
            thumbColor={preferencias.pushNotifications ? COLOR_MARCA : "#F3F4F6"}
            {...({ activeThumbColor: COLOR_MARCA } as object)}
          />
        </View>
  
        {/* In-App */}
        <View style={[configStyles.prefRow, { borderBottomColor: c.border }]}>
          <View style={configStyles.prefInfo}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="notifications-outline" size={17} color="#8B5CF6" />
              <Text style={[configStyles.prefLabel, { color: c.textPrimary }]}>
                {t("perfil.prefInApp", "Alertas en la aplicación")}
              </Text>
            </View>
            <Text style={[configStyles.prefSub, { color: c.textMuted }]}>
              {t("perfil.prefInAppSub", "Bandeja y centro de notificaciones Drivique")}
            </Text>
          </View>
          <Switch
            value={Boolean(preferencias.inAppNotifications)}
            onValueChange={() => handleTogglePref("inAppNotifications")}
            trackColor={{ false: c.border, true: mezclar(COLOR_MARCA, "#FFFFFF", 0.55) }}
            thumbColor={preferencias.inAppNotifications ? COLOR_MARCA : "#F3F4F6"}
            {...({ activeThumbColor: COLOR_MARCA } as object)}
          />
        </View>
  
        {/* Marketing */}
        <View style={[configStyles.prefRow, { borderBottomWidth: 0 }]}>
          <View style={configStyles.prefInfo}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="pricetag-outline" size={17} color="#EC4899" />
              <Text style={[configStyles.prefLabel, { color: c.textPrimary }]}>
                {t("perfil.prefMarketing", "Promociones y novedades")}
              </Text>
            </View>
            <Text style={[configStyles.prefSub, { color: c.textMuted }]}>
              {t("perfil.prefMarketingSub", "Descuentos exclusivos y noticias de la flota")}
            </Text>
          </View>
          <Switch
            value={Boolean(preferencias.marketingNotifications)}
            onValueChange={() => handleTogglePref("marketingNotifications")}
            trackColor={{ false: c.border, true: mezclar(COLOR_MARCA, "#FFFFFF", 0.55) }}
            thumbColor={preferencias.marketingNotifications ? COLOR_MARCA : "#F3F4F6"}
            {...({ activeThumbColor: COLOR_MARCA } as object)}
          />
        </View>
      </View>
    );
  
    const handleEliminarCuenta = () => setMostrarEliminarCuenta(true);
  
    // El servidor cierra todas las sesiones al cambiar la contraseña: se vuelve a iniciar con la nueva
    const cerrarTrasCambioContrasena = async () => {
      setResultadoContrasena(null);
      await sessionTokens.clearRefreshToken();
      cerrarSesionAuth();
      limpiarUsuario();
      router.replace("/(auth)/login");
    };
  
    const cuentaEliminada = async () => {
      await sessionTokens.clearRefreshToken();
      setMostrarEliminarCuenta(false);
      cerrarSesionAuth();
      limpiarUsuario();
      router.replace("/(auth)/login");
    };

  return { t, c, insets, editando, setEditando, completando, setCompletando, mostrarAvisoUSD, setMostrarAvisoUSD, successModalVisible, setSuccessModalVisible, errorModalVisible, setErrorModalVisible, errorMensaje, mostrarCambioContrasena, setMostrarCambioContrasena, resultadoContrasena, setResultadoContrasena, mostrarEliminarCuenta, setMostrarEliminarCuenta, authUsuario, authToken, usuario, cargando, form, formCorreo, errores, erroresCorreo, actualizarCampo, actualizarCampoCorreo, mostrarModalCorreo, cerrarModalCorreo, marcarPerfilCompleto, prefijoTelefono, OPCIONES_NACIONALIDAD, handleGuardar, handleCancelar, handleGuardarCorreo, handleCerrarSesion, esInvitado, irARegistro, cambioContrasenaExitoso, seccionConfig, seccionPreferencias, handleEliminarCuenta, cerrarTrasCambioContrasena, cuentaEliminada }
}
