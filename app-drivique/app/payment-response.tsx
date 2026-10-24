// app/payment-response.tsx
//
// Detalle de reserva y retorno del checkout de Wompi. Todo sale de la API de reservas.
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { GRADIENTES } from "@/constants/gradients";
import { COLOR_MARCA, getDireccionSucursal } from "@/modules/catalog/constants/catalog.constants";
import {
  calcularGrupoReserva,
  mensajeDeError,
  nombreSucursalEfectivo,
  ReservaGuardada,
  reservaPersistService,
} from "@/modules/reservation/services/reservationPersistService";
import { fechaCorta, fmt } from "@/modules/reservation/components/BookingSummaryModal.pieces";
import { formatHoraAmPm } from "@/modules/reservation/constants/reservation.constants";
import {
  aCentavos,
  construirUrlCheckout,
  consultarTransaccionWompi,
} from "@/modules/reservation/services/wompiService";
import { ModalCalificar } from "@/modules/reservation/components/ModalCalificar";
import { ElegibilidadResena, ResenaGuardada, resenaService } from "@/modules/reservation/services/resenaService";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { contratoService } from "@/modules/reservation/services/contractService";
import { useUsuarioStore } from "@/store/userStore";
import { COLOR_ACENTO } from "@/constants/brandPalette";
import { Alert } from "@/utils/alerta";

const COLOR_GRUPO: Record<string, string> = {
  pendiente: "#f59e0b",
  confirmada: "#2563eb",
  en_curso: "#16a34a",
  finalizada: "#6b7280",
  cancelada: "#dc2626",
};

