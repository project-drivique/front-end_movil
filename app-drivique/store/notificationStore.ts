import { create } from "zustand";
import { Cupon } from "@/modules/reservation/types/reservation.types";
import { notificationService, NotificacionMobile } from "@/modules/notifications/services/notificationService";
import { useAuthStore } from "./authStore";

export interface Notificacion {
  id: string;
  tipo: "general" | "promocion" | string;
  titulo: string;
  mensaje: string;
  /** ISO 8601 */
  fecha: string;
  leido: boolean;
  leidoEn?: string | null;
  /** ISO 8601 — si existe, la notificacion desaparece automaticamente despues de esta fecha */
  expiracion?: string;
  /** Icono de Ionicons a mostrar */
  icono?: string;
  iconoColor?: string;
  criticidad?: "HIGH" | "MEDIUM" | "LOW" | "NORMAL";
  canal?: string;
  metadata?: Record<string, any>;
  referenceId?: string;
  /** Detalles del cupón (solo para tipo "promocion") */
  cupon?: Cupon;
}

interface NotificationState {
  notificaciones: Notificacion[];
  conteoNoLeidas: number;
  cargando: boolean;
  error: string | null;

  cargarNotificaciones: (silent?: boolean) => Promise<void>;
  cargarConteoNoLeidas: () => Promise<number>;
  marcarComoLeida: (id: string) => Promise<void>;
  marcarTodasComoLeidas: () => Promise<void>;
  agregarNotificacion: (notif: Omit<Notificacion, "id" | "leido" | "fecha">) => void;
  limpiarNotificaciones: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // HU-INT-17: Se eliminan notificaciones dummy estáticas. Se sincroniza con backend.
  notificaciones: [],
  conteoNoLeidas: 0,
  cargando: false,
  error: null,

  cargarNotificaciones: async (silent = false) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ notificaciones: [], conteoNoLeidas: 0, cargando: false });
      return;
    }

    if (!silent) set({ cargando: true, error: null });

    try {
      const [lista, unreadCount] = await Promise.all([
        notificationService.listNotifications(),
        notificationService.getUnreadCount().catch(() => null),
      ]);

      const adaptadas: Notificacion[] = lista.map((item) => ({
        id: item.id,
        tipo: item.tipo.toLowerCase().includes("promo") ? "promocion" : "general",
        titulo: item.titulo,
        mensaje: item.mensaje,
        fecha: item.fecha,
        leido: item.leido,
        leidoEn: item.leidoEn,
        icono: item.icono,
        iconoColor: item.iconoColor,
        criticidad: item.criticidad,
        canal: item.canal,
        metadata: item.metadata,
        referenceId: item.referenceId,
      }));

      const noLeidasCalculadas = adaptadas.filter((n) => !n.leido).length;
      const conteoFinal = typeof unreadCount === "number" ? unreadCount : noLeidasCalculadas;

      set({
        notificaciones: adaptadas,
        conteoNoLeidas: conteoFinal,
        cargando: false,
        error: null,
      });
    } catch (err: any) {
      console.warn("Error cargando notificaciones en móvil:", err);
      set({
        cargando: false,
        error: err?.response?.data?.message || err?.message || "Error al sincronizar notificaciones",
      });
    }
  },

  cargarConteoNoLeidas: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ conteoNoLeidas: 0 });
      return 0;
    }

    try {
      const count = await notificationService.getUnreadCount();
      const finalCount = typeof count === "number" ? count : 0;
      set({ conteoNoLeidas: finalCount });
      return finalCount;
    } catch {
      const fallback = get().notificaciones.filter((n) => !n.leido).length;
      set({ conteoNoLeidas: fallback });
      return fallback;
    }
  },

  marcarComoLeida: async (id: string) => {
    const actuales = get().notificaciones;
    const target = actuales.find((n) => n.id === id);
    if (!target || target.leido) return;

    // Actualización optimista local
    const actualizadas = actuales.map((n) =>
      n.id === id ? { ...n, leido: true, leidoEn: new Date().toISOString() } : n
    );
    const nuevoConteo = Math.max(0, get().conteoNoLeidas - 1);
    set({ notificaciones: actualizadas, conteoNoLeidas: nuevoConteo });

    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.warn(`Error al marcar leída notificación ${id} en backend:`, err);
    }
  },

  marcarTodasComoLeidas: async () => {
    const actuales = get().notificaciones;
    const actualizadas = actuales.map((n) => ({
      ...n,
      leido: true,
      leidoEn: n.leidoEn || new Date().toISOString(),
    }));
    set({ notificaciones: actualizadas, conteoNoLeidas: 0 });

    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.warn("Error al marcar todas las notificaciones como leídas en backend:", err);
    }
  },

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
      conteoNoLeidas: state.conteoNoLeidas + 1,
    })),

  limpiarNotificaciones: () =>
    set({ notificaciones: [], conteoNoLeidas: 0, cargando: false, error: null }),
}));
