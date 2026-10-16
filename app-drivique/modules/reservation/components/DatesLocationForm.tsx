import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { useReservaStore } from "@/store/reservationStore";
import { COLOR_MARCA, formatHoraAmPm, getDetalleDuracionAlquiler, getMetodosPago } from "../constants/reservation.constants";
import { getSucursalPorNombre, getCiudadesData, getCiudadPorSucursal, getDireccionSucursal, getDisponibilidadVehiculo, getHorarioSucursal } from "@/modules/catalog/constants/catalog.constants";
import CalendarioRango from "./DateRangeCalendar";
import SelectorSucursalModal, { OpcionLugar } from "./BranchSelectorModal";
import SelectorHoraModal from "./TimeSelectorModal";
import { AlertaPagoEfectivo } from "./CashPaymentAlert";
import { AlertModal } from "@/components/ui/AlertModal";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { COLOR_ACENTO } from "@/constants/brandPalette";

interface Props {
  vehiculo: Vehiculo;
}

function formatFecha(fecha: string | null, fallback: string): string {
  if (!fecha) return fallback;
  const d = new Date(fecha + "T00:00:00");
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
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
      base.push({ value: "domicilio", label: t("reserva.fechasLugar.entregaDomicilio"), icono: "home-outline" });
      if (ciudadInfo?.tieneAeropuerto === true) {
        base.push({ value: "aeropuerto", label: t("reserva.fechasLugar.entregaAeropuerto"), icono: "airplane-outline" });
      }
      if (ciudadInfo?.tieneTerminal === true) {
        base.push({ value: "terminal", label: t("reserva.fechasLugar.entregaTerminal"), icono: "bus-outline" });
      }
    }
    return base;
  }, [nombreSucursal, esWompi, ciudadInfo, t]);

  const opcionesDevolucion: OpcionLugar[] = useMemo(() => {
    const base: OpcionLugar[] = [
      { value: nombreSucursal, label: t("reserva.fechasLugar.devolverEnSucursal", { sucursal: nombreSucursal }), icono: "business-outline" },
    ];
    if (esWompi) {
      base.push({ value: "domicilio", label: t("reserva.fechasLugar.devolucionDomicilio"), icono: "home-outline" });
      if (ciudadInfo?.tieneAeropuerto === true) {
        base.push({ value: "aeropuerto", label: t("reserva.fechasLugar.devolucionAeropuerto"), icono: "airplane-outline" });
      }
      if (ciudadInfo?.tieneTerminal === true) {
        base.push({ value: "terminal", label: t("reserva.fechasLugar.devolucionTerminal"), icono: "bus-outline" });
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
    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    let fInicioFmt = "";
    let fFinFmt = "";
    let fNextFmt = "";

    const pI = fechasLugar.fechaRetiro.split("T")[0].split("-").map(Number);
    if (pI.length === 3) fInicioFmt = `${pI[2]} de ${meses[pI[1] - 1]}`;

    const pF = fechasLugar.fechaDevolucion.split("T")[0].split("-").map(Number);
    if (pF.length === 3) {
      fFinFmt = `${pF[2]} de ${meses[pF[1] - 1]}`;
      const nextDt = new Date(pF[0], pF[1] - 1, pF[2]);
      nextDt.setDate(nextDt.getDate() + 1);
      fNextFmt = `${nextDt.getDate()} de ${meses[nextDt.getMonth()]}`;
    }

    const hAmPm = formatHoraAmPm(fechasLugar.horaRetiro);

    return {
      titulo: `Cómputo de tus ${diasReserva} ${diasReserva === 1 ? "día" : "días"} de alquiler`,
      desc: `Tu reserva empieza el ${fInicioFmt} a las ${hAmPm}.. Cada día te otorga 24 horas completas: tu ${diasReserva}º día inicia el ${fFinFmt} a las ${hAmPm} y sus 24 horas terminan el ${fNextFmt} a las ${hAmPm}.. Entregar antes registra tiempo de devolución anticipada.`,
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
      <View style={styles.metodosColumna}>
        {METODOS_PAGO.map((metodo) => {
          const activo = fechasLugar.metodoPago === metodo.id;
          const bloqueado = metodo.id === "efectivo" && !efectivoPermitido;
          return (
            <TouchableOpacity
              key={metodo.id}
              style={[
                styles.metodoCard,
                bloqueado && { opacity: 0.5 },
                {
                  borderColor: c.border,
                  backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                },
                activo && [styles.metodoCardActivo, { borderColor: primaryAccent, backgroundColor: c.primaryBg }],
              ]}
              onPress={() => {
                if (bloqueado) {
                  setAlertaModal({
                    visible: true,
                    icono: "alert-circle-outline",
                    titulo: t("reserva.fechasLugar.efectivoNoDisponibleTitulo", { defaultValue: "Pago en efectivo no disponible" }),
                    mensaje: t("reserva.fechasLugar.efectivoNoDisponibleMensaje", {
                      sucursal: nombreSucursal,
                      defaultValue: "La sucursal {{sucursal}} no recibe pagos en efectivo. Elige pago en línea o un vehículo de otra sucursal.",
                    }),
                  });
                  return;
                }
                actualizarFechasLugar({
                  metodoPago: metodo.id,
                  ...(metodo.id === "efectivo"
                    ? {
                        lugarRetiro: nombreSucursal,
                        lugarDevolucion: nombreSucursal,
                      }
                    : {}),
                });
                if (metodo.id === "efectivo") setAlertaEfectivoVisible(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.metodoHeaderRow}>
                <Text style={[styles.metodoTitulo, { color: c.textPrimary }, activo && { color: primaryAccent }]}>
                  {metodo.titulo}
                </Text>
                <View style={[styles.radio, { borderColor: c.border }, activo && [styles.radioActivo, { borderColor: primaryAccent }]]}>
                  {activo && <View style={[styles.radioPunto, { backgroundColor: primaryAccent }]} />}
                </View>
              </View>
              <Text style={[styles.metodoDesc, { color: c.textMuted }]}>
                {metodo.descripcion}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

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

      <View style={styles.filaDosCols}>
        <View style={styles.columnaMedia}>
          <View style={styles.headerConIcono}>
            <Ionicons name="location" size={14} color={COLOR_MARCA} />
            <Text style={[styles.tituloHeaderConIcono, { color: COLOR_MARCA }]} numberOfLines={1}>
              {t("reserva.fechasLugar.lugarDeRetiro")}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
            onPress={() => setModalTipo("retiro")}
            activeOpacity={0.8}
          >
            <View style={styles.selectValorRow}>
              <Text
                style={[
                  styles.selectValue,
                  { color: fechasLugar.lugarRetiro ? c.textPrimary : c.textMuted },
                ]}
                numberOfLines={1}
              >
                {labelLugarRetiro}
              </Text>
              <Ionicons name="chevron-down" size={14} color={c.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.columnaMedia}>
          <View style={styles.headerConIcono}>
            <Ionicons name="location" size={14} color={COLOR_MARCA} />
            <Text style={[styles.tituloHeaderConIcono, { color: COLOR_MARCA }]} numberOfLines={1}>
              {t("reserva.fechasLugar.lugarDeDevolucion")}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
            onPress={() => setModalTipo("devolucion")}
            activeOpacity={0.8}
          >
            <View style={styles.selectValorRow}>
              <Text
                style={[
                  styles.selectValue,
                  { color: fechasLugar.lugarDevolucion ? c.textPrimary : c.textMuted },
                ]}
                numberOfLines={1}
              >
                {labelLugarDevolucion}
              </Text>
              <Ionicons name="chevron-down" size={14} color={c.textMuted} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- INFO DE ENTREGA A DOMICILIO (solo si lugarRetiro === "domicilio") --- */}
      {mostrarDomicilioRetiro && (
        <View style={[styles.domicilioCard, { borderColor: c.border }]}>
          <Text style={[styles.domicilioTitulo, { color: COLOR_MARCA }]}>{t("reserva.fechasLugar.infoEntregaDomicilio")}</Text>

          <View style={[styles.ciudadBox, { backgroundColor: c.primaryBg }]}>
            <View style={styles.selectLabelRow}>
              <Ionicons name="location" size={13} color={COLOR_MARCA} />
              <Text style={[styles.ciudadLabel, { color: c.textMuted }]}>{t("reserva.fechasLugar.ciudadEntrega")}</Text>
            </View>
            <View style={styles.ciudadValorRow}>
              <Text style={[styles.ciudadValor, { color: c.textPrimary }]}>{ciudadEntregaNombre}</Text>
              <Text style={[styles.autoDetectado, { color: COLOR_MARCA }]}>{t("reserva.fechasLugar.autoDetectado")}</Text>
            </View>
          </View>

          <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.barrio")}</Text>
          <TextInput
            style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
            placeholder={t("reserva.fechasLugar.placeholderBarrio")}
            placeholderTextColor={c.textMuted}
            value={fechasLugar.barrioRetiro ?? ""}
            onChangeText={(texto) => actualizarFechasLugar({ barrioRetiro: texto })}
          />

          <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.direccion")}</Text>
          <TextInput
            style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
            placeholder={t("reserva.fechasLugar.placeholderDireccion")}
            placeholderTextColor={c.textMuted}
            value={fechasLugar.direccionRetiro ?? ""}
            onChangeText={(texto) => actualizarFechasLugar({ direccionRetiro: texto })}
          />

          <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.referenciasEntrega")}</Text>
          <TextInput
            style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
            placeholder={t("reserva.fechasLugar.placeholderReferencias")}
            placeholderTextColor={c.textMuted}
            value={fechasLugar.referenciasRetiro ?? ""}
            onChangeText={(texto) => actualizarFechasLugar({ referenciasRetiro: texto })}
          />
        </View>
      )}

      {/* --- INFO DE DEVOLUCIÓN A DOMICILIO (solo si lugarDevolucion === "domicilio") --- */}
      {mostrarDomicilioDevolucion && (
        <View style={[styles.domicilioCard, { borderColor: c.border }]}>
          <Text style={[styles.domicilioTitulo, { color: COLOR_MARCA }]}>{t("reserva.fechasLugar.infoDevolucionDomicilio")}</Text>

          <View style={[styles.ciudadBox, { backgroundColor: c.primaryBg }]}>
            <View style={styles.selectLabelRow}>
              <Ionicons name="location" size={13} color={COLOR_MARCA} />
              <Text style={[styles.ciudadLabel, { color: c.textMuted }]}>{t("reserva.fechasLugar.ciudadDevolucion")}</Text>
            </View>
            <View style={styles.ciudadValorRow}>
              <Text style={[styles.ciudadValor, { color: c.textPrimary }]}>{ciudadEntregaNombre}</Text>
              <Text style={[styles.autoDetectado, { color: COLOR_MARCA }]}>{t("reserva.fechasLugar.autoDetectado")}</Text>
            </View>
          </View>

          <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.barrio")}</Text>
          <TextInput
            style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
            placeholder={t("reserva.fechasLugar.placeholderBarrio")}
            placeholderTextColor={c.textMuted}
            value={fechasLugar.barrioDevolucion ?? ""}
            onChangeText={(texto) => actualizarFechasLugar({ barrioDevolucion: texto })}
          />

          <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.direccion")}</Text>
          <TextInput
            style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
            placeholder={t("reserva.fechasLugar.placeholderDireccion")}
            placeholderTextColor={c.textMuted}
            value={fechasLugar.direccionDevolucion ?? ""}
            onChangeText={(texto) => actualizarFechasLugar({ direccionDevolucion: texto })}
          />

          <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.referenciasDevolucion")}</Text>
          <TextInput
            style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
            placeholder={t("reserva.fechasLugar.placeholderReferencias")}
            placeholderTextColor={c.textMuted}
            value={fechasLugar.referenciasDevolucion ?? ""}
            onChangeText={(texto) => actualizarFechasLugar({ referenciasDevolucion: texto })}
          />
        </View>
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
      <View style={[styles.filaDosCols, { marginTop: 14, marginBottom: 0 }]}>
        <View style={styles.columnaMedia}>
          <View style={styles.headerConIcono}>
            <Ionicons name="calendar" size={14} color={COLOR_MARCA} />
            <Text style={[styles.tituloHeaderConIcono, { color: COLOR_MARCA }]} numberOfLines={1}>
              {t("reserva.fechasLugar.fechaDeRetiro", { defaultValue: "Fecha de retiro" })}
            </Text>
          </View>
          <View style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}>
            <Text
              style={[
                styles.selectValue,
                { color: fechasLugar.fechaRetiro ? c.textPrimary : c.textMuted },
              ]}
              numberOfLines={1}
            >
              {fechasLugar.fechaRetiro || t("reserva.fechasLugar.seleccionar", { defaultValue: "Seleccionar" })}
            </Text>
          </View>
        </View>

        <View style={styles.columnaMedia}>
          <View style={styles.headerConIcono}>
            <Ionicons name="calendar" size={14} color={COLOR_MARCA} />
            <Text style={[styles.tituloHeaderConIcono, { color: COLOR_MARCA }]} numberOfLines={1}>
              {t("reserva.fechasLugar.fechaDeDevolucion", { defaultValue: "Fecha de devolución" })}
            </Text>
          </View>
          <View style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}>
            <Text
              style={[
                styles.selectValue,
                { color: fechasLugar.fechaDevolucion ? c.textPrimary : c.textMuted },
              ]}
              numberOfLines={1}
            >
              {fechasLugar.fechaDevolucion || t("reserva.fechasLugar.seleccionar", { defaultValue: "Seleccionar" })}
            </Text>
          </View>
        </View>
      </View>

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
      <View style={[styles.filaDosCols, { marginTop: 12, marginBottom: 0 }]}>
        <View style={styles.columnaMedia}>
          <View style={styles.headerConIcono}>
            <Ionicons name="time" size={14} color={primaryAccent} />
            <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
              {t("vehiculo.selectPickupTime", { defaultValue: "Selecciona Hora de Retiro" })}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
            onPress={() => setHoraVisible("retiro")}
            activeOpacity={0.8}
          >
            <View style={styles.selectValorRow}>
              <Text
                style={[
                  styles.selectValue,
                  { color: fechasLugar.horaRetiro ? c.textPrimary : c.textMuted },
                ]}
                numberOfLines={1}
              >
                {fechasLugar.horaRetiro
                  ? formatHoraAmPm(fechasLugar.horaRetiro)
                  : t("reserva.fechasLugar.seleccionarHora", { defaultValue: "Seleccionar" })}
              </Text>
              <Ionicons name="chevron-down" size={14} color={c.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.columnaMedia}>
          <View style={styles.headerConIcono}>
            <Ionicons name="time" size={14} color={primaryAccent} />
            <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
              {t("vehiculo.selectReturnTime", { defaultValue: "Selecciona Hora de Devolución" })}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
            onPress={handleAbrirHoraDevolucion}
            activeOpacity={0.8}
          >
            <View style={styles.selectValorRow}>
              <Text
                style={[
                  styles.selectValue,
                  { color: fechasLugar.horaDevolucion ? c.textPrimary : c.textMuted },
                ]}
                numberOfLines={1}
              >
                {fechasLugar.horaDevolucion
                  ? formatHoraAmPm(fechasLugar.horaDevolucion)
                  : t("reserva.fechasLugar.seleccionarHora", { defaultValue: "Seleccionar" })}
              </Text>
              <Ionicons name="chevron-down" size={14} color={c.textMuted} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- DURACIÓN DEL ALQUILER Y DEVOLUCIÓN ANTICIPADA (IDÉNTICO A WEB) --- */}
      {diasReserva > 0 && (
        <View style={{ gap: 8, marginTop: 12 }}>
          {/* Fila 1: Duración del alquiler */}
          <View
            style={[
              styles.summaryRowCard,
              {
                backgroundColor: c.oscuro ? "rgba(47, 78, 162, 0.12)" : "rgba(47, 78, 162, 0.05)",
                borderColor: c.oscuro ? "rgba(47, 78, 162, 0.3)" : "rgba(47, 78, 162, 0.15)",
              },
            ]}
          >
            <View style={styles.summaryRowLeft}>
              <Ionicons name="hourglass-outline" size={15} color={c.textSecondary} />
              <Text style={[styles.summaryRowLabel, { color: c.textSecondary }]}>
                {t("vehiculo.rentalDuration", { defaultValue: "Duración del alquiler" })}
              </Text>
            </View>
            <Text style={[styles.summaryRowValue, { color: primaryAccent }]}>
              {diasReserva} {diasReserva === 1 ? t("vehiculo.day", { defaultValue: "día" }) : t("vehiculo.days", { defaultValue: "días" })}
            </Text>
          </View>

          {/* Fila 2: Devolución anticipada (solo si minutosDevolucion < minutosRetiro) */}
          {!!devolucionAnticipadaText && (
            <View
              style={[
                styles.summaryRowCard,
                {
                  backgroundColor: c.oscuro ? "rgba(47, 78, 162, 0.12)" : "rgba(47, 78, 162, 0.05)",
                  borderColor: c.oscuro ? "rgba(47, 78, 162, 0.3)" : "rgba(47, 78, 162, 0.15)",
                },
              ]}
            >
              <View style={styles.summaryRowLeft}>
                <Ionicons name="time-outline" size={15} color={c.textSecondary} />
                <Text style={[styles.summaryRowLabel, { color: c.textSecondary }]}>
                  {t("vehiculo.earlyReturn", { defaultValue: "Devolución anticipada" })}
                </Text>
              </View>
              <Text style={[styles.summaryRowValue, { color: primaryAccent }]}>
                {devolucionAnticipadaText}
              </Text>
            </View>
          )}
        </View>
      )}

      <SelectorSucursalModal
        visible={modalTipo !== null}
        titulo={modalTipo === "retiro" ? t("reserva.fechasLugar.lugarDeRetiroModal") : t("reserva.fechasLugar.lugarDeDevolucionModal")}
        opciones={modalTipo === "retiro" ? opcionesEntrega : opcionesDevolucion}
        onSeleccionar={handleElegirSucursal}
        onCerrar={() => setModalTipo(null)}
      />

      <SelectorHoraModal
        visible={horaVisible !== null}
        fecha={horaVisible === "retiro" ? fechasLugar.fechaRetiro : fechaDevolucionEfectiva}
        minHora={null}
        maxHora={
          horaVisible === "devolucion" && fechasLugar.horaRetiro
            ? fechasLugar.horaRetiro
            : null
        }
        subtitulo={
          horaVisible === "devolucion" && esUnSoloDia && fechasLugar.fechaRetiro
            ? `Devolución: ${fechaDevolucionEfectiva} (Día siguiente)`
            : null
        }
        alertaInformativa={
          horaVisible === "devolucion" && fechasLugar.horaRetiro
            ? {
                titulo: t("reserva.fechasLugar.alertaHoraDevolucionTitulo", {
                  defaultValue: `Hora máxima de devolución: ${formatHoraAmPm(fechasLugar.horaRetiro)}`,
                }),
                mensaje: t("reserva.fechasLugar.alertaHoraDevolucionMensaje", {
                  defaultValue: `Para cumplir con los ${diasReserva} ${diasReserva === 1 ? "día" : "días"} de tu reserva (retiro a las ${formatHoraAmPm(fechasLugar.horaRetiro)}), la hora límite de entrega es a las ${formatHoraAmPm(fechasLugar.horaRetiro)}. Si seleccionas una hora anterior, se calculará devolución anticipada.`,
                }),
              }
            : null
        }
        horaApertura={horaVisible === "retiro" ? horarioRetiro.horaApertura : horarioDevolucion.horaApertura}
        horaCierre={horaVisible === "retiro" ? horarioRetiro.horaCierre : horarioDevolucion.horaCierre}
        nombreSucursal={horaVisible === "retiro" ? (fechasLugar.lugarRetiro || nombreSucursal) : (fechasLugar.lugarDevolucion || nombreSucursal)}
        horaSeleccionada={horaVisible === "retiro" ? fechasLugar.horaRetiro : fechasLugar.horaDevolucion}
        onSeleccionar={handleElegirHora}
        onCerrar={() => setHoraVisible(null)}
      />

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

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tituloSeccion: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginBottom: 8,
    marginTop: 4,
  },
  primerLabel: { marginTop: 0 },
  labelConIcono: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4, marginBottom: 8 },
  filaDosCols: { flexDirection: "row", gap: 8, marginBottom: 14 },
  metodosColumna: {
    flexDirection: "column",
    gap: 10,
    marginBottom: 14,
  },
  metodoCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  metodoCardActivo: {
    borderWidth: 1.2,
  },
  metodoHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metodoTitulo: {
    fontSize: 12.5,
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  metodoDesc: {
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActivo: {},
  radioPunto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerConIcono: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8, marginTop: 2 },
  headerCalendarioContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  iconoCalendario: {
    marginTop: 2,
  },
  tituloCalendario: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
    color: COLOR_MARCA,
    lineHeight: 18,
    flex: 1,
  },
  tituloHeaderConIcono: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    color: COLOR_MARCA,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  columnaMedia: { flex: 1 },
  campoVerticalContainer: { marginBottom: 14 },
  puntoAutorizadoContainer: { marginBottom: 14 },
  puntoAutorizadoBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: "center",
  },
  puntoAutorizadoTexto: { fontSize: 12, fontWeight: "400" },
  notaPuntoAutorizadoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  notaPuntoAutorizadoTexto: {
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  selectBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: "center",
  },
  selectLabelRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 3 },
  selectLabel: { fontSize: 9, fontWeight: "700" },
  selectValue: { fontSize: 12, fontWeight: "400", flex: 1, marginRight: 4 },
  selectValorRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  // --- Bloque de información a domicilio ---
  domicilioCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    marginTop: -6,
  },
  domicilioTitulo: {
    fontSize: 12,
    fontWeight: "800",
    color: COLOR_MARCA,
    marginBottom: 10,
  },
  ciudadBox: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  ciudadLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 0.3 },
  ciudadValorRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  ciudadValor: { fontSize: 13, fontWeight: "700" },
  autoDetectado: { fontSize: 9, fontWeight: "700", color: COLOR_MARCA, letterSpacing: 0.3 },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 5,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 12,
    marginBottom: 4,
  },
  computoAlertCard: {
    marginTop: 10,
    marginBottom: 4,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  computoAlertTitulo: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  computoAlertDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  summaryRowCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryRowLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  summaryRowValue: {
    fontSize: 14,
    fontWeight: "800",
  },
  duracionStrip: {
    backgroundColor: "rgba(47, 78, 162, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(47, 78, 162, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  duracionValor: {
    fontSize: 12.5,
    fontWeight: "800",
    color: COLOR_MARCA,
    textAlign: "right",
    flexShrink: 1,
  },
});
