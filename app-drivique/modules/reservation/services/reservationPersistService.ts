// modules/reserva/services/reservaPersistService.ts
//
// Servicio temporal para simular el almacenamiento de reservas en el
// dispositivo (AsyncStorage), igual que la web lo hace con localStorage
// (src/services/reservaService.js). Esto debería migrarse a un backend.
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "drivique_reservas";

// Tiempo que tiene el usuario para acercarse a la sucursal a pagar en
// efectivo antes de que la reserva se cancele automáticamente.
export const HORAS_LIMITE_PAGO_EFECTIVO = 72;
export type EstadoReserva =
  | "PENDIENTE"
  | "PENDIENTE_EFECTIVO"
  | "PENDIENTE_VALIDACION"
  | "CONFIRMADA"
  | "FINALIZADA"
  | "CANCELADA"
  | "CANCELADA_POR_TIEMPO";

export interface ReservaGuardada {
  referencia: string;
  usuarioId?: string;
  vehiculoId: number | string;
  vehiculoNombre: string;
  estado: EstadoReserva;
  fechaReserva: string;
  metodoPago: "wompi" | "efectivo" | null;
  total: number;
  fechaLimitePago?: string | null;
  horasLimitePago?: number | null;
  paymentId?: string | null;
  paymentMethodType?: string | null;
  metodoPagoDetalle?: string | null;
  convenioWompi?: string | null;
  referenciaWompi?: string | null;
  wompiExtra?: Record<string, any> | null;
  [extra: string]: unknown;
}

export type GrupoReserva = "pendiente" | "confirmada" | "en_curso" | "finalizada" | "cancelada";

/**
 * Deriva el "grupo" visual de una reserva (el que se usa para agruparlas
 * en Mis Reservas) a partir de su estado real y de las fechas de retiro /
 * devolución.
 * REGLA ESTRICTA: Ninguna reserva puede aparecer "en curso" ni "finalizada"
 * a menos que su estado sea estrictamente CONFIRMADA (pagada y con contrato)
 * o FINALIZADA.
 */
export function calcularGrupoReserva(reserva: ReservaGuardada): GrupoReserva {
  const estado = String(reserva.estado || "").toUpperCase();

  if (estado === "FINALIZADA" || estado === "COMPLETADA") {
    return "finalizada";
  }
  if (estado === "CANCELADA" || estado === "CANCELADA_POR_TIEMPO") {
    return "cancelada";
  }
  
  // Si no está CONFIRMADA (está en PENDIENTE, PENDIENTE_EFECTIVO, PENDIENTE_VALIDACION, etc.),
  // SIEMPRE es pendiente. No puede estar "en curso" bajo ninguna circunstancia.
  if (estado !== "CONFIRMADA") {
    return "pendiente";
  }

  // CONFIRMADA: se distingue entre confirmada / en curso / finalizada
  // comparando la fecha y hora actual contra el rango de la reserva.
  const hoy = new Date();
  const inicio = reserva.fechaRetiro ? new Date(String(reserva.fechaRetiro) + "T00:00:00") : null;
  const fin = reserva.fechaDevolucion ? new Date(String(reserva.fechaDevolucion) + "T23:59:59") : null;

  if (fin && hoy > fin) return "finalizada";
  if (inicio && hoy >= inicio) return "en_curso";
  return "confirmada";
}

/**
 * Calcula el plazo límite de pago de forma inteligente:
 * - Si la reserva es para hoy o en menos de 72h: el plazo es inmediato o antes de la hora de entrega.
 * - Si la reserva es para varios días adelante: tiene hasta 72 horas estándar.
 */
export function calcularLimitePago(
  fechaRetiro?: string | null,
  horaRetiro?: string | null
): {
  fechaLimitePago: string;
  horasLimitePago: number;
} {
  const ahora = Date.now();
  const maxHoras = HORAS_LIMITE_PAGO_EFECTIVO; // 72 horas por defecto

  if (fechaRetiro) {
    const hora = horaRetiro && String(horaRetiro).includes(":") ? String(horaRetiro) : "10:00";
    const cleanFecha = String(fechaRetiro).split("T")[0];
    const fechaHoraRetiro = new Date(`${cleanFecha}T${hora}:00`).getTime();

    if (!isNaN(fechaHoraRetiro)) {
      const horasHastaRetiro = (fechaHoraRetiro - ahora) / (1000 * 60 * 60);

      // Si la recogida es para hoy o inmediata (menos de 2 horas)
      if (horasHastaRetiro <= 2) {
        return {
          fechaLimitePago: new Date(ahora + 2 * 60 * 60 * 1000).toISOString(),
          horasLimitePago: 2,
        };
      }
      // Si la recogida es antes de las 72 horas estándar
      if (horasHastaRetiro < maxHoras) {
        return {
          fechaLimitePago: new Date(fechaHoraRetiro).toISOString(),
          horasLimitePago: Math.max(1, Math.floor(horasHastaRetiro)),
        };
      }
    }
  }

  return {
    fechaLimitePago: new Date(ahora + maxHoras * 60 * 60 * 1000).toISOString(),
    horasLimitePago: maxHoras,
  };
}

