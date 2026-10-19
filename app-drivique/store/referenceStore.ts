import { create } from "zustand";
import { apiClient } from "@/services/http/apiClient";
import { useAuthStore } from "./authStore";

export interface CiudadApi {
  id: string;
  name: string;
  departmentName?: string;
  hasAirport?: boolean;
  hasTerminal?: boolean;
}

export interface SucursalApi {
  id: string;
  name: string;
  address: string;
  cityId: string;
  cityName: string;
  phone?: string;
  openingTime?: string;
  closingTime?: string;
  allowsCashPayment: boolean;
  isActive: boolean;
}

export interface NacionalidadApi {
  id: string;
  name: string;
  isoCode?: string;
}

export interface CoberturaApi {
  id: string;
  name: string;
  dailyRate: number;
  description?: string;
  isActive: boolean;
}

export interface PlanKmApi {
  id: string;
  name: string;
  includedKm: number | null;
  dailyRate: number;
  extraKmRate: number;
  isActive: boolean;
}

export interface ServicioApi {
  id: string;
  name: string;
  dailyRate: number;
  isActive: boolean;
}

interface ReferenceStore {
  ciudades: CiudadApi[];
  sucursales: SucursalApi[];
  nacionalidades: NacionalidadApi[];
  coberturas: CoberturaApi[];
  planesKm: PlanKmApi[];
  servicios: ServicioApi[];
  cargado: boolean;
  opcionesVehiculo: { categorias: string[]; transmisiones: string[]; combustibles: string[] };
  setOpcionesVehiculo: (o: { categorias: string[]; transmisiones: string[]; combustibles: string[] }) => void;
  cargarPublicas: () => Promise<void>;
  cargarNacionalidades: () => Promise<void>;
}

const lista = <T,>(data: unknown): T[] => (Array.isArray(data) ? (data as T[]) : []);

let enCurso: Promise<void> | null = null;

export const useReferenceStore = create<ReferenceStore>()((set, get) => ({
  ciudades: [],
  sucursales: [],
  nacionalidades: [],
  coberturas: [],
  planesKm: [],
  servicios: [],
  cargado: false,
  opcionesVehiculo: { categorias: [], transmisiones: [], combustibles: [] },
  setOpcionesVehiculo: (opcionesVehiculo) => set({ opcionesVehiculo }),

  cargarPublicas: async () => {
    if (get().cargado) return;
    enCurso ??= (async () => {
      try {
        const [c, s, cov, km, srv] = await Promise.all([
          apiClient.get("/cities"),
          apiClient.get("/branches"),
          apiClient.get("/insurance-coverages"),
          apiClient.get("/mileage-plans"),
          apiClient.get("/additional-services"),
        ]);
        set({
          ciudades: lista<CiudadApi>(c.data),
          sucursales: lista<SucursalApi>(s.data).filter((b) => b.isActive !== false),
          coberturas: lista<CoberturaApi>(cov.data)
            .filter((x) => x.isActive)
            .sort((a, b) => Number(a.dailyRate) - Number(b.dailyRate)),
          planesKm: lista<PlanKmApi>(km.data).filter((x) => x.isActive),
          servicios: lista<ServicioApi>(srv.data).filter((x) => x.isActive),
          cargado: true,
        });
      } finally {
        enCurso = null;
      }
    })();
    await enCurso;
  },

  cargarNacionalidades: async () => {
    if (get().nacionalidades.length > 0) return;
    try {
      const { data } = await apiClient.get("/nationalities");
      set({ nacionalidades: lista<NacionalidadApi>(data) });
    } catch {
      set({ nacionalidades: [] });
    }
  },
}));
