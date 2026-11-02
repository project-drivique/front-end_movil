// modules/catalogo/components/VehiculoCard.tsx

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useReservaStore } from "@/store/reservationStore";
import { GRADIENTES } from "@/constants/gradients";
import { DatosFechasLugar } from "@/modules/reservation/types/reservation.types";
import { Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { COLORES } from "../constants/catalog.constants";
import { Vehiculo } from "../types/catalog.types";
import { useMonedaStore } from "@/store/currencyStore";
import { formatCurrency } from "@/utils/currencyUtils";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { COLOR_ACCENT, COLOR_ACENTO, COLOR_MARCA } from "@/constants/brandPalette";
import { styles } from './VehicleCard/VehicleCard.styles'

interface Props {
  vehiculo: Vehiculo;
  invitado?: boolean;
  esFavorito?: boolean;
  onAccionRestringida?: (accion: "reservar" | "favorito") => void;
  onToggleFavorito?: (id: number) => void;
  // Viene de una búsqueda previa en "Consultar disponibilidad". Si el
  // usuario no buscó nada, llega undefined y la reserva arranca vacía.
  datosPrecarga?: Partial<Pick<DatosFechasLugar, "lugarRetiro" | "fechaRetiro" | "fechaDevolucion">>;
}

function getSafeImages(vehiculo: Vehiculo): string[] {
  const imgs = vehiculo.imagenes ?? [];
  const filtradas = imgs.filter(Boolean);
  if (filtradas.length > 0) return filtradas.slice(0, 8);
  if (vehiculo.imagen) return [vehiculo.imagen];
  if (vehiculo.foto) return [vehiculo.foto];
  return [];
}

function Estrella({ llena }: { llena: boolean }) {
  return (
    <Ionicons
      name={llena ? "star" : "star-outline"}
      size={13}
      color={llena ? "#f59e0b" : "#d1d5db"}
    />
  );
}

function VehiculoCard({
  vehiculo,
  invitado = true,
  esFavorito = false,
  onAccionRestringida,
  onToggleFavorito,
  datosPrecarga,
}: Props) {
  // Suscripción con selector: garantiza el re-render cuando cambie
  // COP↔USD o llegue una tasa nueva (suscribirse sin selector no lo
  // hacía de forma confiable dentro de las filas del FlatList).
  const monedaActual = useMonedaStore((s) => s.monedaActual);
  const tasaUSD = useMonedaStore((s) => s.tasaUSD);
  const c = useTemaColores();
  const { t } = useTranslation();
  const [fotoActiva, setFotoActiva] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const imagenes = getSafeImages(vehiculo);
  const estadoDisponible = vehiculo.disponible !== false;
  const rating = Number(vehiculo.calificacion ?? 0);
  const tieneResenas = (vehiculo.comentarios && vehiculo.comentarios.length > 0) || rating > 0;
  const estrellas = Array.from(
    { length: 5 },
    (_, i) => i < Math.round(rating)
  );

  const descuentoPorcentaje = 0;

  const tieneDescuento = descuentoPorcentaje > 0 && estadoDisponible;
  const precioOriginal = vehiculo.precio ?? 0;
  const precioConDescuento = tieneDescuento
    ? Math.round(precioOriginal * (1 - descuentoPorcentaje / 100))
    : precioOriginal;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const width = e.nativeEvent.layoutMeasurement.width;
    if (width > 0) setFotoActiva(Math.round(x / width));
  };

  const handlePrevFoto = () => {
    if (scrollRef.current && cardWidth > 0 && imagenes.length > 1) {
      const nextIndex = fotoActiva <= 0 ? imagenes.length - 1 : fotoActiva - 1;
      scrollRef.current.scrollTo({ x: nextIndex * cardWidth, animated: true });
      setFotoActiva(nextIndex);
    }
  };

  const handleNextFoto = () => {
    if (scrollRef.current && cardWidth > 0 && imagenes.length > 1) {
      const nextIndex = fotoActiva >= imagenes.length - 1 ? 0 : fotoActiva + 1;
      scrollRef.current.scrollTo({ x: nextIndex * cardWidth, animated: true });
      setFotoActiva(nextIndex);
    }
  };

  const handleReservar = () => {
    if (!estadoDisponible) return;
    if (invitado) {
      onAccionRestringida?.("reservar");
      return;
    }
    useReservaStore.getState().seleccionarVehiculo(
      tieneDescuento
        ? {
            ...vehiculo,
            precioOriginal: vehiculo.precio,
            precio: precioConDescuento,
          }
        : vehiculo,
      {
        ...datosPrecarga,
        descuentoPromocion: tieneDescuento ? descuentoPorcentaje : undefined,
      }
    );
    router.push("/(tabs)/reserve");
  };

  const handleFavorito = () => {
    if (invitado) {
      onAccionRestringida?.("favorito");
      return;
    }
    onToggleFavorito?.(vehiculo.id);
  };

  return (
    <View style={[styles.card, { backgroundColor: c.bgCard, borderColor: c.border }]}>
      <View
        style={[styles.imagenContainer, { backgroundColor: c.bgInput }]}
        onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
      >
        {cardWidth > 0 && imagenes.length > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={{ width: cardWidth, height: 190 }}
            contentContainerStyle={{ flexDirection: "row" }}
          >
            {imagenes.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={{ width: cardWidth, height: 190 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        ) : cardWidth > 0 ? (
          <View style={styles.imagenFallback}>
            <Ionicons
              name="car-outline"
              size={48}
              color={COLORES.imageFallbackIcon}
            />
          </View>
        ) : null}

        <View
          style={[
            styles.badge,
            { backgroundColor: estadoDisponible ? "#e6f4ea" : "#fce8e6" },
          ]}
        >
          <View
            style={[
              styles.badgeDot,
              { backgroundColor: estadoDisponible ? "#137333" : "#c5221f" },
            ]}
          />
          <Text
            style={[
              styles.badgeText,
              { color: estadoDisponible ? "#137333" : "#c5221f" },
            ]}
          >
            {estadoDisponible ? t("catalogo.estados.disponible") : t("catalogo.noDisponible")}
          </Text>
        </View>

        <TouchableOpacity accessibilityRole="button" style={[styles.favBtn, { backgroundColor: c.bgCard }]} onPress={handleFavorito}>
          <Ionicons
            name={esFavorito ? "heart" : "heart-outline"}
            size={18}
            color={esFavorito ? (c.oscuro ? COLOR_ACENTO : COLOR_ACCENT) : (c.oscuro ? "#93C5FD" : "#1E3A8A")}
          />
        </TouchableOpacity>

        {imagenes.length > 1 && (
          <>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("a11y.volver", "Volver")}
              style={[styles.navBtn, styles.navBtnLeft]}
              onPress={handlePrevFoto}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("a11y.siguiente", "Siguiente")}
              style={[styles.navBtn, styles.navBtnRight]}
              onPress={handleNextFoto}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.contenido}>
        <View style={styles.tagsRow}>
          <View style={styles.tagCategoria}>
            <Text style={styles.tagCategoriaText}>
              {t(`catalogo.categoriaValores.${vehiculo.categoria ?? "Economico"}`, {
                defaultValue: vehiculo.categoria ?? "Económico",
              })}
            </Text>
          </View>
          <View style={styles.tagSucursal}>
            <Ionicons name="location-outline" size={10} color="#059669" />
            <Text style={styles.tagSucursalText}>
              {vehiculo.sucursal ?? ""}
            </Text>
          </View>
          {tieneDescuento && (
            <View style={[styles.tagPromo, { backgroundColor: c.oscuro ? "#064e3b" : "#ecfdf5", borderColor: c.oscuro ? "#059669" : "#a7f3d0" }]}>
              <Ionicons name="pricetag" size={10} color={c.oscuro ? "#34d399" : "#047857"} />
              <Text style={[styles.tagPromoText, { color: c.oscuro ? "#34d399" : "#047857" }]}>
                {`-${descuentoPorcentaje}%`}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.nombre, { color: c.textPrimary }]}>{vehiculo.nombre}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="settings-outline" size={14} color={COLOR_MARCA} />
            <Text style={[styles.infoText, { color: c.textSecondary }]}>
              {t(`catalogo.transmisionValores.${vehiculo.transmision}`, {
                defaultValue: vehiculo.transmision,
              })}
            </Text>
          </View>
          <View style={[styles.infoSeparador, { backgroundColor: c.border }]} />
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="gas-station-outline"
              size={14}
              color={COLOR_MARCA}
            />
            <Text style={[styles.infoText, { color: c.textSecondary }]}>
              {t(`catalogo.combustibleValores.${vehiculo.combustible}`, {
                defaultValue: vehiculo.combustible,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.estrellasRow}>
          {tieneResenas ? (
            <>
              {estrellas.map((llena, i) => (
                <Estrella key={i} llena={llena} />
              ))}
              <Text style={[styles.ratingText, { color: c.textSecondary }]}>{rating.toFixed(1)}</Text>
            </>
          ) : (
            <>
              {Array.from({ length: 5 }, (_, i) => (
                <Ionicons key={i} name="star-outline" size={13} color={c.textMuted} />
              ))}
              <Text style={[styles.ratingText, { color: c.textMuted }]}>
                {t("catalogo.sinResenas", "Sin reseñas")}
              </Text>
            </>
          )}
        </View>

        {tieneDescuento ? (
          <View style={styles.precioDescuentoContenedor}>
            <View style={styles.precioAntesFila}>
              <Text style={[styles.precioAntesTexto, { color: c.textMuted }]}>
                {formatCurrency(precioOriginal, monedaActual, tasaUSD)}
              </Text>
              <View style={[styles.badgeDescuentoPill, { backgroundColor: c.oscuro ? "#064e3b" : "#d1fae5" }]}>
                <Text style={[styles.badgeDescuentoPillTexto, { color: c.oscuro ? "#34d399" : "#047857" }]}>
                  -{descuentoPorcentaje}%
                </Text>
              </View>
            </View>
            <Text style={[styles.precio, { color: c.oscuro ? "#93C5FD" : "#1E3A8A", marginBottom: 12 }]}>
              {formatCurrency(precioConDescuento, monedaActual, tasaUSD)}
              <Text style={[styles.precioDia, { color: c.textMuted }]}> /{t("catalogo.porDia")}</Text>
            </Text>
          </View>
        ) : (
          <Text style={[styles.precio, { color: c.oscuro ? "#93C5FD" : "#1E3A8A" }]}>
            {formatCurrency(vehiculo.precio, monedaActual, tasaUSD)}
            <Text style={[styles.precioDia, { color: c.textMuted }]}> /{t("catalogo.porDia")}</Text>
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.reservarBtnWrap,
            !estadoDisponible && [styles.reservarBtnDisabled, { backgroundColor: c.bgInput }],
          ]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Reservar vehículo ${vehiculo.marca} ${vehiculo.modelo}`}
          onPress={handleReservar}
          disabled={!estadoDisponible}
          activeOpacity={0.85}
        >
          {estadoDisponible ? (
            <LinearGradient
              colors={GRADIENTES.boton.colors}
              start={GRADIENTES.boton.start}
              end={GRADIENTES.boton.end}
              style={styles.reservarBtn}
            >
              <Ionicons name="car-sport-outline" size={16} color="#fff" />
              <Text style={styles.reservarBtnText}>{t("catalogo.reservarAhora")}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.reservarBtn}>
              <Ionicons name="car-sport-outline" size={16} color="#fff" />
              <Text style={styles.reservarBtnText}>{t("catalogo.noDisponible")}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalles de ${vehiculo.marca} ${vehiculo.modelo}`}
          style={styles.detallesBtn}
          onPress={() =>
            router.push({
              pathname: "/vehicle/[id]",
              params: {
                id: String(vehiculo.id),
                ...(tieneDescuento ? { descuentoPorcentaje: String(descuentoPorcentaje) } : {}),
              },
            })
          }
          activeOpacity={0.7}
        >
          <View style={[styles.detallesTextWrap, { borderBottomColor: c.oscuro ? "#93C5FD" : "#1E3A8A" }]}>
            <Text style={[styles.detallesBtnText, { color: c.oscuro ? "#93C5FD" : "#1E3A8A" }]}>
              {t("catalogo.verDetalles", { defaultValue: "Ver detalles" })}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default memo(VehiculoCard);

