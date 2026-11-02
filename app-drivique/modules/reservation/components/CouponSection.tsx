import React, { useState, useEffect } from "react";
import { View, Text, Modal } from 'react-native'



import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { COLOR_MARCA } from "../constants/reservation.constants";
import { useReservaStore } from "@/store/reservationStore";

import { Vehiculo } from "@/modules/catalog/types/catalog.types";


import { useMonedaStore } from "@/store/currencyStore";
import { pricingService } from "../services/pricingService";
import { COLOR_ACENTO } from "@/constants/brandPalette";
import { useBrandStore } from "@/store/brandStore";
import { styles } from './CouponSection/CouponSection.styles'
import CouponSectionPart from './CouponSection/CouponSectionPart'
import CuponAplicado2 from './CouponSection/CuponAplicado2'
import CuponAplicado from './CouponSection/CuponAplicado'



interface Props {
  vehiculo: Vehiculo;
}

export default function CouponSection({ vehiculo }: Props) {
  const c = useTemaColores();
  const { t, i18n } = useTranslation();
  
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
  
  const [cuponesDisponibles, setCuponesDisponibles] = useState<any[]>([]);

  useEffect(() => {
    let activo = true;
    pricingService
      .getPublishedPromotions()
      .then((lista) => {
        if (!activo) return;
        // Solo cupones vigentes que aplican a este vehículo o categoría (o a todos). La validación final la hace el servidor.
        const hoy = new Date().toISOString().slice(0, 10);
        const filtrados = lista.filter((p: any) => {
          if (!p.active) return false;
          if (p.startDate && String(p.startDate).slice(0, 10) > hoy) return false;
          if (p.endDate && String(p.endDate).slice(0, 10) < hoy) return false;
          if (p.maxUsesLimit != null && Number(p.currentUsesCount ?? 0) >= Number(p.maxUsesLimit)) return false;
          if (p.vehicleId && vehiculo?.uuid && p.vehicleId !== vehiculo.uuid && p.vehicleId !== vehiculo.id) {
            return false;
          }
          const categoriaCupon = p.vehicleCategoryId ?? p.categoryId;
          if (categoriaCupon && vehiculo?.categoriaId && categoriaCupon !== vehiculo.categoriaId) {
            return false;
          }
          return true;
        });

        setCuponesDisponibles(
          filtrados.map((p: any) => ({
            id: p.id,
            codigo: p.code,
            tituloPremio: p.name || p.code,
            descripcion: p.conditions || p.name || `Descuento ${p.code}`,
            descuentoPorcentaje: String(p.discountType).toUpperCase().includes("PERCENT") ? Number(p.discountValue) : undefined,
            descuentoFijo: String(p.discountType).toUpperCase().includes("PERCENT") ? undefined : Number(p.discountValue),
            expiracion: p.endDate || p.endsAt,
            condicionesDetalladas: p.conditions,
            reglas: {
              minimoDias: p.minimumRentalDays,
              montoMinimo: p.minimumAmount,
              categoriasValidas: p.vehicleCategoryName ?? p.categoryName ? [p.vehicleCategoryName ?? p.categoryName] : [],
            },
          })),
        );
      })
      .catch(() => activo && setCuponesDisponibles([]));
    return () => {
      activo = false;
    };
  }, [vehiculo?.uuid, vehiculo?.categoriaId]);

  const marca = useBrandStore((s) => s.marca);
  const primaryAccent = marca?.primary || (c.oscuro ? COLOR_ACENTO : COLOR_MARCA);

  const getCouponVehicleImages = (_cpx: any): string[] => {
    const img = (vehiculo.imagenes && vehiculo.imagenes[0]) || vehiculo.imagen;
    return img ? [img] : [];
  };

  const formatDateShort = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const lang = i18n.language || "es";
      const localeMap: Record<string, string> = {
        es: "es-CO",
        en: "en-US",
        fr: "fr-FR",
        pt: "pt-PT",
        br: "pt-BR",
      };
      const loc = localeMap[lang] || "es-CO";
      return date.toLocaleDateString(loc, { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return "";
    }
  };
  
  const [validando, setValidando] = useState(false);

  const getFriendlyErrorMessage = (error: any): string => {
    const rawMsg = String(
      error?.response?.data?.detail ||
      error?.response?.data?.title ||
      error?.response?.data?.message ||
      error?.message ||
      ""
    ).toLowerCase();

    const status = error?.response?.status;

    if (rawMsg.includes("full authentication") || status === 401) {
      return t("coupon.errorAuthRequired", {
        defaultValue: "Debes iniciar sesión para aplicar este cupón a tu reserva.",
      });
    }

    if (rawMsg.includes("not found") || rawMsg.includes("no encontrado") || status === 404) {
      return t("coupon.errorNotFoundOrExpired", {
        defaultValue: "El código ingresado no existe o ya expiró.",
      });
    }

    if (rawMsg.includes("not active") || rawMsg.includes("no está activa") || rawMsg.includes("no se encuentra activa")) {
      return t("coupon.errorNotActive", {
        defaultValue: "Este cupón no se encuentra activo actualmente.",
      });
    }

    if (rawMsg.includes("not met") || rawMsg.includes("condiciones") || rawMsg.includes("minimumrental") || rawMsg.includes("días")) {
      return t("coupon.errorConditionsNotMet", {
        defaultValue: "Tu reserva no cumple con las condiciones mínimas de días requeridas para este cupón.",
      });
    }

    if (rawMsg.includes("no aplica a este vehículo") || rawMsg.includes("vehicle mismatch") || rawMsg.includes("no aplica a esta categoría")) {
      return t("coupon.errorVehicleMismatch", {
        defaultValue: "Este cupón no aplica para el vehículo o categoría seleccionada.",
      });
    }

    if (rawMsg.includes("valor mínimo") || rawMsg.includes("minimum amount") || rawMsg.includes("no alcanza")) {
      return t("coupon.errorMinimumAmount", {
        defaultValue: "El monto total de la reserva no alcanza el valor mínimo requerido para este cupón.",
      });
    }

    if (rawMsg.includes("already used") || rawMsg.includes("ya fue usado") || rawMsg.includes("ya utilizado") || rawMsg.includes("ya has utilizado") || rawMsg.includes("reserva anterior")) {
      return t("coupon.errorAlreadyUsed", {
        defaultValue: "Ya has utilizado este cupón en una reserva anterior.",
      });
    }

    if (rawMsg.includes("limit reached") || rawMsg.includes("límite máximo de usos") || rawMsg.includes("límite de usos")) {
      return t("coupon.errorLimitReached", {
        defaultValue: "Este cupón ha alcanzado el límite máximo de usos disponibles.",
      });
    }

    if (rawMsg.includes("no está disponible para tu perfil") || rawMsg.includes("audience")) {
      return t("coupon.errorAudience", {
        defaultValue: "Este cupón está reservado para clientes con otro tipo de perfil (ej. primera reserva).",
      });
    }

    if (rawMsg.includes("conflicto") || rawMsg.includes("conflict")) {
      return t("coupon.errorGeneric", {
        defaultValue: "No fue posible aplicar el cupón. Es posible que ya lo hayas utilizado o no cumpla los requisitos de la reserva.",
      });
    }

    const originalDetail = error?.response?.data?.detail;
    if (originalDetail && typeof originalDetail === "string" && !originalDetail.toLowerCase().includes("conflicto con el estado actual")) {
      return originalDetail;
    }

    return t("coupon.errorGeneric", {
      defaultValue: "No fue posible aplicar el cupón. Por favor verifica los términos y condiciones.",
    });
  };

  const validarYAplicar = async (codigo: string, fromModal: boolean) => {
    setErrorMsg("");
    setErrorMsgModal("");
    const setError = (msg: string) => (fromModal ? setErrorMsgModal(msg) : setErrorMsg(msg));
    if (!vehiculo.uuid || !vehiculo.categoriaId || !fechasLugar.fechaRetiro || !fechasLugar.fechaDevolucion) {
      setError(t("coupon.errorNeedDates", { defaultValue: "Selecciona las fechas de la reserva antes de aplicar un cupón." }));
      return;
    }
    setValidando(true);
    try {
      const res = await pricingService.validatePromotion({
        code: codigo,
        vehicleId: vehiculo.uuid,
        categoryId: vehiculo.categoriaId,
        pickupDate: fechasLugar.fechaRetiro,
        returnDate: fechasLugar.fechaDevolucion,
      });
      const esPorcentaje = String(res.discountType).toUpperCase().includes("PERCENT");
      aplicarCupon({
        codigo: res.code,
        descuentoPorcentaje: esPorcentaje ? Number(res.discountValue) : undefined,
        descuentoFijo: esPorcentaje ? undefined : Number(res.discountValue),
      });
      setModalVisible(false);
      setCodigoManual("");
    } catch (e: any) {
      setError(getFriendlyErrorMessage(e));
    } finally {
      setValidando(false);
    }
  };

  const handleSeleccionarCupon = (cupon: any, fromModal: boolean = false) => {
    validarYAplicar(cupon.codigo, fromModal);
  };

  const handleAplicarManual = () => {
    const code = codigoManual.trim().toUpperCase();
    if (!code) return;
    validarYAplicar(code, false);
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
        <Text style={[styles.cardHeaderTitulo, { color: c.oscuro ? "#F8FAFC" : "#0F172A" }]}>
          {t("coupon.title", { defaultValue: "Cupón de descuento (Opcional)" })}
        </Text>
      </View>

      {cuponAplicado ? (
        <CuponAplicado c={c} cuponAplicado={cuponAplicado} monedaActual={monedaActual} removerCupon={removerCupon} t={t} tasaUSD={tasaUSD} />
      ) : (
        <CuponAplicado2 c={c} codigoManual={codigoManual} errorMsg={errorMsg} handleAplicarManual={handleAplicarManual} primaryAccent={primaryAccent} setCodigoManual={setCodigoManual} setErrorMsg={setErrorMsg} setErrorMsgModal={setErrorMsgModal} setModalVisible={setModalVisible} setSelectedConditionsCoupon={setSelectedConditionsCoupon} t={t} validando={validando} />
      )}

      {/* ── Modal: Cupones Disponibles / Condiciones ── */}
      <CouponSectionPart c={c} cuponAplicado={cuponAplicado} cuponesDisponibles={cuponesDisponibles} errorMsgModal={errorMsgModal} formatDateShort={formatDateShort} getCouponVehicleImages={getCouponVehicleImages} handleCerrarModal={handleCerrarModal} handleOpenConditions={handleOpenConditions} handleSeleccionarCupon={handleSeleccionarCupon} handleVolverALista={handleVolverALista} modalVisible={modalVisible} monedaActual={monedaActual} primaryAccent={primaryAccent} selectedConditionsCoupon={selectedConditionsCoupon} setErrorMsgModal={setErrorMsgModal} t={t} tasaUSD={tasaUSD} />
  </View>
);
}


