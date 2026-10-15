import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { apiClient } from "@/services/http/apiClient";
import { aBase64 } from "@/utils/signaturePng";
import {
  ArchivoAdjunto,
  Incident,
  IncidentAttachment,
  IncidentStatus,
  NuevaIncidencia,
} from "../types/incident.types";

export const MAX_ADJUNTOS = 5;
export const MAX_BYTES_ADJUNTO = 5 * 1024 * 1024;
export const TIPOS_ADJUNTO = ["image/jpeg", "image/png", "application/pdf"];

async function aParte(archivo: ArchivoAdjunto): Promise<any> {
  if (Platform.OS === "web") {
    const blob = await (await fetch(archivo.uri)).blob();
    return blob;
  }
  return { uri: archivo.uri, name: archivo.name, type: archivo.mimeType } as any;
}

async function agregarArchivos(form: FormData, archivos: ArchivoAdjunto[]) {
  for (const archivo of archivos) {
    const parte = await aParte(archivo);
    if (Platform.OS === "web") form.append("files", parte, archivo.name);
    else form.append("files", parte);
  }
}

export const incidentService = {
  listarMias: async (): Promise<Incident[]> => {
    const { data } = await apiClient.get("/incidents/me");
    return Array.isArray(data) ? data : [];
  },

  obtener: async (id: string): Promise<Incident> => {
    const { data } = await apiClient.get(`/incidents/${id}`);
    return data;
  },

  crear: async (body: NuevaIncidencia): Promise<Incident> => {
    const { data } = await apiClient.post("/incidents", body);
    return data;
  },

  subirAdjuntos: async (id: string, archivos: ArchivoAdjunto[]): Promise<IncidentAttachment[]> => {
    const form = new FormData();
    await agregarArchivos(form, archivos);
    const { data } = await apiClient.post(`/incidents/${id}/attachments`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  responder: async (id: string, message: string, archivos: ArchivoAdjunto[]): Promise<Incident> => {
    const form = new FormData();
    form.append("message", message);
    await agregarArchivos(form, archivos);
    const { data } = await apiClient.post(`/incidents/${id}/responses`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  cambiarEstado: async (id: string, status: IncidentStatus, note?: string): Promise<Incident> => {
    const { data } = await apiClient.patch(`/incidents/${id}/status`, { status, note });
    return data;
  },

  descargarAdjunto: async (
    incidentId: string,
    adjunto: IncidentAttachment,
  ): Promise<{ uri: string; dataUri: string | null }> => {
    const { data } = await apiClient.get(`/incidents/${incidentId}/attachments/${adjunto.id}`, {
      responseType: "arraybuffer",
    });
    const bytes = new Uint8Array(data);
    const base64 = aBase64(bytes);
    const esImagen = adjunto.contentType.startsWith("image/");
    const dataUri = esImagen ? `data:${adjunto.contentType};base64,${base64}` : null;
    if (Platform.OS === "web") {
      return { uri: URL.createObjectURL(new Blob([data], { type: adjunto.contentType })), dataUri };
    }
    const seguro = adjunto.originalName.replace(/[^\w.\-]/g, "_");
    const uri = `${FileSystem.cacheDirectory}${adjunto.id}-${seguro}`;
    await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
    return { uri, dataUri };
  },
};
