// modules/reserva/components/ResumenReservaModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { useReservaStore } from "@/store/reservationStore";
import { GRADIENTES } from "@/constants/gradients";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import {
  COLOR_MARCA,
  getMetodosPago, PORCENTAJE_CARGOS_ADMINISTRATIVOS, PORCENTAJE_IVA,
  RECARGO_LOGISTICO, formatHoraAmPm,
} from "../constants/reservation.constants";
import { CIUDADES_DATA, getCiudadPorSucursal, getDireccionSucursal } from "@/modules/catalog/constants/catalog.constants";
import CalendarioRango from "./DateRangeCalendar";
import SelectorSucursalModal, { OpcionLugar } from "./BranchSelectorModal";
import SelectorHoraModal from "./TimeSelectorModal";
import { AlertaPagoEfectivo } from "./CashPaymentAlert";
import {
  fmt, fmtPct, fechaHora, diasEntre,
  SubcardHeader, SubcardHeaderEditando, FilaDato, OpcionCard, ServicioRow, LineaPrecio, FilaBotonesEdicion,
  styles as piezas,
} from "./BookingSummaryModal.pieces";
import { useMonedaStore } from "@/store/currencyStore";

interface Props {
  visible: boolean;
  vehiculo: Vehiculo;
  onCerrar: () => void;
  mostrarPlanes?: boolean;
  seccionFechasCompleta?: boolean;
}

type Modo = "resumen" | "editarPago" | "editarFechas" | "editarPlanes";

