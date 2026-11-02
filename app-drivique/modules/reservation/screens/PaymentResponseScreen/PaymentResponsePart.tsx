import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'

import DomicilioCard from '@/modules/reservation/components/DomicilioCard'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_ACENTO } from '@/constants/brandPalette'
import { COLOR_MARCA } from '@/modules/catalog/constants/catalog.constants'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { GRADIENTES } from '@/constants/gradients'

import { useTemaColores } from '@/modules/i18n/hooks/useLanguage'
import { ResenaGuardada } from '@/modules/reservation/services/resenaService'
import { ReservaGuardada } from '@/modules/reservation/services/reservationPersistService'
import TieneContrato from './TieneContrato'
import PendienteFirma from './PendienteFirma'
import EnRevision from './EnRevision'
import EnHorario from './EnHorario'
import PaymentResponsePartPart from './PaymentResponsePartPart'

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

export default function PaymentResponsePart({ abrirContrato, aviso, c, cancelar, claveContrato, color, enHorario, enRevision, errorClaveContrato, esperaPagoEfectivo, esperaPagoWompi, foto, grupo, insets, misResenas, ocupado, pagarConWompi, pendienteFirma, primaryAccent, puedeCancelar, puntoDevolucion, puntoRetiro, resena, reserva, setClaveContrato, setErrorClaveContrato, setModalCalificar, sucursalEfectivo, sucursalPendiente, t, tieneContrato, tituloEstado, validandoClave, vehiculo }: { abrirContrato: () => Promise<void>; aviso: string; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; cancelar: () => void; claveContrato: string; color: string; enHorario: boolean; enRevision: boolean; errorClaveContrato: string; esperaPagoEfectivo: boolean; esperaPagoWompi: boolean; foto: string | undefined; grupo: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/services/reservationPersistService").GrupoReserva; insets: any; misResenas: { titulo: string; rating: number; comment: string; }[]; ocupado: boolean; pagarConWompi: () => Promise<void>; pendienteFirma: boolean; primaryAccent: string; puedeCancelar: boolean; puntoDevolucion: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/services/reservationPersistService").PuntoEntrega | undefined; puntoRetiro: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/services/reservationPersistService").PuntoEntrega | undefined; resena: ResenaGuardada | null; reserva: ReservaGuardada; setClaveContrato: any; setErrorClaveContrato: any; setModalCalificar: any; sucursalEfectivo: string; sucursalPendiente: boolean; t: any; tieneContrato: boolean; tituloEstado: string; validandoClave: boolean; vehiculo: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Vehiculo | undefined }) {
  return (
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
          <PaymentResponsePartPart c={c} color={color} puntoDevolucion={puntoDevolucion} puntoRetiro={puntoRetiro} reserva={reserva} sucursalEfectivo={sucursalEfectivo} t={t} tituloEstado={tituloEstado} vehiculo={vehiculo} />
  
          {/* Domicilio: código de entrega, estado y conductor (igual que la web) */}
          <DomicilioCard reserva={reserva} />
  
          {/* Tarjeta de Reserva en Espera de Horario de Atención (Idéntica a la Web) */}
          {enHorario ? (
            <EnHorario c={c} sucursalEfectivo={sucursalEfectivo} t={t} vehiculo={vehiculo} />
          ) : null}
  
          {/* Tarjeta de Documentación en Proceso de Validación */}
          {enRevision ? (
            <EnRevision c={c} sucursalEfectivo={sucursalEfectivo} t={t} vehiculo={vehiculo} />
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
  
          {/* Igual que la web: con el contrato sin firmar se ofrece firmarlo directamente */}
          {pendienteFirma ? (
            <PendienteFirma c={c} primaryAccent={primaryAccent} reserva={reserva} t={t} />
          ) : null}
  
          {tieneContrato && !pendienteFirma ? (
            <TieneContrato abrirContrato={abrirContrato} c={c} claveContrato={claveContrato} errorClaveContrato={errorClaveContrato} pendienteFirma={pendienteFirma} primaryAccent={primaryAccent} setClaveContrato={setClaveContrato} setErrorClaveContrato={setErrorClaveContrato} t={t} validandoClave={validandoClave} />
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
  )
}
