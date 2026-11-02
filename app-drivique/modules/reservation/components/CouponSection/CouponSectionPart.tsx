import { Modal, View, TouchableOpacity, KeyboardAvoidingView, Platform, Text, ScrollView, Image } from 'react-native'
import { styles } from './CouponSection.styles'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { GRADIENTES } from '@/constants/gradients'
import { formatCurrency } from '@/utils/currencyUtils'
import React from 'react'

export default function CouponSectionPart({ c, cuponAplicado, cuponesDisponibles, errorMsgModal, formatDateShort, getCouponVehicleImages, handleCerrarModal, handleOpenConditions, handleSeleccionarCupon, handleVolverALista, modalVisible, monedaActual, primaryAccent, selectedConditionsCoupon, setErrorMsgModal, t, tasaUSD }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; cuponAplicado: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").Cupon | null; cuponesDisponibles: any[]; errorMsgModal: string; formatDateShort: (isoString?: string) => string; getCouponVehicleImages: (_cpx: any) => string[]; handleCerrarModal: () => void; handleOpenConditions: (cpx: any) => void; handleSeleccionarCupon: (cupon: any, fromModal?: boolean) => void; handleVolverALista: () => void; modalVisible: boolean; monedaActual: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/utils/currencyUtils").Moneda; primaryAccent: string; selectedConditionsCoupon: any; setErrorMsgModal: React.Dispatch<React.SetStateAction<string>>; t: any; tasaUSD: number }) {
  return (
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
  
                {/* Banner de error visible en ambas vistas del modal */}
                {errorMsgModal ? (
                  <View style={[styles.errorAlertBanner, { marginHorizontal: 16, marginTop: 12, marginBottom: 4, backgroundColor: c.oscuro ? "#450a0a" : "#FEF2F2", borderColor: c.oscuro ? "#7f1d1d" : "#FCA5A5" }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                      <Ionicons name="alert-circle" size={16} color={c.oscuro ? "#f87171" : "#EF4444"} />
                      <Text style={[styles.errorAlertText, { color: c.oscuro ? "#fca5a5" : "#B91C1C" }]}>{errorMsgModal}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setErrorMsgModal("")}>
                      <Ionicons name="close" size={16} color={c.oscuro ? "#f87171" : "#EF4444"} />
                    </TouchableOpacity>
                  </View>
                ) : null}
  
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
                          {t(`coupon.couponItems.${selectedConditionsCoupon.id}`, {
                            defaultValue: t(selectedConditionsCoupon.tituloPremio || selectedConditionsCoupon.descripcion, {
                              defaultValue: selectedConditionsCoupon.tituloPremio || selectedConditionsCoupon.descripcion,
                            }),
                          })}
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
                              {t("coupon.expires", { defaultValue: "Vence:" })} {formatDateShort(selectedConditionsCoupon.expiracion)}
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
  
                    const ruleLabel = cpx.regla === "Todos los vehículos"
                      ? t("coupon.allVehicles", { defaultValue: "Todos los vehículos" })
                      : cpx.reglas?.minimoDias
                      ? t("coupon.minDaysShort", { days: cpx.reglas.minimoDias, defaultValue: `Min ${cpx.reglas.minimoDias} días` })
                      : (cpx.regla ? t(`coupon.rules.${cpx.regla}`, { defaultValue: cpx.regla }) : t("coupon.allVehicles", { defaultValue: "Todos los vehículos" }));
  
                    const couponTitle = t(`coupon.couponItems.${cpx.id}`, {
                      defaultValue: t(cpx.tituloPremio || cpx.descripcion || "Cupón de Descuento", {
                        defaultValue: cpx.tituloPremio || cpx.descripcion || "Cupón de Descuento",
                      }),
                    });
  
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
                                {couponTitle}
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
  )
}
