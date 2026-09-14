// modules/reserva/constants/reserva.constants.ts
import nacionalidadesData from "@/mocks/nationalities.json";
import {
  COLORES,
  COLOR_MARCA,
} from "@/modules/catalog/constants/catalog.constants";
import { TipoDocumento } from "@/modules/profile/types/profile.types";

// Reutilizamos la paleta del catálogo, sin duplicar valores
export { COLORES, COLOR_MARCA };

// Placeholders de negocio — reemplazar cuando haya reglas reales de precios
export const PROTECCION_OBLIGATORIA_DIA = 29000;
export const PORCENTAJE_CARGOS_ADMINISTRATIVOS = 0.1;
export const RECARGO_LOGISTICO = 0;
export const PORCENTAJE_IVA = 0.19;

// Valor cobrado por cada kilómetro que supere el límite pactado en el
// plan de kilometraje limitado. Se usa tanto en la tarjeta de Planes
// como en el texto de Términos y Condiciones, para no repetir el
// número quemado en dos lugares distintos.
export const VALOR_KM_EXCEDENTE = 1500;

export const HORAS_DISPONIBLES = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

export function getMetodosPago(t: (key: string) => string) {
  return [
    {
      id: "wompi" as const,
      titulo: t("reserva.planes.metodosPago.wompi.titulo"),
      descripcion: t("reserva.planes.metodosPago.wompi.descripcion"),
    },
    {
      id: "efectivo" as const,
      titulo: t("reserva.planes.metodosPago.efectivo.titulo"),
      descripcion: t("reserva.planes.metodosPago.efectivo.descripcion"),
    },
  ];
}

