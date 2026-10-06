import React, { useState, useMemo } from "react";
import {
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import {
  COLOR_MARCA,
  VALOR_KM_EXCEDENTE,
  getPuntosPolitica,
} from "../constants/reservation.constants";
import { GRADIENTES } from "@/constants/gradients";
import { useReservaStore } from "@/store/reservationStore";
import { useMonedaStore } from "@/store/currencyStore";

const { height } = Dimensions.get("window");

export default function TarjetaTerminosCondiciones() {
  const datosPersonales = useReservaStore((s) => s.datosPersonales);
  const actualizarDatosPersonales = useReservaStore((s) => s.actualizarDatosPersonales);
  const monedaActual = useMonedaStore((s) => s.monedaActual);
  const tasaUSD = useMonedaStore((s) => s.tasaUSD);
  const [modalTerminos, setModalTerminos] = useState(false);
  const [terminosLeidos, setTerminosLeidos] = useState(false);
  const c = useTemaColores();
  const { t } = useTranslation();

  const primaryAccent = c.oscuro ? "#60A5FA" : COLOR_MARCA;
  const brandBg = c.oscuro ? "#3B82F6" : COLOR_MARCA;

  const handleScrollTerminos = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 35;
    if (isAtBottom && !terminosLeidos) {
      setTerminosLeidos(true);
    }
  };

  const handleAceptarTerminos = () => {
    actualizarDatosPersonales({ terminosAceptados: true });
    setModalTerminos(false);
  };

  const clausulasAlquiler = useMemo(() => {
    return getPuntosPolitica(t, monedaActual, tasaUSD);
  }, [t, monedaActual, tasaUSD]);

  return (
    <>
      <View style={[styles.cardForm, { backgroundColor: c.oscuro ? c.bgCard : "#FFFFFF", borderColor: c.border }]}>
        <View style={styles.cardHeaderFila}>
          <Text style={[styles.cardHeaderTitulo, { color: primaryAccent }]}>
            {t("reserva.terminos.politicasSeguridad", { defaultValue: "Políticas y seguridad" })}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.filaCheckbox}
          onPress={() => {
            if (!datosPersonales.terminosAceptados) {
              setModalTerminos(true);
              setTerminosLeidos(false);
            } else {
              actualizarDatosPersonales({ terminosAceptados: false });
            }
          }}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              { borderColor: brandBg },
              datosPersonales.terminosAceptados && { backgroundColor: brandBg },
            ]}
          >
            {datosPersonales.terminosAceptados && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
          </View>
          <Text style={[styles.textoCheckbox, { color: c.textPrimary }]}>
            {t(
              "reserva.terminos.aceptoTexto",
              {
                defaultValue:
                  "Acepto los términos, condiciones del contrato de alquiler y la política de privacidad *",
              }
            )}{" "}
            <Text
              style={[styles.enlace, { color: primaryAccent }]}
              onPress={() => {
                setModalTerminos(true);
                setTerminosLeidos(false);
              }}
            >
              {t("reserva.terminos.verTerminos", { defaultValue: "Ver términos y condiciones" })}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Modal: Términos y condiciones con scroll obligatorio ── */}
      <Modal visible={modalTerminos} transparent animationType="slide" onRequestClose={() => setModalTerminos(false)} statusBarTranslucent>
        <View style={styles.modalOverlay}>
          {/* Backdrop superior que no se solapa con el contenedor */}
          <TouchableOpacity style={styles.modalBackdropTop} activeOpacity={1} onPress={() => setModalTerminos(false)} />
          <View style={[styles.modalContenedor, { backgroundColor: c.bgCard }]}>
            <View style={[styles.modalHandle, { backgroundColor: c.border }]} />
            <View style={[styles.modalEncabezado, { borderBottomColor: c.border }]}>
              <Text style={[styles.modalTitulo, { color: c.textPrimary }]}>
                {t("reserva.terminos.modalTitulo", { defaultValue: "Términos y condiciones de alquiler" })}
              </Text>
              <TouchableOpacity
                style={[styles.modalBotonCerrar, { backgroundColor: c.oscuro ? "#374151" : "#F3F4F6" }]}
                onPress={() => setModalTerminos(false)}
              >
                <Ionicons name="close" size={16} color={c.oscuro ? "#9CA3AF" : "#6B7280"} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={{ paddingBottom: 28 }}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              bounces={true}
              overScrollMode="always"
              onScroll={handleScrollTerminos}
              scrollEventThrottle={16}
            >
              {/* Documento único unificado */}
              <View
                style={[
                  styles.documentoContainer,
                  {
                    backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                    borderColor: c.border,
                  },
                ]}
              >
                {/* Cabecera de Políticas Importantes (fondo suave azul/marca, sin rojo) */}
                <View
                  style={[
                    styles.documentoHeader,
                    {
                      backgroundColor: c.oscuro ? "#1E293B" : "#F0F4FF",
                      borderBottomColor: c.border,
                    },
                  ]}
                >
                  <Text style={[styles.documentoHeaderTitulo, { color: primaryAccent }]}>
                    {t("reserva.terminos.politicasImportantesContrato", {
                      defaultValue: "POLÍTICAS IMPORTANTES DEL CONTRATO",
                    })}
                  </Text>
                  <Text style={[styles.documentoHeaderTexto, { color: c.textPrimary }]}>
                    <Text style={{ fontWeight: "700" }}>
                      {t("reserva.terminos.politicaNoReembolsoTitulo", {
                        defaultValue: "Política de No Reembolso: ",
                      })}
                    </Text>
                    {t("reserva.terminos.politicaNoReembolsoTexto", {
                      defaultValue:
                        "Una vez confirmada y pagada la reserva, no se realizan devoluciones de dinero bajo ninguna circunstancia. El cliente podrá reprogramar su fecha de alquiler notificando con al menos 48 horas de anticipación.",
                    })}
                  </Text>
                </View>

                {/* Cuerpo de Términos en formato de texto continuo */}
                <View style={styles.documentoCuerpo}>
                  <Text style={[styles.documentoSubtitulo, { color: c.textMuted }]}>
                    {t("reserva.terminos.terminosYCondicionesDrivique", {
                      defaultValue: "TÉRMINOS Y CONDICIONES DE ALQUILER DRIVIQUE",
                    })}
                  </Text>

                  {clausulasAlquiler.map((clausula, idx) => (
                    <View key={idx} style={styles.parrafoFila}>
                      <Text style={[styles.parrafoTexto, { color: c.textSecondary }]}>
                        <Text style={[styles.parrafoTitulo, { color: c.textPrimary }]}>{clausula.titulo}: </Text>
                        {clausula.items ? clausula.items.join(" ") : (clausula as any).texto}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Botones de acción del Modal */}
            <View style={styles.modalBotonesRow}>
              {/* Botón Cerrar */}
              <TouchableOpacity
                onPress={() => setModalTerminos(false)}
                style={[
                  styles.modalBotonCerrarSecundario,
                  { borderColor: c.border, backgroundColor: c.oscuro ? c.bgCard : "#FFFFFF" },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalBotonCerrarSecundarioTexto, { color: c.textPrimary }]}>
                  {t("comun.cerrar", { defaultValue: "Cerrar" })}
                </Text>
              </TouchableOpacity>

              {/* Botón Entendido con activación al llegar al final del scroll */}
              <View style={styles.modalBotonAceptarWrap}>
                <TouchableOpacity
                  onPress={terminosLeidos ? handleAceptarTerminos : undefined}
                  disabled={!terminosLeidos}
                  activeOpacity={terminosLeidos ? 0.85 : 1}
                  style={{ width: "100%" }}
                >
                  <LinearGradient
                    colors={
                      terminosLeidos
                        ? GRADIENTES.boton.colors
                        : c.oscuro
                          ? ["#374151", "#1F2937"]
                          : ["#E2E8F0", "#CBD5E1"]
                    }
                    start={GRADIENTES.boton.start}
                    end={GRADIENTES.boton.end}
                    style={styles.modalBotonAceptar}
                  >
                    <Text
                      style={[
                        styles.modalBotonAceptarTexto,
                        !terminosLeidos && { color: c.oscuro ? "#6B7280" : "#94A3B8" },
                      ]}
                    >
                      {t("reserva.terminos.modalAceptar", { defaultValue: "Entendido" })}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardForm: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  cardHeaderFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  cardHeaderTitulo: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  filaCheckbox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.3,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  textoCheckbox: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 17,
  },
  enlace: {
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalBackdropTop: {
    flex: 1,
    width: "100%",
  },
  modalContenedor: {
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "82%",
    maxHeight: "85%",
    paddingBottom: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  modalEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitulo: {
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
  },
  modalBotonCerrar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  documentoContainer: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  documentoHeader: {
    padding: 14,
    borderBottomWidth: 1,
  },
  documentoHeaderTitulo: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  documentoHeaderTexto: {
    fontSize: 11.5,
    lineHeight: 17,
  },
  documentoCuerpo: {
    padding: 14,
  },
  documentoSubtitulo: {
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  parrafoFila: {
    marginBottom: 12,
  },
  parrafoTexto: {
    fontSize: 11.5,
    lineHeight: 18,
  },
  parrafoTitulo: {
    fontWeight: "700",
  },
  modalBotonesRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 14,
    gap: 10,
  },
  modalBotonCerrarSecundario: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBotonCerrarSecundarioTexto: {
    fontSize: 13,
    fontWeight: "700",
  },
  modalBotonAceptarWrap: {
    flex: 2,
    borderRadius: 12,
  },
  modalBotonAceptar: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalBotonAceptarTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});