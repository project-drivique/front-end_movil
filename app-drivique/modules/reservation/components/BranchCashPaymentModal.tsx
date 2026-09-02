import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { COLOR_MARCA } from "../constants/reservation.constants";
import { GRADIENTES, SOMBRA_BOTON_GRADIENTE } from "@/constants/gradients";
import { getCiudadPorSucursal, getDireccionSucursal } from "@/modules/catalog/constants/catalog.constants";
import { fmt } from "@/modules/reservation/components/BookingSummaryModal.pieces";

interface Props {
  visible: boolean;
  referencia: string;
  nombreSucursal: string;
  total: number;
  onCerrar: () => void;
  onCancelar?: () => void;
  botonTexto?: string;
}

export function BranchCashPaymentModal({
  visible,
  referencia,
  nombreSucursal,
  total,
  onCerrar,
  onCancelar,
  botonTexto,
}: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const primaryAccent = c.oscuro ? "#60A5FA" : COLOR_MARCA;

  const ciudad = getCiudadPorSucursal(nombreSucursal);
  const direccion = getDireccionSucursal(nombreSucursal);

  const handleCancelar = onCancelar || onCerrar;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancelar}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: c.bgCard }]}>
          {/* Botón X superior de cierre / cancelar */}
          <TouchableOpacity
            style={[styles.botonCerrarX, { backgroundColor: c.bgInput }]}
            onPress={handleCancelar}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color={c.textMuted} />
          </TouchableOpacity>

          <View style={[styles.iconoWrap, { backgroundColor: c.primaryBg }]}>
            <Ionicons name="cash-outline" size={38} color={primaryAccent} />
          </View>

          <Text style={[styles.titulo, { color: c.textPrimary }]}>
            {t("reserva.confirmacion.efectivoConfirmadaTitulo", { defaultValue: "Reserva registrada" })}
          </Text>

          <Text style={[styles.descripcion, { color: c.textSecondary }]}>
            {t("reserva.confirmacion.efectivoConfirmadaMensaje", {
              defaultValue: "Tienes 72 horas para acercarte a la sucursal y pagar en efectivo. Si no te presentas a tiempo, la reserva se cancelará automáticamente.",
              horas: 72,
            })}
          </Text>

          {/* Caja de Detalles */}
          <View style={[styles.caja, { backgroundColor: c.primaryBg, borderColor: c.border }]}>
            <Text style={[styles.tituloSeccion, { color: c.textPrimary }]}>
              {t("reserva.confirmacion.pagoEfectivoTitulo", { defaultValue: "Pago en efectivo: retiro en sucursal" })}
            </Text>

            <View style={styles.filaInfo}>
              <Text style={[styles.etiqueta, { color: c.textSecondary }]}>
                {t("reserva.confirmacion.respuesta.referencia", { defaultValue: "Referencia" })}:
              </Text>
              <Text style={[styles.valor, styles.referenciaValor, { color: c.textPrimary }]}>{referencia}</Text>
            </View>

            <View style={styles.filaInfo}>
              <Text style={[styles.etiqueta, { color: c.textSecondary }]}>
                {t("reserva.confirmacion.sucursal", { defaultValue: "Sucursal" })}:
              </Text>
              <Text style={[styles.valor, { color: c.textPrimary }]}>{nombreSucursal}</Text>
            </View>

            <View style={styles.filaInfo}>
              <Text style={[styles.etiqueta, { color: c.textSecondary }]}>
                {t("reserva.confirmacion.ciudad", { defaultValue: "Ciudad" })}:
              </Text>
              <Text style={[styles.valor, { color: c.textPrimary }]}>{ciudad || t("reserva.confirmacion.sinDefinir")}</Text>
            </View>

            <View style={styles.filaInfo}>
              <Text style={[styles.etiqueta, { color: c.textSecondary }]}>
                {t("reserva.confirmacion.direccion", { defaultValue: "Dirección" })}:
              </Text>
              <Text style={[styles.valor, { color: c.textPrimary }]} numberOfLines={2}>
                {direccion || t("reserva.confirmacion.sinDefinir")}
              </Text>
            </View>

            <View style={[styles.divisor, { backgroundColor: c.border }]} />

            <View style={styles.filaInfo}>
              <Text style={[styles.etiqueta, { color: c.textSecondary }]}>
                {t("reserva.confirmacion.totalAPagar", { defaultValue: "TOTAL A PAGAR" })}:
              </Text>
              <Text style={[styles.totalValor, { color: primaryAccent }]}>{fmt(total)}</Text>
            </View>

            <Text style={[styles.nota, { color: c.textMuted }]}>
              {t("reserva.confirmacion.notaTotalPagar", { defaultValue: "*Incluye impuestos y cargos administrativos" })}
            </Text>
          </View>

          {/* Botón Primario: Ir a Mis Reservas (guarda y confirma) */}
          <TouchableOpacity style={styles.botonPrimarioWrap} onPress={onCerrar} activeOpacity={0.85}>
            <LinearGradient
              colors={GRADIENTES.boton.colors}
              start={GRADIENTES.boton.start}
              end={GRADIENTES.boton.end}
              style={styles.botonPrimario}
            >
              <Text style={styles.botonPrimarioTexto}>
                {botonTexto || t("reserva.confirmacion.entendidoIrAMisReservas", { defaultValue: "Ir a Mis Reservas" })}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Botón Secundario: Cancelar (elimina la reserva de la BD) */}
          <TouchableOpacity
            style={[styles.botonCancelar, { borderColor: c.border, backgroundColor: c.bgInput }]}
            onPress={handleCancelar}
            activeOpacity={0.8}
          >
            <Text style={[styles.botonCancelarTexto, { color: c.textSecondary }]}>
              {t("comun.cancelar", "Cancelar")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 345,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    alignItems: "center",
    position: "relative",
  },
  botonCerrarX: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  iconoWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  descripcion: {
    fontSize: 12.5,
    textAlign: "center",
    lineHeight: 17,
    marginBottom: 14,
  },
  caja: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  tituloSeccion: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  filaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 4,
    gap: 8,
  },
  etiqueta: {
    fontSize: 11.5,
    fontWeight: "700",
    flexShrink: 0,
  },
  valor: {
    fontSize: 11.5,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  referenciaValor: {
    fontWeight: "800",
    fontSize: 11,
  },
  divisor: {
    height: 1,
    marginVertical: 8,
  },
  totalValor: {
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
    textAlign: "right",
  },
  nota: {
    fontSize: 9.5,
    fontStyle: "italic",
    marginTop: 6,
    textAlign: "center",
  },
  botonPrimarioWrap: {
    width: "100%",
    borderRadius: 14,
    ...SOMBRA_BOTON_GRADIENTE,
  },
  botonPrimario: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 14,
  },
  botonPrimarioTexto: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
  botonCancelar: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  botonCancelarTexto: {
    fontSize: 14,
    fontWeight: "700",
  },
});
