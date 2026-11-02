import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { useReservaStore } from "@/store/reservationStore";
import { GRADIENTES } from "@/constants/gradients";
import {
  getBeneficiosProteccion,
  COLOR_MARCA,
} from "../constants/reservation.constants";
import { useMonedaStore } from "@/store/currencyStore";
import { formatCurrency } from "@/utils/currencyUtils";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { diasEntre } from "./BookingSummaryModal.pieces";
import { COLOR_ACENTO } from "@/constants/brandPalette";
import { styles } from './EditProtectionMileageSection/EditProtectionMileageSection.styles'

type Tema = ReturnType<typeof useTemaColores>;

interface Props {
  vehiculo: Vehiculo;
  onGuardar: () => void;
  onCancelar: () => void;
}

function formatPrecio(precio: number): string {
  const { monedaActual, tasaUSD } = useMonedaStore.getState();
  return formatCurrency(precio, monedaActual, tasaUSD);
}

function IconoBeneficio({ tipo }: { tipo: "check" | "warning" | "cross" }) {
  if (tipo === "check") return <Ionicons name="checkmark" size={15} color="#16a34a" />;
  if (tipo === "warning") return <Ionicons name="warning-outline" size={15} color="#f59e0b" />;
  return <Ionicons name="close" size={15} color="#94a3b8" />;
}