function calcularFechaLimitePago(): string {
  return new Date(
    Date.now() + HORAS_LIMITE_PAGO_EFECTIVO * 60 * 60 * 1000
  ).toISOString();
}

/**
 * Cancela automáticamente las reservas pendientes cuyo plazo límite ya venció.
 */
function vencerReservasEfectivo(reservas: ReservaGuardada[]): {
  actualizadas: ReservaGuardada[];
  cambiaron: boolean;
} {
  const ahora = Date.now();
  let cambiaron = false;

  const actualizadas = reservas.map((r) => {
    if (
      r.estado === "PENDIENTE_EFECTIVO" ||
      r.estado === "PENDIENTE" ||
      r.estado === "PENDIENTE_VALIDACION"
    ) {
      let limiteMs = r.fechaLimitePago ? new Date(r.fechaLimitePago).getTime() : 0;
      if (!limiteMs && r.fechaReserva) {
        const fechaRetiro = r.fechaRetiro || (r.fechasLugarSnapshot as any)?.fechaRetiro;
        const horaRetiro = r.horaRetiro || (r.fechasLugarSnapshot as any)?.horaRetiro;
        limiteMs = new Date(calcularLimitePago(fechaRetiro, horaRetiro).fechaLimitePago).getTime();
      }
      if (limiteMs && limiteMs < ahora) {
        cambiaron = true;
        return {
          ...r,
          estado: "CANCELADA_POR_TIEMPO" as EstadoReserva,
          motivoCancelacion: "Cancelada automáticamente por superar el plazo límite de pago.",
        };
      }
    }
    return r;
  });

  return { actualizadas, cambiaron };
}

const RESERVA_FINALIZADA_DEMO: ReservaGuardada = {
  referencia: "DRV-98421-FINALIZADA",
  vehiculoId: 2,
  vehiculoNombre: "Mazda CX-5 2024",
  metodoPago: "wompi",
  metodoPagoDetalle: "Tarjeta Visa ••• 4242",
  paymentId: "tx_demo_wompi_finalizada",
  total: 540000,
  fechaReserva: "2026-08-10T09:00:00Z",
  fechaRetiro: "2026-08-12",
  fechaDevolucion: "2026-08-15",
  horaRetiro: "10:00",
  horaDevolucion: "18:00",
  lugarRetiro: "Alamo Bogotá - Aeropuerto",
  lugarDevolucion: "Alamo Bogotá - Aeropuerto",
  estado: "FINALIZADA",
  proteccion: "Total",
  tipoKilometraje: "ilimitado",
  vehiculoSnapshot: {
    id: 2,
    nombre: "Mazda CX-5 2024",
    marca: "Mazda",
    modelo: "CX-5",
    categoria: "SUV",
    transmision: "Automático",
    combustible: "Gasolina",
    capacidadPasajeros: 5,
    capacidadMaletas: 4,
    puertas: 5,
    precio: 180000,
    precioDia: 180000,
    imagenes: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"],
    sucursal: "Alamo Bogotá - Aeropuerto",
    año: 2024,
    placa: "DRV-894",
    color: "Gris Titanio",
  } as any,
  datosPersonalesSnapshot: {
    nombreCompleto: "Cliente Drivique",
    tipoDocumento: "CC",
    numeroDocumento: "1075228306",
    correo: "cliente@drivique.com",
    celular: "3001234567",
    nacionalidad: "Colombia",
    terminosAceptados: true,
  },
  fechasLugarSnapshot: {
    fechaRetiro: "2026-08-12",
    fechaDevolucion: "2026-08-15",
    horaRetiro: "10:00",
    horaDevolucion: "18:00",
    lugarRetiro: "Alamo Bogotá - Aeropuerto",
    lugarDevolucion: "Alamo Bogotá - Aeropuerto",
    direccionRetiro: "",
    barrioRetiro: "",
    referenciasRetiro: "",
    direccionDevolucion: "",
    barrioDevolucion: "",
    referenciasDevolucion: "",
    metodoPago: "wompi",
  },
  planesSnapshot: {
    proteccion: "Total",
    tipoKilometraje: "ilimitado",
    serviciosSeleccionados: ["gps", "asientoBebe"],
  },
};

async function leer(): Promise<ReservaGuardada[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    let reservas: ReservaGuardada[] = data ? JSON.parse(data) : [];

    // Asegurar que la reserva demo finalizada siempre esté disponible
    if (!reservas.some((r) => r.referencia === RESERVA_FINALIZADA_DEMO.referencia)) {
      reservas.unshift(RESERVA_FINALIZADA_DEMO);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
    }

    const { actualizadas, cambiaron } = vencerReservasEfectivo(reservas);
    if (cambiaron) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(actualizadas));
    }
    return actualizadas;
  } catch (error) {
    console.error("[reservaPersistService] Error leyendo reservas", error);
    return [RESERVA_FINALIZADA_DEMO];
  }
}

