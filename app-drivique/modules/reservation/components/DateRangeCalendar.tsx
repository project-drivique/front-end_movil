import React, { useMemo, useState } from "react";
import { useFechasOcupadas } from "@/modules/reservation/hooks/useFechasOcupadas";
import { View } from 'react-native'
import { DateData, LocaleConfig } from 'react-native-calendars'
import { Ionicons } from "@expo/vector-icons";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { getHorarioSucursal } from "@/modules/catalog/constants/catalog.constants";

import { AlertModal } from "@/components/ui/AlertModal";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { styles } from './DateRangeCalendar/DateRangeCalendar.styles'
import DateRangeCalendarPart2 from './DateRangeCalendar/DateRangeCalendarPart2'
import DateRangeCalendarPart from './DateRangeCalendar/DateRangeCalendarPart'

LocaleConfig.locales["es"] = {
  monthNames: [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ],
  monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  dayNamesShort: ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"],
  today: "Hoy",
};

LocaleConfig.locales["en"] = {
  monthNames: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ],
  monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  dayNamesShort: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
  today: "Today",
};

LocaleConfig.locales["pt"] = {
  monthNames: [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ],
  monthNamesShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
  dayNames: ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
  dayNamesShort: ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"],
  today: "Hoje",
};

LocaleConfig.locales["fr"] = {
  monthNames: [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ],
  monthNamesShort: ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"],
  dayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
  dayNamesShort: ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"],
  today: "Aujourd'hui",
};

LocaleConfig.defaultLocale = "es";

interface Props {
  vehiculo: Vehiculo;
  fechaRetiro: string | null;
  fechaDevolucion: string | null;
  onCambiarFechas: (fechaRetiro: string | null, fechaDevolucion: string | null) => void;
}


const COLOR_RESERVADO = "#EF4444";
const COLOR_MANTENIMIENTO = "#64748B";

