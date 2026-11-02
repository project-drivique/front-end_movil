/**
 * RF50 — Editar información del usuario
 * RF50.1: Modificar nombre
 * RF50.2: Modificar correo
 * RF50.3: Modificar teléfono
 * RF50.4: Validar contraseña actual
 * RF50.5: Guardar cambios validados
 * RF50.6: Cancelar edición
 */


import { ActivityIndicator, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'


import { router } from "expo-router";




import { ModalCambiarCorreo } from "@/modules/profile/components/ChangeEmailModal";
import { ChangePasswordModal } from "@/modules/profile/components/ChangePasswordModal";
import { DeleteAccountModal } from "@/modules/profile/components/DeleteAccountModal";
import { FormCompletarPerfil } from "@/modules/profile/components/CompleteProfileForm";
import { perfilStyles as styles } from "@/modules/profile/styles/profile.styles";



import { LinearGradient } from "expo-linear-gradient";
import { GRADIENTES, SOMBRA_BOTON_GRADIENTE } from "@/constants/gradients";
import { DateField } from "@/components/ui/DateField";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Ionicons } from "@expo/vector-icons";
import { getTiposDocumento } from '@/modules/reservation/constants/reservation.constants'
import CampoSelectorLista from "@/modules/reservation/components/ListSelectorField";

import { AlertModal } from "@/components/ui/AlertModal";




import ProfilePart from '../../modules/profile/screens/ProfileScreen/ProfilePart'
import usePerfilScreenLogic1 from '../../modules/profile/screens/ProfileScreen/usePerfilScreenLogic1'
import { localS } from '../../modules/profile/screens/profile.local.styles'

export default function PerfilScreen() {
  const { t, c, insets, editando, setEditando, completando, setCompletando, mostrarAvisoUSD, setMostrarAvisoUSD, successModalVisible, setSuccessModalVisible, errorModalVisible, setErrorModalVisible, errorMensaje, mostrarCambioContrasena, setMostrarCambioContrasena, resultadoContrasena, setResultadoContrasena, mostrarEliminarCuenta, setMostrarEliminarCuenta, authUsuario, authToken, usuario, cargando, form, formCorreo, errores, erroresCorreo, actualizarCampo, actualizarCampoCorreo, mostrarModalCorreo, cerrarModalCorreo, marcarPerfilCompleto, prefijoTelefono, OPCIONES_NACIONALIDAD, handleGuardar, handleCancelar, handleGuardarCorreo, handleCerrarSesion, esInvitado, irARegistro, cambioContrasenaExitoso, seccionConfig, seccionPreferencias, handleEliminarCuenta, cerrarTrasCambioContrasena, cuentaEliminada } = usePerfilScreenLogic1()

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
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("perfil.volver")}
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
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("perfil.volver")}
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
              <TextInput accessibilityLabel={t("perfil.placeholderNombres")}
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
              <TextInput accessibilityLabel={t("perfil.placeholderApellidos")}
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
              <CampoSelectorLista
                etiqueta={t("perfil.tipoDocumento")}
                valorSeleccionado={form.tipoDocumento || null}
                opciones={getTiposDocumento(t).map((o) => ({ id: o.id, label: o.label }))}
                onSeleccionar={(id) => actualizarCampo("tipoDocumento", id)}
                placeholder={t("perfil.seleccionar")}
              />
            </View>

            <View style={styles.editCampoWrap}>
              <Text style={[styles.editCampoLabel, { color: c.textSecondary }]}>{t("perfil.numeroDocumento")}</Text>
              <TextInput
                style={[styles.editInput, { backgroundColor: c.bgInput, borderColor: c.border, color: c.textPrimary }]}
                value={form.numeroDocumento || ""}
                onChangeText={(val) => actualizarCampo("numeroDocumento", val)}
                placeholderTextColor={c.textMuted}
                maxLength={20}
              />
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
                {prefijoTelefono ? (
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
                ) : null}
                <TextInput accessibilityLabel={t("perfil.placeholderTelefono")}
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

            <View style={styles.editCampoWrap}>
              <Text style={[styles.editCampoLabel, { color: c.textSecondary }]}>{t("perfil.direccion", { defaultValue: "Dirección" })}</Text>
              <TextInput accessibilityLabel={t("perfil.placeholderDireccion", { defaultValue: "Calle 10 # 20-30, Medellín" })}
                style={[styles.editInput, { backgroundColor: c.bgInput, borderColor: c.border, color: c.textPrimary }]}
                value={form.direccion}
                onChangeText={(val) => actualizarCampo("direccion", val)}
                placeholder={t("perfil.placeholderDireccion", { defaultValue: "Calle 10 # 20-30, Medellín" })}
                placeholderTextColor={c.textMuted}
                maxLength={255}
              />
            </View>
          </View>

          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("perfil.guardarCambios")}
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
          colors={['#1e3a8a', '#2563eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
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

          <View style={localS.guestCtaContainer}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("perfil.registrateYa")}
              style={[localS.guestBtnShadow, SOMBRA_BOTON_GRADIENTE]}
              onPress={irARegistro}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={GRADIENTES.boton.colors}
                start={GRADIENTES.boton.start}
                end={GRADIENTES.boton.end}
                style={localS.guestBtnGradient}
              >
                <Ionicons name="person-add" size={19} color="#FFFFFF" />
                <Text style={localS.guestBtnText}>{t("perfil.registrateYa")}</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("perfil.iniciarSesionInvitado", { defaultValue: "¿Ya tienes una cuenta? Inicia sesión" })}
              style={[
                localS.guestLoginBtn,
                { borderColor: c.border, backgroundColor: c.bgCard }
              ]}
              onPress={() => router.push("/(auth)/login")}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in-outline" size={19} color="#1D4ED8" />
              <Text style={[localS.guestLoginText, { color: c.textPrimary }]}>
                {t("perfil.iniciarSesionInvitado", { defaultValue: "¿Ya tienes una cuenta? Inicia sesión" })}
              </Text>
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
        colors={['#1e3a8a', '#2563eb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: "#ffffff" }]}>{t("perfil.titulo")}</Text>
      </LinearGradient>

      <ProfilePart c={c} handleCerrarSesion={handleCerrarSesion} handleEliminarCuenta={handleEliminarCuenta} seccionConfig={seccionConfig} seccionPreferencias={seccionPreferencias} setCompletando={setCompletando} setEditando={setEditando} setMostrarCambioContrasena={setMostrarCambioContrasena} t={t} usuario={usuario} />

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

      <ChangePasswordModal
        visible={mostrarCambioContrasena}
        correo={authUsuario?.correo || usuario.correo}
        token={authToken}
        onCerrar={() => setMostrarCambioContrasena(false)}
        onExito={cambioContrasenaExitoso}
        onError={() => setResultadoContrasena("error")}
      />

      <DeleteAccountModal
        visible={mostrarEliminarCuenta}
        onCerrar={() => setMostrarEliminarCuenta(false)}
        onEliminada={cuentaEliminada}
      />

      <AlertModal
        visible={resultadoContrasena === "exito"}
        icono="checkmark-circle-outline"
        titulo={t("perfil.cambiarContrasena.exitoTitulo")}
        mensaje={t("perfil.cambiarContrasena.exitoMensaje")}
        onCerrar={cerrarTrasCambioContrasena}
      />
      <AlertModal
        visible={resultadoContrasena === "error"}
        icono="alert-circle-outline"
        titulo={t("perfil.cambiarContrasena.errorTitulo")}
        mensaje={t("perfil.cambiarContrasena.errorMensaje")}
        onCerrar={() => setResultadoContrasena(null)}
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




