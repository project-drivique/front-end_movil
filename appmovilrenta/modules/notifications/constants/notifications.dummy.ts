/**
 * notifications.dummy.ts
 * Fuente de datos dummy para la pantalla de Notificaciones.
 */

export interface CouponDummy {
  id: string;
  codigo: string;
  descuentoTexto: string;
  porcentaje?: number;
  valorFijo?: number;
  regla: string;
  minimoValor: number;
  tituloPremio: string;
  recompensaDetalle: string;
  categoria: string;
  vehicleCategoryFilter: string;
  agotandose: boolean;
  condicionesDetalladas: string;
  fechaOtorgado: string;
  expiracion?: string;
}

export interface VehiculoPromoDummy {
  id: string;
  vehiculoId: number;
  titulo: string;
  descripcion: string;
  fechaPublicacion: string;
  expiracion?: string;
}

export const CUPONES_DUMMY: CouponDummy[] = [
  {
    id: 'c1',
    codigo: 'COMPLETADAS3',
    descuentoTexto: '19% OFF',
    porcentaje: 19,
    regla: 'Reserva minima',
    minimoValor: 500000,
    tituloPremio: 'Primeras 3 reservas',
    recompensaDetalle: 'Ganaste este cupon especial por haber completado tus primeras 3 reservas en la plataforma.',
    categoria: 'Premium & SUVs',
    vehicleCategoryFilter: 'SUV',
    agotandose: true,
    condicionesDetalladas: 'Valido para vehiculos SUV y Premium. Requiere reserva minima de 500.000 COP. Vence en 30 dias.',
    fechaOtorgado: '2026-08-10T09:00:00Z',
    expiracion: '2026-09-10T23:59:59Z',
  },
  {
    id: 'c2',
    codigo: 'FIDELIDAD15',
    descuentoTexto: '15% OFF',
    porcentaje: 15,
    regla: 'Reserva minima',
    minimoValor: 150000,
    tituloPremio: 'Recompensa de Fidelidad',
    recompensaDetalle: 'Otorgado a nuestros clientes mas fieles por su continuo soporte y confianza en Drivique.',
    categoria: 'Economicos',
    vehicleCategoryFilter: 'Economico',
    agotandose: false,
    condicionesDetalladas: 'Valido para vehiculos Economico. Requiere minimo 150.000 COP. No acumulable con otras promociones.',
    fechaOtorgado: '2026-08-09T15:30:00Z',
  },
  {
    id: 'c3',
    codigo: 'OCTUBRENUEVO',
    descuentoTexto: '15% OFF',
    porcentaje: 15,
    regla: 'Sin reserva minima',
    minimoValor: 0,
    tituloPremio: 'Bienvenida de Octubre',
    recompensaDetalle: 'Recompensa otorgada por tu primera interaccion este mes en Drivique.',
    categoria: 'Sedan & Hatchback',
    vehicleCategoryFilter: 'Sedan',
    agotandose: false,
    condicionesDetalladas: 'Aplica en vehiculos Sedan. Sin reserva minima. Valido un solo uso en octubre.',
    fechaOtorgado: '2026-08-11T07:00:00Z',
    expiracion: '2026-10-31T23:59:59Z',
  },
  {
    id: 'c4',
    codigo: 'SUPERVIP50',
    descuentoTexto: 'VALOR_FIJO',
    valorFijo: 50000,
    regla: 'Reserva minima',
    minimoValor: 200000,
    tituloPremio: 'Cliente VIP Drivique',
    recompensaDetalle: 'Ganado por alcanzar el nivel de cliente estrella tras acumular alquileres de larga duracion.',
    categoria: 'Cualquier categoria',
    vehicleCategoryFilter: 'Todos',
    agotandose: false,
    condicionesDetalladas: 'Otorga 50.000 COP de descuento. Requiere reserva minima de 200.000 COP. Valido para cualquier categoria.',
    fechaOtorgado: '2026-08-08T18:45:00Z',
  },
];

export const VEHICULO_PROMOS_DUMMY: VehiculoPromoDummy[] = [
  {
    id: 'vp-1',
    vehiculoId: 1,
    titulo: 'Volvio! No esperes mas',
    descripcion: 'Este vehiculo volvio a estar disponible en tu zona. Reservalo antes de que se agote.',
    fechaPublicacion: '2026-08-11T08:00:00Z',
    expiracion: '2026-08-18T23:59:59Z',
  },
  {
    id: 'vp-2',
    vehiculoId: 2,
    titulo: '28% OFF solo hoy',
    descripcion: 'Oferta del dia especial. Reserva hoy y obtene 28% de descuento sobre la tarifa estandar.',
    fechaPublicacion: '2026-08-11T06:00:00Z',
    expiracion: '2026-08-11T23:59:59Z',
  },
  {
    id: 'vp-3',
    vehiculoId: 3,
    titulo: 'Fin de semana sin precio igual',
    descripcion: 'Alquila este vehiculo premium de viernes a domingo y paga solo 2 dias.',
    fechaPublicacion: '2026-08-10T12:00:00Z',
    expiracion: '2026-08-17T23:59:59Z',
  },
];
