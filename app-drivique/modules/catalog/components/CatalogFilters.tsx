import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import {
  CATEGORIAS,
  CIUDADES_FILTRO,
  COMBUSTIBLES,
  SUCURSALES,
  TRANSMISIONES,
} from "../constants/catalog.constants";
import { FiltrosCatalogoState } from "../types/catalog.types";
import { useMonedaStore } from "@/store/currencyStore";

interface Props {
  visible: boolean;
  onClose: () => void;
  filtros: FiltrosCatalogoState;
  setFiltro: (campo: keyof FiltrosCatalogoState, valor: string) => void;
  limpiar: () => void;
  usuario: boolean;
  soloFavoritos: boolean;
  onToggleSoloFavoritos: () => void;
  totalFavoritos: number;
}

const COLOR_AZUL = "#1E3A8A";
const COLOR_AZUL_ACTIVO = "#2563EB";

function Chip({
  label,
  activo,
  onPress,
  c,
}: {
  label: string;
  activo: boolean;
  onPress: () => void;
  c: ReturnType<typeof useTemaColores>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.chip,
        { backgroundColor: c.oscuro ? "#1E293B" : "#F1F5F9" },
        activo && { backgroundColor: COLOR_AZUL_ACTIVO },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: c.oscuro ? "#CBD5E1" : "#334155" },
          activo && { color: "#FFFFFF", fontWeight: "700" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Seccion({
  label,
  children,
  c,
}: {
  label: string;
  children: React.ReactNode;
  c: ReturnType<typeof useTemaColores>;
}) {
  return (
    <View style={[styles.seccion, { borderBottomColor: c.oscuro ? c.border : "#E2E8F0" }]}>
      <Text style={[styles.seccionLabel, { color: c.oscuro ? "#94A3B8" : "#475569" }]}>{label}</Text>
      {children}
    </View>
  );
}

type DropdownAbierto = "ciudad" | "sucursal" | null;

export default function FiltrosCatalogo({
  visible,
  onClose,
  filtros,
  setFiltro,
  limpiar,
  usuario,
  soloFavoritos,
  onToggleSoloFavoritos,
  totalFavoritos,
}: Props) {
  const insets = useSafeAreaInsets();
  const [dropdownAbierto, setDropdownAbierto] = useState<DropdownAbierto>(null);
  const monedaActual = useMonedaStore((s) => s.monedaActual);
  const c = useTemaColores();
  const { t } = useTranslation();

  const colorTitulo = c.oscuro ? "#93C5FD" : COLOR_AZUL;
  const colorBorde = c.oscuro ? c.border : "#E2E8F0";

  const catLabels: Record<string, string> = {
    Todos: t("catalogo.filtros.todos", { defaultValue: "Todos" }),
    Sedan: t("catalogo.categorias.sedan", { defaultValue: "Sedán" }),
    SUV: t("catalogo.categorias.suv", { defaultValue: "SUV" }),
    Económico: t("catalogo.categorias.economico", { defaultValue: "Económico" }),
    Deportivo: t("catalogo.categorias.deportivo", { defaultValue: "Deportivo" }),
  };

  const transLabels: Record<string, string> = {
    Todas: t("catalogo.filtros.todas", { defaultValue: "Todas" }),
    Automática: t("catalogo.filtros.automatica", { defaultValue: "Automática" }),
    Manual: t("catalogo.filtros.manual", { defaultValue: "Manual" }),
  };

  const fuelLabels: Record<string, string> = {
    Todos: t("catalogo.filtros.todos", { defaultValue: "Todos" }),
    Gasolina: t("catalogo.filtros.gasolina", { defaultValue: "Gasolina" }),
    Diesel: t("catalogo.filtros.diesel", { defaultValue: "Diesel" }),
    Híbrido: t("catalogo.filtros.hibrido", { defaultValue: "Híbrido" }),
    Eléctrico: t("catalogo.filtros.electrico", { defaultValue: "Eléctrico" }),
  };

  const getCiudadLabel = (item: string) => {
    if (item === "Todas las ciudades") {
      return t("catalogo.filtros.todasLasCiudades", { defaultValue: "Todas las ciudades" });
    }
    return item;
  };

  const getSucursalLabel = (s: string) => {
    if (s === "Todas las sucursales") {
      return t("catalogo.filtros.todasLasSucursales", { defaultValue: "Todas las sucursales" });
    }
    return s;
  };

  const toggleDropdown = (campo: "ciudad" | "sucursal") => {
    setDropdownAbierto((prev) => (prev === campo ? null : campo));
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: c.bgCard,
              borderColor: colorBorde,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colorBorde }]}>
            <Text style={[styles.headerTitle, { color: colorTitulo }]}>
              {t("catalogo.filtrosModal.titulo", { defaultValue: "Filtros" })}
            </Text>

            <TouchableOpacity
              style={[styles.limpiarPillBtn, { borderColor: colorBorde, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF" }]}
              onPress={limpiar}
              activeOpacity={0.7}
            >
              <Text style={[styles.limpiarPillText, { color: colorTitulo }]}>
                {t("catalogo.filtrosModal.limpiar", { defaultValue: "Limpiar" })}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cuerpo Scrolleable */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {/* FAVORITOS */}
            {usuario && (
              <Seccion label={t("catalogo.filtros.favoritos", { defaultValue: "FAVORITOS" })} c={c}>
                <TouchableOpacity
                  style={[
                    styles.favoritoBtn,
                    {
                      backgroundColor: soloFavoritos
                        ? COLOR_AZUL_ACTIVO
                        : c.oscuro
                        ? "#1E293B"
                        : "#F1F5F9",
                      borderColor: soloFavoritos ? COLOR_AZUL_ACTIVO : colorBorde,
                    },
                  ]}
                  onPress={onToggleSoloFavoritos}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="star"
                    size={14}
                    color={soloFavoritos ? "#FFFFFF" : c.oscuro ? "#94A3B8" : "#475569"}
                  />
                  <Text
                    style={[
                      styles.favoritoBtnText,
                      { color: soloFavoritos ? "#FFFFFF" : c.oscuro ? "#CBD5E1" : "#334155" },
                    ]}
                  >
                    {t("catalogo.filtros.misFavoritos", { defaultValue: "Mis favoritos" })}
                  </Text>
                  {totalFavoritos > 0 && (
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: soloFavoritos
                            ? "rgba(255,255,255,0.3)"
                            : COLOR_AZUL_ACTIVO,
                        },
                      ]}
                    >
                      <Text style={styles.badgeText}>{totalFavoritos}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Seccion>
            )}

            {/* CATEGORÍA */}
            <Seccion label={t("catalogo.filtros.categoria", { defaultValue: "CATEGORÍA" })} c={c}>
              <View style={styles.chipsRow}>
                {CATEGORIAS.map((cat) => (
                  <Chip
                    key={cat}
                    label={catLabels[cat] ?? cat}
                    activo={filtros.categoria === cat}
                    onPress={() => setFiltro("categoria", cat)}
                    c={c}
                  />
                ))}
              </View>
            </Seccion>

            {/* CIUDAD */}
            <Seccion label={t("catalogo.filtros.ciudad", { defaultValue: "CIUDAD" })} c={c}>
              <TouchableOpacity
                style={[
                  styles.selectorBtn,
                  {
                    backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                    borderColor: colorBorde,
                  },
                ]}
                onPress={() => toggleDropdown("ciudad")}
                activeOpacity={0.7}
              >
                <Text style={[styles.selectorText, { color: c.textPrimary }]} numberOfLines={1}>
                  {getCiudadLabel(filtros.ciudad)}
                </Text>
                <Ionicons
                  name={dropdownAbierto === "ciudad" ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={c.oscuro ? "#94A3B8" : "#64748B"}
                />
              </TouchableOpacity>

              {dropdownAbierto === "ciudad" && (
                <View style={[styles.dropdownList, { backgroundColor: c.bgCard, borderColor: colorBorde }]}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {CIUDADES_FILTRO.map((item) => {
                      const esSeleccionada = filtros.ciudad === item;
                      return (
                        <TouchableOpacity
                          key={item}
                          style={[
                            styles.dropdownItem,
                            { borderBottomColor: colorBorde },
                            esSeleccionada && { backgroundColor: c.oscuro ? "#1E3A8A44" : "#EFF6FF" },
                          ]}
                          onPress={() => {
                            setFiltro("ciudad", item);
                            setDropdownAbierto(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              { color: esSeleccionada ? colorTitulo : c.textPrimary },
                              esSeleccionada && { fontWeight: "700" },
                            ]}
                          >
                            {getCiudadLabel(item)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </Seccion>

            {/* SUCURSAL */}
            <Seccion label={t("catalogo.filtros.sucursal", { defaultValue: "SUCURSAL" })} c={c}>
              <TouchableOpacity
                style={[
                  styles.selectorBtn,
                  {
                    backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                    borderColor: colorBorde,
                  },
                ]}
                onPress={() => toggleDropdown("sucursal")}
                activeOpacity={0.7}
              >
                <Text style={[styles.selectorText, { color: c.textPrimary }]} numberOfLines={1}>
                  {getSucursalLabel(filtros.sucursal)}
                </Text>
                <Ionicons
                  name={dropdownAbierto === "sucursal" ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={c.oscuro ? "#94A3B8" : "#64748B"}
                />
              </TouchableOpacity>

              {dropdownAbierto === "sucursal" && (
                <View style={[styles.dropdownList, { backgroundColor: c.bgCard, borderColor: colorBorde }]}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {SUCURSALES.map((s) => {
                      const esSeleccionada = filtros.sucursal === s;
                      return (
                        <TouchableOpacity
                          key={s}
                          style={[
                            styles.dropdownItem,
                            { borderBottomColor: colorBorde },
                            esSeleccionada && { backgroundColor: c.oscuro ? "#1E3A8A44" : "#EFF6FF" },
                          ]}
                          onPress={() => {
                            setFiltro("sucursal", s);
                            setDropdownAbierto(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              { color: esSeleccionada ? colorTitulo : c.textPrimary },
                              esSeleccionada && { fontWeight: "700" },
                            ]}
                            numberOfLines={1}
                          >
                            {getSucursalLabel(s)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </Seccion>

            {/* PRECIO POR DÍA */}
            <Seccion label={`${t("catalogo.filtros.precioPorDia", { defaultValue: "PRECIO POR DÍA" }).replace(/\(\$?[A-Z]+\)/g, "").trim()} (${monedaActual})`} c={c}>
              <View style={styles.precioRow}>
                <TextInput
                  style={[
                    styles.precioInput,
                    {
                      backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                      borderColor: colorBorde,
                      color: c.textPrimary,
                    },
                  ]}
                  placeholder={t("catalogo.filtros.minimo", { defaultValue: "Mínimo" })}
                  placeholderTextColor={c.textMuted}
                  keyboardType="numeric"
                  value={filtros.precioMin}
                  onChangeText={(v) => setFiltro("precioMin", v.replace(/[^0-9]/g, ""))}
                />
                <TextInput
                  style={[
                    styles.precioInput,
                    {
                      backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                      borderColor: colorBorde,
                      color: c.textPrimary,
                    },
                  ]}
                  placeholder={t("catalogo.filtros.maximo", { defaultValue: "Máximo" })}
                  placeholderTextColor={c.textMuted}
                  keyboardType="numeric"
                  value={filtros.precioMax}
                  onChangeText={(v) => setFiltro("precioMax", v.replace(/[^0-9]/g, ""))}
                />
              </View>
            </Seccion>

            {/* TRANSMISIÓN */}
            <Seccion label={t("catalogo.filtros.transmision", { defaultValue: "TRANSMISIÓN" })} c={c}>
              <View style={styles.chipsRow}>
                {TRANSMISIONES.map((tr) => (
                  <Chip
                    key={tr}
                    label={transLabels[tr] ?? tr}
                    activo={filtros.transmision === tr}
                    onPress={() => setFiltro("transmision", tr)}
                    c={c}
                  />
                ))}
              </View>
            </Seccion>

            {/* COMBUSTIBLE */}
            <Seccion label={t("catalogo.filtros.combustible", { defaultValue: "COMBUSTIBLE" })} c={c}>
              <View style={styles.chipsRow}>
                {COMBUSTIBLES.map((comb) => (
                  <Chip
                    key={comb}
                    label={fuelLabels[comb] ?? comb}
                    activo={filtros.combustible === comb}
                    onPress={() => setFiltro("combustible", comb)}
                    c={c}
                  />
                ))}
              </View>
            </Seccion>
          </ScrollView>

          {/* Footer con 2 Botones: Cerrar y Aplicar */}
          <View style={[styles.footer, { borderTopColor: colorBorde, backgroundColor: c.bgCard }]}>
            <TouchableOpacity
              style={[
                styles.btnCerrar,
                {
                  borderColor: colorTitulo,
                  backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                },
              ]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.btnCerrarTexto, { color: colorTitulo }]}>
                {t("reserva.flujo.cerrar", { defaultValue: "Cerrar" })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnAplicar, { backgroundColor: COLOR_AZUL }]}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.btnAplicarTexto}>
                {t("catalogo.filtrosModal.aplicarFiltros", { defaultValue: "Aplicar filtros" })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  backdrop: {
    ...(StyleSheet.absoluteFill as any),
  },
  sheetContainer: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "84%",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  limpiarPillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  limpiarPillText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  seccion: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  seccionLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  favoritoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  favoritoBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  badge: {
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#fff",
  },
  selectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  selectorText: {
    fontSize: 13,
    flex: 1,
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 13,
  },
  precioRow: {
    flexDirection: "row",
    gap: 10,
  },
  precioInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  btnCerrar: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCerrarTexto: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  btnAplicar: {
    flex: 1.3,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAplicarTexto: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});