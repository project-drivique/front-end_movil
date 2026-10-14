import { apiClient } from "@/services/http/apiClient";
import { VEHICULOS_MOCK } from "../constants/catalog.constants";
import { Vehiculo } from "../types/catalog.types";

function mapVehicle(v: any): Vehiculo {
  const mainImage = v.mainImageUrl || v.imagen || v.foto || "";
  const images = Array.isArray(v.imagenes) && v.imagenes.length > 0
    ? v.imagenes
    : (mainImage ? [
        mainImage,
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
      ] : []);
  const numId = typeof v.id === "number" ? v.id : (v.legacyId || Math.abs(hashCode(String(v.id))));

  return {
    id: numId,
    uuid: String(v.id),
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
    maletero: v.maletero || v.trunkCapacityLiters || 2,
    año: v.año || v.year || 2024,
    placa: v.placa || v.plate || "",
    sucursal: v.sucursal || v.branchName || "",
    descripcion: v.descripcion || v.description || "",
    imagen: mainImage,
    imagenes: images,
    tarifas: v.tarifas || {
      kmLimitado: { km: 200, precio: Number(v.precio ?? v.dailyRate ?? 0), excedente: 800 },
      kmIlimitado: { precio: Math.round(Number(v.precio ?? v.dailyRate ?? 0) * 1.25) },
    },
    seguros: v.seguros || [
      { nombre: "Protección Obligatoria", precio: 29000 },
      { nombre: "Protección Total", precio: 67000 },
    ],
    servicios: v.servicios || [
      { nombre: "GPS", precio: 15000 },
      { nombre: "Silla bebé", precio: 20000 },
    ],
    comentarios: v.comentarios || [
      { autor: "Carlos M.", calificacion: 5, texto: "Excelente vehículo, muy cómodo y puntual en la entrega.", fecha: "2026-08-10" },
      { autor: "Laura P.", calificacion: 4, texto: "Buen servicio, el carro en perfectas condiciones.", fecha: "2026-07-22" },
    ],
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
      // Fallback
    }
    try {
      const lista = await catalogoService.getVehiculos();
      const encontrado = lista.find((v) => String(v.id) === String(id) || (v as any).uuid === String(id));
      if (encontrado) return encontrado;
    } catch {
      // Ignorar error
    }
    return VEHICULOS_MOCK.find((v) => String(v.id) === String(id)) ?? null;
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

