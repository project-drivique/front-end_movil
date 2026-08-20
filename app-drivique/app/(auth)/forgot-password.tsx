import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useOlvideContrasena } from "@/modules/auth/hooks/useAuth";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
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
  const c = useTemaColores();
  const { form, errores, cargando, enviado, actualizarCorreo, enviarEnlace } =
    useOlvideContrasena();

  const [contador, setContador] = useState(0);
  const [puedeReenviar, setPuedeReenviar] = useState(false);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Inicia el contador cada vez que se envía el enlace
  useEffect(() => {
    if (enviado) {
      iniciarContador();
    }
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [enviado]);

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
    enviarEnlace();
    iniciarContador();
  }

  // ── Pantalla de éxito ────────────────────────────────────────
  if (enviado) {
    return (
      <View style={[styles.contenedorExito, { backgroundColor: c.bg }]}>
        <Text style={styles.iconoExito}>✉️</Text>
        <Text style={[styles.tituloExito, { color: c.textPrimary }]}>{t("auth.olvide.exitoTitulo")}</Text>
        <Text style={[styles.mensajeExito, { color: c.textSecondary }]}>{t("auth.olvide.exitoMsg")}</Text>
        <PrimaryButton
          titulo={t("auth.olvide.volverLogin")}
          onPress={() => router.replace("/(auth)/login")}
        />

        {/* ── Reenvío con contador ─────────────────────────── */}
        <View style={styles.contenedorReenvio}>
          <Text style={styles.textoReenvio}>{t("auth.olvide.noRecibiste")}</Text>
          {puedeReenviar ? (
            <TouchableOpacity
              style={styles.botonReenvio}
              onPress={handleReenviar}
            >
              <Text style={styles.textoBotonReenvio}>{t("auth.olvide.reenviar")}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.textoContador}>
              {t("auth.olvide.reenviarEn", { seg: contador })}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/register")}
          style={styles.enlaceRegistro}
        >
          <Text style={styles.textoEnlaceRegistro}>
            {t("auth.olvide.noTienes")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Pantalla principal ───────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: c.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contenedor}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace("/(auth)/login")}
          style={styles.botonVolver}
        >
          <Text style={styles.textoVolver}>{t("auth.olvide.volver")}</Text>
        </TouchableOpacity>

        {/* ── Encabezado con logo ────────────────────────────── */}
        <View style={styles.encabezado}>
          <View style={[styles.logoWrapper, { backgroundColor: c.primaryBg }]}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
            />
          </View>
          <Text style={[styles.titulo, { color: c.textPrimary }]}>{t("auth.olvide.titulo")}</Text>
          <Text style={[styles.subtitulo, { color: c.textSecondary }]}>{t("auth.olvide.subtitulo")}</Text>
        </View>

        <InputField
          label={t("auth.olvide.correo")}
          placeholder="ejemplo@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.correo}
          onChangeText={actualizarCorreo}
          error={errores.find((e) => e.campo === "correo")?.mensaje}
        />

        <PrimaryButton
          titulo={t("auth.olvide.btnEnviar")}
          onPress={enviarEnlace}
          cargando={cargando}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
