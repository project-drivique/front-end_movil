import { apiClient } from "@/services/http/apiClient";
import { useReferenceStore } from "@/store/referenceStore";
import { catalogoService } from "@/modules/catalog/services/catalogService";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { DatosFechasLugar, DatosPlanes, Cupon } from "../types/reservation.types";

export type EstadoReserva =
  | "PENDIENTE"
  | "PENDIENTE_EFECTIVO"
  | "PENDIENTE_VALIDACION"
  | "PENDIENTE_HORARIO"
  | "PENDIENTE_FIRMA"
  | "CONFIRMADA"
  | "EN_CURSO"
  | "FINALIZADA"
  | "CANCELADA"
  | "CANCELADA_POR_TIEMPO";

export interface ReservaGuardada {
  id: string;
  referencia: string;
  usuarioId?: string;
  vehiculoId: string;
  vehiculoNombre: string;
  vehiculoPlaca?: string;
  estado: EstadoReserva;
  estadoApi: string;
  fechaReserva: string;
  fechaRetiro: string;
  fechaDevolucion: string;
  horaRetiro: string;
  horaDevolucion: string;
  diasAlquiler: number;
  metodoPago: "wompi" | "efectivo";
  total: number;
  proteccion?: string;
  planKilometraje?: string;
  servicios: { nombre: string; precio: number }[];
  codigoPagoEfectivo?: string | null;
  fechaLimitePago?: string | null;
  sucursalPagoEfectivoId?: string | null;
  vehiculoSnapshot?: Vehiculo;
}

