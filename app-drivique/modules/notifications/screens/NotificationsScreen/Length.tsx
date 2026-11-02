import { ScrollView, Text, View, Image, TouchableOpacity } from 'react-native'
import { styles } from '../notifications.styles'
import { formatCurrency } from '@/utils/currencyUtils'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { CuponPromocion } from '@/modules/notifications/types/promotion.types'

export default function Length({ appliedCoupons, c, cupones, daysUntilExpiry, formatDateShort, formatDateTime, getCouponVehicleImages, handleApplyCoupon, monedaActual, primaryAccent, setSelectedConditionsCoupon, t, tasaUSD, vehiculoPromos }: { appliedCoupons: string[]; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; cupones: CuponPromocion[]; daysUntilExpiry: (expiracion?: string) => number | null; formatDateShort: (isoString?: string) => string; formatDateTime: (isoString?: string) => string; getCouponVehicleImages: (_cpx: any) => string[]; handleApplyCoupon: (coupon: CuponPromocion) => void; monedaActual: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/utils/currencyUtils").Moneda; primaryAccent: string; setSelectedConditionsCoupon: any; t: any; tasaUSD: number; vehiculoPromos: { id: string; vehiculoId: number; titulo: string; descripcion: string; descuentoBadge?: string; fechaPublicacion: string; expiracion?: string; imagen: string; marcaModelo: string; }[] }) {
  return (
    <ScrollView style={styles.promosScroll} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
            {/* Section 1: Coupons Panel */}
            <Text style={[styles.promoSectionTitle, { color: c.textPrimary }]}>
              {t("tabs.masCuponesGeniales", "Más cupones geniales")}
            </Text>
  
            {cupones.map((cpx) => {
              const isApplied = appliedCoupons.includes(cpx.codigo);
              const carImages = getCouponVehicleImages(cpx);
  
  
              // Calculate coupon text dynamically
              const discountLabel =
                cpx.descuentoPorcentaje
                  ? `${cpx.descuentoPorcentaje}% OFF`
                  : (cpx.descuentoFijo || cpx.valorFijo)
                  ? `${formatCurrency((cpx.descuentoFijo || cpx.valorFijo) ?? 0, monedaActual, tasaUSD)} OFF`
                  : cpx.descuentoTexto;
  
              const ruleLabel = cpx.regla === "Todos los vehículos"
                ? t("coupon.todosLosVehiculos", { defaultValue: "Todos los vehículos" })
                : t(cpx.regla || "", { defaultValue: cpx.regla || "" });
  
              return (
                <View key={cpx.id} style={styles.ticketWrapper}>
                  {/* Ticket card */}
                  <View style={[styles.couponCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
  
                    {/* OUTER notches (left + right edges) */}
                    <View style={[styles.notchLeft, { backgroundColor: c.bg }]} />
                    <View style={[styles.notchRight, { backgroundColor: c.bg }]} />
  
                    {/* Left Side */}
                    <View style={styles.couponLeft}>
                      {/* Title row */}
                      <View style={styles.couponTitleRow}>
                        <Ionicons name="ticket-outline" size={14} color={primaryAccent} style={{ marginRight: 4, marginTop: 1 }} />
                        <Text style={[styles.couponTitlePremio, { color: c.textPrimary }]} numberOfLines={2}>
                          {t(cpx.tituloPremio, { defaultValue: cpx.tituloPremio })}
                        </Text>
                      </View>
  
                      {/* Real vehicle photos - bigger */}
                      <View style={styles.couponImagesRow}>
                        {carImages.map((imgUrl, idx) => (
                          <View key={idx} style={[styles.couponCarMiniWrapper, { backgroundColor: c.bgInput }]}>
                            {imgUrl ? (
                              <Image source={{ uri: imgUrl }} style={styles.couponCarMiniImage} resizeMode="cover" />
                            ) : (
                              <Ionicons name="car-outline" size={22} color={c.textMuted} />
                            )}
                          </View>
                        ))}
                      </View>
  
                      {/* Bottom: date + conditions */}
                      <View style={styles.couponConditionRow}>
                        <View style={{ flex: 1 }}>
                          {cpx.agotandose && (
                            <Text style={styles.expiringText}>
                              {t("coupon.almostGone", { defaultValue: "¡Por agotarse!" })}
                            </Text>
                          )}
                          <Text style={[styles.couponDateText, { color: c.textMuted }]}>
                            {formatDateShort(cpx.fechaOtorgado)}
                          </Text>
                        </View>
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("coupon.conditions", { defaultValue: "Condiciones" })} onPress={() => setSelectedConditionsCoupon(cpx)}>
                          <Text style={styles.conditionsLink}>
                            {t("coupon.conditions", { defaultValue: "Condiciones" })}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
  
                    {/* Dotted Separator with INNER notches (top + bottom of separator) */}
                    <View style={styles.separatorContainer}>
                      <View style={[styles.innerNotchTop, { backgroundColor: c.bg }]} />
                      <View style={[styles.dashedSeparator, { borderColor: c.border }]} />
                      <View style={[styles.innerNotchBottom, { backgroundColor: c.bg }]} />
                    </View>
  
                    {/* Right Side */}
                    <View style={[styles.couponRight, { backgroundColor: c.oscuro ? "#1e3a8a22" : "#EFF6FF" }]}>
                      <Text style={[styles.couponDiscount, { color: "#1D4ED8" }]}>
                        {discountLabel}
                      </Text>
                      <Text style={[styles.couponRule, { color: c.textMuted }]}>
                        {ruleLabel}
                      </Text>
                      <TouchableOpacity accessibilityRole="button"
                        style={[
                          styles.couponApplyBtn,
                          isApplied && { backgroundColor: c.bgInput },
                        ]}
                        onPress={() => handleApplyCoupon(cpx)}
                        disabled={isApplied}
                      >
                        <Text style={[styles.couponApplyBtnText, { color: isApplied ? c.textMuted : "#FFFFFF" }]}>
                          {isApplied ? t("coupon.appliedCheck", { defaultValue: "✓ Aplicado" }) : t("coupon.applyBtnSimple", { defaultValue: "Aplicar" })}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
  
            {/* Section 2: Specific Car Promos */}
            <Text style={[styles.promoSectionTitle, { color: c.textPrimary, marginTop: 24 }]}>
              {t("notificaciones.promocionesDestacadas", { defaultValue: "Promociones destacadas" })}
            </Text>
  
            {vehiculoPromos.map((vp) => (
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={t(vp.titulo, { defaultValue: vp.titulo })}
                key={vp.id}
                style={[styles.vehiculoPromoCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
                onPress={() => {
                  const pctMatch = vp.descuentoBadge ? vp.descuentoBadge.match(/\d+/) : null;
                  const pct = pctMatch ? pctMatch[0] : "10";
                  router.push({
                    pathname: "/vehicle/[id]",
                    params: {
                      id: vp.vehiculoId.toString(),
                      descuentoPorcentaje: pct,
                    },
                  } as any);
                }}
                activeOpacity={0.88}
              >
                <View style={[styles.vehiculoPromoImageWrapper, { backgroundColor: c.bgInput }]}>
                  <Image source={{ uri: vp.imagen }} style={styles.vehiculoPromoImage} resizeMode="cover" />
                </View>
                <View style={styles.vehiculoPromoContent}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                    <Text style={[styles.vehiculoPromoTitle, { color: c.textPrimary, flex: 1 }]} numberOfLines={2}>
                      {t(vp.titulo, { defaultValue: vp.titulo })}
                    </Text>
                    {vp.descuentoBadge ? (
                      <View style={[styles.descuentoBadge, { backgroundColor: c.oscuro ? "#78350f" : "#FEF3C7", borderColor: c.oscuro ? "#b45309" : "#FDE68A" }]}>
                        <Text style={[styles.descuentoBadgeText, { color: c.oscuro ? "#fbbf24" : "#B45309" }]}>{vp.descuentoBadge}</Text>
                      </View>
                    ) : null}
                  </View>
  
                  <Text style={[styles.vehiculoPromoModelo, { color: primaryAccent }]} numberOfLines={1}>
                    {vp.marcaModelo}
                  </Text>
  
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={11} color={c.textMuted} style={{ marginRight: 3 }} />
                    <Text style={[styles.time, { color: c.textMuted }]}>
                      {formatDateTime(vp.fechaPublicacion)}
                    </Text>
                  </View>
                  {(() => {
                    const d = daysUntilExpiry(vp.expiracion);
                    if (d === null || d <= 0) return null;
                    return (
                      <View style={[
                        styles.expiryPill,
                        { backgroundColor: d <= 2 ? (c.oscuro ? "#450a0a" : "#FEF2F2") : (c.oscuro ? "#451a03" : "#FFFBEB"), borderColor: d <= 2 ? (c.oscuro ? "#7f1d1d" : "#FECACA") : (c.oscuro ? "#78350f" : "#FDE68A") },
                      ]}>
                        <Ionicons
                          name="hourglass-outline"
                          size={10}
                          color={d <= 2 ? "#EF4444" : "#F59E0B"}
                          style={{ marginRight: 3 }}
                        />
                        <Text style={[styles.expiryPillText, { color: d <= 2 ? (c.oscuro ? "#f87171" : "#DC2626") : (c.oscuro ? "#fbbf24" : "#D97706") }]}>
                          {d === 1 ? t("notificaciones.venceHoy", { defaultValue: "Vence hoy" }) : t("notificaciones.venceEnDias", { defaultValue: `Vence en ${d} días`, count: d, dias: d })}
                        </Text>
                      </View>
                    );
                  })()}
                  <Text style={[styles.vehiculoPromoDesc, { color: c.textSecondary, marginTop: 4 }]} numberOfLines={2}>
                    {t(vp.descripcion, { defaultValue: vp.descripcion })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
  )
}
