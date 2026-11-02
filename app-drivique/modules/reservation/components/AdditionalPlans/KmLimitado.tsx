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

export default function KmLimitado({ actualizarPlanes, c, dias, kmIlimitado, kmLimitado, planes, primaryAccent, t, totalKilometraje }: { actualizarPlanes: (data: Partial<import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosPlanes>) => void; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; dias: number; kmIlimitado: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Tarifa | undefined; kmLimitado: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Tarifa | undefined; planes: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosPlanes; primaryAccent: string; t: any; totalKilometraje: number }) {
  return (
    <View style={[styles.card, { backgroundColor: c.bgCard, borderColor: c.border, marginTop: 16 }]}>
            {/* Header de la tarjeta padre */}
            <View style={styles.cardHeaderFila}>
              <Ionicons name="speedometer-outline" size={14} color={primaryAccent} />
              <Text style={[[styles.cardHeaderTitulo, { color: COLOR_MARCA }], { color: primaryAccent }]}>
                {t("reserva.planes.tipoKilometraje", { defaultValue: "Tipo de Kilometraje" })}
              </Text>
            </View>
  
            {/* Opción 1: Kilometraje limitado */}
            {kmLimitado && (
              <TouchableOpacity
                style={[
                  styles.opcionCard,
                  {
                    borderColor: c.border,
                    backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                  },
                  planes.tipoKilometraje === "limitado" && [
                    styles.opcionCardActiva,
                    { borderColor: primaryAccent },
                  ],
                ]}
                onPress={() => actualizarPlanes({ tipoKilometraje: "limitado" })}
                activeOpacity={0.88}
              >
                {/* Título */}
                <Text style={[styles.planNombreGrande, { color: c.textPrimary }]}>
                  {t("reserva.planes.kmLimitadoTitulo", { defaultValue: "Kilometraje limitado" })}
                </Text>
  
                {/* Descripción */}
                <Text style={[styles.kmDescripcionTexto, { color: c.textSecondary }]}>
                  {t("reserva.planes.kmLimitadoTexto", {
                    km: kmLimitado.km,
                    excedente: formatPrecio(kmLimitado.excedente ?? 800),
                    defaultValue: `Incluye ${kmLimitado.km} km por día dentro del valor de la tarifa. Si te pasas del límite, se cobra ${formatPrecio(kmLimitado.excedente ?? 800)} por cada km adicional.`,
                  })}
                </Text>
  
                {/* Precio diario */}
                <View style={styles.planPrecioRow}>
                  {kmLimitado.precio === 0 ? (
                    <Text style={[styles.planPrecioValor, { color: primaryAccent, fontSize: 15 }]}>
                      {t("vehiculo.includedInBaseRate", { defaultValue: "Incluido en la tarifa" })}
                    </Text>
                  ) : (
                    <>
                      <Text style={[styles.planPrecioValor, { color: primaryAccent }]}>
                        +{formatPrecio(kmLimitado.precio)}
                      </Text>
                      <Text style={[styles.planPrecioUnidad, { color: c.textMuted }]}>
                        {t("reserva.planes.porDia", { defaultValue: "/ día" })}
                      </Text>
                    </>
                  )}
                </View>
  
                {/* Botón Inferior: ELEGIR PLAN o PLAN SELECCIONADO */}
                {planes.tipoKilometraje === "limitado" ? (
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
            )}
  
            {/* Opción 2: Kilometraje ilimitado */}
            {kmIlimitado && (
              <TouchableOpacity
                style={[
                  styles.opcionCard,
                  {
                    borderColor: c.border,
                    backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                  },
                  planes.tipoKilometraje === "ilimitado" && [
                    styles.opcionCardActiva,
                    { borderColor: primaryAccent },
                  ],
                ]}
                onPress={() => actualizarPlanes({ tipoKilometraje: "ilimitado" })}
                activeOpacity={0.88}
              >
                {/* Título */}
                <Text style={[styles.planNombreGrande, { color: c.textPrimary }]}>
                  {t("reserva.planes.kmIlimitadoTitulo", { defaultValue: "Kilometraje ilimitado" })}
                </Text>
  
                {/* Descripción */}
                <Text style={[styles.kmDescripcionTexto, { color: c.textSecondary }]}>
                  {t("reserva.planes.kmIlimitadoTexto", {
                    defaultValue:
                      "Sin restricción de distancia dentro del territorio nacional. No aplica cobro adicional por exceso de kilómetros.",
                  })}
                </Text>
  
                {/* Precio diario */}
                <View style={styles.planPrecioRow}>
                  <Text style={[styles.planPrecioValor, { color: primaryAccent }]}>
                    +{formatPrecio(kmIlimitado.precio)}
                  </Text>
                  <Text style={[styles.planPrecioUnidad, { color: c.textMuted }]}>
                    {t("reserva.planes.porDia", { defaultValue: "/ día" })}
                  </Text>
                </View>
  
                {/* Botón Inferior: ELEGIR PLAN o PLAN SELECCIONADO */}
                {planes.tipoKilometraje === "ilimitado" ? (
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
            )}
  
            {/* Footer de Total de Kilometraje (siempre visible en la tarjeta padre) */}
            <View style={[styles.footerTotalTarjeta, { borderTopColor: c.border }]}>
              <Text style={[styles.footerTotalLabel, { color: c.textSecondary }]}>
                {t("reserva.planes.totalTipoKilometraje", {
                  dias,
                  unidad:
                    dias === 1
                      ? t("reserva.planes.dia", { defaultValue: "día" })
                      : t("reserva.planes.dias", { defaultValue: "días" }),
                  defaultValue: `Total tipo de kilometraje (${dias} ${dias === 1 ? "día" : "días"})`,
                })}
              </Text>
              <Text style={[styles.footerTotalValor, { color: primaryAccent }]}>
                {formatPrecio(totalKilometraje)}
              </Text>
            </View>
          </View>
  )
}
