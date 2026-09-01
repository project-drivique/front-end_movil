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
    codigo: 'C3P9X1',
    descuentoTexto: '19% OFF',
    porcentaje: 19,
    regla: 'Reserva minima',
    minimoValor: 500000,
    tituloPremio: 'promoCoupons.c1Title',
    recompensaDetalle: 'promoCoupons.c1Desc',
    categoria: 'Premium & SUVs',
    vehicleCategoryFilter: 'SUV',
    agotandose: true,
    condicionesDetalladas: 'promoCoupons.c1Terms',
    fechaOtorgado: '2026-08-10T09:00:00Z',
    expiracion: '2026-09-10T23:59:59Z',
  },
  {
    id: 'c2',
    codigo: 'F1D8L5',
    descuentoTexto: '15% OFF',
    porcentaje: 15,
    regla: 'Reserva minima',
    minimoValor: 150000,
    tituloPremio: 'promoCoupons.c2Title',
    recompensaDetalle: 'promoCoupons.c2Desc',
    categoria: 'Economicos',
    vehicleCategoryFilter: 'Economico',
    agotandose: false,
    condicionesDetalladas: 'promoCoupons.c2Terms',
    fechaOtorgado: '2026-08-09T15:30:00Z',
  },
  {
    id: 'c3',
    codigo: 'O2T9N4',
    descuentoTexto: '15% OFF',
    porcentaje: 15,
    regla: 'Sin reserva minima',
    minimoValor: 0,
    tituloPremio: 'promoCoupons.c3Title',
    recompensaDetalle: 'promoCoupons.c3Desc',
    categoria: 'Sedan & Hatchback',
    vehicleCategoryFilter: 'Sedan',
    agotandose: false,
    condicionesDetalladas: 'promoCoupons.c3Terms',
    fechaOtorgado: '2026-08-11T07:00:00Z',
    expiracion: '2026-10-31T23:59:59Z',
  },
  {
    id: 'c4',
    codigo: 'V1P50X',
    descuentoTexto: 'VALOR_FIJO',
    valorFijo: 50000,
    regla: 'Reserva minima',
    minimoValor: 200000,
    tituloPremio: 'promoCoupons.c4Title',
    recompensaDetalle: 'promoCoupons.c4Desc',
    categoria: 'Cualquier categoria',
    vehicleCategoryFilter: 'Todos',
    agotandose: false,
    condicionesDetalladas: 'promoCoupons.c4Terms',
    fechaOtorgado: '2026-08-08T18:45:00Z',
  },
];

export const VEHICULO_PROMOS_DUMMY: VehiculoPromoDummy[] = [
  {
    id: 'vp-1',
    vehiculoId: 1,
    titulo: 'promoCoupons.vp1Title',
    descripcion: 'promoCoupons.vp1Desc',
    fechaPublicacion: '2026-08-11T08:00:00Z',
    expiracion: '2026-09-30T23:59:59Z',
  },
  {
    id: 'vp-2',
    vehiculoId: 2,
    titulo: 'promoCoupons.vp2Title',
    descripcion: 'promoCoupons.vp2Desc',
    fechaPublicacion: '2026-08-11T06:00:00Z',
    expiracion: '2026-09-15T23:59:59Z',
  },
  {
    id: 'vp-3',
    vehiculoId: 3,
    titulo: 'promoCoupons.vp3Title',
    descripcion: 'promoCoupons.vp3Desc',
    fechaPublicacion: '2026-08-10T12:00:00Z',
    expiracion: '2026-10-31T23:59:59Z',
  },
];
