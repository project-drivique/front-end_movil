import { create } from "zustand";
import { useNotificationStore } from "./notificationStore";
import reportesSoporteDemo from "@/mocks/reportesSoporteDemo.json";

export type EstadoReporte = "Recibido" | "En revisión" | "En atención" | "Resuelto";

export interface HistorialEstadoItem {
  estado: EstadoReporte;
  fecha: string;
  comentario?: string;
}

export interface ReporteIncidencia {
  id: string;
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
  reservaId?: string;
  vehiculoNombre?: string;
  placa?: string;
  tipoIncidencia: string;
  descripcion: string;
  evidencias?: string[];
  contactoNombre: string;
  contactoTelefono: string;
  contactoEmail: string;
  tiempoEstimadoSolucion: string;
}

interface SupportState {
  reportes: ReporteIncidencia[];
  crearReporte: (datos: DatosNuevoReporte) => ReporteIncidencia;
  actualizarEstadoReporte: (id: string, nuevoEstado: EstadoReporte, comentario?: string) => void;
}

const REPORTES_INICIALES: ReporteIncidencia[] = reportesSoporteDemo as ReporteIncidencia[];

export const useSupportStore = create<SupportState>((set, get) => ({
  reportes: REPORTES_INICIALES,

  crearReporte: (datos) => {
    const idNumero = Math.floor(1000 + Math.random() * 9000);
    const id = `REP-${idNumero}`;
    const ahora = new Date().toISOString();

    const nuevoReporte: ReporteIncidencia = {
      id,
      reservaId: datos.reservaId || "",
      vehiculoNombre: datos.vehiculoNombre || "Vehículo no especificado",
      placa: datos.placa || "N/A",
      tipoIncidencia: datos.tipoIncidencia,
      descripcion: datos.descripcion,
      evidencias: datos.evidencias || [],
      contactoNombre: datos.contactoNombre,
      contactoTelefono: datos.contactoTelefono,
      contactoEmail: datos.contactoEmail,
      tiempoEstimadoSolucion: datos.tiempoEstimadoSolucion,
      estado: "Recibido",
      fechaCreacion: ahora,
      historialEstados: [
        {
          estado: "Recibido",
          fecha: ahora,
          comentario: "Reporte registrado exitosamente por el usuario. Notificación de recibo enviada a su correo.",
        },
      ],
    };

    set((state) => ({
      reportes: [nuevoReporte, ...state.reportes],
    }));

    // Agregar notificación automática al store de notificaciones (sin emojis)
    try {
      const vehiculoTxt = datos.vehiculoNombre ? ` para ${datos.vehiculoNombre}` : "";
      useNotificationStore.getState().agregarNotificacion({
        tipo: "general",
        titulo: `Reporte ${id} recibido`,
        mensaje: `Recibimos tu reporte por '${datos.tipoIncidencia}'${vehiculoTxt}. Tiempo estimado de solución: ${datos.tiempoEstimadoSolucion}. Se envió confirmación a ${datos.contactoEmail}.`,
        icono: "build-outline",
      });
    } catch {
      // Ignorar si falla la notificación
    }

    return nuevoReporte;
  },

  actualizarEstadoReporte: (id, nuevoEstado, comentario) => {
    const ahora = new Date().toISOString();
    let reporteActualizado: ReporteIncidencia | null = null;

    set((state) => ({
      reportes: state.reportes.map((r) => {
        if (r.id === id) {
          const historial = [
            ...r.historialEstados,
            {
              estado: nuevoEstado,
              fecha: ahora,
              comentario: comentario || `El administrador actualizó el estado a '${nuevoEstado}'.`,
            },
          ];
          reporteActualizado = { ...r, estado: nuevoEstado, historialEstados: historial };
          return reporteActualizado;
        }
        return r;
      }),
    }));

    // Si el administrador cambió el estado, notificar al usuario (sin emojis)
    if (reporteActualizado) {
      const r = reporteActualizado as ReporteIncidencia;
      try {
        const iconoEstado =
          nuevoEstado === "Resuelto"
            ? "checkmark-done-circle-outline"
            : nuevoEstado === "En atención"
            ? "construct-outline"
            : "eye-outline";

        useNotificationStore.getState().agregarNotificacion({
          tipo: "general",
          titulo: `Actualización de Reporte ${r.id}: ${nuevoEstado}`,
          mensaje: `Tu reporte por '${r.tipoIncidencia}' (${r.vehiculoNombre}) fue actualizado por el administrador a: ${nuevoEstado}. ${comentario || ""}`,
          icono: iconoEstado,
        });
      } catch {
        // Ignorar
      }
    }
  },
}));
