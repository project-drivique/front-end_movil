import React, { useState, useMemo, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { useReservaStore } from "@/store/reservationStore";
import { COLOR_MARCA, formatHoraAmPm, getDetalleDuracionAlquiler, getMetodosPago } from "../constants/reservation.constants";
import {
  CIUDADES_DATA,
  getCiudadPorSucursal,
  getDireccionSucursal,
  getDisponibilidadVehiculo,
  getHorarioSucursal,
} from "@/modules/catalog/constants/catalog.constants";
import CalendarioRango from "./DateRangeCalendar";
import SelectorSucursalModal, { OpcionLugar } from "./BranchSelectorModal";
import SelectorHoraModal from "./TimeSelectorModal";
import { AlertaPagoEfectivo } from "./CashPaymentAlert";
import { AlertModal } from "@/components/ui/AlertModal";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { GRADIENTES } from "@/constants/gradients";

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
  const ciudadInfo = ciudadNombre ? CIUDADES_DATA.find((item) => item.nombre === ciudadNombre) : null;

  const horarioRetiro = useMemo(
    () => getHorarioSucursal(draft.lugarRetiro || nombreSucursal),
    [draft.lugarRetiro, nombreSucursal]
  );
  const horarioDevolucion = useMemo(
    () => getHorarioSucursal(draft.lugarDevolucion || nombreSucursal),
    [draft.lugarDevolucion, nombreSucursal]
  );

  const esWompi = draft.metodoPago === "wompi";
  const primaryAccent = c.oscuro ? "#60A5FA" : COLOR_MARCA;

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
        label: t("reserva.fechasLugar.entregaDomicilio"),
        icono: "home-outline",
      });
      if (ciudadInfo?.tieneAeropuerto !== false) {
        base.push({
          value: "aeropuerto",
          label: t("reserva.fechasLugar.entregaAeropuerto"),
          icono: "airplane-outline",
        });
      }
      base.push({
        value: "terminal",
        label: t("reserva.fechasLugar.entregaTerminal"),
        icono: "bus-outline",
      });
    }
    return base;
  }, [nombreSucursal, esWompi, ciudadInfo, t]);

  const opcionesDevolucion: OpcionLugar[] = useMemo(() => {
    const base: OpcionLugar[] = [
      {
        value: nombreSucursal,
        label: t("reserva.fechasLugar.devolverEnSucursal", { sucursal: nombreSucursal }),
        icono: "business-outline",
      },
    ];
    if (esWompi) {
      base.push({
        value: "domicilio",
        label: t("reserva.fechasLugar.devolucionDomicilio"),
        icono: "home-outline",
      });
      if (ciudadInfo?.tieneAeropuerto !== false) {
        base.push({
          value: "aeropuerto",
          label: t("reserva.fechasLugar.devolucionAeropuerto"),
          icono: "airplane-outline",
        });
      }
      base.push({
        value: "terminal",
        label: t("reserva.fechasLugar.devolucionTerminal"),
        icono: "bus-outline",
      });
    }
    return base;
  }, [nombreSucursal, esWompi, ciudadInfo, t]);

  useEffect(() => {
    if (draft.metodoPago === "efectivo") {
      setDraft((prev) => ({
        ...prev,
        lugarRetiro: nombreSucursal,
        lugarDevolucion: nombreSucursal,
      }));
    }
  }, [draft.metodoPago, nombreSucursal]);

  const handleElegirSucursal = (value: string) => {
    if (modalTipo === "retiro") setDraft((prev) => ({ ...prev, lugarRetiro: value }));
    if (modalTipo === "devolucion") setDraft((prev) => ({ ...prev, lugarDevolucion: value }));
    setModalTipo(null);
  };

  const handleAbrirHoraDevolucion = () => {
    if (
      draft.fechaRetiro &&
      draft.fechaRetiro === draft.fechaDevolucion &&
      draft.horaRetiro === horarioRetiro.horaCierre
    ) {
      setAlertaModal({
        visible: true,
        icono: "time-outline",
        titulo: t("reserva.fechasLugar.sinHorasMismoDiaTitulo", { defaultValue: "Hora de devolución" }),
        mensaje: t("reserva.fechasLugar.sinHorasMismoDiaMensaje", {
          defaultValue: `Como la hora de retiro es a las ${formatHoraAmPm(horarioRetiro.horaCierre)} (cierre de sucursal), la devolución debe realizarse a partir del día siguiente.`,
        }),
        botones: [
          {
            texto: t("comun.cancelar", { defaultValue: "Cancelar" }),
            variante: "secundario",
            onPress: () => setAlertaModal((p) => ({ ...p, visible: false })),
          },
          {
            texto: t("reserva.fechasLugar.moverDiaSiguiente", { defaultValue: "Mover a mañana" }),
            variante: "primario",
            onPress: () => {
              setAlertaModal((p) => ({ ...p, visible: false }));
              const [y, m, d] = draft.fechaRetiro!.split("-").map(Number);
              const sigDia = new Date(y, m - 1, d + 1);
              const ySig = sigDia.getFullYear();
              const mSig = String(sigDia.getMonth() + 1).padStart(2, "0");
              const dSig = String(sigDia.getDate()).padStart(2, "0");
              const fechaSigStr = `${ySig}-${mSig}-${dSig}`;
              setDraft((prev) => ({ ...prev, fechaDevolucion: fechaSigStr, horaDevolucion: "" }));
              setHoraVisible("devolucion");
            },
          },
        ],
      });
      return;
    }
    setHoraVisible("devolucion");
  };

  const handleElegirHora = (hora: string) => {
    const fecha = horaVisible === "retiro" ? draft.fechaRetiro : draft.fechaDevolucion;

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
      if (
        hora === horarioRetiro.horaCierre &&
        draft.fechaRetiro &&
        draft.fechaRetiro === draft.fechaDevolucion
      ) {
        const [y, m, d] = draft.fechaRetiro.split("-").map(Number);
        const sigDia = new Date(y, m - 1, d + 1);
        const ySig = sigDia.getFullYear();
        const mSig = String(sigDia.getMonth() + 1).padStart(2, "0");
        const dSig = String(sigDia.getDate()).padStart(2, "0");
        const fechaSigStr = `${ySig}-${mSig}-${dSig}`;
        setDraft((prev) => ({
          ...prev,
          horaRetiro: hora,
          fechaDevolucion: fechaSigStr,
          horaDevolucion: "",
        }));
        setAlertaModal({
          visible: true,
          icono: "information-circle-outline",
          titulo: t("reserva.fechasLugar.ajusteDevolucionTitulo", { defaultValue: "Fecha de devolución ajustada" }),
          mensaje: t("reserva.fechasLugar.ajusteDevolucionMensaje", {
            defaultValue: `Al retirar a las ${formatHoraAmPm(horarioRetiro.horaCierre)} (hora de cierre), la fecha de devolución se ajustó automáticamente para el día siguiente.`,
          }),
          botones: [
            {
              texto: t("comun.aceptar", { defaultValue: "Aceptar" }),
              variante: "primario",
              onPress: () => setAlertaModal((p) => ({ ...p, visible: false })),
            },
          ],
        });
      } else {
        const esMismoDia = draft.fechaDevolucion === draft.fechaRetiro;

        setDraft((prev) => {
          const nuevoDraft = {
            ...prev,
            horaRetiro: hora,
          };
          if (esMismoDia && prev.horaDevolucion && prev.horaDevolucion <= hora) {
            nuevoDraft.horaDevolucion = "";
          }
          return nuevoDraft;
        });
      }
    } else if (horaVisible === "devolucion") {
      setDraft((prev) => ({ ...prev, horaDevolucion: hora }));
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
        <TouchableOpacity onPress={onCancelar} hitSlop={10}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: c.bgCard, borderColor: c.border }]}>
          {/* 1. Método de pago preferido */}
          <View style={styles.headerConIcono}>
            <Ionicons name="card-outline" size={14} color={primaryAccent} />
            <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]}>
              {t("reserva.fechasLugar.metodoPagoPreferido")}
            </Text>
          </View>
          <View style={styles.metodosFila}>
            {METODOS_PAGO.map((metodo) => {
              const activo = draft.metodoPago === metodo.id;
              return (
                <TouchableOpacity
                  key={metodo.id}
                  style={[
                    styles.metodoCard,
                    {
                      borderColor: c.border,
                      backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                    },
                    activo && [styles.metodoCardActivo, { borderColor: primaryAccent, backgroundColor: c.primaryBg }],
                  ]}
                  onPress={() => {
                    setDraft((prev) => ({
                      ...prev,
                      metodoPago: metodo.id,
                      ...(metodo.id === "efectivo"
                        ? {
                            lugarRetiro: nombreSucursal,
                            lugarDevolucion: nombreSucursal,
                          }
                        : {}),
                    }));
                    if (metodo.id === "efectivo") setAlertaEfectivoVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.metodoHeaderRow}>
                    <Text style={[styles.metodoTitulo, { color: c.textPrimary }, activo && { color: primaryAccent }]}>
                      {metodo.titulo}
                    </Text>
                    <View
                      style={[
                        styles.radio,
                        { borderColor: c.border },
                        activo && [styles.radioActivo, { borderColor: primaryAccent }],
                      ]}
                    >
                      {activo && <View style={[styles.radioPunto, { backgroundColor: primaryAccent }]} />}
                    </View>
                  </View>
                  <Text style={[styles.metodoDesc, { color: c.textMuted }]}>{metodo.descripcion}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 2. Punto autorizado para pago en efectivo */}
          {draft.metodoPago === "efectivo" && (
            <View style={styles.puntoAutorizadoContainer}>
              <View style={styles.headerConIcono}>
                <Ionicons name="location" size={14} color={primaryAccent} />
                <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]}>
                  {t("reserva.fechasLugar.puntoAutorizadoEfectivo", {
                    defaultValue: "Punto autorizado para pago en efectivo",
                  })}
                </Text>
              </View>
              <View
                style={[
                  styles.puntoAutorizadoBox,
                  { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" },
                ]}
              >
                <Text style={[styles.puntoAutorizadoTexto, { color: c.textPrimary }]} numberOfLines={1}>
                  {`${nombreSucursal}${ciudadEntregaNombre ? ` · ${ciudadEntregaNombre}` : ""}`}
                </Text>
              </View>
            </View>
          )}

          {/* 3. Lugares de retiro y devolución */}
          <View style={styles.filaDosCols}>
            <View style={styles.columnaMedia}>
              <View style={styles.headerConIcono}>
                <Ionicons name="location" size={14} color={primaryAccent} />
                <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
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
                    style={[styles.selectValue, { color: draft.lugarRetiro ? c.textPrimary : c.textMuted }]}
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
                <Ionicons name="location" size={14} color={primaryAccent} />
                <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
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
                    style={[styles.selectValue, { color: draft.lugarDevolucion ? c.textPrimary : c.textMuted }]}
                    numberOfLines={1}
                  >
                    {labelLugarDevolucion}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={c.textMuted} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Domicilio retiro info */}
          {mostrarDomicilioRetiro && (
            <View style={[styles.domicilioCard, { borderColor: c.border }]}>
              <Text style={[styles.domicilioTitulo, { color: primaryAccent }]}>
                {t("reserva.fechasLugar.infoEntregaDomicilio")}
              </Text>
              <View style={[styles.ciudadBox, { backgroundColor: c.primaryBg }]}>
                <View style={styles.selectLabelRow}>
                  <Ionicons name="location" size={13} color={primaryAccent} />
                  <Text style={[styles.ciudadLabel, { color: c.textMuted }]}>
                    {t("reserva.fechasLugar.ciudadEntrega")}
                  </Text>
                </View>
                <View style={styles.ciudadValorRow}>
                  <Text style={[styles.ciudadValor, { color: c.textPrimary }]}>{ciudadEntregaNombre}</Text>
                  <Text style={[styles.autoDetectado, { color: primaryAccent }]}>
                    {t("reserva.fechasLugar.autoDetectado")}
                  </Text>
                </View>
              </View>
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.barrio")}</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" },
                ]}
                placeholder={t("reserva.fechasLugar.placeholderBarrio")}
                placeholderTextColor={c.textMuted}
                value={draft.barrioRetiro ?? ""}
                onChangeText={(texto) => setDraft((prev) => ({ ...prev, barrioRetiro: texto }))}
              />
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.direccion")}</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" },
                ]}
                placeholder={t("reserva.fechasLugar.placeholderDireccion")}
                placeholderTextColor={c.textMuted}
                value={draft.direccionRetiro ?? ""}
                onChangeText={(texto) => setDraft((prev) => ({ ...prev, direccionRetiro: texto }))}
              />
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>
                {t("reserva.fechasLugar.referenciasEntrega")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" },
                ]}
                placeholder={t("reserva.fechasLugar.placeholderReferencias")}
                placeholderTextColor={c.textMuted}
                value={draft.referenciasRetiro ?? ""}
                onChangeText={(texto) => setDraft((prev) => ({ ...prev, referenciasRetiro: texto }))}
              />
            </View>
          )}

          {/* Domicilio devolución info */}
          {mostrarDomicilioDevolucion && (
            <View style={[styles.domicilioCard, { borderColor: c.border }]}>
              <Text style={[styles.domicilioTitulo, { color: primaryAccent }]}>
                {t("reserva.fechasLugar.infoDevolucionDomicilio")}
              </Text>
              <View style={[styles.ciudadBox, { backgroundColor: c.primaryBg }]}>
                <View style={styles.selectLabelRow}>
                  <Ionicons name="location" size={13} color={primaryAccent} />
                  <Text style={[styles.ciudadLabel, { color: c.textMuted }]}>
                    {t("reserva.fechasLugar.ciudadDevolucion")}
                  </Text>
                </View>
                <View style={styles.ciudadValorRow}>
                  <Text style={[styles.ciudadValor, { color: c.textPrimary }]}>{ciudadEntregaNombre}</Text>
                  <Text style={[styles.autoDetectado, { color: primaryAccent }]}>
                    {t("reserva.fechasLugar.autoDetectado")}
                  </Text>
                </View>
              </View>
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.barrio")}</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" },
                ]}
                placeholder={t("reserva.fechasLugar.placeholderBarrio")}
                placeholderTextColor={c.textMuted}
                value={draft.barrioDevolucion ?? ""}
                onChangeText={(texto) => setDraft((prev) => ({ ...prev, barrioDevolucion: texto }))}
              />
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.direccion")}</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" },
                ]}
                placeholder={t("reserva.fechasLugar.placeholderDireccion")}
                placeholderTextColor={c.textMuted}
                value={draft.direccionDevolucion ?? ""}
                onChangeText={(texto) => setDraft((prev) => ({ ...prev, direccionDevolucion: texto }))}
              />
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>
                {t("reserva.fechasLugar.referenciasDevolucion")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: c.border, color: c.textPrimary, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" },
                ]}
                placeholder={t("reserva.fechasLugar.placeholderReferencias")}
                placeholderTextColor={c.textMuted}
                value={draft.referenciasDevolucion ?? ""}
                onChangeText={(texto) => setDraft((prev) => ({ ...prev, referenciasDevolucion: texto }))}
              />
            </View>
          )}

          {/* 4. Calendario de disponibilidad */}
          <View style={styles.headerCalendarioContainer}>
            <Ionicons name="calendar" size={14} color={primaryAccent} style={styles.iconoCalendario} />
            <Text style={[styles.tituloCalendario, { color: primaryAccent }]}>
              {t("reserva.fechasLugar.calendarioDisponibilidad", {
                defaultValue: "Selecciona un rango de fechas en el calendario de disponibilidad",
              })}
            </Text>
          </View>
          <CalendarioRango
            vehiculo={vehiculo}
            fechaRetiro={draft.fechaRetiro}
            fechaDevolucion={draft.fechaDevolucion}
            onCambiarFechas={(retiro, devolucion) =>
              setDraft((prev) => ({ ...prev, fechaRetiro: retiro, fechaDevolucion: devolucion }))
            }
          />

          {/* 5. Fechas automáticas seleccionadas */}
          <View style={[styles.filaDosCols, { marginTop: 14, marginBottom: 0 }]}>
            <View style={styles.columnaMedia}>
              <View style={styles.headerConIcono}>
                <Ionicons name="calendar" size={14} color={primaryAccent} />
                <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
                  {t("reserva.fechasLugar.fechaDeRetiro", { defaultValue: "Fecha de retiro" })}
                </Text>
              </View>
              <View
                style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
              >
                <Text
                  style={[styles.selectValue, { color: draft.fechaRetiro ? c.textPrimary : c.textMuted }]}
                  numberOfLines={1}
                >
                  {draft.fechaRetiro || t("reserva.fechasLugar.seleccionar", { defaultValue: "Seleccionar" })}
                </Text>
              </View>
            </View>

            <View style={styles.columnaMedia}>
              <View style={styles.headerConIcono}>
                <Ionicons name="calendar" size={14} color={primaryAccent} />
                <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
                  {t("reserva.fechasLugar.fechaDeDevolucion", { defaultValue: "Fecha de devolución" })}
                </Text>
              </View>
              <View
                style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
              >
                <Text
                  style={[styles.selectValue, { color: draft.fechaDevolucion ? c.textPrimary : c.textMuted }]}
                  numberOfLines={1}
                >
                  {draft.fechaDevolucion || t("reserva.fechasLugar.seleccionar", { defaultValue: "Seleccionar" })}
                </Text>
              </View>
            </View>
          </View>

          {/* 6. Horas de retiro y devolución */}
          <View style={[styles.filaDosCols, { marginTop: 12, marginBottom: 0 }]}>
            <View style={styles.columnaMedia}>
              <View style={styles.headerConIcono}>
                <Ionicons name="time" size={14} color={primaryAccent} />
                <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
                  {t("reserva.fechasLugar.horaDeRetiro")}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
                onPress={() => setHoraVisible("retiro")}
                activeOpacity={0.8}
              >
                <View style={styles.selectValorRow}>
                  <Text
                    style={[styles.selectValue, { color: draft.horaRetiro ? c.textPrimary : c.textMuted }]}
                    numberOfLines={1}
                  >
                    {draft.horaRetiro
                      ? formatHoraAmPm(draft.horaRetiro)
                      : t("reserva.fechasLugar.seleccionarHora", { defaultValue: "Seleccionar hora" })}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={c.textMuted} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.columnaMedia}>
              <View style={styles.headerConIcono}>
                <Ionicons name="time" size={14} color={primaryAccent} />
                <Text style={[styles.tituloHeaderConIcono, { color: primaryAccent }]} numberOfLines={1}>
                  {t("reserva.fechasLugar.horaDeDevolucion")}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.selectBox, { borderColor: c.border, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
                onPress={handleAbrirHoraDevolucion}
                activeOpacity={0.8}
              >
                <View style={styles.selectValorRow}>
                  <Text
                    style={[styles.selectValue, { color: draft.horaDevolucion ? c.textPrimary : c.textMuted }]}
                    numberOfLines={1}
                  >
                    {draft.horaDevolucion
                      ? formatHoraAmPm(draft.horaDevolucion)
                      : t("reserva.fechasLugar.seleccionarHora", { defaultValue: "Seleccionar hora" })}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={c.textMuted} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* 7. Strip Duración del alquiler */}
          {!!infoDuracion && (
            <View
              style={[
                styles.duracionStrip,
                c.oscuro
                  ? { backgroundColor: "rgba(47, 78, 162, 0.16)", borderColor: "rgba(47, 78, 162, 0.35)" }
                  : { backgroundColor: "rgba(47, 78, 162, 0.04)", borderColor: "rgba(47, 78, 162, 0.15)" },
              ]}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.duracionFilaSuperior}>
                  <View style={styles.duracionLeftRow}>
                    <Ionicons name="hourglass-outline" size={15} color={primaryAccent} />
                    <Text style={[styles.duracionLabel, { color: c.textSecondary }]}>
                      {t("reserva.fechasLugar.duracionAlquiler", { defaultValue: "Duración del alquiler" })}
                    </Text>
                  </View>
                  <Text style={[styles.duracionValor, { color: primaryAccent }]}>{infoDuracion.titulo}</Text>
                </View>

                {!!infoDuracion.tiempoUso && (
                  <View
                    style={[
                      styles.duracionFilaInferior,
                      { borderTopColor: c.oscuro ? "rgba(255, 255, 255, 0.08)" : "rgba(47, 78, 162, 0.12)" },
                    ]}
                  >
                    <View style={styles.duracionLeftRow}>
                      <Ionicons name="time-outline" size={15} color={primaryAccent} />
                      <Text style={[styles.duracionLabel, { color: c.textSecondary }]}>
                        {t("reserva.fechasLugar.devolucionAnticipada", { defaultValue: "Devolución anticipada" })}
                      </Text>
                    </View>
                    <Text style={[styles.duracionValor, { color: primaryAccent }]} numberOfLines={1}>
                      {infoDuracion.tiempoUso}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

        </View>
      </ScrollView>

      {/* 8. Botones Footer: Cancelar y Guardar cambios */}
      <View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.bg }]}>
        <TouchableOpacity
          style={[
            styles.cancelarBtn,
            { borderColor: c.border, backgroundColor: c.oscuro ? c.bgCard : "#FFFFFF" },
          ]}
          onPress={onCancelar}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelarBtnTexto, { color: c.textPrimary }]}>
            {t("comun.cancelar", { defaultValue: "Cancelar" })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guardarBtnWrap} onPress={handleGuardar} activeOpacity={0.85}>
          <LinearGradient
            colors={GRADIENTES.boton.colors}
            start={GRADIENTES.boton.start}
            end={GRADIENTES.boton.end}
            style={styles.guardarBtn}
          >
            <Text style={styles.guardarBtnTexto}>
              {t("reserva.edicion.guardarCambios", { defaultValue: "Guardar cambios" })}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

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

      <SelectorHoraModal
        visible={horaVisible !== null}
        fecha={horaVisible === "retiro" ? draft.fechaRetiro : draft.fechaDevolucion}
        minHora={null}
        maxHora={
          horaVisible === "devolucion" && draft.horaRetiro
            ? draft.horaRetiro
            : null
        }
        subtitulo={null}
        alertaInformativa={
          horaVisible === "devolucion" && draft.horaRetiro
            ? {
                titulo: t("reserva.fechasLugar.alertaHoraDevolucionTitulo", {
                  defaultValue: `Hora máxima de devolución: ${formatHoraAmPm(draft.horaRetiro)}`,
                }),
                mensaje: t("reserva.fechasLugar.alertaHoraDevolucionMensaje", {
                  defaultValue: `Para cumplir con los ${infoDuracion?.titulo ?? "días"} de tu reserva (retiro a las ${formatHoraAmPm(draft.horaRetiro)}), la hora límite de entrega es a las ${formatHoraAmPm(draft.horaRetiro)}. Si seleccionas una hora anterior, se calculará devolución anticipada.`,
                }),
              }
            : null
        }
        horaApertura={horaVisible === "retiro" ? horarioRetiro.horaApertura : horarioDevolucion.horaApertura}
        horaCierre={horaVisible === "retiro" ? horarioRetiro.horaCierre : horarioDevolucion.horaCierre}
        nombreSucursal={horaVisible === "retiro" ? (draft.lugarRetiro || nombreSucursal) : (draft.lugarDevolucion || nombreSucursal)}
        horaSeleccionada={horaVisible === "retiro" ? draft.horaRetiro : draft.horaDevolucion}
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
  container: {
    flex: 1,
  },
  headerGradient: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerTitulo: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  headerConIcono: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    marginTop: 2,
  },
  tituloHeaderConIcono: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  metodosFila: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  metodoCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  metodoCardActivo: {
    borderWidth: 1.2,
  },
  metodoHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  metodoTitulo: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
    marginRight: 6,
  },
  metodoDesc: {
    fontSize: 10,
    lineHeight: 14,
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
  filaDosCols: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  columnaMedia: {
    flex: 1,
  },
  puntoAutorizadoContainer: {
    marginBottom: 14,
  },
  puntoAutorizadoBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: "center",
  },
  puntoAutorizadoTexto: {
    fontSize: 12,
    fontWeight: "400",
  },
  selectBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: "center",
  },
  selectValorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectValue: {
    fontSize: 12,
    fontWeight: "400",
    flex: 1,
    marginRight: 4,
  },
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
    lineHeight: 18,
    flex: 1,
  },
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
    marginBottom: 10,
  },
  ciudadBox: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  selectLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
  ciudadLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  ciudadValorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  ciudadValor: {
    fontSize: 13,
    fontWeight: "700",
  },
  autoDetectado: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
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
  duracionStrip: {
    backgroundColor: "rgba(47, 78, 162, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(47, 78, 162, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  duracionFilaSuperior: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  duracionFilaInferior: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 7,
    paddingTop: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  duracionLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  duracionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  duracionValor: {
    fontSize: 12.5,
    fontWeight: "800",
    color: COLOR_MARCA,
    textAlign: "right",
    flexShrink: 1,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: "row",
    gap: 12,
  },
  cancelarBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelarBtnTexto: {
    fontSize: 14,
    fontWeight: "700",
  },
  guardarBtnWrap: {
    flex: 1.5,
    borderRadius: 12,
    overflow: "hidden",
  },
  guardarBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  guardarBtnTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
