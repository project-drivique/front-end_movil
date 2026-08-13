/**
 * RF50 — Editar información del usuario
 * RF50.1: Modificar nombre
 * RF50.2: Modificar correo
 * RF50.3: Modificar teléfono
 * RF50.4: Validar contraseña actual
 * RF50.5: Guardar cambios validados
 * RF50.6: Cancelar edición
 */
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { IdiomaKey, IDIOMAS } from "@/modules/i18n";
import { useIdioma, useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { usePerfil } from "@/modules/profile/hooks/useProfile";
import { ModalCambiarCorreo } from "@/modules/profile/components/ChangeEmailModal";
import { FormCompletarPerfil } from "@/modules/profile/components/CompleteProfileForm";
import { perfilStyles as styles } from "@/modules/profile/styles/profile.styles";
import { useAuthStore } from "@/store/authStore";
import { useUsuarioStore } from "@/store/userStore";
import { LinearGradient } from "expo-linear-gradient";
import { GRADIENTES } from "@/constants/gradients";
import { eliminarUsuarioDemo } from "@/mocks/demoUsers";
import { DateField } from "@/components/ui/DateField";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Ionicons } from "@expo/vector-icons";
import { getPrefijoPorNacionalidad, NACIONALIDADES } from "@/modules/reservation/constants/reservation.constants";
import CampoSelectorLista from "@/modules/reservation/components/ListSelectorField";
import { useMoneda } from "@/hooks/useCurrency";
import { AlertModal } from "@/components/ui/AlertModal";
import { Moneda } from "@/utils/currencyUtils";

const OPCIONES_NACIONALIDAD = NACIONALIDADES.map((n) => ({
  id: n.nombre,
  label: n.nombre,
}));

