import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AlertModal } from "@/components/ui/AlertModal";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
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

  const ciudad = getCiudadPorSucursal(nombreSucursal);
  const direccion = getDireccionSucursal(nombreSucursal);

  const botones = [
    {
      texto: t("comun.cancelar", "Cancelar"),
      onPress: onCancelar || onCerrar,
      variante: "secundario" as const,
    },
    {
      texto: botonTexto || t("reserva.confirmacion.entendidoIrAMisReservas"),
      onPress: onCerrar,
      variante: "primario" as const,
    },
  ];

  return (
    <AlertModal
      visible={visible}
      icono="cash-outline"
      titulo={t("reserva.confirmacion.efectivoConfirmadaTitulo", { defaultValue: "Pago en Sucursal" })}
      mensaje={t("reserva.confirmacion.efectivoConfirmadaMensaje", { horas: 72 })}
      onCerrar={onCancelar || onCerrar}
      botones={botones}
      contenido={
        <View style={[styles.caja, { backgroundColor: c.primaryBg, borderColor: c.border }]}>
          <Text style={[styles.tituloSeccion, { color: c.textPrimary }]}>
            {t("reserva.confirmacion.pagoEfectivoTitulo", { defaultValue: "Instrucciones de Pago en Caja" })}
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
              {t("reserva.confirmacion.ciudad", { defaultValue: "Ciudad" })}
            </Text>
            <Text style={[styles.valor, { color: c.textPrimary }]}>{ciudad || t("reserva.confirmacion.sinDefinir")}</Text>
          </View>

          <View style={styles.filaInfo}>
            <Text style={[styles.etiqueta, { color: c.textSecondary }]}>
              {t("reserva.confirmacion.direccion", { defaultValue: "Dirección" })}
            </Text>
            <Text style={[styles.valor, { color: c.textPrimary }]} numberOfLines={2}>
              {direccion || t("reserva.confirmacion.sinDefinir")}
            </Text>
          </View>

          <View style={[styles.divisor, { backgroundColor: c.border }]} />

          <View style={styles.filaInfo}>
            <Text style={[styles.etiqueta, { color: c.textSecondary }]}>
              {t("reserva.confirmacion.totalAPagar", { defaultValue: "Total a Pagar" })}:
            </Text>
            <Text style={[styles.totalValor, { color: c.primary }]}>{fmt(total)}</Text>
          </View>

          <Text style={[styles.nota, { color: c.textMuted }]}>
            {t("reserva.confirmacion.notaTotalPagar", { defaultValue: "*El pago debe realizarse únicamente en la caja de esta sucursal." })}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  caja: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    marginTop: 8,
  },
  tituloSeccion: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  filaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 5,
    gap: 8,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 0,
  },
  valor: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  referenciaValor: {
    fontWeight: "800",
  },
  divisor: {
    height: 1,
    marginVertical: 10,
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
    marginTop: 8,
    textAlign: "center",
  },
});
