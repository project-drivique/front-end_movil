// utils/monedaUtils.ts
//
// Los montos internos de la app SIEMPRE están en COP (es como vienen del
// catálogo, reservas, etc.). formatCurrency es el único punto donde se
// decide cómo mostrarlos: si moneda === 'USD', se divide por la tasa del
// día y se formatea con el locale en-US; si es COP, se formatea con
// es-CO, igual que antes.

export type Moneda = "COP" | "USD";

/**
 * Formatea un monto que está guardado en COP, convirtiéndolo a la moneda
 * activa si hace falta.
 *
 * @param amount   Monto en COP (siempre)
 * @param moneda   Moneda en la que se debe mostrar ("COP" | "USD")
 * @param tasaUSD  Cuántos COP vale 1 USD (ej: 4000)
 */
export function formatCurrency(amount: number, moneda: Moneda, tasaUSD: number): string {
  if (moneda === "USD") {
    const tasa = tasaUSD > 0 ? tasaUSD : 1;
    const valorUSD = amount / tasa;
    return valorUSD.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return `$${Math.round(amount).toLocaleString("es-CO")}`;
}
