import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { COLOR_MARCA } from "../constants/reservation.constants";
import { useReservaStore } from "@/store/reservationStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { diasEntre } from "./BookingSummaryModal.pieces";
import { formatCurrency } from "@/utils/currencyUtils";
import { useMonedaStore } from "@/store/currencyStore";
import { VEHICULOS_MOCK } from "@/modules/catalog/constants/catalog.constants";
import cuponesDemo from "@/mocks/cuponesDemo.json";

interface Props {
  vehiculo: Vehiculo;
}

export default function CouponSection({ vehiculo }: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  
  const monedaActual = useMonedaStore((s) => s.monedaActual);
  const tasaUSD = useMonedaStore((s) => s.tasaUSD);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [codigoManual, setCodigoManual] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorMsgModal, setErrorMsgModal] = useState("");
  const [selectedConditionsCoupon, setSelectedConditionsCoupon] = useState<any>(null);
  
  const cuponAplicado = useReservaStore((s) => s.cuponAplicado);
  const aplicarCupon = useReservaStore((s) => s.aplicarCupon);
  const removerCupon = useReservaStore((s) => s.removerCupon);
  const fechasLugar = useReservaStore((s) => s.fechasLugar);
  
  const notificaciones = useNotificationStore((s) => s.notificaciones);
  
  const cuponesDisponibles = useMemo(() => {
<<<<<<< Updated upstream
    return notificaciones
=======
    const unlocked = notificaciones
>>>>>>> Stashed changes
      .filter((n) => n.tipo === "promocion" && n.cupon)
      .map((n) => ({
        ...n.cupon!,
        tituloPremio: n.titulo,
        expiracion: n.expiracion,
        recompensaDetalle: n.mensaje,
      }));
<<<<<<< Updated upstream
  }, [notificaciones]);
=======

    const actives = cuponesDemo.filter(c => c.estado === "activo" || c.estado === "a_punto_de_agotar");
    
    const combined = new Map();
    actives.forEach(c => combined.set(c.codigo.toUpperCase(), c));
    unlocked.forEach(c => combined.set(c.codigo.toUpperCase(), c));
    
    // Filtrar para mostrar solo los que aplican a las condiciones actuales
    const aplicables = Array.from(combined.values()).filter((cpx: any) => {
      if (!cpx.reglas) return true;
      const dias = diasEntre(fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion);
      if (cpx.reglas.minimoDias && dias < cpx.reglas.minimoDias) return false;
      if (cpx.reglas.categoriasValidas && vehiculo.categoria) {
        const catUpper = vehiculo.categoria.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const validCats = cpx.reglas.categoriasValidas.map((cat: string) => cat.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        if (!validCats.includes(catUpper)) return false;
      }
      if (cpx.reglas.metodosPagoValidos && fechasLugar.metodoPago) {
        if (!cpx.reglas.metodosPagoValidos.includes(fechasLugar.metodoPago)) return false;
      }
      return true;
    });

    return aplicables;
  }, [notificaciones, fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion, vehiculo.categoria]);
>>>>>>> Stashed changes
  
  const primaryAccent = c.oscuro ? "#60A5FA" : COLOR_MARCA;

  const getVehicleImagesByCategory = (category: string) => {
    const list = VEHICULOS_MOCK.filter(
      (v) => v.categoria.toLowerCase() === (category || "").toLowerCase()
    );
    const finalSelection = list.length > 0 ? list : VEHICULOS_MOCK;
    return finalSelection.slice(0, 3).map((v) => v.imagen || (v.imagenes && v.imagenes[0]) || "");
  };

  const formatDateShort = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return "";
    }
  };
  
