import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { COLOR_MARCA } from "../constants/reservation.constants";
import { useBrandStore } from "@/store/brandStore";
import { apiClient } from "@/services/http/apiClient";
import { captchaTokenStore } from "../services/captchaTokenStore";

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface Props {
  isVerified: boolean;
  onVerified: (verified: boolean, token?: string | null) => void;
  hasError?: boolean;
  style?: ViewStyle;
}

interface CaptchaConfig {
  enabled: boolean;
  siteKey: string;
}

/** Origen del backend: es el "sitio" con el que Cloudflare valida el widget dentro del WebView. */
function backendOrigin(): string {
  const base = String(apiClient.defaults.baseURL || "");
  try {
    return new URL(base).origin;
  } catch {
    return "https://localhost";
  }
}

function turnstileHtml(siteKey: string, dark: boolean): string {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;height:100%;background:transparent;display:flex;align-items:center;justify-content:center}</style>
<script src="${TURNSTILE_SCRIPT}" async defer></script></head><body><div id="w"></div><script>
function post(m){window.ReactNativeWebView.postMessage(JSON.stringify(m))}
var timer=setInterval(function(){if(window.turnstile){clearInterval(timer);window.turnstile.render('#w',{
sitekey:${JSON.stringify(siteKey)},theme:${JSON.stringify(dark ? "dark" : "light")},
callback:function(t){post({type:'token',token:t})},
'expired-callback':function(){post({type:'expired'})},
'error-callback':function(){post({type:'error'})}})}},100);
</script></body></html>`;
}

/** Widget de Turnstile para la versión web de la app (DOM real). */
function WebTurnstile({ siteKey, dark, onToken, onFail }: { siteKey: string; dark: boolean; onToken: (t: string) => void; onFail: () => void }) {
  const hostRef = useRef<any>(null);
  const onTokenRef = useRef(onToken);
  const onFailRef = useRef(onFail);
  onTokenRef.current = onToken;
  onFailRef.current = onFail;

  useEffect(() => {
    let widgetId: string | null = null;
    let cancelled = false;
    const w = window as any;

    const render = () => {
      if (cancelled || !hostRef.current || !w.turnstile) return;
      widgetId = w.turnstile.render(hostRef.current, {
        sitekey: siteKey,
        theme: dark ? "dark" : "light",
        callback: (token: string) => onTokenRef.current(token),
        "expired-callback": () => onFailRef.current(),
        "error-callback": () => onFailRef.current(),
      });
    };

    if (w.turnstile) {
      render();
    } else {
      let script = document.querySelector(`script[src="${TURNSTILE_SCRIPT}"]`) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.src = TURNSTILE_SCRIPT;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
      script.addEventListener("error", () => onFailRef.current());
    }

    return () => {
      cancelled = true;
      if (widgetId && w.turnstile) {
        try {
          w.turnstile.remove(widgetId);
        } catch {
          /* el widget ya no existe */
        }
      }
    };
  }, [siteKey, dark]);

  return React.createElement("div", { ref: hostRef, style: { minHeight: 65 } });
}

export default function SecurityCaptcha({ isVerified, onVerified, hasError = false, style }: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const marca = useBrandStore((s) => s.marca);
  const primaryAccent = marca?.primary || (c.oscuro ? "#3B82F6" : COLOR_MARCA);

  const [status, setStatus] = useState<"loading" | "ready" | "failed" | "off">("loading");
  const [config, setConfig] = useState<CaptchaConfig | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const onVerifiedRef = useRef(onVerified);
  onVerifiedRef.current = onVerified;

  const notify = (verified: boolean, token?: string | null) => {
    captchaTokenStore.set(verified ? token : null);
    onVerifiedRef.current(verified, token);
  };

  useEffect(() => {
    let activo = true;
    apiClient
      .get<CaptchaConfig>("/captcha/config")
      .then(({ data }) => {
        if (!activo) return;
        if (!data?.enabled) {
          setStatus("off");
          notify(true, null);
          return;
        }
        setConfig(data);
        setStatus("ready");
      })
      .catch(() => activo && setStatus("failed"));

    // Cuando el servidor consume el token (reserva creada o con error) el widget se reinicia
    const unsubscribe = captchaTokenStore.subscribe(() => {
      setResetKey((k) => k + 1);
      onVerifiedRef.current(false);
    });
    return () => {
      activo = false;
      unsubscribe();
      captchaTokenStore.set(null);
    };
  }, []);

  const html = useMemo(() => (config ? turnstileHtml(config.siteKey, c.oscuro) : ""), [config, c.oscuro]);

  if (status === "off") return null;

  const borderColor = hasError && !isVerified ? "#EF4444" : isVerified ? "#10B981" : c.border || "#E2E8F0";

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.card, { backgroundColor: c.oscuro ? c.bgCard : "#FFFFFF", borderColor }]}>
        <View style={styles.headerRow}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: isVerified ? "#10B981" : "rgba(2, 132, 199, 0.1)" },
            ]}
          >
            {status === "loading" ? (
              <ActivityIndicator size="small" color={primaryAccent} />
            ) : (
              <Ionicons
                name={isVerified ? "checkmark" : "shield-outline"}
                size={18}
                color={isVerified ? "#FFFFFF" : primaryAccent}
              />
            )}
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[styles.title, { color: isVerified ? (c.oscuro ? "#34D399" : "#059669") : c.textPrimary }]}
              numberOfLines={1}
            >
              {isVerified
                ? t("captcha.successLabel", { defaultValue: "Humano verificado con éxito" })
                : t("captcha.verifyHuman", { defaultValue: "Confirmar que soy una persona" })}
            </Text>
            <Text style={[styles.subtitle, { color: c.textMuted }]} numberOfLines={2}>
              {isVerified
                ? t("captcha.verifiedDesc", { defaultValue: "Verificación completada. Ya puedes confirmar tu reserva." })
                : status === "failed"
                  ? t("captcha.loadError", { defaultValue: "No se pudo cargar la verificación. Revisa tu conexión e inténtalo de nuevo." })
                  : t("captcha.completeVerification", { defaultValue: "Completa la verificación de seguridad" })}
            </Text>
          </View>
        </View>

        {status === "ready" && config && !isVerified && (
          <View style={styles.widgetBox}>
            {Platform.OS === "web" ? (
              <WebTurnstile
                key={resetKey}
                siteKey={config.siteKey}
                dark={c.oscuro}
                onToken={(token) => notify(true, token)}
                onFail={() => notify(false)}
              />
            ) : (
              <WebView
                key={resetKey}
                originWhitelist={["*"]}
                source={{ html, baseUrl: backendOrigin() }}
                style={styles.webview}
                javaScriptEnabled
                scrollEnabled={false}
                onMessage={(event) => {
                  try {
                    const msg = JSON.parse(event.nativeEvent.data);
                    if (msg.type === "token" && msg.token) notify(true, msg.token);
                    else notify(false);
                  } catch {
                    notify(false);
                  }
                }}
              />
            )}
          </View>
        )}
      </View>

      {hasError && !isVerified && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text style={styles.errorText}>
            {t("captcha.mustVerify", {
              defaultValue: "Debes completar la verificación de seguridad antes de confirmar la reserva.",
            })}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 8,
    marginBottom: 20,
  },
  card: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  widgetBox: {
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 70,
  },
  webview: {
    width: 300,
    height: 70,
    backgroundColor: "transparent",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    paddingLeft: 4,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },
});
