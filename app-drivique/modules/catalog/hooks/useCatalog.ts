import { useMemo, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import {
  FILTROS_BASE,
  VEHICULOS_MOCK,
  getCiudadPorSucursal,
  getDisponibilidadVehiculo,
} from "../constants/catalog.constants";
import {
  BusquedaForm,
  FiltrosCatalogoState,
  Vehiculo,
} from "../types/catalog.types";

function estaDisponibleEnRango(
  vehiculo: Vehiculo,
  fechaInicio: string,
  fechaFin: string,
): boolean {
  const disp = getDisponibilidadVehiculo(vehiculo.id);
  const ocupados = disp.ocupados ?? [];
  if (ocupados.length === 0) return true;

  const inicio = new Date(fechaInicio + "T00:00:00");
  const fin = new Date(fechaFin + "T00:00:00");

  return !ocupados.some((fo) => {
    const fecha = new Date(fo.fecha + "T00:00:00");
    return fecha >= inicio && fecha < fin;
  });
}

// Aplica los criterios del modal "Consultar Disponibilidad" sobre un array dado.
// Se extrae aparte para poder reusarla tanto en el filtrado real (useMemo)
// como en la comprobación previa de "¿esto daría 0 resultados?" en handleBuscar.
function aplicarCriteriosBusqueda(
  arr: Vehiculo[],
  form: BusquedaForm,
): Vehiculo[] {
  let out = arr;

  if (form.lugarRecogida) {
    out = out.filter(
      (v) => v.sucursal && getCiudadPorSucursal(v.sucursal) === form.lugarRecogida,
    );
  }
  if (form.lugarDevolucion) {
    out = out.filter((v) => v.sucursal === form.lugarDevolucion);
  }
  if (form.fechaInicio && form.fechaFin) {
    out = out.filter((v) =>
      estaDisponibleEnRango(v, form.fechaInicio, form.fechaFin),
    );
  }

  return out;
}

const BUSQUEDA_FORM_BASE: BusquedaForm = {
  lugarRecogida: "",
  lugarDevolucion: "",
  fechaInicio: "",
  fechaFin: "",
  mismoLugar: true,
};

interface OpcionesCatalogo {
  // "Mis Favoritos" y el buscador de texto del header viven fuera del
  // dominio de `filtros`, pero deben aplicarse ANTES de paginar (si no,
  // el filtro solo actúa sobre los 6 vehículos de la página actual y
  // puede mostrar "sin resultados" aunque sí haya coincidencias en otra
  // página).
  soloFavoritos?: boolean;
  esFavorito?: (id: number) => boolean;
  textoBusqueda?: string;
}

export function useCatalogo(opciones: OpcionesCatalogo = {}) {
  const { soloFavoritos = false, esFavorito, textoBusqueda = "" } = opciones;
  const { t } = useTranslation();
  const [vehiculos] = useState<Vehiculo[]>(VEHICULOS_MOCK);
  const [cargando] = useState(false);
  const [error] = useState<string | null>(null);

  // Dominio exclusivo del modal "Filtros"
  const [filtros, setFiltros] = useState<FiltrosCatalogoState>(FILTROS_BASE);

  // Dominio exclusivo del modal "Consultar Disponibilidad"
  const [busquedaForm, setBusquedaForm] = useState<BusquedaForm>(BUSQUEDA_FORM_BASE);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState("");

  // Bandera para avisarle a la UI que la última búsqueda no encontró vehículos
  // (no es un estado vacío de catálogo: el catálogo se queda mostrando todo normal)
  const [sinResultadosBusqueda, setSinResultadosBusqueda] = useState(false);

  const [pagina, setPagina] = useState(1);

  const setFiltro = (campo: keyof FiltrosCatalogoState, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPagina(1);
  };

  const setForm = (campo: keyof BusquedaForm, valor: string | boolean) => {
    setBusquedaForm((prev) => ({ ...prev, [campo]: valor }));
    setErrorBusqueda("");
  };

  const handleBuscarInvitado = () => {
    Alert.alert(
      t("auth.login.modoInvitado"),
      t("catalogo.alertas.modoInvitadoMensaje"),
      [
        { text: t("catalogo.alertas.cancelar"), style: "cancel" },
        { text: t("catalogo.alertas.irARegistrarse"), onPress: () => {} },
      ],
    );
  };

  const handleBuscar = () => {
    if (!busquedaForm.lugarRecogida || !busquedaForm.lugarDevolucion) {
      setErrorBusqueda(t("catalogo.buscador.errorCiudadSucursal"));
      return;
    }
    if (!busquedaForm.fechaInicio || !busquedaForm.fechaFin) {
      setErrorBusqueda(t("catalogo.buscador.errorFechas"));
      return;
    }
    if (busquedaForm.fechaFin <= busquedaForm.fechaInicio) {
      setErrorBusqueda(t("catalogo.buscador.errorFechaDevolucionPosterior"));
      return;
    }
    setErrorBusqueda("");

    // Comprobación previa: ¿esta búsqueda daría 0 vehículos?
    const disponibles = aplicarCriteriosBusqueda(vehiculos, busquedaForm);

    if (disponibles.length === 0) {
      // No se activa el filtro de disponibilidad -> el catálogo sigue mostrando
      // todos los vehículos normal. Solo se avisa con alerta.
      setBusquedaRealizada(false);
      setSinResultadosBusqueda(true);
      return;
    }

    setBusquedaRealizada(true);
    setPagina(1);
  };

  const cerrarAlertaSinResultados = () => {
    setSinResultadosBusqueda(false);
  };

  // Responsabilidad EXCLUSIVA de "Consultar Disponibilidad" — no toca `filtros`
  const limpiarBusqueda = () => {
    setBusquedaForm(BUSQUEDA_FORM_BASE);
    setBusquedaRealizada(false);
    setErrorBusqueda("");
    setSinResultadosBusqueda(false);
    setPagina(1);
  };

  // Responsabilidad EXCLUSIVA del modal "Filtros" — no toca `busquedaForm`
  const limpiarFiltros = () => {
    setFiltros(FILTROS_BASE);
    setPagina(1);
  };

  // "Mis Favoritos" queda afuera a propósito: si está activo y no hay (o
  // no coinciden) favoritos, eso ya tiene su propio estado vacío dedicado
  // en la UI (ver ListEmptyComponent en catalog.tsx) — no debe disparar
  // el aviso genérico de "sin disponibilidad" ni mostrar de vuelta el
  // catálogo completo, porque eso ignoraría el filtro que el usuario
  // activó a propósito.
  const hayFiltrosActivos =
    filtros.categoria !== "Todos" ||
    filtros.ciudad !== "Todas las ciudades" ||
    filtros.sucursal !== "Todas las sucursales" ||
    filtros.transmision !== "Todas" ||
    filtros.combustible !== "Todos" ||
    !!filtros.precioMin ||
    !!filtros.precioMax ||
    !!textoBusqueda.trim();

  // Aplica TODOS los criterios (favoritos, texto, categoría, ciudad,
  // sucursal, precio, transmisión, combustible). Puede quedar vacío de
  // forma legítima si la combinación no coincide con ningún vehículo del
  // mock (ej: ciudad Medellín + sucursal de Bogotá).
  const resultadoCrudo = useMemo(() => {
    let arr = [...vehiculos];

    if (textoBusqueda.trim()) {
      const busq = textoBusqueda.toLowerCase();
      arr = arr.filter(
        (v) =>
          (v.nombre || "").toLowerCase().includes(busq) ||
          (v.marca || "").toLowerCase().includes(busq) ||
          (v.modelo || "").toLowerCase().includes(busq),
      );
    }

    if (soloFavoritos && esFavorito) {
      arr = arr.filter((v) => esFavorito(v.id));
    }

    if (filtros.categoria !== "Todos")
      arr = arr.filter((v) => v.categoria === filtros.categoria);
    if (filtros.transmision !== "Todas")
      arr = arr.filter((v) => v.transmision === filtros.transmision);
    if (filtros.combustible !== "Todos")
      arr = arr.filter((v) => v.combustible === filtros.combustible);

    // Ciudad/sucursal elegidas en el modal "Filtros" (independientes de disponibilidad)
    if (filtros.ciudad !== "Todas las ciudades") {
      arr = arr.filter(
        (v) => v.sucursal && getCiudadPorSucursal(v.sucursal) === filtros.ciudad,
      );
    }
    if (filtros.sucursal !== "Todas las sucursales") {
      arr = arr.filter((v) => v.sucursal === filtros.sucursal);
    }

    const min = filtros.precioMin ? Number(filtros.precioMin) : null;
    const max = filtros.precioMax ? Number(filtros.precioMax) : null;
    if (min !== null) arr = arr.filter((v) => v.precio >= min);
    if (max !== null) arr = arr.filter((v) => v.precio <= max);

    // Ciudad/sucursal/fechas de "Consultar Disponibilidad" — dominio propio,
    // solo se aplica si el usuario efectivamente completó una búsqueda con resultados
    if (busquedaRealizada) {
      arr = aplicarCriteriosBusqueda(arr, busquedaForm);
    }

    return arr;
  }, [vehiculos, filtros, busquedaRealizada, busquedaForm, soloFavoritos, esFavorito, textoBusqueda]);

  // Si los filtros activos (categoría/ciudad/sucursal/precio/transmisión/
  // combustible/favoritos/texto) no dejan NINGÚN vehículo, no se deja el
  // catálogo vacío: se vuelve a mostrar el catálogo completo (respetando
  // solo las fechas de "Consultar Disponibilidad" si el usuario buscó) y
  // se avisa aparte con la alerta — mismo criterio que ya usa esa
  // búsqueda por fechas más abajo.
  const sinResultadosFiltros = hayFiltrosActivos && resultadoCrudo.length === 0;

  const resultado = useMemo(() => {
    const base = sinResultadosFiltros
      ? busquedaRealizada
        ? aplicarCriteriosBusqueda([...vehiculos], busquedaForm)
        : [...vehiculos]
      : resultadoCrudo;

    const arr = [...base];
    if (filtros.orden === "precio_asc") arr.sort((a, b) => a.precio - b.precio);
    if (filtros.orden === "precio_desc") arr.sort((a, b) => b.precio - a.precio);
    if (filtros.orden === "calificacion")
      arr.sort((a, b) => (b.calificacion ?? 0) - (a.calificacion ?? 0));

    return arr;
  }, [resultadoCrudo, sinResultadosFiltros, busquedaRealizada, busquedaForm, vehiculos, filtros.orden]);

  const POR_PAGINA = 6;
  const totalPaginas = Math.max(1, Math.ceil(resultado.length / POR_PAGINA));

  const vehiculosPagina = useMemo(() => {
    const inicio = (pagina - 1) * POR_PAGINA;
    return resultado.slice(inicio, inicio + POR_PAGINA);
  }, [resultado, pagina]);

  return {
    vehiculos,
    cargando,
    error,
    filtros,
    setFiltro,
    busquedaForm,
    setForm,
    busquedaRealizada,
    errorBusqueda,
    sinResultadosBusqueda,
    cerrarAlertaSinResultados,
    sinResultadosFiltros,
    limpiarFiltros,
    limpiarBusqueda,
    handleBuscarInvitado,
    handleBuscar,
    pagina,
    setPagina,
    totalPaginas,
    vehiculosFiltrados: resultado,
    vehiculosPaginados: vehiculosPagina,
    paginaActual: pagina,
    paginaSiguiente: () => setPagina((p) => Math.min(p + 1, totalPaginas)),
    paginaAnterior: () => setPagina((p) => Math.max(p - 1, 1)),
  };
}