import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { OtpInput } from "@/components/ui/OtpInput";
import { AlertModal } from "@/components/ui/AlertModal";
import { useOlvideContrasena } from "@/modules/auth/hooks/useAuth";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { olvideStyles as styles } from "@/modules/auth/styles/forgot-password.styles";

const SEGUNDOS_ESPERA = 30;

export default function OlvideContrasenaScreen() {
  const { t } = useTranslation();
  const { form, errores, cargando, fase, setFase, actualizarCampo, enviarEnlace, validarCodigo, cambiarContrasena } =
    useOlvideContrasena();

  const [contador, setContador] = useState(0);
  const [puedeReenviar, setPuedeReenviar] = useState(false);
  const [alertaVisible, setAlertaVisible] = useState(false);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (errores.some(e => e.mensaje === 'correo_no_registrado')) {
      setAlertaVisible(true);
    }
  }, [errores]);

  useEffect(() => {
    if (fase === 2) {
      iniciarContador();
    }
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [fase]);

  function iniciarContador() {
    setPuedeReenviar(false);
    setContador(SEGUNDOS_ESPERA);
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    intervaloRef.current = setInterval(() => {
      setContador((prev) => {
        if (prev <= 1) {
          clearInterval(intervaloRef.current!);
          setPuedeReenviar(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleReenviar() {
    // Simulamos el reenvío
    iniciarContador();
  }

  // ── Pantalla de éxito (Fase 4) ───────────────────────────────
  if (fase === 4) {
    return (
      <View style={styles.contenedorExito}>
        <Text style={styles.iconoExito}>🎉</Text>
        <Text style={styles.tituloExito}>{t("auth.olvide.exitoTitulo")}</Text>
        <Text style={styles.mensajeExito}>{t("auth.olvide.exitoMsg")}</Text>
        <PrimaryButton
          titulo={t("auth.olvide.volverLogin")}
          onPress={() => router.replace("/(auth)/login")}
          redondeado
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contenedor}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => {
            if (fase > 1) {
              setFase((prev) => (prev - 1) as 1 | 2 | 3 | 4);
            } else {
              router.canGoBack() ? router.back() : router.replace("/(auth)/login");
            }
          }}
          style={styles.botonVolver}
        >
          <Feather name="arrow-left" size={18} color="#374151" />
          <Text style={styles.textoVolver}>{t("auth.olvide.volver")}</Text>
        </TouchableOpacity>

        <View style={styles.tarjeta}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
            />
          </View>
          
          {fase === 1 && (
            <Text style={styles.titulo}>{t("auth.olvide.titulo")}</Text>
          )}
          {fase === 2 && (
            <Text style={styles.titulo}>{t("auth.olvide.codigoTitulo")}</Text>
          )}
          {fase === 3 && (
            <Text style={styles.titulo}>{t("auth.olvide.nuevaContraTitulo")}</Text>
          )}

          {fase === 1 && (
            <Text style={styles.subtitulo}>{t("auth.olvide.subtitulo")}</Text>
          )}
          {fase === 2 && (
            <Text style={styles.subtitulo}>{t("auth.olvide.codigoSubtitulo")} <Text style={{fontWeight: '700', color: '#111827'}}>{form.correo}</Text></Text>
          )}
          {fase === 3 && (
            <Text style={styles.subtitulo}>{t("auth.olvide.nuevaContraSubtitulo")}</Text>
          )}

          <View style={styles.formulario}>
            {fase === 1 && (
              <>
                <InputField
                  label={t("auth.olvide.correo")}
                  placeholder="ejemplo@correo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.correo}
                  onChangeText={(val) => actualizarCampo('correo', val)}
                  error={errores.find((e) => e.campo === "correo")?.mensaje}
                  pill
                />
                <PrimaryButton
                  titulo={t("auth.olvide.btnEnviar")}
                  onPress={enviarEnlace}
                  cargando={cargando}
                  redondeado
                />
              </>
            )}

            {fase === 2 && (
              <>
                <OtpInput
                  value={form.codigo || ""}
                  onChange={(val) => actualizarCampo('codigo', val)}
                  error={!!errores.find((e) => e.campo === "codigo")}
                  colores={{
                    border: "#D1D5DB",
                    bgInput: "#F9FAFB",
                    textPrimary: "#111827",
                    primary: "#1D4ED8"
                  }}
                />
                {errores.find((e) => e.campo === "codigo") && (
                  <Text style={[styles.textoContador, { color: '#EF4444' }]}>
                    {errores.find((e) => e.campo === "codigo")?.mensaje}
                  </Text>
                )}
                
                <PrimaryButton
                  titulo={t("auth.olvide.btnContinuar")}
                  onPress={validarCodigo}
                  cargando={cargando}
                  redondeado
                  estiloExtra={{ marginTop: 24 }}
                />

                <View style={styles.contenedorReenvio}>
                  <Text style={styles.textoReenvio}>{t("auth.olvide.noRecibiste")}</Text>
                  {puedeReenviar ? (
                    <TouchableOpacity style={styles.botonReenvio} onPress={handleReenviar}>
                      <Text style={styles.textoBotonReenvio}>{t("auth.olvide.reenviar")}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.textoContador}>
                      {t("auth.olvide.reenviarEn", { seg: contador })}
                    </Text>
                  )}
                </View>
              </>
            )}

            {fase === 3 && (
              <>
                <PasswordInput
                  label={t("auth.olvide.nuevaContra")}
                  placeholder="********"
                  value={form.nuevaContrasena || ''}
                  onChangeText={(val) => actualizarCampo('nuevaContrasena', val)}
                  error={errores.find((e) => e.campo === "nuevaContrasena")?.mensaje}
                />
                <PasswordInput
                  label={t("auth.olvide.confirmarContra")}
                  placeholder="********"
                  value={form.confirmarContrasena || ''}
                  onChangeText={(val) => actualizarCampo('confirmarContrasena', val)}
                  error={errores.find((e) => e.campo === "confirmarContrasena")?.mensaje}
                />
                <PrimaryButton
                  titulo={t("auth.olvide.btnRestablecer")}
                  onPress={cambiarContrasena}
                  cargando={cargando}
                  redondeado
                  estiloExtra={{ marginTop: 12 }}
                />
              </>
            )}
          </View>
        </View>

        {fase === 1 && (
          <View style={styles.contenedorRegistro}>
            <Text style={styles.textoRegistroGris}>{t("auth.olvide.noTienes")}</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.textoRegistroAzul}>{t("auth.olvide.registrateAqui")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── ALERTA DE CORREO NO REGISTRADO ── */}
      <AlertModal
        visible={alertaVisible}
        icono="alert-circle-outline"
        titulo={t("auth.olvide.correoNoRegistradoTitulo")}
        mensaje={t("auth.olvide.correoNoRegistradoMsg")}
        botones={[
          {
            texto: t("catalogo.alertas.entendido") || 'Aceptar',
            variante: "primario",
            onPress: () => {
              setAlertaVisible(false);
              // Podríamos limpiar el error del hook aquí si es necesario
            },
          },
        ]}
        onCerrar={() => setAlertaVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
