import ciudadesData from "../../../mocks/cities.json";
import sucursalesData from "../../../mocks/branches.json";
import vehiculosData from "../../../mocks/vehicles.json";
import reservasData from "../../../mocks/bookings.json";
import { DisponibilidadVehiculo, ReservaOcupada, Vehiculo } from "../types/catalog.types";

export const COLOR_MARCA = "#2f4ea2";
export const COLOR_ACCENT = "#2563eb";

export const COLORES = {
  pageBg: "#f8fafc",
  panelBg: "#ffffff",
  panelBorder: "#f1f5f9",
  panelBorderStrong: "#e2e8f0",
  panelShadow: "0 2px 12px rgba(0,0,0,0.05)",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  textSoft: "#94a3b8",
  accentText: COLOR_MARCA,
  accentGradient: `${COLOR_MARCA}`,
  accentBgSoft: "rgba(30,58,138,0.08)",
  accentBorder: "#bfdbfe",
  inputBg: "#fff",
  inputText: "#334155",
  inputBorder: "#e2e8f0",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  dangerText: "#dc2626",
  chipBg: "#f1f5f9",
  chipText: "#475569",
  chipActiveBg: COLOR_MARCA,
  chipActiveText: "#fff",
  cardBorder: "#f1f5f9",
  cardBorderHover: "#bfdbfe",
  cardShadow: "0 2px 8px rgba(0,0,0,0.05)",
  imageFallbackBg: "#f1f5f9",
  imageFallbackIcon: "#94a3b8",
  paginationIdleBg: "#f1f5f9",
  paginationIdleText: "#475569",
  paginationDisabledBg: "#f1f5f9",
  paginationDisabledText: "#94a3b8",
  heroBg: "#eff6ff",
};

export const CATEGORIAS = ["Todos", "Sedan", "SUV", "Económico", "Deportivo"];
export const TRANSMISIONES = ["Todas", "Automática", "Manual"];
export const COMBUSTIBLES = [
  "Todos",
  "Gasolina",
  "Diesel",
  "Híbrido",
  "Eléctrico",
];

// =========================================================
// CIUDADES (desde mocks/ciudades.json — igual que la web)
// =========================================================
export interface CiudadInfo {
  id: string;
  nombre: string;
  departamento: string;
  tieneAeropuerto: boolean;
  tieneTerminal: boolean;
}

export const CIUDADES_DATA: CiudadInfo[] = ciudadesData;

// Lista plana para filtros con opción "Todas las ciudades"
export const CIUDADES_FILTRO = [
  "Todas las ciudades",
  ...CIUDADES_DATA.map((c) => c.nombre),
];

// Lista plana original (se mantiene por compatibilidad con BuscadorCatalogo,
// que no necesita la opción "Todas las ciudades")
export const CIUDADES: string[] = CIUDADES_DATA.map((c) => c.nombre);

// =========================================================
// SUCURSALES (desde mocks/sucursales.json — igual que la web)
// =========================================================
export interface SucursalInfo {
  nombre: string;
  ciudad: string;
  direccion: string;
}

export const SUCURSALES_DATA: SucursalInfo[] = sucursalesData;

// Lista plana (se mantiene por compatibilidad con FiltrosCatalogo y otros
// componentes que ya consumen SUCURSALES como array de strings)
export const SUCURSALES = [
  "Todas las sucursales",
  ...SUCURSALES_DATA.map((s) => s.nombre),
];

// Helper para obtener las sucursales de una ciudad específica
export function getSucursalesPorCiudad(ciudad: string): string[] {
  return SUCURSALES_DATA.filter((s) => s.ciudad === ciudad).map(
    (s) => s.nombre,
  );
}

// Helper para obtener la ciudad de una sucursal específica
export function getCiudadPorSucursal(sucursal: string): string | null {
  const encontrada = SUCURSALES_DATA.find((s) => s.nombre === sucursal);
  return encontrada ? encontrada.ciudad : null;
}

// Helper para obtener la dirección de una sucursal específica
export function getDireccionSucursal(sucursal: string): string | null {
  const encontrada = SUCURSALES_DATA.find((s) => s.nombre === sucursal);
  return encontrada ? encontrada.direccion : null;
}

// El mock de sucursales (branches.json) no trae horario — todas las
// sucursales operan con el mismo horario estándar de la compañía.
export const HORARIO_ATENCION_SUCURSAL = "Todos los días · 6:00 a.m. – 10:00 p.m.";

// URL de Google Maps para "Cómo llegar" a partir de la dirección de la
// sucursal (no requiere API key, funciona con Linking.openURL).
export function getUrlComoLlegar(direccion: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
}

export const FILTROS_BASE = {
  categoria: "Todos",
  precioMin: "",
  precioMax: "",
  transmision: "Todas",
  combustible: "Todos",
  ciudad: "Todas las ciudades",
  sucursal: "Todas las sucursales",
  orden: "precio_asc",
  busqueda: "",
};

// =========================================================
// VEHÍCULOS (desde mocks/vehiculos.json — mismo catálogo para
// invitados y usuarios registrados; solo cambia qué tanto de
// cada objeto se muestra en la tarjeta vs. en el detalle)
// =========================================================
export const VEHICULOS_MOCK: Vehiculo[] = vehiculosData as Vehiculo[];

// =========================================================
// RESERVAS / DISPONIBILIDAD (desde mocks/reservas.json — separado
// del catálogo porque son datos transaccionales que cambian con
// cada reserva, no información fija del vehículo)
// =========================================================
export const RESERVAS_MOCK: ReservaOcupada[] = reservasData as ReservaOcupada[];

// Arma la disponibilidad de un vehículo a partir de RESERVAS_MOCK,
// separando bloqueos de día completo (ocupados) de bloqueos de hora
// específica (horasOcupadas), agrupados por fecha.
export function getDisponibilidadVehiculo(vehiculoId: number): DisponibilidadVehiculo {
  const reservasVehiculo = RESERVAS_MOCK.filter((r) => r.vehiculoId === vehiculoId);

  const ocupados: DisponibilidadVehiculo["ocupados"] = [];
  const horasOcupadas: NonNullable<DisponibilidadVehiculo["horasOcupadas"]> = {};

  reservasVehiculo.forEach((r) => {
    if (r.hora) {
      if (!horasOcupadas[r.fecha]) horasOcupadas[r.fecha] = [];
      horasOcupadas[r.fecha].push({ hora: r.hora, motivo: r.motivo });
    } else {
      ocupados.push({ fecha: r.fecha, motivo: r.motivo });
    }
  });

  return { ocupados, horasOcupadas };
}