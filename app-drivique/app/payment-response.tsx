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
        <View style={[s.card, { backgroundColor: c.bgCard, borderColor: c.border }]}>
          {foto ? <Image source={{ uri: foto }} style={s.foto} resizeMode="cover" /> : null}
          <View style={[s.badge, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
            <View style={[s.punto, { backgroundColor: color }]} />
            <Text style={[s.badgeTexto, { color }]}>{tituloEstado}</Text>
          </View>
          <Text style={[s.vehiculo, { color: c.textPrimary }]}>{reserva.vehiculoNombre}</Text>
          {reserva.vehiculoPlaca ? <Text style={[s.sub, { color: c.textSecondary }]}>{reserva.vehiculoPlaca}</Text> : null}
          <Fila c={c} label={t("reserva.confirmacion.respuesta.referencia")} valor={reserva.referencia} />
          <Fila
            c={c}
            label={t("misReservas.detalle.fechaInicio")}
            valor={`${fechaCorta(reserva.fechaRetiro)} ${formatHoraAmPm(reserva.horaRetiro)}`}
          />
          <Fila
            c={c}
            label={t("misReservas.detalle.fechaFin")}
            valor={`${fechaCorta(reserva.fechaDevolucion)} ${formatHoraAmPm(reserva.horaDevolucion)}`}
          />
          {vehiculo?.sucursal ? (
            <Fila
              c={c}
              label={t("misReservas.detalle.lugarRetiro")}
              valor={`${vehiculo.sucursal}${getDireccionSucursal(vehiculo.sucursal) ? ` - ${getDireccionSucursal(vehiculo.sucursal)}` : ""}`}
            />
          ) : null}
          {reserva.proteccion ? <Fila c={c} label={t("misReservas.detalle.proteccion")} valor={reserva.proteccion} /> : null}
          {reserva.planKilometraje ? <Fila c={c} label="Kilometraje" valor={reserva.planKilometraje} /> : null}
          {reserva.servicios.length > 0 ? (
            <Fila c={c} label="Servicios adicionales" valor={reserva.servicios.map((x) => x.nombre).join(", ")} />
          ) : null}
          <Fila
            c={c}
            label={t("reserva.confirmacion.respuesta.medioPago")}
            valor={reserva.metodoPago === "efectivo" ? t("reserva.confirmacion.pagoEnSucursalCorto") : "Wompi"}
          />
          <Fila c={c} label={t("reserva.confirmacion.respuesta.total")} valor={fmt(reserva.total)} fuerte />
        </View>

        {aviso ? (
          <View style={[s.aviso, { borderColor: "#f59e0b", backgroundColor: c.oscuro ? "#422006" : "#fffbeb" }]}>
            <Text style={[s.avisoTexto, { color: c.oscuro ? "#fde68a" : "#92400e" }]}>{aviso}</Text>
          </View>
        ) : null}

        {enRevision ? (
          <View style={[s.aviso, { borderColor: primaryAccent, backgroundColor: c.primaryBg }]}>
            <Text style={[s.avisoTitulo, { color: primaryAccent }]}>
              {t("misReservas.detalle.enRevisionDocumentos", { defaultValue: "En revisión de documentos" })}
            </Text>
            <Text style={[s.avisoTexto, { color: c.textSecondary }]}>
              {t("misReservas.detalle.enRevisionTexto", {
                defaultValue:
                  "El encargado de la sucursal esta revisando tus documentos. Podras pagar cuando sean aprobados; te avisaremos por notificacion.",
              })}
            </Text>
          </View>
        ) : null}

        {enHorario ? (
          <View style={[s.aviso, { borderColor: primaryAccent, backgroundColor: c.primaryBg }]}>
            <Text style={[s.avisoTexto, { color: c.textSecondary }]}>
              {t("misReservas.detalle.pendienteHorarioTexto", {
                defaultValue: "Tu reserva fue registrada fuera del horario de atencion. La sucursal la gestionara en su proximo horario.",
              })}
            </Text>
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
          <TouchableOpacity onPress={cancelar} disabled={ocupado} style={s.cancelar}>
            <Text style={s.cancelarTexto}>{t("misReservas.cancelarReserva", { defaultValue: "Cancelar reserva" })}</Text>
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
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 },
  foto: { width: "100%", height: 150, borderRadius: 10 },
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
  cancelar: { alignItems: "center", paddingVertical: 10 },
  cancelarTexto: { color: "#dc2626", fontWeight: "700", fontSize: 13 },
});
