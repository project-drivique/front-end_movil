import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTemaColores } from '@/modules/i18n/hooks/useLanguage'
import { useTranslation } from 'react-i18next'
import { COLOR_ACENTO, COLOR_ENLACE } from '@/constants/brandPalette'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, Notificacion } from '@/store/notificationStore'
import { useMonedaStore } from '@/store/currencyStore'
import { useState, useEffect, useMemo } from 'react'
import { CuponPromocion } from '@/modules/notifications/types/promotion.types'
import { pricingService } from '@/modules/reservation/services/pricingService'
import { formatCurrency } from '@/utils/currencyUtils'
import { TouchableOpacity, View, Text } from 'react-native'
import { styles } from '../notifications.styles'
import { Ionicons } from '@expo/vector-icons'

export default function useNotificationsScreenLogic1() {
  const insets = useSafeAreaInsets();
    const c = useTemaColores();
    const { t, i18n } = useTranslation();
    const primaryAccent = c.oscuro ? COLOR_ACENTO : COLOR_ENLACE;
    const usuario = useAuthStore((s) => s.usuario);
  
    const {
      notificaciones,
      cargando,
      marcarComoLeida,
      marcarTodasComoLeidas,
      cargarNotificaciones,
    } = useNotificationStore();
    const monedaActual = useMonedaStore((s) => s.monedaActual);
    const tasaUSD = useMonedaStore((s) => s.tasaUSD);
  
    const [activeTab, setActiveTab] = useState<"general" | "promocion">("general");
    const [appliedCoupons, setAppliedCoupons] = useState<string[]>([]);
    const [refreshing, setRefreshing] = useState(false);
  
    // Modal states
    const [selectedConditionsCoupon, setSelectedConditionsCoupon] = useState<CuponPromocion | null>(null);
    const [activeAppliedCoupon, setActiveAppliedCoupon] = useState<CuponPromocion | null>(null);
    const [activePendingCoupon, setActivePendingCoupon] = useState<CuponPromocion | null>(null);
    const [selectedNotification, setSelectedNotification] = useState<Notificacion | null>(null);
  
    // Carga inicial y reactiva de notificaciones reales del backend
    useEffect(() => {
      if (usuario) {
        cargarNotificaciones(true);
      }
    }, [usuario]);
  
    const handleRefresh = async () => {
      setRefreshing(true);
      await cargarNotificaciones(true);
      setRefreshing(false);
    };
  
    /** Filtra items cuya fecha de expiracion ya paso */
    const isExpired = (expiracion?: string) => {
      if (!expiracion) return false;
      return new Date(expiracion) < new Date();
    };
  
    // Notificaciones generales sin expiradas
    const generalNotifications = useMemo(
      () =>
        notificaciones.filter(
          (n) => n.tipo === "general" && !isExpired(n.expiracion)
        ),
      [notificaciones]
    );
  
    const [promociones, setPromociones] = useState<CuponPromocion[]>([]);
  
    useEffect(() => {
      if (!usuario) return;
      pricingService
        .getPublishedPromotions()
        .then((lista) =>
          setPromociones(
            lista.map((p: any) => {
              const esPorcentaje = String(p.discountType).toUpperCase().includes("PERCENT");
              const valor = Number(p.discountValue);
              return {
                id: String(p.id),
                codigo: p.code,
                descuentoTexto: esPorcentaje ? `${valor}%` : formatCurrency(valor, monedaActual, tasaUSD),
                descuentoPorcentaje: esPorcentaje ? valor : undefined,
                descuentoFijo: esPorcentaje ? undefined : valor,
                tituloPremio: p.name || p.code,
                recompensaDetalle: p.conditions || "",
                condicionesDetalladas: p.conditions || "",
                minimoValor: Number(p.minimumAmount) || undefined,
                categoria: p.vehicleCategoryName || undefined,
                fechaOtorgado: p.createdAt,
                expiracion: `${p.endDate}T23:59:59`,
                fechaExpiracion: `${p.endDate}T23:59:59`,
              } as CuponPromocion;
            }),
          ),
        )
        .catch(() => setPromociones([]));
    }, [usuario, monedaActual, tasaUSD]);
  
    const cupones = useMemo(
      () => promociones.filter((c) => !isExpired(c.fechaExpiracion || c.expiracion)),
      [promociones]
    );
  
    const vehiculoPromos: {
      id: string;
      vehiculoId: number;
      titulo: string;
      descripcion: string;
      descuentoBadge?: string;
      fechaPublicacion: string;
      expiracion?: string;
      imagen: string;
      marcaModelo: string;
    }[] = [];
  
    const handleApplyCoupon = (coupon: CuponPromocion) => {
      if (appliedCoupons.includes(coupon.codigo)) return;
      setActivePendingCoupon(coupon);
    };
  
    const confirmApplyCoupon = () => {
      if (!activePendingCoupon) return;
      setAppliedCoupons([...appliedCoupons, activePendingCoupon.codigo]);
      setActiveAppliedCoupon(activePendingCoupon);
      setActivePendingCoupon(null);
    };
  
    const handleGeneralPress = (item: Notificacion) => {
      if (!item.leido) {
        marcarComoLeida(item.id);
      }
      setSelectedNotification(item);
    };
  
    const getCouponVehicleImages = (_cpx: any): string[] => [];
  
    const getLocale = () => {
      const lang = (i18n.language || "es").toLowerCase();
      if (lang.startsWith("pt") || lang.startsWith("br")) return "pt-BR";
      if (lang.startsWith("fr")) return "fr-FR";
      if (lang.startsWith("en")) return "en-US";
      return "es-CO";
    };
  
    // Helper: Format ISO date -> human readable date + time
    const formatDateTime = (isoString?: string) => {
      if (!isoString) return "";
      try {
        const date = new Date(isoString);
        return date.toLocaleDateString(getLocale(), {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return "";
      }
    };
  
    // Helper: format only date for coupons (shorter)
    const formatDateShort = (isoString?: string) => {
      if (!isoString) return "";
      try {
        const date = new Date(isoString);
        return date.toLocaleDateString(getLocale(), {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch {
        return "";
      }
    };
  
    // Helper: days until expiry
    const daysUntilExpiry = (expiracion?: string) => {
      if (!expiracion) return null;
      const diff = new Date(expiracion).getTime() - Date.now();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };
  
    const renderGeneralItem = ({ item }: { item: Notificacion }) => {
      const isUnread = !item.leido;
      // Use item.icono if present, fallback by keyword detection
      const iconName = item.icono ||
        (item.titulo.toLowerCase().includes("pago") ? "card-outline" :
         item.titulo.toLowerCase().includes("documento") ? "document-text-outline" :
         item.titulo.toLowerCase().includes("soporte") ? "chatbubble-ellipses-outline" :
         item.titulo.toLowerCase().includes("cancel") ? "close-circle-outline" :
         item.titulo.toLowerCase().includes("vencer") ? "time-outline" :
         "notifications-outline");
      const iconColor = item.iconoColor ||
        (item.icono === "card-outline" ? "#3B82F6" :
         item.icono === "time-outline" ? "#F59E0B" :
         item.icono === "document-text-outline" ? "#10B981" :
         item.icono === "chatbubble-ellipses-outline" ? "#8B5CF6" :
         "#2563EB");
      const dias = daysUntilExpiry(item.expiracion);
  
      return (
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t(item.titulo, { defaultValue: item.titulo })}
          style={[
            styles.generalCard,
            {
              backgroundColor: c.bgCard,
              borderColor: c.border,
            },
            isUnread && { borderLeftColor: "#2563EB", borderLeftWidth: 4 },
          ]}
          onPress={() => handleGeneralPress(item)}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrapper, { backgroundColor: c.bgInput }]}>
              <Ionicons name={iconName as any} size={22} color={iconColor} />
            </View>
            <View style={styles.contentWrapper}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                <Text style={[styles.title, { color: c.textPrimary, flex: 1 }, isUnread && styles.unreadText]}>
                  {t(item.titulo, { defaultValue: item.titulo })}
                </Text>
                {item.criticidad && item.criticidad !== "NORMAL" && (
                  <View style={[
                    styles.criticalityBadge,
                    {
                      backgroundColor: item.criticidad === "HIGH" ? (c.oscuro ? "#450a0a" : "#FEF2F2") : (c.oscuro ? "#172554" : "#EFF6FF"),
                      borderColor: item.criticidad === "HIGH" ? "#EF4444" : "#3B82F6",
                    }
                  ]}>
                    <Text style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: item.criticidad === "HIGH" ? "#DC2626" : "#2563EB",
                    }}>
                      {item.criticidad}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={11} color={c.textMuted} style={{ marginRight: 3 }} />
                <Text style={[styles.time, { color: c.textMuted }]}>
                  {formatDateTime(item.fecha)}
                </Text>
              </View>
              {dias !== null && dias > 0 && (
                <View style={[
                  styles.expiryPill,
                  { backgroundColor: dias <= 2 ? "#FEF2F2" : "#FFFBEB", borderColor: dias <= 2 ? "#FECACA" : "#FDE68A" },
                ]}>
                  <Ionicons
                    name="hourglass-outline"
                    size={10}
                    color={dias <= 2 ? "#DC2626" : "#D97706"}
                    style={{ marginRight: 3 }}
                  />
                  <Text style={[styles.expiryPillText, { color: dias <= 2 ? "#DC2626" : "#D97706" }]}>
                    {dias === 1 ? t("notificaciones.venceHoy", { defaultValue: "Vence hoy" }) : t("notificaciones.venceEnDias", { defaultValue: `Vence en ${dias} días`, count: dias, dias })}
                  </Text>
                </View>
              )}
            </View>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            {t(item.mensaje, { defaultValue: item.mensaje })}
          </Text>
        </TouchableOpacity>
      );
    };

  return { insets, c, t, primaryAccent, usuario, cargando, marcarTodasComoLeidas, monedaActual, tasaUSD, activeTab, setActiveTab, appliedCoupons, refreshing, selectedConditionsCoupon, setSelectedConditionsCoupon, activeAppliedCoupon, setActiveAppliedCoupon, activePendingCoupon, setActivePendingCoupon, selectedNotification, setSelectedNotification, handleRefresh, generalNotifications, cupones, vehiculoPromos, handleApplyCoupon, confirmApplyCoupon, getCouponVehicleImages, formatDateTime, formatDateShort, daysUntilExpiry, renderGeneralItem }
}
