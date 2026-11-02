import type { Tema } from '../AdditionalPlans'
import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from './AdditionalPlans.styles'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_MARCA } from '../../constants/reservation.constants'
import { LinearGradient } from 'expo-linear-gradient'
import { GRADIENTES } from '@/constants/gradients'
import { useMonedaStore } from '@/store/currencyStore'
import { formatCurrency } from '@/utils/currencyUtils'

function formatPrecio(precio: number): string {
  const { monedaActual, tasaUSD } = useMonedaStore.getState();
  return formatCurrency(precio, monedaActual, tasaUSD);
}
function ListaBeneficios({
  beneficios,
  c,
}: {
  beneficios: { tipo: "check" | "warning" | "cross"; texto: string }[];
  c: Tema;
}) {
  if (beneficios.length === 0) return null;
  return (
    <View style={styles.beneficiosLista}>
      {beneficios.map((b, i) => (
        <View key={i} style={styles.beneficioFila}>
          <IconoBeneficio tipo={b.tipo} />
          <Text
            style={[
              styles.beneficioTexto,
              { color: c.textSecondary },
              b.tipo === "cross" && [styles.beneficioTextoTachado, { color: c.textMuted }],
            ]}
          >
            {b.texto}
          </Text>
        </View>
      ))}
    </View>
  );
}
function IconoBeneficio({ tipo }: { tipo: "check" | "warning" | "cross" }) {
  if (tipo === "check") return <Ionicons name="checkmark" size={15} color="#16a34a" />;
  if (tipo === "warning") return <Ionicons name="warning-outline" size={15} color="#f59e0b" />;
  return <Ionicons name="close" size={15} color="#94a3b8" />;
}

export default function Length({ BENEFICIOS_PROTECCION, actualizarPlanes, c, dias, planes, primaryAccent, seguroElegido, seguros, t, totalProteccion }: { BENEFICIOS_PROTECCION: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/constants/reservation.constants").BeneficioProteccion[][]; actualizarPlanes: (data: Partial<import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosPlanes>) => void; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; dias: number; planes: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosPlanes; primaryAccent: string; seguroElegido: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Seguro | null; seguros: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Seguro[]; t: any; totalProteccion: number }) {
  return (
    <View style={[styles.card, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            {/* Header de la tarjeta padre */}
            <View style={styles.cardHeaderFila}>
              <Ionicons name="shield-outline" size={14} color={primaryAccent} />
              <Text style={[[styles.cardHeaderTitulo, { color: COLOR_MARCA }], { color: primaryAccent }]}>
                {t("reserva.planes.eligeTuNivelDeProteccion", { defaultValue: "Elige tu Nivel de Protección" })}
              </Text>
            </View>
  
            {/* Opciones de protección */}
            {seguros.map((seguro, idxSeguro) => {
              const activo = planes.proteccion === seguro.nombre;
              const beneficios = BENEFICIOS_PROTECCION[idxSeguro] ?? [];
              const esTotal = idxSeguro === seguros.length - 1 && seguros.length > 1;
  
              return (
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={t(`reserva.planes.nombreSeguro.${seguro.nombre}`, { defaultValue: seguro.nombre })}
                  key={seguro.nombre}
                  style={[
                    styles.opcionCard,
                    {
                      borderColor: c.border,
                      backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                    },
                    activo && [styles.opcionCardActiva, { borderColor: primaryAccent }],
                  ]}
                  onPress={() => actualizarPlanes({ proteccion: seguro.nombre })}
                  activeOpacity={0.88}
                >
                  {/* Íconos de nivel de protección (escudos) */}
                  <View style={styles.escudosNivelRow}>
                    {esTotal ? (
                      <>
                        <Ionicons name="shield" size={18} color={activo ? primaryAccent : "#94A3B8"} />
                        <Ionicons name="shield" size={18} color={activo ? primaryAccent : "#94A3B8"} />
                        <Ionicons name="shield" size={18} color={activo ? primaryAccent : "#94A3B8"} />
                      </>
                    ) : (
                      <>
                        <Ionicons name="shield" size={18} color={activo ? primaryAccent : "#94A3B8"} />
                        <Ionicons name="shield-outline" size={18} color="#94A3B8" />
                        <Ionicons name="shield-outline" size={18} color="#94A3B8" />
                      </>
                    )}
                  </View>
  
                  {/* Nombre de la protección */}
                  <Text style={[styles.planNombreGrande, { color: c.textPrimary }]}>
                    {t(`reserva.planes.nombreSeguro.${seguro.nombre}`, { defaultValue: seguro.nombre })}
                  </Text>
  
                  {/* Precio diario */}
                  <View style={styles.planPrecioRow}>
                    <Text style={[styles.planPrecioValor, { color: primaryAccent }]}>
                      {formatPrecio(seguro.precio)}
                    </Text>
                    <Text style={[styles.planPrecioUnidad, { color: c.textMuted }]}>
                      {t("reserva.planes.porDia", { defaultValue: "/ día" })}
                    </Text>
                  </View>
  
                  {/* Divisor */}
                  <View style={[styles.planDivisor, { backgroundColor: c.border }]} />
  
                  {/* Lista de beneficios */}
                  <ListaBeneficios beneficios={beneficios} c={c} />
  
                  {/* Botón Inferior: ELEGIR PLAN o PLAN SELECCIONADO */}
                  {activo ? (
                    <LinearGradient
                      colors={GRADIENTES.boton.colors}
                      start={GRADIENTES.boton.start}
                      end={GRADIENTES.boton.end}
                      style={styles.btnPlanSeleccionado}
                    >
                      <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                      <Text style={styles.btnPlanSeleccionadoTexto}>
                        {t("reserva.planes.planSeleccionado", { defaultValue: "PLAN SELECCIONADO" })}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.btnPlanNoSeleccionado,
                        {
                          backgroundColor: c.oscuro ? c.bgCard : "#F1F5F9",
                          borderColor: c.border,
                        },
                      ]}
                    >
                      <Text style={[styles.btnPlanNoSeleccionadoTexto, { color: c.textSecondary }]}>
                        {t("reserva.planes.elegirPlan", { defaultValue: "ELEGIR PLAN" })}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
  
            {/* Footer de Total de Protección (siempre visible en la tarjeta padre) */}
            <View style={[styles.footerTotalTarjeta, { borderTopColor: c.border }]}>
              <Text style={[styles.footerTotalLabel, { color: c.textSecondary }]}>
                {seguroElegido
                  ? t("reserva.planes.totalProteccionNombre", {
                      nombre: t(`reserva.planes.nombreSeguro.${seguroElegido.nombre}`, {
                        defaultValue: seguroElegido.nombre,
                      }),
                      dias,
                      unidad:
                        dias === 1
                          ? t("reserva.planes.dia", { defaultValue: "día" })
                          : t("reserva.planes.dias", { defaultValue: "días" }),
                      defaultValue: `Total ${seguroElegido.nombre} (${dias} ${dias === 1 ? "día" : "días"})`,
                    })
                  : t("reserva.planes.totalPlanProteccion", {
                      dias,
                      unidad:
                        dias === 1
                          ? t("reserva.planes.dia", { defaultValue: "día" })
                          : t("reserva.planes.dias", { defaultValue: "días" }),
                      defaultValue: `Total plan de protección (${dias} ${dias === 1 ? "día" : "días"})`,
                    })}
              </Text>
              <Text style={[styles.footerTotalValor, { color: primaryAccent }]}>
                {formatPrecio(totalProteccion)}
              </Text>
            </View>
          </View>
  )
}
