import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from './AdditionalPlans.styles'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_MARCA, ICONOS_SERVICIOS, ICONO_SERVICIO_DEFECTO } from '../../constants/reservation.constants'
import { useMonedaStore } from '@/store/currencyStore'
import { formatCurrency } from '@/utils/currencyUtils'

function formatPrecio(precio: number): string {
  const { monedaActual, tasaUSD } = useMonedaStore.getState();
  return formatCurrency(precio, monedaActual, tasaUSD);
}

export default function Length2({ c, dias, planes, primaryAccent, t, todosLosServicios, toggleServicioAdicional, totalServicios }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; dias: number; planes: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosPlanes; primaryAccent: string; t: any; todosLosServicios: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").ServicioExtra[]; toggleServicioAdicional: (nombre: string) => void; totalServicios: number }) {
  return (
    <View style={[styles.card, { backgroundColor: c.bgCard, borderColor: c.border, marginTop: 16 }]}>
            {/* Header de la tarjeta padre */}
            <View style={styles.cardHeaderFila}>
              <Ionicons name="sparkles-outline" size={14} color={primaryAccent} />
              <Text style={[[styles.cardHeaderTitulo, { color: COLOR_MARCA }], { color: primaryAccent }]}>
                {t("reserva.planes.serviciosAdicionales", { defaultValue: "Servicios adicionales" })}
              </Text>
            </View>
  
            {/* Lista de servicios adicionales (dependientes de cada vehículo) */}
            {todosLosServicios.map((servicio) => {
              const seleccionado = planes.serviciosSeleccionados.includes(servicio.nombre);
              const icono = ICONOS_SERVICIOS[servicio.nombre] ?? ICONO_SERVICIO_DEFECTO;
  
              return (
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={t(`reserva.planes.nombreServicio.${servicio.nombre}`, { defaultValue: servicio.nombre })}
                  key={servicio.nombre}
                  style={[
                    styles.servicioCard,
                    {
                      borderColor: c.border,
                      backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                    },
                    seleccionado && [
                      styles.servicioCardActiva,
                      {
                        borderColor: primaryAccent,
                        backgroundColor: c.oscuro ? c.primaryBg : "#F0F7FF",
                      },
                    ],
                  ]}
                  onPress={() => toggleServicioAdicional(servicio.nombre)}
                  activeOpacity={0.8}
                >
                  <View style={styles.servicioIzquierdaRow}>
                    <Ionicons
                      name={seleccionado ? "checkbox" : "square-outline"}
                      size={16}
                      color={seleccionado ? primaryAccent : "#94A3B8"}
                    />
                    <Ionicons
                      name={icono as any}
                      size={14}
                      color={seleccionado ? primaryAccent : "#64748B"}
                      style={{ marginLeft: 8, marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.servicioNombre,
                        { color: c.textPrimary },
                        seleccionado && { fontWeight: "700" },
                      ]}
                      numberOfLines={2}
                    >
                      {t(`reserva.planes.nombreServicio.${servicio.nombre}`, { defaultValue: servicio.nombre })}
                    </Text>
                  </View>
  
                  {servicio.precio > 0 ? (
                    <View style={styles.servicioPrecioRow}>
                      <Text style={[styles.servicioPrecioValor, { color: primaryAccent }]}>
                        {formatPrecio(servicio.precio)}
                      </Text>
                      <Text style={[styles.servicioPrecioUnidad, { color: c.textMuted }]}>
                        {t("reserva.planes.porDia", { defaultValue: "/ día" })}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.servicioPrecioGratis, { color: "#16a34a" }]}>
                      {t("reserva.planes.gratis", { defaultValue: "Gratis" })}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
  
            {/* Footer de Total de Servicios Adicionales (siempre visible en la tarjeta padre) */}
            <View style={[styles.footerTotalTarjeta, { borderTopColor: c.border }]}>
              <Text style={[styles.footerTotalLabel, { color: c.textSecondary }]}>
                {t("reserva.planes.totalServiciosAdicionales", {
                  dias,
                  unidad:
                    dias === 1
                      ? t("reserva.planes.dia", { defaultValue: "día" })
                      : t("reserva.planes.dias", { defaultValue: "días" }),
                  defaultValue: `Total servicios adicionales (${dias} ${dias === 1 ? "día" : "días"})`,
                })}
              </Text>
              <Text style={[styles.footerTotalValor, { color: primaryAccent }]}>
                {formatPrecio(totalServicios)}
              </Text>
            </View>
          </View>
  )
}
