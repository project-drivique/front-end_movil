import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { LinearGradient } from 'expo-linear-gradient'
import { GRADIENTES } from '@/constants/gradients'

const s = StyleSheet.create({
  firmaCard: { borderWidth: 1.5, borderRadius: 16, padding: 18, alignItems: "center", marginTop: 16 },
  firmaIcono: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  firmaTitulo: { fontSize: 16, fontWeight: "800", textAlign: "center", marginBottom: 6 },
  firmaTexto: { fontSize: 13, textAlign: "center", lineHeight: 19, marginBottom: 16 },
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

export default function TieneContrato({ abrirContrato, c, claveContrato, errorClaveContrato, pendienteFirma, primaryAccent, setClaveContrato, setErrorClaveContrato, t, validandoClave }: { abrirContrato: () => Promise<void>; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; claveContrato: string; errorClaveContrato: string; pendienteFirma: false; primaryAccent: string; setClaveContrato: any; setErrorClaveContrato: any; t: any; validandoClave: boolean }) {
  return (
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
  )
}
