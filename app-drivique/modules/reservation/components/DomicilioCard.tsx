// Tarjeta de domicilio del detalle de la reserva: idéntica a la de la web (código de entrega, estado, conductor y detalles).
// Todo sale de los puntos de entrega que guarda el servidor; aquí no se calcula nada.
import React, { useState } from "react";
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useLogoMarca } from "@/store/brandStore";
import { COLOR_ACENTO } from "@/constants/brandPalette";
import { COLOR_MARCA } from "@/modules/catalog/constants/catalog.constants";
import { formatHoraAmPm } from "../constants/reservation.constants";
import type { ReservaGuardada } from "../services/reservationPersistService";

const LARGO_CODIGO = 6;

type EstadoDomicilio = "EN_PREPARACION" | "EN_CAMINO" | "ENTREGADO" | "RECOGIDO";

export default function DomicilioCard({ reserva }: { reserva: ReservaGuardada }) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const logo = useLogoMarca();
  const [verCodigo, setVerCodigo] = useState(false);
  const [verDetalles, setVerDetalles] = useState(false);

  const puntos = (reserva.puntosEntrega ?? []).filter((p) => p.domicilio);
  if (!puntos.length) return null;

  const retiro = puntos.find((p) => p.tipo === "PICKUP");
  const devolucion = puntos.find((p) => p.tipo === "RETURN");
  // Mismo criterio que la web: el punto activo es el primero que aún no se completa
  const activo = puntos.find((p) => p.estado !== "COMPLETED") ?? puntos[puntos.length - 1];

  const estado: EstadoDomicilio =
    !activo || activo.estado === "PENDING"
      ? "EN_PREPARACION"
      : activo.estado === "ASSIGNED"
        ? "EN_CAMINO"
        : activo.tipo === "PICKUP"
          ? "ENTREGADO"
          : "RECOGIDO";

  const acento = c.oscuro ? COLOR_ACENTO : COLOR_MARCA;
  const textoEstado: Record<EstadoDomicilio, string> = {
    EN_PREPARACION: t("reservas.homeStatusPreparing", { defaultValue: "En proceso" }),
    EN_CAMINO: t("reservas.homeStatusOnTheWay", { defaultValue: "Agente en camino" }),
    ENTREGADO: t("reservas.homeStatusDelivered", { defaultValue: "Entregado" }),
    RECOGIDO: t("reservas.homeStatusPickedUp", { defaultValue: "Recogido" }),
  };
  const colorEstado = estado === "ENTREGADO" || estado === "RECOGIDO" ? "#047857" : estado === "EN_CAMINO" ? acento : "#B45309";

  const codigo = (activo?.codigo || "").padEnd(LARGO_CODIGO, "-").slice(0, Math.max(LARGO_CODIGO, (activo?.codigo || "").length));
  const conductor = activo?.conductor || "";
  const telefono = (activo?.telefonoConductor || "").replace(/\D/g, "");
  const ciudad = activo?.ciudad || reserva.vehiculoSnapshot?.ciudad || "";
  const aConvenir = t("reservas.homeToArrange", { defaultValue: "A convenir" });

  const fila = (etiqueta: string, valor: string, fuerte = false) => (
    <View style={s.filaDetalle} key={etiqueta}>
      <Text style={[s.detalleEtiqueta, { color: c.textSecondary }]}>{etiqueta}</Text>
      <Text style={[s.detalleValor, { color: c.textPrimary }, fuerte && { fontWeight: "800" }]}>{valor}</Text>
    </View>
  );

  const bloque = (titulo: string, p: typeof retiro, hora: string, etiquetaHora: string) =>
    p ? (
      <View style={s.bloque}>
        <Text style={[s.etiqueta, { color: c.textSecondary }]}>{titulo}</Text>
        {fila(t("reservas.homeAddress", { defaultValue: "Dirección exacta" }), p.direccion || aConvenir)}
        {p.barrio ? fila(t("reservas.homeNeighborhood", { defaultValue: "Barrio" }), p.barrio) : null}
        {p.referencias ? fila(t("reservas.homeReferences", { defaultValue: "Indicaciones / Ref." }), p.referencias) : null}
        <View style={[s.filaHora, { borderTopColor: c.border }]}>
          {fila(etiquetaHora, formatHoraAmPm(hora) || "N/A", true)}
        </View>
      </View>
    ) : null;

  return (
    <View style={[s.tarjeta, { backgroundColor: c.bgCard, borderColor: c.border }]}>
      <View style={[s.encabezado, { borderBottomColor: c.border }]}>
        <Text style={[s.titulo, { color: c.textPrimary }]}>{t("reservas.homeCardTitle", { defaultValue: "Domicilio" })}</Text>
        <Text style={[s.subtitulo, { color: c.textSecondary }]}>
          {t("reservas.homeCardSubtitle", { defaultValue: "Código de seguridad para validación al momento de la entrega." })}
        </Text>
      </View>

      <View style={[s.logoBadge, { backgroundColor: c.oscuro ? c.bg : "#FFFFFF", borderColor: c.border }]}>
        <Image source={logo} style={s.logo} resizeMode="contain" />
      </View>

      <View style={[s.cajaCodigo, { backgroundColor: c.oscuro ? c.bg : "#FFFFFF", borderColor: c.border }]}>
        <View style={s.filaCodigo}>
          <View style={s.cuadros}>
            {codigo.split("").map((caracter, i) => (
              <View key={i} style={[s.cuadro, { borderColor: acento, backgroundColor: c.oscuro ? "#0F172A" : "#FFFFFF" }]}>
                <Text style={[s.cuadroTexto, { color: c.textPrimary }]}>{verCodigo ? caracter : "•"}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => setVerCodigo((v) => !v)}
            hitSlop={10}
            accessibilityLabel={
              verCodigo
                ? t("reservas.homeHideCode", { defaultValue: "Ocultar código" })
                : t("reservas.homeShowCode", { defaultValue: "Ver código" })
            }
          >
            <Ionicons name={verCodigo ? "eye-off-outline" : "eye-outline"} size={22} color={c.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={[s.pista, { color: c.textSecondary }]}>
          {t("reservas.homeCardHint", { defaultValue: "Confírmale este código al conductor encargado de entregar el vehículo." })}
        </Text>
      </View>

      <View style={[s.info, { backgroundColor: c.bgCard, borderColor: c.border }]}>
        <View style={s.filaInfo}>
          <Text style={[s.etiqueta, { color: c.textSecondary }]}>{t("reservas.homeCity", { defaultValue: "Ciudad" })}:</Text>
          <Text style={[s.valorInfo, { color: c.textPrimary }]}>{ciudad || "—"}</Text>
        </View>
        <View style={[s.separador, { backgroundColor: c.border }]} />

        <View style={s.filaInfo}>
          <Text style={[s.etiqueta, { color: c.textSecondary }]}>{t("reservas.homeStatus", { defaultValue: "Estado del domicilio" })}:</Text>
          <Text style={[s.valorInfo, { color: colorEstado }]}>{textoEstado[estado]}</Text>
        </View>
        <View style={[s.separador, { backgroundColor: c.border }]} />

        <View style={s.filaInfo}>
          <Text style={[s.etiqueta, { color: c.textSecondary }]}>{t("reservas.homeDriver", { defaultValue: "Conductor asignado" })}:</Text>
          <View style={s.conductor}>
            <Text style={[s.valorInfo, { color: conductor ? c.textPrimary : "#B45309" }]}>
              {conductor || t("reservas.homeStatusPreparing", { defaultValue: "En proceso" })}
            </Text>
            {telefono ? (
              <TouchableOpacity style={s.whatsapp} activeOpacity={0.85} onPress={() => Linking.openURL(`https://wa.me/${telefono}`)}>
                <Ionicons name="logo-whatsapp" size={15} color="#FFFFFF" />
                <Text style={s.whatsappTexto}>WhatsApp</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {verDetalles ? (
          <>
            <View style={[s.separador, { backgroundColor: c.border }]} />
            {bloque(
              t("reservas.homeDeliveryInfo", { defaultValue: "Información de entrega" }) + ":",
              retiro,
              reserva.horaRetiro,
              t("reservas.homeDeliveryTime", { defaultValue: "Hora de entrega (retiro)" }),
            )}
            {retiro && devolucion ? <View style={[s.separador, { backgroundColor: c.border }]} /> : null}
            {bloque(
              t("reservas.homePickupInfo", { defaultValue: "Información de recogida" }) + ":",
              devolucion,
              reserva.horaDevolucion,
              t("reservas.homePickupTime", { defaultValue: "Hora de recogida (devolución)" }),
            )}
          </>
        ) : null}

        <View style={[s.separador, { backgroundColor: c.border }]} />
        <TouchableOpacity style={s.verMas} onPress={() => setVerDetalles((v) => !v)} activeOpacity={0.7}>
          <Text style={[s.verMasTexto, { color: acento }]}>
            {verDetalles
              ? t("reservas.homeLessDetails", { defaultValue: "Ocultar detalles" })
              : t("reservas.homeMoreDetails", { defaultValue: "Ver más detalles" })}
          </Text>
          <Ionicons name={verDetalles ? "chevron-up" : "chevron-down"} size={14} color={acento} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tarjeta: { borderWidth: 1, borderRadius: 22, padding: 18, marginTop: 16, alignItems: "center" },
  encabezado: { width: "100%", alignItems: "center", paddingBottom: 12, marginBottom: 14, borderBottomWidth: 1 },
  titulo: { fontSize: 20, fontWeight: "800" },
  subtitulo: { fontSize: 12, marginTop: 3, textAlign: "center" },
  logoBadge: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, padding: 12, marginBottom: 14, alignItems: "center", justifyContent: "center" },
  logo: { width: "100%", height: "100%" },
  cajaCodigo: { width: "100%", borderWidth: 1, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 12, marginBottom: 16, alignItems: "center", gap: 10 },
  filaCodigo: { flexDirection: "row", alignItems: "center", gap: 10 },
  cuadros: { flexDirection: "row", gap: 6 },
  cuadro: { width: 36, height: 46, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  cuadroTexto: { fontSize: 19, fontWeight: "800" },
  pista: { fontSize: 11.5, textAlign: "center", fontWeight: "500" },
  info: { width: "100%", borderWidth: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  filaInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  etiqueta: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.3, flexShrink: 1 },
  valorInfo: { fontSize: 13.5, fontWeight: "700", textAlign: "right", flexShrink: 1 },
  separador: { height: 1, width: "100%" },
  conductor: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  whatsapp: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#25D366", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  whatsappTexto: { color: "#FFFFFF", fontSize: 11.5, fontWeight: "800" },
  bloque: { gap: 6 },
  filaDetalle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  detalleEtiqueta: { fontSize: 12, flexShrink: 1 },
  detalleValor: { fontSize: 12.5, fontWeight: "600", textAlign: "right", flexShrink: 1 },
  filaHora: { marginTop: 2, paddingTop: 4, borderTopWidth: 1, borderStyle: "dashed" },
  verMas: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 2 },
  verMasTexto: { fontSize: 12, fontWeight: "700" },
});
