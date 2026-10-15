// app/contract-view.tsx
//
// Contrato de alquiler: se renderiza unicamente con la respuesta de la API de contratos.
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { COLOR_MARCA } from "@/modules/catalog/constants/catalog.constants";
import { GRADIENTES } from "@/constants/gradients";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import FirmaCanvas, { FirmaCanvasHandle } from "@/modules/reservation/components/SignatureCanvas";
import { ContratoDTO, contratoService } from "@/modules/reservation/services/contractService";
import { mensajeDeError } from "@/modules/reservation/services/reservationPersistService";
import { fmt } from "@/modules/reservation/components/BookingSummaryModal.pieces";
import { COLOR_ACENTO } from "@/constants/brandPalette";

function formatearFecha(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" });
}

export default function ContratoScreen() {
  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const { t } = useTranslation();
  const { ref } = useLocalSearchParams<{ ref?: string }>();
  const primaryAccent = c.oscuro ? COLOR_ACENTO : COLOR_MARCA;
  const firmaRef = useRef<FirmaCanvasHandle>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [contrato, setContrato] = useState<ContratoDTO | null>(null);
  const [firmaUri, setFirmaUri] = useState<string | null>(null);
  const [firmaVacia, setFirmaVacia] = useState(true);
  const [errorFirma, setErrorFirma] = useState("");
  const [firmando, setFirmando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [claveDesbloqueada, setClaveDesbloqueada] = useState(false);
  const [claveIngresada, setClaveIngresada] = useState("");
  const [errorClave, setErrorClave] = useState("");

  const cargarFirma = useCallback(async (dto: ContratoDTO) => {
    if (!dto.signedAt) {
      setFirmaUri(null);
      return;
    }
    try {
      setFirmaUri(await contratoService.obtenerFirmaDataUri(dto.id));
    } catch {
      setFirmaUri(null);
    }
  }, []);

  useEffect(() => {
    let activo = true;
    (async () => {
      if (!ref) {
        setCargando(false);
        setError(t("contratoFirma.loadError"));
        return;
      }
      try {
        const dto = await contratoService.obtenerPorReserva(ref);
        if (!activo) return;
        setContrato(dto);
        await cargarFirma(dto);
      } catch (e) {
        if (activo) setError(mensajeDeError(e, t("contratoFirma.loadError")));
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [ref, t, cargarFirma]);

  // El contrato solo se abre con el número de documento con el que se hizo la reserva
  const handleValidarClave = () => {
    const docReserva = String(contrato?.customerDocumentNumber || "").trim();
    const soloDigitos = docReserva.replace(/\D/g, "");
    const claveDigitos = claveIngresada.replace(/\D/g, "");
    const coincide =
      !!docReserva &&
      ((soloDigitos.length > 0 && claveDigitos === soloDigitos) || claveIngresada.trim().toUpperCase() === docReserva.toUpperCase());
    if (coincide) {
      setErrorClave("");
      setClaveDesbloqueada(true);
    } else {
      setErrorClave(t("misReservas.claveIncorrecta"));
    }
  };

  const firmado = !!contrato?.signedAt;
  const puedeFirmar = !!contrato && !firmado && contrato.statusCode === "PENDING_SIGNATURE";

  const handleFirmar = async () => {
    if (!contrato || !firmaRef.current) return;
    if (firmaRef.current.estaVacio()) {
      setErrorFirma(t("contratoFirma.signatureRequired"));
      return;
    }
    setErrorFirma("");
    setFirmando(true);
    try {
      const actualizado = await contratoService.firmar(
        contrato,
        firmaRef.current.obtenerPngBase64(),
        firmaRef.current.obtenerFirmaData(),
      );
      setContrato(actualizado);
      await cargarFirma(actualizado);
    } catch (e) {
      Alert.alert(t("contratoFirma.signError"), mensajeDeError(e, t("contratoFirma.signError")));
    } finally {
      setFirmando(false);
    }
  };

  const handlePdf = async () => {
    if (!contrato) return;
    setOcupado(true);
    try {
      const uri = await contratoService.descargarPdf(contrato.id, `contrato-${contrato.contractNumber}.pdf`);
      if (Platform.OS === "web") {
        window.open(uri, "_blank");
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: contrato.contractNumber });
      }
    } catch (e) {
      Alert.alert(t("contratoFirma.pdfError"), mensajeDeError(e, t("contratoFirma.pdfError")));
    } finally {
      setOcupado(false);
    }
  };

  const handleCorreo = async () => {
    if (!contrato) return;
    setOcupado(true);
    try {
      const enviado = await contratoService.enviarPorCorreo(contrato.id);
      Alert.alert(enviado ? t("contratoFirma.emailSent") : t("contratoFirma.emailNotSent"));
    } catch (e) {
      Alert.alert(t("contratoFirma.emailNotSent"), mensajeDeError(e, ""));
    } finally {
      setOcupado(false);
    }
  };

  const licencia = (estado?: string) => {
    if (estado === "APPROVED") return t("contratoFirma.licenseApproved");
    if (estado === "PENDING") return t("contratoFirma.licensePending");
    if (estado === "REJECTED") return t("contratoFirma.licenseRejected");
    return "";
  };

  const volver = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)/my-bookings" as any));

  const Campo = ({ label, value }: { label: string; value?: string | number | null }) => (
    <View style={s.campo}>
      <Text style={[s.campoLabel, { color: c.textMuted }]}>{label}</Text>
      <Text style={[s.campoValor, { color: c.textPrimary }]}>
        {value === undefined || value === null || value === "" ? "—" : String(value)}
      </Text>
    </View>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <View style={[s.card, { backgroundColor: c.bgCard, borderColor: c.border }]}>{children}</View>
  );

  const Titulo = ({ texto }: { texto: string }) => (
    <Text style={[s.cardTitulo, { color: primaryAccent }]}>{texto}</Text>
  );

  const Clausula = ({ titulo, texto }: { titulo: string; texto: string }) => (
    <Text style={[s.clausula, { color: c.textSecondary }]}>
      <Text style={{ fontWeight: "800", color: c.textPrimary }}>{titulo} </Text>
      {texto}
    </Text>
  );

  return (
    <View style={[s.flex, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle={c.oscuro ? "light-content" : "dark-content"} />
      <View style={[s.header, { borderBottomColor: c.border, backgroundColor: c.bgCard }]}>
        <TouchableOpacity onPress={volver} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={primaryAccent} />
        </TouchableOpacity>
        <Text style={[s.headerTitulo, { color: c.textPrimary }]} numberOfLines={1}>
          {t("contratoFirma.title")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {cargando ? (
        <View style={s.centro}>
          <ActivityIndicator size="large" color={COLOR_MARCA} />
        </View>
      ) : !contrato ? (
        <View style={s.centro}>
          <Ionicons name="alert-circle-outline" size={44} color={c.textMuted} />
          <Text style={[s.error, { color: c.textSecondary }]}>{error || t("contratoFirma.loadError")}</Text>
        </View>
      ) : !claveDesbloqueada ? (
        <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={s.bloqueoContenedor} keyboardShouldPersistTaps="handled">
            <View style={[s.bloqueoCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
              <View style={[s.bloqueoIcono, { backgroundColor: c.primaryBg }]}>
                <Ionicons name="lock-closed-outline" size={32} color={primaryAccent} />
              </View>
              <Text style={[s.bloqueoTitulo, { color: c.textPrimary }]}>{t("misReservas.contratoBloqueadoTitulo")}</Text>
              <Text style={[s.bloqueoSubtitulo, { color: c.textSecondary }]}>
                {t("misReservas.contratoBloqueadoTexto")}
              </Text>
              <View style={{ width: "100%", marginTop: 14 }}>
                <PasswordInput
                  placeholder={t("misReservas.claveContratoPlaceholder")}
                  value={claveIngresada}
                  onChangeText={(v) => {
                    setClaveIngresada(v);
                    if (errorClave) setErrorClave("");
                  }}
                  error={errorClave}
                />
              </View>
              <TouchableOpacity style={{ width: "100%", marginTop: 8 }} onPress={handleValidarClave} activeOpacity={0.85}>
                <LinearGradient
                  colors={GRADIENTES.boton.colors}
                  start={GRADIENTES.boton.start}
                  end={GRADIENTES.boton.end}
                  style={s.bloqueoBtn}
                >
                  <Text style={s.bloqueoBtnTexto}>{t("misReservas.verContrato")}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 32 }]}>
          <Card>
            <Text style={[s.badge, { color: primaryAccent }]}>{t("contratoFirma.badgeLabel")}</Text>
            <Text style={[s.titulo, { color: c.textPrimary }]}>{t("contratoFirma.title")}</Text>
            <Text style={[s.subtitulo, { color: c.textSecondary }]}>{t("contratoFirma.subtitle")}</Text>
            <Text style={[s.subtitulo, { color: c.textSecondary }]}>{t("contratoFirma.autoGenNote")}</Text>
            <View style={s.separador} />
            <Campo label={t("contratoFirma.contractCode")} value={contrato.contractNumber} />
            <Campo
              label={t("contratoFirma.status")}
              value={firmado ? t("contratoFirma.statusSigned") : t("contratoFirma.statusPending")}
            />
            <Campo label={t("contratoFirma.generationDate")} value={formatearFecha(contrato.signedAt || contrato.scheduledStartAt)} />
            <Campo label={t("contratoFirma.reservationCode")} value={contrato.reservationCode} />
          </Card>

          <Card>
            <Text style={[s.parrafo, { color: c.textSecondary }]}>
              {t("contratoFirma.intro", {
                nombre: contrato.customerFullName,
                tipoDoc: "documento",
                numDoc: contrato.customerDocumentNumber,
              })}
            </Text>
          </Card>

          <Card>
            <Titulo texto={t("contratoFirma.userDataTitle")} />
            <Campo label={t("contratoFirma.fullName")} value={contrato.customerFullName} />
            <Campo label={t("contratoFirma.document")} value={contrato.customerDocumentNumber} />
            <Campo label={t("contratoFirma.email")} value={contrato.customerEmail} />
            <Campo label={t("contratoFirma.phone")} value={contrato.customerPhone} />
            <Campo label={t("contratoFirma.address")} value={contrato.customerAddress || t("contratoFirma.notProvided")} />
            <Campo label={t("contratoFirma.license")} value={licencia(contrato.driverLicenseStatus)} />
          </Card>

          <Card>
            <Titulo texto={t("contratoFirma.reservationTitle")} />
            <Campo label={t("contratoFirma.vehicle")} value={`${contrato.vehicleBrandName} ${contrato.vehicleModel}`.trim()} />
            <Campo label={t("contratoFirma.plate")} value={contrato.vehiclePlate} />
            <Campo label={t("contratoFirma.color")} value={contrato.vehicleColor} />
            <Campo label={t("contratoFirma.year")} value={contrato.vehicleYear} />
            <Campo label={t("contratoFirma.branch")} value={contrato.pickupBranchName} />
            <Campo label={t("contratoFirma.branchCity")} value={contrato.pickupCityName} />
            <Campo label={t("contratoFirma.branchAddress")} value={contrato.pickupBranchAddress} />
            <Campo label={t("contratoFirma.startDate")} value={formatearFecha(contrato.scheduledStartAt)} />
            <Campo label={t("contratoFirma.endDate")} value={formatearFecha(contrato.scheduledEndAt)} />
            <Campo
              label={t("contratoFirma.paymentMethod")}
              value={contrato.paymentMethodCode === "CASH" ? t("contratoFirma.paymentMethodCash") : t("contratoFirma.paymentMethodWompi")}
            />
            {contrato.paymentMethodCode === "CASH" ? (
              <Campo label={t("contratoFirma.cashPaymentBranch")} value={contrato.cashPaymentBranchName} />
            ) : null}
            <Campo label={t("contratoFirma.totalValue")} value={fmt(Number(contrato.finalAmount))} />
            <Campo
              label={t("contratoFirma.additionalServices")}
              value={contrato.additionalServiceNames?.length ? contrato.additionalServiceNames.join(", ") : t("contratoFirma.noneAdded")}
            />
            <Campo label={t("contratoFirma.protectionPlan")} value={contrato.insuranceCoverageName} />
          </Card>

          <Card>
            <Titulo texto={t("contratoFirma.clausesTitle")} />
            <Clausula
              titulo={t("contratoFirma.clause1Title")}
              texto={t("contratoFirma.clause1Text", {
                marca: contrato.vehicleBrandName,
                modelo: contrato.vehicleModel,
                placa: contrato.vehiclePlate,
                inicio: formatearFecha(contrato.scheduledStartAt),
                fin: formatearFecha(contrato.scheduledEndAt),
              })}
            />
            <Clausula titulo={t("contratoFirma.clause2Title")} texto={t("contratoFirma.clause2Text")} />
            <Text style={[s.clausula, { color: c.textPrimary, fontWeight: "800" }]}>{t("contratoFirma.clause3Title")}</Text>
            {[1, 2, 3, 4].map((n) => (
              <Text key={n} style={[s.item, { color: c.textSecondary }]}>
                {"• "}
                {t(`contratoFirma.clause3Item${n}`)}
              </Text>
            ))}
            <Clausula titulo={t("contratoFirma.clause4Title")} texto={t("contratoFirma.clause4Text")} />
            <Clausula titulo={t("contratoFirma.clause5Title")} texto={t("contratoFirma.clause5Text")} />
            <Clausula titulo={t("contratoFirma.clause6Title")} texto={t("contratoFirma.clause6Text")} />
          </Card>

          <Card>
            <Titulo texto={t("contratoFirma.signaturesTitle")} />
            <Campo label={t("contratoFirma.signCity")} value={contrato.pickupCityName} />
            <Campo label={t("contratoFirma.signDate")} value={formatearFecha(contrato.signedAt)} />

            <Text style={[s.subTitulo, { color: c.textPrimary }]}>{t("contratoFirma.userSignature")}</Text>
            {firmado ? (
              firmaUri ? (
                <Image source={{ uri: firmaUri }} style={[s.firma, { borderColor: c.border }]} resizeMode="contain" />
              ) : null
            ) : puedeFirmar ? (
              <>
                <Text style={[s.ayuda, { color: c.textMuted }]}>{t("contratoFirma.signHere")}</Text>
                <FirmaCanvas ref={firmaRef} onCambiar={setFirmaVacia} />
                {errorFirma ? <Text style={s.errorFirma}>{errorFirma}</Text> : null}
                <TouchableOpacity
                  onPress={() => {
                    firmaRef.current?.limpiar();
                    setFirmaVacia(true);
                  }}
                  style={s.borrar}
                >
                  <Text style={[s.borrarTexto, { color: primaryAccent }]}>{t("contratoFirma.clearSignature")}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={[s.ayuda, { color: c.textMuted }]}>{t("contratoFirma.signNotAvailable")}</Text>
            )}
            <Text style={[s.nota, { color: c.textSecondary }]}>
              {t("contratoFirma.fullName")}: {contrato.customerFullName}
            </Text>
            <Text style={[s.nota, { color: c.textSecondary }]}>
              {t("contratoFirma.document")}: {contrato.customerDocumentNumber}
            </Text>

            <Text style={[s.subTitulo, { color: c.textPrimary }]}>{t("contratoFirma.platformSignature")}</Text>
            <Text style={[s.plataforma, { color: primaryAccent }]}>Drivique</Text>
            <Text style={[s.nota, { color: c.textSecondary }]}>
              {t("contratoFirma.responsible")}: {t("contratoFirma.platformResponsible")}
            </Text>
            <Text style={[s.nota, { color: c.textSecondary }]}>
              {t("contratoFirma.role")}: {t("contratoFirma.platformRole")}
            </Text>
          </Card>

          {puedeFirmar ? (
            <TouchableOpacity onPress={handleFirmar} disabled={firmando || firmaVacia} activeOpacity={0.85} style={{ opacity: firmaVacia ? 0.5 : 1 }}>
              <LinearGradient
                colors={GRADIENTES.boton.colors}
                start={GRADIENTES.boton.start}
                end={GRADIENTES.boton.end}
                style={s.boton}
              >
                {firmando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.botonTexto}>{t("contratoFirma.signAndContinue")}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : null}

          {firmado ? (
            <View style={s.acciones}>
              <TouchableOpacity
                onPress={handlePdf}
                disabled={ocupado}
                style={[s.botonSec, { borderColor: primaryAccent }]}
              >
                <Ionicons name="download-outline" size={16} color={primaryAccent} />
                <Text style={[s.botonSecTexto, { color: primaryAccent }]}>{t("contratoFirma.downloadPdf")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCorreo}
                disabled={ocupado}
                style={[s.botonSec, { borderColor: primaryAccent }]}
              >
                <Ionicons name="mail-outline" size={16} color={primaryAccent} />
                <Text style={[s.botonSecTexto, { color: primaryAccent }]}>{t("contratoFirma.sendEmail")}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={[s.pie, { color: c.textMuted }]}>{t("contratoFirma.footerNote1")}</Text>
          <Text style={[s.pie, { color: c.textMuted }]}>{t("contratoFirma.footerNote2")}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  bloqueoContenedor: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20, paddingVertical: 32 },
  bloqueoCard: { width: "100%", maxWidth: 380, borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center" },
  bloqueoIcono: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  bloqueoTitulo: { fontSize: 17, fontWeight: "800", textAlign: "center", marginBottom: 6 },
  bloqueoSubtitulo: { fontSize: 13.5, textAlign: "center", lineHeight: 19, marginBottom: 6 },
  bloqueoBtn: { paddingVertical: 13, paddingHorizontal: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  bloqueoBtnTexto: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitulo: { fontSize: 16, fontWeight: "800", flex: 1, textAlign: "center" },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  error: { marginTop: 12, textAlign: "center", fontSize: 14 },
  scroll: { padding: 16, gap: 12 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16 },
  badge: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", marginBottom: 4 },
  titulo: { fontSize: 18, fontWeight: "800" },
  subtitulo: { fontSize: 12, marginTop: 4 },
  separador: { height: 12 },
  cardTitulo: { fontSize: 15, fontWeight: "800", marginBottom: 10 },
  campo: { marginBottom: 8 },
  campoLabel: { fontSize: 11, fontWeight: "700" },
  campoValor: { fontSize: 14, fontWeight: "600", marginTop: 1 },
  parrafo: { fontSize: 13, lineHeight: 19 },
  clausula: { fontSize: 13, lineHeight: 19, marginBottom: 8 },
  item: { fontSize: 13, lineHeight: 19, marginLeft: 8, marginBottom: 4 },
  subTitulo: { fontSize: 14, fontWeight: "800", marginTop: 14, marginBottom: 6 },
  ayuda: { fontSize: 12, marginBottom: 8 },
  firma: { width: "100%", height: 120, borderWidth: 1, borderRadius: 10 },
  errorFirma: { color: "#dc2626", fontSize: 12, marginTop: 6 },
  borrar: { alignSelf: "flex-start", marginTop: 8 },
  borrarTexto: { fontSize: 12, fontWeight: "700" },
  nota: { fontSize: 12, marginTop: 4 },
  plataforma: { fontSize: 22, fontWeight: "800", fontStyle: "italic" },
  boton: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  botonTexto: { color: "#fff", fontWeight: "800", fontSize: 14 },
  acciones: { gap: 10 },
  botonSec: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
  },
  botonSecTexto: { fontWeight: "800", fontSize: 13 },
  pie: { fontSize: 11, textAlign: "center" },
});
