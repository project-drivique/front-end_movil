import { Linking } from "react-native";
import { IdiomaKey } from "@/modules/i18n";
import { obtenerTasaActual } from "@/services/exchangeRateService";
import { INTENTS } from "./chatbot";

export interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  options?: { label: string; actionValue: string }[];
}

export function obtenerHoraActual(): string {
  const ahora = new Date();
  return ahora.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Opciones iniciales multilenguaje
export function obtenerOpcionesIniciales(lang: IdiomaKey = "es") {
  switch (lang) {
    case "en":
      return [
        { label: "🚗 How to rent a vehicle?", actionValue: "como_alquilar" },
        { label: "📋 Requirements & Documents", actionValue: "requisitos" },
        { label: "💱 Currency & Payment Methods", actionValue: "monedas_pagos" },
        { label: "🤝 List my car for rent", actionValue: "alquilar_mi_carro" },
        { label: "🛡️ Insurance & Coverage", actionValue: "seguros" },
        { label: "🚨 Emergency & Roadside Help", actionValue: "emergencia" },
        { label: "🌐 Change Language / Theme", actionValue: "idioma_tema" },
        { label: "💬 Contact Support (WhatsApp)", actionValue: "contacto_humano" },
      ];
    case "fr":
      return [
        { label: "🚗 Comment louer un véhicule ?", actionValue: "como_alquilar" },
        { label: "📋 Exigences et Documents", actionValue: "requisitos" },
        { label: "💱 Devises et Paiements", actionValue: "monedas_pagos" },
        { label: "🤝 Inscrire ma voiture", actionValue: "alquilar_mi_carro" },
        { label: "🛡️ Assurances & Couverture", actionValue: "seguros" },
        { label: "🚨 Urgence et Dépanneuse", actionValue: "emergencia" },
        { label: "🌐 Langue / Thème Sombre", actionValue: "idioma_tema" },
        { label: "💬 Contact Support (WhatsApp)", actionValue: "contacto_humano" },
      ];
    case "pt":
    case "br":
      return [
        { label: "🚗 Como alugar um veículo?", actionValue: "como_alquilar" },
        { label: "📋 Requisitos e Documentos", actionValue: "requisitos" },
        { label: "💱 Moedas e Pagamentos", actionValue: "monedas_pagos" },
        { label: "🤝 Cadastrar meu carro", actionValue: "alquilar_mi_carro" },
        { label: "🛡️ Seguros e Cobertura", actionValue: "seguros" },
        { label: "🚨 Emergência e Guinchos", actionValue: "emergencia" },
        { label: "🌐 Idioma / Modo Escuro", actionValue: "idioma_tema" },
        { label: "💬 Falar com Suporte (WhatsApp)", actionValue: "contacto_humano" },
      ];
    case "es":
    default:
      return [
        { label: "🚗 ¿Cómo alquilar un vehículo?", actionValue: "como_alquilar" },
        { label: "📋 Requisitos y documentos", actionValue: "requisitos" },
        { label: "💱 Monedas y Métodos de pago", actionValue: "monedas_pagos" },
        { label: "🤝 Poner mi vehículo en alquiler", actionValue: "alquilar_mi_carro" },
        { label: "🛡️ Seguros y Coberturas", actionValue: "seguros" },
        { label: "📍 Entregas a domicilio / Aeropuerto", actionValue: "entregas" },
        { label: "🚨 Reportar daño o emergencia", actionValue: "emergencia" },
        { label: "🌐 Idioma y Modo Oscuro", actionValue: "idioma_tema" },
        { label: "💬 Hablar con un asesor (WhatsApp)", actionValue: "contacto_humano" },
      ];
  }
}

// Mensaje de bienvenida según el idioma
export function obtenerMensajeBienvenida(lang: IdiomaKey = "es"): ChatMessage {
  const options = obtenerOpcionesIniciales(lang);
  let text = "¡Hola! 👋 Soy **Drivibot**, tu asistente virtual de **Drivique**.\n\n¿En qué puedo ayudarte hoy sobre nuestros alquileres de vehículos?";
  
  if (lang === "en") {
    text = "Hello! 👋 I'm **Drivibot**, your **Drivique** virtual assistant.\n\nHow can I help you today regarding vehicle rentals, currencies, or policies?";
  } else if (lang === "fr") {
    text = "Bonjour ! 👋 Je suis **Drivibot**, votre assistant virtuel **Drivique**.\n\nComment puis-je vous aider aujourd'hui concernant les locations de véhicules ?";
  } else if (lang === "pt" || lang === "br") {
    text = "Olá! 👋 Sou o **Drivibot**, seu assistente virtual do **Drivique**.\n\nComo posso ajudar você hoje com relação ao aluguel de veículos?";
  }

  return {
    id: `welcome-${Date.now()}`,
    sender: "bot",
    text,
    timestamp: obtenerHoraActual(),
    options,
  };
}

// MOTOR DE RESPUESTAS INTELIGENTE Y ABIERTO
export function procesarMensajeChatbot(
  textoUsuario: string,
  langParam: any = "es"
): Omit<ChatMessage, "id" | "timestamp"> {
  // Normalizar el idioma de manera ultra robusta para evitar fallos por locale tags (ej. en-US, pt-BR)
  let langStr = String(langParam || "es").toLowerCase().trim();
  if (langStr.includes("en")) langStr = "en";
  else if (langStr.includes("fr")) langStr = "fr";
  else if (langStr.includes("br")) langStr = "br";
  else if (langStr.includes("pt")) langStr = "pt";
  else if (langStr.includes("es")) langStr = "es";
  else langStr = "es";

  const lang = langStr as IdiomaKey;
  console.log("[DRIVIBOT DEBUG] procesarMensajeChatbot called with:", { textoUsuario, langParam, resolvedLang: lang });
  const q = textoUsuario.toLowerCase().trim();
  const opts = obtenerOpcionesIniciales(lang);

  const ctx = { q, lang, opts };
  for (const intent of INTENTS) {
    const respuesta = intent(ctx);
    if (respuesta) return respuesta;
  }

  // RESPUESTA INTELIGENTE POR DEFECTO PARA PREGUNTAS ABIERTAS NO RECONOCIDAS
  if (lang === "en") {
    return {
      sender: "bot",
      text: "I understand your query is related to: *" + textoUsuario + "*.\n\nAt **Drivique** we offer vehicle rentals with home/branch delivery, digital contracts, multiple currencies (COP/USD/EUR), and complete insurance coverage. Which of these topics would you like more details about?",
      options: opts,
    };
  } else if (lang === "fr") {
    return {
      sender: "bot",
      text: "Je comprends que votre demande concerne : *" + textoUsuario + "*.\n\nChez **Drivique**, nous proposons des locations de véhicules avec livraison à domicile/succursale, des contrats numériques, plusieurs devises (COP/USD/EUR) et une couverture complète. Sur quel sujet aimeriez-vous plus de détails ?",
      options: opts,
    };
  } else if (lang === "pt" || lang === "br") {
    return {
      sender: "bot",
      text: "Entendo que sua consulta está relacionada a: *" + textoUsuario + "*.\n\nNo **Drivique** oferecemos aluguel de veículos com entrega em domicílio/agência, contratos digitais, múltiplas moedas (COP/USD/EUR) e cobertura completa. Sobre qual destes temas você gostaria de mais detalhes?",
      options: opts,
    };
  }
  return {
    sender: "bot",
    text: "Entiendo que tu consulta está relacionada con: *" + textoUsuario + "*.\n\nEn **Drivique** ofrecemos alquiler de vehículos con entrega a domicilio/sucursal, contratos digitales, múltiples monedas (COP/USD/EUR) y cobertura completa. ¿Sobre cuál de estos temas deseas más detalles?",
    options: opts,
  };
}
