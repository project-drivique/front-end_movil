import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTemaColores } from '@/modules/i18n/hooks/useLanguage';
import { useRegistro } from '@/modules/auth/hooks/useAuth';
import { InputField } from '@/components/ui/InputField';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SocialAuthButtons } from '@/modules/auth/components/SocialAuthButtons';
import { PasswordRequirements } from '@/modules/auth/components/PasswordRequirements';
import { registroStyles as styles } from '@/modules/auth/styles/register.styles';
import { GRADIENTES } from '@/constants/gradients';

export default function RegistroScreen() {
  const { t } = useTranslation();
  const c = useTemaColores();
  const insets = useSafeAreaInsets();
  const {
    form,
    cargando,
    actualizarCampo,
    registrar,
    getError,
  } = useRegistro();

  const [modalTerminos, setModalTerminos] = useState(false);
  const [correoTocado, setCorreoTocado] = useState(false);

  const errorCorreo = getError('correo') ??
    (correoTocado && form.correo.length > 0 && !form.correo.includes('@')
      ? t('auth.registro.errorAt')
      : undefined);

  function handleRegistrar() {
    registrar(
      // La verificación de correo (HU aparte) es la pantalla intermedia
      // obligatoria tras registrarse — ya no se va directo a login.
      () => router.replace(`/(auth)/verify-email?correo=${encodeURIComponent(form.correo)}`),
      () => {}
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: c.oscuro ? c.bg : "#F9FAFB" }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Header ───────────────────────────── */}
      <LinearGradient
        colors={c.oscuro ? [c.bg, c.bg] : GRADIENTES.heroOscuro.colors}
        locations={c.oscuro ? [0, 1] : GRADIENTES.heroOscuro.locations}
        start={c.oscuro ? { x: 0, y: 0 } : GRADIENTES.heroOscuro.start}
        end={c.oscuro ? { x: 0, y: 1 } : GRADIENTES.heroOscuro.end}
        style={[
          newS.header, 
          { paddingTop: insets.top + 12 },
          c.oscuro && { borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.border }
        ]}
      >
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/login')}
          style={[newS.backBtn, c.oscuro && { backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border }]}
        >
          <Ionicons name="chevron-back" size={20} color={c.oscuro ? c.textPrimary : "#FFFFFF"} />
        </TouchableOpacity>
        <Text style={[newS.titulo, c.oscuro && { color: c.textPrimary }]}>{t('auth.registro.titulo')}</Text>
        <Text style={[newS.subtitulo, c.oscuro && { color: c.textSecondary }]}>{t('auth.registro.subtitulo')}</Text>
      </LinearGradient>

      {/* ── Sheet blanca con card flotante (mismo lenguaje visual del login) ── */}
      <View style={[newS.sheet, { backgroundColor: c.oscuro ? c.bg : "#F9FAFB" }]}>
        <ScrollView
          contentContainerStyle={newS.sheetScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={newS.cardWrapper}>
            <View style={[
              newS.card, 
              { backgroundColor: c.bgCard },
              c.oscuro && { borderWidth: 1, borderColor: c.border }
            ]}>
              {/* Datos de acceso */}
              <View style={newS.seccion}>
                <View style={newS.seccionHeader}>
                  <View style={[newS.seccionIcono, { backgroundColor: c.primaryBg }]}>
                    <Ionicons name="person-outline" size={14} color={c.primary} />
                  </View>
                  <Text style={[newS.seccionTitulo, { color: c.textPrimary }]}>Datos de acceso</Text>
                </View>

                <InputField
                  label={t('auth.registro.correo')}
                  placeholder="ejemplo@correo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.correo}
                  onChangeText={val => actualizarCampo('correo', val)}
                  onBlur={() => setCorreoTocado(true)}
                  error={errorCorreo}
                />
              </View>

              {/* Seguridad */}
              <View style={newS.seccion}>
                <View style={newS.seccionHeader}>
                  <View style={[newS.seccionIcono, { backgroundColor: c.primaryBg }]}>
                    <Ionicons name="lock-closed-outline" size={14} color={c.primary} />
                  </View>
                  <Text style={[newS.seccionTitulo, { color: c.textPrimary }]}>Seguridad</Text>
                </View>

                <PasswordInput
                  label={t('auth.registro.contrasena')}
                  placeholder={t('auth.registro.contrasena')}
                  value={form.contrasena}
                  onChangeText={val => actualizarCampo('contrasena', val)}
                  error={getError('contrasena')}
                />
                <PasswordRequirements password={form.contrasena} />
                <PasswordInput
                  label={t('auth.registro.confirmarContrasena')}
                  placeholder={t('auth.registro.confirmarContrasena')}
                  value={form.confirmarContrasena}
                  onChangeText={val => actualizarCampo('confirmarContrasena', val)}
                  error={getError('confirmarContrasena')}
                />
              </View>

              {/* Términos */}
              <View style={[styles.filaTerminos, newS.filaTerminosBox, { backgroundColor: c.primaryBg }]}>
                <TouchableOpacity
                  onPress={() => actualizarCampo('aceptaTerminos', !form.aceptaTerminos)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, form.aceptaTerminos && styles.checkboxActivo]}>
                    {form.aceptaTerminos ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
                  </View>
                </TouchableOpacity>
                <Text style={[styles.textoTerminos, { color: c.textSecondary }]}>
                  {t('auth.registro.terminosAcepto')}{' '}
                  <Text style={styles.enlaceTerminos} onPress={() => setModalTerminos(true)}>
                    {t('auth.registro.terminosLink')}
                  </Text>
                  {' '}{t('auth.registro.terminosDel')}
                </Text>
              </View>
              {getError('aceptaTerminos') ? (
                <Text style={styles.errorTerminos}>{getError('aceptaTerminos')}</Text>
              ) : null}

              {/* Botón */}
              <View style={styles.pieFormulario}>
                <PrimaryButton
                  titulo={t('auth.registro.btnCrear')}
                  onPress={handleRegistrar}
                  cargando={cargando}
                />
                <SocialAuthButtons
                  onGoogle={() => console.log('Google registro')}
                  onFacebook={() => console.log('Facebook registro')}
                />
              </View>

              <View style={newS.loginRow}>
                <Text style={[newS.loginTexto, { color: c.textSecondary }]}>¿Ya tienes cuenta? </Text>
                <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                  <Text style={[newS.loginLink, { color: c.primary }]}>Inicia sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* ── Modal: Términos y condiciones ──────────────────────── */}
      <Modal visible={modalTerminos} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContenedor, { backgroundColor: c.bgCard }]}>
            <View style={[styles.modalHandle, { backgroundColor: c.border }]} />
            <View style={styles.modalEncabezado}>
              <Text style={[styles.modalTitulo, { color: c.textPrimary }]}>{t('auth.registro.modalTitulo')}</Text>
              <TouchableOpacity
                style={styles.modalBotonCerrar}
                onPress={() => setModalTerminos(false)}
              >
                <Ionicons name="close" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSeccionTitulo}>{t('auth.registro.tc1Titulo')}</Text>
              <Text style={styles.modalTexto}>{t('auth.registro.tc1Texto')}</Text>
              <Text style={styles.modalSeccionTitulo}>{t('auth.registro.tc2Titulo')}</Text>
              <Text style={styles.modalTexto}>{t('auth.registro.tc2Texto')}</Text>
              <Text style={styles.modalSeccionTitulo}>{t('auth.registro.tc3Titulo')}</Text>
              <Text style={styles.modalTexto}>{t('auth.registro.tc3Texto')}</Text>
              <Text style={styles.modalSeccionTitulo}>{t('auth.registro.tc4Titulo')}</Text>
              <Text style={styles.modalTexto}>{t('auth.registro.tc4Texto')}</Text>
              <Text style={styles.modalSeccionTitulo}>{t('auth.registro.tc5Titulo')}</Text>
              <Text style={styles.modalTexto}>{t('auth.registro.tc5Texto')}</Text>
              <Text style={styles.modalSeccionTitulo}>{t('auth.registro.tc6Titulo')}</Text>
              <Text style={styles.modalTexto}>{t('auth.registro.tc6Texto')}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalBotonAceptarWrap}
              onPress={() => setModalTerminos(false)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={GRADIENTES.boton.colors}
                start={GRADIENTES.boton.start}
                end={GRADIENTES.boton.end}
                style={styles.modalBotonAceptar}
              >
                <Text style={styles.modalBotonAceptarTexto}>{t('auth.registro.modalAceptar')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const newS = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
  },
  sheet: {
    flex: 1,
  },
  sheetScroll: {
    paddingHorizontal: 16,
    paddingTop: 24, // adjusted
    paddingBottom: 32,
  },
  cardWrapper: {
    position: 'relative',
  },
  logoBadge: {
    position: 'absolute',
    top: -34,
    right: 24,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoBadgeImg: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 32, // adjusted
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  seccion: {
    marginBottom: 18,
  },
  seccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  seccionIcono: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seccionTitulo: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  filaTerminosBox: {
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginTexto: {
    fontSize: 13.5,
  },
  loginLink: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
