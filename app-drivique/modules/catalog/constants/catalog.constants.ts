import { DisponibilidadVehiculo } from "../types/catalog.types";
import { useReferenceStore } from "@/store/referenceStore";

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
// CIUDADES Y SUCURSALES (siempre desde la API: /cities y /branches)
// =========================================================
export interface CiudadInfo {
  id: string;
  nombre: string;
  departamento: string;
  tieneAeropuerto: boolean;
  tieneTerminal: boolean;
}

export interface SucursalInfo {
  id: string;
  nombre: string;
  ciudad: string;
  ciudadId: string;
  direccion: string;
  telefono: string;
  horaApertura: string;
  horaCierre: string;
  permiteEfectivo: boolean;
}

export function getCiudadesData(): CiudadInfo[] {
  return useReferenceStore.getState().ciudades.map((c) => ({
    id: c.id,
    nombre: c.name,
    departamento: c.departmentName ?? "",
    tieneAeropuerto: !!c.hasAirport,
    tieneTerminal: !!c.hasTerminal,
  }));
}

export function getSucursalesData(): SucursalInfo[] {
  return useReferenceStore.getState().sucursales.map((b) => ({
    id: b.id,
    nombre: b.name,
    ciudad: b.cityName,
    ciudadId: b.cityId,
    direccion: b.address,
    telefono: b.phone ?? "",
    horaApertura: (b.openingTime ?? "").slice(0, 5),
    horaCierre: (b.closingTime ?? "").slice(0, 5),
    permiteEfectivo: b.allowsCashPayment,
  }));
}

export function getCiudadesFiltro(): string[] {
  return ["Todas las ciudades", ...getCiudadesData().map((c) => c.nombre)];
}

export function getCiudadesNombres(): string[] {
  return getCiudadesData().map((c) => c.nombre);
}

export function getSucursalesFiltro(): string[] {
  return ["Todas las sucursales", ...getSucursalesData().map((s) => s.nombre)];
}

export function getSucursalesPorCiudad(ciudad: string): string[] {
  return getSucursalesData()
    .filter((s) => s.ciudad === ciudad)
    .map((s) => s.nombre);
}

export function getSucursalPorNombre(nombre?: string | null): SucursalInfo | null {
  if (!nombre) return null;
  const n = nombre.toLowerCase();
  return getSucursalesData().find((s) => s.nombre.toLowerCase() === n) ?? null;
}

export function getCiudadPorSucursal(sucursal: string): string | null {
  return getSucursalPorNombre(sucursal)?.ciudad ?? null;
}

export function getDireccionSucursal(sucursal: string): string | null {
  return getSucursalPorNombre(sucursal)?.direccion ?? null;
}

export interface HorarioSucursal {
  horaApertura: string;
  horaCierre: string;
  textoHorario: string;
}

function formatoHora12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const sufijo = h >= 12 ? "p. m." : "a. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${sufijo}`;
}

// Horario real de la sucursal segun la API (openingTime/closingTime).
export function getHorarioSucursal(sucursalNombre?: string | null): HorarioSucursal {
  const sucursal = getSucursalPorNombre(sucursalNombre);
  if (!sucursal || !sucursal.horaApertura || !sucursal.horaCierre) {
    return { horaApertura: "00:00", horaCierre: "23:59", textoHorario: "" };
  }
  return {
    horaApertura: sucursal.horaApertura,
    horaCierre: sucursal.horaCierre,
    textoHorario: `${formatoHora12(sucursal.horaApertura)} – ${formatoHora12(sucursal.horaCierre)}`,
  };
}

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

// El backend valida solapamientos al crear la reserva; no hay endpoint publico
// de disponibilidad por vehiculo, por eso no se simula nada en el cliente.
export function getDisponibilidadVehiculo(_vehiculoId: number): DisponibilidadVehiculo {
  return { ocupados: [], horasOcupadas: {} };
}
