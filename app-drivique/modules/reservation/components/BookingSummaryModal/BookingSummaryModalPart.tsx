import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { styles } from './BookingSummaryModal.styles'
import EditDatesLocationSection from '../EditDatesLocationSection'
import EditProtectionMileageSection from '../EditProtectionMileageSection'
import EditAdditionalServicesSection from '../EditAdditionalServicesSection'
import { LinearGradient } from 'expo-linear-gradient'
import { GRADIENTES } from '@/constants/gradients'
import { Ionicons } from '@expo/vector-icons'
import { formatHoraAmPm } from '../../constants/reservation.constants'
import { fmt, fmtPct } from '../BookingSummaryModal.pieces'
import React from 'react'
import { Vehiculo } from '@/modules/catalog/types/catalog.types'

export default function BookingSummaryModalPart({ c, cotizacion, cuponAplicado, desglose, diasContrato, fechasLugar, formatFechaResumen, getLugarLabel, handleCerrar, infoDuracion, insets, labelKm, onEditarSeccion, permitirEditar, planes, primaryAccent, proteccionTexto, seccionEditando, seguroElegido, serviciosElegidosDetalle, setSeccionEditando, t, vehiculo }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; cotizacion: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/services/pricingService").PriceQuoteResponseDTO | null; cuponAplicado: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").Cupon | null; desglose: { dias: number; diasCalc: number; diarias: number; proteccion: number; kilometraje: number; servAdic: number; cargos: number; recargoLogistico: number; subtotalBruto: number; descuentoCupon: number; subtotal: number; iva: number; total: number; }; diasContrato: number; fechasLugar: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosFechasLugar; formatFechaResumen: (fechaStr: string | null | undefined) => string; getLugarLabel: (lugar: string | undefined | null, modo: 'entrega' | 'devolucion') => string; handleCerrar: () => void; infoDuracion: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/constants/reservation.constants").InfoDuracionAlquiler | null; insets: any; labelKm: string; onEditarSeccion: ((seccion: 'fechas' | 'planes' | 'servicios') => void) | undefined; permitirEditar: boolean; planes: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosPlanes; primaryAccent: string; proteccionTexto: string; seccionEditando: 'fechas' | 'planes' | 'servicios' | null; seguroElegido: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Seguro | null; serviciosElegidosDetalle: { nombre: string; nombreTraducido: string; precioDia: number; totalCalculado: number; }[]; setSeccionEditando: React.Dispatch<React.SetStateAction<'fechas' | 'planes' | 'servicios' | null>>; t: any; vehiculo: Vehiculo }) {
  return (
    <View style={[styles.container, { backgroundColor: c.bg, paddingTop: insets.top || 16 }]}>
          {seccionEditando === "fechas" ? (
            <EditDatesLocationSection
              vehiculo={vehiculo}
              onGuardar={() => setSeccionEditando(null)}
              onCancelar={() => setSeccionEditando(null)}
            />
          ) : seccionEditando === "planes" ? (
            <EditProtectionMileageSection
              vehiculo={vehiculo}
              onGuardar={() => setSeccionEditando(null)}
              onCancelar={() => setSeccionEditando(null)}
            />
          ) : seccionEditando === "servicios" ? (
            <EditAdditionalServicesSection
              vehiculo={vehiculo}
              onGuardar={() => setSeccionEditando(null)}
              onCancelar={() => setSeccionEditando(null)}
            />
          ) : (
            <>
              {/* Header Modal */}
              <View style={styles.header}>
                <View style={styles.headerTitleWrap}>
                  <LinearGradient
                    colors={GRADIENTES.boton.colors}
                    start={GRADIENTES.boton.start}
                    end={GRADIENTES.boton.end}
                    style={styles.badgeIcon}
                  >
                    <Ionicons name="document-text" size={16} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.headerTitulo, { color: c.textPrimary }]}>
                    {t("reserva.resumen.titulo", { defaultValue: "Resumen de tu Reserva" })}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleCerrar}
                  hitSlop={10}
                  style={[styles.closeBtn, { backgroundColor: c.oscuro ? c.bgInput : "#F1F5F9", borderColor: c.border }]}
                >
                  <Ionicons name="close" size={16} color={c.textSecondary} />
                </TouchableOpacity>
              </View>
  
              <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.cardMaestra, { backgroundColor: c.bgCard, borderColor: c.border }]}>
                  {/* Banner Superior Azul Degradado */}
                  <LinearGradient
                    colors={GRADIENTES.boton.colors}
                    start={GRADIENTES.boton.start}
                    end={GRADIENTES.boton.end}
                    style={styles.vehiculoBanner}
                  >
                    <Text style={styles.vehiculoBannerLabel}>
                      {t("reserva.resumen.subtitulo", { defaultValue: "Resumen de tu reserva" })}
                    </Text>
                    <Text style={styles.vehiculoBannerNombre}>{vehiculo.nombre}</Text>
                  </LinearGradient>
  
              {/* SECCIÓN 1: FECHAS Y LUGARES */}
              <View style={styles.seccionCard}>
                <View style={styles.seccionHeaderFila}>
                  <Text style={[styles.seccionTituloAzul, { color: primaryAccent }]}>
                    {t("reserva.resumen.fechasYLugares", { defaultValue: "FECHAS Y UBICACIÓN" })}
                  </Text>
                  {permitirEditar && (
                    <TouchableOpacity
                      onPress={() => {
                        onEditarSeccion ? onEditarSeccion("fechas") : setSeccionEditando("fechas");
                      }}
                      hitSlop={8}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.seccionEditarTexto, { color: primaryAccent }]}>
                        {t("reserva.resumen.editar", { defaultValue: "Editar" })}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
  
                {/* LUGAR DE ENTREGA */}
                <View style={styles.bloqueDato}>
                  <Text style={[styles.sublabel, { color: c.textMuted }]}>
                    {t("reserva.resumen.lugarDeEntrega", { defaultValue: "LUGAR DE ENTREGA" })}
                  </Text>
                  <Text style={[styles.valorPrincipal, { color: c.textPrimary }]}>
                    {formatFechaResumen(fechasLugar.fechaRetiro)}
                  </Text>
                  <Text style={[styles.valorSecundario, { color: c.textMuted }]}>
                    {fechasLugar.horaRetiro ? formatHoraAmPm(fechasLugar.horaRetiro) : "--:--"}
                  </Text>
                  <Text style={[styles.valorUbicacion, { color: c.textPrimary }]}>
                    {getLugarLabel(fechasLugar.lugarRetiro, "entrega")}
                  </Text>
                </View>
  
                {/* Divisor Punteado */}
                <View style={[styles.divisorPunteado, { borderColor: c.oscuro ? "#334155" : "#E2E8F0" }]} />
  
                {/* LUGAR DE DEVOLUCIÓN */}
                <View style={styles.bloqueDato}>
                  <Text style={[styles.sublabel, { color: c.textMuted }]}>
                    {t("reserva.resumen.lugarDeDevolucion", { defaultValue: "LUGAR DE DEVOLUCIÓN" })}
                  </Text>
                  <Text style={[styles.valorPrincipal, { color: c.textPrimary }]}>
                    {formatFechaResumen(fechasLugar.fechaDevolucion)}
                  </Text>
                  <Text style={[styles.valorSecundario, { color: c.textMuted }]}>
                    {fechasLugar.horaDevolucion ? formatHoraAmPm(fechasLugar.horaDevolucion) : "--:--"}
                  </Text>
                  <Text style={[styles.valorUbicacion, { color: c.textPrimary }]}>
                    {getLugarLabel(fechasLugar.lugarDevolucion, "devolucion")}
                  </Text>
  
                  {!!infoDuracion?.subtituloAnticipada && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                      <Ionicons name="time-outline" size={13} color={primaryAccent} />
                      <Text style={{ fontSize: 11.5, fontWeight: "600", color: primaryAccent, marginLeft: 4 }}>
                        {infoDuracion.subtituloAnticipada}
                      </Text>
                    </View>
                  )}
                </View>
  
                {/* Aviso de puntualidad en resumen */}
                <View
                  style={[
                    styles.avisoPuntualidadResumen,
                    {
                      backgroundColor: c.oscuro ? "rgba(245, 158, 11, 0.08)" : "#FFFBEB",
                      borderColor: c.oscuro ? "rgba(245, 158, 11, 0.25)" : "#FEF3C7",
                    },
                  ]}
                >
                  <Ionicons name="time-outline" size={13} color={c.oscuro ? "#FBBF24" : "#D97706"} style={{ marginTop: 1 }} />
                  <Text style={[styles.avisoPuntualidadResumenTexto, { color: c.oscuro ? "#FDE68A" : "#92400E" }]}>
                    {t("reserva.terminos.politicaDevolucionResumen", {
                      defaultValue: "30 minutos de cortesía para devolución. Demoras posteriores generan cobro automático de tiempo extra.",
                    })}
                  </Text>
                </View>
              </View>
  
              {/* Divisor Sólido */}
              <View style={[styles.divisorSolido, { backgroundColor: c.border }]} />
  
              {/* SECCIÓN 2: TU PROTECCIÓN Y EXTRAS */}
              <View style={styles.seccionCard}>
                <View style={styles.seccionHeaderFila}>
                  <Text style={[styles.seccionTituloAzul, { color: primaryAccent }]}>
                    {t("reserva.resumen.tuProteccionYExtras", { defaultValue: "TU PROTECCIÓN Y EXTRAS" })}
                  </Text>
                  {permitirEditar && (
                    <TouchableOpacity
                      onPress={() => {
                        onEditarSeccion ? onEditarSeccion("planes") : setSeccionEditando("planes");
                      }}
                      hitSlop={8}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.seccionEditarTexto, { color: primaryAccent }]}>
                        {t("reserva.resumen.editar", { defaultValue: "Editar" })}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
  
                {/* PROTECCIONES */}
                <View style={styles.bloqueDato}>
                  <Text style={[styles.sublabel, { color: c.textMuted }]}>
                    {t("reserva.resumen.protecciones", { defaultValue: "PROTECCIONES" })}
                  </Text>
                  <Text style={[styles.valorPrincipal, { color: c.textPrimary }]}>{proteccionTexto}</Text>
                </View>
  
                {/* TIPO DE KILOMETRAJE */}
                <View style={[styles.bloqueDato, { marginTop: 12 }]}>
                  <Text style={[styles.sublabel, { color: c.textMuted }]}>
                    {t("reserva.resumen.tipoDeKilometrajeMayus", { defaultValue: "TIPO DE KILOMETRAJE" })}
                  </Text>
                  <Text style={[styles.valorPrincipal, { color: c.textPrimary }]}>{labelKm}</Text>
                </View>
  
                {/* SERVICIOS ADICIONALES */}
                <View style={[styles.bloqueDato, { marginTop: 12 }]}>
                  <View style={styles.seccionSubHeaderFila}>
                    <Text style={[styles.sublabel, { color: c.textMuted }]}>
                      {t("reserva.resumen.serviciosAdicionalesMayus", { defaultValue: "SERVICIOS ADICIONALES" })}
                    </Text>
                    {permitirEditar && (
                      <TouchableOpacity
                        onPress={() => {
                          onEditarSeccion ? onEditarSeccion("servicios") : setSeccionEditando("servicios");
                        }}
                        hitSlop={8}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.seccionEditarTexto, { color: primaryAccent }]}>
                          {t("reserva.resumen.editar", { defaultValue: "Editar" })}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
  
                  {serviciosElegidosDetalle.length > 0 ? (
                    <View style={styles.listaServiciosExtras}>
                      {serviciosElegidosDetalle.map((serv) => (
                        <View key={serv.nombre} style={styles.filaServicioExtra}>
                          <View style={styles.filaServicioExtraIzq}>
                            <Text style={[styles.servicioExtraNombre, { color: c.textPrimary }]}>
                              {serv.nombreTraducido}
                              {diasContrato > 1 ? (
                                <Text style={[styles.servicioExtraDias, { color: c.textMuted }]}>
                                  {` (${diasContrato} ${diasContrato === 1 ? t("reserva.resumen.diaSingular", { defaultValue: "día" }) : t("reserva.resumen.diaPlural", { defaultValue: "días" })})`}
                                </Text>
                              ) : null}
                            </Text>
                          </View>
                          <Text style={[styles.servicioExtraPrecio, { color: c.textPrimary }]}>
                            {fmt(serv.totalCalculado)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={[styles.valorPrincipal, { color: c.textPrimary }]}>
                      {t("reserva.resumen.ninguno", { defaultValue: "Ninguno" })}
                    </Text>
                  )}
                </View>
              </View>
  
  
  
              {/* SECCIÓN: DESGLOSE DE TARIFA */}
              <View style={[styles.divisorSolido, { backgroundColor: c.border }]} />
              <View style={styles.seccionCard}>
                <Text style={[styles.desgloseTitulo, { color: c.textPrimary }]}>
                  {t("reserva.resumen.desgloseDeTarifa", { defaultValue: "DESGLOSE DE TARIFA" })}
                </Text>
  
                {/* Fila 1: Tarifa Base de Alquiler */}
                <View style={styles.filaDesglose}>
                  <Text style={[styles.filaDesgloseLabel, { color: c.textSecondary }]}>
                    {t("reserva.resumen.diarias", { defaultValue: "Diarias de alquiler" })}
                    {desglose.diasCalc > 1 ? t("extra.resumen.diasEntre", { n: desglose.dias }) : ""}
                  </Text>
                  <Text style={[styles.filaDesgloseValor, { color: c.textPrimary }]}>
                    {fmt(desglose.diarias)}
                  </Text>
                </View>
  
                {/* Fila 2: Kilometraje (si se seleccionó en flujo 2, o dash si no) */}
                <View style={styles.filaDesglose}>
                  <Text style={[styles.filaDesgloseLabel, { color: c.textSecondary }]}>
                    {planes.tipoKilometraje
                      ? (planes.tipoKilometraje === "ilimitado"
                          ? t("reserva.planes.kmIlimitadoTitulo", { defaultValue: "Kilometraje ilimitado" })
                          : t("reserva.planes.kmLimitadoTitulo", { defaultValue: "Kilometraje limitado" }))
                      : t("reserva.resumen.kilometraje", { defaultValue: "Kilometraje" })}
                  </Text>
                  <Text style={[styles.filaDesgloseValor, { color: c.textPrimary }]}>
                    {planes.tipoKilometraje
                      ? (desglose.kilometraje > 0
                          ? fmt(desglose.kilometraje)
                          : t("reserva.resumen.incluido", { defaultValue: "Incluido" }))
                      : "-"}
                  </Text>
                </View>
  
                {/* Fila 3: Protección (si se seleccionó en flujo 2, o dash si no) */}
                <View style={styles.filaDesglose}>
                  <Text style={[styles.filaDesgloseLabel, { color: c.textSecondary }]}>
                    {seguroElegido
                      ? t(`reserva.planes.nombreSeguro.${planes.proteccion}`, { defaultValue: planes.proteccion })
                      : t("reserva.resumen.protecciones", { defaultValue: "Protecciones" })}
                  </Text>
                  <Text style={[styles.filaDesgloseValor, { color: c.textPrimary }]}>
                    {seguroElegido ? fmt(desglose.proteccion) : "-"}
                  </Text>
                </View>
  
                {/* Fila 4: Servicios adicionales (consolidado en desglose de tarifa) */}
                <View style={styles.filaDesglose}>
                  <Text style={[styles.filaDesgloseLabel, { color: c.textSecondary }]}>
                    {t("reserva.resumen.serviciosAdicionalesMayus", { defaultValue: "Servicios adicionales" })}
                  </Text>
                  <Text style={[styles.filaDesgloseValor, { color: c.textPrimary }]}>
                    {desglose.servAdic > 0 ? fmt(desglose.servAdic) : "—"}
                  </Text>
                </View>
  
                {cotizacion && (
                  <>
                    <View style={styles.filaDesglose}>
                      <Text style={[styles.filaDesgloseLabel, { color: c.textSecondary }]}>
                        {t("reserva.resumen.cargosAdministrativos", {
                          pct: fmtPct(Number(cotizacion.adminFeeRate)),
                          defaultValue: `Cargos administrativos (${fmtPct(Number(cotizacion.adminFeeRate))})`,
                        })}
                      </Text>
                      <Text style={[styles.filaDesgloseValor, { color: c.textPrimary }]}>
                        {fmt(desglose.cargos)}
                      </Text>
                    </View>
  
                    <View style={[styles.divisorFino, { backgroundColor: c.border }]} />
  
                    <View style={styles.filaDesglose}>
                      <Text style={[styles.filaDesgloseLabel, { color: c.textSecondary }]}>
                        {t("reserva.resumen.iva", {
                          pct: fmtPct(Number(cotizacion.vatRate)),
                          defaultValue: `IVA (${fmtPct(Number(cotizacion.vatRate))})`,
                        })}
                      </Text>
                      <Text style={[styles.filaDesgloseValor, { color: c.textPrimary }]}>
                        {fmt(desglose.iva)}
                      </Text>
                    </View>
                  </>
                )}
  
                {/* Descuento Cupón si aplica */}
                {desglose.descuentoCupon > 0 && cuponAplicado && (
                  <View style={styles.filaDesglose}>
                    <Text style={[styles.filaDesgloseLabel, { color: "#16A34A" }]}>
                      {`${t("coupon.discountLabel", { defaultValue: "Descuento" })} (${cuponAplicado.codigo})`}
                    </Text>
                    <Text style={[styles.filaDesgloseValor, { color: "#16A34A" }]}>
                      {`-${fmt(desglose.descuentoCupon)}`}
                    </Text>
                  </View>
                )}
  
                {/* Card Total Final */}
                <View
                  style={[
                    styles.totalBoxCard,
                    {
                      backgroundColor: c.oscuro ? c.bgInput : "#F8FAFC",
                      borderColor: c.oscuro ? "#334155" : "#E2E8F0",
                    },
                  ]}
                >
                  <Text style={[styles.totalFinalLabel, { color: primaryAccent }]}>
                    {t("reserva.resumen.totalFinal", { defaultValue: "TOTAL FINAL" })}
                  </Text>
                  <Text style={[styles.totalFinalValor, { color: c.textPrimary }]}>{fmt(desglose.total)}</Text>
                  <Text style={[styles.totalFinalSub, { color: c.textMuted }]}>
                    {t("reserva.resumen.elTotalFinalIncluye", {
                      defaultValue: "El total final incluye IVA y cargos adicionales",
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
  
          {/* Footer con Botón Cerrar */}
          <View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.bg, paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity style={styles.cerrarBtnWrap} onPress={handleCerrar} activeOpacity={0.85}>
              <LinearGradient
                colors={GRADIENTES.boton.colors}
                start={GRADIENTES.boton.start}
                end={GRADIENTES.boton.end}
                style={styles.cerrarBtn}
              >
                <Text style={styles.cerrarBtnText}>
                  {t("reserva.resumen.cerrar", { defaultValue: "Cerrar" })}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
            </>
          )}
        </View>
  )
}
