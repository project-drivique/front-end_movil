import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from 'react-native'
import { Ionicons } from "@expo/vector-icons";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { useReservaStore } from "@/store/reservationStore";
import { COLOR_MARCA, formatHoraAmPm, getMetodosPago } from '../constants/reservation.constants'
import { getSucursalPorNombre, getCiudadesData, getCiudadPorSucursal, getDireccionSucursal, getDisponibilidadVehiculo, getHorarioSucursal } from "@/modules/catalog/constants/catalog.constants";
import CalendarioRango from "./DateRangeCalendar";
import SelectorSucursalModal, { OpcionLugar } from "./BranchSelectorModal";

import { AlertaPagoEfectivo } from "./CashPaymentAlert";
import { AlertModal } from "@/components/ui/AlertModal";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { COLOR_ACENTO } from "@/constants/brandPalette";
import { styles } from './DatesLocationForm/DatesLocationForm.styles'
import DatesLocationFormPart5 from './DatesLocationForm/DatesLocationFormPart5'
import DiasReserva from './DatesLocationForm/DiasReserva'
import DatesLocationFormPart4 from './DatesLocationForm/DatesLocationFormPart4'
import DatesLocationFormPart3 from './DatesLocationForm/DatesLocationFormPart3'
import MostrarDomicilioRetiro from './DatesLocationForm/MostrarDomicilioRetiro'
import DatesLocationFormPart2 from './DatesLocationForm/DatesLocationFormPart2'
import DatesLocationFormPart from './DatesLocationForm/DatesLocationFormPart'

interface Props {
  vehiculo: Vehiculo;
}



function getFechaSiguiente(fechaStr: string | null | undefined): string | null {
  if (!fechaStr) return null;
  const [y, m, d] = fechaStr.split("-").map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return fechaStr;
  const sig = new Date(y, m - 1, d + 1);
  const ySig = sig.getFullYear();
  const mSig = String(sig.getMonth() + 1).padStart(2, "0");
  const dSig = String(sig.getDate()).padStart(2, "0");
  return `${ySig}-${mSig}-${dSig}`;
}

