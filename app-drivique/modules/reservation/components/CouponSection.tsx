import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { GRADIENTES } from "@/constants/gradients";
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

const { height } = Dimensions.get("window");

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
  
  const normalizeStr = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const cuponesDisponibles = useMemo(() => {
    const dias = diasEntre(fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion);
    return cuponesDemo
      .filter((c: any) => c.estado !== "expirado")
      .map((c: any) => ({
        ...c,
        expiracion: c.fechaExpiracion,
        agotandose: c.estado === "a_punto_de_agotar",
      }))
      .filter((cpx: any) => {
        // 1. Filtrar por vehículo específico si aplica
        if (cpx.reglas?.vehiculoId && vehiculo.id !== cpx.reglas.vehiculoId) {
          return false;
        }
        // 2. Filtrar para que solo aparezcan cupones compatibles con la categoría del vehículo actual
        if (cpx.reglas?.categoriasValidas && cpx.reglas.categoriasValidas.length > 0 && vehiculo.categoria) {
          const vehCatNorm = normalizeStr(vehiculo.categoria);
          const esValida = cpx.reglas.categoriasValidas.some((cat: string) => normalizeStr(cat) === vehCatNorm);
          if (!esValida) return false;
        }
        // 3. Filtrar por mínimo de días si ya están seleccionados
        if (cpx.reglas?.minimoDias && dias > 0 && dias < cpx.reglas.minimoDias) {
          return false;
        }
        // 4. Filtrar por método de pago si ya está seleccionado
        if (cpx.reglas?.metodosPagoValidos && fechasLugar.metodoPago) {
          if (!cpx.reglas.metodosPagoValidos.includes(fechasLugar.metodoPago)) {
            return false;
          }
        }
        return true;
      });
  }, [vehiculo.id, vehiculo.categoria, fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion, fechasLugar.metodoPago]);
  
  const primaryAccent = c.oscuro ? "#60A5FA" : COLOR_MARCA;

  const getCouponVehicleImages = (cpx: any): string[] => {
    const vehId = cpx.reglas?.vehiculoId;
    if (vehId) {
      const specificCar = VEHICULOS_MOCK.find((v) => v.id === vehId);
      if (specificCar) {
        const carImgs = (specificCar.imagenes || []).filter(Boolean);
        if (carImgs.length >= 3) return carImgs.slice(0, 3);
        if (specificCar.imagen && !carImgs.includes(specificCar.imagen)) {
          carImgs.unshift(specificCar.imagen);
        }
        if (carImgs.length >= 3) return carImgs.slice(0, 3);
        // Completar con vehículos de la misma categoría
        const catCars = VEHICULOS_MOCK.filter((v) => v.categoria === specificCar.categoria && v.id !== specificCar.id);
        for (const v of catCars) {
          const img = (v.imagenes && v.imagenes[0]) || v.imagen;
          if (img && !carImgs.includes(img)) carImgs.push(img);
          if (carImgs.length >= 3) break;
        }
        return carImgs.slice(0, 3);
      }
    }

    const cat = cpx.reglas?.categoriasValidas?.[0];
    const imgs: string[] = [];

    if (cat && cat.toLowerCase() !== "todos") {
      const matchingCars = VEHICULOS_MOCK.filter((v) => v.categoria.toLowerCase() === cat.toLowerCase());
      for (const v of matchingCars) {
        const img = (v.imagenes && v.imagenes[0]) || v.imagen;
        if (img && !imgs.includes(img)) imgs.push(img);
        if (imgs.length >= 3) break;
      }
    }

    // Completar hasta 3 con vehículos de la flota
    for (const v of VEHICULOS_MOCK) {
      const img = (v.imagenes && v.imagenes[0]) || v.imagen;
      if (img && !imgs.includes(img)) imgs.push(img);
      if (imgs.length >= 3) break;
    }

    return imgs.slice(0, 3);
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
  
  const handleSeleccionarCupon = (cupon: any, fromModal: boolean = false) => {
    setErrorMsg("");
    setErrorMsgModal("");
    
    if (cupon.reglas) {
      if (cupon.reglas.vehiculoId && vehiculo.id !== cupon.reglas.vehiculoId) {
        const msg = "Este cupón solo es válido para otro modelo de vehículo.";
        fromModal ? setErrorMsgModal(msg) : setErrorMsg(msg);
        return;
      }
      const dias = diasEntre(fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion);
      if (cupon.reglas.minimoDias && dias < cupon.reglas.minimoDias) {
        const msg = t("coupon.errorMinDays", { days: cupon.reglas.minimoDias });
        fromModal ? setErrorMsgModal(msg) : setErrorMsg(msg);
        return;
      }
      if (cupon.reglas.categoriasValidas && cupon.reglas.categoriasValidas.length > 0 && vehiculo.categoria) {
        const vehCatNorm = normalizeStr(vehiculo.categoria);
        const isValidCategory = cupon.reglas.categoriasValidas.some((cat: string) => normalizeStr(cat) === vehCatNorm);
        if (!isValidCategory) {
          const msg = t("coupon.errorCategory", { categories: cupon.reglas.categoriasValidas.join(", ") });
          fromModal ? setErrorMsgModal(msg) : setErrorMsg(msg);
          return;
        }
      }
      if (cupon.reglas.metodosPagoValidos && fechasLugar.metodoPago) {
        if (!cupon.reglas.metodosPagoValidos.includes(fechasLugar.metodoPago)) {
          const msg = "Este cupón solo es válido para pagos digitales (Wompi).";
          fromModal ? setErrorMsgModal(msg) : setErrorMsg(msg);
          return;
        }
      }
    }

    aplicarCupon(cupon);
    setModalVisible(false);
    setCodigoManual("");
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
      handleSeleccionarCupon(cuponLista, false);
    } else {
      setErrorMsg(t("coupon.errorInvalid"));
    }
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setSelectedConditionsCoupon(null);
    setErrorMsgModal("");
  };

  const handleOpenConditions = (cpx: any) => {
    setSelectedConditionsCoupon(cpx);
  };

  const handleVolverALista = () => {
    setSelectedConditionsCoupon(null);
  };

  return (
    <View style={[styles.cardForm, { backgroundColor: c.oscuro ? c.bgCard : "#FFFFFF", borderColor: c.border }]}>
      <View style={styles.cardHeaderFila}>
        <Text style={[styles.cardHeaderTitulo, { color: primaryAccent }]}>
          {t("coupon.title", { defaultValue: "Cupón de descuento (Opcional)" })}
        </Text>
      </View>

      {cuponAplicado ? (
        <View
          style={[
            styles.appliedContainer,
            {
              backgroundColor: c.oscuro ? "#17255433" : "#EFF6FF",
              borderColor: c.oscuro ? "#1D4ED8" : "#BFDBFE",
            },
          ]}
        >
          <View style={styles.appliedLeft}>
            <Ionicons name="checkmark-circle" size={20} color={primaryAccent} />
            <View>
              <Text style={[styles.appliedCode, { color: primaryAccent }]}>{cuponAplicado.codigo}</Text>
              <Text style={[styles.appliedDesc, { color: c.textSecondary }]}>
                {cuponAplicado.descuentoPorcentaje
                  ? `${cuponAplicado.descuentoPorcentaje}% OFF aplicado`
                  : `-$${cuponAplicado.descuentoFijo} aplicado`}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={removerCupon} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={c.oscuro ? "#9CA3AF" : "#64748B"} />
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                  borderColor: c.border,
                  color: c.textPrimary,
                },
              ]}
              placeholder={t("coupon.placeholder", "Ingresa un código")}
              placeholderTextColor={c.textMuted}
              value={codigoManual}
              onChangeText={setCodigoManual}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.aplicarBtn, { backgroundColor: primaryAccent }, codigoManual.length === 0 && { opacity: 0.5 }]}
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
          
          <TouchableOpacity onPress={() => { setModalVisible(true); setSelectedConditionsCoupon(null); setErrorMsgModal(""); }} style={styles.verCuponesBtn}>
            <Text style={[styles.verCuponesText, { color: primaryAccent }]}>{t("coupon.viewAvailable", "Ver cupones disponibles")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Modal: Cupones Disponibles / Condiciones ── */}
      <Modal 
        visible={modalVisible} 
        animationType="slide" 
        transparent={true} 
        onRequestClose={handleCerrarModal}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop superior que cierra al presionar afuera */}
          <TouchableOpacity 
            style={styles.modalBackdropTop} 
            activeOpacity={1} 
            onPress={handleCerrarModal} 
          />

          <KeyboardAvoidingView 
            style={styles.keyboardAvoidContainer}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View 
              style={[
                styles.modalContenedor, 
                { backgroundColor: c.bgCard }
              ]}
            >
              {/* Indicador de arrastre superior */}
              <View style={[styles.modalHandle, { backgroundColor: c.border }]} />

              {/* Encabezado estándar con Título y Botón Cerrar */}
              <View style={[styles.modalEncabezado, { borderBottomColor: c.border }]}>
                <Text style={[styles.modalTitulo, { color: c.textPrimary }]}>
                  {selectedConditionsCoupon
                    ? t("coupon.conditionsTitle", { defaultValue: "Condiciones del Cupón" })
                    : t("coupon.modalTitle", { defaultValue: "Cupones Disponibles" })}
                </Text>

                <TouchableOpacity
                  style={styles.modalBotonCerrarIcon}
                  onPress={handleCerrarModal}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color={c.oscuro ? "#9CA3AF" : "#6B7280"} />
                </TouchableOpacity>
              </View>

              {/* CONTENIDO 1: CONDICIONES DEL CUPÓN */}
              {selectedConditionsCoupon ? (
                <>
                  <ScrollView 
                    style={styles.modalScroll} 
                    contentContainerStyle={styles.modalScrollConditionsContent}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    bounces={true}
                    overScrollMode="always"
                  >
                    <View style={[
                      styles.conditionsCardWrapper, 
                      { 
                        backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF", 
                        borderColor: c.border 
                      }
                    ]}>
                      <Text style={[styles.modalSubtitleCenter, { color: primaryAccent }]}>
                        {t(selectedConditionsCoupon.tituloPremio || selectedConditionsCoupon.descripcion)}
                      </Text>

                      <Text style={[styles.modalDescriptionCenter, { color: c.textSecondary }]}>
                        {t(selectedConditionsCoupon.recompensaDetalle || "coupon.fallbackDesc")}
                      </Text>
                      
                      <View style={[styles.conditionsCardDivider, { backgroundColor: c.border }]} />

                      <Text style={[styles.conditionSectionHeaderCenter, { color: c.textPrimary }]}>
                        {t("coupon.termsTitle", { defaultValue: "Términos y condiciones:" })}
                      </Text>

                      <View style={styles.conditionsBulletsList}>
                        <View style={styles.bulletRow}>
                          <Text style={[styles.bulletDot, { color: primaryAccent }]}>•</Text>
                          <Text style={[styles.conditionTextCenter, { color: c.textSecondary }]}>
                            Código: <Text style={{ fontWeight: "700", color: c.textPrimary }}>{selectedConditionsCoupon.codigo}</Text>
                          </Text>
                        </View>
                        <View style={styles.bulletRow}>
                          <Text style={[styles.bulletDot, { color: primaryAccent }]}>•</Text>
                          <Text style={[styles.conditionTextCenter, { color: c.textSecondary }]}>
                            {t("coupon.term1", { defaultValue: "Válido para pagos digitales e iniciales." })}
                          </Text>
                        </View>
                        <View style={styles.bulletRow}>
                          <Text style={[styles.bulletDot, { color: primaryAccent }]}>•</Text>
                          <Text style={[styles.conditionTextCenter, { color: c.textSecondary }]}>
                            {t("coupon.term2", { defaultValue: "No transferible a otros usuarios." })}
                          </Text>
                        </View>
                        <View style={styles.bulletRow}>
                          <Text style={[styles.bulletDot, { color: primaryAccent }]}>•</Text>
                          <Text style={[styles.conditionTextCenter, { color: c.textSecondary }]}>
                            {t("coupon.term3", { defaultValue: "Solo se puede aplicar un cupón por reserva." })}
                          </Text>
                        </View>
                        {selectedConditionsCoupon.reglas?.minimoDias ? (
                          <View style={styles.bulletRow}>
                            <Text style={[styles.bulletDot, { color: primaryAccent }]}>•</Text>
                            <Text style={[styles.conditionTextCenter, { color: c.textSecondary }]}>
                              {t("coupon.minDays", { defaultValue: "Mínimo de días:" })} {selectedConditionsCoupon.reglas.minimoDias} días
                            </Text>
                          </View>
                        ) : null}
                        <View style={styles.bulletRow}>
                          <Text style={[styles.bulletDot, { color: primaryAccent }]}>•</Text>
                          <Text style={[styles.conditionTextCenter, { color: c.textSecondary }]}>
                            {t("coupon.validCategories", { defaultValue: "Categorías válidas:" })} <Text style={{ fontWeight: "700", color: c.textPrimary }}>{selectedConditionsCoupon.reglas?.categoriasValidas?.length ? selectedConditionsCoupon.reglas.categoriasValidas.join(", ") : "TODOS"}</Text>
                          </Text>
                        </View>
                        <View style={styles.bulletRow}>
                          <Text style={[styles.bulletDot, { color: primaryAccent }]}>•</Text>
                          <Text style={[styles.conditionTextCenter, { color: c.textSecondary }]}>
                            Válido para vehículos de la flota. No acumulable con otras promociones.
                          </Text>
                        </View>
                        <View style={styles.bulletRow}>
                          <Text style={[styles.bulletDot, { color: primaryAccent }]}>•</Text>
                          <Text style={[styles.conditionTextCenter, { color: c.textSecondary }]}>
                            {t("coupon.expires", { defaultValue: "Vence:" })} {selectedConditionsCoupon.expiracion ? formatDateShort(selectedConditionsCoupon.expiracion) : "31 de dic de 2026"}
                          </Text>
                        </View>
                        {selectedConditionsCoupon.condicionesDetalladas ? (
                          <View style={styles.bulletRow}>
                            <Text style={[styles.bulletDot, { color: primaryAccent }]}>•</Text>
                            <Text style={[styles.conditionTextCenter, { color: c.textSecondary }]}>
                              Condiciones especiales: {t(selectedConditionsCoupon.condicionesDetalladas, { defaultValue: selectedConditionsCoupon.condicionesDetalladas })}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </ScrollView>

                  {/* Botones de acción del Modal (afuera juntos: Cerrar a la izquierda, Aplicar a la derecha con diseño de Términos y Condiciones) */}
                  <View style={styles.modalBotonesRow}>
                    {/* Botón Cerrar / Volver a la izquierda */}
                    <TouchableOpacity
                      onPress={handleVolverALista}
                      style={[
                        styles.modalBotonCerrarSecundario,
                        { borderColor: c.border, backgroundColor: c.oscuro ? c.bgCard : "#FFFFFF" },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.modalBotonCerrarSecundarioTexto, { color: c.textPrimary }]}>
                        {t("comun.cerrar", { defaultValue: "Cerrar" })}
                      </Text>
                    </TouchableOpacity>

                    {/* Botón Aplicar a la derecha */}
                    <View style={styles.modalBotonAceptarWrap}>
                      <TouchableOpacity
                        onPress={() => handleSeleccionarCupon(selectedConditionsCoupon, true)}
                        activeOpacity={0.85}
                        style={{ width: "100%" }}
                      >
                        <LinearGradient
                          colors={GRADIENTES.boton.colors}
                          start={GRADIENTES.boton.start}
                          end={GRADIENTES.boton.end}
                          style={styles.modalBotonAceptar}
                        >
                          <Text style={styles.modalBotonAceptarTexto}>
                            {cuponAplicado?.codigo === selectedConditionsCoupon.codigo
                              ? t("coupon.alreadyApplied", { defaultValue: "Cupón ya aplicado" })
                              : t("coupon.applyBtn", { defaultValue: "Aplicar" })}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : (
                /* CONTENIDO 2: LISTA DE CUPONES DISPONIBLES */
                <ScrollView 
                  style={styles.modalScroll}
                  contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 }}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  bounces={true}
                  overScrollMode="always"
                >
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

                {cuponesDisponibles.length === 0 && (
                  <Text style={{ textAlign: "center", color: c.textMuted, marginTop: 20, fontSize: 12 }}>
                    {t("coupon.empty", "No tienes cupones disponibles en este momento.")}
                  </Text>
                )}
                
                {cuponesDisponibles.map((cpx) => {
                  const esActivo = cuponAplicado?.codigo === cpx.codigo;
                  const carImages = getCouponVehicleImages(cpx);

                  let discountLabel = "";
                  if (cpx.descuentoPorcentaje) {
                    discountLabel = `${cpx.descuentoPorcentaje}% OFF`;
                  } else if (cpx.descuentoFijo) {
                    discountLabel = `${formatCurrency(cpx.descuentoFijo, monedaActual, tasaUSD)} OFF`;
                  } else {
                    discountLabel = t(cpx.descripcion || "Descuento");
                  }

                  const ruleLabel = cpx.regla || (cpx.reglas?.minimoDias ? `Min ${cpx.reglas.minimoDias} días` : "Todos los vehículos");

                  return (
                    <View key={cpx.codigo} style={styles.ticketWrapper}>
                      <View style={[styles.couponCard, { backgroundColor: c.bgCard, borderColor: esActivo ? primaryAccent : c.border }, esActivo && { borderWidth: 2 }]}>
                        
                        {/* OUTER notches */}
                        <View style={[styles.notchLeft, { backgroundColor: c.bg }]} />
                        <View style={[styles.notchRight, { backgroundColor: c.bg }]} />

                        {/* Left Side */}
                        <View style={styles.couponLeft}>
                          <View style={styles.couponTitleRow}>
                            <Ionicons name="ticket-outline" size={14} color={primaryAccent} style={{ marginRight: 4, marginTop: 1 }} />
                            <Text style={[styles.couponTitlePremio, { color: c.textPrimary }]} numberOfLines={2}>
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
                              {cpx.expiracion && (
                                <Text style={[styles.couponDateText, { color: c.textMuted }]}>
                                  Exp: {formatDateShort(cpx.expiracion)}
                                </Text>
                              )}
                            </View>
                            <TouchableOpacity onPress={() => handleOpenConditions(cpx)}>
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
                            onPress={() => handleSeleccionarCupon(cpx, true)}
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
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  </View>
);
}

const styles = StyleSheet.create({
  cardForm: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  cardHeaderFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  cardHeaderTitulo: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  appliedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  appliedLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  appliedCode: { fontSize: 12.5, fontWeight: "700" },
  appliedDesc: { fontSize: 11 },
  inputRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 12 },
  aplicarBtn: { justifyContent: "center", paddingHorizontal: 16, borderRadius: 10 },
  aplicarBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  verCuponesBtn: { marginTop: 10, alignItems: "center" },
  verCuponesText: { fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },
  
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
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBackdropTop: {
    flex: 1,
    width: "100%",
  },
  keyboardAvoidContainer: {
    width: "100%",
    justifyContent: "flex-end",
  },
  modalContenedor: {
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.82,
    maxHeight: height * 0.88,
    paddingBottom: 24,
    overflow: "hidden",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  modalEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitulo: {
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
  },
  modalBotonCerrarIcon: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollConditionsContent: {
    padding: 16,
    paddingBottom: 16,
  },
  conditionsCardWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  modalSubtitleCenter: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  modalDescriptionCenter: {
    fontSize: 13,
    lineHeight: 18,
  },
  conditionsCardDivider: {
    height: 1,
    marginVertical: 12,
  },
  conditionSectionHeaderCenter: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  conditionsBulletsList: {
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletDot: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  conditionTextCenter: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  modalBotonesRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    gap: 10,
  },
  modalBotonCerrarSecundario: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBotonCerrarSecundarioTexto: {
    fontSize: 13,
    fontWeight: "700",
  },
  modalBotonAceptarWrap: {
    flex: 2,
    borderRadius: 12,
  },
  modalBotonAceptar: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalBotonAceptarTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // Ticket styles
  ticketWrapper: { marginBottom: 14 },
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
  couponLeft: { flex: 3.2, padding: 12, justifyContent: "space-between" },
  couponTitleRow: { flexDirection: "row", alignItems: "flex-start" },
  couponTitlePremio: { fontSize: 12, fontWeight: "700", lineHeight: 16, flex: 1 },
  couponImagesRow: { flexDirection: "row", gap: 5, marginVertical: 6 },
  couponCarMiniWrapper: { width: 52, height: 36, borderRadius: 6, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  couponCarMiniImage: { width: "100%", height: "100%" },
  couponConditionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  couponDateText: { fontSize: 10, marginTop: 2 },
  codeSubtitle: { fontSize: 11, fontWeight: "700" },
  expiringText: { color: "#EF4444", fontSize: 11, fontWeight: "700" },
  conditionsLink: { color: "#3B82F6", fontSize: 11, fontWeight: "700" },
  separatorContainer: { width: 1, alignSelf: "stretch", justifyContent: "center", alignItems: "center", position: "relative", overflow: "visible" },
  innerNotchTop: { position: "absolute", top: -10, width: 20, height: 20, borderRadius: 10, zIndex: 20 },
  innerNotchBottom: { position: "absolute", bottom: -10, width: 20, height: 20, borderRadius: 10, zIndex: 20 },
  dashedSeparator: { height: "100%", borderStyle: "dashed", borderWidth: 1 },
  couponRight: { flex: 1.9, padding: 10, alignItems: "center", justifyContent: "center" },
  couponDiscount: { fontSize: 16, fontWeight: "800" },
  couponRule: { fontSize: 10, fontWeight: "700", textAlign: "center", marginTop: 2, marginBottom: 8 },
  couponApplyBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6, width: "90%", alignItems: "center" },
  couponApplyBtnText: { fontSize: 11, fontWeight: "800" },
});
