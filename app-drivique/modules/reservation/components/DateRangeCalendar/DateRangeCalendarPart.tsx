import { Calendar, DateData } from 'react-native-calendars'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { styles } from './DateRangeCalendar.styles'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_MARCA } from '../../constants/reservation.constants'
import { useTemaColores } from '@/modules/i18n/hooks/useLanguage'
import type { MarcaDia } from './'

function DiaCalendario({
  date,
  state,
  marking,
  fechaRetiro,
  fechaDevolucion,
  onPress,
  c,
}: {
  date?: DateData;
  state?: string;
  marking?: MarcaDia;
  fechaRetiro: string | null;
  fechaDevolucion: string | null;
  onPress?: (date?: DateData) => void;
  c: ReturnType<typeof useTemaColores>;
}) {
  if (!date) return <View style={diaStyles.celda} />;

  const esOcupado = !!marking?.ocupado;
  const deshabilitado = state === "disabled" || esOcupado;
  const hoy = state === "today";
  const seleccionado = !!marking?.seleccionado;
  const esInicio = !!marking?.inicioRango;
  const esFin = !!marking?.finRango;
  const enExtremoRango = esInicio || esFin;
  const esRangoContinuo = seleccionado && !enExtremoRango;

  const numero = (
    <Text
      style={[
        diaStyles.texto,
        { color: c.textPrimary },
        deshabilitado && [diaStyles.textoDeshabilitado, { color: esOcupado ? "#EF4444" : c.textMuted, opacity: esOcupado ? 0.75 : 0.4 }],
        hoy && !seleccionado && { color: COLOR_MARCA, fontWeight: "600" as const },
        enExtremoRango && diaStyles.textoExtremo,
        esRangoContinuo && diaStyles.textoContinuo,
      ]}
    >
      {date.day}
    </Text>
  );

  let colorPunto: string | null = null;
  if (marking?.ocupado) colorPunto = marking.dotColor ?? COLOR_RESERVADO;
  else if (!deshabilitado) colorPunto = COLOR_DISPONIBLE;

  let estiloCirculo: any = diaStyles.circulo;
  if (enExtremoRango) {
    estiloCirculo = [diaStyles.circuloExtremo, { backgroundColor: COLOR_MARCA }];
  } else if (hoy && !seleccionado) {
    estiloCirculo = [
      diaStyles.circuloHoy,
      { borderColor: c.oscuro ? "rgba(47, 78, 162, 0.45)" : "rgba(47, 78, 162, 0.28)" },
    ];
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={deshabilitado}
      onPress={() => onPress?.(date)}
      style={diaStyles.celda}
    >
      {/* Fondo continuo plano sin solapamientos para días intermedios */}
      {esRangoContinuo && (
        <View
          style={[
            diaStyles.fondoRango,
            { backgroundColor: c.oscuro ? "rgba(47, 78, 162, 0.22)" : "rgba(47, 78, 162, 0.08)" },
          ]}
        />
      )}

      <View style={estiloCirculo}>
        {numero}
        {colorPunto ? (
          <View
            style={[
              diaStyles.punto,
              { backgroundColor: enExtremoRango ? "#FFFFFF" : colorPunto },
            ]}
          />
        ) : (
          <View style={diaStyles.puntoVacio} />
        )}
      </View>
    </TouchableOpacity>
  );
}
const diaStyles = StyleSheet.create({
  celda: {
    width: "100%",
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  fondoRango: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 4,
    bottom: 4,
    zIndex: 1,
  },
  circulo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  circuloHoy: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  circuloExtremo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLOR_MARCA,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  texto: {
    fontSize: 12,
    fontWeight: "400",
  },
  textoExtremo: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 11.5,
  },
  textoContinuo: {
    color: "#334155",
    fontWeight: "400",
  },
  textoDeshabilitado: {
    color: "#CBD5E1",
  },
  punto: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.5,
    marginTop: 2,
    zIndex: 3,
  },
  puntoVacio: {
    width: 2.5,
    height: 2.5,
    marginTop: 2,
  },
});
const COLOR_RESERVADO = "#EF4444";
const COLOR_DISPONIBLE = "#10B981";

export default function DateRangeCalendarPart({ c, fechaDevolucion, fechaMinimaRetiro, fechaRetiro, handleDayPress, langKey, markedDates }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; fechaDevolucion: string | null; fechaMinimaRetiro: string; fechaRetiro: string | null; handleDayPress: (day: DateData) => void; langKey: 'es' | 'fr' | 'pt' | 'en'; markedDates: Record<string, MarcaDia> }) {
  return (
    <Calendar
          key={`${c.oscuro ? "dark" : "light"}_${langKey}`}
          current={fechaMinimaRetiro}
          minDate={fechaMinimaRetiro}
          markedDates={markedDates}
          firstDay={1}
          hideExtraDays={true}
          onDayPress={handleDayPress}
          dayComponent={(props: any) => (
            <DiaCalendario
              {...props}
              fechaRetiro={fechaRetiro}
              fechaDevolucion={fechaDevolucion}
              c={c}
              onPress={(d?: DateData) => {
                if (d) handleDayPress(d);
              }}
            />
          )}
          renderArrow={(direction: "left" | "right") => (
            <View style={[styles.arrowBtn, { backgroundColor: c.bgInput }]}>
              <Ionicons
                name={direction === "left" ? "chevron-back" : "chevron-forward"}
                size={14}
                color={c.textPrimary}
              />
            </View>
          )}
          theme={{
            calendarBackground: c.bgCard,
            dayTextColor: c.textPrimary,
            monthTextColor: c.textPrimary,
            textDisabledColor: c.textMuted,
            todayTextColor: COLOR_MARCA,
            arrowColor: c.textPrimary,
            textSectionTitleColor: c.textMuted,
            textDayFontSize: 12,
            textMonthFontSize: 14.5,
            textMonthFontWeight: "800",
            textDayHeaderFontSize: 9.5,
            textDayHeaderFontWeight: "600",
          }}
          style={[styles.calendar, { backgroundColor: c.bgCard }]}
        />
  )
}
