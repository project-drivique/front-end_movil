import { StyleSheet } from 'react-native'

export const part2 = StyleSheet.create({
  conditionText: {
      fontSize: 12.5,
      lineHeight: 18,
    },
  modalCloseBtn: {
      backgroundColor: "#2563EB",
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 10,
    },
  modalCloseBtnText: {
      color: "#FFFFFF",
      fontSize: 13.5,
      fontWeight: "800",
    },
  modalBtnText: {
      fontSize: 13.5,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  modalInstruction: {
      fontSize: 12,
      textAlign: "center",
      lineHeight: 17,
      marginTop: 12,
    },
  promoDesc: {
      fontSize: 12,
      lineHeight: 16,
      marginTop: 4,
    },
  couponRewardEarnedDesc: {
      fontSize: 13,
      lineHeight: 18,
    },
  codeBox: {
      width: "100%",
      paddingVertical: 12,
      borderWidth: 1.5,
      borderRadius: 10,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 14,
    },
  codeText: {
      fontSize: 20,
      fontWeight: "900",
      letterSpacing: 2,
    },
  criticalityBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
      borderWidth: 1,
    },
  metadataBox: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      marginTop: 10,
      gap: 6,
    },
  metadataTitle: {
      fontSize: 12.5,
      fontWeight: "700",
      marginBottom: 4,
    },
  metadataRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  metadataKey: {
      fontSize: 12,
      textTransform: "capitalize",
    },
  metadataVal: {
      fontSize: 12,
      fontWeight: "600",
    },
  modalActionBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      width: "100%",
    },
})