export default function PagoRespuestaScreen() {
  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const { t } = useTranslation();
  const { ref, id } = useLocalSearchParams<{ ref?: string; id?: string }>();
  const primaryAccent = c.oscuro ? COLOR_ACENTO : COLOR_MARCA;
  const usuario = useUsuarioStore((s) => s.usuario);

  const [cargando, setCargando] = useState(true);
  const [reserva, setReserva] = useState<ReservaGuardada | null>(null);
  const [aviso, setAviso] = useState("");
  const [claveContrato, setClaveContrato] = useState("");
  const [errorClaveContrato, setErrorClaveContrato] = useState("");
  const [validandoClave, setValidandoClave] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [resena, setResena] = useState<ResenaGuardada | null>(null);
  const [modalCalificar, setModalCalificar] = useState(false);
  const [sucursalPendiente, setSucursalPendiente] = useState(false);
  const [misResenas, setMisResenas] = useState<{ titulo: string; rating: number; comment: string }[]>([]);
  const procesado = useRef(false);

  const cargar = useCallback(async () => {
    let referencia = ref;
    let tx = null as Awaited<ReturnType<typeof consultarTransaccionWompi>>;
    if (id) {
      tx = await consultarTransaccionWompi(id);
      if (tx?.reference) referencia = tx.reference;
    }
    const base = referencia ? (referencia.includes("_") ? referencia.split("_")[0] : referencia) : "";
    if (!base) {
      setCargando(false);
      return;
    }
    let encontrada = await reservaPersistService.obtenerPorReferencia(base);

    if (encontrada && tx && !procesado.current) {
      procesado.current = true;
      try {
        if (tx.status === "APPROVED" && encontrada.estadoApi === "PENDING_PAYMENT") {
          await reservaPersistService.confirmarPago(encontrada.id);
        } else if ((tx.status === "DECLINED" || tx.status === "ERROR") && encontrada.estadoApi === "PENDING_PAYMENT") {
          await reservaPersistService.reportarPagoFallido(encontrada.id);
          setAviso(t("reserva.confirmacion.errorPagoMensaje"));
        } else if (tx.status === "PENDING") {
          setAviso(t("reserva.confirmacion.pagoPendienteTexto"));
        }
      } catch (e) {
        setAviso(mensajeDeError(e, ""));
      }
      encontrada = await reservaPersistService.obtenerPorReferencia(base);
    }
    setReserva(encontrada ?? null);
    setCargando(false);
  }, [ref, id, t]);

  useEffect(() => {
    cargar();
    const interval = setInterval(() => {
      cargar();
    }, 4000);
    return () => clearInterval(interval);
  }, [cargar]);

  useEffect(() => {
    if (!reserva || calcularGrupoReserva(reserva) !== "finalizada") return;
    let activo = true;
    resenaService
      .obtenerPorReserva(reserva.referencia, usuario.id)
      .then((r) => activo && setResena(r))
      .catch(() => {});
    // Igual que la web: la sucursal también se puede reseñar si el servidor lo permite
    resenaService
      .obtenerElegibilidad(reserva.referencia)
      .then((e) => {
        if (!activo) return;
        setSucursalPendiente(e.puedeSucursal);
        setMisResenas(resenasPublicadas(e, t));
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, [reserva, usuario.id]);

  const irAMisReservas = () => router.replace("/(tabs)/my-bookings" as any);

  const pagarConWompi = async () => {
    if (!reserva) return;
    try {
      const url = await construirUrlCheckout({
        reference: reserva.id,
        amountInCents: aCentavos(reserva.total),
      });
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.location.href = url;
        return;
      }
      router.push({
        pathname: "/wompi-checkout" as any,
        params: { url: encodeURIComponent(url), ref: encodeURIComponent(reserva.id) },
      });
    } catch (e: any) {
      Alert.alert(
        t("comun.error", { defaultValue: "Error" }),
        e?.message || t("reserva.confirmacion.errorWompi", { defaultValue: "No se pudo abrir la pasarela de pago de Wompi." })
      );
    }
  };

  const cancelar = () => {
    if (!reserva) return;
    Alert.alert(
      t("misReservas.cancelarTitulo", { defaultValue: "Cancelar reserva" }),
      t("misReservas.cancelarMensaje", { defaultValue: "Esta accion no se puede deshacer." }),
      [
        { text: t("comun.no", { defaultValue: "No" }), style: "cancel" },
        {
          text: t("misReservas.cancelarConfirmar", { defaultValue: "Si, cancelar" }),
          style: "destructive",
          onPress: async () => {
            setOcupado(true);
            try {
              await reservaPersistService.cancelar(reserva.id);
              setReserva((await reservaPersistService.obtenerPorReferencia(reserva.id)) ?? null);
            } catch (e) {
              Alert.alert(t("comun.error"), mensajeDeError(e, ""));
            } finally {
              setOcupado(false);
            }
          },
        },
      ],
    );
  };

  if (cargando) {
    return (
      <View style={[s.centro, { backgroundColor: c.bg, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLOR_MARCA} />
        <Text style={[s.texto, { color: c.textSecondary }]}>{t("reserva.confirmacion.respuesta.procesando")}</Text>
      </View>
    );
  }

  if (!reserva) {
    return (
      <View style={[s.centro, { backgroundColor: c.bg, paddingTop: insets.top, paddingHorizontal: 32 }]}>
        <Ionicons name="help-circle-outline" size={56} color={c.textMuted} />
        <Text style={[s.titulo, { color: c.textPrimary }]}>{t("reserva.confirmacion.respuesta.noEncontrada")}</Text>
        <Text style={[s.texto, { color: c.textMuted }]}>{t("reserva.confirmacion.respuesta.noEncontradaMensaje")}</Text>
        <Boton texto={t("reserva.confirmacion.respuesta.volverAMisReservas")} onPress={irAMisReservas} />
      </View>
    );
  }

  const grupo = calcularGrupoReserva(reserva);
  const color = COLOR_GRUPO[grupo];
  const enRevision = reserva.estado === "PENDIENTE_VALIDACION" || reserva.estadoApi === "PENDING_DOCUMENT_REVIEW";
  const enHorario = reserva.estado === "PENDIENTE_HORARIO" || reserva.estadoApi === "PENDING_SCHEDULE";
  const pendienteFirma = reserva.estado === "PENDIENTE_FIRMA" || reserva.estadoApi === "PENDING_SIGNATURE";
  const esperaPagoWompi =
    (reserva.estado === "PENDIENTE" || reserva.estadoApi === "PENDING_PAYMENT") &&
    reserva.metodoPago === "wompi";
  const esperaPagoEfectivo = reserva.estado === "PENDIENTE_EFECTIVO";
  const puedeCancelar = grupo === "pendiente" || reserva.estado === "CONFIRMADA";
  const tieneContrato = ["CONFIRMADA", "EN_CURSO", "FINALIZADA", "PENDIENTE_FIRMA"].includes(reserva.estado) || pendienteFirma;

  // El contrato se abre en el mismo detalle: se pide el documento de la reserva y luego se muestra el contrato
  const abrirContrato = async () => {
    if (!reserva) return;
    setValidandoClave(true);
    try {
      const dto = await contratoService.obtenerPorReserva(reserva.id);
      const docReserva = String(dto?.customerDocumentNumber || "").trim();
      const soloDigitos = docReserva.replace(/\D/g, "");
      const claveDigitos = claveContrato.replace(/\D/g, "");
      const coincide =
        !!docReserva &&
        ((soloDigitos.length > 0 && claveDigitos === soloDigitos) || claveContrato.trim().toUpperCase() === docReserva.toUpperCase());
      if (!coincide) {
        setErrorClaveContrato(t("misReservas.claveIncorrecta"));
        return;
      }
      setClaveContrato("");
      router.push(`/contract-view?ref=${encodeURIComponent(reserva.id)}&ok=1` as any);
    } catch (e) {
      setErrorClaveContrato(mensajeDeError(e, t("contratoFirma.loadError")));
    } finally {
      setValidandoClave(false);
    }
  };
  const vehiculo = reserva.vehiculoSnapshot;
  const foto = vehiculo?.imagenes?.[0];
  const sucursalEfectivo = nombreSucursalEfectivo(reserva);

  const tituloEstado = enRevision
    ? t("misReservas.detalle.enRevisionDocumentos", { defaultValue: "En revisión de documentos" })
    : enHorario
      ? t("misReservas.detalle.pendienteHorario", { defaultValue: "Pendiente de atención de la sucursal" })
      : (pendienteFirma
        ? t("misReservas.detalle.pendienteFirma", { defaultValue: "Pendiente de firma de contrato" })
        : t(`misReservas.grupos.${grupo}`));

  return (
    <View style={[s.flex, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <View style={[s.header, { backgroundColor: c.bgCard, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={irAMisReservas} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={primaryAccent} />
        </TouchableOpacity>
        <Text style={[s.headerTitulo, { color: c.textPrimary }]}>
          {t("misReservas.detalle.tituloHeader", { defaultValue: "Detalle de la reserva" })}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 32 }]}>
        {/* Cabecera de estado y vehículo */}
        <View style={s.topHeader}>
          <Text style={[s.topTituloEstado, { color: c.textPrimary }]}>{tituloEstado}</Text>
          <Text style={[s.topSubtituloVehiculo, { color: c.textSecondary }]}>{reserva.vehiculoNombre}</Text>
        </View>

        {/* 1. Imagen del vehículo con bordes redondeados */}
        {foto ? (
          <View style={[s.fotoCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <Image source={{ uri: foto }} style={s.foto} resizeMode="cover" />
          </View>
        ) : null}

        {/* 2. Grid de datos de la reserva en 2 columnas estilo Web */}
        <View style={s.grid}>
          {/* Vehículo */}
          <CeldaDato
            c={c}
            icono="car-sport-outline"
            label={t("reservas.vehicle", { defaultValue: "Vehículo" })}
            valor={reserva.vehiculoNombre}
          />

          {/* Fecha de retiro */}
          <CeldaDato
            c={c}
            icono="calendar-outline"
            label={t("reservas.pickupDate", { defaultValue: "Fecha de retiro" })}
            valor={fechaCorta(reserva.fechaRetiro)}
          />

          {/* Hora de retiro */}
          <CeldaDato
            c={c}
            icono="time-outline"
            label={t("reservas.pickupTime", { defaultValue: "Hora de retiro" })}
            valor={formatHoraAmPm(reserva.horaRetiro) || "—"}
          />

          {/* Fecha de devolución */}
          <CeldaDato
            c={c}
            icono="calendar-outline"
            label={t("reservas.returnDate", { defaultValue: "Fecha de devolución" })}
            valor={fechaCorta(reserva.fechaDevolucion)}
          />

          {/* Hora de devolución */}
          <CeldaDato
            c={c}
            icono="time-outline"
            label={t("reservas.returnTime", { defaultValue: "Hora de devolución" })}
            valor={formatHoraAmPm(reserva.horaDevolucion) || "—"}
          />

          {/* Lugar de retiro */}
          <CeldaDato
            c={c}
            icono="location-outline"
            label={t("reservas.pickupLocation", { defaultValue: "Lugar de retiro" })}
            valor={vehiculo?.sucursal || sucursalEfectivo || "Drivique Principal"}
          />

          {/* Lugar de devolución */}
          <CeldaDato
            c={c}
            icono="location-outline"
            label={t("reservas.returnLocation", { defaultValue: "Lugar de devolución" })}
            valor={vehiculo?.sucursal || sucursalEfectivo || "Drivique Principal"}
          />

          {/* Medio de pago */}
          <CeldaDato
            c={c}
            icono="card-outline"
            label={t("reservas.paymentMethod", { defaultValue: "Medio de pago" })}
            valor={reserva.metodoPago === "efectivo" ? t("reserva.confirmacion.pagoEnSucursalCorto", { defaultValue: "Pago en sucursal" }) : "Pago Wompi"}
          />

          {/* Protección */}
          <CeldaDato
            c={c}
            icono="shield-checkmark-outline"
            label={t("reservas.protection", { defaultValue: "Protección" })}
            valor={reserva.proteccion || "Protección Básica Estándar"}
          />

          {/* Referencia */}
          <CeldaDato
            c={c}
            icono="receipt-outline"
            label={t("reserva.confirmacion.respuesta.referencia", { defaultValue: "Referencia" })}
            valor={reserva.referencia}
          />

          {/* Total */}
          <CeldaDato
            c={c}
            icono="cash-outline"
            label={t("reserva.confirmacion.respuesta.total", { defaultValue: "Total" })}
            valor={fmt(reserva.total)}
            esTotal={true}
          />

          {/* Estado */}
          <CeldaDato
            c={c}
            icono="checkmark-circle-outline"
            label={t("reservas.status", { defaultValue: "Estado" })}
            valor={tituloEstado}
            colorValor={color}
          />
        </View>

        {/* Tarjeta de Reserva en Espera de Horario de Atención (Idéntica a la Web) */}
        {enHorario ? (
          <View
            style={[
              s.tarjetaInformativa,
              {
                backgroundColor: c.oscuro ? "rgba(30, 58, 138, 0.25)" : "#EFF6FF",
                borderColor: c.oscuro ? "#1E40AF" : "#BFDBFE",
              },
            ]}
          >
            <View style={s.tarjetaInfoHead}>
              <Ionicons name="time" size={24} color={c.oscuro ? COLOR_ACENTO : COLOR_MARCA} />
              <Text style={[s.tarjetaInfoTitulo, { color: c.oscuro ? "#93C5FD" : "#1E3A8A" }]}>
                {t("reservas.esperaAperturaTitulo", { defaultValue: "En Espera de Apertura de Sucursal" })}
              </Text>
            </View>
            <Text style={[s.tarjetaInfoTexto, { color: c.oscuro ? "#DBEAFE" : "#1E3A8A" }]}>
              {t("reservas.esperaAperturaDesc", {
                defaultValue: `Tu reserva fue registrada fuera del horario de atención de la sucursal ${vehiculo?.sucursal || sucursalEfectivo || "Drivique"}. En cuanto la sede inicie su jornada de atención, recibirás una notificación automática por correo, web y push para proceder con el pago y confirmación de tu reserva.`,
              })}
            </Text>
            <View
              style={[
                s.tarjetaInfoBadge,
                {
                  backgroundColor: c.oscuro ? "rgba(30, 64, 175, 0.4)" : "#DBEAFE",
                },
              ]}
            >
              <Ionicons name="time" size={14} color={c.oscuro ? "#93C5FD" : "#1E3A8A"} />
              <Text style={[s.tarjetaInfoBadgeTexto, { color: c.oscuro ? "#93C5FD" : "#1E3A8A" }]}>
                {t("reservas.esperaAperturaEstado", { defaultValue: "Estado: Esperando apertura de sucursal" })}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Tarjeta de Documentación en Proceso de Validación */}
        {enRevision ? (
          <View
            style={[
              s.tarjetaInformativa,
              {
                backgroundColor: c.oscuro ? "rgba(30, 58, 138, 0.25)" : "#EFF6FF",
                borderColor: c.oscuro ? "#1E40AF" : "#BFDBFE",
              },
            ]}
          >
            <View style={s.tarjetaInfoHead}>
              <Ionicons name="shield-checkmark" size={24} color={c.oscuro ? COLOR_ACENTO : COLOR_MARCA} />
              <Text style={[s.tarjetaInfoTitulo, { color: c.oscuro ? "#93C5FD" : "#1E3A8A" }]}>
                {t("misReservas.detalle.enRevisionDocumentos", { defaultValue: "Documentación en Proceso de Validación" })}
              </Text>
            </View>
            <Text style={[s.tarjetaInfoTexto, { color: c.oscuro ? "#DBEAFE" : "#1E3A8A" }]}>
              {t("misReservas.detalle.enRevisionTexto", {
                defaultValue: `Tus documentos de identidad y licencia de conducción están siendo revisados por el encargado de la sucursal ${vehiculo?.sucursal || sucursalEfectivo || "Drivique"}. En cuanto los documentos sean aprobados, tu reserva se confirmará automáticamente y se habilitará la firma digital del contrato.`,
              })}
            </Text>
            <View
              style={[
                s.tarjetaInfoBadge,
                {
                  backgroundColor: c.oscuro ? "rgba(30, 64, 175, 0.4)" : "#DBEAFE",
                },
              ]}
            >
              <Ionicons name="time" size={14} color={c.oscuro ? "#93C5FD" : "#1E3A8A"} />
              <Text style={[s.tarjetaInfoBadgeTexto, { color: c.oscuro ? "#93C5FD" : "#1E3A8A" }]}>
                {t("reservas.docsEnRevisionEstado", { defaultValue: "Estado: En revisión por encargado de sucursal" })}
              </Text>
            </View>
          </View>
        ) : null}

        {aviso ? (
          <View style={[s.aviso, { borderColor: "#f59e0b", backgroundColor: c.oscuro ? "#422006" : "#fffbeb" }]}>
            <Text style={[s.avisoTexto, { color: c.oscuro ? "#fde68a" : "#92400e" }]}>{aviso}</Text>
          </View>
        ) : null}

        {esperaPagoEfectivo ? (
          <View style={[s.aviso, { borderColor: "#f59e0b", backgroundColor: c.oscuro ? "#422006" : "#fffbeb" }]}>
            <Text style={[s.avisoTitulo, { color: c.oscuro ? "#fde68a" : "#92400e" }]}>
              {t("misReservas.detalle.tituloPendienteEfectivo")}
            </Text>
            {sucursalEfectivo ? (
              <Text style={[s.avisoTexto, { color: c.textSecondary }]}>
                {t("reserva.confirmacion.sucursal")}: {sucursalEfectivo}
              </Text>
            ) : null}
            {reserva.codigoPagoEfectivo ? (
              <Text style={[s.codigo, { color: c.textPrimary }]}>{reserva.codigoPagoEfectivo}</Text>
            ) : null}
            {reserva.fechaLimitePago ? (
              <Text style={[s.avisoTexto, { color: c.textSecondary }]}>
                {t("reserva.confirmacion.plazoParaPagarTitulo")}:{" "}
                {new Date(reserva.fechaLimitePago).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
              </Text>
            ) : null}
          </View>
        ) : null}

        {esperaPagoWompi ? (
          <Boton texto={t("reserva.confirmacion.pagarConWompi")} onPress={pagarConWompi} />
        ) : null}

        {pendienteFirma ? (
          <View style={[s.aviso, { borderColor: primaryAccent, backgroundColor: c.primaryBg }]}>
            <Text style={[s.avisoTitulo, { color: primaryAccent }]}>
              {t("misReservas.detalle.pendienteFirmaTitulo", { defaultValue: "Firma de Contrato Digital Pendiente" })}
            </Text>
            <Text style={[s.avisoTexto, { color: c.textSecondary }]}>
              {t("misReservas.detalle.pendienteFirmaTexto", {
                defaultValue:
                  "Tu pago ha sido registrado exitosamente. Para confirmar tu reserva, debes firmar digitalmente el contrato de alquiler.",
              })}
            </Text>
          </View>
        ) : null}

        {tieneContrato ? (
          <View style={[s.contratoCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <View style={[s.contratoIcono, { backgroundColor: c.primaryBg }]}>
              <Ionicons name="lock-closed-outline" size={30} color={primaryAccent} />
            </View>
            <Text style={[s.contratoTitulo, { color: c.textPrimary }]}>{t("misReservas.contratoBloqueadoTitulo")}</Text>
            <Text style={[s.contratoTexto, { color: c.textSecondary }]}>{t("misReservas.contratoBloqueadoTexto")}</Text>
            <View style={{ width: "100%", marginTop: 14 }}>
              <PasswordInput
                placeholder={t("misReservas.claveContratoPlaceholder")}
                value={claveContrato}
                onChangeText={(v) => {
                  setClaveContrato(v);
                  if (errorClaveContrato) setErrorClaveContrato("");
                }}
                error={errorClaveContrato}
              />
            </View>
            <TouchableOpacity style={{ width: "100%", marginTop: 8 }} onPress={abrirContrato} activeOpacity={0.85} disabled={validandoClave}>
              <LinearGradient colors={GRADIENTES.boton.colors} start={GRADIENTES.boton.start} end={GRADIENTES.boton.end} style={s.contratoBtn}>
                <Text style={s.contratoBtnTexto}>
                  {pendienteFirma
                    ? t("misReservas.firmarContrato", { defaultValue: "Proceder a firmar contrato" })
                    : t("misReservas.verContrato")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : null}

        {grupo === "finalizada" && misResenas.length > 0
          ? misResenas.map((r) => (
              <View key={r.titulo} style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A", borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#92400E", flexShrink: 1 }}>{r.titulo}</Text>
                  <View style={{ flexDirection: "row", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Ionicons key={n} name="star" size={15} color={n <= r.rating ? "#F59E0B" : "#E2E8F0"} />
                    ))}
                  </View>
                </View>
                <Text style={{ marginTop: 8, fontSize: 13, lineHeight: 19, color: r.comment ? "#78350F" : "#A16207", fontStyle: r.comment ? "normal" : "italic" }}>
                  {r.comment || t("misReservas.sinComentario", { defaultValue: "Calificaste sin dejar un comentario." })}
                </Text>
              </View>
            ))
          : null}

        {grupo === "finalizada" ? (
          <Boton
            secundario
            texto={
              resena && sucursalPendiente
                ? t("reserva.calificar.calificarSucursal", { defaultValue: "Calificar sucursal" })
                : resena
                ? t("misReservas.calificada")
                : t("reserva.calificar.calificarVehiculo")
            }
            onPress={() => (!resena || sucursalPendiente) && setModalCalificar(true)}
          />
        ) : null}

        {grupo === "en_curso" && (
          <Boton
            secundario
            texto={t("tabs.hacerReporte")}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/support",
                params: { reservaId: reserva.id, tab: "nueva" },
              } as any)
            }
          />
        )}

        {puedeCancelar ? (
          <TouchableOpacity
            onPress={cancelar}
            disabled={ocupado}
            style={[
              s.cancelarBtn,
              { backgroundColor: c.oscuro ? "rgba(220, 38, 38, 0.15)" : "#FEF2F2" },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle-outline" size={17} color="#DC2626" />
            <Text style={s.cancelarTexto}>
              {t("misReservas.cancelarReserva", { defaultValue: "Cancelar reserva" })}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <ModalCalificar
        visible={modalCalificar}
        referenciaReserva={reserva.referencia}
        usuarioId={usuario.id}
        usuarioNombre={`${usuario.nombres} ${usuario.apellidos}`.trim()}
        vehiculoId={reserva.vehiculoId}
        vehiculoNombre={reserva.vehiculoNombre}
        valorInicial={resena}
        onCerrar={() => setModalCalificar(false)}
        onGuardado={(r) => {
          if (r) setResena(r);
          resenaService.obtenerElegibilidad(reserva.referencia).then((e) => {
            setSucursalPendiente(e.puedeSucursal);
            setMisResenas(resenasPublicadas(e, t));
          });
          setModalCalificar(false);
        }}
      />
    </View>
  );
}

function resenasPublicadas(e: ElegibilidadResena, t: (k: string, o?: any) => string) {
  const out: { titulo: string; rating: number; comment: string }[] = [];
  if (e.resenaVehiculo) out.push({ titulo: t("misReservas.miResenaVehiculo", { defaultValue: "Tu reseña del vehículo" }), ...e.resenaVehiculo });
  if (e.resenaSucursal) out.push({ titulo: t("misReservas.miResenaSucursal", { defaultValue: "Tu reseña de la sucursal" }), ...e.resenaSucursal });
  return out;
}

function CeldaDato({
  c,
  icono,
  label,
  valor,
  anchoCompleto,
  esTotal,
  colorValor,
}: {
  c: ReturnType<typeof useTemaColores>;
  icono: keyof typeof Ionicons.glyphMap;
  label: string;
  valor: string;
  anchoCompleto?: boolean;
  esTotal?: boolean;
  colorValor?: string;
}) {
  return (
    <View
      style={[
        s.celda,
        {
          backgroundColor: c.oscuro ? "#1F2937" : "#F8FAFC",
          borderColor: c.border,
          width: anchoCompleto ? "100%" : "48.2%",
        },
      ]}
    >
      <View
        style={[
          s.celdaIcono,
          {
            backgroundColor: c.oscuro ? "rgba(30, 64, 175, 0.25)" : "#EFF6FF",
            borderColor: c.oscuro ? "rgba(30, 64, 175, 0.4)" : "#DBEAFE",
          },
        ]}
      >
        <Ionicons name={icono} size={16} color={c.oscuro ? COLOR_ACENTO : COLOR_MARCA} />
      </View>
      <View style={s.celdaContenido}>
        <Text style={[s.celdaLabel, { color: c.textMuted }]} numberOfLines={1}>
          {label}
        </Text>
        <Text
          style={[
            s.celdaValor,
            {
              color: colorValor || (esTotal ? (c.oscuro ? COLOR_ACENTO : COLOR_MARCA) : c.textPrimary),
              fontWeight: esTotal ? "800" : "700",
            },
          ]}
          numberOfLines={2}
        >
          {valor}
        </Text>
      </View>
    </View>
  );
}

function Fila({
  c,
  label,
  valor,
  fuerte,
}: {
  c: ReturnType<typeof useTemaColores>;
  label: string;
  valor: string;
  fuerte?: boolean;
}) {
  return (
    <View style={s.fila}>
      <Text style={[s.filaLabel, { color: c.textMuted }]}>{label}</Text>
      <Text style={[s.filaValor, { color: c.textPrimary, fontWeight: fuerte ? "800" : "600" }]}>{valor}</Text>
    </View>
  );
}

function Boton({ texto, onPress, secundario }: { texto: string; onPress: () => void; secundario?: boolean }) {
  const c = useTemaColores();
  if (secundario) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[s.botonSec, { borderColor: c.oscuro ? COLOR_ACENTO : COLOR_MARCA }]}
      >
        <Text style={[s.botonSecTexto, { color: c.oscuro ? COLOR_ACENTO : COLOR_MARCA }]}>{texto}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={GRADIENTES.boton.colors}
        start={GRADIENTES.boton.start}
        end={GRADIENTES.boton.end}
        style={s.boton}
      >
        <Text style={s.botonTexto}>{texto}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  contratoCard: { borderWidth: 1, borderRadius: 18, padding: 20, alignItems: "center", marginTop: 8 },
  contratoIcono: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  contratoTitulo: { fontSize: 18, fontWeight: "800", textAlign: "center" },
  contratoTexto: { fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 19 },
  contratoBtn: { borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  contratoBtnTexto: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  flex: { flex: 1 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  titulo: { fontSize: 16, fontWeight: "800", textAlign: "center" },
  texto: { fontSize: 13, textAlign: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitulo: { fontSize: 16, fontWeight: "800" },
  scroll: { padding: 16, gap: 12 },
  topHeader: {
    alignItems: "center",
    marginBottom: 4,
    gap: 3,
  },
  topTituloEstado: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  topSubtituloVehiculo: {
    fontSize: 13.5,
    fontWeight: "600",
    textAlign: "center",
  },
  fotoCard: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 4,
  },
  foto: {
    width: "100%",
    height: 180,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  celda: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  celdaIcono: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  celdaContenido: {
    flex: 1,
    justifyContent: "center",
  },
  celdaLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  celdaValor: {
    fontSize: 12.5,
    lineHeight: 16,
  },
  tarjetaInformativa: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginVertical: 4,
  },
  tarjetaInfoHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tarjetaInfoTitulo: {
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
  },
  tarjetaInfoTexto: {
    fontSize: 13,
    lineHeight: 19,
  },
  tarjetaInfoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  tarjetaInfoBadgeTexto: {
    fontSize: 12,
    fontWeight: "700",
  },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  punto: { width: 7, height: 7, borderRadius: 4 },
  badgeTexto: { fontSize: 12, fontWeight: "800" },
  vehiculo: { fontSize: 17, fontWeight: "800" },
  sub: { fontSize: 12 },
  fila: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  filaLabel: { fontSize: 12, flexShrink: 0 },
  filaValor: { fontSize: 13, flex: 1, textAlign: "right" },
  aviso: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 },
  avisoTitulo: { fontSize: 13, fontWeight: "800" },
  avisoTexto: { fontSize: 12, lineHeight: 17 },
  codigo: { fontSize: 22, fontWeight: "800", letterSpacing: 2 },
  boton: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  botonTexto: { color: "#fff", fontWeight: "800", fontSize: 14 },
  botonSec: { paddingVertical: 12, borderRadius: 12, alignItems: "center", borderWidth: 1.5 },
  botonSecTexto: { fontWeight: "800", fontSize: 13 },
  cancelarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 8,
  },
  cancelarTexto: { color: "#DC2626", fontWeight: "800", fontSize: 13.5 },
});
