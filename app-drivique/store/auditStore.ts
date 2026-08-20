import { create } from "zustand";

export type ResultadoAcceso =
  | "Exitoso"
  | "Fallido - Credenciales incorrectas"
  | "Fallido - Sin permisos / Inactivo"
  | "Fallido - Cuenta bloqueada";

export interface EventoAuditoria {
  id: string;
  fechaHora: string;
  correo: string;
  rol: string;
  ip: string;
  resultado: ResultadoAcceso;
  sucursal?: string;
}

interface AuditStore {
  logs: EventoAuditoria[];
  registrarAcceso: (datos: Omit<EventoAuditoria, "id" | "fechaHora">) => void;
  registrarEvento: (tipo: string, detalle?: string) => void;
  limpiarLogs: () => void;
}

// Logs iniciales de demostración
const LOGS_INICIALES: EventoAuditoria[] = [
  {
    id: "AUD-8910",
    fechaHora: "2026-08-11T19:30:00Z",
    correo: "cliente@drivique.com",
    rol: "cliente",
    ip: "192.168.1.10",
    resultado: "Exitoso",
    sucursal: "Central",
  },
];

export const useAuditStore = create<AuditStore>()((set) => ({
  logs: LOGS_INICIALES,

  registrarAcceso: (datos) => {
    const id = `AUD-${Math.floor(1000 + Math.random() * 9000)}`;
    const fechaHora = new Date().toISOString();

    const nuevoLog: EventoAuditoria = {
      id,
      fechaHora,
      ...datos,
    };

    set((state) => ({
      logs: [nuevoLog, ...state.logs],
    }));
  },

  registrarEvento: (tipo, detalle) => {
    const id = `AUD-${Math.floor(1000 + Math.random() * 9000)}`;
    const fechaHora = new Date().toISOString();

    const nuevoLog: EventoAuditoria = {
      id,
      fechaHora,
      correo: "visitante@drivique.com",
      rol: "visitante",
      ip: "192.168.1.50",
      resultado: "Exitoso",
      sucursal: `${tipo}: ${detalle || "Navegación"}`,
    };

    set((state) => ({
      logs: [nuevoLog, ...state.logs],
    }));
  },

  limpiarLogs: () => set({ logs: [] }),
}));

// Exportar useAuditoria para mantener compatibilidad total con catalog.tsx y verify-email.tsx
export const useAuditoria = useAuditStore;
