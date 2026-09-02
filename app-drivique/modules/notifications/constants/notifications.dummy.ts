/**
 * notifications.dummy.ts
 * Fuente de datos dummy para la pantalla de Notificaciones.
 */

export interface CouponDummy {
  id: string;
  codigo: string;
  descuentoTexto: string;
  porcentaje?: number;
  descuentoPorcentaje?: number;
  valorFijo?: number;
  descuentoFijo?: number;
  regla?: string;
  reglas?: {
    soloPrimeraReserva?: boolean;
    minimoDias?: number;
    minimoValor?: number;
    categoriasValidas?: string[];
    metodosPagoValidos?: string[];
  };
  minimoValor?: number;
  tituloPremio: string;
  recompensaDetalle: string;
  categoria?: string;
  vehicleCategoryFilter?: string;
  agotandose?: boolean;
  condicionesDetalladas?: string;
  fechaOtorgado?: string;
  fechaExpiracion?: string;
  expiracion?: string;
}

export interface VehiculoPromoDummy {
  id: string;
  vehiculoId: number;
  titulo: string;
  descripcion: string;
  descuentoBadge?: string;
  fechaPublicacion: string;
  expiracion?: string;
}

export const CUPONES_DUMMY: CouponDummy[] = [
  {
    id: 'c1',
    codigo: 'C3P9X1',
    descuentoTexto: '18% OFF',
    porcentaje: 18,
    regla: 'Min $500.000',
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
    regla: 'Min $150.000',
    minimoValor: 150000,
    tituloPremio: 'promoCoupons.c2Title',
    recompensaDetalle: 'promoCoupons.c2Desc',
    categoria: 'Económicos',
    vehicleCategoryFilter: 'Economico',
    agotandose: false,
    condicionesDetalladas: 'promoCoupons.c2Terms',
    fechaOtorgado: '2026-08-09T15:30:00Z',
  },
  {
    id: 'c3',
    codigo: 'O2T9N4',
    descuentoTexto: '10% OFF',
    porcentaje: 10,
    regla: 'Sin mínimo',
    minimoValor: 0,
    tituloPremio: 'promoCoupons.c3Title',
    recompensaDetalle: 'promoCoupons.c3Desc',
    categoria: 'Sedán & Hatchback',
    vehicleCategoryFilter: 'Sedan',
    agotandose: false,
    condicionesDetalladas: 'promoCoupons.c3Terms',
    fechaOtorgado: '2026-08-11T07:00:00Z',
    expiracion: '2026-10-31T23:59:59Z',
  },
  {
    id: 'c4',
    codigo: 'V1P50X',
    descuentoTexto: '-$50.000',
    valorFijo: 50000,
    regla: 'Min $200.000',
    minimoValor: 200000,
    tituloPremio: 'promoCoupons.c4Title',
    recompensaDetalle: 'promoCoupons.c4Desc',
    categoria: 'Cualquier categoría',
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
    descuentoBadge: '10% OFF',
    fechaPublicacion: '2026-09-01T08:00:00Z',
    expiracion: '2026-09-30T23:59:59Z',
  },
  {
    id: 'vp-2',
    vehiculoId: 2,
    titulo: 'promoCoupons.vp2Title',
    descripcion: 'promoCoupons.vp2Desc',
    descuentoBadge: '20% OFF',
    fechaPublicacion: '2026-09-01T06:00:00Z',
    expiracion: '2026-09-15T23:59:59Z',
  },
  {
    id: 'vp-3',
    vehiculoId: 3,
    titulo: 'promoCoupons.vp3Title',
    descripcion: 'promoCoupons.vp3Desc',
    descuentoBadge: '15% OFF',
    fechaPublicacion: '2026-09-01T12:00:00Z',
    expiracion: '2026-10-31T23:59:59Z',
  },
];
