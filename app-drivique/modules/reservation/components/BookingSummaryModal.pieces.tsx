// modules/reserva/components/ResumenReservaModal.piezas.tsx
//
// Piezas reutilizables + helpers usados por las 4 tarjetas editables
// del modal de resumen (Pago, Fechas, Planes, Datos personales).
// Se separan aquí para no tener un solo archivo gigante.

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import {
  COLOR_MARCA,
  COLORES,
  ICONOS_SERVICIOS,
  ICONO_SERVICIO_DEFECTO,
} from "../constants/reservation.constants";
import { GRADIENTES } from "@/constants/gradients";
import { useMonedaStore } from "@/store/currencyStore";
import { formatCurrency } from "@/utils/currencyUtils";

// ---------- Helpers de formato ----------

// Los montos siempre llegan en COP; fmt los muestra según la moneda
// activa (COP o USD) leída del store en el momento de la llamada.
export const fmt = (n: number) => {
  const { monedaActual, tasaUSD } = useMonedaStore.getState();
  return formatCurrency(n, monedaActual, tasaUSD);
};
export const fmtPct = (n: number) => `${Math.round(n * 100)}%`;

export const fechaCorta = (f: string | null) =>
  f
    ? new Date(f + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
    : "";

export const fechaHora = (f: string | null, h: string, formatHoraAmPm: (h: string) => string, fallback: string) =>
  [fechaCorta(f), h ? formatHoraAmPm(h) : ""].filter(Boolean).join(" · ") || fallback;

export const diasEntre = (a: string | null, b: string | null) =>
  a && b
    ? Math.max(
        Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86400000),
        1
      )
    : 0;

// ---------- Piezas visuales ----------

// Encabezado de cada tarjeta en modo "resumen": ícono + título + botón Editar.
export function SubcardHeader({
  icono,
  titulo,
  onEditar,
}: {
  icono: keyof typeof Ionicons.glyphMap;
  titulo: string;
  onEditar: () => void;
}) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const primaryAccent = c.oscuro ? "#60A5FA" : COLOR_MARCA;

  return (
    <View style={styles.subcardHeader}>
      <View style={styles.rowGap}>
        <Ionicons name={icono} size={14} color={primaryAccent} />
        <Text style={[styles.subcardTitulo, { color: c.textMuted }]}>{titulo}</Text>
      </View>
      <TouchableOpacity
        style={[styles.editarBtn, { backgroundColor: c.primaryBg }]}
        onPress={onEditar}
        hitSlop={8}
      >
        <Ionicons name="pencil" size={11} color={primaryAccent} />
        <Text style={[styles.editarLink, { color: primaryAccent }]}>{t("reserva.resumen.editar")}</Text>
      </TouchableOpacity>
    </View>
  );
}

// Encabezado de cada tarjeta en modo "editando" (sin botón Editar,
// porque ya estás editando).
export function SubcardHeaderEditando({
  icono,
  titulo,
}: {
  icono: keyof typeof Ionicons.glyphMap;
  titulo: string;
}) {
  const c = useTemaColores();
  const primaryAccent = c.oscuro ? "#60A5FA" : COLOR_MARCA;

  return (
    <View style={styles.rowGap}>
      <Ionicons name={icono} size={14} color={primaryAccent} />
      <Text style={[styles.subcardTitulo, { color: c.textMuted }]}>{titulo}</Text>
    </View>
  );
}

// Una fila de dato de solo lectura: ícono + label chico + valor grande.
export function FilaDato({
  icono,
  label,
  valor,
  ultima,
}: {
  icono: keyof typeof Ionicons.glyphMap;
  label: string;
  valor: string;
  ultima?: boolean;
}) {
  const c = useTemaColores();

  return (
    <>
      <View style={styles.filaDato}>
        <Ionicons name={icono} size={15} color={c.textMuted} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.filaDatoLabel, { color: c.textMuted }]}>{label}</Text>
          <Text style={[styles.filaDatoValor, { color: c.textPrimary }]} numberOfLines={1}>{valor}</Text>
        </View>
      </View>
      {!ultima && <View style={[styles.divisor, { backgroundColor: c.border }]} />}
    </>
  );
}