export default function FormFechasLugar({ vehiculo }: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const METODOS_PAGO = useMemo(() => getMetodosPago(t), [t]);
  const fechasLugar = useReservaStore((s) => s.fechasLugar);
  const actualizarFechasLugar = useReservaStore((s) => s.actualizarFechasLugar);

  const [modalTipo, setModalTipo] = useState<"retiro" | "devolucion" | null>(null);
  const [horaVisible, setHoraVisible] = useState<"retiro" | "devolucion" | null>(null);
  const [alertaEfectivoVisible, setAlertaEfectivoVisible] = useState(false);
  const [alertaModal, setAlertaModal] = useState<{
    visible: boolean;
    icono?: keyof typeof Ionicons.glyphMap;
    titulo: string;
    mensaje: string;
    botones?: { texto: string; onPress: () => void; variante?: "primario" | "secundario" }[];
  }>({
    visible: false,
    titulo: "",
    mensaje: "",
  });

  const nombreSucursal = vehiculo.sucursal ?? "";
  const ciudadNombre = vehiculo.sucursal ? getCiudadPorSucursal(vehiculo.sucursal) : null;
  const ciudadInfo = ciudadNombre ? getCiudadesData().find((c) => c.nombre === ciudadNombre) : null;

  const horarioRetiro = useMemo(
    () => getHorarioSucursal(fechasLugar.lugarRetiro || nombreSucursal),
    [fechasLugar.lugarRetiro, nombreSucursal]
  );
  const horarioDevolucion = useMemo(
    () => getHorarioSucursal(fechasLugar.lugarDevolucion || nombreSucursal),
    [fechasLugar.lugarDevolucion, nombreSucursal]
  );

  const esWompi = fechasLugar.metodoPago === "wompi";
  const efectivoPermitido = getSucursalPorNombre(nombreSucursal)?.permiteEfectivo === true;

  const opcionesEntrega: OpcionLugar[] = useMemo(() => {
    const base: OpcionLugar[] = [
      { value: nombreSucursal, label: t("reserva.fechasLugar.recogerEnSucursal", { sucursal: nombreSucursal }), icono: "business-outline" },
    ];
    if (esWompi) {
      base.push({ value: "domicilio", label: t("reserva.fechasLugar.entregaDomicilio", { defaultValue: "Domicilio a casa" }), icono: "home-outline" });
      if (ciudadInfo?.tieneAeropuerto === true) {
        base.push({ value: "aeropuerto", label: t("reserva.fechasLugar.entregaAeropuerto", { defaultValue: "Entrega en aeropuerto" }), icono: "airplane-outline" });
      }
      if (ciudadInfo?.tieneTerminal === true) {
        base.push({ value: "terminal", label: t("reserva.fechasLugar.entregaTerminal", { defaultValue: "Entrega en terminal de transporte" }), icono: "bus-outline" });
      }
    }
    return base;
  }, [nombreSucursal, esWompi, ciudadInfo, t]);

  const opcionesDevolucion: OpcionLugar[] = useMemo(() => {
    const base: OpcionLugar[] = [
      { value: nombreSucursal, label: t("reserva.fechasLugar.devolverEnSucursal", { sucursal: nombreSucursal, defaultValue: `Devolver en sucursal (${nombreSucursal})` }), icono: "business-outline" },
    ];
    if (esWompi) {
      base.push({ value: "domicilio", label: t("reserva.fechasLugar.devolucionDomicilio", { defaultValue: "Domicilio a casa" }), icono: "home-outline" });
      if (ciudadInfo?.tieneAeropuerto === true) {
        base.push({ value: "aeropuerto", label: t("reserva.fechasLugar.devolucionAeropuerto", { defaultValue: "Devolución en aeropuerto" }), icono: "airplane-outline" });
      }
      if (ciudadInfo?.tieneTerminal === true) {
        base.push({ value: "terminal", label: t("reserva.fechasLugar.devolucionTerminal", { defaultValue: "Devolución en terminal de transporte" }), icono: "bus-outline" });
      }
    }
    return base;
  }, [nombreSucursal, esWompi, ciudadInfo, t]);

  useEffect(() => {
    if (fechasLugar.metodoPago === "efectivo") {
      const actualizacion: Partial<typeof fechasLugar> = {
        barrioRetiro: "",
        direccionRetiro: "",
        referenciasRetiro: "",
        barrioDevolucion: "",
        direccionDevolucion: "",
        referenciasDevolucion: "",
      };
      if (fechasLugar.lugarRetiro !== nombreSucursal) {
        actualizacion.lugarRetiro = nombreSucursal;
      }
      if (fechasLugar.lugarDevolucion !== nombreSucursal) {
        actualizacion.lugarDevolucion = nombreSucursal;
      }
      actualizarFechasLugar(actualizacion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechasLugar.metodoPago, nombreSucursal]);

  const handleElegirSucursal = (value: string) => {
    const horarioNuevo = getHorarioSucursal(value || nombreSucursal);
    const [hMinOpen, mMinOpen] = (horarioNuevo.horaApertura || "08:00").split(":").map(Number);
    const [hMaxClose, mMaxClose] = (horarioNuevo.horaCierre || "18:00").split(":").map(Number);
    const minMins = hMinOpen * 60 + mMinOpen;
    const maxMins = hMaxClose * 60 + mMaxClose;

    if (modalTipo === "retiro") {
      const actualizacion: Partial<typeof fechasLugar> = { lugarRetiro: value };
      if (fechasLugar.horaRetiro) {
        const [hr, mr] = fechasLugar.horaRetiro.split(":").map(Number);
        const totalMins = hr * 60 + mr;
        if (totalMins < minMins) {
          actualizacion.horaRetiro = horarioNuevo.horaApertura;
        } else if (totalMins > maxMins) {
          actualizacion.horaRetiro = horarioNuevo.horaCierre;
        }
      }
      actualizarFechasLugar(actualizacion);
    }
    if (modalTipo === "devolucion") {
      const actualizacion: Partial<typeof fechasLugar> = { lugarDevolucion: value };
      if (fechasLugar.horaDevolucion) {
        const [hd, md] = fechasLugar.horaDevolucion.split(":").map(Number);
        const totalMins = hd * 60 + md;
        if (totalMins < minMins) {
          actualizacion.horaDevolucion = horarioNuevo.horaApertura;
        } else if (totalMins > maxMins) {
          actualizacion.horaDevolucion = horarioNuevo.horaCierre;
        }
      }
      actualizarFechasLugar(actualizacion);
    }
    setModalTipo(null);
  };

  const esUnSoloDia =
    !!fechasLugar.fechaRetiro &&
    !!fechasLugar.fechaDevolucion &&
    fechasLugar.fechaRetiro === fechasLugar.fechaDevolucion;

  const fechaDevolucionEfectiva = esUnSoloDia
    ? getFechaSiguiente(fechasLugar.fechaRetiro) || fechasLugar.fechaDevolucion
    : fechasLugar.fechaDevolucion;

  const handleAbrirHoraDevolucion = () => {
    setHoraVisible("devolucion");
  };

  const handleElegirHora = (hora: string) => {
    const fecha = horaVisible === "retiro" ? fechasLugar.fechaRetiro : fechaDevolucionEfectiva;

    if (fecha) {
      const horasOcupadas = getDisponibilidadVehiculo(vehiculo.id).horasOcupadas?.[fecha] ?? [];
      const bloqueo = horasOcupadas.find((h) => h.hora === hora);

      if (bloqueo) {
        const mensaje =
          bloqueo.motivo === "mantenimiento"
            ? t("reserva.fechasLugar.horaNoDisponibleMantenimiento")
            : t("reserva.fechasLugar.horaNoDisponibleReservado");

        setAlertaModal({
          visible: true,
          icono: "alert-circle-outline",
          titulo: t("reserva.fechasLugar.horaNoDisponibleTitulo"),
          mensaje,
          botones: [
            {
              texto: t("reserva.fechasLugar.intentarDeNuevo", { defaultValue: "Aceptar" }),
              variante: "primario",
              onPress: () => setAlertaModal((p) => ({ ...p, visible: false })),
            },
          ],
        });
        return;
      }
    }

    if (horaVisible === "retiro") {
      const actualizacion: Partial<typeof fechasLugar> = { horaRetiro: hora };
      if (!fechasLugar.horaDevolucion || fechasLugar.horaDevolucion > hora) {
        actualizacion.horaDevolucion = hora;
      }
      actualizarFechasLugar(actualizacion);
    } else if (horaVisible === "devolucion") {
      const nuevaFechaDev = esUnSoloDia
        ? getFechaSiguiente(fechasLugar.fechaRetiro) || fechasLugar.fechaDevolucion
        : fechasLugar.fechaDevolucion;

      actualizarFechasLugar({
        horaDevolucion: hora,
        fechaDevolucion: nuevaFechaDev,
      });
    }
  };

  const labelLugarRetiro =
    opcionesEntrega.find((o) => o.value === fechasLugar.lugarRetiro)?.label ||
    fechasLugar.lugarRetiro ||
    t("reserva.fechasLugar.seleccionar");
  const labelLugarDevolucion =
    opcionesDevolucion.find((o) => o.value === fechasLugar.lugarDevolucion)?.label ||
    fechasLugar.lugarDevolucion ||
    t("reserva.fechasLugar.seleccionar");

  const ciudadEntregaNombre = ciudadInfo?.nombre ?? ciudadNombre ?? "";

  const mostrarDomicilioRetiro = fechasLugar.lugarRetiro === "domicilio";
  const mostrarDomicilioDevolucion = fechasLugar.lugarDevolucion === "domicilio";

  const diasReserva = useMemo(() => {
    if (!fechasLugar.fechaRetiro || !fechasLugar.fechaDevolucion) return 0;
    const fInicioStr = fechasLugar.fechaRetiro.split("T")[0];
    const fFinStr = fechasLugar.fechaDevolucion.split("T")[0];
    const startDate = new Date(`${fInicioStr}T00:00:00`);
    const endDate = new Date(`${fFinStr}T00:00:00`);
    const diffTime = endDate.getTime() - startDate.getTime();
    let dias = Math.max(1, Math.round(diffTime / 86400000));
    if (fInicioStr === fFinStr) dias = 1;
    return dias;
  }, [fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion]);

  const infoComputo = useMemo(() => {
    if (!fechasLugar.horaRetiro || diasReserva <= 0 || !fechasLugar.fechaRetiro || !fechasLugar.fechaDevolucion) {
      return null;
    }
    const fmtFecha = (d: number, m: number) => t("extra.computo.fecha", { d, mes: t(`extra.mesCorto.${m}`) });
    let fInicioFmt = "";
    let fFinFmt = "";
    let fNextFmt = "";

    const pI = fechasLugar.fechaRetiro.split("T")[0].split("-").map(Number);
    if (pI.length === 3) fInicioFmt = fmtFecha(pI[2], pI[1] - 1);

    const pF = fechasLugar.fechaDevolucion.split("T")[0].split("-").map(Number);
    if (pF.length === 3) {
      fFinFmt = fmtFecha(pF[2], pF[1] - 1);
      const nextDt = new Date(pF[0], pF[1] - 1, pF[2]);
      nextDt.setDate(nextDt.getDate() + 1);
      fNextFmt = fmtFecha(nextDt.getDate(), nextDt.getMonth());
    }

    const hAmPm = formatHoraAmPm(fechasLugar.horaRetiro);

    return {
      titulo: t("extra.computo.titulo", { n: diasReserva, dia: diasReserva === 1 ? t("reserva.fechasLugar.diaSingular", { defaultValue: "día" }) : t("reserva.fechasLugar.diaPlural", { defaultValue: "días" }) }),
      desc: t("extra.computo.desc", { inicio: fInicioFmt, fin: fFinFmt, siguiente: fNextFmt, hora: hAmPm, n: diasReserva }),
    };
  }, [fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion, fechasLugar.horaRetiro, diasReserva]);

  const devolucionAnticipadaText = useMemo(() => {
    if (!fechasLugar.horaRetiro || !fechasLugar.horaDevolucion || diasReserva <= 0) return "";
    const [hR, mR] = fechasLugar.horaRetiro.split(":").map(Number);
    const [hD, mD] = fechasLugar.horaDevolucion.split(":").map(Number);
    const minutosRetiro = hR * 60 + mR;
    const minutosDevolucion = hD * 60 + mD;

    if (minutosDevolucion < minutosRetiro) {
      const diffEarlyMins = minutosRetiro - minutosDevolucion;
      const totalContractMins = diasReserva * 24 * 60;
      const totalEffectiveMins = totalContractMins - diffEarlyMins;

      if (totalEffectiveMins > 0) {
        const antDias = Math.floor(totalEffectiveMins / (24 * 60));
        const remainderMins = totalEffectiveMins % (24 * 60);
        const antHoras = Math.floor(remainderMins / 60);
        const antMins = remainderMins % 60;

        if (antDias > 0) {
          const dayStr = `${antDias} ${antDias === 1 ? t("vehiculo.day", { defaultValue: "día" }) : t("vehiculo.days", { defaultValue: "días" })}`;
          const timeParts: string[] = [];
          if (antHoras > 0) timeParts.push(`${antHoras} h`);
          if (antMins > 0) timeParts.push(`${antMins} min`);
          return timeParts.length > 0 ? `${dayStr}, ${timeParts.join(" ")}` : dayStr;
        } else {
          const timeParts: string[] = [];
          if (antHoras > 0) timeParts.push(`${antHoras} h`);
          if (antMins > 0) timeParts.push(`${antMins} min`);
          return timeParts.join(" ");
        }
      }
    }
    return "";
  }, [fechasLugar.horaRetiro, fechasLugar.horaDevolucion, diasReserva, t]);

  const primaryAccent = c.oscuro ? COLOR_ACENTO : COLOR_MARCA;

  return (
    <View style={[styles.card, { backgroundColor: c.bgCard }]}>
      <View style={styles.headerConIcono}>
        <Ionicons name="card-outline" size={14} color={primaryAccent} />
        <Text style={[[styles.tituloHeaderConIcono, { color: COLOR_MARCA }], { color: primaryAccent }]}>
          {t("reserva.fechasLugar.metodoPagoPreferido")}
        </Text>
      </View>
      <DatesLocationFormPart METODOS_PAGO={METODOS_PAGO} actualizarFechasLugar={actualizarFechasLugar} c={c} efectivoPermitido={efectivoPermitido} fechasLugar={fechasLugar} nombreSucursal={nombreSucursal} primaryAccent={primaryAccent} setAlertaEfectivoVisible={setAlertaEfectivoVisible} setAlertaModal={setAlertaModal} t={t} />

      {fechasLugar.metodoPago === "efectivo" && (
        <View style={styles.puntoAutorizadoContainer}>
          <View style={styles.headerConIcono}>
            <Ionicons name="location" size={14} color={COLOR_MARCA} />
            <Text style={[styles.tituloHeaderConIcono, { color: COLOR_MARCA }]}>
              {t("reserva.fechasLugar.puntoAutorizadoEfectivo", { defaultValue: "Punto autorizado para pago en efectivo" })}
            </Text>
          </View>
          <View style={[styles.puntoAutorizadoBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}>
            <Text style={[styles.puntoAutorizadoTexto, { color: c.textPrimary }]} numberOfLines={1}>
              {`${nombreSucursal}${ciudadEntregaNombre ? ` · ${ciudadEntregaNombre}` : ""}`}
            </Text>
          </View>
        </View>
      )}

      <DatesLocationFormPart2 c={c} fechasLugar={fechasLugar} labelLugarDevolucion={labelLugarDevolucion} labelLugarRetiro={labelLugarRetiro} setModalTipo={setModalTipo} t={t} />

      {/* --- INFO DE DOMICILIO (unificado para entrega y/o devolución, idéntico a web) --- */}
      {(mostrarDomicilioRetiro || mostrarDomicilioDevolucion) && (
        <MostrarDomicilioRetiro actualizarFechasLugar={actualizarFechasLugar} c={c} ciudadEntregaNombre={ciudadEntregaNombre} fechasLugar={fechasLugar} mostrarDomicilioDevolucion={mostrarDomicilioDevolucion} mostrarDomicilioRetiro={mostrarDomicilioRetiro} t={t} />
      )}

      {/* --- CALENDARIO DE DISPONIBILIDAD --- */}
      <View style={styles.headerCalendarioContainer}>
        <Ionicons name="calendar" size={14} color={COLOR_MARCA} style={styles.iconoCalendario} />
        <Text style={[styles.tituloCalendario, { color: COLOR_MARCA }]}>
          {t("reserva.fechasLugar.calendarioDisponibilidad", {
            defaultValue: "Selecciona un rango de fechas en el calendario de disponibilidad",
          })}
        </Text>
      </View>
      <CalendarioRango
        vehiculo={vehiculo}
        fechaRetiro={fechasLugar.fechaRetiro}
        fechaDevolucion={fechasLugar.fechaDevolucion}
        onCambiarFechas={(retiro, devolucion) =>
          actualizarFechasLugar({ fechaRetiro: retiro, fechaDevolucion: devolucion })
        }
      />

      {/* --- FECHAS AUTOMÁTICAS (se llenan solas con lo elegido en el calendario) --- */}
      <DatesLocationFormPart3 c={c} fechasLugar={fechasLugar} t={t} />

      {/* --- INFO ALERT: CÓMPUTO DE DÍAS (OPCIÓN B / IDÉNTICO A WEB) --- */}
      {!!infoComputo && (
        <View
          style={[
            styles.computoAlertCard,
            {
              backgroundColor: c.oscuro ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.08)",
              borderColor: c.oscuro ? "rgba(59, 130, 246, 0.35)" : "rgba(59, 130, 246, 0.25)",
            },
          ]}
        >
          <Ionicons name="information-circle" size={20} color="#2563EB" style={{ marginTop: 2, flexShrink: 0 }} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.computoAlertTitulo, { color: c.textPrimary }]}>
              {infoComputo.titulo}
            </Text>
            <Text style={[styles.computoAlertDesc, { color: c.oscuro ? "#CBD5E1" : "#475569" }]}>
              {infoComputo.desc}
            </Text>
          </View>
        </View>
      )}

      {/* --- HORAS DE RETIRO Y DEVOLUCIÓN --- */}
      <DatesLocationFormPart4 c={c} fechasLugar={fechasLugar} handleAbrirHoraDevolucion={handleAbrirHoraDevolucion} primaryAccent={primaryAccent} setHoraVisible={setHoraVisible} t={t} />

      {/* --- DURACIÓN DEL ALQUILER Y DEVOLUCIÓN ANTICIPADA (IDÉNTICO A WEB) --- */}
      {diasReserva > 0 && (
        <DiasReserva c={c} devolucionAnticipadaText={devolucionAnticipadaText} diasReserva={diasReserva} primaryAccent={primaryAccent} t={t} />
      )}

      <SelectorSucursalModal
        visible={modalTipo !== null}
        titulo={modalTipo === "retiro" ? t("reserva.fechasLugar.lugarDeRetiroModal") : t("reserva.fechasLugar.lugarDeDevolucionModal")}
        opciones={modalTipo === "retiro" ? opcionesEntrega : opcionesDevolucion}
        onSeleccionar={handleElegirSucursal}
        onCerrar={() => setModalTipo(null)}
      />

      <DatesLocationFormPart5 diasReserva={diasReserva} esUnSoloDia={esUnSoloDia} fechaDevolucionEfectiva={fechaDevolucionEfectiva} fechasLugar={fechasLugar} handleElegirHora={handleElegirHora} horaVisible={horaVisible} nombreSucursal={nombreSucursal} setHoraVisible={setHoraVisible} t={t} />

      <AlertaPagoEfectivo
        visible={alertaEfectivoVisible}
        nombreSucursal={nombreSucursal}
        ciudad={ciudadEntregaNombre || ciudadNombre}
        direccion={getDireccionSucursal(nombreSucursal)}
        onCerrar={() => setAlertaEfectivoVisible(false)}
      />

      <AlertModal
        visible={alertaModal.visible}
        icono={alertaModal.icono}
        titulo={alertaModal.titulo}
        mensaje={alertaModal.mensaje}
        botones={alertaModal.botones}
        onCerrar={() => setAlertaModal((p) => ({ ...p, visible: false }))}
      />
    </View>
  );
}


