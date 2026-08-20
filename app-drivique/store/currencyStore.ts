// store/monedaStore.ts
//
// Preferencia de moneda del usuario (COP/USD) + tasa de cambio actual.
// Sigue el mismo patrón que modules/i18n/hooks/useIdioma.ts: zustand +
// persist en AsyncStorage para recordar la preferencia entre sesiones.
//
// La tasa (tasaUSD) NO se persiste: se pide siempre fresca a
// exchangeRateService, que a su vez tiene su propio caché con TTL.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  inicializarTasa,
  obtenerTasaActual,
  suscribirseATasa,
  TASA_RESPALDO,
} from "@/services/exchangeRateService";
import { Moneda } from "@/utils/currencyUtils";

interface MonedaStore {
  monedaActual: Moneda;
  tasaUSD: number;
  cambiarMoneda: (moneda: Moneda) => void;
  inicializar: () => void;
}

// Bandera a nivel de módulo para no suscribirnos más de una vez al
// pub/sub del servicio, sin importar cuántos componentes llamen a
// inicializar().
let yaSuscrito = false;

export const useMonedaStore = create<MonedaStore>()(
  persist(
    (set) => ({
      monedaActual: "COP",
      tasaUSD: obtenerTasaActual() || TASA_RESPALDO,

      cambiarMoneda: (moneda: Moneda) => {
        set({ monedaActual: moneda });
      },

      inicializar: () => {
        if (!yaSuscrito) {
          yaSuscrito = true;
          suscribirseATasa((tasa) => set({ tasaUSD: tasa }));
        }
        // Dispara la lectura de caché / red; el pub/sub anterior ya
        // recibe el resultado cuando esté listo.
        inicializarTasa();
      },
    }),
    {
      name: "moneda-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Solo persistimos la preferencia del usuario, no la tasa (esa
      // siempre se vuelve a pedir fresca al servicio).
      partialize: (state) => ({ monedaActual: state.monedaActual }),
    }
  )
);

// Dispara la carga de la tasa real (open.er-api.com → frankfurter.app →
// exchangerate.host) apenas se importa este store — no hace falta que el
// usuario entre a Perfil para que la tasa esté lista. TASA_RESPALDO (4000)
// solo se usa si las 3 APIs fallan; nunca es el valor por defecto mostrado
// al convertir, es un último recurso.
//
// Guard: en `expo export -p web` (static rendering) este módulo se importa
// dentro de un proceso Node para pre-renderizar las rutas, donde no existe
// `window` ni `localStorage`. Si se llama a inicializar() ahí, AsyncStorage
// intenta usar localStorage y explota con "window is not defined",
// tumbando el build. En un navegador real `window` sí existe, así que la
// inicialización sigue ocurriendo con normalidad ni bien carga la app.
if (typeof window !== "undefined") {
  useMonedaStore.getState().inicializar();
}
