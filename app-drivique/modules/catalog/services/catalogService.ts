import { apiClient } from "@/services/http/apiClient";
import { VEHICULOS_MOCK } from "../constants/catalog.constants";
import { Vehiculo } from "../types/catalog.types";

function mapVehicle(v: any): Vehiculo {
  const mainImage = v.mainImageUrl || v.imagen || v.foto || "";
  return {
    id: typeof v.id === "number" ? v.id : (v.legacyId || Math.abs(hashCode(String(v.id)))),
    nombre: v.nombre || [v.brandName, v.model].filter(Boolean).join(" ") || "Vehículo Drivique",
    marca: v.marca || v.brandName || "",
    modelo: v.modelo || v.model || "",
    categoria: v.categoria || v.categoryName || "General",
    transmision: v.transmision || v.transmissionName || v.transmissionCode || "Automática",
    combustible: v.combustible || v.fuelTypeName || v.fuelTypeCode || "Gasolina",
    precio: Number(v.precio ?? v.dailyRate ?? 0),
    calificacion: Number(v.calificacion ?? v.rating ?? 4.8),
    disponible: v.disponible ?? v.allowsReservation ?? true,
    destacado: v.destacado ?? v.isFeatured ?? false,
    puertas: v.puertas || v.doorsCount || 4,
    pasajeros: v.pasajeros || v.passengerCapacity || 5,
    maletero: v.maletero || 2,
    año: v.año || v.year || 2024,
    sucursal: v.sucursal || v.branchName || "",
    descripcion: v.descripcion || v.description || "",
    imagen: mainImage,
    imagenes: Array.isArray(v.imagenes) && v.imagenes.length > 0 ? v.imagenes : (mainImage ? [mainImage] : []),
  };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const catalogoService = {
  getVehiculos: async (filtros?: Record<string, any>): Promise<Vehiculo[]> => {
    try {
      const { data } = await apiClient.get("/vehicles/search", { params: filtros });
      const list = data.content ?? data.vehiculos ?? data;
      if (Array.isArray(list) && list.length > 0) {
        return list.map(mapVehicle);
      }
    } catch {
      // Fallback a mock si el backend no responde
    }
    return VEHICULOS_MOCK;
  },

  getVehiculoPorId: async (id: number | string): Promise<Vehiculo | null> => {
    try {
      const { data } = await apiClient.get(`/vehicles/${id}`);
      if (data) return mapVehicle(data);
    } catch {
      // Fallback a mock
    }
    return VEHICULOS_MOCK.find((v) => v.id === Number(id)) ?? null;
  },

  getVehiculosDestacados: async (): Promise<Vehiculo[]> => {
    try {
      const { data } = await apiClient.get("/vehicles/featured");
      const list = data.content ?? data.vehiculos ?? data;
      if (Array.isArray(list) && list.length > 0) {
        return list.map(mapVehicle);
      }
    } catch {
      // Fallback a mock
    }
    return VEHICULOS_MOCK.filter((v) => v.destacado);
  },

  getCiudades: async (): Promise<any[]> => {
    const { data } = await apiClient.get("/cities");
    return Array.isArray(data) ? data : [];
  },

  getSedes: async (ciudadId?: string): Promise<any[]> => {
    const url = ciudadId ? `/cities/${ciudadId}/branches` : "/branches";
    const { data } = await apiClient.get(url);
    return Array.isArray(data) ? data : [];
  },

  getCategorias: async (): Promise<any[]> => {
    const { data } = await apiClient.get("/vehicle-categories");
    return Array.isArray(data) ? data : [];
  },
};

