// modules/catalogo/types/catalogo.types.ts

export interface Tarifa {
  km?: number;
  precio: number;
  excedente?: number;
}

export interface Seguro {
  nombre: string;
  precio: number;
}

export interface ServicioExtra {
  nombre: string;
  precio: number;
}

export interface Comentario {
  autor: string;
  calificacion: number;
  texto: string;
  fecha: string;
}

export type MotivoNoDisponible = "reservado" | "mantenimiento";

export interface FechaOcupada {
  fecha: string; // "YYYY-MM-DD"
  motivo: MotivoNoDisponible;
}

export interface HoraOcupada {
  hora: string; // "HH:mm"
  motivo: MotivoNoDisponible;
}

// Forma "calculada" de disponibilidad — la siguen usando CalendarioRango
// y FormFechasLugar, pero ahora se construye a partir de RESERVAS_MOCK
// (ver catalogo.constants.ts -> getDisponibilidadVehiculo) en vez de
// venir embebida en el vehículo.
export interface DisponibilidadVehiculo {
  ocupados: FechaOcupada[];
  // Horas bloqueadas por fecha, ej: { "2026-07-20": [{ hora: "09:00", motivo: "reservado" }] }
  horasOcupadas?: Record<string, HoraOcupada[]>;
}

// Reserva simulada tal cual vive en mocks/reservas.json — una fila por
// cada día u hora ocupada, ligada al vehículo por vehiculoId. Si "hora"
// está presente, es un bloqueo de horario específico; si no, es un día
// completo ocupado.
export interface ReservaOcupada {
  vehiculoId: number;
  fecha: string;
  hora?: string;
  motivo: MotivoNoDisponible;
}

export interface Vehiculo {
  id: number;
  nombre: string;
  marca: string;
  modelo: string;
  categoria: string;
  transmision: string;
  combustible: string;
  precio: number;
  calificacion: number;
  disponible: boolean;
  destacado?: boolean;
  puertas?: number;
  pasajeros?: number;
  maletero?: number;
  cilindraje?: string;
  color?: string;
  año?: number;
  placa?: string;
  sucursal?: string;
  descripcion?: string;
  aireAcondicionado?: boolean;
  vidriosElectricos?: boolean;
  cierreCentralizado?: boolean;
  bluetooth?: boolean;
  camaraReversa?: boolean;
  sensoresParqueo?: boolean;
  usb?: boolean;
  pantallaTactil?: boolean;
  tarifas?: {
    kmLimitado?: Tarifa;
    kmIlimitado?: Tarifa;
  };
  seguros?: Seguro[];
  servicios?: ServicioExtra[];
  comentarios?: Comentario[];
  imagenes?: string[];
  imagen?: string;
  foto?: string;
}

export interface FiltrosCatalogoState {
  categoria: string;
  precioMin: string;
  precioMax: string;
  transmision: string;
  combustible: string;
  ciudad: string;
  sucursal: string;
  orden: string;
  busqueda: string;
}

export interface BusquedaForm {
  lugarRecogida: string;
  lugarDevolucion: string;
  fechaInicio: string;
  fechaFin: string;
  mismoLugar: boolean;
}