import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "@/utils/webReferrer";
import * as WebBrowser from "expo-web-browser";
import { I18nextProvider } from "react-i18next";
import i18n from "@/modules/i18n";
import { useIdioma } from "@/modules/i18n/hooks/useLanguage";
import { FloatingSupportChat } from "@/components/ui/FloatingSupportChat";
import { AlertHost } from "@/components/ui/AlertHost";
import { Fragment, useEffect } from "react";
import { AppState } from "react-native";
import { apiClient } from "@/services/http/apiClient";
import { mapPerfil } from "@/modules/profile/services/profileService";
import { useUsuarioStore } from "@/store/userStore";
import { useBrandStore } from "@/store/brandStore";
import { useReferenceStore } from "@/store/referenceStore";
import { useAuthStore } from "@/store/authStore";

WebBrowser.maybeCompleteAuthSession();

if (typeof window !== "undefined" && window.addEventListener) {
  window.addEventListener("unhandledrejection", (event) => {
    const msg = event?.reason?.message || String(event?.reason || "");
    if (msg.includes("12000ms") || msg.includes("timeout exceeded")) {
      event.preventDefault();
    }
  });
}

export default function RootLayout() {
  const { temaActual } = useIdioma();
  const token = useAuthStore((s) => s.token);
  // Al cambiar la paleta se vuelve a montar la interfaz para que todos los colores se apliquen
  const versionMarca = useBrandStore((s) => s.version);

  // Marca (colores y logo) sincronizada con la web: al abrir, al volver a la app y cada minuto
  useEffect(() => {
    useBrandStore.getState().hidratar().catch(() => {});
    const sub = AppState.addEventListener("change", (estado) => {
      if (estado === "active") useBrandStore.getState().cargar().catch(() => {});
    });
    const timer = setInterval(() => useBrandStore.getState().cargar().catch(() => {}), 60000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    useReferenceStore.getState().cargarPublicas().catch(() => {});
  }, []);

  useEffect(() => {
    if (token) useReferenceStore.getState().cargarNacionalidades().catch(() => {});
  }, [token]);

  // Datos personales sincronizados con la web: lo que se cambie allá se ve aquí al volver a la app y cada minuto
  useEffect(() => {
    if (!token) return undefined;
    const sincronizar = async () => {
      try {
        const { data } = await apiClient.get("/users/me");
        const { id: _id, ...mapped } = mapPerfil(data);
        useUsuarioStore.getState().actualizarUsuario(mapped);
        useAuthStore.getState().actualizarUsuario({ nombres: mapped.nombres, apellidos: mapped.apellidos });
      } catch {
        /* sin conexión: se conserva lo que ya hay */
      }
    };
    const sub = AppState.addEventListener("change", (estado) => {
      if (estado === "active") sincronizar();
    });
    const timer = setInterval(sincronizar, 60000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, [token]);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={temaActual === "oscuro" ? DarkTheme : DefaultTheme}>
        <Fragment key={versionMarca}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="vehicle/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="payment-response" options={{ headerShown: false }} />
            <Stack.Screen name="contract-view" options={{ headerShown: false, presentation: "transparentModal", animation: "fade" }} />
            <Stack.Screen name="wompi-checkout" options={{ headerShown: false }} />
          </Stack>

          <StatusBar style={temaActual === "oscuro" ? "light" : "dark"} /> 
          <FloatingSupportChat />
          <AlertHost />
        </Fragment>
      </ThemeProvider>
    </I18nextProvider>
  );
}
