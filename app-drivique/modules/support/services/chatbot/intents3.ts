
import type { IntentContext, IntentResult } from './types';

// 17. SALUDOS
export function intent17({ q, lang, opts }: IntentContext): IntentResult | null {
  if (
      q.includes("hola") ||
      q.includes("hello") ||
      q.includes("bonjour") ||
      q.includes("ola") ||
      q.includes("olá") ||
      q.includes("buenas") ||
      q.includes("inicio")
    ) {
      if (lang === "en") {
        return {
          sender: "bot",
          text: "Hello! 👋 Welcome to **Drivique** interactive support. How can I help you today?",
          options: opts,
        };
      } else if (lang === "fr") {
        return {
          sender: "bot",
          text: "Bonjour ! 👋 Bienvenue sur le support interactif de **Drivique**. Comment puis-je vous aider aujourd'hui ?",
          options: opts,
        };
      } else if (lang === "pt" || lang === "br") {
        return {
          sender: "bot",
          text: "Olá! 👋 Bem-vindo ao suporte interativo do **Drivique**. Como posso ajudar você hoje?",
          options: opts,
        };
      }
      return {
        sender: "bot",
        text: "¡Hola! 👋 Bienvenido al soporte interactivo de **Drivique**. ¿En qué puedo ayudarte hoy?",
        options: opts,
      };
    }
  return null;
}
