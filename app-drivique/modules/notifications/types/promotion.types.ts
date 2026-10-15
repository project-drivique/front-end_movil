export interface CuponPromocion {
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

export interface PromocionVehiculo {
  id: string;
  vehiculoId: number;
  titulo: string;
  descripcion: string;
  descuentoBadge?: string;
  fechaPublicacion: string;
  expiracion?: string;
}

