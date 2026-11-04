import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
import { apiClient } from "@/services/http/apiClient";
import { contratoService } from "./contractService";

/**
 * Configuración pública de Wompi (sin llaves de integridad en el cliente).
 */
export const wompiConfig = {
  ambiente: "sandbox" as const,
  currency: "COP" as const,
};

/**
 * Referencia alfanumérica única para la transacción local.
 */
export function generarReferenciaUnica(): string {
  return (
    "RES-" +
    Date.now() +
    "-" +
    Math.random().toString(36).substring(2, 9).toUpperCase()
  );
}

/**
 * Convierte el total en pesos (COP) al entero en centavos que exige Wompi.
 */
export function aCentavos(totalCop: number): number {
  return Math.round(Number(totalCop) * 100);
}

export interface WompiInitiateResponse {
  paymentId: string;
  reference: string;
  amountInCents: number;
  currency: string;
  publicKey: string;
  integritySignature: string;
}

/**
 * Solicita al backend iniciar la transacción Wompi oficial (`POST /v1/payments/wompi/initiate`).
 * El servidor crea la fila PENDING en `billing.payments`, asegura el RentalContract si aplica
 * y calcula la firma de integridad SHA-256 en el servidor.
 */
export async function iniciarPagoWompi({
  contractId,
  reservationReference,
  paymentMethodCode = "CREDIT_CARD",
}: {
  contractId?: string | null;
  reservationReference?: string | null;
  paymentMethodCode?: string;
}): Promise<WompiInitiateResponse> {
  let resolvedContractId = contractId;
  const cleanRef = reservationReference ? String(reservationReference).trim() : "";
  const refFinal = cleanRef.includes("_TX")
    ? cleanRef.split("_TX")[0]
    : (cleanRef.includes("_") ? cleanRef.split("_")[0] : cleanRef);

  if (!resolvedContractId && refFinal) {
    try {
      const contrato = await contratoService.obtenerPorReserva(refFinal);
      if (contrato?.id) resolvedContractId = contrato.id;
    } catch {
      // Si el backend no tiene contrato previo, continuar con referencia
    }
  }

  const payload: any = {
    paymentMethodCode: paymentMethodCode || "CREDIT_CARD",
  };
  if (resolvedContractId) {
    payload.contractId = resolvedContractId;
  }
  if (reservationReference) {
    const clean = String(reservationReference).trim();
    payload.reservationReference = clean.includes("_TX")
      ? clean.split("_TX")[0]
      : (clean.includes("_") ? clean.split("_")[0] : clean);
  }

  const { data } = await apiClient.post<WompiInitiateResponse>("/payments/wompi/initiate", payload);
  return data;
}

interface ConstruirUrlCheckoutParams {
  reference: string;
  contractId?: string | null;
  amountInCents: number;
  redirectUrl?: string;
  paymentMethodCode?: string;
}

export function obtenerDefaultRedirectUrl(): string {
  if (Platform.OS === "web" && typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/payment-response`;
  }
  try {
    const linkingUrl = Linking.createURL("/payment-response");
    if (linkingUrl && (linkingUrl.startsWith("http://") || linkingUrl.startsWith("https://"))) {
      return linkingUrl;
    }
  } catch (err) {
    console.warn("[wompiService] Error creando URL con Linking:", err);
  }
  return "https://drivique.app/payment-response";
}

/**
 * Construye la URL del Web Checkout de Wompi (redirección directa a /p/)
 * obteniendo la firma oficial generada por el backend en `POST /v1/payments/wompi/initiate`.
 */
export async function construirUrlCheckout({
  reference,
  contractId = null,
  amountInCents,
  redirectUrl,
  paymentMethodCode = "CREDIT_CARD",
}: ConstruirUrlCheckoutParams): Promise<string> {
  const checkout = await iniciarPagoWompi({
    contractId,
    reservationReference: reference,
    paymentMethodCode,
  });

  const resolvedPubKey = checkout?.publicKey;
  if (!resolvedPubKey) {
    throw new Error("[Wompi] El servidor no devolvió la llave pública del pago.");
  }
  const resolvedCurrency = checkout?.currency || wompiConfig.currency || "COP";
  const resolvedAmount = checkout?.amountInCents ?? Math.round(Number(amountInCents));
  const resolvedRef = checkout?.reference || reference;
  const resolvedSignature = checkout?.integritySignature;

  if (!resolvedSignature) {
    throw new Error("[Wompi] El servidor no devolvió la firma de integridad del pago.");
  }

  const params = new URLSearchParams({
    "public-key": resolvedPubKey,
    currency: resolvedCurrency,
    "amount-in-cents": String(resolvedAmount),
    reference: resolvedRef,
    "signature:integrity": resolvedSignature,
  });

  let targetRedirect = redirectUrl || obtenerDefaultRedirectUrl();

  if (targetRedirect && typeof targetRedirect === "string" && targetRedirect.trim() !== "") {
    const clean = targetRedirect.trim();
    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      targetRedirect = clean;
    } else {
      targetRedirect = obtenerDefaultRedirectUrl();
    }
  } else {
    targetRedirect = obtenerDefaultRedirectUrl();
  }

  if (targetRedirect.includes("localhost")) {
    targetRedirect = targetRedirect.replace("localhost", "localtest.me");
  }

  const isIpHost = /(?:\d{1,3}\.){3}\d{1,3}/.test(targetRedirect);
  if (!isIpHost) {
    params.set("redirect-url", targetRedirect);
  }

  return `https://checkout.wompi.co/p/?${params.toString()}`;
}

export interface WompiTransactionResponse {
  id: string;
  status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING";
  reference: string;
  amount_in_cents: number;
  currency: string;
  payment_method_type: string;
  payment_method?: {
    type?: string;
    extra?: {
      name?: string;
      brand?: string;
      last_four?: string;
      async_payment_url?: string;
      business_agreement_code?: string;
      payment_reference?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Consulta el estado y los detalles de una transacción en Wompi API
 */
export async function consultarTransaccionWompi(transactionId: string): Promise<WompiTransactionResponse | null> {
  try {
    const res = await fetch(`https://sandbox.wompi.co/v1/transactions/${transactionId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch (error) {
    console.warn("[wompiService] Error consultando transaccion:", error);
    return null;
  }
}

/**
 * Abre el flujo de Web Checkout de Wompi con WebBrowser (Chrome Custom Tabs / Safari).
 */
export async function iniciarFlujoWompi({
  reference,
  contractId,
  amountInCents,
  redirectUrl,
}: {
  reference: string;
  contractId?: string | null;
  amountInCents: number;
  redirectUrl?: string;
}): Promise<{ transactionId?: string | null; reference: string; cancelado?: boolean }> {
  const url = await construirUrlCheckout({
    reference,
    contractId,
    amountInCents,
    redirectUrl,
  });

  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.location.href = url;
    return { reference, transactionId: null };
  }

  const res = await WebBrowser.openAuthSessionAsync(url, redirectUrl);

  let txId: string | null = null;
  if (res.type === "success" && (res as any).url) {
    try {
      const parsed = Linking.parse((res as any).url);
      txId = (parsed.queryParams?.id as string) || null;
      if (!txId) {
        const match = (res as any).url.match(/[?&]id=([^&#]+)/);
        if (match && match[1]) txId = decodeURIComponent(match[1]);
      }
    } catch (e) {
      console.warn("[wompiService] Error parseando retorno de WebBrowser:", e);
    }
  }

  return { transactionId: txId, reference, cancelado: res.type === "cancel" || res.type === "dismiss" };
}
