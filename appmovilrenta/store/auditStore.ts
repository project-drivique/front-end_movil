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
    correo: "admin@drivique.com",
    rol: "administrador",
    ip: "192.168.1.10",
    resultado: "Exitoso",
    sucursal: "Central",
  },
  {
    id: "AUD-8911",
    fechaHora: "2026-08-11T20:15:00Z",
    correo: "encargado.neiva@drivique.com",
    rol: "encargado_sucursal",
    ip: "192.168.1.25",
    resultado: "Exitoso",
    sucursal: "Sucursal Neiva - Centro",
  },
  {
    id: "AUD-8912",
    fechaHora: "2026-08-11T20:45:00Z",
    correo: "inactivo@drivique.com",
    rol: "encargado_sucursal",
    ip: "192.168.1.88",
    resultado: "Fallido - Sin permisos / Inactivo",
    sucursal: "Sucursal Cali",
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
