import { AlertModal } from "@/components/ui/AlertModal";
import BuscadorCatalogo from "@/modules/catalog/components/CatalogSearch";
import FiltrosCatalogo from "@/modules/catalog/components/CatalogFilters";

import { useCatalogo } from "@/modules/catalog/hooks/useCatalog";
import { useFavoritos } from "@/modules/catalog/hooks/useFavorites";
import { useAuthStore } from "@/store/authStore";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useBrandStore } from "@/store/brandStore";
import { ConfiguracionModal } from "@/modules/i18n/components/ConfiguracionModal";
import { useAuditoria } from "@/store/auditStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from '../../modules/catalog/screens/catalog.styles'
import Error from '../../modules/catalog/screens/CatalogScreen/Error'
import OrdenVisible from '../../modules/catalog/screens/CatalogScreen/OrdenVisible'
import CatalogPart2 from '../../modules/catalog/screens/CatalogScreen/CatalogPart2'
import CatalogPart from '../../modules/catalog/screens/CatalogScreen/CatalogPart'

export type AlertTipo = "busqueda" | "reservar" | "favorito";

// Aviso de "sin resultados" (buscador de fechas o filtros): a propósito NO
// es un <Modal> — es un banner normal, dentro del árbol de la pantalla.
// Antes se mostraba con el mismo AlertModal que usan "favorito"/"reservar",
// pero eso significaba presentar un <Modal> nativo justo cuando otro
// (Filtros o Buscar) recién se estaba cerrando, y en iOS/RN dos <Modal>
// coincidiendo en pantalla — aunque sea un instante — deja todo bloqueado:
// no responde ni al toque ni al scroll. Un banner normal no tiene ese
// riesgo porque nunca compite con la presentación nativa de otro modal.
function BannerSinResultados({
  onCerrar,
  c,
}: {
  onCerrar: () => void;
  c: ReturnType<typeof useTemaColores>;
}) {
  const { t } = useTranslation();
  return (
    <View style={[styles.bannerSinResultados, { backgroundColor: c.primaryBg, borderColor: "#1E40AF" }]}>
      <Ionicons name="car-outline" size={22} color="#1E40AF" />
      <View style={styles.bannerSinResultadosTextos}>
        <Text style={styles.bannerSinResultadosTitulo}>{t("catalogo.alertas.sinResultadosTitulo")}</Text>
        <Text style={[styles.bannerSinResultadosMensaje, { color: c.textSecondary }]}>
          {t("catalogo.alertas.sinResultadosMensaje")}
        </Text>
      </View>
      <TouchableOpacity onPress={onCerrar} hitSlop={8}>
        <Ionicons name="close" size={18} color={c.textMuted} />
      </TouchableOpacity>
    </View>
  );
}