function getFechaHoyLocal(): string {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, "0");
  const day = String(ahora.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDiasEnRango(inicio: string, fin: string): string[] {
  const dias: string[] = [];
  const [y1, m1, d1] = inicio.split("-").map(Number);
  const [y2, m2, d2] = fin.split("-").map(Number);
  const cursor = new Date(y1, m1 - 1, d1);
  const finDate = new Date(y2, m2 - 1, d2);
  while (cursor <= finDate) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    dias.push(`${y}-${m}-${d}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dias;
}

export interface MarcaDia {
  ocupado?: boolean;
  dotColor?: string;
  seleccionado?: boolean;
  inicioRango?: boolean;
  finRango?: boolean;
}



function getFechaMananaLocal(): string {
  const ahora = new Date();
  const manana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
  const year = manana.getFullYear();
  const month = String(manana.getMonth() + 1).padStart(2, "0");
  const day = String(manana.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CalendarioRango({
  vehiculo,
  fechaRetiro,
  fechaDevolucion,
  onCambiarFechas,
}: Props) {
  const c = useTemaColores();
  const { t, i18n } = useTranslation();

  const langKey = i18n.language?.startsWith("fr")
    ? "fr"
    : i18n.language?.startsWith("pt") || i18n.language?.startsWith("br")
    ? "pt"
    : i18n.language?.startsWith("en")
    ? "en"
    : "es";

  LocaleConfig.defaultLocale = langKey;

  // Días ocupados reales del servidor (la web usa el mismo endpoint)
  const uuidFinal = vehiculo.uuid || (typeof vehiculo.id === "string" ? vehiculo.id : undefined);
  const ocupados = useFechasOcupadas(uuidFinal);

  const horarioSucursal = useMemo(
    () => getHorarioSucursal(vehiculo.sucursal),
    [vehiculo.sucursal]
  );

  // Si ya pasó la hora de cierre de la sucursal de origen hoy,
  // la fecha mínima para iniciar reserva es a partir de mañana a la hora de apertura.
  const fechaMinimaRetiro = useMemo(() => {
    const ahora = new Date();
    const horaCierreNum = parseInt(horarioSucursal.horaCierre.split(":")[0], 10) || 20;
    if (ahora.getHours() >= horaCierreNum) {
      return getFechaMananaLocal();
    }
    return getFechaHoyLocal();
  }, [horarioSucursal.horaCierre]);

  const [alertaModal, setAlertaModal] = useState<{
    visible: boolean;
    icono?: keyof typeof Ionicons.glyphMap;
    titulo: string;
    mensaje: string;
    botones?: { texto: string; onPress: () => void; variante?: "primario" | "secundario" }[];
  }>({
    visible: false,
    titulo: "",
    mensaje: "",
  });

  const mensajePorMotivo = (motivo: "reservado" | "mantenimiento") =>
    motivo === "mantenimiento"
      ? t("reserva.fechasLugar.vehiculoEnMantenimiento")
      : t("reserva.fechasLugar.vehiculoYaReservado");

  const alertarNoDisponible = (titulo: string, motivo: "reservado" | "mantenimiento") => {
    setAlertaModal({
      visible: true,
      icono: "alert-circle-outline",
      titulo,
      mensaje: mensajePorMotivo(motivo),
      botones: [
        {
          texto: t("reserva.fechasLugar.intentarDeNuevo", { defaultValue: "Aceptar" }),
          variante: "primario",
          onPress: () => setAlertaModal((p) => ({ ...p, visible: false })),
        },
      ],
    });
  };

  const handleDayPress = (day: DateData) => {
    const fecha = day.dateString;

    if (fecha < fechaMinimaRetiro) {
      setAlertaModal({
        visible: true,
        icono: "time-outline",
        titulo: t("reserva.fechasLugar.sucursalCerradaTitulo", { defaultValue: "Sucursal cerrada por hoy" }),
        mensaje: t("reserva.fechasLugar.sucursalCerradaMensaje", {
          defaultValue: `La sucursal ${vehiculo.sucursal || "seleccionada"} atiende ${horarioSucursal.textoHorario.toLowerCase()}. Puedes reservar a partir de mañana.`,
        }),
        botones: [
          {
            texto: t("comun.aceptar", { defaultValue: "Aceptar" }),
            variante: "primario",
            onPress: () => setAlertaModal((p) => ({ ...p, visible: false })),
          },
        ],
      });
      return;
    }

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
      setAlertaModal({
        visible: true,
        icono: "alert-circle-outline",
        titulo: t("reserva.fechasLugar.rangoNoDisponibleTitulo"),
        mensaje:
          motivoEnMedio === "mantenimiento"
            ? t("reserva.fechasLugar.rangoConMantenimiento")
            : t("reserva.fechasLugar.rangoConReservas"),
        botones: [
          {
            texto: t("reserva.fechasLugar.intentarDeNuevo", { defaultValue: "Aceptar" }),
            variante: "primario",
            onPress: () => setAlertaModal((p) => ({ ...p, visible: false })),
          },
        ],
      });
      onCambiarFechas(fecha, null);
      return;
    }

    if (fecha === fechaRetiro) {
      setAlertaModal({
        visible: true,
        icono: "information-circle-outline",
        titulo: t("reserva.fechasLugar.mismoDiaTitulo", { defaultValue: "Reserva de 1 día (24 horas)" }),
        mensaje: t("reserva.fechasLugar.mismoDiaMensaje", {
          defaultValue: "Seleccionaste 1 día de reserva. Elige la hora de retiro y devolución; las 24 horas contarán a partir de la hora de retiro.",
        }),
        botones: [
          {
            texto: t("comun.aceptar", { defaultValue: "Aceptar" }),
            variante: "primario",
            onPress: () => setAlertaModal((p) => ({ ...p, visible: false })),
          },
        ],
      });

      onCambiarFechas(fechaRetiro, fecha);
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
      <DateRangeCalendarPart key={`${c.oscuro ? "dark" : "light"}_${langKey}`} c={c} fechaDevolucion={fechaDevolucion} fechaMinimaRetiro={fechaMinimaRetiro} fechaRetiro={fechaRetiro} handleDayPress={handleDayPress} langKey={langKey} markedDates={markedDates} />

      <View style={[styles.divider, { backgroundColor: c.border }]} />

      <DateRangeCalendarPart2 c={c} t={t} />

      <AlertModal
        visible={alertaModal.visible}
        icono={alertaModal.icono}
        titulo={alertaModal.titulo}
        mensaje={alertaModal.mensaje}
        botones={alertaModal.botones}
        onCerrar={() => setAlertaModal((p) => ({ ...p, visible: false }))}
      />
    </View>
  );
}




