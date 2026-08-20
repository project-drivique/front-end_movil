/**
 * RF28 — Cambio de idioma automático
 * RF28.1: Establecer idioma por defecto
 * RF28.2: Cambiar idioma (5)
 * RF28.3: Aplicar traducción automática
 * RF28.4: Guardar preferencia por usuario
 */
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import br from "./translations/br";
import en from "./translations/en";
import es from "./translations/es";
import fr from "./translations/fr";
import pt from "./translations/pt";

// Idiomas soportados
export const IDIOMAS = {
  es: { label: "Español",             flag: "🇨🇴" },
  en: { label: "English",             flag: "🇺🇸" },
  fr: { label: "Français",            flag: "🇫🇷" },
  pt: { label: "Português",           flag: "🇵🇹" },
  br: { label: "Português brasileiro", flag: "🇧🇷" },
};

export type IdiomaKey = keyof typeof IDIOMAS;

// Detectar idioma del dispositivo — RF28.1
const getIdiomaInicial = (idiomaGuardado?: string): IdiomaKey => {
  // Si hay idioma guardado, usarlo — RF28.4
  if (idiomaGuardado && idiomaGuardado in IDIOMAS) {
    return idiomaGuardado as IdiomaKey;
  }
  // Detectar idioma del dispositivo — RF28.1
  const deviceLang = Localization.getLocales()[0]?.languageCode ?? "es";
  if (deviceLang in IDIOMAS) return deviceLang as IdiomaKey;
  // Por defecto español — RF28.1
  return "es";
};

// Inicializar i18next — RF28.3
// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    fr: { translation: fr },
    pt: { translation: pt },
    br: { translation: br },
  },
  lng: getIdiomaInicial(),
  fallbackLng: "es",
  interpolation: { escapeValue: false },
  compatibilityJSON: "v4",
});

export default i18n;