import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import {
  ArchivoAdjunto,
  IncidentPriority,
  IncidentStatus,
} from "../types/incident.types";
import { MAX_ADJUNTOS, MAX_BYTES_ADJUNTO, TIPOS_ADJUNTO } from "../services/incidentService";

export const COLOR_ESTADO: Record<IncidentStatus, string> = {
  OPEN: "#f59e0b",
  IN_REVIEW: "#2563eb",
  RESOLVED: "#16a34a",
  CLOSED: "#6b7280",
};

export const COLOR_PRIORIDAD: Record<IncidentPriority, string> = {
  LOW: "#6b7280",
  MEDIUM: "#2563eb",
  HIGH: "#f59e0b",
  CRITICAL: "#dc2626",
};

export function formatearFechaHora(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export function formatearTamano(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function Insignia({ texto, color }: { texto: string; color: string }) {
  return (
    <View style={[s.insignia, { backgroundColor: `${color}18`, borderColor: `${color}55` }]}>
      <View style={[s.punto, { backgroundColor: color }]} />
      <Text style={[s.insigniaTexto, { color }]}>{texto}</Text>
    </View>
  );
}

export function EstadoInsignia({ estado }: { estado: IncidentStatus }) {
  const { t } = useTranslation();
  return <Insignia texto={t(`incidencias.estados.${estado}`)} color={COLOR_ESTADO[estado]} />;
}

export function PrioridadInsignia({ prioridad }: { prioridad: IncidentPriority }) {
  const { t } = useTranslation();
  return <Insignia texto={t(`incidencias.prioridades.${prioridad}`)} color={COLOR_PRIORIDAD[prioridad]} />;
}

export function etiquetaTransicion(
  t: (key: string) => string,
  desde: IncidentStatus,
  hacia: IncidentStatus,
): string {
  if (hacia === "CLOSED") {
    if (desde === "RESOLVED") return t("incidencias.transiciones.CLOSED_RESOLVED");
    if (desde === "OPEN") return t("incidencias.transiciones.CLOSED_OPEN");
    return t("incidencias.transiciones.CLOSED_IN_REVIEW");
  }
  return t(`incidencias.transiciones.${hacia}`);
}

export function useAdjuntos() {
  const { t } = useTranslation();
  const [archivos, setArchivos] = useState<ArchivoAdjunto[]>([]);
  const [error, setError] = useState("");

  const agregar = useCallback(async () => {
    setError("");
    const resultado = await DocumentPicker.getDocumentAsync({
      type: TIPOS_ADJUNTO,
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (resultado.canceled) return;
    const nuevos: ArchivoAdjunto[] = [];
    for (const a of resultado.assets) {
      const mime = a.mimeType || "";
      if (!TIPOS_ADJUNTO.includes(mime) || (a.size ?? 0) > MAX_BYTES_ADJUNTO) {
        setError(t("incidencias.archivoInvalido"));
        continue;
      }
      nuevos.push({ uri: a.uri, name: a.name, mimeType: mime, size: a.size });
    }
    setArchivos((prev) => {
      const total = [...prev, ...nuevos];
      if (total.length > MAX_ADJUNTOS) {
        setError(t("incidencias.maxArchivos"));
        return total.slice(0, MAX_ADJUNTOS);
      }
      return total;
    });
  }, [t]);

  const quitar = useCallback((indice: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== indice));
  }, []);

  const limpiar = useCallback(() => {
    setArchivos([]);
    setError("");
  }, []);

  return { archivos, error, agregar, quitar, limpiar };
}

export function SelectorAdjuntos({
  archivos,
  error,
  onAgregar,
  onQuitar,
}: {
  archivos: ArchivoAdjunto[];
  error: string;
  onAgregar: () => void;
  onQuitar: (i: number) => void;
}) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const acento = c.oscuro ? "#60A5FA" : "#2f4ea2";
  return (
    <View>
      {archivos.map((a, i) => (
        <View key={`${a.uri}-${i}`} style={[s.archivo, { borderColor: c.border, backgroundColor: c.bgInput }]}>
          <Ionicons
            name={a.mimeType === "application/pdf" ? "document-text-outline" : "image-outline"}
            size={18}
            color={acento}
          />
          <Text style={[s.archivoNombre, { color: c.textPrimary }]} numberOfLines={1}>
            {a.name}
          </Text>
          <TouchableOpacity onPress={() => onQuitar(i)} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={c.textMuted} />
          </TouchableOpacity>
        </View>
      ))}
      {archivos.length < MAX_ADJUNTOS ? (
        <TouchableOpacity onPress={onAgregar} style={[s.agregar, { borderColor: acento }]} activeOpacity={0.8}>
          <Ionicons name="attach" size={16} color={acento} />
          <Text style={[s.agregarTexto, { color: acento }]}>{t("incidencias.agregarAdjunto")}</Text>
        </TouchableOpacity>
      ) : null}
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  insignia: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  punto: { width: 6, height: 6, borderRadius: 3 },
  insigniaTexto: { fontSize: 11, fontWeight: "800" },
  archivo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },
  archivoNombre: { flex: 1, fontSize: 12 },
  agregar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 10,
  },
  agregarTexto: { fontSize: 12, fontWeight: "700" },
  error: { color: "#dc2626", fontSize: 12, marginTop: 6 },
});
