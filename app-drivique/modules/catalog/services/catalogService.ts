import { VEHICULOS_MOCK } from "../constants/catalog.constants";
import { Vehiculo } from "../types/catalog.types";

export const catalogoService = {
  getVehiculos: async (): Promise<Vehiculo[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return VEHICULOS_MOCK;
  },

  getVehiculoPorId: async (id: number): Promise<Vehiculo | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return VEHICULOS_MOCK.find((v) => v.id === id) ?? null;
  },
};
