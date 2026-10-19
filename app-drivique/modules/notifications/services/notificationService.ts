import { apiClient } from "@/services/http/apiClient";
import i18n from "@/modules/i18n";

export interface NotificationDTO {
  id: string;
  userId?: string;
  channel?: string;
  type?: string;
  subject?: string;
  message: string;
  referenceId?: string;
  isRead: boolean;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
  eventType?: string;
  criticality?: "HIGH" | "MEDIUM" | "LOW" | "NORMAL";
  metadata?: string | Record<string, any>;
}

export interface NotificacionMobile {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
  leidoEn?: string | null;
  tipo: string;
  canal?: string;
  criticidad: "HIGH" | "MEDIUM" | "LOW" | "NORMAL";
  icono: string;
  iconoColor: string;
  metadata?: Record<string, any>;
  referenceId?: string;
}

export function normalizarNotificacion(raw: any): NotificacionMobile {
  if (!raw || typeof raw !== "object") {
    return {
      id: String(Math.random()),
      titulo: i18n.t("extra.notif.generica"),
      mensaje: "",
      fecha: new Date().toISOString(),
      leido: false,
      tipo: "GENERAL",
      criticidad: "NORMAL",
      icono: "notifications-outline",
      iconoColor: "#2563EB",
    };
  }

  const id = String(raw.id || raw.notificationId || raw.uuid || Math.random());
  const titulo = raw.subject || raw.title || raw.titulo || i18n.t("extra.notif.drivique");
  const mensaje = raw.message || raw.mensaje || raw.content || "";
  const tipo = (raw.eventType || raw.type || raw.tipo || "GENERAL").toUpperCase();
  const criticidad = ((raw.criticality || raw.criticidad || "NORMAL") as string).toUpperCase() as NotificacionMobile["criticidad"];
  
  const leido = typeof raw.isRead === "boolean"
    ? raw.isRead
    : (typeof raw.read === "boolean" ? raw.read : Boolean(raw.leido));

  const fecha = raw.createdAt || raw.created_at || raw.sentAt || raw.fecha || new Date().toISOString();
  const leidoEn = raw.readAt || raw.read_at || null;

  let metadata: Record<string, any> = {};
  if (typeof raw.metadata === "string") {
    try {
      metadata = JSON.parse(raw.metadata);
    } catch {
      metadata = { raw: raw.metadata };
    }
  } else if (raw.metadata && typeof raw.metadata === "object") {
    metadata = raw.metadata;
  }

  // Resolve icon and color based on eventType and criticality
  let icono = "notifications-outline";
  let iconoColor = "#2563EB";

  const eventUpper = tipo.toUpperCase();
  if (eventUpper.includes("REGISTER") || eventUpper.includes("WELCOME") || eventUpper.includes("AUTH")) {
    icono = "person-circle-outline";
    iconoColor = "#3B82F6";
  } else if (eventUpper.includes("PAYMENT") || eventUpper.includes("PAGO")) {
    icono = "card-outline";
    iconoColor = "#10B981";
  } else if (eventUpper.includes("RESERVATION") || eventUpper.includes("RESERVA")) {
    icono = "car-outline";
    iconoColor = "#2563EB";
  } else if (eventUpper.includes("CANCEL")) {
    icono = "close-circle-outline";
    iconoColor = "#EF4444";
  } else if (eventUpper.includes("CONTRACT") || eventUpper.includes("CONTRATO")) {
    icono = "document-attach-outline";
    iconoColor = "#6366F1";
  } else if (eventUpper.includes("DELIVER") || eventUpper.includes("ENTREGA") || eventUpper.includes("CHECKIN")) {
    icono = "key-outline";
    iconoColor = "#059669";
  } else if (eventUpper.includes("RETURN") || eventUpper.includes("DEVOLUCION") || eventUpper.includes("CHECKOUT")) {
    icono = "checkmark-done-circle-outline";
    iconoColor = "#0284C7";
  } else if (eventUpper.includes("KYC") || eventUpper.includes("DOCUMENT")) {
    icono = "shield-checkmark-outline";
    iconoColor = "#10B981";
  } else if (eventUpper.includes("INCIDENT") || eventUpper.includes("SOPORTE") || eventUpper.includes("SUPPORT")) {
    icono = "warning-outline";
    iconoColor = "#F59E0B";
  }

  if (criticidad === "HIGH") {
    iconoColor = "#DC2626";
  }

  return {
    id,
    titulo,
    mensaje,
    fecha,
    leido,
    leidoEn,
    tipo,
    canal: raw.channel || "IN_APP",
    criticidad,
    icono,
    iconoColor,
    metadata,
    referenceId: raw.referenceId ? String(raw.referenceId) : undefined,
  };
}

export const notificationService = {
  /**
   * Obtiene la lista de notificaciones del usuario autenticado.
   */
  async listNotifications(params?: { isRead?: boolean }): Promise<NotificacionMobile[]> {
    const queryParams: Record<string, string> = {};
    if (params && typeof params.isRead === "boolean") {
      queryParams.isRead = String(params.isRead);
    }
    const { data } = await apiClient.get("/notifications", { params: queryParams });
    const list = Array.isArray(data)
      ? data
      : (Array.isArray(data?.content) ? data.content : (Array.isArray(data?.notifications) ? data.notifications : []));
    return list.map(normalizarNotificacion);
  },

  /**
   * Obtiene el conteo de notificaciones pendientes por leer.
   */
  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get("/notifications/unread-count");
    if (data && typeof data.unreadCount === "number") {
      return data.unreadCount;
    }
    if (typeof data === "number") {
      return data;
    }
    return 0;
  },

  /**
   * Obtiene el detalle de una notificación por ID.
   */
  async getNotificationById(id: string): Promise<NotificacionMobile> {
    const { data } = await apiClient.get(`/notifications/${id}`);
    return normalizarNotificacion(data);
  },

  /**
   * Marca una notificación como leída en backend.
   */
  async markAsRead(id: string): Promise<NotificacionMobile> {
    const { data } = await apiClient.patch(`/notifications/${id}/read`);
    return normalizarNotificacion(data);
  },

  /**
   * Marca todas las notificaciones como leídas en backend.
   */
  async markAllAsRead(): Promise<{ message: string }> {
    const { data } = await apiClient.patch("/notifications/read-all");
    return data;
  },
};