export type GrupoReserva = "pendiente" | "confirmada" | "en_curso" | "finalizada" | "cancelada";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function fechaLocal(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function horaLocal(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function estadoDesdeApi(status: string, esEfectivo: boolean): EstadoReserva {
  switch (status) {
    case "PENDING_PAYMENT":
      return esEfectivo ? "PENDIENTE_EFECTIVO" : "PENDIENTE";
    case "PENDING_DOCUMENT_REVIEW":
      return "PENDIENTE_VALIDACION";
    case "PENDING_SCHEDULE":
      return "PENDIENTE_HORARIO";
    case "PENDING_SIGNATURE":
      return "PENDIENTE_FIRMA";
    case "CONFIRMED":
      return "CONFIRMADA";
    case "IN_PROGRESS":
    case "ACTIVE":
      return "EN_CURSO";
    case "COMPLETED":
      return "FINALIZADA";
    case "CANCELLED_BY_TIMEOUT":
      return "CANCELADA_POR_TIEMPO";
    default:
      return status.startsWith("CANCELLED") ? "CANCELADA" : "PENDIENTE";
  }
}

export function mapReserva(dto: any): ReservaGuardada {
  const esEfectivo = !!dto.cashPaymentBranchId || !!dto.cashPaymentCode;
  return {
    id: dto.id,
    referencia: dto.code,
    usuarioId: dto.customerId,
    vehiculoId: dto.vehicleId,
    vehiculoNombre: dto.vehicleModel,
    vehiculoPlaca: dto.vehiclePlate,
    estado: estadoDesdeApi(String(dto.status), esEfectivo),
    estadoApi: String(dto.status),
    fechaReserva: dto.createdAt,
    fechaRetiro: fechaLocal(dto.pickupDate),
    fechaDevolucion: fechaLocal(dto.returnDate),
    horaRetiro: horaLocal(dto.pickupDate),
    horaDevolucion: horaLocal(dto.returnDate),
    diasAlquiler: dto.rentalDays,
    metodoPago: esEfectivo ? "efectivo" : "wompi",
    total: Number(dto.totalEstimated ?? 0),
    proteccion: dto.insuranceCoverageName,
    planKilometraje: dto.mileagePlanName,
    servicios: (dto.additionalServices ?? []).map((s: any) => ({
      nombre: s.name ?? s.serviceName ?? "",
      precio: Number(s.dailyRate ?? s.subtotal ?? 0),
    })),
    codigoPagoEfectivo: dto.cashPaymentCode ?? null,
    fechaLimitePago: dto.cashPaymentExpiresAt ?? null,
    sucursalPagoEfectivoId: dto.cashPaymentBranchId ?? null,
  };
}

export function calcularGrupoReserva(reserva: ReservaGuardada): GrupoReserva {
  switch (reserva.estado) {
    case "FINALIZADA":
      return "finalizada";
    case "CANCELADA":
    case "CANCELADA_POR_TIEMPO":
      return "cancelada";
    case "CONFIRMADA":
      return "confirmada";
    case "EN_CURSO":
      return "en_curso";
    default:
      return "pendiente";
  }
}

async function adjuntarVehiculos(lista: ReservaGuardada[]): Promise<ReservaGuardada[]> {
  const ids = Array.from(new Set(lista.map((r) => r.vehiculoId)));
  const vehiculos = new Map<string, Vehiculo>();
  await Promise.all(
    ids.map(async (id) => {
      try {
        const v = await catalogoService.getVehiculoPorId(id);
        if (v) vehiculos.set(id, v);
      } catch {
        // el detalle del vehiculo es opcional
      }
    }),
  );
  return lista.map((r) => ({ ...r, vehiculoSnapshot: vehiculos.get(r.vehiculoId) }));
}

export function mensajeDeError(error: any, porDefecto: string): string {
  return error?.response?.data?.detail || error?.response?.data?.title || error?.message || porDefecto;
}

export interface DatosCrearReserva {
  vehiculo: Vehiculo;
  fechasLugar: DatosFechasLugar;
  planes: DatosPlanes;
  cupon: Cupon | null;
}

export const reservaPersistService = {
  getReservasUsuario: async (): Promise<ReservaGuardada[]> => {
    const { data } = await apiClient.get("/reservations/me");
    const lista = (Array.isArray(data) ? data : []).map(mapReserva);
    return adjuntarVehiculos(lista);
  },

  obtenerPorReferencia: async (referencia: string): Promise<ReservaGuardada | undefined> => {
    if (!referencia) return undefined;
    const clean = referencia.trim();
    const base = clean.includes("_") ? clean.split("_")[0] : clean;
    const esUuid = /^[0-9a-f-]{36}$/i.test(base);
    try {
      const { data } = await apiClient.get(
        esUuid ? `/reservations/${base}` : `/reservations/code/${encodeURIComponent(base)}`,
      );
      const [reserva] = await adjuntarVehiculos([mapReserva(data)]);
      return reserva;
    } catch {
      return undefined;
    }
  },

  crear: async ({ vehiculo, fechasLugar, planes, cupon }: DatosCrearReserva): Promise<ReservaGuardada> => {
    const seguro = vehiculo.seguros?.find((s) => s.nombre === planes.proteccion);
    const kmPlan =
      planes.tipoKilometraje === "limitado" ? vehiculo.tarifas?.kmLimitado : vehiculo.tarifas?.kmIlimitado;
    const serviciosIds = (vehiculo.servicios ?? [])
      .filter((s) => planes.serviciosSeleccionados.includes(s.nombre))
      .map((s) => s.id)
      .filter(Boolean);

    const isUuid = (val?: string | null) =>
      !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    const sucursales = useReferenceStore.getState().sucursales;
    const sede =
      sucursales.find(
        (b) =>
          b.id === vehiculo.sucursalId ||
          (vehiculo.sucursal && b.name.toLowerCase() === vehiculo.sucursal.toLowerCase())
      ) || sucursales[0];
    const targetBranchId = (isUuid(vehiculo.sucursalId) ? vehiculo.sucursalId : sede?.id) || null;
    const targetCityId = sede?.cityId;

    const resolvedVehicleId = isUuid(vehiculo.uuid)
      ? vehiculo.uuid
      : isUuid(String(vehiculo.id))
      ? String(vehiculo.id)
      : vehiculo.uuid || String(vehiculo.id);

    let dRetiro = new Date(`${fechasLugar.fechaRetiro}T${fechasLugar.horaRetiro || "10:00"}:00`);
    let dDevolucion = new Date(`${fechasLugar.fechaDevolucion}T${fechasLugar.horaDevolucion || "10:00"}:00`);

    const ahora = Date.now();
    if (dRetiro.getTime() < ahora) {
      const hoyLocal = new Date();
      const fechaRetiroStr = fechasLugar.fechaRetiro ? String(fechasLugar.fechaRetiro).split("T")[0] : "";
      const hoyStr = `${hoyLocal.getFullYear()}-${String(hoyLocal.getMonth() + 1).padStart(2, "0")}-${String(hoyLocal.getDate()).padStart(2, "0")}`;
      if (fechaRetiroStr === hoyStr) {
        // Si el usuario eligió hoy pero la hora expiró mientras llenaba el formulario, ajustamos al momento actual + 2 min
        dRetiro = new Date(ahora + 2 * 60 * 1000);
      }
    }
    if (dDevolucion.getTime() <= dRetiro.getTime()) {
      dDevolucion = new Date(dRetiro.getTime() + 24 * 60 * 60 * 1000);
    }

    const body = {
      vehicleId: resolvedVehicleId,
      pickupDate: dRetiro.toISOString(),
      returnDate: dDevolucion.toISOString(),
      insuranceCoverageId: seguro?.id ?? null,
      mileagePlanId: kmPlan?.id ?? null,
      additionalServiceIds: serviciosIds,
      couponCode: cupon?.codigo ?? null,
      cashPaymentBranchId: fechasLugar.metodoPago === "efectivo" ? targetBranchId : null,
      outsideScheduleAccepted: Boolean(fechasLugar.fueraDeHorarioAceptado),
    };
    const { data } = await apiClient.post("/reservations/checkout/initiate", body);

    // Entrega/devolución a domicilio: el servidor las guarda aparte; sin esto la sucursal nunca ve el domicilio
    const retiroDomicilio = fechasLugar.lugarRetiro === "domicilio";
    const devolucionDomicilio = fechasLugar.lugarDevolucion === "domicilio";
    if ((retiroDomicilio || devolucionDomicilio) && data?.id) {
      const barrioCompartido = fechasLugar.barrioRetiro || fechasLugar.barrioDevolucion || "";
      const direccionCompartida = fechasLugar.direccionRetiro || fechasLugar.direccionDevolucion || "";
      const referenciasCompartidas = fechasLugar.referenciasRetiro || fechasLugar.referenciasDevolucion || undefined;

      const punto = (pointType: "PICKUP" | "RETURN", domicilio: boolean) =>
        domicilio
          ? {
              pointType,
              modality: "HOME_DELIVERY",
              cityId: targetCityId,
              neighborhood: pointType === "PICKUP" ? (fechasLugar.barrioRetiro || barrioCompartido) : (fechasLugar.barrioDevolucion || barrioCompartido),
              address: pointType === "PICKUP" ? (fechasLugar.direccionRetiro || direccionCompartida) : (fechasLugar.direccionDevolucion || direccionCompartida),
              referenceDetails: (pointType === "PICKUP" ? (fechasLugar.referenciasRetiro || referenciasCompartidas) : (fechasLugar.referenciasDevolucion || referenciasCompartidas)) || undefined,
            }
          : { pointType, modality: "BRANCH", branchId: targetBranchId };
      try {
        await apiClient.post(`/reservations/${data.id}/delivery-points`, {
          points: [punto("PICKUP", retiroDomicilio), punto("RETURN", devolucionDomicilio)],
        });
      } catch (e) {
        console.warn("No se pudo guardar el domicilio de la reserva", e);
      }
    }
    return mapReserva(data);
  },

  confirmarPago: async (id: string) => {
    const { data } = await apiClient.post(`/reservations/checkout/confirm/${id}`);
    return mapReserva(data);
  },

  reportarPagoFallido: async (id: string) => {
    await apiClient.post(`/reservations/checkout/payment-failed/${id}`);
  },

  cancelar: async (id: string) => {
    const { data } = await apiClient.patch(`/reservations/${id}/cancel`, { reason: "Cancelada por el cliente desde la app movil" });
    return mapReserva(data);
  },
};

export function nombreSucursalEfectivo(reserva: ReservaGuardada): string {
  const id = reserva.sucursalPagoEfectivoId;
  return useReferenceStore.getState().sucursales.find((s) => s.id === id)?.name ?? "";
}
