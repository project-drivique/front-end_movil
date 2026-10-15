import { useEffect, useMemo, useState } from "react";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { pricingService, PriceQuoteResponseDTO } from "../services/pricingService";

interface Params {
  vehiculo: Vehiculo;
  fechasLugar: { fechaRetiro: string | null; horaRetiro: string | null; fechaDevolucion: string | null; horaDevolucion: string | null };
  planes: { proteccion: string | null; tipoKilometraje: string | null; serviciosSeleccionados: string[] };
  cuponCodigo?: string | null;
}

/** Cotización oficial del servidor: cargo administrativo, IVA, descuento y total. */
export function useServerQuote({ vehiculo, fechasLugar, planes, cuponCodigo }: Params): PriceQuoteResponseDTO | null {
  const [quote, setQuote] = useState<PriceQuoteResponseDTO | null>(null);

  const solicitud = useMemo(() => {
    const seguro = vehiculo.seguros?.find((s) => s.nombre === planes.proteccion);
    const km = planes.tipoKilometraje === "limitado" ? vehiculo.tarifas?.kmLimitado : planes.tipoKilometraje === "ilimitado" ? vehiculo.tarifas?.kmIlimitado : null;
    if (!vehiculo.uuid || !seguro?.id || !km?.id || !fechasLugar.fechaRetiro || !fechasLugar.fechaDevolucion) return null;
    const desde = new Date(`${fechasLugar.fechaRetiro}T${fechasLugar.horaRetiro || "00:00"}:00`);
    const hasta = new Date(`${fechasLugar.fechaDevolucion}T${fechasLugar.horaDevolucion || "00:00"}:00`);
    if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime())) return null;
    return {
      vehicleId: vehiculo.uuid,
      pickupDate: desde.toISOString(),
      returnDate: hasta.toISOString(),
      insuranceId: seguro.id,
      mileagePlanId: km.id,
      additionalServiceIds: (vehiculo.servicios ?? [])
        .filter((s) => planes.serviciosSeleccionados.includes(s.nombre))
        .map((s) => s.id)
        .filter(Boolean) as string[],
    };
  }, [vehiculo, fechasLugar.fechaRetiro, fechasLugar.horaRetiro, fechasLugar.fechaDevolucion, fechasLugar.horaDevolucion, planes.proteccion, planes.tipoKilometraje, planes.serviciosSeleccionados]);

  useEffect(() => {
    if (!solicitud) {
      setQuote(null);
      return;
    }
    let activo = true;
    pricingService
      .quotePrice({ ...solicitud, couponCode: cuponCodigo ?? null })
      .catch(() => (cuponCodigo ? pricingService.quotePrice(solicitud) : null))
      .then((r) => activo && setQuote(r))
      .catch(() => activo && setQuote(null));
    return () => {
      activo = false;
    };
  }, [solicitud, cuponCodigo]);

  return quote;
}
