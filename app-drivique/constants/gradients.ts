// constants/gradients.ts
//
// Gradiente azul de marca — punto único de verdad.
// Antes: "#1E3A8A" / "#2f4ea2" / "#1D4ED8" hardcodeados y repetidos como
// color plano en cada componente (login, registro, catálogo, reserva...).
// Ahora: todo apunta a este archivo. Para cambiar el azul de toda la app,
// se edita solo aquí.

export type GradienteConfig = {
  colors: [string, string, ...string[]];
  start: { x: number; y: number };
  end: { x: number; y: number };
  locations?: [number, number, ...number[]];
};

export const GRADIENTES: Record<string, GradienteConfig> = {
  // Botón principal / CTA (Reservar, Confirmar, Pagar con Wompi, Buscar...) — 90deg
  boton: {
    colors: ["#1e3a8a", "#2563eb"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },

  // Fondo de tarjeta / panel (banners, headers de tarjeta) — 135deg
  panel: {
    colors: ["#1e3a8a", "#2563eb"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Fondo oscuro grande tipo hero (header de login / registro) — 160deg
  heroOscuro: {
    colors: ["#060e2e", "#0c1f5c", "#1e3a8a"],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 0.34, y: 1 },
  },

  // Franja decorativa (contrato / detalle) — 90deg con 3 paradas
  franjaContrato: {
    colors: ["#1e3a8a", "#2563eb", "#93c5fd"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },

  // Éxito (verde, para contraste — confirmaciones)
  exito: {
    colors: ["#15803d", "#16a34a"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
};

// Sombra/resplandor que acompaña a los botones con gradiente
// (equivalente a box-shadow: 0 8px 24px rgba(37,99,235,0.28) en web)
export const SOMBRA_BOTON_GRADIENTE = {
  shadowColor: "#2563eb",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.28,
  shadowRadius: 24,
  elevation: 8,
};
