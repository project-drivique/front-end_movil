// services/exchangeRateService.ts
//
// Conversión de monedas COP → USD
// -------------------------------
// Servicio propio, sin librerías de terceros (nada de currency.js,
// dinero.js, etc.): usa fetch() nativo contra 3 APIs públicas gratuitas,
// probadas en orden hasta que una responda:
//   1. open.er-api.com
//   2. frankfurter.app
//   3. exchangerate.host
// Todas devuelven la tasa dentro de rates.COP. Si las tres fallan, se usa
// un valor de respaldo fijo (TASA_RESPALDO).
//
// Caché: la tasa se guarda con AsyncStorage (equivalente cross-platform de
// localStorage — en web usa localStorage por debajo) bajo la clave
// rm_tasa_usd_cop + un timestamp, con un TTL de 10 minutos. Así se puede
// pintar un valor instantáneo mientras llega la red.
//
// Patrón: singleton en memoria + pub/sub (suscribirseATasa) para avisarle a
// React cuando llega una tasa nueva, sin necesitar Context.

import AsyncStorage from "@react-native-async-storage/async-storage";

const CLAVE_TASA = "rm_tasa_usd_cop";
const CLAVE_TIMESTAMP = "rm_tasa_usd_cop_timestamp";
const TTL_MS = 10 * 60 * 1000; // 10 minutos

// Valor de respaldo si las 3 APIs fallan (p. ej. sin internet)
export const TASA_RESPALDO = 4000;

type Suscriptor = (tasa: number) => void;

// ── Singleton en memoria ─────────────────────────────────────────────────
let tasaEnMemoria: number = TASA_RESPALDO;
let promesaEnCurso: Promise<number> | null = null;
const suscriptores = new Set<Suscriptor>();

function notificar(tasa: number) {
  tasaEnMemoria = tasa;
  suscriptores.forEach((cb) => cb(tasa));
}

/**
 * Pub/sub: cualquier parte de la app puede suscribirse para enterarse en
 * cuanto llegue una tasa nueva (sin pasar por Context). Devuelve la
 * función para desuscribirse.
 */
export function suscribirseATasa(cb: Suscriptor): () => void {
  suscriptores.add(cb);
  cb(tasaEnMemoria);
  return () => {
    suscriptores.delete(cb);
  };
}

export function obtenerTasaActual(): number {
  return tasaEnMemoria;
}

// ── Caché local (AsyncStorage ~ localStorage) ────────────────────────────
async function leerCache(): Promise<{ tasa: number; timestamp: number } | null> {
  try {
    const [tasaGuardada, tsGuardado] = await Promise.all([
      AsyncStorage.getItem(CLAVE_TASA),
      AsyncStorage.getItem(CLAVE_TIMESTAMP),
    ]);
    if (!tasaGuardada || !tsGuardado) return null;
    const tasa = parseFloat(tasaGuardada);
    const timestamp = parseInt(tsGuardado, 10);
    if (!isFinite(tasa) || tasa <= 0 || !isFinite(timestamp)) return null;
    return { tasa, timestamp };
  } catch {
    return null;
  }
}

async function guardarCache(tasa: number): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAVE_TASA, String(tasa));
    await AsyncStorage.setItem(CLAVE_TIMESTAMP, String(Date.now()));
  } catch {
    // Sin acceso a storage (p. ej. modo privado) — seguimos solo en memoria
  }
}

// ── Fuentes de la tasa (fallback en cadena) ──────────────────────────────
// Cada una expone rates.COP de forma distinta, pero todas responden un
// JSON con esa forma general para USD → COP.

async function fetchOpenErApi(): Promise<number> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!res.ok) throw new Error("open.er-api.com respondió con error");
  const data = await res.json();
  const tasa = data?.rates?.COP;
  if (!tasa) throw new Error("open.er-api.com sin dato COP");
  return tasa;
}

async function fetchFrankfurter(): Promise<number> {
  const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=COP");
  if (!res.ok) throw new Error("frankfurter.app respondió con error");
  const data = await res.json();
  const tasa = data?.rates?.COP;
  if (!tasa) throw new Error("frankfurter.app sin dato COP");
  return tasa;
}

async function fetchExchangeRateHost(): Promise<number> {
  const res = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=COP");
  if (!res.ok) throw new Error("exchangerate.host respondió con error");
  const data = await res.json();
  const tasa = data?.rates?.COP;
  if (!tasa) throw new Error("exchangerate.host sin dato COP");
  return tasa;
}

const FUENTES: Array<() => Promise<number>> = [
  fetchOpenErApi,
  fetchFrankfurter,
  fetchExchangeRateHost,
];

async function obtenerTasaDeRed(): Promise<number> {
  for (const fuente of FUENTES) {
    try {
      const tasa = await fuente();
      if (tasa && tasa > 0) return tasa;
    } catch {
      // Probamos la siguiente API de la cadena de fallback
      continue;
    }
  }
  // Las 3 fallaron — usamos el respaldo fijo
  return TASA_RESPALDO;
}

/**
 * Punto de entrada principal. Debe llamarse una vez al montar la app (o el
 * store de moneda). Pinta primero lo que haya en caché (instantáneo) y,
 * si venció el TTL de 10 min, dispara la actualización en segundo plano
 * contra la red, notificando a los suscriptores cuando llegue.
 */
export async function inicializarTasa(): Promise<number> {
  const cache = await leerCache();
  if (cache) {
    notificar(cache.tasa);
    const vigente = Date.now() - cache.timestamp < TTL_MS;
    if (vigente) return cache.tasa;
  }

  // Evita disparar múltiples requests en paralelo si varias pantallas
  // llaman a inicializarTasa() casi al mismo tiempo.
  if (promesaEnCurso) return promesaEnCurso;

  promesaEnCurso = (async () => {
    const tasa = await obtenerTasaDeRed();
    notificar(tasa);
    await guardarCache(tasa);
    promesaEnCurso = null;
    return tasa;
  })();

  return promesaEnCurso;
}
