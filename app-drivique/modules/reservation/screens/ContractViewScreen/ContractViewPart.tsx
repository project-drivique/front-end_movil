import { View, StatusBar, TouchableOpacity, Text, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_MARCA } from '@/modules/catalog/constants/catalog.constants'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { LinearGradient } from 'expo-linear-gradient'
import { GRADIENTES } from '@/constants/gradients'
import { fmt } from '@/modules/reservation/components/BookingSummaryModal.pieces'
import FirmaCanvas, { FirmaCanvasHandle } from '@/modules/reservation/components/SignatureCanvas'
import { AlertModal } from '@/components/ui/AlertModal'
import { ContratoDTO } from '@/modules/reservation/services/contractService'
import React from 'react'

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
function formatearFecha(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" });
}

export default function ContractViewPart({ Campo, Card, Clausula, Titulo, aviso, c, cargando, claveDesbloqueada, claveIngresada, contrato, error, errorClave, errorFirma, firmaRef, firmaUri, firmaVacia, firmado, firmando, handleCorreo, handleFirmar, handlePdf, handleValidarClave, insets, licencia, nombreMarca, ocupado, primaryAccent, puedeFirmar, setAviso, setClaveIngresada, setErrorClave, setFirmaVacia, t, volver }: { Campo: any; Card: any; Clausula: any; Titulo: any; aviso: { titulo: string; mensaje: string; icono: string; } | null; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; cargando: boolean; claveDesbloqueada: boolean; claveIngresada: string; contrato: ContratoDTO | null; error: string; errorClave: string; errorFirma: string; firmaRef: React.RefObject<FirmaCanvasHandle | null>; firmaUri: string | null; firmaVacia: boolean; firmado: boolean; firmando: boolean; handleCorreo: () => Promise<void>; handleFirmar: () => Promise<void>; handlePdf: () => Promise<void>; handleValidarClave: () => void; insets: any; licencia: (estado?: string) => string; nombreMarca: string; ocupado: boolean; primaryAccent: string; puedeFirmar: boolean; setAviso: React.Dispatch<React.SetStateAction<{ titulo: string; mensaje: string; icono: string; } | null>>; setClaveIngresada: React.Dispatch<React.SetStateAction<string>>; setErrorClave: React.Dispatch<React.SetStateAction<string>>; setFirmaVacia: React.Dispatch<React.SetStateAction<boolean>>; t: any; volver: () => void }) {
  return (
    <View style={[s.tarjetaModal, { backgroundColor: c.bg, marginVertical: insets.top + 12 }]}>
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
              <Text style={[s.plataforma, { color: primaryAccent }]}>{nombreMarca}</Text>
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
        <AlertModal
          visible={!!aviso}
          icono={(aviso?.icono ?? "alert-circle-outline") as any}
          titulo={aviso?.titulo ?? ""}
          mensaje={aviso?.mensaje ?? ""}
          botones={[{ texto: t("comun.aceptar"), variante: "primario", onPress: () => setAviso(null) }]}
          onCerrar={() => setAviso(null)}
        />
        </View>
  )
}