<<<<<<< Updated upstream
  const handleSeleccionarCupon = (cupon: any, fromModal: boolean = false) => {
    setErrorMsg("");
    setErrorMsgModal("");
    
    if (cupon.reglas) {
      const dias = diasEntre(fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion);
      if (cupon.reglas.minimoDias && dias < cupon.reglas.minimoDias) {
        const msg = t("coupon.errorMinDays", { days: cupon.reglas.minimoDias });
        fromModal ? setErrorMsgModal(msg) : setErrorMsg(msg);
        return;
      }
      if (cupon.reglas.categoriasValidas && vehiculo.categoria && !cupon.reglas.categoriasValidas.includes(vehiculo.categoria)) {
        const msg = t("coupon.errorCategory", { categories: cupon.reglas.categoriasValidas.join(", ") });
        fromModal ? setErrorMsgModal(msg) : setErrorMsg(msg);
        return;
      }
    }

    aplicarCupon(cupon);
    setModalVisible(false);
    setCodigoManual("");
=======
  const handleSeleccionarCupon = (cupon: any) => {
    setCodigoManual(cupon.codigo);
    setModalVisible(false);
>>>>>>> Stashed changes
  };

  const handleAplicarManual = () => {
    const code = codigoManual.trim().toUpperCase();
    if (!code) return;
    setErrorMsg("");

    // Primero buscamos si está en la lista de notificaciones del usuario
    let cuponLista = cuponesDisponibles.find(c => c.codigo.toUpperCase() === code);
    
    // Si no está, lo buscamos en la base de datos mock (cuponesDemo)
    if (!cuponLista) {
      const cuponDB = cuponesDemo.find(c => c.codigo.toUpperCase() === code);
      if (cuponDB) {
        if (cuponDB.estado === "expirado") {
          setErrorMsg(t("coupon.errorExpired"));
          return;
        }
        cuponLista = cuponDB as any;
      }
    }

    if (cuponLista) {
<<<<<<< Updated upstream
      handleSeleccionarCupon(cuponLista, false);
=======
      if (cuponLista.reglas) {
        const dias = diasEntre(fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion);
        if (cuponLista.reglas.minimoDias && dias < cuponLista.reglas.minimoDias) {
          setErrorMsg(t("coupon.errorMinDays", { days: cuponLista.reglas.minimoDias }));
          return;
        }
        if (cuponLista.reglas.categoriasValidas && vehiculo.categoria) {
          const catUpper = vehiculo.categoria.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const validCats = cuponLista.reglas.categoriasValidas.map((cat: string) => cat.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
          if (!validCats.includes(catUpper)) {
            setErrorMsg(t("coupon.errorCategory", { categories: cuponLista.reglas.categoriasValidas.join(", ") }));
            return;
          }
        }
        if (cuponLista.reglas.metodosPagoValidos && fechasLugar.metodoPago) {
          if (!cuponLista.reglas.metodosPagoValidos.includes(fechasLugar.metodoPago)) {
            setErrorMsg(t("coupon.errorPaymentMethod", { methods: cuponLista.reglas.metodosPagoValidos.join(", ") }));
            return;
          }
        }
      }
      aplicarCupon(cuponLista);
      setCodigoManual("");
>>>>>>> Stashed changes
    } else {
      setErrorMsg(t("coupon.errorInvalid"));
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.seccionLabel, { color: c.textMuted }]}>
        {t("coupon.title", "CUPÓN DE DESCUENTO (OPCIONAL)")}
      </Text>

      <View style={[styles.card, { backgroundColor: c.bgCard, borderColor: cuponAplicado ? primaryAccent : c.border }]}>
        {cuponAplicado ? (
          <View style={styles.appliedContainer}>
            <View style={styles.appliedLeft}>
              <Ionicons name="checkmark-circle" size={22} color={primaryAccent} />
              <View>
                <Text style={[styles.appliedCode, { color: primaryAccent }]}>{cuponAplicado.codigo}</Text>
                <Text style={[styles.appliedDesc, { color: c.textSecondary }]}>
                  {cuponAplicado.descuentoPorcentaje ? `${cuponAplicado.descuentoPorcentaje}% OFF aplicado` : `-$${cuponAplicado.descuentoFijo} aplicado`}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={removerCupon} style={{ padding: 4 }}>
              <Ionicons name="trash-outline" size={18} color={c.textMuted} />
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { backgroundColor: c.bgInput, borderColor: errorMsg ? (c.oscuro ? "#ef4444" : "#EF4444") : c.border, color: c.textPrimary }]}
                placeholder={t("coupon.placeholder", "Ingresa un código")}
                placeholderTextColor={c.textMuted}
                value={codigoManual}
                onChangeText={(t) => { setCodigoManual(t); setErrorMsg(""); }}
                autoCapitalize="characters"
              />
              <TouchableOpacity 
                style={[styles.aplicarBtn, { backgroundColor: codigoManual.length > 0 ? primaryAccent : c.textMuted }]}
                disabled={codigoManual.length === 0}
                onPress={handleAplicarManual}
              >
                <Text style={styles.aplicarBtnText}>{t("coupon.applyBtn", "APLICAR")}</Text>
              </TouchableOpacity>
            </View>
            
            {errorMsg ? (
              <View style={[styles.errorAlertBanner, { backgroundColor: c.oscuro ? "#450a0a" : "#FEF2F2", borderColor: c.oscuro ? "#7f1d1d" : "#FCA5A5" }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Ionicons name="alert-circle" size={16} color={c.oscuro ? "#f87171" : "#EF4444"} />
                  <Text style={[styles.errorAlertText, { color: c.oscuro ? "#fca5a5" : "#B91C1C" }]}>{errorMsg}</Text>
                </View>
                <TouchableOpacity onPress={() => setErrorMsg("")}>
                  <Ionicons name="close" size={16} color={c.oscuro ? "#f87171" : "#EF4444"} />
                </TouchableOpacity>
              </View>
            ) : null}
            
            <TouchableOpacity onPress={() => { setModalVisible(true); setErrorMsgModal(""); }} style={styles.verCuponesBtn}>
              <Text style={[styles.verCuponesText, { color: primaryAccent }]}>{t("coupon.viewAvailable", "VER CUPONES DISPONIBLES")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal Principal de Lista de Cupones */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
<<<<<<< Updated upstream
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
=======
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setModalVisible(false)} />
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          pointerEvents="box-none"
>>>>>>> Stashed changes
        >
          <View style={[styles.modalContent, { backgroundColor: c.bg }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.pullIndicatorContainer}>
                <View style={styles.pullIndicator} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: primaryAccent }]}>{t("coupon.modalTitle", "Cupones Disponibles")}</Text>
            </View>
            
            {errorMsgModal ? (
              <View style={[styles.errorAlertBanner, { marginHorizontal: 16, marginBottom: 12, marginTop: 0, backgroundColor: c.oscuro ? "#450a0a" : "#FEF2F2", borderColor: c.oscuro ? "#7f1d1d" : "#FCA5A5" }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Ionicons name="alert-circle" size={16} color={c.oscuro ? "#f87171" : "#EF4444"} />
                  <Text style={[styles.errorAlertText, { color: c.oscuro ? "#fca5a5" : "#B91C1C" }]}>{errorMsgModal}</Text>
                </View>
                <TouchableOpacity onPress={() => setErrorMsgModal("")}>
                  <Ionicons name="close" size={16} color={c.oscuro ? "#f87171" : "#EF4444"} />
                </TouchableOpacity>
              </View>
            ) : null}

            <ScrollView style={styles.modalScroll}>
              {cuponesDisponibles.length === 0 && (
<<<<<<< Updated upstream
                <Text style={{ textAlign: "center", color: c.textMuted, marginTop: 20, fontSize: 12 }}>
                  {t("coupon.empty", "No tienes cupones disponibles en este momento.")}
                </Text>
=======
                <View style={{ alignItems: 'center', justifyContent: 'center', padding: 24, marginTop: 20, backgroundColor: c.bgInput, borderRadius: 12, borderWidth: 1, borderColor: c.border, borderStyle: 'dashed' }}>
                  <Ionicons name="ticket-outline" size={48} color={c.textMuted} style={{ marginBottom: 12, opacity: 0.5 }} />
                  <Text style={{ textAlign: "center", color: c.textPrimary, fontSize: 14, fontWeight: "700", marginBottom: 6 }}>
                    {t("coupon.emptyTitle", "No hay cupones aplicables")}
                  </Text>
                  <Text style={{ textAlign: "center", color: c.textSecondary, fontSize: 13, lineHeight: 18 }}>
                    {t("coupon.emptyDesc", "En este momento no cuentas con cupones que apliquen para las condiciones de tu reserva actual.")}
                  </Text>
                </View>
>>>>>>> Stashed changes
              )}
              
              {cuponesDisponibles.map((cpx) => {
                const esActivo = cuponAplicado?.codigo === cpx.codigo;
                const carImages = getVehicleImagesByCategory(cpx.reglas?.categoriasValidas?.[0] || "");
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
                let discountLabel = "";
                if (cpx.descuentoPorcentaje) {
                  discountLabel = `${cpx.descuentoPorcentaje}% OFF`;
                } else if (cpx.descuentoFijo) {
<<<<<<< Updated upstream
                  discountLabel = `${formatCurrency(cpx.descuentoFijo, monedaActual, tasaUSD)} OFF`;
=======
                  discountLabel = `-${formatCurrency(cpx.descuentoFijo, monedaActual, tasaUSD)}`;
>>>>>>> Stashed changes
                } else {
                  discountLabel = t(cpx.descripcion || "Descuento");
                }

<<<<<<< Updated upstream
                const ruleLabel = cpx.reglas?.minimoDias ? `Min ${cpx.reglas.minimoDias} días` : "Descuento en tu reserva";
=======
                const ruleLabel = t(cpx.regla || cpx.condicionesDetalladas || (cpx.reglas?.minimoDias ? `Min ${cpx.reglas.minimoDias} días` : "Descuento en tu reserva"));
>>>>>>> Stashed changes

                return (
                  <View key={cpx.id || cpx.codigo} style={styles.ticketWrapper}>
                    <View style={[styles.couponCard, { backgroundColor: c.bgCard, borderColor: esActivo ? primaryAccent : c.border }, esActivo && { borderWidth: 2 }]}>
                      
                      {/* OUTER notches */}
                      <View style={[styles.notchLeft, { backgroundColor: c.bg }]} />
                      <View style={[styles.notchRight, { backgroundColor: c.bg }]} />

                      {/* Left Side */}
                      <View style={styles.couponLeft}>
<<<<<<< Updated upstream
=======
                        {cpx.estado === "a_punto_de_agotar" && (
                          <View style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: "flex-start", marginBottom: 4 }}>
                            <Text style={{ fontSize: 9, fontWeight: "700", color: "#DC2626" }}>{t("coupon.expiringSoon", "Por agotarse")}</Text>
                          </View>
                        )}
>>>>>>> Stashed changes
                        <View style={styles.couponTitleRow}>
                          <Ionicons name="ticket-outline" size={14} color={primaryAccent} style={{ marginRight: 4 }} />
                          <Text style={[styles.couponTitlePremio, { color: c.textPrimary }]} numberOfLines={1}>
                            {t(cpx.tituloPremio || cpx.descripcion || "Cupón de Descuento")}
                          </Text>
                        </View>

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

                        <View style={styles.couponConditionRow}>
                          <View style={{ flex: 1 }}>
<<<<<<< Updated upstream
                            {cpx.expiracion && (
                              <Text style={[styles.couponDateText, { color: c.textMuted }]}>
                                Exp: {formatDateShort(cpx.expiracion)}
=======
                            {(cpx.fechaExpiracion || cpx.expiracion) && (
                              <Text style={[styles.couponDateText, { color: c.textMuted, fontWeight: cpx.estado === "a_punto_de_agotar" ? "bold" : "normal" }]}>
                                Exp: {formatDateShort(cpx.fechaExpiracion || cpx.expiracion)}
>>>>>>> Stashed changes
                              </Text>
                            )}
                          </View>
                          <TouchableOpacity onPress={() => setSelectedConditionsCoupon(cpx)}>
                            <Text style={[styles.codeSubtitle, { color: primaryAccent }]}>{t("coupon.conditionsBtn", "Condiciones")}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Dotted Separator */}
                      <View style={styles.separatorContainer}>
                        <View style={[styles.innerNotchTop, { backgroundColor: c.bg }]} />
                        <View style={[styles.dashedSeparator, { borderColor: c.border }]} />
                        <View style={[styles.innerNotchBottom, { backgroundColor: c.bg }]} />
                      </View>

                      {/* Right Side */}
                      <View style={[styles.couponRight, { backgroundColor: c.oscuro ? "#1e3a8a33" : "#EFF6FF" }]}>
                        <Text style={[styles.couponDiscount, { color: primaryAccent, textAlign: "center" }]}>
                          {discountLabel}
                        </Text>
                        <Text style={[styles.couponRule, { color: c.textMuted }]}>
                          {ruleLabel}
                        </Text>
                        <TouchableOpacity
                          style={[styles.couponApplyBtn, { backgroundColor: primaryAccent }, esActivo && { backgroundColor: c.bgInput }]}
<<<<<<< Updated upstream
                          onPress={() => handleSeleccionarCupon(cpx, true)}
=======
                          onPress={() => handleSeleccionarCupon(cpx)}
>>>>>>> Stashed changes
                          disabled={esActivo}
                        >
                          <Text style={[styles.couponApplyBtnText, { color: esActivo ? c.textMuted : "#FFFFFF" }]}>
                            {esActivo ? t("coupon.appliedBtn", "✓ Aplicado") : t("coupon.applyAction", "Aplicar")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de Detalles de Condiciones */}
      <Modal
        visible={selectedConditionsCoupon !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedConditionsCoupon(null)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={[styles.modalCardCenter, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <View style={styles.modalHeaderRowCenter}>
              <Text style={[styles.modalTitleCenter, { color: c.textPrimary }]}>{t("coupon.conditionsTitle", "Condiciones del Cupón")}</Text>
              <TouchableOpacity onPress={() => setSelectedConditionsCoupon(null)}>
                <Ionicons name="close" size={24} color={c.textPrimary} />
              </TouchableOpacity>
            </View>
            
            {selectedConditionsCoupon && (
              <ScrollView style={styles.modalScrollCenter}>
                <Text style={[styles.modalSubtitleCenter, { color: primaryAccent }]}>
                  {t(selectedConditionsCoupon.tituloPremio || selectedConditionsCoupon.descripcion)}
                </Text>
                <Text style={[styles.modalDescriptionCenter, { color: c.textSecondary }]}>
                  {t(selectedConditionsCoupon.recompensaDetalle || "coupon.fallbackDesc")}
                </Text>
                
                <View style={[styles.infoDividerCenter, { backgroundColor: c.border }]} />

                <Text style={[styles.conditionSectionHeaderCenter, { color: c.textPrimary }]}>{t("coupon.termsTitle", "Términos y condiciones:")}</Text>
                <Text style={[styles.conditionTextCenter, { color: c.textSecondary, marginTop: 10 }]}>
                  {t("coupon.term1", "• Válido para pagos digitales e iniciales.")}{"\n"}
                  {t("coupon.term2", "• No transferible a otros usuarios.")}{"\n"}
                  {t("coupon.term3", "• Solo se puede aplicar un cupón por reserva.")}
                  {selectedConditionsCoupon.reglas?.minimoDias ? `\n• ${t("coupon.minDays", "Mínimo de días:")} ${selectedConditionsCoupon.reglas.minimoDias}` : ''}
                  {selectedConditionsCoupon.reglas?.categoriasValidas ? `\n• ${t("coupon.validCategories", "Categorías válidas:")} ${selectedConditionsCoupon.reglas.categoriasValidas.join(", ")}` : ''}
                  {selectedConditionsCoupon.expiracion ? `\n• ${t("coupon.expires", "Vence:")} ${formatDateShort(selectedConditionsCoupon.expiracion)}` : ''}
                </Text>
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.modalCloseBtnCenter, { backgroundColor: primaryAccent }]}
              onPress={() => setSelectedConditionsCoupon(null)}
            >
              <Text style={styles.modalCloseBtnTextCenter}>{t("coupon.understoodBtn", "Entendido")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  seccionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3, marginBottom: 8 },
  card: { borderRadius: 12, borderWidth: 1.3, padding: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  appliedContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  appliedLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  appliedCode: { fontSize: 13, fontWeight: "700" },
  appliedDesc: { fontSize: 11 },
  inputRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, borderWidth: 1.3, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, fontSize: 12 },
  aplicarBtn: { justifyContent: "center", paddingHorizontal: 16, borderRadius: 8 },
  aplicarBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  verCuponesBtn: { marginTop: 12, alignItems: "center" },
  verCuponesText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.2 },
  
  errorAlertBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
  },
  errorAlertText: {
    fontSize: 11.5,
    flex: 1,
  },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%", paddingTop: 12, paddingBottom: 24, flexShrink: 1 },
  modalHeader: { paddingHorizontal: 16, paddingBottom: 16, alignItems: "center" },
  pullIndicatorContainer: { width: "100%", alignItems: "center", paddingVertical: 8, marginTop: -8 },
  pullIndicator: { width: 36, height: 4, backgroundColor: "#D1D5DB", borderRadius: 2 },
  modalTitle: { fontSize: 14, fontWeight: "700", marginTop: 4 },
  modalScroll: { paddingHorizontal: 16 },

  // Ticket styles
  ticketWrapper: { marginBottom: 18 },
  couponCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    height: 145,
    position: "relative",
    ...Platform.select({
      ios: { shadowColor: "#2563EB", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  notchLeft: { position: "absolute", left: -11, top: "50%", marginTop: -11, width: 22, height: 22, borderRadius: 11, zIndex: 20 },
  notchRight: { position: "absolute", right: -11, top: "50%", marginTop: -11, width: 22, height: 22, borderRadius: 11, zIndex: 20 },
  couponLeft: { flex: 3, padding: 14, justifyContent: "space-between" },
  couponTitleRow: { flexDirection: "row", alignItems: "center" },
  couponTitlePremio: { fontSize: 12, fontWeight: "700", flex: 1 },
  couponImagesRow: { flexDirection: "row", gap: 6, marginVertical: 6 },
  couponCarMiniWrapper: { width: 64, height: 46, borderRadius: 6, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  couponCarMiniImage: { width: "100%", height: "100%" },
  couponConditionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  couponDateText: { fontSize: 10, marginTop: 2 },
  codeSubtitle: { fontSize: 11, fontWeight: "700", textDecorationLine: "underline" },
  separatorContainer: { width: 1, alignSelf: "stretch", justifyContent: "center", alignItems: "center", position: "relative", overflow: "visible" },
  innerNotchTop: { position: "absolute", top: -10, width: 20, height: 20, borderRadius: 10, zIndex: 20 },
  innerNotchBottom: { position: "absolute", bottom: -10, width: 20, height: 20, borderRadius: 10, zIndex: 20 },
  dashedSeparator: { height: "100%", borderStyle: "dashed", borderWidth: 1 },
  couponRight: { flex: 2.1, padding: 12, alignItems: "center", justifyContent: "center" },
  couponDiscount: { fontSize: 16, fontWeight: "800" },
  couponRule: { fontSize: 10, fontWeight: "700", textAlign: "center", marginTop: 2, marginBottom: 8 },
  couponApplyBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6, width: "90%", alignItems: "center" },
  couponApplyBtnText: { fontSize: 11, fontWeight: "800" },

  // Center Modal (Conditions) Styles
  modalOverlayCenter: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.45)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCardCenter: { width: "90%", maxHeight: "75%", borderRadius: 16, borderWidth: 1, padding: 20, ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10 }, android: { elevation: 8 } }) },
  modalHeaderRowCenter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitleCenter: { fontSize: 16, fontWeight: "800" },
  modalScrollCenter: { marginVertical: 10 },
  modalSubtitleCenter: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  modalDescriptionCenter: { fontSize: 13, lineHeight: 18 },
  infoDividerCenter: { height: 1, marginVertical: 14 },
  conditionSectionHeaderCenter: { fontSize: 13.5, fontWeight: "700", marginBottom: 8 },
  conditionTextCenter: { fontSize: 12.5, lineHeight: 18 },
  modalCloseBtnCenter: { paddingVertical: 10, borderRadius: 8, alignItems: "center", marginTop: 10 },
  modalCloseBtnTextCenter: { color: "#FFFFFF", fontSize: 13.5, fontWeight: "800" },
});
