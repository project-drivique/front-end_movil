// hooks/useMoneda.ts
import { useEffect } from "react";
import { useMonedaStore } from "@/store/currencyStore";
import { formatCurrency } from "@/utils/currencyUtils";

/**
 * Hook para leer/cambiar la moneda activa (COP/USD) y formatear montos
 * (que siempre están guardados en COP) según esa preferencia.
 */
export function useMoneda() {
  const monedaActual = useMonedaStore((s) => s.monedaActual);
  const tasaUSD = useMonedaStore((s) => s.tasaUSD);
  const cambiarMoneda = useMonedaStore((s) => s.cambiarMoneda);
  const inicializar = useMonedaStore((s) => s.inicializar);

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  const formatPrecio = (montoCOP: number) =>
    formatCurrency(montoCOP, monedaActual, tasaUSD);

  return { monedaActual, cambiarMoneda, tasaUSD, formatPrecio };
}