export default function Catalogo() {
  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const nombreMarca = useBrandStore((s) => s.marca.nombre);
  const { t } = useTranslation();
  const usuario = useAuthStore((state) => state.usuario);
  const getInitials = () => {
    if (!usuario) return "?";
    const name = usuario.nombres && usuario.nombres.trim() !== "" 
      ? usuario.nombres 
      : (usuario.correo ? usuario.correo.split("@")[0] : "");
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };
  const [textBusqueda, setTextBusqueda] = useState("");
  const [modalFormVisible, setModalFormVisible] = useState(false);
  const [sweetAlertVisible, setSweetAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState("busqueda" as AlertTipo);
  const [ajustesVisible, setAjustesVisible] = useState(false);
  const { registrarEvento } = useAuditoria();

  const ORDEN_OPCIONES = useMemo(
    () => [
      { valor: "precio_asc", label: t("catalogo.ordenar.precioAsc") },
      { valor: "precio_desc", label: t("catalogo.ordenar.precioDesc") },
      { valor: "calificacion", label: t("catalogo.ordenar.calificacion") },
    ],
    [t]
  );

  const ALERT_CONTENT = useMemo(
    () => ({
      busqueda: {
        icono: "calendar-outline" as const,
        titulo: t("catalogo.alertas.busquedaTitulo"),
        mensaje: t("catalogo.alertas.busquedaMensaje"),
      },
      reservar: {
        icono: "car-sport-outline" as const,
        titulo: t("catalogo.alertas.reservarTitulo"),
        mensaje: t("catalogo.alertas.reservarMensaje"),
      },
      favorito: {
        icono: "heart-outline" as const,
        titulo: t("catalogo.alertas.favoritoTitulo"),
        mensaje: t("catalogo.alertas.favoritoMensaje"),
      },
    }),
    [t]
  );

  const params = useLocalSearchParams<{ favoritos?: string }>();
  const usuarioId = usuario ? String(usuario.id ?? usuario.correo ?? "user") : null;
  const { favoritos, toggleFavorito, esFavorito } = useFavoritos(usuarioId);
  const [soloFavoritos, setSoloFavoritos] = useState(false);

  useEffect(() => {
    if (params.favoritos === "true") {
      setSoloFavoritos(true);
    } else if (params.favoritos === "false") {
      setSoloFavoritos(false);
    }
  }, [params.favoritos]);

  const {
    cargando,
    error,
    filtros,
    setFiltro,
    vehiculosFiltrados,
    vehiculosPaginados,
    limpiarFiltros,
    limpiarBusqueda,
    busquedaForm,
    busquedaRealizada,
    setForm,
    handleBuscar,
    errorBusqueda,
    sinResultadosBusqueda,
    cerrarAlertaSinResultados,
    sinResultadosFiltros,
    paginaActual,
    totalPaginas,
    paginaSiguiente,
    paginaAnterior,
    setPagina,
  } = useCatalogo({ soloFavoritos, esFavorito, textoBusqueda: textBusqueda });

  const [filtrosVisible, setFiltrosVisible] = useState(false);
  const [ordenVisible, setOrdenVisible] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [paginaActual]);

  // RF: la navegación del visitante queda registrada en auditoría.
  useEffect(() => {
    if (!usuario) registrarEvento("navegacion", "catalogo");
  }, [usuario, registrarEvento]);

  const ordenLabel =
    ORDEN_OPCIONES.find((o) => o.valor === filtros.orden)?.label ??
    t("catalogo.ordenar.porDefecto");

  const filtrosActivos =
    filtros.categoria !== "Todos" ||
    filtros.ciudad !== "Todas las ciudades" ||
    filtros.sucursal !== "Todas las sucursales" ||
    filtros.transmision !== "Todas" ||
    filtros.combustible !== "Todos" ||
    !!filtros.precioMin ||
    !!filtros.precioMax ||
    soloFavoritos;

  // El hook ya aplica favoritos y texto de búsqueda ANTES de paginar
  // (ver useCatalogo), así que lo que llega acá ya viene correcto.
  const vehiculosAMostrar = vehiculosPaginados;

  // Si el usuario completó una búsqueda válida en "Consultar disponibilidad",
  // esos datos precargan (editables) el resumen de la reserva. lugarDevolucion
  // de BusquedaForm en realidad guarda la sucursal (así lo maneja BuscadorCatalogo
  // y useCatalogo), por eso mapea a lugarRetiro en la reserva.
  const datosPrecargaReserva = busquedaRealizada
    ? {
        lugarRetiro: busquedaForm.lugarDevolucion,
        fechaRetiro: busquedaForm.fechaInicio,
        fechaDevolucion: busquedaForm.fechaFin,
      }
    : undefined;

  const abrirSweetAlert = (tipo: AlertTipo) => {
    setAlertTipo(tipo);
    setSweetAlertVisible(true);
    if (!usuario) registrarEvento("accion_restringida", tipo);
  };

  // Si la combinación de filtros (categoría, ciudad, sucursal, precio,
  // transmisión, combustible o el buscador de texto) no deja ningún
  // vehículo, useCatalogo vuelve a mostrar el catálogo completo por su
  // cuenta (ver sinResultadosFiltros/resultado en useCatalog.ts) y acá se
  // muestra el banner (no modal) encima de la lista. Se "re-arma" cada vez
  // que el usuario toca un filtro, para que vuelva a aparecer si la nueva
  // combinación también da 0.
  const [bannerFiltrosCerrado, setBannerFiltrosCerrado] = useState(false);
  useEffect(() => {
    setBannerFiltrosCerrado(false);
  }, [filtros, soloFavoritos, textBusqueda]);
  const mostrarBannerFiltros = sinResultadosFiltros && !bannerFiltrosCerrado;

  const handleToggleSoloFavoritos = () => {
    setSoloFavoritos((prev) => !prev);
    setPagina(1);
  };

  const handleLimpiarFiltros = () => {
    limpiarFiltros();
    setSoloFavoritos(false);
  };

  const alertInfo = ALERT_CONTENT[alertTipo];

  // "sinResultados" ya no pasa por acá — ahora es el banner no-modal (ver
  // BannerSinResultados). AlertModal queda solo para las 3 acciones que sí
  // necesitan Cancelar / Iniciar sesión.
  const alertBotones = [
    {
      texto: t("catalogo.alertas.cancelar"),
      variante: "secundario" as const,
      onPress: () => setSweetAlertVisible(false),
    },
    {
      texto: t("catalogo.alertas.iniciarSesion"),
      variante: "primario" as const,
      onPress: () => {
        setSweetAlertVisible(false);
        router.push("/(auth)/login");
      },
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.bg }]}>
      <StatusBar
        barStyle={c.oscuro ? "light-content" : "dark-content"}
        backgroundColor={c.bgHeader}
        translucent={true}
      />

      <CatalogPart c={c} getInitials={getInitials} nombreMarca={nombreMarca} setAjustesVisible={setAjustesVisible} t={t} usuario={usuario} />

      <BuscadorCatalogo
        form={busquedaForm}
        setForm={setForm}
        textBusqueda={textBusqueda}
        setTextBusqueda={setTextBusqueda}
        onBuscar={handleBuscar}
        onLimpiarBusqueda={limpiarBusqueda}
        errorBusqueda={errorBusqueda}
        disabled={!usuario}
        onPressRestringida={() => abrirSweetAlert("busqueda")}
        modalFormVisible={modalFormVisible}
        setModalFormVisible={setModalFormVisible}
      />

      <CatalogPart2 c={c} filtrosActivos={filtrosActivos} ordenLabel={ordenLabel} ordenVisible={ordenVisible} setFiltrosVisible={setFiltrosVisible} setOrdenVisible={setOrdenVisible} t={t} vehiculosFiltrados={vehiculosFiltrados} />

      {ordenVisible && (
        <OrdenVisible ORDEN_OPCIONES={ORDEN_OPCIONES} c={c} filtros={filtros} setFiltro={setFiltro} setOrdenVisible={setOrdenVisible} />
      )}

      {sinResultadosBusqueda && (
        <BannerSinResultados c={c} onCerrar={cerrarAlertaSinResultados} />
      )}
      {mostrarBannerFiltros && (
        <BannerSinResultados c={c} onCerrar={() => setBannerFiltrosCerrado(true)} />
      )}

      {cargando ? (
        <View style={styles.estadoCentro}>
          <ActivityIndicator size="large" color="#1E40AF" />
        </View>
      ) : error ? (
        <View style={styles.estadoCentro}>
          <Text style={styles.errorTexto}>{error}</Text>
        </View>
      ) : (
        <Error abrirSweetAlert={abrirSweetAlert} c={c} datosPrecargaReserva={datosPrecargaReserva} esFavorito={esFavorito} favoritos={favoritos} filtrosActivos={filtrosActivos} flatListRef={flatListRef} handleLimpiarFiltros={handleLimpiarFiltros} paginaActual={paginaActual} paginaAnterior={paginaAnterior} paginaSiguiente={paginaSiguiente} soloFavoritos={soloFavoritos} t={t} toggleFavorito={toggleFavorito} totalPaginas={totalPaginas} usuario={usuario} vehiculosAMostrar={vehiculosAMostrar} />
      )}

      <FiltrosCatalogo
        visible={filtrosVisible}
        onClose={() => setFiltrosVisible(false)}
        filtros={filtros}
        setFiltro={setFiltro}
        limpiar={handleLimpiarFiltros}
        usuario={!!usuario}
        soloFavoritos={soloFavoritos}
        onToggleSoloFavoritos={handleToggleSoloFavoritos}
        totalFavoritos={favoritos.length}
      />

      <AlertModal
        visible={sweetAlertVisible}
        icono={alertInfo.icono}
        titulo={alertInfo.titulo}
        mensaje={alertInfo.mensaje}
        botones={alertBotones}
        onCerrar={() => setSweetAlertVisible(false)}
      />

      <ConfiguracionModal
        visible={ajustesVisible}
        onClose={() => setAjustesVisible(false)}
      />
    </View>
  );
}