// Tarjeta seleccionable tipo radio (protección, kilometraje).
export function OpcionCard({
  titulo,
  desc,
  activo,
  onPress,
}: {
  titulo: string;
  desc: string;
  activo: boolean;
  onPress: () => void;
}) {
  const c = useTemaColores();
  const brandBg = c.oscuro ? "#3B82F6" : COLOR_MARCA;

  return (
    <TouchableOpacity
      style={[
        styles.opcionCard,
        { backgroundColor: c.bgInput, borderColor: c.border },
        activo && { borderColor: brandBg, borderWidth: 1.5, backgroundColor: c.primaryBg },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.opcionHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.opcionTitulo, { color: c.textSecondary }, activo && { color: c.oscuro ? "#93C5FD" : "#0c447c" }]}>{titulo}</Text>
          <Text style={[styles.opcionDesc, { color: c.textMuted }, activo && { color: c.oscuro ? "#BFDBFE" : "#185fa5" }]}>{desc}</Text>
        </View>
        <View style={[styles.radio, { borderColor: c.border }, activo && { borderColor: brandBg }]}>
          {activo && <View style={[styles.radioPunto, { backgroundColor: brandBg }]} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Fila de servicio adicional (checkbox + ícono + nombre + precio).
export function ServicioRow({
  nombre,
  precio,
  activo,
  onPress,
}: {
  nombre: string;
  precio: number;
  activo: boolean;
  onPress: () => void;
}) {
  useMonedaStore();
  const c = useTemaColores();
  const { t } = useTranslation();
  const icono = ICONOS_SERVICIOS[nombre] ?? ICONO_SERVICIO_DEFECTO;
  const primaryAccent = c.oscuro ? "#60A5FA" : COLOR_MARCA;

  return (
    <TouchableOpacity
      style={[
        styles.servicioCard,
        { backgroundColor: c.bgInput, borderColor: c.border },
        activo && { borderColor: primaryAccent, borderWidth: 1.5, backgroundColor: c.primaryBg },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={activo ? "checkbox" : "square-outline"} size={18} color={activo ? primaryAccent : c.textMuted} />
      <Ionicons name={icono as any} size={14} color={activo ? primaryAccent : c.textMuted} style={{ marginHorizontal: 8 }} />
      <Text style={[styles.servicioNombre, { color: c.textSecondary }, activo && { color: c.textPrimary, fontWeight: "700" }]} numberOfLines={2}>{t(`reserva.planes.nombreServicio.${nombre}`, { defaultValue: nombre })}</Text>
      {precio > 0 && <Text style={[styles.servicioPrecio, { color: c.textMuted }]}>{fmt(precio)}{t("reserva.planes.porDia")}</Text>}
    </TouchableOpacity>
  );
}

// Línea del desglose de precio (label a la izquierda, valor a la derecha).
export function LineaPrecio({ label, valor, destacado }: { label: string; valor: string; destacado?: boolean }) {
  const c = useTemaColores();

  return (
    <View style={styles.lineaPrecio}>
      <Text style={[styles.lineaLabel, { color: c.textSecondary }, destacado && { color: c.textPrimary, fontWeight: "700" }]}>{label}</Text>
      <Text style={[styles.lineaValor, { color: c.textPrimary }, destacado && { fontWeight: "800" }]}>{valor}</Text>
    </View>
  );
}

// Par de botones Volver/Actualizar — usado por las 4 tarjetas editables
// para que el patrón sea idéntico en todas.
export function FilaBotonesEdicion({ onVolver, onActualizar }: { onVolver: () => void; onActualizar: () => void }) {
  const c = useTemaColores();
  const { t } = useTranslation();

  return (
    <View style={styles.filaBotones}>
      <TouchableOpacity style={[styles.volverBtn, { borderColor: c.border }]} onPress={onVolver}>
        <Text style={[styles.volverBtnText, { color: c.textSecondary }]}>{t("reserva.resumen.volver")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actualizarBtnWrap} onPress={onActualizar} activeOpacity={0.85}>
        <LinearGradient
          colors={GRADIENTES.boton.colors}
          start={GRADIENTES.boton.start}
          end={GRADIENTES.boton.end}
          style={styles.actualizarBtn}
        >
          <Text style={styles.actualizarBtnText}>{t("reserva.resumen.actualizar")}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export const styles = StyleSheet.create({
  subcard: { paddingHorizontal: 14, paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  subcardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  subcardTitulo: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3, textTransform: "uppercase" },
  rowGap: { flexDirection: "row", alignItems: "center", gap: 6 },
  editarBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  editarLink: { fontSize: 11, fontWeight: "700" },

  filaDato: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 10 },
  filaDatoLabel: { fontSize: 10, fontWeight: "700", marginBottom: 3 },
  filaDatoValor: { fontSize: 14, fontWeight: "700" },
  divisor: { height: 1, marginLeft: 26 },

  bloqueSub: { fontSize: 11 },
  filaBotones: { flexDirection: "row", gap: 10, marginTop: 14 },

  desgloseCabecera: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, marginBottom: 2 },
  desgloseCabeceraLabel: { fontSize: 10, fontWeight: "700" },
  desgloseCabeceraTotal: { fontSize: 10, fontWeight: "700" },
  desgloseSeccionTitulo: { fontSize: 12, fontWeight: "800", marginTop: 12, marginBottom: 2 },
  desgloseSubtexto: { fontSize: 11, marginBottom: 2 },
  desgloseDivisor: { height: 1, marginTop: 10, marginBottom: 4 },

  lineaPrecio: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  lineaLabel: { fontSize: 12, flex: 1, marginRight: 8 },
  lineaValor: { fontSize: 12, fontWeight: "700" },
  lineaLabelDestacado: { fontWeight: "700" },
  lineaValorDestacado: { fontWeight: "800" },

  totalBlock: { padding: 16, borderTopWidth: 1, alignItems: "center" },
  totalLabelChica: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  totalValorGrande: { fontSize: 26, fontWeight: "800", marginTop: 4 },
  totalNota: { fontSize: 10, marginTop: 8, fontStyle: "italic" },

  volverBtn: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  volverBtnText: { fontSize: 13, fontWeight: "800" },
  actualizarBtnWrap: { flex: 1, borderRadius: 12 },
  actualizarBtn: { borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  actualizarBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },

  label: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3, marginBottom: 8, marginTop: 4 },
  filaDosCols: { flexDirection: "row", gap: 8, marginBottom: 14 },
  metodoCard: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10 },
  metodoCardActivo: { borderWidth: 1.5 },
  metodoTitulo: { fontSize: 11, fontWeight: "700" },
  metodoDesc: { fontSize: 9, marginTop: 4 },

  selectBox: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 9 },
  selectLabel: { fontSize: 9, fontWeight: "700", marginBottom: 3 },
  selectValue: { fontSize: 11, fontWeight: "600" },

  opcionCard: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 },
  opcionCardActiva: { borderWidth: 1.5 },
  opcionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  opcionTitulo: { fontSize: 12.5, fontWeight: "700" },
  opcionTituloActiva: {},
  opcionDesc: { fontSize: 10.5, marginTop: 4 },
  opcionDescActiva: {},

  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  radioActivo: {},
  radioPunto: { width: 8, height: 8, borderRadius: 4 },

  servicioCard: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 10, marginBottom: 8 },
  servicioNombre: { flex: 1, fontSize: 11.5, fontWeight: "600" },
  servicioPrecio: { fontSize: 10.5, fontWeight: "700", marginLeft: 6 },

  inputTexto: {
    borderWidth: 1.3,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 12,
  },
  inputDeshabilitado: { opacity: 0.6 },
  filaCelular: { flexDirection: "row", gap: 10 },
  prefijoBox: {
    borderWidth: 1.3,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
    minWidth: 46,
    alignItems: "center",
  },
  prefijoBoxVacio: { opacity: 0.6 },
  prefijoText: { fontSize: 12, fontWeight: "700" },
  prefijoTextVacio: {},
  inputCelular: { flex: 1 },
});