export const reservaPersistService = {
  getReservas: leer,

  getReservasUsuario: async (usuario: {
    id?: string;
    correo?: string;
    numeroDocumento?: string;
  }): Promise<ReservaGuardada[]> => {
    const reservas = await leer();
    const id = usuario.id?.trim();
    const correo = usuario.correo?.trim().toLowerCase();
    const documento = usuario.numeroDocumento?.replace(/\D/g, "");

    return reservas.filter((reserva) => {
      if (reserva.referencia === RESERVA_FINALIZADA_DEMO.referencia) return true;
      if (reserva.usuarioId) return !!id && reserva.usuarioId === id;

      // Compatibilidad con reservas creadas antes de guardar usuarioId.
      const datos = reserva.datosPersonalesSnapshot as
        | { correo?: string; numeroDocumento?: string }
        | undefined;
      const correoReserva = datos?.correo?.trim().toLowerCase();
      const documentoReserva = datos?.numeroDocumento?.replace(/\D/g, "");
      return (
        (!!correo && correoReserva === correo) ||
        (!!documento && documentoReserva === documento)
      );
    });
  },

  /**
   * Guarda una reserva nueva. Si el método de pago es "efectivo", calcula y
   * asigna automáticamente el plazo límite para pagar en sucursal
   * (fechaLimitePago) y deja el estado en PENDIENTE_EFECTIVO.
   */
  guardarReserva: async (
    reserva: Omit<ReservaGuardada, "estado"> & { estado?: EstadoReserva }
  ): Promise<ReservaGuardada> => {
    const reservas = await leer();

    const esEfectivo = reserva.metodoPago === "efectivo";
    // La firma de índice de ReservaGuardada ([extra: string]: unknown) hace
    // que Omit<ReservaGuardada, "estado"> pierda el tipo de las propiedades
    // específicas — es un problema de inferencia de TS, no de runtime (acá
    // sí están todas, vienen del spread de `reserva`).
    const reservaFinal = {
      ...reserva,
      estado: esEfectivo ? "PENDIENTE_EFECTIVO" : reserva.estado ?? "PENDIENTE",
    } as ReservaGuardada;
    const fechaRetiro = reserva.fechaRetiro || (reserva.fechasLugarSnapshot as any)?.fechaRetiro;
    const horaRetiro = reserva.horaRetiro || (reserva.fechasLugarSnapshot as any)?.horaRetiro;
    const limiteInfo = calcularLimitePago(fechaRetiro, horaRetiro);

    reservaFinal.fechaLimitePago = limiteInfo.fechaLimitePago;
    reservaFinal.horasLimitePago = limiteInfo.horasLimitePago;

    reservas.push(reservaFinal);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
    return reservaFinal;
  },

  obtenerPorReferencia: async (
    referencia: string
  ): Promise<ReservaGuardada | undefined> => {
    if (!referencia) return undefined;
    const reservas = await leer();
    const clean = referencia.trim();
    const base = clean.includes("_") ? clean.split("_")[0] : clean;
    return reservas.find((r) => r.referencia === clean || r.referencia === base);
  },

  actualizarEstado: async (
    referencia: string,
    nuevoEstado: EstadoReserva,
    paymentId?: string | null
  ): Promise<boolean> => {
    if (!referencia) return false;
    const reservas = await leer();
    const clean = referencia.trim();
    const base = clean.includes("_") ? clean.split("_")[0] : clean;
    const index = reservas.findIndex((r) => r.referencia === clean || r.referencia === base);
    if (index !== -1) {
      reservas[index].estado = nuevoEstado;
      if (paymentId) reservas[index].paymentId = paymentId;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
      return true;
    }
    return false;
  },

  actualizarReserva: async (
    referencia: string,
    cambios: Partial<ReservaGuardada>
  ): Promise<boolean> => {
    if (!referencia) return false;
    const reservas = await leer();
    const clean = referencia.trim();
    const base = clean.includes("_") ? clean.split("_")[0] : clean;
    const index = reservas.findIndex((r) => r.referencia === clean || r.referencia === base);
    if (index !== -1) {
      reservas[index] = { ...reservas[index], ...cambios };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
      return true;
    }
    return false;
  },

  cancelarReserva: async (referencia: string): Promise<boolean> => {
    return reservaPersistService.actualizarEstado(referencia, "CANCELADA");
  },

  eliminarReserva: async (referencia: string): Promise<boolean> => {
    if (!referencia) return false;
    const reservas = await leer();
    const clean = referencia.trim();
    const base = clean.includes("_") ? clean.split("_")[0] : clean;
    const index = reservas.findIndex((r) => r.referencia === clean || r.referencia === base);
    if (index !== -1) {
      reservas.splice(index, 1);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
      return true;
    }
    return false;
  },

  limpiarTodas: async (): Promise<void> => {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