// FUNCIÓN: formatHoraAmPm
// Convierte una hora en formato 24h (ej: "14:00") a texto legible con
// a. m. / p. m. (ej: "2:00 p. m."). El valor guardado sigue siendo 24h;
// esto solo cambia cómo se MUESTRA la hora al usuario.
export function formatHoraAmPm(hora24: string): string {
  if (!hora24) return "";
  const match = String(hora24).match(/(\d{1,2}):(\d{2})/);
  if (!match) return hora24;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const sufijo = h >= 12 ? "p. m." : "a. m.";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${sufijo}`;
}

export function parseHoraEnMinutos(hora?: string | null): number | null {
  if (!hora || typeof hora !== "string") return null;
  const match = hora.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const isPM = /pm|p\.m\./i.test(hora);
  const isAM = /am|a\.m\./i.test(hora);
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

export interface InfoDuracionAlquiler {
  titulo: string;
  tiempoUso: string | null;
  subtituloAnticipada: string | null;
}

export function getDetalleDuracionAlquiler(
  fechaRetiro: string | null | undefined,
  fechaDevolucion: string | null | undefined,
  horaRetiro: string | null | undefined,
  horaDevolucion: string | null | undefined,
  t: (key: string, opts?: any) => string
): InfoDuracionAlquiler | null {
  if (!fechaRetiro || !fechaDevolucion) return null;

  const diaTexto = (n: number) =>
    n === 1
      ? t("reserva.fechasLugar.diaSingular", { defaultValue: "día" })
      : t("reserva.fechasLugar.diaPlural", { defaultValue: "días" });

  const horaTexto = (n: number) =>
    n === 1
      ? t("reserva.fechasLugar.horaSingular", { defaultValue: "hora" })
      : t("reserva.fechasLugar.horaPlural", { defaultValue: "horas" });

  const d1 = new Date(fechaRetiro + "T00:00:00").getTime();
  const d2 = new Date(fechaDevolucion + "T00:00:00").getTime();
  const diasContratados = Math.max(Math.round((d2 - d1) / 86400000) + 1, 1);

  const titulo = `${diasContratados} ${diaTexto(diasContratados)}`;
  let tiempoUso: string | null = null;
  let subtituloAnticipada: string | null = null;

  if (horaRetiro && horaDevolucion) {
    const minRetiro = parseHoraEnMinutos(horaRetiro);
    const minDev = parseHoraEnMinutos(horaDevolucion);

    if (minRetiro !== null && minDev !== null) {
      if (fechaRetiro === fechaDevolucion) {
        // Mismo día: el alquiler contratado es 1 día (24h). Devolver el mismo día es devolución anticipada.
        if (minDev > minRetiro) {
          const diffMinutos = minDev - minRetiro;
          const horasUso = Math.floor(diffMinutos / 60);
          const minsUso = diffMinutos % 60;

          const partesUso: string[] = [];
          if (horasUso > 0 && minsUso === 0) partesUso.push(`${horasUso} ${horaTexto(horasUso)}`);
          else if (horasUso > 0 && minsUso > 0) partesUso.push(`${horasUso} h ${minsUso} min`);
          else if (horasUso === 0 && minsUso > 0) partesUso.push(`${minsUso} min`);

          tiempoUso = partesUso.join(", ") || "0 horas";
          subtituloAnticipada = `Devolución anticipada: ${tiempoUso}`;
        }
      } else if (minDev < minRetiro) {
        const diffMinutosAnticipo = minRetiro - minDev;
        const diasUso = diasContratados - 1;
        const minutosUsoUltimoDia = 24 * 60 - diffMinutosAnticipo;
        const horasUso = Math.floor(minutosUsoUltimoDia / 60);
        const minsUso = minutosUsoUltimoDia % 60;

        const partesUso: string[] = [];
        if (diasUso > 0) partesUso.push(`${diasUso} ${diaTexto(diasUso)}`);
        if (horasUso > 0 && minsUso === 0) partesUso.push(`${horasUso} ${horaTexto(horasUso)}`);
        else if (horasUso > 0 && minsUso > 0) partesUso.push(`${horasUso} h ${minsUso} min`);
        else if (horasUso === 0 && minsUso > 0) partesUso.push(`${minsUso} min`);

        tiempoUso = partesUso.join(", ") || "0 horas";
        subtituloAnticipada = `Devolución anticipada: ${tiempoUso}`;
      }
    }
  }

  return {
    titulo,
    tiempoUso,
    subtituloAnticipada,
  };
}

// ===================== TAB "PLANES" =====================

// Texto informativo sobre cómo se maneja el kilometraje en el alquiler
// de carros por días en Colombia. Es la práctica habitual del sector,
// no una norma legal específica.
export function getInfoKilometrajeColombia(t: (key: string) => string): string {
  return t("reserva.planes.infoKilometrajeColombia");
}

export interface BeneficioProteccion {
  tipo: "check" | "warning" | "cross";
  texto: string;
}

// Beneficios mostrados en cada tarjeta de protección. Se relacionan por
// el campo "nombre" que ya viene en vehiculo.seguros. Si aparece un
// seguro con un nombre nuevo que no está aquí, simplemente no muestra
// la lista de beneficios (pero sí el precio y el botón de selección).
export function getBeneficiosProteccion(
  t: (key: string, opts?: any) => any
): Record<string, BeneficioProteccion[]> {
  const tiposObligatoria: BeneficioProteccion["tipo"][] = ["check", "check", "check", "warning", "cross"];
  const tiposTotal: BeneficioProteccion["tipo"][] = ["check", "check", "check", "check", "check", "cross"];
  const obligatoria = (t("reserva.planes.beneficiosProteccionObligatoria", {
    returnObjects: true,
  }) as string[]).map((texto, i) => ({ tipo: tiposObligatoria[i] ?? "check", texto }));
  const total = (t("reserva.planes.beneficiosProteccionTotal", {
    returnObjects: true,
  }) as string[]).map((texto, i) => ({ tipo: tiposTotal[i] ?? "check", texto }));

  return {
    "Protección Obligatoria": obligatoria,
    "Protección Total": total,
  };
}

// Beneficios/condiciones mostrados en cada tarjeta de tipo de
// kilometraje, mismo patrón que getBeneficiosProteccion. Se relacionan
// por la clave "limitado" / "ilimitado", que coincide con
// planes.tipoKilometraje en el store.
export function getBeneficiosKilometraje(
  t: (key: string, opts?: any) => any
): Record<"limitado" | "ilimitado", BeneficioProteccion[]> {
  const tiposLimitado: BeneficioProteccion["tipo"][] = ["check", "warning", "cross"];
  const tiposIlimitado: BeneficioProteccion["tipo"][] = ["check", "check", "cross"];
  const limitado = (t("reserva.planes.beneficiosKmLimitado", {
    returnObjects: true,
  }) as string[]).map((texto, i) => ({ tipo: tiposLimitado[i], texto }));
  const ilimitado = (t("reserva.planes.beneficiosKmIlimitado", {
    returnObjects: true,
  }) as string[]).map((texto, i) => ({ tipo: tiposIlimitado[i], texto }));

  return { limitado, ilimitado };
}

// Ícono por servicio adicional (coincide exactamente con los nombres
// usados en vehiculos.json). Si aparece un servicio nuevo que no está
// en este mapa, se usa el ícono por defecto.
export const ICONO_SERVICIO_DEFECTO = "add-circle-outline";
export const ICONOS_SERVICIOS: Record<string, string> = {
  GPS: "navigate-outline",
  "GPS Integrado": "navigate-outline",
  "Silla bebé": "body-outline",
  "Silla de bebé": "body-outline",
  "Conductor adicional": "person-add-outline",
  "Lavado de auto post-entrega": "sparkles-outline",
  "Devolución con tanque vacío": "color-fill-outline",
  "Entrega en otra ciudad": "map-outline",
  "WiFi portátil": "wifi-outline",
};

// ===================== TAB "DATOS PERSONALES" =====================

// ⚠️ CAMBIO: se unificó al tipo de Perfil (CC | TI | Doc. Extranjero |
// Pasaporte). El id ahora tipa contra TipoDocumento (importado de
// perfil.types.ts) en vez de ser un literal local — así el compilador
// avisa si algún día los enums se vuelven a desalinear.
export const SIGLA_DOCUMENTO: Record<string, string> = {
  CC: "CC",
  CE: "CE",
  Pasaporte: "PAS",
  DNI: "DNI",
  PPT: "PPT",
  PEP: "PEP",
  TI: "TI",
  "Doc. Extranjero": "DOC",
};

export function getSiglaDocumento(tipo: string | null | undefined): string {
  if (!tipo) return "";
  return SIGLA_DOCUMENTO[tipo] || tipo;
}

export function getTiposDocumento(
  t: (key: string) => string
): { id: TipoDocumento; label: string }[] {
  return [
    { id: "CC", label: t("reserva.datosPersonales.tiposDocumento.CC") },
    { id: "CE", label: t("reserva.datosPersonales.tiposDocumento.CE") },
    { id: "Pasaporte", label: t("reserva.datosPersonales.tiposDocumento.Pasaporte") },
    { id: "DNI", label: t("reserva.datosPersonales.tiposDocumento.DNI") },
    { id: "PPT", label: t("reserva.datosPersonales.tiposDocumento.PPT") },
    { id: "PEP", label: t("reserva.datosPersonales.tiposDocumento.PEP") },
    { id: "TI", label: t("reserva.datosPersonales.tiposDocumento.TI") },
  ];
}

// Estructura de cada nacionalidad: nombre visible + código de
// marcación telefónica. Sale de mocks/nacionalidades.json — simula lo
// que después va a devolver el backend, así que cuando exista ese
// endpoint solo se reemplaza esta línea de import.
export interface NacionalidadOpcion {
  nombre: string;
  prefijo: string; // ej: "+57". Vacío ("") para "Otro" — no hay país fijo.
}

export const NACIONALIDADES: NacionalidadOpcion[] = nacionalidadesData;

// Busca el prefijo telefónico según el nombre de nacionalidad elegido
// en el formulario. Devuelve "" (vacío) si todavía no se ha elegido
// nacionalidad, o si es "Otro" — en ese caso no se asume ningún país,
// el prefijo se muestra vacío/placeholder hasta que el usuario elija.
export function getPrefijoPorNacionalidad(nacionalidad: string | null): string {
  if (!nacionalidad) return "";
  const encontrada = NACIONALIDADES.find((n) => n.nombre === nacionalidad);
  return encontrada?.prefijo ?? "";
}

// Tipos de archivo aceptados por el selector de documentos
export const TIPOS_ARCHIVO_DOCUMENTO = ["application/pdf", "image/*"];

// Tamaño máximo permitido por archivo (5 MB)
export const TAMANO_MAXIMO_ARCHIVO_BYTES = 5 * 1024 * 1024;

// ===================== TÉRMINOS Y CONDICIONES =====================

export interface PuntoPolitica {
  titulo: string;
  items: string[];
}

// Contenido completo del panel de "Políticas importantes" que se
// despliega en la tarjeta de Términos y Condiciones (tab Datos
// personales). Vive aquí, no dentro del componente, para seguir el
// mismo patrón que BENEFICIOS_PROTECCION / INFO_KILOMETRAJE_COLOMBIA:
// contenido de negocio separado de la UI que lo renderiza.
export function getResumenPoliticasImportantes(t: (key: string) => string): string {
  return t("reserva.terminos.resumenPoliticasImportantes");
}

export function getPuntosPolitica(
  t: (key: string, opts?: any) => any
): PuntoPolitica[] {
  const puntos = t("reserva.terminos.puntos", { returnObjects: true }) as PuntoPolitica[];
  // Los puntos 3 y 4 (índices 2 y 3) mencionan el valor de excedente por
  // kilómetro — se interpola acá porque viene de una constante numérica,
  // no de la traducción.
  const valorKm = VALOR_KM_EXCEDENTE.toLocaleString("es-CO");
  return puntos.map((punto) => ({
    ...punto,
    items: punto.items.map((item) => item.replace(/\{\{valorKm\}\}/g, `$${valorKm}`)),
  }));
}