export default function ResumenReservaModal({
  visible,
  vehiculo,
  onCerrar,
  mostrarPlanes = false,
  seccionFechasCompleta = false,
}: Props) {
  const insets = useSafeAreaInsets();
  useMonedaStore();
  const c = useTemaColores();
  const { t } = useTranslation();
  const METODOS_PAGO = useMemo(() => getMetodosPago(t), [t]);
  const fechasLugar = useReservaStore((s) => s.fechasLugar);
  const actualizarFechasLugar = useReservaStore((s) => s.actualizarFechasLugar);
  const planes = useReservaStore((s) => s.planes);
  const actualizarPlanes = useReservaStore((s) => s.actualizarPlanes);
  const cuponAplicado = useReservaStore((s) => s.cuponAplicado);

  const [modo, setModo] = useState<Modo>("resumen");
  const [modalLugar, setModalLugar] = useState<"retiro" | "devolucion" | null>(null);
  const [horaVisible, setHoraVisible] = useState<"retiro" | "devolucion" | null>(null);
  const [alertaEfectivoVisible, setAlertaEfectivoVisible] = useState(false);
  const [draftPago, setDraftPago] = useState(fechasLugar);
  const [draftFechas, setDraftFechas] = useState(fechasLugar);
  const [draftPlanes, setDraftPlanes] = useState(planes);

  const primaryAccent = c.oscuro ? "#60A5FA" : COLOR_MARCA;

  const nombreSucursal = vehiculo.sucursal ?? "";
  const ciudadInfo = nombreSucursal
    ? CIUDADES_DATA.find((c) => c.nombre === getCiudadPorSucursal(nombreSucursal))
    : null;

  const construirOpciones = (modo: "entrega" | "devolucion", esWompi: boolean): OpcionLugar[] => {
    const base: OpcionLugar[] = [{
      value: nombreSucursal,
      label: modo === "entrega"
        ? t("reserva.fechasLugar.recogerEnSucursal", { sucursal: nombreSucursal })
        : t("reserva.fechasLugar.devolverEnSucursal", { sucursal: nombreSucursal }),
      icono: "business-outline",
    }];
    if (!esWompi) return base;
    base.push({
      value: "domicilio",
      label: t(modo === "entrega" ? "reserva.fechasLugar.entregaDomicilio" : "reserva.fechasLugar.devolucionDomicilio"),
      icono: "home-outline",
    });
    if (ciudadInfo?.tieneAeropuerto) base.push({
      value: "aeropuerto",
      label: t(modo === "entrega" ? "reserva.fechasLugar.entregaAeropuerto" : "reserva.fechasLugar.devolucionAeropuerto"),
      icono: "airplane-outline",
    });
    if (ciudadInfo?.tieneTerminal) base.push({
      value: "terminal",
      label: t(modo === "entrega" ? "reserva.fechasLugar.entregaTerminal" : "reserva.fechasLugar.devolucionTerminal"),
      icono: "bus-outline",
    });
    return base;
  };

  const opcionesEntrega = (esWompi: boolean) => construirOpciones("entrega", esWompi);
  const opcionesDevolucion = (esWompi: boolean) => construirOpciones("devolucion", esWompi);
  const labelLugar = (opciones: OpcionLugar[], value: string) => opciones.find((o) => o.value === value)?.label || value || t("reserva.fechasLugar.seleccionar");

  useEffect(() => {
    if (draftPago.metodoPago !== "wompi") {
      setDraftPago((p) => ({ ...p, lugarRetiro: nombreSucursal, lugarDevolucion: nombreSucursal }));
    }
  }, [draftPago.metodoPago, nombreSucursal]);

  const fechasCompletas = !!fechasLugar.fechaRetiro && !!fechasLugar.fechaDevolucion;
  const metodoPagoActual = METODOS_PAGO.find((m) => m.id === fechasLugar.metodoPago);

  const seguros = vehiculo.seguros ?? [];
  const kmLimitado = vehiculo.tarifas?.kmLimitado;
  const kmIlimitado = vehiculo.tarifas?.kmIlimitado;
  const servicios = vehiculo.servicios ?? [];

  const seguroElegido = useMemo(() => seguros.find((s) => s.nombre === planes.proteccion) ?? null, [seguros, planes.proteccion]);
  const kmElegido = planes.tipoKilometraje === "limitado" ? kmLimitado : planes.tipoKilometraje === "ilimitado" ? kmIlimitado : null;
  const labelKm = planes.tipoKilometraje === "limitado" ? t("reserva.planes.limitado") : planes.tipoKilometraje === "ilimitado" ? t("reserva.planes.ilimitado") : t("reserva.resumen.sinElegir");
  const serviciosTexto = planes.serviciosSeleccionados.length > 0
    ? planes.serviciosSeleccionados
        .map((n) => t(`reserva.planes.nombreServicio.${n}`, { defaultValue: n }))
        .join(", ")
    : t("reserva.resumen.ninguno");

  const desglose = useMemo(() => {
    const dias = diasEntre(fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion);
    const diarias = vehiculo.precio * dias;
    const proteccion = mostrarPlanes && seguroElegido ? seguroElegido.precio * dias : 0;
    const kilometraje = mostrarPlanes && kmElegido ? kmElegido.precio * dias : 0;
    const servAdic = mostrarPlanes
      ? servicios.filter((s) => planes.serviciosSeleccionados.includes(s.nombre)).reduce((a, s) => a + s.precio * dias, 0)
      : 0;
    const cargos = Math.round(diarias * PORCENTAJE_CARGOS_ADMINISTRATIVOS);
    const subtotalBruto = diarias + proteccion + kilometraje + servAdic + cargos + RECARGO_LOGISTICO;
    
    let descuentoCupon = 0;
    if (cuponAplicado) {
      if (cuponAplicado.descuentoPorcentaje) {
        descuentoCupon = Math.round(subtotalBruto * (cuponAplicado.descuentoPorcentaje / 100));
      } else if (cuponAplicado.descuentoFijo) {
        descuentoCupon = cuponAplicado.descuentoFijo;
      }
    }
    
    const subtotal = subtotalBruto - descuentoCupon;
    const iva = Math.round(subtotal * PORCENTAJE_IVA);
    return { dias, diarias, proteccion, kilometraje, servAdic, cargos, subtotalBruto, descuentoCupon, subtotal, iva, total: subtotal + iva };
  }, [vehiculo.precio, fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion, mostrarPlanes, seguroElegido, kmElegido, servicios, planes.serviciosSeleccionados, cuponAplicado]);

  const cerrar = () => { setModo("resumen"); onCerrar(); };
  const confirmarPago = () => { actualizarFechasLugar(draftPago); setModo("resumen"); };
  const confirmarFechas = () => { actualizarFechasLugar(draftFechas); setModo("resumen"); };
  const confirmarPlanes = () => { actualizarPlanes(draftPlanes); setModo("resumen"); };

  const titulos: Record<Modo, string> = {
    resumen: t("reserva.resumen.titulos.resumen"),
    editarPago: t("reserva.resumen.titulos.editarPago"),
    editarFechas: t("reserva.resumen.titulos.editarFechas"),
    editarPlanes: t("reserva.resumen.titulos.editarPlanes"),
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={cerrar} presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: c.bg, paddingTop: insets.top || 16 }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitulo, { color: c.textPrimary }]}>{titulos[modo]}</Text>
          <TouchableOpacity onPress={cerrar} hitSlop={10}>
            <Ionicons name="close" size={22} color={c.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.cardMaestra, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <LinearGradient
              colors={GRADIENTES.panel.colors}
              start={GRADIENTES.panel.start}
              end={GRADIENTES.panel.end}
              style={styles.vehiculoBanner}
            >
              <Text style={styles.vehiculoBannerLabel}>{t("reserva.resumen.grupo")}</Text>
              <Text style={styles.vehiculoBannerNombre}>{vehiculo.nombre}</Text>
              <Text style={styles.vehiculoBannerSub}>{t(`catalogo.categoriaValores.${vehiculo.categoria ?? "Economico"}`, { defaultValue: vehiculo.categoria ?? "Económico" })} — {t(`catalogo.transmisionValores.${vehiculo.transmision}`, { defaultValue: vehiculo.transmision })}</Text>
            </LinearGradient>

            {!seccionFechasCompleta ? (
              <View style={[piezas.subcard, { borderTopColor: c.border }]}>
                <View style={piezas.rowGap}>
                  <Ionicons name="information-circle-outline" size={14} color={primaryAccent} />
                  <Text style={[piezas.subcardTitulo, { color: c.textMuted }]}>{t("reserva.resumen.resumenNoDisponible")}</Text>
                </View>
                <Text style={[piezas.bloqueSub, { color: c.textSecondary, marginTop: 8 }]}>
                  {t("reserva.resumen.completaDatos")}
                </Text>
              </View>
            ) : (
              <>
                {/* PAGO Y LUGAR */}
                {modo === "resumen" || modo === "editarPago" ? (
                  <View style={[piezas.subcard, { borderTopColor: c.border }]}>
                    {modo !== "editarPago" ? (
                      <>
                        <SubcardHeader icono="card-outline" titulo={t("reserva.resumen.pagoYLugar")} onEditar={() => { setDraftPago(fechasLugar); setModo("editarPago"); }} />
                        <FilaDato icono="card-outline" label={t("reserva.resumen.metodoDePago")} valor={metodoPagoActual?.titulo ?? t("reserva.resumen.sinElegir")} />
                        <FilaDato icono="location-outline" label={t("reserva.resumen.lugarDeRetiro")} valor={labelLugar(opcionesEntrega(fechasLugar.metodoPago === "wompi"), fechasLugar.lugarRetiro)} />
                        <FilaDato icono="location-outline" label={t("reserva.resumen.lugarDeDevolucion")} valor={labelLugar(opcionesDevolucion(fechasLugar.metodoPago === "wompi"), fechasLugar.lugarDevolucion)} ultima />
                      </>
                    ) : (
                      <View>
                        <SubcardHeaderEditando icono="card-outline" titulo={t("reserva.resumen.pagoYLugar")} />
                        <Text style={[piezas.label, { color: c.textMuted, marginTop: 12 }]}>{t("reserva.resumen.comoPagas")}</Text>
                        <View style={piezas.filaDosCols}>
                          {METODOS_PAGO.map((m) => (
                            <TouchableOpacity key={m.id} style={[piezas.metodoCard, { backgroundColor: c.bgInput, borderColor: c.border }, draftPago.metodoPago === m.id && { borderColor: primaryAccent, borderWidth: 1.5, backgroundColor: c.primaryBg }]} onPress={() => { setDraftPago((p) => ({ ...p, metodoPago: m.id })); if (m.id === "efectivo") setAlertaEfectivoVisible(true); }}>
                              <Text style={[piezas.metodoTitulo, { color: c.textPrimary }]}>{m.titulo}</Text>
                              <Text style={[piezas.metodoDesc, { color: c.textMuted }]}>{m.descripcion}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        <Text style={[piezas.label, { color: c.textMuted }]}>{t("reserva.resumen.dondeRecogesDevuelves")}</Text>
                        <View style={piezas.filaDosCols}>
                          <TouchableOpacity style={[piezas.selectBox, { backgroundColor: c.bgInput, borderColor: c.border }]} onPress={() => setModalLugar("retiro")}>
                            <Text style={[piezas.selectLabel, { color: c.textMuted }]}>{t("reserva.resumen.recoges")}</Text>
                            <Text style={[piezas.selectValue, { color: c.textPrimary }]} numberOfLines={1}>{labelLugar(opcionesEntrega(draftPago.metodoPago === "wompi"), draftPago.lugarRetiro)}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[piezas.selectBox, { backgroundColor: c.bgInput, borderColor: c.border }]} onPress={() => setModalLugar("devolucion")}>
                            <Text style={[piezas.selectLabel, { color: c.textMuted }]}>{t("reserva.resumen.devuelves")}</Text>
                            <Text style={[piezas.selectValue, { color: c.textPrimary }]} numberOfLines={1}>{labelLugar(opcionesDevolucion(draftPago.metodoPago === "wompi"), draftPago.lugarDevolucion)}</Text>
                          </TouchableOpacity>
                        </View>

                        <FilaBotonesEdicion onVolver={() => setModo("resumen")} onActualizar={confirmarPago} />
                      </View>
                    )}
                  </View>
                ) : null}

                {/* FECHAS Y HORAS */}
                {modo === "resumen" || modo === "editarFechas" ? (
                  <View style={[piezas.subcard, { borderTopColor: c.border }]}>
                    {modo !== "editarFechas" ? (
                      <>
                        <SubcardHeader icono="calendar-outline" titulo={t("reserva.resumen.fechasYHoras")} onEditar={() => { setDraftFechas(fechasLugar); setModo("editarFechas"); }} />
                        <FilaDato icono="log-out-outline" label={t("reserva.resumen.retiras")} valor={fechaHora(fechasLugar.fechaRetiro, fechasLugar.horaRetiro, formatHoraAmPm, t("reserva.fechasLugar.seleccionar"))} />
                        <FilaDato icono="log-in-outline" label={t("reserva.resumen.devuelvesFecha")} valor={fechaHora(fechasLugar.fechaDevolucion, fechasLugar.horaDevolucion, formatHoraAmPm, t("reserva.fechasLugar.seleccionar"))} ultima />
                      </>
                    ) : (
                      <View>
                        <SubcardHeaderEditando icono="calendar-outline" titulo={t("reserva.resumen.fechasYHoras")} />
                        <Text style={[piezas.label, { color: c.textMuted, marginTop: 12 }]}>{t("reserva.resumen.aQueHora")}</Text>
                        <View style={piezas.filaDosCols}>
                          <TouchableOpacity style={[piezas.selectBox, { backgroundColor: c.bgInput, borderColor: c.border }]} onPress={() => setHoraVisible("retiro")}>
                            <Text style={[piezas.selectLabel, { color: c.textMuted }]}>{t("reserva.resumen.retirasMayus")}</Text>
                            <Text style={[piezas.selectValue, { color: c.textPrimary }]}>{draftFechas.horaRetiro ? formatHoraAmPm(draftFechas.horaRetiro) : t("reserva.fechasLugar.seleccionar")}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[piezas.selectBox, { backgroundColor: c.bgInput, borderColor: c.border }]} onPress={() => setHoraVisible("devolucion")}>
                            <Text style={[piezas.selectLabel, { color: c.textMuted }]}>{t("reserva.resumen.devuelves")}</Text>
                            <Text style={[piezas.selectValue, { color: c.textPrimary }]}>{draftFechas.horaDevolucion ? formatHoraAmPm(draftFechas.horaDevolucion) : t("reserva.fechasLugar.seleccionar")}</Text>
                          </TouchableOpacity>
                        </View>

                        <Text style={[piezas.label, { color: c.textMuted }]}>{t("reserva.resumen.queDias")}</Text>
                        <CalendarioRango
                          vehiculo={vehiculo}
                          fechaRetiro={draftFechas.fechaRetiro}
                          fechaDevolucion={draftFechas.fechaDevolucion}
                          onCambiarFechas={(retiro, devolucion) => setDraftFechas((f) => ({ ...f, fechaRetiro: retiro, fechaDevolucion: devolucion }))}
                        />

                        <FilaBotonesEdicion onVolver={() => setModo("resumen")} onActualizar={confirmarFechas} />
                      </View>
                    )}
                  </View>
                ) : null}

                {/* PLANES Y SERVICIOS */}
                {mostrarPlanes && (modo === "resumen" || modo === "editarPlanes") ? (
                  <View style={[piezas.subcard, { borderTopColor: c.border }]}>
                    {modo !== "editarPlanes" ? (
                      <>
                        <SubcardHeader icono="shield-checkmark-outline" titulo={t("reserva.resumen.planesYServicios")} onEditar={() => { setDraftPlanes(planes); setModo("editarPlanes"); }} />
                        <FilaDato icono="shield-checkmark-outline" label={t("reserva.resumen.proteccion")} valor={planes.proteccion ? t(`reserva.planes.nombreSeguro.${planes.proteccion}`, { defaultValue: planes.proteccion }) : t("reserva.resumen.sinElegir")} />
                        <FilaDato icono="speedometer-outline" label={t("reserva.resumen.kilometraje")} valor={labelKm} />
                        <FilaDato icono="add-circle-outline" label={t("reserva.resumen.serviciosAdicionales")} valor={serviciosTexto} ultima />
                      </>
                    ) : (
                      <View>
                        <SubcardHeaderEditando icono="shield-checkmark-outline" titulo={t("reserva.resumen.planesYServicios")} />

                        {seguros.length > 0 && (
                          <>
                            <Text style={[piezas.label, { color: c.textMuted, marginTop: 12 }]}>{t("reserva.resumen.proteccionMayus")}</Text>
                            {seguros.map((s) => (
                              <OpcionCard key={s.nombre} titulo={t(`reserva.planes.nombreSeguro.${s.nombre}`, { defaultValue: s.nombre })} desc={`${fmt(s.precio)} ${t("reserva.planes.porDia")}`} activo={draftPlanes.proteccion === s.nombre} onPress={() => setDraftPlanes((p) => ({ ...p, proteccion: s.nombre }))} />
                            ))}
                          </>
                        )}

                        {(kmLimitado || kmIlimitado) && (
                          <>
                            <Text style={[piezas.label, { color: c.textMuted }]}>{t("reserva.resumen.tipoDeKilometrajeMayus")}</Text>
                            {kmLimitado && (
                              <OpcionCard titulo={t("reserva.planes.kmLimitadoTitulo")} desc={t("reserva.planes.kmLimitadoDesc", { km: kmLimitado.km, precio: fmt(kmLimitado.precio) })} activo={draftPlanes.tipoKilometraje === "limitado"} onPress={() => setDraftPlanes((p) => ({ ...p, tipoKilometraje: "limitado" }))} />
                            )}
                            {kmIlimitado && (
                              <OpcionCard titulo={t("reserva.planes.kmIlimitadoTitulo")} desc={t("reserva.planes.kmIlimitadoDesc", { precio: fmt(kmIlimitado.precio) })} activo={draftPlanes.tipoKilometraje === "ilimitado"} onPress={() => setDraftPlanes((p) => ({ ...p, tipoKilometraje: "ilimitado" }))} />
                            )}
                          </>
                        )}

                        {servicios.length > 0 && (
                          <>
                            <Text style={[piezas.label, { color: c.textMuted }]}>{t("reserva.resumen.serviciosAdicionalesMayus")}</Text>
                            {servicios.map((s) => {
                              const activo = draftPlanes.serviciosSeleccionados.includes(s.nombre);
                              return (
                                <ServicioRow
                                  key={s.nombre}
                                  nombre={s.nombre}
                                  precio={s.precio}
                                  activo={activo}
                                  onPress={() =>
                                    setDraftPlanes((p) => ({
                                      ...p,
                                      serviciosSeleccionados: activo
                                        ? p.serviciosSeleccionados.filter((n) => n !== s.nombre)
                                        : [...p.serviciosSeleccionados, s.nombre],
                                    }))
                                  }
                                />
                              );
                            })}
                          </>
                        )}

                        <FilaBotonesEdicion onVolver={() => setModo("resumen")} onActualizar={confirmarPlanes} />
                      </View>
                    )}
                  </View>
                ) : null}

                {/* DESGLOSE — formato tipo "oferta", completo */}
                {modo === "resumen" && (
                  <View style={[piezas.subcard, { borderTopColor: c.border }]}>
                    {fechasCompletas ? (
                      <>
                        <View style={piezas.rowGap}>
                          <Ionicons name="receipt-outline" size={14} color={primaryAccent} />
                          <Text style={[piezas.subcardTitulo, { color: c.textMuted }]}>{t("reserva.resumen.ofertaCategoria", { categoria: vehiculo.categoria ?? t("reserva.resumen.estandar") })}</Text>
                        </View>

                        <View style={piezas.desgloseCabecera}>
                          <Text style={[piezas.desgloseCabeceraLabel, { color: c.textMuted }]}></Text>
                          <Text style={[piezas.desgloseCabeceraTotal, { color: c.textMuted }]}>{t("reserva.resumen.total")}</Text>
                        </View>

                        <Text style={[piezas.desgloseSeccionTitulo, { color: c.textPrimary }]}>{t("reserva.resumen.diarias")}</Text>
                        <LineaPrecio
                          label={`${desglose.dias} ${desglose.dias > 1 ? t("reserva.resumen.diaPlural") : t("reserva.resumen.diaSingular")} × ${fmt(vehiculo.precio)}`}
                          valor={fmt(desglose.diarias)}
                          destacado
                        />

                        {desglose.proteccion > 0 && (
                          <>
                            <Text style={[piezas.desgloseSeccionTitulo, { color: c.textPrimary }]}>{t("reserva.resumen.protecciones")}</Text>
                            <Text style={[piezas.desgloseSubtexto, { color: c.textSecondary }]}>{t(`reserva.planes.nombreSeguro.${planes.proteccion}`, { defaultValue: planes.proteccion })}</Text>
                            <LineaPrecio
                              label={`${desglose.dias} ${desglose.dias > 1 ? t("reserva.resumen.diaPlural") : t("reserva.resumen.diaSingular")} × ${fmt(seguroElegido?.precio ?? 0)}`}
                              valor={fmt(desglose.proteccion)}
                              destacado
                            />
                          </>
                        )}

                        {desglose.kilometraje > 0 && (
                          <>
                            <Text style={[piezas.desgloseSeccionTitulo, { color: c.textPrimary }]}>{t("reserva.resumen.kilometrajeGuion", { tipo: labelKm })}</Text>
                            <LineaPrecio
                              label={`${desglose.dias} ${desglose.dias > 1 ? t("reserva.resumen.diaPlural") : t("reserva.resumen.diaSingular")} × ${fmt(kmElegido?.precio ?? 0)}`}
                              valor={fmt(desglose.kilometraje)}
                              destacado
                            />
                          </>
                        )}

                        {desglose.servAdic > 0 && (
                          <>
                            <Text style={[piezas.desgloseSeccionTitulo, { color: c.textPrimary }]}>{t("reserva.resumen.serviciosAdicionales")}</Text>
                            <LineaPrecio label={serviciosTexto} valor={fmt(desglose.servAdic)} destacado />
                          </>
                        )}

                        <View style={[piezas.desgloseDivisor, { backgroundColor: c.border }]} />

                        <LineaPrecio label={t("reserva.resumen.cargosAdministrativos", { pct: fmtPct(PORCENTAJE_CARGOS_ADMINISTRATIVOS) })} valor={fmt(desglose.cargos)} />
                        <LineaPrecio label={t("reserva.resumen.recargoLogistico")} valor={fmt(RECARGO_LOGISTICO)} />
                        <LineaPrecio label={t("reserva.resumen.subtotalReserva")} valor={fmt(desglose.subtotalBruto)} destacado />
                        
                        {desglose.descuentoCupon > 0 && cuponAplicado && (
                          <View style={{ marginTop: 4 }}>
                            <LineaPrecio 
                              label={`Descuento (${cuponAplicado.codigo})`} 
                              valor={`-${fmt(desglose.descuentoCupon)}`} 
                              destacado 
                            />
                          </View>
                        )}
                        
                        <LineaPrecio label={t("reserva.resumen.iva", { pct: fmtPct(PORCENTAJE_IVA) })} valor={fmt(desglose.iva)} />
                      </>
                    ) : (
                      <Text style={[piezas.bloqueSub, { color: c.textMuted }]}>{t("reserva.resumen.seleccionaFechasPrecio")}</Text>
                    )}
                  </View>
                )}

                {modo === "resumen" && fechasCompletas && (
                  <View style={[piezas.totalBlock, { backgroundColor: c.primaryBg, borderTopColor: c.border }]}>
                    <Text style={[piezas.totalLabelChica, { color: primaryAccent }]}>{t("reserva.resumen.totalFinal")}</Text>
                    <Text style={[piezas.totalValorGrande, { color: c.textPrimary }]}>{fmt(desglose.total)}</Text>
                    <Text style={[piezas.totalNota, { color: c.textMuted }]}>{t("reserva.resumen.notaImpuestos")}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>

        {modo === "resumen" && (
          <View style={[styles.footer, { borderTopColor: c.border, paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity style={styles.cerrarBtnWrap} onPress={cerrar} activeOpacity={0.85}>
              <LinearGradient
                colors={GRADIENTES.boton.colors}
                start={GRADIENTES.boton.start}
                end={GRADIENTES.boton.end}
                style={styles.cerrarBtn}
              >
                <Text style={styles.cerrarBtnText}>{t("reserva.resumen.cerrar")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <SelectorSucursalModal
          visible={modalLugar !== null}
          titulo={modalLugar === "retiro" ? t("reserva.fechasLugar.lugarDeRetiroModal") : t("reserva.fechasLugar.lugarDeDevolucionModal")}
          opciones={modalLugar === "retiro" ? opcionesEntrega(draftPago.metodoPago === "wompi") : opcionesDevolucion(draftPago.metodoPago === "wompi")}
          onSeleccionar={(v) => { setDraftPago((p) => ({ ...p, [modalLugar === "retiro" ? "lugarRetiro" : "lugarDevolucion"]: v })); setModalLugar(null); }}
          onCerrar={() => setModalLugar(null)}
        />

        <SelectorHoraModal
          visible={horaVisible !== null}
          horaSeleccionada={horaVisible === "retiro" ? draftFechas.horaRetiro : draftFechas.horaDevolucion}
          onSeleccionar={(h) => setDraftFechas((f) => ({ ...f, [horaVisible === "retiro" ? "horaRetiro" : "horaDevolucion"]: h }))}
          onCerrar={() => setHoraVisible(null)}
        />

        <AlertaPagoEfectivo
          visible={alertaEfectivoVisible}
          nombreSucursal={nombreSucursal}
          ciudad={ciudadInfo?.nombre ?? getCiudadPorSucursal(nombreSucursal)}
          direccion={getDireccionSucursal(nombreSucursal)}
          onCerrar={() => setAlertaEfectivoVisible(false)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14 },
  headerTitulo: { fontSize: 16, fontWeight: "800", color: "#111827" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },

  cardMaestra: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", overflow: "hidden", marginBottom: 8 },
  vehiculoBanner: { padding: 14 },
  vehiculoBannerLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.75)", letterSpacing: 0.4 },
  vehiculoBannerNombre: { fontSize: 16, fontWeight: "800", color: "#fff", marginTop: 4 },
  vehiculoBannerSub: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.85)", marginTop: 4 },

  footer: { borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingHorizontal: 16, paddingTop: 12 },
  cerrarBtnWrap: { borderRadius: 12 },
  cerrarBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  cerrarBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
});