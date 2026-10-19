import { useEffect, useState } from "react";
import { apiClient } from "@/services/http/apiClient";

type MotivoOcupado = "reservado" | "mantenimiento";

const pad = (n: number) => String(n).padStart(2, "0");
const aISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Días ocupados de un vehículo según el servidor (GET /vehicles/{id}/occupied-dates), igual que la web:
 * cada rango reservado bloquea todos sus días, del retiro a la devolución inclusive.
 */
export function useFechasOcupadas(vehiculoUuid?: string | null) {
  const [ocupados, setOcupados] = useState<Map<string, MotivoOcupado>>(new Map());

  useEffect(() => {
    if (!vehiculoUuid) {
      setOcupados(new Map());
      return undefined;
    }
    let activo = true;
    apiClient
      .get<{ fechaInicio: string; fechaFin: string }[]>(`/vehicles/${vehiculoUuid}/occupied-dates`)
      .then(({ data }) => {
        if (!activo) return;
        const mapa = new Map<string, MotivoOcupado>();
        (Array.isArray(data) ? data : []).forEach((r) => {
          if (!r?.fechaInicio || !r?.fechaFin) return;
          const inicio = new Date(`${r.fechaInicio}T00:00:00`);
          const fin = new Date(`${r.fechaFin}T00:00:00`);
          if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime()) || inicio > fin) return;
          for (const d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
            mapa.set(aISO(d), "reservado");
          }
        });
        setOcupados(mapa);
      })
      .catch(() => activo && setOcupados(new Map()));
    return () => {
      activo = false;
    };
  }, [vehiculoUuid]);

  return ocupados;
}
