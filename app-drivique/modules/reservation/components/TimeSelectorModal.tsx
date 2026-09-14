import React, { useMemo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR_MARCA, formatHoraAmPm } from "../constants/reservation.constants";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";

function generarHoras(horaApertura = "06:00", horaCierre = "22:00"): string[] {
  const [hInicio, mInicio] = (horaApertura || "06:00").split(":").map(Number);
  const [hFin, mFin] = (horaCierre || "22:00").split(":").map(Number);
  const horas: string[] = [];

  for (let h = hInicio; h <= hFin; h++) {
    for (const m of [0, 30]) {
      if (h === hInicio && m < mInicio) continue;
      if (h === hFin && m > mFin) continue;
      horas.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return horas;
}

export interface AlertaInformativaHora {
  titulo: string;
  mensaje: string;
}

interface Props {
  visible: boolean;
  horaSeleccionada: string;
  fecha?: string | null;
  minHora?: string | null;
  maxHora?: string | null;
  horaApertura?: string | null;
  horaCierre?: string | null;
  nombreSucursal?: string | null;
  subtitulo?: string | null;
  alertaInformativa?: AlertaInformativaHora | null;
  onSeleccionar: (hora: string) => void;
  onCerrar: () => void;
}

function getFechaHoyLocal(): string {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, "0");
  const day = String(ahora.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function SelectorHoraModal({
  visible,
  horaSeleccionada,
  fecha,
  minHora,
  maxHora,
  horaApertura,
  horaCierre,
  nombreSucursal,
  subtitulo,
  alertaInformativa,
  onSeleccionar,
  onCerrar,
}: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();

  const listaHoras = useMemo(() => {
    const ahora = new Date();
    const hoyStr = getFechaHoyLocal();

    const cleanFecha = fecha ? String(fecha).split("T")[0] : null;
    const esHoy = cleanFecha === hoyStr;
    const esPasado = cleanFecha ? cleanFecha < hoyStr : false;

    const ahoraMinutos = ahora.getHours() * 60 + ahora.getMinutes();

    let minLimiteMinutos = -1;
    if (minHora && typeof minHora === "string" && minHora.includes(":")) {
      const [mh, mm] = minHora.split(":").map(Number);
      if (!isNaN(mh) && !isNaN(mm)) {
        minLimiteMinutos = mh * 60 + mm;
      }
    }

    let maxLimiteMinutos = Infinity;
    if (maxHora && typeof maxHora === "string" && maxHora.includes(":")) {
      const [mh, mm] = maxHora.split(":").map(Number);
      if (!isNaN(mh) && !isNaN(mm)) {
        maxLimiteMinutos = mh * 60 + mm;
      }
    }

    const horasBase = generarHoras(horaApertura || "07:00", horaCierre || "19:00");

    return horasBase.map((horaStr) => {
      const [h, m] = horaStr.split(":").map(Number);
      const totalMin = h * 60 + m;

      let bloqueada = false;

      // Si la fecha elegida es hoy y la hora ya pasó en tiempo real
      if (esPasado) {
        bloqueada = true;
      } else if (esHoy && totalMin <= ahoraMinutos) {
        bloqueada = true;
      } else if (minLimiteMinutos >= 0 && totalMin <= minLimiteMinutos) {
        bloqueada = true;
      } else if (totalMin > maxLimiteMinutos) {
        bloqueada = true;
      }

      return {
        hora: horaStr,
        bloqueada,
      };
    });
  }, [fecha, minHora, maxHora, horaApertura, horaCierre]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCerrar} />
        <View style={[styles.card, { backgroundColor: c.bgCard }]}>
          <View style={[styles.header, { borderBottomColor: c.border }]}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.headerTitulo, { color: c.textPrimary }]}>{t("reserva.fechasLugar.seleccionaHora")}</Text>
              {!!subtitulo && (
                <Text style={[styles.headerSubtitulo, { color: COLOR_MARCA }]}>
                  {subtitulo}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onCerrar} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.cerrarTexto}>{t("reserva.resumen.cerrar")}</Text>
            </TouchableOpacity>
          </View>

          {/* BANNER DE ALERTA INFORMATIVA ESTÁNDAR */}
          {!!alertaInformativa && (
            <View
              style={[
                styles.alertaInformativaBox,
                {
                  backgroundColor: c.primaryBg,
                  borderColor: c.oscuro ? "rgba(47, 78, 162, 0.4)" : "rgba(47, 78, 162, 0.2)",
                },
              ]}
            >
              <Ionicons
                name="information-circle"
                size={20}
                color={c.oscuro ? "#60A5FA" : COLOR_MARCA}
                style={{ marginTop: 1 }}
              />
              <View style={styles.alertaInformativaContenido}>
                <Text style={[styles.alertaInformativaTitulo, { color: c.textPrimary }]}>
                  {alertaInformativa.titulo}
                </Text>
                <Text style={[styles.alertaInformativaMensaje, { color: c.textSecondary }]}>
                  {alertaInformativa.mensaje}
                </Text>
              </View>
            </View>
          )}

          <ScrollView
            style={styles.lista}
            contentContainerStyle={styles.listaContenido}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {listaHoras.map(({ hora, bloqueada }) => {
              if (bloqueada) return null;
              const activa = hora === horaSeleccionada;
              return (
                <TouchableOpacity
                  key={hora}
                  disabled={bloqueada}
                  style={[
                    styles.item,
                    activa && { backgroundColor: c.primaryBg },
                    bloqueada && styles.itemBloqueado,
                  ]}
                  onPress={() => {
                    if (bloqueada) return;
                    onSeleccionar(hora);
                    onCerrar();
                  }}
                  activeOpacity={bloqueada ? 1 : 0.7}
                >
                  <View style={styles.itemFila}>
                    <Text
                      style={[
                        styles.itemTexto,
                        { color: bloqueada ? c.textMuted : c.textSecondary },
                        activa && styles.itemTextoActivo,
                        bloqueada && styles.itemTextoBloqueado,
                      ]}
                    >
                      {formatHoraAmPm(hora)}
                    </Text>
                    {bloqueada && (
                      <Ionicons name="lock-closed-outline" size={13} color={c.textMuted} />
                    )}
                    {activa && (
                      <Ionicons name="checkmark-circle" size={16} color={COLOR_MARCA} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "flex-end" },
  card: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    height: "72%",
    maxHeight: 540,
    paddingBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitulo: { fontSize: 14, fontWeight: "800" },
  headerSubtitulo: { fontSize: 11, marginTop: 2, fontWeight: "700" },
  cerrarTexto: { fontSize: 13, fontWeight: "700", color: COLOR_MARCA },
  alertaInformativaBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  alertaInformativaContenido: {
    flex: 1,
  },
  alertaInformativaTitulo: {
    fontSize: 12.5,
    fontWeight: "700",
    marginBottom: 3,
  },
  alertaInformativaMensaje: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  lista: { flex: 1, paddingHorizontal: 8, paddingTop: 4 },
  listaContenido: { paddingBottom: 24 },
  item: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, marginVertical: 1 },
  itemBloqueado: { opacity: 0.4 },
  itemFila: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemTexto: { fontSize: 13, fontWeight: "600" },
  itemTextoActivo: { fontWeight: "800", color: COLOR_MARCA },
  itemTextoBloqueado: { textDecorationLine: "line-through" },
});