function ListaBeneficios({
  beneficios,
  c,
}: {
  beneficios: { tipo: "check" | "warning" | "cross"; texto: string }[];
  c: Tema;
}) {
  if (beneficios.length === 0) return null;
  return (
    <View style={styles.beneficiosLista}>
      {beneficios.map((b, i) => (
        <View key={i} style={styles.beneficioFila}>
          <IconoBeneficio tipo={b.tipo} />
          <Text
            style={[
              styles.beneficioTexto,
              { color: c.textSecondary },
              b.tipo === "cross" && [styles.beneficioTextoTachado, { color: c.textMuted }],
            ]}
          >
            {b.texto}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function EditProtectionMileageSection({
  vehiculo,
  onGuardar,
  onCancelar,
}: Props) {
  useMonedaStore();
  const c = useTemaColores();
  const { t } = useTranslation();
  const BENEFICIOS_PROTECCION = useMemo(() => getBeneficiosProteccion(t), [t]);

  const storePlanes = useReservaStore((s) => s.planes);
  const fechasLugar = useReservaStore((s) => s.fechasLugar);
  const actualizarPlanes = useReservaStore((s) => s.actualizarPlanes);

  // Borrador local para proteger el store en caso de cancelar
  const [draftProteccion, setDraftProteccion] = useState(storePlanes.proteccion);
  const [draftKm, setDraftKm] = useState(storePlanes.tipoKilometraje);

  const primaryAccent = c.oscuro ? COLOR_ACENTO : COLOR_MARCA;

  const kmLimitado = vehiculo.tarifas?.kmLimitado;
  const kmIlimitado = vehiculo.tarifas?.kmIlimitado;
  const seguros = vehiculo.seguros ?? [];

  const dias = useMemo(() => {
    const d = diasEntre(fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion);
    return d > 0 ? d : 1;
  }, [fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion]);

  const seguroElegido = useMemo(
    () => seguros.find((s) => s.nombre === draftProteccion) ?? null,
    [seguros, draftProteccion]
  );
  const totalProteccion = seguroElegido ? seguroElegido.precio * dias : 0;

  const kmElegido = useMemo(() => {
    if (draftKm === "limitado") return kmLimitado ?? null;
    if (draftKm === "ilimitado") return kmIlimitado ?? null;
    return null;
  }, [draftKm, kmLimitado, kmIlimitado]);
  const totalKilometraje = kmElegido ? kmElegido.precio * dias : 0;

  const handleGuardar = () => {
    actualizarPlanes({
      proteccion: draftProteccion,
      tipoKilometraje: draftKm,
    });
    onGuardar();
  };

  return (
    <View style={styles.container}>
      {/* Header con degradado azul corporativo */}
      <LinearGradient
        colors={GRADIENTES.boton.colors}
        start={GRADIENTES.boton.start}
        end={GRADIENTES.boton.end}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitulo}>
          {t("reserva.edicion.editarProteccion", { defaultValue: "Editar Tu Protección" })}
        </Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("a11y.cerrar", "Cerrar")} onPress={onCancelar} hitSlop={10}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* --- SECCIÓN 1: PROTECCIÓN --- */}
        {seguros.length > 0 && (
          <View style={[styles.card, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <View style={styles.cardHeaderFila}>
              <Ionicons name="shield-outline" size={14} color={primaryAccent} />
              <Text style={[styles.cardHeaderTitulo, { color: primaryAccent }]}>
                {t("reserva.planes.eligeTuNivelDeProteccion", { defaultValue: "Elige tu Nivel de Protección" })}
              </Text>
            </View>

            {seguros.map((seguro, idxSeguro) => {
              const activo = draftProteccion === seguro.nombre;
              const beneficios = BENEFICIOS_PROTECCION[idxSeguro] ?? [];
              const esTotal = idxSeguro === seguros.length - 1 && seguros.length > 1;

              return (
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={t(`reserva.planes.nombreSeguro.${seguro.nombre}`, { defaultValue: seguro.nombre })}
                  key={seguro.nombre}
                  style={[
                    styles.opcionCard,
                    {
                      borderColor: c.border,
                      backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                    },
                    activo && [styles.opcionCardActiva, { borderColor: primaryAccent }],
                  ]}
                  onPress={() => setDraftProteccion(seguro.nombre)}
                  activeOpacity={0.88}
                >
                  <View style={styles.escudosNivelRow}>
                    {esTotal ? (
                      <>
                        <Ionicons name="shield" size={18} color={activo ? primaryAccent : "#94A3B8"} />
                        <Ionicons name="shield" size={18} color={activo ? primaryAccent : "#94A3B8"} />
                        <Ionicons name="shield" size={18} color={activo ? primaryAccent : "#94A3B8"} />
                      </>
                    ) : (
                      <>
                        <Ionicons name="shield" size={18} color={activo ? primaryAccent : "#94A3B8"} />
                        <Ionicons name="shield-outline" size={18} color="#94A3B8" />
                        <Ionicons name="shield-outline" size={18} color="#94A3B8" />
                      </>
                    )}
                  </View>

                  <Text style={[styles.planNombreGrande, { color: c.textPrimary }]}>
                    {t(`reserva.planes.nombreSeguro.${seguro.nombre}`, { defaultValue: seguro.nombre })}
                  </Text>

                  <View style={styles.planPrecioRow}>
                    <Text style={[styles.planPrecioValor, { color: primaryAccent }]}>
                      {formatPrecio(seguro.precio)}
                    </Text>
                    <Text style={[styles.planPrecioUnidad, { color: c.textMuted }]}>
                      {t("reserva.planes.porDia", { defaultValue: "/ día" })}
                    </Text>
                  </View>

                  <View style={[styles.planDivisor, { backgroundColor: c.border }]} />

                  <ListaBeneficios beneficios={beneficios} c={c} />

                  {activo ? (
                    <LinearGradient
                      colors={GRADIENTES.boton.colors}
                      start={GRADIENTES.boton.start}
                      end={GRADIENTES.boton.end}
                      style={styles.btnPlanSeleccionado}
                    >
                      <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                      <Text style={styles.btnPlanSeleccionadoTexto}>
                        {t("reserva.planes.planSeleccionado", { defaultValue: "PLAN SELECCIONADO" })}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.btnPlanNoSeleccionado,
                        {
                          backgroundColor: c.oscuro ? c.bgCard : "#F1F5F9",
                          borderColor: c.border,
                        },
                      ]}
                    >
                      <Text style={[styles.btnPlanNoSeleccionadoTexto, { color: c.textSecondary }]}>
                        {t("reserva.planes.elegirPlan", { defaultValue: "ELEGIR PLAN" })}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            <View style={[styles.footerTotalTarjeta, { borderTopColor: c.border }]}>
              <Text style={[styles.footerTotalLabel, { color: c.textSecondary }]}>
                {seguroElegido
                  ? t("reserva.planes.totalProteccionNombre", {
                      nombre: t(`reserva.planes.nombreSeguro.${seguroElegido.nombre}`, {
                        defaultValue: seguroElegido.nombre,
                      }),
                      dias,
                      unidad:
                        dias === 1
                          ? t("reserva.planes.dia", { defaultValue: "día" })
                          : t("reserva.planes.dias", { defaultValue: "días" }),
                      defaultValue: `Total ${seguroElegido.nombre} (${dias} ${dias === 1 ? "día" : "días"})`,
                    })
                  : t("reserva.planes.totalPlanProteccion", {
                      dias,
                      unidad:
                        dias === 1
                          ? t("reserva.planes.dia", { defaultValue: "día" })
                          : t("reserva.planes.dias", { defaultValue: "días" }),
                      defaultValue: `Total plan de protección (${dias} ${dias === 1 ? "día" : "días"})`,
                    })}
              </Text>
              <Text style={[styles.footerTotalValor, { color: primaryAccent }]}>
                {formatPrecio(totalProteccion)}
              </Text>
            </View>
          </View>
        )}

        {/* --- SECCIÓN 2: TIPO DE KILOMETRAJE --- */}
        {(kmLimitado || kmIlimitado) && (
          <View style={[styles.card, { backgroundColor: c.bgCard, borderColor: c.border, marginTop: 14 }]}>
            <View style={styles.cardHeaderFila}>
              <Ionicons name="speedometer-outline" size={14} color={primaryAccent} />
              <Text style={[styles.cardHeaderTitulo, { color: primaryAccent }]}>
                {t("reserva.planes.tipoKilometraje", { defaultValue: "Tipo de Kilometraje" })}
              </Text>
            </View>

            {kmLimitado && (
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("reserva.planes.kmLimitadoTitulo", { defaultValue: "Kilometraje limitado" })}
                style={[
                  styles.opcionCard,
                  {
                    borderColor: c.border,
                    backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                  },
                  draftKm === "limitado" && [styles.opcionCardActiva, { borderColor: primaryAccent }],
                ]}
                onPress={() => setDraftKm("limitado")}
                activeOpacity={0.88}
              >
                <Text style={[styles.planNombreGrande, { color: c.textPrimary }]}>
                  {t("reserva.planes.kmLimitadoTitulo", { defaultValue: "Kilometraje limitado" })}
                </Text>

                <Text style={[styles.kmDescripcionTexto, { color: c.textSecondary }]}>
                  {t("reserva.planes.kmLimitadoTexto", {
                    km: kmLimitado.km,
                    excedente: formatPrecio(kmLimitado.excedente ?? 800),
                    defaultValue: `Incluye ${kmLimitado.km} km por día dentro del valor de la tarifa. Si te pasas del límite, se cobra ${formatPrecio(kmLimitado.excedente ?? 800)} por cada km adicional.`,
                  })}
                </Text>

                <View style={styles.planPrecioRow}>
                  {kmLimitado.precio === 0 ? (
                    <Text style={[styles.planPrecioValor, { color: primaryAccent, fontSize: 15 }]}>
                      {t("vehiculo.includedInBaseRate", { defaultValue: "Incluido en la tarifa" })}
                    </Text>
                  ) : (
                    <>
                      <Text style={[styles.planPrecioValor, { color: primaryAccent }]}>
                        +{formatPrecio(kmLimitado.precio)}
                      </Text>
                      <Text style={[styles.planPrecioUnidad, { color: c.textMuted }]}>
                        {t("reserva.planes.porDia", { defaultValue: "/ día" })}
                      </Text>
                    </>
                  )}
                </View>

                {draftKm === "limitado" ? (
                  <LinearGradient
                    colors={GRADIENTES.boton.colors}
                    start={GRADIENTES.boton.start}
                    end={GRADIENTES.boton.end}
                    style={styles.btnPlanSeleccionado}
                  >
                    <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                    <Text style={styles.btnPlanSeleccionadoTexto}>
                      {t("reserva.planes.planSeleccionado", { defaultValue: "PLAN SELECCIONADO" })}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View
                    style={[
                      styles.btnPlanNoSeleccionado,
                      {
                        backgroundColor: c.oscuro ? c.bgCard : "#F1F5F9",
                        borderColor: c.border,
                      },
                    ]}
                  >
                    <Text style={[styles.btnPlanNoSeleccionadoTexto, { color: c.textSecondary }]}>
                      {t("reserva.planes.elegirPlan", { defaultValue: "ELEGIR PLAN" })}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {kmIlimitado && (
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("reserva.planes.kmIlimitadoTitulo", { defaultValue: "Kilometraje ilimitado" })}
                style={[
                  styles.opcionCard,
                  {
                    borderColor: c.border,
                    backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                  },
                  draftKm === "ilimitado" && [styles.opcionCardActiva, { borderColor: primaryAccent }],
                ]}
                onPress={() => setDraftKm("ilimitado")}
                activeOpacity={0.88}
              >
                <Text style={[styles.planNombreGrande, { color: c.textPrimary }]}>
                  {t("reserva.planes.kmIlimitadoTitulo", { defaultValue: "Kilometraje ilimitado" })}
                </Text>

                <Text style={[styles.kmDescripcionTexto, { color: c.textSecondary }]}>
                  {t("reserva.planes.kmIlimitadoTexto", {
                    defaultValue:
                      "Sin restricción de distancia dentro del territorio nacional. No aplica cobro adicional por exceso de kilómetros.",
                  })}
                </Text>

                <View style={styles.planPrecioRow}>
                  <Text style={[styles.planPrecioValor, { color: primaryAccent }]}>
                    +{formatPrecio(kmIlimitado.precio)}
                  </Text>
                  <Text style={[styles.planPrecioUnidad, { color: c.textMuted }]}>
                    {t("reserva.planes.porDia", { defaultValue: "/ día" })}
                  </Text>
                </View>

                {draftKm === "ilimitado" ? (
                  <LinearGradient
                    colors={GRADIENTES.boton.colors}
                    start={GRADIENTES.boton.start}
                    end={GRADIENTES.boton.end}
                    style={styles.btnPlanSeleccionado}
                  >
                    <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                    <Text style={styles.btnPlanSeleccionadoTexto}>
                      {t("reserva.planes.planSeleccionado", { defaultValue: "PLAN SELECCIONADO" })}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View
                    style={[
                      styles.btnPlanNoSeleccionado,
                      {
                        backgroundColor: c.oscuro ? c.bgCard : "#F1F5F9",
                        borderColor: c.border,
                      },
                    ]}
                  >
                    <Text style={[styles.btnPlanNoSeleccionadoTexto, { color: c.textSecondary }]}>
                      {t("reserva.planes.elegirPlan", { defaultValue: "ELEGIR PLAN" })}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            <View style={[styles.footerTotalTarjeta, { borderTopColor: c.border }]}>
              <Text style={[styles.footerTotalLabel, { color: c.textSecondary }]}>
                {t("reserva.planes.totalTipoKilometraje", {
                  dias,
                  unidad:
                    dias === 1
                      ? t("reserva.planes.dia", { defaultValue: "día" })
                      : t("reserva.planes.dias", { defaultValue: "días" }),
                  defaultValue: `Total tipo de kilometraje (${dias} ${dias === 1 ? "día" : "días"})`,
                })}
              </Text>
              <Text style={[styles.footerTotalValor, { color: primaryAccent }]}>
                {formatPrecio(totalKilometraje)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botones Footer: Cancelar y Guardar cambios */}
      <View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.bg }]}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("comun.cancelar", { defaultValue: "Cancelar" })}
          style={[
            styles.cancelarBtn,
            { borderColor: c.border, backgroundColor: c.oscuro ? c.bgCard : "#FFFFFF" },
          ]}
          onPress={onCancelar}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelarBtnTexto, { color: c.textPrimary }]}>
            {t("comun.cancelar", { defaultValue: "Cancelar" })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("reserva.edicion.guardarCambios", { defaultValue: "Guardar cambios" })} style={styles.guardarBtnWrap} onPress={handleGuardar} activeOpacity={0.85}>
          <LinearGradient
            colors={GRADIENTES.boton.colors}
            start={GRADIENTES.boton.start}
            end={GRADIENTES.boton.end}
            style={styles.guardarBtn}
          >
            <Text style={styles.guardarBtnTexto}>
              {t("reserva.edicion.guardarCambios", { defaultValue: "Guardar cambios" })}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}



export { EditProtectionMileageSection };

