import React, { useMemo } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { LinearGradient } from "expo-linear-gradient";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { getDisponibilidadVehiculo } from "@/modules/catalog/constants/catalog.constants";
import { COLOR_MARCA } from "../constants/reservation.constants";
import { GRADIENTES } from "@/constants/gradients";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";

interface Props {
  vehiculo: Vehiculo;
  fechaRetiro: string | null;
  fechaDevolucion: string | null;
  onCambiarFechas: (fechaRetiro: string | null, fechaDevolucion: string | null) => void;
}

const COLOR_DISPONIBLE = "#16a34a";
const COLOR_RESERVADO = "#dc2626";
const COLOR_MANTENIMIENTO = "#64748b";

function getDiasEnRango(inicio: string, fin: string): string[] {
  const dias: string[] = [];
  const cursor = new Date(inicio + "T00:00:00");
  const finDate = new Date(fin + "T00:00:00");
  while (cursor <= finDate) {
    dias.push(cursor.toISOString().split("T")[0]);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dias;
}

// Marca de un día en el calendario. Reemplaza el `dayComponent` por defecto
// de react-native-calendars para poder pintar el rango seleccionado con un
// degradado (en vez del color plano de antes) y un puntito de estado
// (disponible / ocupado) debajo del número, al estilo de la referencia.
interface MarcaDia {
  ocupado?: boolean;
  dotColor?: string;
  seleccionado?: boolean;
  inicioRango?: boolean;
  finRango?: boolean;
}

function DiaCalendario({
  date,
  state,
  marking,
  onPress,
  c,
}: {
  date?: DateData;
  state?: string;
  marking?: MarcaDia;
  onPress?: (date?: DateData) => void;
  c: ReturnType<typeof useTemaColores>;
}) {
  if (!date) return <View style={diaStyles.celda} />;

  const deshabilitado = state === "disabled";
  const hoy = state === "today";
  const seleccionado = !!marking?.seleccionado;
  const enExtremoRango = marking?.inicioRango || marking?.finRango;
  const esRangoContinuo = seleccionado && !enExtremoRango;

  const numero = (
    <Text
      style={[
        diaStyles.texto,
        { color: c.textPrimary },
        deshabilitado && [diaStyles.textoDeshabilitado, { color: c.textMuted }],
        hoy && !seleccionado && { color: COLOR_MARCA, fontWeight: "800" as const },
        seleccionado && diaStyles.textoSeleccionado,
      ]}
    >
      {date.day}
    </Text>
  );

  let colorPunto: string | null = null;
  if (marking?.ocupado) colorPunto = marking.dotColor ?? COLOR_RESERVADO;
  else if (!deshabilitado) colorPunto = COLOR_DISPONIBLE;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={deshabilitado}
      onPress={() => onPress?.(date)}
      style={diaStyles.celda}
    >
      {/* Fondo continuo suave para los días intermedios de un rango */}
      {esRangoContinuo && (
        <View style={[diaStyles.fondoRango, { backgroundColor: "rgba(37,99,235,0.14)" }]} />
      )}

      {enExtremoRango ? (
        <LinearGradient
          colors={GRADIENTES.boton.colors}
          start={GRADIENTES.boton.start}
          end={GRADIENTES.boton.end}
          style={diaStyles.circulo}
        >
          {numero}
        </LinearGradient>
      ) : (
        <View style={diaStyles.circulo}>{numero}</View>
      )}

      {colorPunto && (
        <View
          style={[
            diaStyles.punto,
            { backgroundColor: seleccionado ? "#fff" : colorPunto },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

export default function CalendarioRango({
  vehiculo,
  fechaRetiro,
  fechaDevolucion,
  onCambiarFechas,
}: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  // La disponibilidad ya no viene embebida en el vehículo — se calcula
  // a partir de RESERVAS_MOCK (mocks/reservas.json) según su id.
  const ocupados = useMemo(() => {
    const mapa = new Map<string, "reservado" | "mantenimiento">();
    getDisponibilidadVehiculo(vehiculo.id).ocupados.forEach((item) => {
      mapa.set(item.fecha, item.motivo);
    });
    return mapa;
  }, [vehiculo.id]);

  const hoy = new Date().toISOString().split("T")[0];

  const mensajePorMotivo = (motivo: "reservado" | "mantenimiento") =>
    motivo === "mantenimiento"
      ? t("reserva.fechasLugar.vehiculoEnMantenimiento")
      : t("reserva.fechasLugar.vehiculoYaReservado");

  const alertarNoDisponible = (titulo: string, motivo: "reservado" | "mantenimiento") => {
    Alert.alert(titulo, mensajePorMotivo(motivo), [
      { text: t("reserva.fechasLugar.intentarDeNuevo"), style: "default" },
    ]);
  };

  const handleDayPress = (day: DateData) => {
    const fecha = day.dateString;
    const motivo = ocupados.get(fecha);

    if (motivo) {
      alertarNoDisponible(t("reserva.fechasLugar.fechaNoDisponibleTitulo"), motivo);
      return;
    }

    if (!fechaRetiro || (fechaRetiro && fechaDevolucion)) {
      onCambiarFechas(fecha, null);
      return;
    }

    if (fecha < fechaRetiro) {
      onCambiarFechas(fecha, null);
      return;
    }

    const rango = getDiasEnRango(fechaRetiro, fecha);
    const motivoEnMedio = rango.map((d) => ocupados.get(d)).find(Boolean);
    if (motivoEnMedio) {
      Alert.alert(
        t("reserva.fechasLugar.rangoNoDisponibleTitulo"),
        motivoEnMedio === "mantenimiento"
          ? t("reserva.fechasLugar.rangoConMantenimiento")
          : t("reserva.fechasLugar.rangoConReservas"),
        [{ text: t("reserva.fechasLugar.intentarDeNuevo"), style: "default" }]
      );
      onCambiarFechas(fecha, null);
      return;
    }

    onCambiarFechas(fechaRetiro, fecha);
  };

  const markedDates = useMemo(() => {
    const marcas: Record<string, MarcaDia> = {};

    ocupados.forEach((motivo, fecha) => {
      marcas[fecha] = {
        ocupado: true,
        dotColor: motivo === "mantenimiento" ? COLOR_MANTENIMIENTO : COLOR_RESERVADO,
      };
    });

    if (fechaRetiro && fechaDevolucion) {
      const rango = getDiasEnRango(fechaRetiro, fechaDevolucion);
      rango.forEach((fecha, i) => {
        marcas[fecha] = {
          ...marcas[fecha],
          seleccionado: true,
          inicioRango: i === 0,
          finRango: i === rango.length - 1,
        };
      });
    } else if (fechaRetiro) {
      marcas[fechaRetiro] = {
        ...marcas[fechaRetiro],
        seleccionado: true,
        inicioRango: true,
        finRango: true,
      };
    }

    return marcas;
  }, [ocupados, fechaRetiro, fechaDevolucion]);

  return (
    <View style={[styles.container, { borderColor: c.border, backgroundColor: c.bgCard }]}>
      <Calendar
        current={hoy}
        minDate={hoy}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        dayComponent={(props: any) => <DiaCalendario {...props} c={c} />}
        theme={{
          calendarBackground: c.bgCard,
          dayTextColor: c.textPrimary,
          monthTextColor: c.textPrimary,
          textDisabledColor: c.textMuted,
          todayTextColor: COLOR_MARCA,
          arrowColor: c.textSecondary,
          textSectionTitleColor: c.textMuted,
          textDayFontSize: 13,
          textMonthFontSize: 14,
          textMonthFontWeight: "700",
          textDayHeaderFontSize: 11,
        }}
        style={styles.calendar}
      />

      <View style={styles.leyenda}>
        <View style={styles.leyendaItem}>
          <View style={[styles.dot, { backgroundColor: COLOR_DISPONIBLE }]} />
          <Text style={[styles.leyendaText, { color: c.textSecondary }]}>Disponible</Text>
        </View>
        <View style={styles.leyendaItem}>
          <View style={[styles.dot, { backgroundColor: COLOR_RESERVADO }]} />
          <Text style={[styles.leyendaText, { color: c.textSecondary }]}>Reservado</Text>
        </View>
        <View style={styles.leyendaItem}>
          <View style={[styles.dot, { backgroundColor: COLOR_MANTENIMIENTO }]} />
          <Text style={[styles.leyendaText, { color: c.textSecondary }]}>Mantenimiento</Text>
        </View>
        <View style={styles.leyendaItem}>
          <LinearGradient
            colors={GRADIENTES.boton.colors}
            start={GRADIENTES.boton.start}
            end={GRADIENTES.boton.end}
            style={styles.dotGradiente}
          />
          <Text style={[styles.leyendaText, { color: c.textSecondary }]}>Seleccionado</Text>
        </View>
      </View>
    </View>
  );
}

const diaStyles = StyleSheet.create({
  celda: {
    width: 32,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  fondoRango: {
    position: "absolute",
    left: -2,
    right: -2,
    top: 3,
    height: 28,
  },
  circulo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  texto: {
    fontSize: 13,
    fontWeight: "600",
  },
  textoDeshabilitado: {
    textDecorationLine: "line-through",
  },
  textoSeleccionado: {
    color: "#fff",
    fontWeight: "800",
  },
  punto: {
    position: "absolute",
    bottom: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 8,
  },
  calendar: { borderRadius: 10 },
  leyenda: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    marginTop: 4,
    marginBottom: 6,
  },
  leyendaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotGradiente: { width: 10, height: 10, borderRadius: 5 },
  leyendaText: { fontSize: 10 },
});
