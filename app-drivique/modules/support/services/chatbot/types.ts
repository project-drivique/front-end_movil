import type { IdiomaKey } from "@/modules/i18n";
import type { ChatMessage, obtenerOpcionesIniciales } from "../chatbotEngine";

export type IntentResult = Omit<ChatMessage, "id" | "timestamp">;

export interface IntentContext {
  q: string;
  lang: IdiomaKey;
  opts: ReturnType<typeof obtenerOpcionesIniciales>;
}
