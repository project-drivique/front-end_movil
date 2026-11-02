import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native'
import { styles } from '../my-bookings.styles'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_MARCA } from '@/modules/catalog/constants/catalog.constants'
import React from 'react'
import { useTemaColores } from '@/modules/i18n/hooks/useLanguage'
import { GrupoReserva } from '@/modules/reservation/services/reservationPersistService'

function SelectorFiltro({
  icono,
  etiqueta,
  valor,
  activo,
  onPress,
  c,
}: {
  icono: React.ComponentProps<typeof Ionicons>["name"];
  etiqueta: string;
  valor: string;
  activo: boolean;
  onPress: () => void;
  c: ReturnType<typeof useTemaColores>;
}) {
  return (
    <TouchableOpacity accessibilityRole="button"
      style={[
        styles.selectorFiltro,
        {
          backgroundColor: activo ? c.primaryBg : c.bgInput,
          borderColor: activo ? c.primary : c.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.selectorFiltroSuperior}>
        <Ionicons name={icono} size={14} color={activo ? c.primary : c.textMuted} />
        <Text style={[styles.selectorFiltroEtiqueta, { color: c.textMuted }]} numberOfLines={1}>{etiqueta}</Text>
      </View>
      <View style={styles.selectorFiltroInferior}>
        <Text style={[styles.selectorFiltroValor, { color: activo ? c.primary : c.textPrimary }]} numberOfLines={1}>{valor}</Text>
        <Ionicons name="chevron-down" size={14} color={activo ? c.primary : c.textMuted} />
      </View>
    </TouchableOpacity>
  );
}
function etiquetaMes(claveYYYYMM: string, locale: string): string {
  const fecha = new Date(claveYYYYMM + "-01T00:00:00");
  const texto = fecha.toLocaleDateString(locale, { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
const ORDEN_GRUPOS: GrupoReserva[] = ["pendiente", "confirmada", "en_curso", "finalizada", "cancelada"];

export default function Cargando({ c, filtroGrupo, filtroMes, hayFiltrosActivos, limpiarFiltros, locale, mesesDelAnio, modalEstadoVisible, modalMesVisible, seleccionarMes, setFiltroGrupo, setModalEstadoVisible, setModalMesVisible, t }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; filtroGrupo: GrupoReserva | 'todas'; filtroMes: string | null; hayFiltrosActivos: boolean; limpiarFiltros: () => void; locale: string; mesesDelAnio: { clave: string; etiqueta: string; }[]; modalEstadoVisible: boolean; modalMesVisible: boolean; seleccionarMes: (clave: string | null) => void; setFiltroGrupo: React.Dispatch<React.SetStateAction<GrupoReserva | 'todas'>>; setModalEstadoVisible: React.Dispatch<React.SetStateAction<boolean>>; setModalMesVisible: React.Dispatch<React.SetStateAction<boolean>>; t: any }) {
  return (
    <View style={[styles.filtrosWrap, { borderColor: c.border, backgroundColor: c.bgCard }]}>
            <View style={styles.filtrosCabecera}>
              <View style={[styles.filtrosIcono, { backgroundColor: c.primaryBg }]}>
                <Ionicons name="options-outline" size={18} color={c.primary} />
              </View>
              <Text style={[styles.filtrosTitulo, { color: c.textPrimary }]}>{t("misReservas.filtros")}</Text>
              {hayFiltrosActivos && (
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("misReservas.limpiarFiltros")} onPress={limpiarFiltros} activeOpacity={0.7}>
                  <Text style={[styles.limpiarBtnTexto, { color: c.primary }]}>{t("misReservas.limpiarFiltros")}</Text>
                </TouchableOpacity>
              )}
            </View>
  
            <View style={styles.selectoresFila}>
              <SelectorFiltro
                icono="flag-outline"
                etiqueta={t("misReservas.filtrarPorEstado")}
                valor={filtroGrupo === "todas" ? t("misReservas.todas") : t(`misReservas.grupos.${filtroGrupo}`)}
                activo={filtroGrupo !== "todas"}
                onPress={() => setModalEstadoVisible(true)}
                c={c}
              />
              <SelectorFiltro
                icono="calendar-outline"
                etiqueta={t("misReservas.filtrarPorMes")}
                valor={filtroMes ? etiquetaMes(filtroMes, locale) : t("misReservas.todosLosMeses")}
                activo={!!filtroMes}
                onPress={() => setModalMesVisible(true)}
                c={c}
              />
            </View>
  
            <Modal visible={modalEstadoVisible} transparent animationType="fade" onRequestClose={() => setModalEstadoVisible(false)}>
              <Pressable accessibilityRole="button" accessibilityLabel={t("misReservas.filtrarPorEstado")} style={styles.modalOverlay} onPress={() => setModalEstadoVisible(false)}>
                <Pressable accessibilityRole="button" accessibilityLabel={t("misReservas.filtrarPorEstado")} style={[styles.modalCard, { backgroundColor: c.bgCard }]} onPress={() => {}}>
                  <Text style={[styles.modalTitulo, { color: c.textPrimary }]}>{t("misReservas.filtrarPorEstado")}</Text>
                  {(["todas", ...ORDEN_GRUPOS] as const).map((grupo) => {
                    const activo = filtroGrupo === grupo;
                    return (
                      <TouchableOpacity accessibilityRole="button"
                        key={grupo}
                        style={[styles.opcionEstado, { borderBottomColor: c.border }]}
                        onPress={() => { setFiltroGrupo(grupo); setModalEstadoVisible(false); }}
                      >
                        <Text style={[styles.opcionEstadoTexto, { color: activo ? c.primary : c.textPrimary }]}>
                          {grupo === "todas" ? t("misReservas.todas") : t(`misReservas.grupos.${grupo}`)}
                        </Text>
                        {activo && <Ionicons name="checkmark-circle" size={20} color={c.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </Pressable>
              </Pressable>
            </Modal>
  
            <Modal
              visible={modalMesVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setModalMesVisible(false)}
            >
              <Pressable accessibilityRole="button" accessibilityLabel={t("misReservas.filtrarPorMes")} style={styles.modalOverlay} onPress={() => setModalMesVisible(false)}>
                <Pressable accessibilityRole="button" accessibilityLabel={t("misReservas.filtrarPorMes")} style={[styles.modalCard, { backgroundColor: c.bgCard }]} onPress={() => {}}>
                  <Text style={[styles.modalTitulo, { color: c.textPrimary }]}>{t("misReservas.filtrarPorMes")}</Text>
  
                  <View style={styles.mesesGrid}>
                    {mesesDelAnio.map((m) => (
                      <TouchableOpacity accessibilityRole="button"
                        key={m.clave}
                        style={[styles.celdaMes, { backgroundColor: filtroMes === m.clave ? COLOR_MARCA : c.bgInput }]}
                        onPress={() => seleccionarMes(m.clave)}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.celdaMesTexto, { color: filtroMes === m.clave ? "#fff" : c.textPrimary }]}>
                          {m.etiqueta}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
  
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("misReservas.todosLosMeses")} style={styles.todosMesesBtn} onPress={() => seleccionarMes(null)} activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.todosMesesTexto,
                        { color: !filtroMes ? c.primary : c.textSecondary, fontWeight: !filtroMes ? "800" : "600" },
                      ]}
                    >
                      {t("misReservas.todosLosMeses")}
                    </Text>
                    {!filtroMes && <Ionicons name="checkmark" size={16} color={c.primary} />}
                  </TouchableOpacity>
                </Pressable>
              </Pressable>
            </Modal>
          </View>
  )
}
