/**
 * notifications.dummy.ts
 * HU-INT-17: Se eliminan notificaciones, promociones y cupones dummy de Web y App.
 * Los datos ahora se sincronizan en vivo desde los endpoints del Backend.
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
    vehiculoId?: number;
    categoriasValidas?: string[];
    metodosPagoValidos?: string[];
    descuentoFijo?: number;
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

// ─── HU-INT-17: Eliminación de cupones y promociones dummy estáticas ───
export const CUPONES_DUMMY: CouponDummy[] = [];

export const VEHICULO_PROMOS_DUMMY: VehiculoPromoDummy[] = [];
