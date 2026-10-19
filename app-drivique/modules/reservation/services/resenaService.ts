import { apiClient } from "@/services/http/apiClient";

export interface ResenaGuardada {
  id?: string;
  referenciaReserva: string;
  usuarioId: string;
  usuarioNombre?: string;
  vehiculoId?: number | string;
  vehiculoNombre?: string;
  calificacion: number;
  comentario: string;
  fotos?: string[];
  fecha: string;
  fechaIso?: string;
}

interface VehicleReviewDto {
  id: string;
  customerName: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

interface ReviewEligibilityDto {
  canReviewVehicle: boolean;
  canReviewBranch: boolean;
  vehicleReview?: VehicleReviewDto | null;
  branchId?: string | null;
  branchName?: string | null;
  branchReview?: VehicleReviewDto | null;
}

export interface ElegibilidadResena {
  puedeVehiculo: boolean;
  puedeSucursal: boolean;
  sucursalId: string | null;
  sucursalNombre: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolverReservaId(referenciaOId: string): Promise<string> {
  const value = String(referenciaOId || "").trim();
  if (!value) throw new Error("La reserva es obligatoria para publicar una reseña.");
  if (UUID_PATTERN.test(value)) return value;

  const { data } = await apiClient.get<{ id: string }>(
    `/reservations/code/${encodeURIComponent(value)}`
  );
  if (!data?.id) throw new Error("No fue posible identificar la reserva.");
  return String(data.id);
}

function mapReview(
  review: VehicleReviewDto,
  referenciaReserva: string,
  usuarioId: string,
  extras: Partial<ResenaGuardada> = {}
): ResenaGuardada {
  const createdAt = review.createdAt || new Date().toISOString();
  return {
    id: review.id,
    referenciaReserva,
    usuarioId,
    usuarioNombre: review.customerName,
    calificacion: Number(review.rating),
    comentario: review.comment || "",
    fotos: [],
    fecha: new Date(createdAt).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    fechaIso: createdAt,
    ...extras,
  };
}

export const resenaService = {
  // Misma consulta que usa la web para decidir qué tarjetas de reseña mostrar (vehículo y/o sucursal)
  obtenerElegibilidad: async (referenciaReserva: string): Promise<ElegibilidadResena> => {
    try {
      const reservationId = await resolverReservaId(referenciaReserva);
      const { data } = await apiClient.get<ReviewEligibilityDto>(
        `/reservations/${reservationId}/review-eligibility`
      );
      return {
        puedeVehiculo: !!data?.canReviewVehicle,
        puedeSucursal: !!data?.canReviewBranch,
        sucursalId: data?.branchId ?? null,
        sucursalNombre: data?.branchName ?? "",
      };
    } catch {
      return { puedeVehiculo: true, puedeSucursal: false, sucursalId: null, sucursalNombre: "" };
    }
  },

  guardarSucursal: async (
    referenciaReserva: string,
    sucursalId: string,
    datos: { calificacion: number; comentario: string }
  ): Promise<void> => {
    const reservationId = await resolverReservaId(referenciaReserva);
    await apiClient.post("/reviews/branches", {
      branchId: sucursalId,
      review: {
        reservationId,
        rating: datos.calificacion,
        comment: datos.comentario.trim() || null,
      },
    });
  },

  obtenerPorReserva: async (
    referenciaReserva: string | null | undefined,
    usuarioId: string
  ): Promise<ResenaGuardada | null> => {
    if (!referenciaReserva) return null;
    try {
      const reservationId = await resolverReservaId(referenciaReserva);
      const { data } = await apiClient.get<ReviewEligibilityDto>(
        `/reservations/${reservationId}/review-eligibility`
      );
      return data?.vehicleReview
        ? mapReview(data.vehicleReview, referenciaReserva, usuarioId)
        : null;
    } catch (error) {
      console.error("[resenaService] Error consultando la reseña", error);
      return null;
    }
  },

  obtenerPorVehiculo: async (): Promise<ResenaGuardada[]> => [],

  guardar: async (
    referenciaReserva: string,
    usuarioId: string,
    datos: {
      calificacion: number;
      comentario: string;
      fotos?: string[];
      vehiculoId?: number | string;
      vehiculoNombre?: string;
      usuarioNombre?: string;
    }
  ): Promise<ResenaGuardada> => {
    const reservationId = await resolverReservaId(referenciaReserva);
    const { data: eligibility } = await apiClient.get<ReviewEligibilityDto>(
      `/reservations/${reservationId}/review-eligibility`
    );

    if (!eligibility.canReviewVehicle) {
      if (eligibility.vehicleReview) {
        return mapReview(eligibility.vehicleReview, referenciaReserva, usuarioId, {
          vehiculoId: datos.vehiculoId,
          vehiculoNombre: datos.vehiculoNombre,
        });
      }
      throw new Error("Solo se puede calificar una reserva finalizada.");
    }

    await apiClient.post("/reviews/vehicles", {
      reservationId,
      rating: datos.calificacion,
      comment: datos.comentario.trim() || null,
    });

    const { data: updated } = await apiClient.get<ReviewEligibilityDto>(
      `/reservations/${reservationId}/review-eligibility`
    );
    if (!updated.vehicleReview) {
      throw new Error("La reseña fue enviada, pero no pudo recuperarse.");
    }
    return mapReview(updated.vehicleReview, referenciaReserva, usuarioId, {
      vehiculoId: datos.vehiculoId,
      vehiculoNombre: datos.vehiculoNombre,
      usuarioNombre: datos.usuarioNombre,
    });
  },
};
