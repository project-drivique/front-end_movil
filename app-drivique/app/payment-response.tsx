// app/payment-response.tsx
//
// Pantalla a la que vuelve el usuario después del checkout de Wompi.
// Equivalente a src/modules/payments/pages/RespuestaPagoPage.jsx en la web:
// lee la reserva guardada localmente por su referencia y muestra el estado
// del pago (Wompi confirma la transacción de forma asíncrona vía webhook
// en el backend real; acá solo reflejamos que quedó "en validación").
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { COLOR_MARCA } from "@/modules/catalog/constants/catalog.constants";
import {
  calcularGrupoReserva,
  ReservaGuardada,
  reservaPersistService,
} from "@/modules/reservation/services/reservationPersistService";
import FirmaContrato from "@/modules/reservation/components/ContractSignature";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import {
  DatosDocumentos,
  DatosFechasLugar,
  DatosPersonales,
  DatosPlanes,
} from "@/modules/reservation/types/reservation.types";
import { fechaCorta, fmt } from "@/modules/reservation/components/BookingSummaryModal.pieces";
import { contratoService, ContratoGuardado } from "@/modules/reservation/services/contractService";
import {
  compartirPdfOriginal,
  crearTextosContrato,
  descargarContratoVisible,
  generarContratoPdf,
  leerPdfOriginalBase64,
} from "@/modules/reservation/services/pdfService";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function PagoRespuestaScreen() {
  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const { t } = useTranslation();
  const { ref, from } = useLocalSearchParams<{ ref?: string; from?: string }>();
  // `from="flow"` indica que se llega desde el checkout de Wompi (flujo de pago activo).
  // Sin ese parámetro el usuario llega desde Mis Reservas y no debe ver el contrato automáticamente.
  const vieneDeFlujo = from === "flow";

  const [cargando, setCargando] = useState(true);
  const [reserva, setReserva] = useState<ReservaGuardada | null>(null);
  const [contratoFirmado, setContratoFirmado] = useState(false);
  const [contratoActual, setContratoActual] = useState<ContratoGuardado | null>(null);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [claveDesbloqueada, setClaveDesbloqueada] = useState(false);
  const [claveIngresada, setClaveIngresada] = useState("");
  const [errorClave, setErrorClave] = useState("");
  const [mostrarFirmaManual, setMostrarFirmaManual] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      if (!ref) {
        setCargando(false);
        return;
      }
      const encontrada = await reservaPersistService.obtenerPorReferencia(ref);
      const contrato = await contratoService.obtenerPorReserva(ref);
      if (activo) {
        setReserva(encontrada ?? null);
        setContratoFirmado(!!contrato);
        setContratoActual(contrato);
        setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [ref]);

  const irAMisReservas = () => router.replace("/(tabs)/my-bookings");

  if (cargando) {
    return (
      <View style={[styles.center, { backgroundColor: c.bg, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLOR_MARCA} />
        <Text style={[styles.procesandoTexto, { color: c.textSecondary }]}>
          {t("reserva.confirmacion.respuesta.procesando")}
        </Text>
      </View>
    );
  }

  if (!reserva) {
    return (
      <View style={[styles.center, { backgroundColor: c.bg, paddingTop: insets.top, paddingHorizontal: 32 }]}>
        <Ionicons name="help-circle-outline" size={56} color={c.textMuted} />
        <Text style={[styles.tituloVacio, { color: c.textPrimary }]}>
          {t("reserva.confirmacion.respuesta.noEncontrada")}
        </Text>
        <Text style={[styles.textoVacio, { color: c.textMuted }]}>
          {t("reserva.confirmacion.respuesta.noEncontradaMensaje")}
        </Text>
        <TouchableOpacity style={styles.btnWrap} onPress={irAMisReservas} activeOpacity={0.85}>
          <LinearGradient
            colors={GRADIENTES.boton.colors}
            start={GRADIENTES.boton.start}
            end={GRADIENTES.boton.end}
            style={styles.btn}
          >
            <Text style={styles.btnTexto}>{t("reserva.confirmacion.respuesta.volverAMisReservas")}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // La reserva pudo haberse pagado con Wompi sin haber pasado todavía por
  // la firma del contrato (eso pasa después de volver del checkout, igual
  // que en la web). Reconstruimos todo lo necesario a partir del snapshot
  // que se guardó junto con la reserva.
  // El contrato se muestra automáticamente SOLO si el usuario viene del flujo de pago
  // Wompi (parámetro from="flow") y el estado requiere firma. Para pagos en efectivo
  // (PENDIENTE_EFECTIVO) el usuario primero debe pagar en sucursal; el contrato se
  // firma después, cuando el encargado confirma el pago y el estado cambia a CONFIRMADA.
  // PENDIENTE / PENDIENTE_VALIDACION: vienen del checkout de Wompi.
  // CONFIRMADA: viene del link del correo después que el admin confirma pago en sucursal.
  const estadosQueRequierenFirmaAutomatic = ["PENDIENTE", "PENDIENTE_VALIDACION", "CONFIRMADA"];

  if (
    vieneDeFlujo &&
    !contratoFirmado &&
    estadosQueRequierenFirmaAutomatic.includes(reserva.estado)
  ) {
    const vehiculoSnap = reserva.vehiculoSnapshot as Vehiculo | undefined;
    const datosPersonalesSnap = reserva.datosPersonalesSnapshot as DatosPersonales | undefined;
    const datosDocumentosSnap = reserva.datosDocumentosSnapshot as DatosDocumentos | undefined;
    const fechasLugarSnap = reserva.fechasLugarSnapshot as DatosFechasLugar | undefined;
    const planesSnap = reserva.planesSnapshot as DatosPlanes | undefined;

    if (vehiculoSnap && datosPersonalesSnap && fechasLugarSnap && planesSnap) {
      return (
        <View style={{ flex: 1, backgroundColor: c.bg }}>
          <HeaderDetalle insets={insets} c={c} titulo={t("reserva.contrato.title")} onVolver={irAMisReservas} />
          <FirmaContrato
            vehiculo={vehiculoSnap}
            datosPersonales={datosPersonalesSnap}
            datosDocumentos={
              datosDocumentosSnap ?? { cedulaFrente: null, cedulaReverso: null, licenciaConduccion: null }
            }
            fechasLugar={fechasLugarSnap}
            planes={planesSnap}
            total={reserva.total}
            referencia={reserva.referencia}
            onFirmado={async () => {
              await reservaPersistService.actualizarEstado(reserva.referencia, "CONFIRMADA");
              const actualizada = await reservaPersistService.obtenerPorReferencia(reserva.referencia);
              const contratoNuevo = await contratoService.obtenerPorReserva(reserva.referencia);
              setReserva(actualizada ?? null);
              setContratoActual(contratoNuevo);
              setContratoFirmado(true);
            }}
          />
        </View>
      );
    }
  }

  const estadoTexto = t(`reserva.confirmacion.estados.${reserva.estado}`, {
    defaultValue: reserva.estado,
  });

  const grupo = calcularGrupoReserva(reserva);

  const encabezadoPorGrupo: Record<
    string,
    { icono: keyof typeof Ionicons.glyphMap; color: string; titulo: string }
  > = {
    pendiente: {
      icono: reserva.estado === "PENDIENTE_EFECTIVO" ? "cash-outline" : "time-outline",
      color: "#f59e0b",
      titulo:
        reserva.estado === "PENDIENTE_EFECTIVO"
          ? t("misReservas.detalle.tituloPendienteEfectivo")
          : reserva.estado === "PENDIENTE_VALIDACION"
          ? t("misReservas.detalle.tituloPendienteValidacion")
          : t("misReservas.detalle.tituloPendiente"),
    },
    confirmada: { icono: "checkmark-done-circle-outline", color: COLOR_MARCA, titulo: t("misReservas.detalle.tituloConfirmada") },
    en_curso: { icono: "navigate-circle-outline", color: "#16a34a", titulo: t("misReservas.detalle.tituloEnCurso") },
    finalizada: { icono: "flag-outline", color: "#6b7280", titulo: t("misReservas.detalle.tituloFinalizada") },
    cancelada: { icono: "close-circle-outline", color: "#dc2626", titulo: t("misReservas.detalle.tituloCancelada") },
  };
  const encabezado = encabezadoPorGrupo[grupo];

  const vehiculoSnap = reserva.vehiculoSnapshot as Vehiculo | undefined;
  const datosPersonalesSnap = reserva.datosPersonalesSnapshot as DatosPersonales | undefined;
  const datosDocumentosSnap = reserva.datosDocumentosSnapshot as DatosDocumentos | undefined;
  const fechasLugarSnap = reserva.fechasLugarSnapshot as DatosFechasLugar | undefined;
  const planesSnap = reserva.planesSnapshot as DatosPlanes | undefined;
  const foto = vehiculoSnap?.imagenes?.[0];

  const handleValidarClave = () => {
    const datosPersonalesSnap = reserva?.datosPersonalesSnapshot as DatosPersonales | undefined;
    const numeroDocumento = datosPersonalesSnap?.numeroDocumento?.replace(/\D/g, "");
    const claveNormalizada = claveIngresada.replace(/\D/g, "");
    if (numeroDocumento && claveNormalizada === numeroDocumento) {
      setErrorClave("");
      setClaveDesbloqueada(true);
    } else {
      setErrorClave(t("misReservas.claveIncorrecta"));
    }
  };

  const handleDescargarPdf = async () => {
    if (!contratoActual) {
      Alert.alert(t("misReservas.contratoNoDisponibleTitulo"), t("misReservas.contratoNoDisponible"));
      return;
    }
    setGenerandoPdf(true);
    try {
      if (Platform.OS === "web") {
        await descargarContratoVisible(`contrato-${reserva.referencia}.pdf`);
        return;
      }
      if (!vehiculoSnap || !datosPersonalesSnap || !fechasLugarSnap || !planesSnap) {
        Alert.alert(t("misReservas.contratoNoDisponibleTitulo"), t("misReservas.contratoNoDisponible"));
        return;
      }
      let pdfBase64 = contratoActual.contratoPdfBase64;
      let pdfNombre = contratoActual.contratoPdfNombre || `contrato-${reserva.referencia}.pdf`;

      // Migra contratos antiguos: genera una sola vez el documento legal completo y lo conserva.
      if (!pdfBase64) {
        const tipoDocumentoTexto = datosPersonalesSnap.tipoDocumento
          ? t(`reserva.datosPersonales.tiposDocumento.${datosPersonalesSnap.tipoDocumento === "Doc. Extranjero" ? "DocExtranjero" : datosPersonalesSnap.tipoDocumento}`, { defaultValue: datosPersonalesSnap.tipoDocumento })
          : "";
        const uriContrato = await generarContratoPdf({
          contrato: contratoActual,
          vehiculo: vehiculoSnap,
          datosPersonales: datosPersonalesSnap,
          datosDocumentos: datosDocumentosSnap ?? { cedulaFrente: null, cedulaReverso: null, licenciaConduccion: null },
          fechasLugar: fechasLugarSnap,
          planes: planesSnap,
          total: reserva.total,
          referencia: reserva.referencia,
          formatPrecio: fmt,
          formatearFecha: (iso) => (iso ? fechaCorta(iso) : "—"),
          tipoDocumentoTexto,
          textos: crearTextosContrato((key) => t(key)),
        });
        pdfBase64 = await leerPdfOriginalBase64(uriContrato);
        const actualizado = await contratoService.guardarPdfContrato(reserva.referencia, pdfBase64, pdfNombre);
        if (actualizado) setContratoActual(actualizado);
      }
      await compartirPdfOriginal(
        pdfBase64,
        pdfNombre
      );
    } catch (error) {
      console.error("[pago-respuesta] Error generando el PDF", error);
      Alert.alert(t("misReservas.errorPdfTitulo"), t("misReservas.errorPdfMensaje"));
    } finally {
      setGenerandoPdf(false);
    }
  };

  // Firma manual: para CONFIRMADA sin contrato firmado cuando viene desde Mis Reservas
  const puedeIniciarFirmaManual =
    !contratoFirmado &&
    reserva.estado === "CONFIRMADA" &&
    vehiculoSnap && datosPersonalesSnap && fechasLugarSnap && planesSnap;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <HeaderDetalle
        insets={insets}
        c={c}
        titulo={t("misReservas.detalle.tituloHeader", { defaultValue: "Detalle de Reserva" })}
        onVolver={() => {
          if (mostrarFirmaManual) setMostrarFirmaManual(false);
          else irAMisReservas();
        }}
      />

      {/* Vista de contrato en solo lectura (con clave desbloqueada) */}
      {contratoActual && claveDesbloqueada && vehiculoSnap && datosPersonalesSnap && fechasLugarSnap && planesSnap ? (
        <FirmaContrato
          vehiculo={vehiculoSnap}
          datosPersonales={datosPersonalesSnap}
          datosDocumentos={
            datosDocumentosSnap ?? { cedulaFrente: null, cedulaReverso: null, licenciaConduccion: null }
          }
          fechasLugar={fechasLugarSnap}
          planes={planesSnap}
          total={reserva.total}
          referencia={reserva.referencia}
          onFirmado={() => {}}
          soloLectura
          contratoFirmado={contratoActual}
          onDescargar={handleDescargarPdf}
          descargando={generandoPdf}
        />
      ) : mostrarFirmaManual && vehiculoSnap && datosPersonalesSnap && fechasLugarSnap && planesSnap ? (
        /* Firma manual para reservas CONFIRMADA desde Mis Reservas */
        <FirmaContrato
          vehiculo={vehiculoSnap}
          datosPersonales={datosPersonalesSnap}
          datosDocumentos={
            datosDocumentosSnap ?? { cedulaFrente: null, cedulaReverso: null, licenciaConduccion: null }
          }
          fechasLugar={fechasLugarSnap}
          planes={planesSnap}
          total={reserva.total}
          referencia={reserva.referencia}
          onFirmado={async () => {
            await reservaPersistService.actualizarEstado(reserva.referencia, "CONFIRMADA");
            const actualizada = await reservaPersistService.obtenerPorReferencia(reserva.referencia);
            const contratoNuevo = await contratoService.obtenerPorReserva(reserva.referencia);
            setReserva(actualizada ?? null);
            setContratoActual(contratoNuevo);
            setContratoFirmado(true);
            setMostrarFirmaManual(false);
          }}
        />
      ) : (
      <ScrollView
        style={{ backgroundColor: c.bg }}
        contentContainerStyle={[styles.scroll, { paddingTop: 24 }]}
        showsVerticalScrollIndicator={false}
      >
      {foto ? (
        <Image source={{ uri: foto }} style={styles.foto} />
      ) : (
        <View style={[styles.iconoWrap, { backgroundColor: c.primaryBg }]}>
          <Ionicons name={encabezado.icono} size={40} color={encabezado.color} />
        </View>
      )}

      <Text style={[styles.titulo, { color: c.textPrimary }]}>{encabezado.titulo}</Text>
      <Text style={[styles.subtitulo, { color: c.textSecondary }]}>
        {reserva.vehiculoNombre}
      </Text>

      {/* Tarjeta principal de detalles de la reserva */}
      <View style={[styles.card, styles.detalleCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
        <LinearGradient
          colors={[encabezado.color, `${encabezado.color}88`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.detalleFranja}
        />
        <FilaDetalle
          icono="car-sport-outline"
          label={t("reserva.confirmacion.respuesta.vehiculo")}
          valor={reserva.vehiculoNombre}
          c={c}
        />
        <FilaDetalle
          icono="calendar-outline"
          label={t("misReservas.detalle.fechaInicio")}
          valor={reserva.fechaRetiro ? fechaCorta(String(reserva.fechaRetiro)) : "—"}
          c={c}
        />
        <FilaDetalle
          icono="calendar-number-outline"
          label={t("misReservas.detalle.fechaFin")}
          valor={reserva.fechaDevolucion ? fechaCorta(String(reserva.fechaDevolucion)) : "—"}
          c={c}
        />
        <FilaDetalle
          icono="location-outline"
          label={t("misReservas.detalle.lugar")}
          valor={String(reserva.lugarRetiro ?? "—")}
          c={c}
        />
        {reserva.proteccion ? (
          <FilaDetalle
            icono="shield-checkmark-outline"
            label={t("misReservas.detalle.proteccion")}
            valor={t(`reserva.planes.nombreSeguro.${reserva.proteccion}`, { defaultValue: String(reserva.proteccion) })}
            c={c}
          />
        ) : null}
        <FilaDetalle
          icono="receipt-outline"
          label={t("reserva.confirmacion.respuesta.referencia")}
          valor={reserva.referencia}
          c={c}
        />
        {reserva.paymentId ? (
          <FilaDetalle
            icono="card-outline"
            label={t("reserva.confirmacion.respuesta.idTransaccion")}
            valor={String(reserva.paymentId)}
            c={c}
          />
        ) : null}
        <FilaDetalle
          icono="cash-outline"
          label={t("reserva.confirmacion.respuesta.total")}
          valor={fmt(reserva.total)}
          c={c}
        />
        <FilaDetalle
          icono="checkmark-circle-outline"
          label={t("reserva.confirmacion.respuesta.estado")}
          valor={estadoTexto}
          c={c}
          ultima
        />
      </View>

      {/* Tarjeta de Pago Pendiente en Sucursal (solo para PENDIENTE_EFECTIVO) */}
      {reserva.estado === "PENDIENTE_EFECTIVO" && reserva.codigoVerificacionEfectivo ? (
        <View style={[styles.card, styles.efectivoCard, { backgroundColor: "#ffffff" }]}>
          {/* Franja amarilla superior */}
          <View style={styles.efectivoFranja} />
          
          <View style={styles.efectivoHeaderRow}>
            <View style={styles.efectivoIconoWrap}>
              <Ionicons name="cash-outline" size={22} color="#b45309" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.efectivoTarjetaTitulo}>Pago Pendiente en Sucursal</Text>
              <Text style={styles.efectivoTarjetaSubtitulo}>Preséntate en cualquier sucursal autorizada</Text>
            </View>
          </View>

          <View style={styles.efectivoCodigoBox}>
            <Text style={styles.efectivoCodigoLabel}>CÓDIGO DE VERIFICACIÓN</Text>
            <Text style={styles.efectivoCodigoValor}>{reserva.codigoVerificacionEfectivo}</Text>
            <Text style={styles.efectivoCopyHint}>Muestra este código en sucursal</Text>
          </View>

          <View style={styles.efectivoAlertaRow}>
            <Ionicons name="time-outline" size={15} color="#dc2626" />
            <Text style={styles.efectivoAlertaTexto}>
              Tu reserva se cancela automáticamente si no pagas en {reserva.horasLimitePago ?? 72} horas
            </Text>
          </View>

          <View style={[styles.efectivoInfoRow, { borderTopColor: "#f3f4f6" }]}>
            <Ionicons name="information-circle-outline" size={14} color="#6b7280" />
            <Text style={styles.efectivoInfoTexto}>
              Después del pago, el encargado de la sucursal confirmará tu reserva. Recibirás una notificación para firmar el contrato.
            </Text>
          </View>
        </View>
      ) : null}

      {/* Sección de contrato (solo si NO es pago en efectivo pendiente) */}
      {reserva.estado !== "PENDIENTE_EFECTIVO" && (
        <>
          {contratoActual && !claveDesbloqueada ? (
            <View style={[styles.card, { backgroundColor: c.bgCard, borderColor: c.border, alignItems: "center" }]}>
              <Ionicons name="lock-closed-outline" size={32} color={c.textMuted} style={{ marginBottom: 10 }} />
              <Text style={[styles.tituloCandado, { color: c.textPrimary }]}>
                {t("misReservas.contratoBloqueadoTitulo")}
              </Text>
              <Text style={[styles.textoCandado, { color: c.textSecondary }]}>
                {t("misReservas.contratoBloqueadoTexto")}
              </Text>
              <View style={{ width: "100%", marginTop: 12 }}>
                <PasswordInput
                  label={t("misReservas.claveContrato")}
                  placeholder={t("misReservas.claveContratoPlaceholder")}
                  value={claveIngresada}
                  onChangeText={(v) => {
                    setClaveIngresada(v);
                    if (errorClave) setErrorClave("");
                  }}
                  error={errorClave}
                  keyboardType="number-pad"
                />
              </View>
              <TouchableOpacity style={[styles.btnWrap, { marginTop: 4 }]} onPress={handleValidarClave} activeOpacity={0.85}>
                <LinearGradient
                  colors={GRADIENTES.boton.colors}
                  start={GRADIENTES.boton.start}
                  end={GRADIENTES.boton.end}
                  style={styles.btn}
                >
                  <Text style={styles.btnTexto}>{t("misReservas.verContrato")}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : puedeIniciarFirmaManual && !mostrarFirmaManual ? (
            /* Botón para iniciar firma desde Mis Reservas (CONFIRMADA sin contrato) */
            <View style={[styles.card, { backgroundColor: "#fffbeb", borderColor: "#f59e0b", alignItems: "center" }]}>
              <Ionicons name="document-text-outline" size={32} color="#b45309" style={{ marginBottom: 10 }} />
              <Text style={[styles.tituloCandado, { color: "#92400e" }]}>Tu reserva está confirmada</Text>
              <Text style={[styles.textoCandado, { color: "#78350f" }]}>
                Ya puedes firmar el contrato de arrendamiento para completar el proceso.
              </Text>
              <TouchableOpacity
                style={[styles.btnWrap, { marginTop: 14 }]}
                onPress={() => setMostrarFirmaManual(true)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={GRADIENTES.boton.colors}
                  start={GRADIENTES.boton.start}
                  end={GRADIENTES.boton.end}
                  style={[styles.btn, { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 }]}
                >
                  <Ionicons name="create-outline" size={17} color="#fff" />
                  <Text style={styles.btnTexto}>Firmar Contrato</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : null}
        </>
      )}

      {/* Botón de Volver a Mis Reservas */}
      <TouchableOpacity style={[styles.btnWrap, { marginTop: 8, marginBottom: 8 }]} onPress={irAMisReservas} activeOpacity={0.85}>
        <View style={[styles.btn, { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: c.bgInput, borderWidth: 1, borderColor: c.border }]}>
          <Ionicons name="arrow-back-outline" size={17} color={c.textPrimary} />
          <Text style={[styles.btnTexto, { color: c.textPrimary }]}>Mis Reservas</Text>
        </View>
      </TouchableOpacity>

    </ScrollView>
      )}
    </View>
  );
}

function HeaderDetalle({
  insets,
  c,
  titulo,
  onVolver,
}: {
  insets: { top: number };
  c: ReturnType<typeof useTemaColores>;
  titulo: string;
  onVolver: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingTop: insets.top,
        height: insets.top + 56,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: c.border,
        backgroundColor: c.bgHeader,
      }}
    >
      <TouchableOpacity
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: c.bgInput,
        }}
        onPress={onVolver}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color={c.textPrimary} />
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: c.textPrimary,
          marginLeft: 12,
          flexShrink: 1,
        }}
        numberOfLines={1}
      >
        {titulo}
      </Text>
    </View>
  );
}

function FilaDetalle({
  icono,
  label,
  valor,
  c,
  ultima,
}: {
  icono: keyof typeof Ionicons.glyphMap;
  label: string;
  valor: string;
  c: ReturnType<typeof useTemaColores>;
  ultima?: boolean;
}) {
  return (
    <View
      style={[
        filaS.fila,
        { backgroundColor: c.bgInput, borderColor: c.border },
        ultima && { backgroundColor: c.primaryBg, borderColor: `${c.primary}35` },
      ]}
    >
      <View style={[filaS.iconoWrap, { backgroundColor: c.primaryBg }]}>
        <Ionicons name={icono} size={17} color={ultima ? c.success : c.primary} />
      </View>
      <Text style={[filaS.label, { color: c.textSecondary }]}>{label}</Text>
      <Text style={[filaS.valor, { color: c.textPrimary }]} numberOfLines={1}>
        {valor}
      </Text>
    </View>
  );
}

const filaS = StyleSheet.create({
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 12,
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconoWrap: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 12.5, flex: 1 },
  valor: { fontSize: 12.5, fontWeight: "800", maxWidth: "52%", flexShrink: 1, textAlign: "right" },
});

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  procesandoTexto: { fontSize: 14 },
  tituloVacio: { fontSize: 17, fontWeight: "800", marginTop: 12, textAlign: "center" },
  textoVacio: { fontSize: 13, marginTop: 6, textAlign: "center", lineHeight: 19 },
  scroll: { paddingHorizontal: 24, paddingBottom: 40, alignItems: "center" },
  iconoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  foto: {
    width: 96,
    height: 72,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: "cover",
  },
  titulo: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  subtitulo: { fontSize: 13.5, textAlign: "center", marginTop: 8, lineHeight: 19, marginBottom: 20 },
  card: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  detalleCard: { padding: 12, paddingTop: 18, overflow: "hidden" },
  detalleFranja: { position: "absolute", top: 0, left: 0, right: 0, height: 6 },
  btnWrap: { width: "100%", borderRadius: 12 },
  btn: { paddingVertical: 15, borderRadius: 12, alignItems: "center" },
  btnTexto: { color: "#fff", fontSize: 14.5, fontWeight: "800" },
  tituloCandado: { fontSize: 15.5, fontWeight: "800", textAlign: "center" },
  textoCandado: { fontSize: 12.5, textAlign: "center", marginTop: 6, lineHeight: 18 },
  btnDescargarWrap: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  btnDescargarTexto: { fontSize: 14, fontWeight: "700" },

  // ---- Tarjeta de Pago Pendiente en Sucursal (PENDIENTE_EFECTIVO) ----
  efectivoCard: {
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#fbbf24",
    padding: 0,
  },
  efectivoFranja: {
    height: 5,
    backgroundColor: "#f59e0b",
    width: "100%",
  },
  efectivoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    paddingBottom: 12,
  },
  efectivoIconoWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  efectivoTarjetaTitulo: {
    fontSize: 14,
    fontWeight: "800",
    color: "#92400e",
  },
  efectivoTarjetaSubtitulo: {
    fontSize: 11.5,
    color: "#b45309",
    marginTop: 2,
  },
  efectivoCodigoBox: {
    marginHorizontal: 16,
    backgroundColor: "#fffbeb",
    borderWidth: 1.5,
    borderColor: "#fde68a",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  efectivoCodigoLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#b45309",
    letterSpacing: 1,
    marginBottom: 6,
  },
  efectivoCodigoValor: {
    fontSize: 26,
    fontWeight: "900",
    color: "#78350f",
    letterSpacing: 2,
  },
  efectivoCopyHint: {
    fontSize: 10.5,
    color: "#b45309",
    marginTop: 6,
  },
  efectivoAlertaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  efectivoAlertaTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: "#dc2626",
    flex: 1,
    lineHeight: 16,
  },
  efectivoInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  efectivoInfoTexto: {
    fontSize: 11.5,
    color: "#6b7280",
    flex: 1,
    lineHeight: 16,
  },
});
