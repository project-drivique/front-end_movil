// Traduce el actionPath que envia el backend (rutas de la web) a rutas de la app.
export function rutaDesdeActionPath(actionPath?: string | null): string | null {
  if (!actionPath) return null;
  const limpio = actionPath.trim();
  const [ruta, consulta = ""] = limpio.split("?");
  const params = new URLSearchParams(consulta);

  if (ruta.startsWith("/soporte")) {
    const incidencia = params.get("incidencia");
    return incidencia
      ? `/(tabs)/support?incidencia=${encodeURIComponent(incidencia)}`
      : "/(tabs)/support";
  }
  if (ruta.startsWith("/contrato/")) {
    const ref = ruta.split("/")[2];
    return ref ? `/contract-view?ref=${encodeURIComponent(ref)}` : null;
  }
  if (ruta.startsWith("/reservas")) {
    const ref = ruta.split("/")[2] || params.get("ref");
    return ref ? `/payment-response?ref=${encodeURIComponent(ref)}` : "/(tabs)/my-bookings";
  }
  if (ruta.startsWith("/notificaciones")) return "/(tabs)/notifications";
  if (ruta.startsWith("/perfil")) return "/(tabs)/profile";
  return null;
}
