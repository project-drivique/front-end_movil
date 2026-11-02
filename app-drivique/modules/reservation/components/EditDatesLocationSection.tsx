import React, { useState, useMemo, useEffect } from "react";
import { Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { useReservaStore } from "@/store/reservationStore";
import { COLOR_MARCA, formatHoraAmPm, getDetalleDuracionAlquiler, getMetodosPago } from "../constants/reservation.constants";
import {
  getCiudadesData,
  getSucursalPorNombre,
  getCiudadPorSucursal,
  getDireccionSucursal,
  getDisponibilidadVehiculo,
  getHorarioSucursal,
} from "@/modules/catalog/constants/catalog.constants";

import SelectorSucursalModal, { OpcionLugar } from "./BranchSelectorModal";

import { AlertaPagoEfectivo } from "./CashPaymentAlert";
import { AlertModal } from "@/components/ui/AlertModal";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { GRADIENTES } from "@/constants/gradients";
import { COLOR_ACENTO } from "@/constants/brandPalette";
import { styles } from './EditDatesLocationSection/EditDatesLocationSection.styles'
import EditDatesLocationSectionPart3 from './EditDatesLocationSection/EditDatesLocationSectionPart3'
import EditDatesLocationSectionPart2 from './EditDatesLocationSection/EditDatesLocationSectionPart2'
import EditDatesLocationSectionPart from './EditDatesLocationSection/EditDatesLocationSectionPart'

interface Props {
  vehiculo: Vehiculo;
  onGuardar: () => void;
  onCancelar: () => void;
}

export default function EditDatesLocationSection({
  vehiculo,
  onGuardar,
  onCancelar,
}: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const METODOS_PAGO = useMemo(() => getMetodosPago(t), [t]);

  const storeFechasLugar = useReservaStore((s) => s.fechasLugar);
  const actualizarFechasLugar = useReservaStore((s) => s.actualizarFechasLugar);

  // Estado borrador local para poder cancelar sin alterar el store
  const [draft, setDraft] = useState({ ...storeFechasLugar });

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
  const ciudadInfo = ciudadNombre ? getCiudadesData().find((item) => item.nombre === ciudadNombre) : null;

  const horarioRetiro = useMemo(
    () => getHorarioSucursal(draft.lugarRetiro || nombreSucursal),
    [draft.lugarRetiro, nombreSucursal]
  );
  const horarioDevolucion = useMemo(
    () => getHorarioSucursal(draft.lugarDevolucion || nombreSucursal),
    [draft.lugarDevolucion, nombreSucursal]
  );

  const esWompi = draft.metodoPago === "wompi";
  const efectivoPermitido = getSucursalPorNombre(nombreSucursal)?.permiteEfectivo === true;
  const primaryAccent = c.oscuro ? COLOR_ACENTO : COLOR_MARCA;

  const opcionesEntrega: OpcionLugar[] = useMemo(() => {
    const base: OpcionLugar[] = [
      {
        value: nombreSucursal,
        label: t("reserva.fechasLugar.recogerEnSucursal", { sucursal: nombreSucursal }),
        icono: "business-outline",
      },
    ];
    if (esWompi) {
      base.push({
        value: "domicilio",
        label: t("reserva.fechasLugar.entregaDomicilio", { defaultValue: "Domicilio a casa" }),
        icono: "home-outline",
      });
      if (ciudadInfo?.tieneAeropuerto === true) {
        base.push({
          value: "aeropuerto",
          label: t("reserva.fechasLugar.entregaAeropuerto", { defaultValue: "Entrega en aeropuerto" }),
          icono: "airplane-outline",
        });
      }
      if (ciudadInfo?.tieneTerminal === true) {
        base.push({
          value: "terminal",
          label: t("reserva.fechasLugar.entregaTerminal", { defaultValue: "Entrega en terminal de transporte" }),
          icono: "bus-outline",
        });
      }
    }
    return base;
  }, [nombreSucursal, esWompi, ciudadInfo, t]);

  const opcionesDevolucion: OpcionLugar[] = useMemo(() => {
    const base: OpcionLugar[] = [
      {
        value: nombreSucursal,
        label: t("reserva.fechasLugar.devolverEnSucursal", { sucursal: nombreSucursal, defaultValue: `Devolver en sucursal (${nombreSucursal})` }),
        icono: "business-outline",
      },
    ];
    if (esWompi) {
      base.push({
        value: "domicilio",
        label: t("reserva.fechasLugar.devolucionDomicilio", { defaultValue: "Domicilio a casa" }),
        icono: "home-outline",
      });
      if (ciudadInfo?.tieneAeropuerto === true) {
        base.push({
          value: "aeropuerto",
          label: t("reserva.fechasLugar.devolucionAeropuerto", { defaultValue: "Devolución en aeropuerto" }),
          icono: "airplane-outline",
        });
      }
      if (ciudadInfo?.tieneTerminal === true) {
        base.push({
          value: "terminal",
          label: t("reserva.fechasLugar.devolucionTerminal", { defaultValue: "Devolución en terminal de transporte" }),
          icono: "bus-outline",
        });
      }
    }
    return base;
  }, [nombreSucursal, esWompi, ciudadInfo, t]);

  useEffect(() => {
    if (draft.metodoPago === "efectivo") {
      setDraft((prev) => ({
        ...prev,
        lugarRetiro: nombreSucursal,
        lugarDevolucion: nombreSucursal,
        barrioRetiro: "",
        direccionRetiro: "",
        referenciasRetiro: "",
        barrioDevolucion: "",
        direccionDevolucion: "",
        referenciasDevolucion: "",
      }));
    }
  }, [draft.metodoPago, nombreSucursal]);

  const handleElegirSucursal = (value: string) => {
    const horarioNuevo = getHorarioSucursal(value || nombreSucursal);
    const [hMinOpen, mMinOpen] = (horarioNuevo.horaApertura || "08:00").split(":").map(Number);
    const [hMaxClose, mMaxClose] = (horarioNuevo.horaCierre || "18:00").split(":").map(Number);
    const minMins = hMinOpen * 60 + mMinOpen;
    const maxMins = hMaxClose * 60 + mMaxClose;

    if (modalTipo === "retiro") {
      setDraft((prev) => {
        const next = { ...prev, lugarRetiro: value };
        if (prev.horaRetiro) {
          const [hr, mr] = prev.horaRetiro.split(":").map(Number);
          const totalMins = hr * 60 + mr;
          if (totalMins < minMins) next.horaRetiro = horarioNuevo.horaApertura;
          else if (totalMins > maxMins) next.horaRetiro = horarioNuevo.horaCierre;
        }
        return next;
      });
    }
    if (modalTipo === "devolucion") {
      setDraft((prev) => {
        const next = { ...prev, lugarDevolucion: value };
        if (prev.horaDevolucion) {
          const [hd, md] = prev.horaDevolucion.split(":").map(Number);
          const totalMins = hd * 60 + md;
          if (totalMins < minMins) next.horaDevolucion = horarioNuevo.horaApertura;
          else if (totalMins > maxMins) next.horaDevolucion = horarioNuevo.horaCierre;
        }
        return next;
      });
    }
    setModalTipo(null);
  };

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

  const esUnSoloDia =
    !!draft.fechaRetiro &&
    !!draft.fechaDevolucion &&
    draft.fechaRetiro === draft.fechaDevolucion;

  const fechaDevolucionEfectiva = esUnSoloDia
    ? getFechaSiguiente(draft.fechaRetiro) || draft.fechaDevolucion
    : draft.fechaDevolucion;

  const handleAbrirHoraDevolucion = () => {
    setHoraVisible("devolucion");
  };

  const handleElegirHora = (hora: string) => {
    const fecha = horaVisible === "retiro" ? draft.fechaRetiro : fechaDevolucionEfectiva;

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
      setDraft((prev) => ({
        ...prev,
        horaRetiro: hora,
        ...((!prev.horaDevolucion || prev.horaDevolucion > hora) ? { horaDevolucion: hora } : {}),
      }));
    } else if (horaVisible === "devolucion") {
      const nuevaFechaDev = esUnSoloDia
        ? getFechaSiguiente(draft.fechaRetiro) || draft.fechaDevolucion
        : draft.fechaDevolucion;

      setDraft((prev) => ({
        ...prev,
        horaDevolucion: hora,
        fechaDevolucion: nuevaFechaDev,
      }));
    }
  };

  const labelLugarRetiro =
    opcionesEntrega.find((o) => o.value === draft.lugarRetiro)?.label ||
    draft.lugarRetiro ||
    t("reserva.fechasLugar.seleccionar");
  const labelLugarDevolucion =
    opcionesDevolucion.find((o) => o.value === draft.lugarDevolucion)?.label ||
    draft.lugarDevolucion ||
    t("reserva.fechasLugar.seleccionar");

  const ciudadEntregaNombre = ciudadInfo?.nombre ?? ciudadNombre ?? "";
  const mostrarDomicilioRetiro = draft.lugarRetiro === "domicilio";
  const mostrarDomicilioDevolucion = draft.lugarDevolucion === "domicilio";

  const diasReserva = useMemo(() => {
    if (!draft.fechaRetiro || !draft.fechaDevolucion) return 0;
    const fInicioStr = draft.fechaRetiro.split("T")[0];
    const fFinStr = draft.fechaDevolucion.split("T")[0];
    const startDate = new Date(`${fInicioStr}T00:00:00`);
    const endDate = new Date(`${fFinStr}T00:00:00`);
    const diffTime = endDate.getTime() - startDate.getTime();
    let dias = Math.max(1, Math.round(diffTime / 86400000));
    if (fInicioStr === fFinStr) dias = 1;
    return dias;
  }, [draft.fechaRetiro, draft.fechaDevolucion]);

  const infoComputo = useMemo(() => {
    if (!draft.horaRetiro || diasReserva <= 0 || !draft.fechaRetiro || !draft.fechaDevolucion) {
      return null;
    }
    const fmtFecha = (d: number, m: number) => t("extra.computo.fecha", { d, mes: t(`extra.mesCorto.${m}`) });
    let fInicioFmt = "";
    let fFinFmt = "";
    let fNextFmt = "";

    const pI = draft.fechaRetiro.split("T")[0].split("-").map(Number);
    if (pI.length === 3) fInicioFmt = fmtFecha(pI[2], pI[1] - 1);

    const pF = draft.fechaDevolucion.split("T")[0].split("-").map(Number);
    if (pF.length === 3) {
      fFinFmt = fmtFecha(pF[2], pF[1] - 1);
      const nextDt = new Date(pF[0], pF[1] - 1, pF[2]);
      nextDt.setDate(nextDt.getDate() + 1);
      fNextFmt = fmtFecha(nextDt.getDate(), nextDt.getMonth());
    }

    const hAmPm = formatHoraAmPm(draft.horaRetiro);

    return {
      titulo: t("extra.computo.titulo", { n: diasReserva, dia: diasReserva === 1 ? t("reserva.fechasLugar.diaSingular", { defaultValue: "día" }) : t("reserva.fechasLugar.diaPlural", { defaultValue: "días" }) }),
      desc: t("extra.computo.desc", { inicio: fInicioFmt, fin: fFinFmt, siguiente: fNextFmt, hora: hAmPm, n: diasReserva }),
    };
  }, [draft.fechaRetiro, draft.fechaDevolucion, draft.horaRetiro, diasReserva]);

  const devolucionAnticipadaText = useMemo(() => {
    if (!draft.horaRetiro || !draft.horaDevolucion || diasReserva <= 0) return "";
    const [hR, mR] = draft.horaRetiro.split(":").map(Number);
    const [hD, mD] = draft.horaDevolucion.split(":").map(Number);
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
  }, [draft.horaRetiro, draft.horaDevolucion, diasReserva, t]);

  const infoDuracion = useMemo(() => {
    return getDetalleDuracionAlquiler(
      draft.fechaRetiro,
      draft.fechaDevolucion,
      draft.horaRetiro,
      draft.horaDevolucion,
      t
    );
  }, [draft.fechaRetiro, draft.fechaDevolucion, draft.horaRetiro, draft.horaDevolucion, t]);

  const handleGuardar = () => {
    actualizarFechasLugar(draft);
    onGuardar();
  };

  return (
    <View style={styles.container}>
      {/* Header con degradado corporativo */}
      <LinearGradient
        colors={GRADIENTES.boton.colors}
        start={GRADIENTES.boton.start}
        end={GRADIENTES.boton.end}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitulo}>
          {t("reserva.edicion.editarFechasYLugares", { defaultValue: "Editar Fechas y Ubicación" })}
        </Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("a11y.cerrar", "Cerrar")} onPress={onCancelar} hitSlop={10}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <EditDatesLocationSectionPart METODOS_PAGO={METODOS_PAGO} c={c} ciudadEntregaNombre={ciudadEntregaNombre} devolucionAnticipadaText={devolucionAnticipadaText} diasReserva={diasReserva} draft={draft} efectivoPermitido={efectivoPermitido} handleAbrirHoraDevolucion={handleAbrirHoraDevolucion} infoComputo={infoComputo} labelLugarDevolucion={labelLugarDevolucion} labelLugarRetiro={labelLugarRetiro} mostrarDomicilioDevolucion={mostrarDomicilioDevolucion} mostrarDomicilioRetiro={mostrarDomicilioRetiro} nombreSucursal={nombreSucursal} primaryAccent={primaryAccent} setAlertaEfectivoVisible={setAlertaEfectivoVisible} setAlertaModal={setAlertaModal} setDraft={setDraft} setHoraVisible={setHoraVisible} setModalTipo={setModalTipo} t={t} vehiculo={vehiculo} />

      {/* 8. Botones Footer: Cancelar y Guardar cambios */}
      <EditDatesLocationSectionPart2 c={c} handleGuardar={handleGuardar} onCancelar={onCancelar} t={t} />

      <SelectorSucursalModal
        visible={modalTipo !== null}
        titulo={
          modalTipo === "retiro"
            ? t("reserva.fechasLugar.lugarDeRetiroModal")
            : t("reserva.fechasLugar.lugarDeDevolucionModal")
        }
        opciones={modalTipo === "retiro" ? opcionesEntrega : opcionesDevolucion}
        onSeleccionar={handleElegirSucursal}
        onCerrar={() => setModalTipo(null)}
      />

      <EditDatesLocationSectionPart3 draft={draft} esUnSoloDia={esUnSoloDia} fechaDevolucionEfectiva={fechaDevolucionEfectiva} handleElegirHora={handleElegirHora} horaVisible={horaVisible} infoDuracion={infoDuracion} nombreSucursal={nombreSucursal} setHoraVisible={setHoraVisible} t={t} />

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



export { EditDatesLocationSection };

