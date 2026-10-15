import { create } from "zustand";
import { incidentService } from "@/modules/support/services/incidentService";
import {
  ArchivoAdjunto,
  Incident,
  IncidentAttachment,
  IncidentCategory,
  IncidentStatus,
} from "@/modules/support/types/incident.types";

export type EstadoReporte = "Recibido" | "En revisión" | "En atención" | "Resuelto";

export interface HistorialEstadoItem {
  estado: EstadoReporte;
  fecha: string;
  comentario?: string;
}

export interface ReporteIncidencia {
  /** Código visible del reporte (INC-2026-0001) */
  id: string;
  /** Identificador del servidor, para pedir el detalle */
  serverId: string;
  reservaId?: string;
  vehiculoNombre?: string;
  placa?: string;
  tipoIncidencia: string;
  descripcion: string;
  evidencias: string[];
  contactoNombre: string;
  contactoTelefono: string;
  contactoEmail: string;
  tiempoEstimadoSolucion: string;
  estado: EstadoReporte;
  fechaCreacion: string;
  historialEstados: HistorialEstadoItem[];
}

export interface DatosNuevoReporte {
  /** UUID de la reserva y del vehículo en el servidor */
  reservaUuid?: string;
  vehiculoUuid?: string;
  /** Tipo de incidencia que eligió la persona (se guarda como asunto) */
  tipoIncidencia: string;
  categoria: IncidentCategory;
  descripcion: string;
  evidencias?: string[];
  contactoNombre: string;
  contactoTelefono: string;
  contactoEmail: string;
}

interface SupportState {
  reportes: ReporteIncidencia[];
  cargando: boolean;
  cargar: () => Promise<void>;
  crearReporte: (datos: DatosNuevoReporte) => Promise<ReporteIncidencia>;
  abrirDetalle: (reporte: ReporteIncidencia) => Promise<ReporteIncidencia>;
}

const estadoDe = (status: IncidentStatus, asignado: boolean): EstadoReporte => {
  if (status === "RESOLVED" || status === "CLOSED") return "Resuelto";
  if (status === "IN_REVIEW") return asignado ? "En atención" : "En revisión";
  return "Recibido";
};

const horasDeAtencion = (i: Incident): string => {
  if (!i.slaDueAt) return "";
  const horas = Math.max(1, Math.round((new Date(i.slaDueAt).getTime() - new Date(i.createdAt).getTime()) / 3600000));
  return `${horas} h`;
};

const aReporte = (i: Incident, evidencias: string[] = []): ReporteIncidencia => {
  const asignado = !!i.assignedToName;
  const historial: HistorialEstadoItem[] = [];
  for (const item of i.timeline ?? []) {
    if (item.type === "STATUS" && item.toStatus) {
      historial.push({
        estado: item.fromStatus ? estadoDe(item.toStatus, asignado) : "Recibido",
        fecha: item.createdAt,
        comentario: item.message ?? undefined,
      });
    } else if (item.type === "MESSAGE" && item.message) {
      historial.push({ estado: estadoDe(i.status, asignado), fecha: item.createdAt, comentario: item.message });
    }
  }
  if (historial.length === 0) {
    historial.push({ estado: "Recibido", fecha: i.createdAt, comentario: i.description });
  }
  return {
    id: i.code,
    serverId: i.id,
    reservaId: i.reservationCode ?? "",
    vehiculoNombre: i.vehicleModel ?? undefined,
    placa: i.vehiclePlate ?? undefined,
    tipoIncidencia: i.subject,
    descripcion: i.description,
    evidencias,
    contactoNombre: i.reporterName,
    contactoTelefono: "",
    contactoEmail: "",
    tiempoEstimadoSolucion: horasDeAtencion(i),
    estado: estadoDe(i.status, asignado),
    fechaCreacion: i.createdAt,
    historialEstados: historial,
  };
};

const mimePorExtension = (uri: string): string => {
  const ext = uri.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
};

export const useSupportStore = create<SupportState>((set) => ({
  reportes: [],
  cargando: false,

  cargar: async () => {
    set({ cargando: true });
    try {
      const lista = await incidentService.listarMias();
      set({ reportes: lista.map((i) => aReporte(i)) });
    } finally {
      set({ cargando: false });
    }
  },

  crearReporte: async (datos) => {
    const creada = await incidentService.crear({
      category: datos.categoria,
      subject: datos.tipoIncidencia.slice(0, 150),
      description: datos.descripcion,
      ...(datos.reservaUuid ? { reservationId: datos.reservaUuid } : {}),
      ...(datos.vehiculoUuid ? { vehicleId: datos.vehiculoUuid } : {}),
    });
    const archivos: ArchivoAdjunto[] = (datos.evidencias ?? []).map((uri, i) => ({
      uri,
      name: `evidencia-${i + 1}.${mimePorExtension(uri).split("/")[1]}`,
      mimeType: mimePorExtension(uri),
    }));
    if (archivos.length > 0) await incidentService.subirAdjuntos(creada.id, archivos);
    const reporte = aReporte(creada, datos.evidencias ?? []);
    set((state) => ({ reportes: [reporte, ...state.reportes.filter((r) => r.serverId !== reporte.serverId)] }));
    return reporte;
  },

  /** Detalle con el seguimiento completo y las fotos de evidencia. */
  abrirDetalle: async (reporte) => {
    const incidente = await incidentService.obtener(reporte.serverId);
    const evidencias: string[] = [];
    const imagenes: IncidentAttachment[] = (incidente.attachments ?? []).filter((a) => a.contentType.startsWith("image/"));
    for (const adjunto of imagenes.slice(0, 3)) {
      try {
        const { dataUri, uri } = await incidentService.descargarAdjunto(incidente.id, adjunto);
        evidencias.push(dataUri ?? uri);
      } catch {
        /* la evidencia no está disponible: se muestra el resto del reporte */
      }
    }
    const completo = aReporte(incidente, evidencias);
    set((state) => ({ reportes: state.reportes.map((r) => (r.serverId === completo.serverId ? completo : r)) }));
    return completo;
  },
}));
