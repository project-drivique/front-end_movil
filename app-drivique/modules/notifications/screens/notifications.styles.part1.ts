import { StyleSheet, Platform } from 'react-native'

export const part1 = StyleSheet.create({
  container: {
      flex: 1,
    },
  header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 18,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 5,
        },
        android: {
          elevation: 4,
        },
      }),
    },
  backBtn: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
    },
  headerTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#FFFFFF",
    },
  readAllBtn: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
  tabBar: {
      flexDirection: "row",
      borderBottomWidth: 1,
    },
  tabButton: {
      flex: 1,
      paddingVertical: 14,
      alignItems: "center",
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
  activeTabButton: {
      borderBottomColor: "#1D4ED8",
    },
  tabText: {
      fontSize: 14,
      fontWeight: "700",
    },
  activeTabText: {
      color: "#1D4ED8",
    },
  timeRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
      flexWrap: "wrap",
    },
  expiryPill: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 20,
      borderWidth: 1,
      marginTop: 5,
    },
  expiryPillText: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.1,
    },
  generalList: {
      padding: 16,
      gap: 12,
    },
  generalCard: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 16,
  
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        },
        android: {
          elevation: 1,
        },
      }),
    },
  cardHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
  iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
  contentWrapper: {
      flex: 1,
      marginLeft: 12,
    },
  title: {
      fontSize: 14,
      fontWeight: "700",
    },
  unreadText: {
      fontWeight: "800",
    },
  time: {
      fontSize: 11,
      marginTop: 2,
    },
  unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#2563EB",
      marginLeft: 8,
    },
  body: {
      fontSize: 13,
      lineHeight: 18,
      marginTop: 10,
      paddingLeft: 52,
    },
  emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
      paddingTop: 100,
    },
  emptyText: {
      fontSize: 14,
      textAlign: "center",
      marginTop: 16,
      lineHeight: 20,
    },
  promosScroll: {
      flex: 1,
      padding: 16,
    },
  promoSectionTitle: {
      fontSize: 16,
      fontWeight: "800",
      marginBottom: 16,
    },
  ticketWrapper: {
      marginBottom: 18,
      // Ticket scallop effect on outer container
    },
  couponCard: {
      flexDirection: "row",
      borderRadius: 12,
      borderWidth: 1,
      overflow: "hidden",
      height: 155,
      position: "relative",
      ...Platform.select({
        ios: {
          shadowColor: "#2563EB",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        android: {
          elevation: 2,
        },
      }),
    },
  notchLeft: {
      position: "absolute",
      left: -11,
      top: "50%",
      marginTop: -11,
      width: 22,
      height: 22,
      borderRadius: 11,
      zIndex: 20,
    },
  notchRight: {
      position: "absolute",
      right: -11,
      top: "50%",
      marginTop: -11,
      width: 22,
      height: 22,
      borderRadius: 11,
      zIndex: 20,
    },
  couponLeft: {
      flex: 3.2,
      padding: 12,
      justifyContent: "space-between",
    },
  couponTitleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
  couponTitlePremio: {
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 16,
      flex: 1,
    },
  couponImagesRow: {
      flexDirection: "row",
      gap: 5,
      marginVertical: 6,
    },
  couponCarMiniWrapper: {
      width: 52,
      height: 36,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
  couponCarMiniImage: {
      width: "100%",
      height: "100%",
    },
  couponConditionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  expiringText: {
      color: "#EF4444",
      fontSize: 11,
      fontWeight: "700",
    },
  conditionsLink: {
      color: "#3B82F6",
      fontSize: 11,
      fontWeight: "700",
    },
  separatorContainer: {
      width: 1,
      alignSelf: "stretch",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      overflow: "visible",
    },
  innerNotchTop: {
      position: "absolute",
      top: -10,
      width: 20,
      height: 20,
      borderRadius: 10,
      zIndex: 20,
    },
  innerNotchBottom: {
      position: "absolute",
      bottom: -10,
      width: 20,
      height: 20,
      borderRadius: 10,
      zIndex: 20,
    },
  dashedSeparator: {
      height: "100%",
      borderStyle: "dashed",
      borderWidth: 1,
    },
  couponRight: {
      flex: 1.9,
      padding: 10,
      alignItems: "center",
      justifyContent: "center",
    },
  couponDiscount: {
      fontSize: 16,
      fontWeight: "800",
    },
  couponRule: {
      fontSize: 10,
      fontWeight: "700",
      textAlign: "center",
      marginTop: 2,
      marginBottom: 8,
    },
  couponApplyBtn: {
      backgroundColor: "#2563EB",
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 6,
      width: "90%",
      alignItems: "center",
    },
  couponApplyBtnText: {
      fontSize: 11,
      fontWeight: "800",
    },
  couponDateText: {
      fontSize: 10,
      marginTop: 2,
    },
  couponExpBadge: {
      fontSize: 10,
      fontWeight: "700",
      color: "#F59E0B",
      marginBottom: 4,
      textAlign: "center",
    },
  vehiculoPromoCard: {
      flexDirection: "row",
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 12,
      alignItems: "flex-start",
      ...Platform.select({
  
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        },
        android: {
          elevation: 1,
        },
      }),
    },
  vehiculoPromoImageWrapper: {
      width: 72,
      height: 72,
      borderRadius: 10,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
  vehiculoPromoImage: {
      width: "100%",
      height: "100%",
    },
  vehiculoPromoContent: {
      flex: 1,
      marginLeft: 14,
    },
  vehiculoPromoTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  vehiculoPromoTitle: {
      fontSize: 13.5,
      fontWeight: "800",
      flex: 1,
    },
  vehiculoPromoModelo: {
      fontSize: 13,
      fontWeight: "700",
      marginTop: 2,
      marginBottom: 4,
    },
  descuentoBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
      borderWidth: 1,
      alignSelf: "flex-start",
    },
  descuentoBadgeText: {
      fontSize: 11,
      fontWeight: "800",
    },
  vehiculoPromoTime: {
      fontSize: 11,
      marginLeft: 8,
    },
  vehiculoPromoDesc: {
      fontSize: 12,
      lineHeight: 16,
      marginTop: 4,
    },
  modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
  modalCard: {
      width: "90%",
      maxHeight: "75%",
      borderRadius: 16,
      borderWidth: 1,
      padding: 20,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
        },
        android: {
          elevation: 8,
        },
      }),
    },
  modalHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
  modalTitle: {
      fontSize: 16,
      fontWeight: "800",
    },
  modalScroll: {
      marginVertical: 10,
    },
  modalSubtitle: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 6,
    },
  modalDescription: {
      fontSize: 13,
      lineHeight: 18,
    },
  infoDivider: {
      height: 1,
      marginVertical: 14,
    },
  conditionSectionHeader: {
      fontSize: 13.5,
      fontWeight: "700",
      marginBottom: 8,
    },
})
