import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from "expo-linear-gradient";

import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { useReservaStore } from "@/store/reservationStore";
import { GRADIENTES } from "@/constants/gradients";
import { getBeneficiosProteccion, getBeneficiosKilometraje, COLOR_MARCA } from '../constants/reservation.constants'
import { AlertModal } from "../../../components/ui/AlertModal";
import { useMonedaStore } from "@/store/currencyStore";

import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { COLOR_ACENTO } from "@/constants/brandPalette";
import { styles } from './AdditionalPlans/AdditionalPlans.styles'
import Length2 from './AdditionalPlans/Length2'
import KmLimitado from './AdditionalPlans/KmLimitado'
import Length from './AdditionalPlans/Length'

export type Tema = ReturnType<typeof useTemaColores>;

interface Props {
  vehiculo: Vehiculo;
  onContinuar?: () => void;
}



function calcularDias(fechaRetiro: string | null, fechaDevolucion: string | null): number {
  if (!fechaRetiro || !fechaDevolucion) return 1;
  const inicio = new Date(fechaRetiro + "T00:00:00");
  const fin = new Date(fechaDevolucion + "T00:00:00");
  const diffMs = fin.getTime() - inicio.getTime();
  const dias = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return dias > 0 ? dias : 1;
}







export default function PlanesAdicionales({ vehiculo, onContinuar }: Props) {
  useMonedaStore();
  const c = useTemaColores();
  const { t } = useTranslation();
  const BENEFICIOS_PROTECCION = useMemo(() => getBeneficiosProteccion(t), [t]);
  const BENEFICIOS_KILOMETRAJE = useMemo(() => getBeneficiosKilometraje(t), [t]);
  const planes = useReservaStore((s) => s.planes);
  const fechasLugar = useReservaStore((s) => s.fechasLugar);
  const actualizarPlanes = useReservaStore((s) => s.actualizarPlanes);
  const toggleServicioAdicional = useReservaStore((s) => s.toggleServicioAdicional);

  const [alertaFaltantesVisible, setAlertaFaltantesVisible] = useState(false);

  const primaryAccent = c.oscuro ? COLOR_ACENTO : COLOR_MARCA;

  const todosLosServicios = useMemo(
    () =>
      (vehiculo.servicios ?? []).filter(
        (s) =>
          !s.nombre.toLowerCase().includes("conductor") &&
          !s.nombre.toLowerCase().includes("otra ciudad")
      ),
    [vehiculo.servicios]
  );
  const kmLimitado = vehiculo.tarifas?.kmLimitado;
  const kmIlimitado = vehiculo.tarifas?.kmIlimitado;
  const seguros = vehiculo.seguros ?? [];

  const dias = useMemo(
    () => calcularDias(fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion),
    [fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion]
  );

  const seguroElegido = useMemo(
    () => seguros.find((s) => s.nombre === planes.proteccion) ?? null,
    [seguros, planes.proteccion]
  );
  const totalProteccion = seguroElegido ? seguroElegido.precio * dias : 0;

  const kmElegido = useMemo(() => {
    if (planes.tipoKilometraje === "limitado") return kmLimitado ?? null;
    if (planes.tipoKilometraje === "ilimitado") return kmIlimitado ?? null;
    return null;
  }, [planes.tipoKilometraje, kmLimitado, kmIlimitado]);
  const totalKilometraje = kmElegido ? kmElegido.precio * dias : 0;

  const totalServicios = useMemo(() => {
    return todosLosServicios
      .filter((s) => planes.serviciosSeleccionados.includes(s.nombre))
      .reduce((acc, s) => acc + s.precio * dias, 0);
  }, [todosLosServicios, planes.serviciosSeleccionados, dias]);

  const totalPlanes = totalProteccion + totalKilometraje + totalServicios;

  const puedeContinuar = !!planes.proteccion && !!planes.tipoKilometraje;

  const handleIrADatos = () => {
    if (!puedeContinuar) {
      setAlertaFaltantesVisible(true);
      return;
    }
    onContinuar?.();
  };

  return (
    <View>
      {/* --- SECCIÓN PROTECCIÓN --- */}
      {seguros.length > 0 && (
        <Length BENEFICIOS_PROTECCION={BENEFICIOS_PROTECCION} actualizarPlanes={actualizarPlanes} c={c} dias={dias} planes={planes} primaryAccent={primaryAccent} seguroElegido={seguroElegido} seguros={seguros} t={t} totalProteccion={totalProteccion} />
      )}

      {/* --- SECCIÓN TIPO DE KILOMETRAJE --- */}
      {(kmLimitado || kmIlimitado) && (
        <KmLimitado actualizarPlanes={actualizarPlanes} c={c} dias={dias} kmIlimitado={kmIlimitado} kmLimitado={kmLimitado} planes={planes} primaryAccent={primaryAccent} t={t} totalKilometraje={totalKilometraje} />
      )}

      {/* --- SECCIÓN SERVICIOS ADICIONALES --- */}
      {todosLosServicios.length > 0 && (
        <Length2 c={c} dias={dias} planes={planes} primaryAccent={primaryAccent} t={t} todosLosServicios={todosLosServicios} toggleServicioAdicional={toggleServicioAdicional} totalServicios={totalServicios} />
      )}

      {/* Botón Continuar */}
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("reserva.planes.continuar", { defaultValue: "Continuar" })} style={styles.confirmarBtnWrap} onPress={handleIrADatos} activeOpacity={0.85}>
        <LinearGradient
          colors={GRADIENTES.boton.colors}
          start={GRADIENTES.boton.start}
          end={GRADIENTES.boton.end}
          style={styles.confirmarBtn}
        >
          <Text style={styles.confirmarBtnText}>
            {t("reserva.planes.continuar", { defaultValue: "Continuar" })}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <AlertModal
        visible={alertaFaltantesVisible}
        icono="alert-circle-outline"
        titulo={t("reserva.planes.alertaFaltantesTitulo", { defaultValue: "Faltan datos por completar" })}
        mensaje={t("reserva.planes.alertaFaltantesMensaje", {
          defaultValue: "Elige un plan de protección y un tipo de kilómetros para continuar.",
        })}
        botones={[]}
        onCerrar={() => setAlertaFaltantesVisible(false)}
      />
    </View>
  );
}


