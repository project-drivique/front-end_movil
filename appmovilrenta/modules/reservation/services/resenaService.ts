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
  usuarioId: string;
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
    referenciaReserva: string | null | undefined,
    usuarioId: string
  ): Promise<ResenaGuardada | null> => {
    if (!referenciaReserva) return null;
    const todas = await leerTodas();
    const claveUsuario = `${usuarioId}:${referenciaReserva}`;
    if (todas[claveUsuario]) return todas[claveUsuario];

    // Migra una reseña creada con la estructura anterior al usuario actual.
    const anterior = todas[referenciaReserva];
    if (!anterior) return null;
    const migrada = { ...anterior, usuarioId };
    todas[claveUsuario] = migrada;
    delete todas[referenciaReserva];
    await guardarTodas(todas);
    return migrada;
  },

  guardar: async (
    referenciaReserva: string,
    usuarioId: string,
    datos: { calificacion: number; comentario: string }
  ): Promise<ResenaGuardada> => {
    const todas = await leerTodas();
    const resena: ResenaGuardada = {
      referenciaReserva,
      usuarioId,
      calificacion: datos.calificacion,
      comentario: datos.comentario,
      fecha: new Date().toISOString(),
    };
    todas[`${usuarioId}:${referenciaReserva}`] = resena;
    await guardarTodas(todas);
    return resena;
  },
};
