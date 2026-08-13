import { create } from "zustand";
import { useNotificationStore } from "./notificationStore";

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

// Datos iniciales de demostración
const REPORTES_INICIALES: ReporteIncidencia[] = [
  {
    id: "REP-9102",
    reservaId: "RES-2026-0810",
    vehiculoNombre: "Toyota Prado VX",
    placa: "KLS-849",
    tipoIncidencia: "Avería mecánica",
    descripcion: "Se encendió el testigo de revisión de motor en el tablero durante el trayecto a Neiva.",
    evidencias: [],
    contactoNombre: "Carlos Mendoza",
    contactoTelefono: "+57 314 478 9702",
    contactoEmail: "carlos.mendoza@email.com",
    tiempoEstimadoSolucion: "2 a 4 horas",
    estado: "En atención",
    fechaCreacion: "2026-08-10T16:20:00Z",
    historialEstados: [
      { estado: "Recibido", fecha: "2026-08-10T16:20:00Z", comentario: "Reporte registrado en el sistema." },
      { estado: "En revisión", fecha: "2026-08-10T16:35:00Z", comentario: "Asignado al taller autorizado de la zona." },
      { estado: "En atención", fecha: "2026-08-10T17:10:00Z", comentario: "Unidad móvil enviada con mecánico especializado." },
    ],
  },
  {
    id: "REP-8401",
    reservaId: "RES-2026-0801",
    vehiculoNombre: "Chevrolet Spark GT",
    placa: "HGF-123",
    tipoIncidencia: "Limpieza / Estética",
    descripcion: "El interior del vehículo requería una limpieza adicional en la tapicería trasera.",
    evidencias: [],
    contactoNombre: "Laura Torres",
    contactoTelefono: "+57 322 316 3531",
    contactoEmail: "laura.torres@email.com",
    tiempoEstimadoSolucion: "12 horas",
    estado: "Resuelto",
    fechaCreacion: "2026-08-01T10:00:00Z",
    historialEstados: [
      { estado: "Recibido", fecha: "2026-08-01T10:00:00Z", comentario: "Reporte de limpieza recibido." },
      { estado: "En revisión", fecha: "2026-08-01T10:30:00Z", comentario: "Autorizada bonificación por servicio de limpieza." },
      { estado: "Resuelto", fecha: "2026-08-01T14:00:00Z", comentario: "Se aplicó saldo a favor en la cuenta del cliente." },
    ],
  },
];

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
