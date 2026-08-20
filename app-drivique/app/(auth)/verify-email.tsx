// app/(auth)/verify-email.tsx
//
// HU: verificación de correo tras el registro. Dos pasos en una sola
// pantalla (mismo patrón que forgot-password.tsx): "Autenticación por
// correo" (pedir el envío) y "Verifica tu correo" (6 casillas + temporizador).

import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useVerificarCorreo } from "@/modules/auth/hooks/useAuth";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { OtpInput } from "@/components/ui/OtpInput";
import { GRADIENTES } from "@/constants/gradients";
import { useAuthStore } from "@/store/authStore";
import { useUsuarioStore } from "@/store/userStore";
import { useAuditoria } from "@/store/auditStore";
import { verificarCorreoStyles as styles } from "@/modules/auth/styles/verify-email.styles";

const DURACION_CODIGO_SEGUNDOS = 5 * 60;
const ESPERA_REENVIO_SEGUNDOS = 60;

function formatoTiempo(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function VerificarCorreoScreen() {
  const { t } = useTranslation();
  const c = useTemaColores();
  const { correo: correoParam } = useLocalSearchParams<{ correo?: string }>();
  const correo = correoParam ?? "";

  const {
    cargando,
    codigoEnviado,
    verificando,
    codigoIncorrecto,
    setCodigoIncorrecto,
    enviarCodigo,
    verificarCodigo,
  } = useVerificarCorreo(correo);
  const setUsuario = useAuthStore((s) => s.setUsuario);
  const actualizarUsuarioGlobal = useUsuarioStore((s) => s.actualizarUsuario);
  const { registrarEvento } = useAuditoria();

  const [codigo, setCodigo] = useState("");
  const [segundosCodigo, setSegundosCodigo] = useState(DURACION_CODIGO_SEGUNDOS);
  const [segundosReenvio, setSegundosReenvio] = useState(ESPERA_REENVIO_SEGUNDOS);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const expirado = codigoEnviado && segundosCodigo <= 0;
  const puedeReenviar = segundosReenvio <= 0;

  // Sin correo (ej. se entró directo a esta ruta) no hay nada que verificar.
  useEffect(() => {
    if (!correo) router.replace("/(auth)/register");
  }, [correo]);

  useEffect(() => {
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, []);

  function iniciarTemporizadores() {
    setSegundosCodigo(DURACION_CODIGO_SEGUNDOS);
    setSegundosReenvio(ESPERA_REENVIO_SEGUNDOS);
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    intervaloRef.current = setInterval(() => {
      setSegundosCodigo((prev) => (prev > 0 ? prev - 1 : 0));
      setSegundosReenvio((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  }

  async function enviarOReenviarCodigo(tipoAuditoria: "codigo_enviado" | "codigo_reenviado") {
    const codigoGenerado = await enviarCodigo();
    iniciarTemporizadores();
    setCodigo("");
    registrarEvento("verificacion_correo", tipoAuditoria);
    // Demo: no hay servicio de correo real — se muestra el código acá
    // mismo para poder probar el flujo completo.
    Alert.alert(
      t("auth.verificarCorreo.codigoEnviadoTitulo"),
      `${t("auth.verificarCorreo.codigoEnviadoMsg")} ${codigoGenerado}`,
    );
  }

  async function handleVerificar() {
    if (codigo.length !== 6 || expirado) return;
    const ok = await verificarCodigo(codigo);
    if (ok) {
      registrarEvento("verificacion_correo", "codigo_correcto");
      const id = `u-${Date.now()}`;
      setUsuario({ id, correo, rol: "cliente" }, "token-demo");
      actualizarUsuarioGlobal({ id, correo });
      router.replace("/(tabs)/catalog");
    } else {
      registrarEvento("verificacion_correo", "codigo_incorrecto");
      setCodigo("");
    }
  }

  function handleCambiarCodigo(valor: string) {
    setCodigo(valor);
    if (codigoIncorrecto) setCodigoIncorrecto(false);
  }

  const otpColores = {
    border: c.border,
    bgInput: c.bgInput,
    textPrimary: c.textPrimary,
    primary: c.primary,
  };

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
        <View style={styles.logoWrap}>
          <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
        </View>

        <View style={styles.cardWrap}>
          <LinearGradient
            colors={GRADIENTES.boton.colors}
            start={GRADIENTES.boton.start}
            end={GRADIENTES.boton.end}
            style={styles.barraSuperior}
          />
          <View style={[styles.card, { backgroundColor: c.bgCard }]}>
            <View style={[styles.iconoWrap, { backgroundColor: c.primaryBg }]}>
              <Ionicons
                name={codigoEnviado ? "mail-open-outline" : "mail-outline"}
                size={34}
                color={c.primary}
              />
            </View>

            <Text style={[styles.titulo, { color: c.textPrimary }]}>
              {t(codigoEnviado ? "auth.verificarCorreo.tituloVerificar" : "auth.verificarCorreo.tituloSolicitar")}
            </Text>
            <Text style={[styles.subtitulo, { color: c.textSecondary }]}>
              {t(codigoEnviado ? "auth.verificarCorreo.subtituloVerificar" : "auth.verificarCorreo.subtituloSolicitar")}
            </Text>
            <Text style={[styles.correo, { color: c.textPrimary }]}>{correo}</Text>

            {codigoEnviado ? (
              <>
                <View style={styles.otpWrap}>
                  <OtpInput
                    value={codigo}
                    onChange={handleCambiarCodigo}
                    error={codigoIncorrecto}
                    editable={!expirado}
                    colores={otpColores}
                  />
                  {codigoIncorrecto && (
                    <Text style={styles.errorTexto}>{t("auth.verificarCorreo.codigoIncorrecto")}</Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.temporizador,
                    { color: c.textSecondary },
                    expirado && styles.temporizadorExpirado,
                  ]}
                >
                  {expirado
                    ? t("auth.verificarCorreo.expirado")
                    : t("auth.verificarCorreo.expiraEn", { tiempo: formatoTiempo(segundosCodigo) })}
                </Text>

                <View style={styles.botonWrap}>
                  <PrimaryButton
                    titulo={t("auth.verificarCorreo.btnVerificar")}
                    onPress={handleVerificar}
                    cargando={verificando}
                    deshabilitado={codigo.length !== 6 || expirado}
                  />
                </View>

                <View style={[styles.divisor, { backgroundColor: c.border }]} />

                <View style={styles.filaInferior}>
                  <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
                    <Text style={[styles.filaInferiorTexto, { color: c.textSecondary }]}>
                      {t("auth.verificarCorreo.volverRegistro")}
                    </Text>
                  </TouchableOpacity>
                  {puedeReenviar ? (
                    <TouchableOpacity onPress={() => enviarOReenviarCodigo("codigo_reenviado")}>
                      <Text style={[styles.filaInferiorTexto, { color: c.primary }]}>
                        {t("auth.verificarCorreo.reenviar")}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={[styles.filaInferiorTexto, { color: c.textMuted }]}>
                      {t("auth.verificarCorreo.reenviarEn", { seg: segundosReenvio })}
                    </Text>
                  )}
                </View>
              </>
            ) : (
              <>
                <View style={styles.botonWrap}>
                  <PrimaryButton
                    titulo={t("auth.verificarCorreo.btnEnviar")}
                    onPress={() => enviarOReenviarCodigo("codigo_enviado")}
                    cargando={cargando}
                  />
                </View>
                <TouchableOpacity
                  style={styles.volverRegistro}
                  onPress={() => router.replace("/(auth)/register")}
                >
                  <Text style={[styles.volverRegistroTexto, { color: c.textSecondary }]}>
                    {t("auth.verificarCorreo.volverRegistro")}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}