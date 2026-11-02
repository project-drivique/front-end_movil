// app/contract-view.tsx
//
// Contrato de alquiler: se renderiza unicamente con la respuesta de la API de contratos.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Pressable, Text, View } from 'react-native'


import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { COLOR_MARCA } from "@/modules/catalog/constants/catalog.constants";

import { AlertModal } from "@/components/ui/AlertModal";

import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useBrandStore } from "@/store/brandStore";
import { FirmaCanvasHandle } from '@/modules/reservation/components/SignatureCanvas'
import { ContratoDTO, contratoService } from "@/modules/reservation/services/contractService";
import { mensajeDeError } from "@/modules/reservation/services/reservationPersistService";

import { COLOR_ACENTO } from "@/constants/brandPalette";
import ContractViewPart from '../modules/reservation/screens/ContractViewScreen/ContractViewPart'



export default function ContratoScreen() {
  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const nombreMarca = useBrandStore((s) => s.marca.nombre);
  const { t } = useTranslation();
  const { ref, ok } = useLocalSearchParams<{ ref?: string; ok?: string }>();
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
  const [aviso, setAviso] = useState<{ titulo: string; mensaje: string; icono: string } | null>(null);
  // Alert.alert no se muestra en web: se usa el mismo AlertModal de toda la app
  const avisar = (titulo: string, mensaje?: string, icono = "alert-circle-outline") => setAviso({ titulo, mensaje: mensaje ?? "", icono });
  const [claveDesbloqueada, setClaveDesbloqueada] = useState(ok === "1");
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
      avisar(t("contratoFirma.signError"), mensajeDeError(e, t("contratoFirma.signError")));
    } finally {
      setFirmando(false);
    }
  };

  const handlePdf = async () => {
    if (!contrato) return;
    setOcupado(true);
    // Aviso inmediato "Descargando…"; al terminar pasa a "PDF descargado" (o al error si falla)
    avisar(t("contratoFirma.pdfDownloadingTitulo"), t("contratoFirma.pdfDownloading"), "cloud-download-outline");
    try {
      const uri = await contratoService.descargarPdf(contrato.id, `contrato-${contrato.contractNumber}.pdf`);
      if (Platform.OS === "web") {
        window.open(uri, "_blank");
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: contrato.contractNumber });
      }
      avisar(t("contratoFirma.pdfOkTitulo"), t("contratoFirma.pdfOk"), "checkmark-circle-outline");
    } catch (e) {
      avisar(t("contratoFirma.pdfError"), mensajeDeError(e, t("contratoFirma.pdfError")));
    } finally {
      setOcupado(false);
    }
  };

  const handleCorreo = async () => {
    if (!contrato) return;
    setOcupado(true);
    // Aviso inmediato "Enviando…"; al terminar pasa a "Correo enviado" (o al error si falla)
    avisar(t("contratoFirma.emailSendingTitulo"), t("contratoFirma.emailSending"), "mail-outline");
    try {
      const enviado = await contratoService.enviarPorCorreo(contrato.id);
      if (enviado) avisar(t("contratoFirma.emailSentTitulo"), t("contratoFirma.emailSentMsg"), "checkmark-circle-outline");
      else avisar(t("contratoFirma.emailNotSent"));
    } catch (e) {
      avisar(t("contratoFirma.emailNotSent"), mensajeDeError(e, ""));
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
    <View style={s.fondoModal}>
      <Pressable style={StyleSheet.absoluteFill} onPress={volver} accessibilityLabel={t("comun.cerrar")} />
      <ContractViewPart Campo={Campo} Card={Card} Clausula={Clausula} Titulo={Titulo} aviso={aviso} c={c} cargando={cargando} claveDesbloqueada={claveDesbloqueada} claveIngresada={claveIngresada} contrato={contrato} error={error} errorClave={errorClave} errorFirma={errorFirma} firmaRef={firmaRef} firmaUri={firmaUri} firmaVacia={firmaVacia} firmado={firmado} firmando={firmando} handleCorreo={handleCorreo} handleFirmar={handleFirmar} handlePdf={handlePdf} handleValidarClave={handleValidarClave} insets={insets} licencia={licencia} nombreMarca={nombreMarca} ocupado={ocupado} primaryAccent={primaryAccent} puedeFirmar={puedeFirmar} setAviso={setAviso} setClaveIngresada={setClaveIngresada} setErrorClave={setErrorClave} setFirmaVacia={setFirmaVacia} t={t} volver={volver} />
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
  fondoModal: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.55)", justifyContent: "center", alignItems: "center", paddingHorizontal: 12 },
  tarjetaModal: { width: "100%", maxWidth: 640, flex: 1, borderRadius: 20, overflow: "hidden" },
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
