import { create } from "zustand";

export interface Notificacion {
  id: string;
  tipo: "general" | "promocion";
  titulo: string;
  mensaje: string;
  /** ISO 8601 */
  fecha: string;
  leido: boolean;
  /** ISO 8601 — si existe, la notificacion desaparece automaticamente despues de esta fecha */
  expiracion?: string;
  /** Icono de Ionicons a mostrar (opcional, por defecto se infiere del tipo/titulo) */
  icono?: string;
  /** Ruta interna de la app a la que navegar cuando el usuario toca la notificacion.
   * Simula el link de redireccion que llega por correo electrónico. */
  enlace?: string;
}

interface NotificationState {
  notificaciones: Notificacion[];
  marcarComoLeida: (id: string) => void;
  marcarTodasComoLeidas: () => void;
  agregarNotificacion: (notif: Omit<Notificacion, "id" | "leido" | "fecha">) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notificaciones: [
    // ── GENERALES ──────────────────────────────────────────────────────
    {
      id: "g1",
      tipo: "general",
      titulo: "Reserva confirmada",
      mensaje:
        "Tu reserva del Toyota Prado ha sido confirmada con éxito. Recuerda que el retiro es en sucursal Neiva el día acordado.",
      fecha: "2026-08-11T14:30:00Z",
      leido: false,
      icono: "checkmark-circle-outline",
    },
    {
      id: "g2",
      tipo: "general",
      titulo: "Pago validado",
      mensaje:
        "El pago digital a través de Wompi fue validado de forma satisfactoria. Guarda tu comprobante.",
      fecha: "2026-08-11T14:35:00Z",
      leido: false,
      icono: "card-outline",
    },
    {
      id: "g3",
      tipo: "general",
      titulo: "Documentos verificados ✓",
      mensaje:
        "Tu licencia de conducción y documento de identidad fueron aprobados por nuestro equipo. Ya puedes continuar con tu reserva.",
      fecha: "2026-08-10T09:20:00Z",
      leido: false,
      icono: "document-text-outline",
    },
    {
      id: "g4",
      tipo: "general",
      titulo: "Reserva próxima a vencer",
      mensaje:
        "Tu reserva del Chevrolet Spark vence mañana a las 10:00 AM. Si no la confirmas, se liberará el vehículo.",
      fecha: "2026-08-09T18:00:00Z",
      leido: false,
      icono: "time-outline",
      expiracion: "2026-08-12T10:00:00Z",
    },
    {
      id: "g5",
      tipo: "general",
      titulo: "Soporte respondió tu caso",
      mensaje:
        "El equipo de soporte respondió tu solicitud #4821. Ingresa a la sección de soporte para ver la respuesta.",
      fecha: "2026-08-09T11:45:00Z",
      leido: true,
      icono: "chatbubble-ellipses-outline",
    },
    {
      id: "g6",
      tipo: "general",
      titulo: "Alquiler finalizado",
      mensaje:
        "Tu alquiler del Ford Explorer finalizó correctamente. ¡Gracias por confiar en Drivique! No olvides dejar tu calificación.",
      fecha: "2026-08-08T16:00:00Z",
      leido: true,
      icono: "car-outline",
    },
    {
      id: "g7",
      tipo: "general",
      titulo: "Nueva política de cancelación",
      mensaje:
        "Actualizamos nuestra política de cancelación. Ahora tienes hasta 24 horas antes del inicio para cancelar sin costo.",
      fecha: "2026-08-07T10:00:00Z",
      leido: true,
      icono: "information-circle-outline",
    },
    // ── PROMOCIONES ───────────────────────────────────────────────────
    {
      id: "p1",
      tipo: "promocion",
      titulo: "¡Cupón de bienvenida activo!",
      mensaje:
        "Usa el cupón BIENVENIDO15 para obtener 15% de descuento en tu próximo alquiler. Aplica en cualquier categoría.",
      fecha: "2026-08-11T08:00:00Z",
      leido: false,
      icono: "ticket-outline",
      expiracion: "2026-08-31T23:59:59Z",
    },
    {
      id: "p2",
      tipo: "promocion",
      titulo: "Fin de semana especial 🚗",
      mensaje:
        "Alquila una SUV de viernes a domingo y paga solo 2 días. Válido esta semana. Reserva antes de que se agoten los cupos.",
      fecha: "2026-08-09T10:00:00Z",
      leido: true,
      icono: "calendar-outline",
      expiracion: "2026-08-17T23:59:59Z",
    },
    {
      id: "p3",
      tipo: "promocion",
      titulo: "Descuento para clientes frecuentes",
      mensaje:
        "Por ser un cliente frecuente, accedes a un 10% adicional en todos tus alquileres este mes. Se aplica automáticamente.",
      fecha: "2026-08-08T07:30:00Z",
      leido: true,
      icono: "star-outline",
    },
  ],
  marcarComoLeida: (id) =>
    set((state) => ({
      notificaciones: state.notificaciones.map((n) =>
        n.id === id ? { ...n, leido: true } : n
      ),
    })),
  marcarTodasComoLeidas: () =>
    set((state) => ({
      notificaciones: state.notificaciones.map((n) => ({ ...n, leido: true })),
    })),
  agregarNotificacion: (notif) =>
    set((state) => ({
      notificaciones: [
        {
          ...notif,
          id: Math.random().toString(),
          leido: false,
          fecha: new Date().toISOString(),
        },
        ...state.notificaciones,
      ],
    })),
}));