export default function PerfilScreen() {
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

  // Al elegir USD, la moneda solo cambia la referencia visual de los
  // precios; el cobro real con Wompi siempre se hace en COP. Se avisa
  // con un modal cada vez que la persona selecciona USD.
  const handleCambiarMoneda = (moneda: Moneda) => {
    cambiarMoneda(moneda);
    if (moneda === "USD") setMostrarAvisoUSD(true);
  };

  const authUsuario = useAuthStore((s) => s.usuario);
  const cerrarSesionAuth = useAuthStore((s) => s.cerrarSesion);
  const limpiarUsuario = useUsuarioStore((s) => s.limpiarUsuario);

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
    setMostrarModalCorreo,
    guardarCambioCorreo,
    cerrarModalCorreo,
    marcarPerfilCompleto,
  } = usePerfil();

  const prefijoTelefono = getPrefijoPorNacionalidad(form.nacionalidad || null);

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

  const handleEliminarCuenta = () => {
    Alert.alert(
      t("perfil.eliminarTitulo"),
      t("perfil.eliminarMsg"),
      [
        { text: t("perfil.cancelar"), style: "cancel" },
        {
          text: t("perfil.confirmarEliminar"),
          style: "destructive",
          onPress: () => {
            // RF52 — Eliminar cuenta
            // En producción esto llama a DELETE /usuarios/:id contra el
            // backend. Mientras tanto, con datos mock, quitamos al usuario
            // de USUARIOS_DEMO (mocks/demoUsers.ts) para que ya no
            // pueda volver a iniciar sesión, y limpiamos ambos stores.
            const correo = authUsuario?.correo || usuario.correo;
            if (correo) eliminarUsuarioDemo(correo);
            cerrarSesionAuth();
            limpiarUsuario();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  // ── Vista completar perfil ────────────────────────────────────────────────
  if (completando) {
    return (
      <View style={[styles.editContainer, { paddingTop: insets.top, backgroundColor: c.bg }]}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <LinearGradient
          colors={GRADIENTES.boton.colors}
          start={GRADIENTES.boton.start}
          end={GRADIENTES.boton.end}
          style={styles.editHeader}
        >
          <TouchableOpacity
            style={styles.editHeaderBack}
            onPress={() => setCompletando(false)}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={18} color="#1D4ED8" />
            <Text style={styles.editHeaderBackText}>{t("perfil.volver")}</Text>
          </TouchableOpacity>
          <Text style={[styles.editHeaderTitle, { color: "#ffffff" }]}>{t("perfil.completarPerfil")}</Text>
        </LinearGradient>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === "android" ? 100 : 60 }}
        >
          <FormCompletarPerfil
            onGuardado={() => {
              marcarPerfilCompleto();
              setCompletando(false);
            }}
          />
        </ScrollView>
      </View>
    );
  }

  // ── Vista editar perfil ───────────────────────────────────────────────────
  if (editando) {
    return (
      <View style={[styles.editContainer, { paddingTop: insets.top, backgroundColor: c.bg }]}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <LinearGradient
          colors={GRADIENTES.boton.colors}
          start={GRADIENTES.boton.start}
          end={GRADIENTES.boton.end}
          style={styles.editHeader}
        >
          <TouchableOpacity
            style={styles.editHeaderBack}
            onPress={handleCancelar}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={18} color="#1D4ED8" />
            <Text style={styles.editHeaderBackText}>{t("perfil.volver")}</Text>
          </TouchableOpacity>
          <Text style={[styles.editHeaderTitle, { color: "#ffffff" }]}>{t("perfil.editarTitulo")}</Text>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: 20, paddingBottom: Platform.OS === "android" ? 100 : 60 }}
        >
          {/* Formulario */}
          <View style={styles.editFormWrap}>
            <SectionLabel icono="person-outline" texto={t("perfil.datosPersonales")} primaryBg={c.primaryBg} />

            <View style={styles.editCampoWrap}>
              <Text style={[styles.editCampoLabel, { color: c.textSecondary }]}>{t("perfil.nombres")}</Text>
              <TextInput
                style={[styles.editInput, { backgroundColor: c.bgInput, borderColor: c.border, color: c.textPrimary }, errores.nombres ? styles.editInputError : null]}
                value={form.nombres}
                onChangeText={(val) => actualizarCampo("nombres", val)}
                placeholder={t("perfil.placeholderNombres")}
                placeholderTextColor={c.textMuted}
                autoCapitalize="words"
              />
              {errores.nombres && <Text style={styles.editErrorText}>{errores.nombres}</Text>}
            </View>

            <View style={styles.editCampoWrap}>
              <Text style={[styles.editCampoLabel, { color: c.textSecondary }]}>{t("perfil.apellidos")}</Text>
              <TextInput
                style={[styles.editInput, { backgroundColor: c.bgInput, borderColor: c.border, color: c.textPrimary }, errores.apellidos ? styles.editInputError : null]}
                value={form.apellidos}
                onChangeText={(val) => actualizarCampo("apellidos", val)}
                placeholder={t("perfil.placeholderApellidos")}
                placeholderTextColor={c.textMuted}
                autoCapitalize="words"
              />
              {errores.apellidos && <Text style={styles.editErrorText}>{errores.apellidos}</Text>}
            </View>

            <View style={styles.editCampoWrap}>
              <CampoSelectorLista
                etiqueta={t("perfil.nacionalidad")}
                valorSeleccionado={form.nacionalidad || null}
                opciones={OPCIONES_NACIONALIDAD}
                onSeleccionar={(id) => actualizarCampo("nacionalidad", id)}
                placeholder={t("perfil.seleccionar")}
              />
              {errores.nacionalidad && <Text style={styles.editErrorText}>{errores.nacionalidad}</Text>}
            </View>

            <View style={styles.editCampoWrap}>
              <DateField
                label={t("perfil.fechaNac")}
                value={form.fechaNacimiento}
                onChange={(val) => actualizarCampo("fechaNacimiento", val)}
                error={errores.fechaNacimiento}
                placeholder={t("perfil.seleccionar")}
                maximumDate={new Date()}
                colores={c}
              />
            </View>

            <SectionLabel icono="call-outline" texto={t("perfil.seccionContacto")} primaryBg={c.primaryBg} />

            <View style={styles.editCampoWrap}>
              <Text style={[styles.editCampoLabel, { color: c.textSecondary }]}>{t("perfil.telefono")}</Text>
              <View style={styles.editFilaCelular}>
                <View
                  style={[
                    styles.editPrefijoBox,
                    { backgroundColor: c.primaryBg, borderColor: c.border },
                    !prefijoTelefono && { backgroundColor: c.oscuro ? "#1F2937" : "#F3F4F6" },
                  ]}
                >
                  <Text style={[styles.editPrefijoText, { color: prefijoTelefono ? c.primary : c.textMuted }]}>
                    {prefijoTelefono}
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.editInput,
                    styles.editInputCelular,
                    { backgroundColor: c.bgInput, borderColor: c.border, color: c.textPrimary },
                    errores.telefono ? styles.editInputError : null,
                  ]}
                  value={form.telefono}
                  onChangeText={(val) => actualizarCampo("telefono", val)}
                  placeholder={t("perfil.placeholderTelefono")}
                  placeholderTextColor={c.textMuted}
                  keyboardType="phone-pad"
                  maxLength={20}
                />
              </View>
              {errores.telefono && <Text style={styles.editErrorText}>{errores.telefono}</Text>}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.editBtnGuardar, cargando && styles.editBtnGuardarDisabled]}
            onPress={handleGuardar}
            activeOpacity={0.85}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.editBtnGuardarText}>{t("perfil.guardarCambios")}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Modal Éxito al guardar cambios */}
        <AlertModal
          visible={successModalVisible}
          icono="checkmark-circle-outline"
          titulo={t("perfil.cambiosGuardados")}
          mensaje={t("perfil.cambiosGuardadosMsg")}
          onCerrar={() => {
            setSuccessModalVisible(false);
            setEditando(false);
          }}
        />

        {/* Modal Error al guardar cambios */}
        <AlertModal
          visible={errorModalVisible}
          icono="alert-circle-outline"
          titulo={t("perfil.errorTitulo")}
          mensaje={errorMensaje}
          onCerrar={() => setErrorModalVisible(false)}
        />
      </View>
    );
  }

  // ── Vista modo invitado ─────────────────────────────────────────────────
  // Sin sesión no hay datos de perfil que editar (historial, seguridad,
  // tarjetas, etc. requieren una cuenta), así que solo dejamos las
  // preferencias generales (idioma, tema, moneda) y un botón para
  // registrarse.
  if (esInvitado) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.bg }]}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <LinearGradient
          colors={GRADIENTES.boton.colors}
          start={GRADIENTES.boton.start}
          end={GRADIENTES.boton.end}
          style={styles.header}
        >
          <Text style={[styles.headerTitle, { color: "#ffffff" }]}>{t("perfil.titulo")}</Text>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Platform.OS === "android" ? 100 : 60 }}
        >
          <View style={[localS.banner, { backgroundColor: c.primaryBg, borderColor: "#1D4ED8", marginTop: 16 }]}>
            <View style={localS.bannerIcono}>
              <Ionicons name="person-add-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={localS.bannerTextos}>
              <Text style={localS.bannerTitulo}>{t("perfil.invitadoTitulo")}</Text>
              <Text style={[localS.bannerSub, { color: c.textSecondary }]}>{t("perfil.invitadoSub")}</Text>
            </View>
          </View>

          {seccionConfig}

          <View style={styles.eliminarWrap}>
            <TouchableOpacity style={localS.registroBtn} onPress={irARegistro} activeOpacity={0.85}>
              <Text style={localS.registroBtnTexto}>{t("perfil.registrateYa")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Vista principal perfil ─────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      <LinearGradient
        colors={GRADIENTES.boton.colors}
        start={GRADIENTES.boton.start}
        end={GRADIENTES.boton.end}
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: "#ffffff" }]}>{t("perfil.titulo")}</Text>
      </LinearGradient>

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
          </View>
          <TouchableOpacity style={styles.btnEditar} onPress={() => setEditando(true)}>
            <Text style={styles.btnEditarText}>{t("perfil.editar")}</Text>
          </TouchableOpacity>
        </View>

        {/* Banner completar perfil */}
        {!usuario.perfilCompleto && (
          <TouchableOpacity
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
          <TouchableOpacity
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

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setMostrarModalCorreo(true)}
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

        {/* Cerrar sesión */}
        <View style={[styles.cerrarSection, { backgroundColor: c.bgCard, borderColor: c.border }]}>
          <TouchableOpacity style={styles.cerrarBtn} onPress={handleCerrarSesion}>
            <View style={styles.cerrarIconWrap}>
              <Text style={styles.menuIcon}>→</Text>
            </View>
            <Text style={styles.cerrarLabel}>{t("perfil.cerrarSesion")}</Text>
          </TouchableOpacity>
        </View>

        {/* Eliminar cuenta */}
        <View style={styles.eliminarWrap}>
          <TouchableOpacity
            style={styles.eliminarBtn}
            onPress={handleEliminarCuenta}
          >
            <Text style={styles.eliminarText}>{t("perfil.eliminarCuenta")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal cambiar correo */}
      <ModalCambiarCorreo
        visible={mostrarModalCorreo}
        form={formCorreo}
        errores={erroresCorreo}
        cargando={cargando}
        correoActual={usuario.correo}
        onCambiar={actualizarCampoCorreo}
        onGuardar={handleGuardarCorreo}
        onCerrar={cerrarModalCorreo}
      />

      {/* Aviso al elegir USD: el cobro real siempre se hace en COP */}
      <AlertModal
        visible={mostrarAvisoUSD}
        icono="information-circle-outline"
        titulo={t("config.monedaUsdTitulo")}
        mensaje=""
        contenido={
          <Text style={{ fontSize: 13.5, color: "#4B5563", textAlign: "center", lineHeight: 20, marginBottom: 24, marginTop: -16 }}>
            {t("config.monedaUsdParte1")}
            <Text style={{ fontWeight: "700" }}>{t("config.monedaUsdDolares")}</Text>
            {t("config.monedaUsdParte2")}
            {"\n\n"}
            {t("config.monedaUsdParte3")}
            <Text style={{ fontWeight: "700" }}>{t("config.monedaUsdPesos")}</Text>
            {t("config.monedaUsdParte4")}
          </Text>
        }
        onCerrar={() => setMostrarAvisoUSD(false)}
      />

      {/* Modal Éxito al guardar cambios */}
      <AlertModal
        visible={successModalVisible}
        icono="checkmark-circle-outline"
        titulo={t("perfil.cambiosGuardados")}
        mensaje={t("perfil.cambiosGuardadosMsg")}
        onCerrar={() => {
          setSuccessModalVisible(false);
          setEditando(false);
        }}
      />

      {/* Modal Error al guardar cambios */}
      <AlertModal
        visible={errorModalVisible}
        icono="alert-circle-outline"
        titulo={t("perfil.errorTitulo")}
        mensaje={errorMensaje}
        onCerrar={() => setErrorModalVisible(false)}
      />
    </View>
  );
}

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
  },
  registroBtn: {
    backgroundColor: "#1D4ED8",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  registroBtnTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});

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
});