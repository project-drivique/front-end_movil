import React, { useMemo, useState } from "react";
import { Modal } from 'react-native'


import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { useReservaStore } from "@/store/reservationStore";

import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { COLOR_MARCA, getDetalleDuracionAlquiler } from '../constants/reservation.constants'
import { diasEntre } from './BookingSummaryModal.pieces'
import { useServerQuote } from "../hooks/useServerQuote";
import { useMonedaStore } from "@/store/currencyStore";



import { COLOR_ACENTO } from "@/constants/brandPalette";

import BookingSummaryModalPart from './BookingSummaryModal/BookingSummaryModalPart'

interface Props {
  visible: boolean;
  vehiculo: Vehiculo;
  onCerrar: () => void;
  mostrarPlanes?: boolean;
  seccionFechasCompleta?: boolean;
  permitirEditar?: boolean;
  onEditarSeccion?: (seccion: "fechas" | "planes" | "servicios") => void;
}

export default function ResumenReservaModal({
  visible,
  vehiculo,
  onCerrar,
  permitirEditar = false,
  onEditarSeccion,
}: Props) {
  const insets = useSafeAreaInsets();
  useMonedaStore();
  const c = useTemaColores();
  const { t, i18n } = useTranslation();
  const [seccionEditando, setSeccionEditando] = useState<"fechas" | "planes" | "servicios" | null>(null);

  const fechasLugar = useReservaStore((s) => s.fechasLugar);
  const planes = useReservaStore((s) => s.planes);
  const cuponAplicado = useReservaStore((s) => s.cuponAplicado);

  const primaryAccent = c.oscuro ? COLOR_ACENTO : COLOR_MARCA;

  const infoDuracion = useMemo(() => {
    return getDetalleDuracionAlquiler(
      fechasLugar.fechaRetiro,
      fechasLugar.fechaDevolucion,
      fechasLugar.horaRetiro,
      fechasLugar.horaDevolucion,
      t
    );
  }, [fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion, fechasLugar.horaRetiro, fechasLugar.horaDevolucion, t]);

  const handleCerrar = () => {
    setSeccionEditando(null);
    onCerrar();
  };

  const formatFechaResumen = (fechaStr: string | null | undefined): string => {
    if (!fechaStr) return t("reserva.resumen.fechaNoSeleccionada", { defaultValue: "Fecha no seleccionada" });
    try {
      const partes = fechaStr.split("-");
      if (partes.length !== 3) return fechaStr;
      const y = parseInt(partes[0], 10);
      const m = parseInt(partes[1], 10);
      const d = parseInt(partes[2], 10);
      if (isNaN(y) || isNaN(m) || isNaN(d)) return fechaStr;

      const mesesEs = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];
      const mesesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
      const mesesPt = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
      const mesesFr = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];

      const lang = i18n.language || "es";
      const listaMeses = lang.startsWith("en") ? mesesEn : lang.startsWith("pt") || lang.startsWith("br") ? mesesPt : lang.startsWith("fr") ? mesesFr : mesesEs;
      const mesTexto = listaMeses[m - 1] || "";
      return `${d} ${mesTexto} ${y}`;
    } catch {
      return fechaStr;
    }
  };

  const getLugarLabel = (lugar: string | undefined | null, modo: "entrega" | "devolucion"): string => {
    if (!lugar || lugar.trim() === "") {
      return t("reserva.resumen.noSeleccionado", { defaultValue: "No seleccionado" });
    }
    if (lugar === "domicilio") {
      return t(modo === "entrega" ? "reserva.fechasLugar.entregaDomicilio" : "reserva.fechasLugar.devolucionDomicilio", {
        defaultValue: modo === "entrega" ? "Entrega a domicilio" : "Devolución a domicilio",
      });
    }
    if (lugar === "aeropuerto") {
      return t(modo === "entrega" ? "reserva.fechasLugar.entregaAeropuerto" : "reserva.fechasLugar.devolucionAeropuerto", {
        defaultValue: modo === "entrega" ? "Entrega en aeropuerto" : "Devolución en aeropuerto",
      });
    }
    if (lugar === "terminal") {
      return t(modo === "entrega" ? "reserva.fechasLugar.entregaTerminal" : "reserva.fechasLugar.devolucionTerminal", {
        defaultValue: modo === "entrega" ? "Entrega en terminal" : "Devolución en terminal",
      });
    }
    return lugar;
  };

  const seguros = vehiculo.seguros ?? [];
  const kmLimitado = vehiculo.tarifas?.kmLimitado;
  const kmIlimitado = vehiculo.tarifas?.kmIlimitado;
  const servicios = useMemo(
    () =>
      (vehiculo.servicios ?? []).filter(
        (s) =>
          !s.nombre.toLowerCase().includes("conductor") &&
          !s.nombre.toLowerCase().includes("otra ciudad")
      ),
    [vehiculo.servicios]
  );

  const seguroElegido = useMemo(
    () => seguros.find((s) => s.nombre === planes.proteccion) ?? null,
    [seguros, planes.proteccion]
  );
  const kmElegido =
    planes.tipoKilometraje === "limitado"
      ? kmLimitado
      : planes.tipoKilometraje === "ilimitado"
      ? kmIlimitado
      : null;

  const labelKm =
    planes.tipoKilometraje === "limitado"
      ? t("reserva.planes.limitado", { defaultValue: "Limitado" })
      : planes.tipoKilometraje === "ilimitado"
      ? t("reserva.planes.ilimitado", { defaultValue: "Ilimitado" })
      : t("reserva.resumen.noSeleccionado", { defaultValue: "No seleccionado" });

  const proteccionTexto = planes.proteccion
    ? t(`reserva.planes.nombreSeguro.${planes.proteccion}`, { defaultValue: planes.proteccion })
    : t("reserva.resumen.ningunaSeleccionada", { defaultValue: "Ninguna seleccionada" });

  const serviciosTexto =
    planes.serviciosSeleccionados && planes.serviciosSeleccionados.length > 0
      ? planes.serviciosSeleccionados
          .map((n) => t(`reserva.planes.nombreServicio.${n}`, { defaultValue: n }))
          .join(", ")
      : t("reserva.resumen.ningunaSeleccionada", { defaultValue: "Ninguna seleccionada" });

  const diasContrato = useMemo(() => {
    const d = diasEntre(fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion);
    return d > 0 ? d : 1;
  }, [fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion]);

  const serviciosElegidosDetalle = useMemo(() => {
    if (!planes.serviciosSeleccionados || planes.serviciosSeleccionados.length === 0) {
      return [];
    }
    return planes.serviciosSeleccionados.map((nombre) => {
      const servObj = servicios.find((s) => s.nombre === nombre);
      const precioDia = servObj ? servObj.precio : 0;
      const totalCalculado = precioDia * diasContrato;
      const nombreTraducido = t(`reserva.planes.nombreServicio.${nombre}`, { defaultValue: nombre });
      return {
        nombre,
        nombreTraducido,
        precioDia,
        totalCalculado,
      };
    });
  }, [planes.serviciosSeleccionados, servicios, diasContrato, t]);

  const cotizacion = useServerQuote({ vehiculo, fechasLugar, planes, cuponCodigo: cuponAplicado?.codigo });

  const desglose = useMemo(() => {
    const diasCalc = diasEntre(fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion, fechasLugar.horaRetiro, fechasLugar.horaDevolucion);
    const dias = diasCalc > 0 ? diasCalc : 1;
    const diarias = vehiculo.precio * dias;
    const proteccion = seguroElegido ? seguroElegido.precio * dias : 0;
    const kilometraje = kmElegido ? kmElegido.precio * dias : 0;
    const servAdic = servicios
      .filter((s) => planes.serviciosSeleccionados.includes(s.nombre))
      .reduce((a, s) => a + s.precio * dias, 0);

    const recargoLogistico = 0;
    const subtotalBase = diarias + proteccion + kilometraje + servAdic;
    const cargos = Number(cotizacion?.adminFee ?? 0);
    const subtotalBruto = subtotalBase;

    const descuentoCupon = Number(cotizacion?.discountAmount ?? 0);
    const subtotal = Math.max(subtotalBruto - descuentoCupon, 0);
    const iva = Number(cotizacion?.vat ?? 0);
    return {
      dias,
      diasCalc,
      diarias,
      proteccion,
      kilometraje,
      servAdic,
      cargos,
      recargoLogistico,
      subtotalBruto,
      descuentoCupon,
      subtotal,
      iva,
      total: cotizacion ? Number(cotizacion.estimatedTotal) : subtotal,
    };
  }, [
    vehiculo.precio,
    fechasLugar.fechaRetiro,
    fechasLugar.fechaDevolucion,
    fechasLugar.lugarRetiro,
    fechasLugar.lugarDevolucion,
    seguroElegido,
    kmElegido,
    servicios,
    planes.serviciosSeleccionados,
    cuponAplicado,
    cotizacion,
  ]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleCerrar} presentationStyle="pageSheet">
      <BookingSummaryModalPart c={c} cotizacion={cotizacion} cuponAplicado={cuponAplicado} desglose={desglose} diasContrato={diasContrato} fechasLugar={fechasLugar} formatFechaResumen={formatFechaResumen} getLugarLabel={getLugarLabel} handleCerrar={handleCerrar} infoDuracion={infoDuracion} insets={insets} labelKm={labelKm} onEditarSeccion={onEditarSeccion} permitirEditar={permitirEditar} planes={planes} primaryAccent={primaryAccent} proteccionTexto={proteccionTexto} seccionEditando={seccionEditando} seguroElegido={seguroElegido} serviciosElegidosDetalle={serviciosElegidosDetalle} setSeccionEditando={setSeccionEditando} t={t} vehiculo={vehiculo} />
    </Modal>
  );
}

