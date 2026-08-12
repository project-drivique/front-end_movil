// modules/reservation/services/resenaService.ts
//
// Servicio temporal para simular la calificación y comentario que el
// usuario deja sobre el vehículo al finalizar su reserva — mismo patrón
// que reservaPersistService/contractService (AsyncStorage en vez de un
// backend real).
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "drivique_resenas";

export interface ResenaGuardada {
  referenciaReserva: string;
  calificacion: number; // 1 a 5
  comentario: string;
  fecha: string;
}

async function leerTodas(): Promise<Record<string, ResenaGuardada>> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("[resenaService] Error leyendo reseñas guardadas", error);
    return {};
  }
}

async function guardarTodas(data: Record<string, ResenaGuardada>) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const resenaService = {
  obtenerPorReserva: async (
    referenciaReserva: string | null | undefined
  ): Promise<ResenaGuardada | null> => {
    if (!referenciaReserva) return null;
    const todas = await leerTodas();
    return todas[referenciaReserva] || null;
  },

  guardar: async (
    referenciaReserva: string,
    datos: { calificacion: number; comentario: string }
  ): Promise<ResenaGuardada> => {
    const todas = await leerTodas();
    const resena: ResenaGuardada = {
      referenciaReserva,
      calificacion: datos.calificacion,
      comentario: datos.comentario,
      fecha: new Date().toISOString(),
    };
    todas[referenciaReserva] = resena;
    await guardarTodas(todas);
    return resena;
  },
};
