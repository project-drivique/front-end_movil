// components/ui/DateField.tsx
//
// Input de fecha para el formulario de perfil. Usa react-native-calendars
// (ya es dependencia del proyecto, se usa igual en el calendario de
// reservas) en vez del selector nativo del sistema/navegador: así el
// calendario emergente queda 100% themeado por nosotros y no depende de
// que el navegador/SO respete "colorScheme" — que era justo lo que
// dejaba el texto invisible (blanco sobre blanco) en el selector nativo.
//
// El valor siempre se maneja como string "YYYY-MM-DD".

import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, DateData } from "react-native-calendars";

export function stringAFecha(valor: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [y, m, d] = valor.split("-").map(Number);
    const fecha = new Date(y, m - 1, d);
    if (!isNaN(fecha.getTime())) return fecha;
  }
  const porDefecto = new Date();
  porDefecto.setFullYear(porDefecto.getFullYear() - 25);
  return porDefecto;
}

export function fechaAString(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatearFechaVisible(valor: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return "";
  return stringAFecha(valor).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface ColoresTema {
  border: string;
  bgInput: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primaryBg: string;
  primary: string;
  oscuro?: boolean;
}

interface Props {
  label: string;
  value: string; // "YYYY-MM-DD"
  onChange: (valor: string) => void;
  error?: string;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  colores: ColoresTema;
}

export function DateField({
  label,
  value,
  onChange,
  error,
  placeholder = "",
  maximumDate,
  minimumDate,
  colores: c,
}: Props) {
  const [visible, setVisible] = useState(false);

  const handleDayPress = (day: DateData) => {
    onChange(day.dateString);
    setVisible(false);
  };

  return (
    <View style={s.wrap}>
      <Text style={[s.label, { color: c.textSecondary }]}>{label}</Text>
      <TouchableOpacity
        style={[s.selector, { borderColor: error ? "#EF4444" : c.border, backgroundColor: c.bgInput }]}
        onPress={() => setVisible(true)}
      >
        <Text style={[s.selectorText, { color: value ? c.textPrimary : c.textMuted }]}>
          {value ? formatearFechaVisible(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={c.textSecondary} />
      </TouchableOpacity>
      {error ? <Text style={s.error}>{error}</Text> : null}

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <Pressable style={s.overlay} onPress={() => setVisible(false)}>
          <Pressable style={[s.sheet, { backgroundColor: c.bgCard }]} onPress={() => {}}>
            <View style={[s.handle, { backgroundColor: c.border }]} />
            <View style={s.sheetHeader}>
              <Text style={[s.sheetTitulo, { color: c.textPrimary }]}>{label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={c.textMuted} />
              </TouchableOpacity>
            </View>

            <Calendar
              key={c.oscuro ? "dark-cal" : "light-cal"}
              current={value || (maximumDate ? fechaAString(maximumDate) : undefined)}
              maxDate={maximumDate ? fechaAString(maximumDate) : undefined}
              minDate={minimumDate ? fechaAString(minimumDate) : undefined}
              onDayPress={handleDayPress}
              markedDates={
                value ? { [value]: { selected: true, selectedColor: c.primary } } : undefined
              }
              theme={{
                backgroundColor: c.bgCard,
                calendarBackground: c.bgCard,
                todayTextColor: c.primary,
                todayBackgroundColor: c.primaryBg,
                arrowColor: c.primary,
                monthTextColor: c.textPrimary,
                textMonthFontWeight: "700",
                textMonthFontSize: 15,
                textSectionTitleColor: c.textSecondary,
                textDayHeaderFontWeight: "600",
                textDayHeaderFontSize: 11,
                dayTextColor: c.textPrimary,
                textDisabledColor: c.textMuted,
                textDayFontSize: 13,
                textDayFontWeight: "500",
                selectedDayBackgroundColor: c.primary,
                selectedDayTextColor: "#FFFFFF",
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: 4 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  selectorText: { fontSize: 14 },
  error: { fontSize: 12, color: "#EF4444", marginTop: 4 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheetTitulo: {
    fontSize: 16,
    fontWeight: "800",
  },
});
