import { apiClient } from "@/services/http/apiClient";
import { useReferenceStore } from "@/store/referenceStore";
import { Vehiculo } from "../types/catalog.types";

export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function planesDesdeApi() {
  const { coberturas, planesKm, servicios } = useReferenceStore.getState();
  // Misma selección que la web: el primer plan con km incluidos es el "limitado"; el que no tiene límite (o se llama
  // "unlimited/ilimitado") es el "ilimitado". El orden es el que entrega el servidor.
  const limitado = planesKm.find((p) => p.includedKm !== null && p.includedKm !== undefined);
  const ilimitado = planesKm.find(
    (p) => p.includedKm === null || p.includedKm === undefined || /unlimited|ilimitado/i.test(p.name || ""),
  );

  return {
    tarifas: {
      kmLimitado: limitado
        ? {
            id: limitado.id,
            nombre: limitado.name,
            km: Number(limitado.includedKm),
            precio: Number(limitado.dailyRate),
            excedente: Number(limitado.extraKmRate),
          }
        : undefined,
      kmIlimitado: ilimitado
        ? {
            id: ilimitado.id,
            nombre: ilimitado.name,
            precio: Number(ilimitado.dailyRate),
          }
        : undefined,
    },
    seguros: coberturas.map((c) => ({
      id: c.id,
      nombre: c.name,
      precio: Number(c.dailyRate),
      descripcion: c.description,
    })),
    servicios: servicios.map((s) => ({
      id: s.id,
      nombre: s.name,
      precio: Number(s.dailyRate),
    })),
  };
}

function mapVehicle(v: any): Vehiculo {
  const mainImage: string = v.mainImageUrl || "";
  const planes = planesDesdeApi();

  return {
    id: hashCode(String(v.id)),
    uuid: String(v.id),
    sucursalId: v.branchId,
    categoriaId: v.categoryId,
    ciudad: v.cityName,
    nombre: [v.brandName, v.model].filter(Boolean).join(" "),
    marca: v.brandName || "",
    modelo: v.model || "",
    categoria: v.categoryName || "",
    transmision: v.transmissionName || v.transmissionCode || "",
    combustible: v.fuelTypeName || v.fuelTypeCode || "",
    precio: Number(v.dailyRate ?? 0),
    calificacion: Number(v.averageRating ?? 0),
    disponible: Boolean(v.allowsReservation),
    destacado: Boolean(v.isFeatured),
    puertas: v.doorsCount ?? undefined,
    pasajeros: v.passengerCapacity ?? undefined,
    maletero: v.trunkCapacityLiters ?? undefined,
    color: v.color || undefined,
    año: v.year,
    placa: v.plate || "",
    sucursal: v.branchName || "",
    descripcion: "",
    imagen: mainImage,
    imagenes: Array.isArray(v.imageUrls) && v.imageUrls.length ? v.imageUrls : (mainImage ? [mainImage] : []),
    tarifas: planes.tarifas,
    seguros: planes.seguros,
    servicios: planes.servicios,
    comentarios: [],
  };
}

function publicarOpciones(lista: Vehiculo[]) {
  const unicos = (campo: "categoria" | "transmision" | "combustible") =>
    Array.from(new Set(lista.map((v) => v[campo]).filter(Boolean))).sort();
  useReferenceStore.getState().setOpcionesVehiculo({
    categorias: unicos("categoria"),
    transmisiones: unicos("transmision"),
    combustibles: unicos("combustible"),
  });
}

async function asegurarReferencias() {
  await useReferenceStore.getState().cargarPublicas();
}

export const catalogoService = {
  getVehiculos: async (filtros?: Record<string, any>): Promise<Vehiculo[]> => {
    await asegurarReferencias();
    const { data } = await apiClient.get("/vehicles/search", {
      params: { size: 100, ...filtros },
    });
    const list = data?.content ?? data;
    const mapped = Array.isArray(list) ? list.filter((v: any) => v.isActive !== false).map(mapVehicle) : [];
    publicarOpciones(mapped);
    return mapped;
  },

  getVehiculoPorId: async (id: number | string): Promise<Vehiculo | null> => {
    await asegurarReferencias();
    const isUuid = /^[0-9a-f-]{36}$/i.test(String(id));
    if (isUuid) {
      const { data } = await apiClient.get(`/vehicles/${id}`);
      return data ? mapVehicle(data) : null;
    }
    const lista = await catalogoService.getVehiculos();
    return lista.find((v) => String(v.id) === String(id)) ?? null;
  },

  getVehiculosDestacados: async (): Promise<Vehiculo[]> => {
    await asegurarReferencias();
    const { data } = await apiClient.get("/vehicles/featured");
    const list = data?.content ?? data;
    return Array.isArray(list) ? list.map(mapVehicle) : [];
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
