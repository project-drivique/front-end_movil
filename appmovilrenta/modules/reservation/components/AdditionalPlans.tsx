import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { useReservaStore } from "@/store/reservationStore";
import { GRADIENTES } from "@/constants/gradients";
import {
  getBeneficiosProteccion,
  getBeneficiosKilometraje,
  COLOR_MARCA,
  ICONOS_SERVICIOS,
  ICONO_SERVICIO_DEFECTO,
} from "../constants/reservation.constants";
import { AlertModal } from "../../../components/ui/AlertModal";
import { useMonedaStore } from "@/store/currencyStore";
import { formatCurrency } from "@/utils/currencyUtils";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";

type Tema = ReturnType<typeof useTemaColores>;

interface Props {
  vehiculo: Vehiculo;
  onContinuar?: () => void;
}

function formatPrecio(precio: number): string {
  const { monedaActual, tasaUSD } = useMonedaStore.getState();
  return formatCurrency(precio, monedaActual, tasaUSD);
}

function calcularDias(fechaRetiro: string | null, fechaDevolucion: string | null): number {
  if (!fechaRetiro || !fechaDevolucion) return 1;
  const inicio = new Date(fechaRetiro);
  const fin = new Date(fechaDevolucion);
  const diffMs = fin.getTime() - inicio.getTime();
  const dias = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return dias > 0 ? dias : 1;
}

function IconoBeneficio({ tipo, c }: { tipo: "check" | "warning" | "cross"; c: Tema }) {
  if (tipo === "check") return <Ionicons name="checkmark-circle" size={13} color="#16a34a" />;
  if (tipo === "warning") return <Ionicons name="alert-circle" size={13} color="#f59e0b" />;
  return <Ionicons name="close-circle" size={13} color="#dc2626" />;
}

// Lista de beneficios reutilizable — mismo bloque visual usado en
// Protección, Kilometraje limitado y Kilometraje ilimitado.
function ListaBeneficios({ beneficios, c }: { beneficios: { tipo: "check" | "warning" | "cross"; texto: string }[]; c: Tema }) {
  if (beneficios.length === 0) return null;
  return (
    <View style={styles.beneficiosLista}>
      {beneficios.map((b, i) => (
        <View key={i} style={styles.beneficioFila}>
          <IconoBeneficio tipo={b.tipo} c={c} />
          <Text style={[styles.beneficioTexto, { color: c.textSecondary }, b.tipo === "cross" && [styles.beneficioTextoTachado, { color: c.textMuted }]]}>
            {b.texto}
          </Text>
        </View>
      ))}
    </View>
  );
}

// Footer de total al final de cada tarjeta (Protección / Kilometraje /
// Servicios). Mismo bloque visual en las tres, solo cambia el label.
function FooterTotalTarjeta({ label, valor, c }: { label: string; valor: number; c: Tema }) {
  return (
    <View style={[styles.footerTotalTarjeta, { borderTopColor: c.border }]}>
      <Text style={[styles.footerTotalLabel, { color: c.textSecondary }]}>{label}</Text>
      <Text style={styles.footerTotalValor}>{formatPrecio(valor)}</Text>
    </View>
  );
}

export default function PlanesAdicionales({ vehiculo, onContinuar }: Props) {
  // Nos suscribimos al store de moneda para re-renderizar los precios
  // cuando cambie COP↔USD o llegue una tasa nueva.
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

  // Servicios adicionales: exclusivamente los que trae el vehículo en
  // vehiculo.servicios (JSON del catálogo). Nada hardcodeado aquí —
  // así cada vehículo puede tener precios y disponibilidad distintos.
  const todosLosServicios = vehiculo.servicios ?? [];
  const kmLimitado = vehiculo.tarifas?.kmLimitado;
  const kmIlimitado = vehiculo.tarifas?.kmIlimitado;
  const seguros = vehiculo.seguros ?? [];

  const dias = useMemo(
    () => calcularDias(fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion),
    [fechasLugar.fechaRetiro, fechasLugar.fechaDevolucion]
  );

  // --- Totales por sección (para footers de cada tarjeta y para el
  // resumen final). Todos en función de los "días" del alquiler. ---

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

  // Suma de las tres secciones de este tab — no incluye la tarifa base
  // del vehículo ni cargos administrativos/IVA, eso vive en el
  // desglose del ResumenReservaModal.
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
      {/* --- PROTECCIÓN --- */}
      {seguros.length > 0 && (
        <>
          <Text style={[styles.seccionLabel, { color: c.textMuted }]}>{t("reserva.planes.elegirProteccion")}</Text>
          <View style={[styles.card, { backgroundColor: c.bgCard }]}>
            {seguros.map((seguro) => {
              const activo = planes.proteccion === seguro.nombre;
              const beneficios = BENEFICIOS_PROTECCION[seguro.nombre] ?? [];

              return (
                <TouchableOpacity
                  key={seguro.nombre}
                  style={[styles.opcionCard, { borderColor: c.border }, activo && [styles.opcionCardActiva, { backgroundColor: c.primaryBg }]]}
                  onPress={() => actualizarPlanes({ proteccion: seguro.nombre })}
                  activeOpacity={0.8}
                >
                  <View style={styles.opcionHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.opcionTitulo, { color: c.textSecondary }, activo && styles.opcionTituloActiva]}>
                        {t(`reserva.planes.nombreSeguro.${seguro.nombre}`, { defaultValue: seguro.nombre })}
                      </Text>
                      <Text style={[styles.opcionDesc, { color: c.textMuted }, activo && styles.opcionDescActiva]}>
                        {t("reserva.planes.precioSeguroLinea", {
                          precioDia: formatPrecio(seguro.precio),
                          precioTotal: formatPrecio(seguro.precio * dias),
                          dias,
                          unidad: dias === 1 ? t("reserva.planes.dia") : t("reserva.planes.dias"),
                        })}
                      </Text>
                    </View>
                    <View style={[styles.radio, { borderColor: c.border }, activo && styles.radioActivo]}>
                      {activo && <View style={styles.radioPunto} />}
                    </View>
                  </View>

                  <ListaBeneficios beneficios={beneficios} c={c} />
                </TouchableOpacity>
              );
            })}

            {seguroElegido && (
              <FooterTotalTarjeta label={t("reserva.planes.totalProteccion")} valor={totalProteccion} c={c} />
            )}
          </View>
        </>
      )}

      {/* --- TIPO DE KILÓMETROS --- */}
      {(kmLimitado || kmIlimitado) && (
        <>
          <Text style={[styles.seccionLabel, { color: c.textMuted, marginTop: 20 }]}>{t("reserva.planes.tipoKilometraje")}</Text>
          <View style={styles.kmFila}>
            {kmLimitado && (
              <TouchableOpacity
                style={[
                  styles.kmOpcionCard,
                  { borderColor: c.border, backgroundColor: c.bgInput },
                  planes.tipoKilometraje === "limitado" && [styles.opcionCardActiva, { backgroundColor: c.primaryBg, borderColor: COLOR_MARCA }],
                ]}
                onPress={() => actualizarPlanes({ tipoKilometraje: "limitado" })}
                activeOpacity={0.8}
              >
                <View style={styles.opcionHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.opcionTitulo,
                        { color: c.textSecondary },
                        planes.tipoKilometraje === "limitado" && styles.opcionTituloActiva,
                      ]}
                    >
                      {t("reserva.planes.kmLimitadoTitulo")}
                    </Text>
                    <Text
                      style={[
                        styles.opcionDesc,
                        { color: c.textMuted },
                        planes.tipoKilometraje === "limitado" && styles.opcionDescActiva,
                      ]}
                    >
                      {t("reserva.planes.kmLimitadoDesc", { km: kmLimitado.km, precio: formatPrecio(kmLimitado.precio) })}
                      {kmLimitado.excedente ? t("reserva.planes.kmLimitadoExcedente", { excedente: formatPrecio(kmLimitado.excedente) }) : ""}
                    </Text>
                  </View>
                  <View style={[styles.radio, { borderColor: c.border }, planes.tipoKilometraje === "limitado" && styles.radioActivo]}>
                    {planes.tipoKilometraje === "limitado" && <View style={styles.radioPunto} />}
                  </View>
                </View>

                <ListaBeneficios beneficios={BENEFICIOS_KILOMETRAJE.limitado} c={c} />
              </TouchableOpacity>
            )}

            {kmIlimitado && (
              <TouchableOpacity
                style={[
                  styles.kmOpcionCard,
                  { borderColor: c.border, backgroundColor: c.bgInput },
                  planes.tipoKilometraje === "ilimitado" && [styles.opcionCardActiva, { backgroundColor: c.primaryBg, borderColor: COLOR_MARCA }],
                ]}
                onPress={() => actualizarPlanes({ tipoKilometraje: "ilimitado" })}
                activeOpacity={0.8}
              >
                <View style={styles.opcionHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.opcionTitulo,
                        { color: c.textSecondary },
                        planes.tipoKilometraje === "ilimitado" && styles.opcionTituloActiva,
                      ]}
                    >
                      {t("reserva.planes.kmIlimitadoTitulo")}
                    </Text>
                    <Text
                      style={[
                        styles.opcionDesc,
                        { color: c.textMuted },
                        planes.tipoKilometraje === "ilimitado" && styles.opcionDescActiva,
                      ]}
                    >
                      {t("reserva.planes.kmIlimitadoDesc", { precio: formatPrecio(kmIlimitado.precio) })}
                    </Text>
                  </View>
                  <View style={[styles.radio, { borderColor: c.border }, planes.tipoKilometraje === "ilimitado" && styles.radioActivo]}>
                    {planes.tipoKilometraje === "ilimitado" && <View style={styles.radioPunto} />}
                  </View>
                </View>

                <ListaBeneficios beneficios={BENEFICIOS_KILOMETRAJE.ilimitado} c={c} />
              </TouchableOpacity>
            )}
          </View>

          {kmElegido && (
            <View style={[styles.card, { backgroundColor: c.bgCard }]}>
              <FooterTotalTarjeta label={t("reserva.planes.totalKilometraje")} valor={totalKilometraje} c={c} />
            </View>
          )}
        </>
      )}

      {/* --- SERVICIOS ADICIONALES (opcionales) --- */}
      {todosLosServicios.length > 0 && (
        <>
          <Text style={[styles.seccionLabel, { color: c.textMuted, marginTop: 20 }]}>{t("reserva.planes.serviciosAdicionales")}</Text>
          <View style={[styles.card, { backgroundColor: c.bgCard }]}>
            <Text style={[styles.serviciosSub, { color: c.textMuted }]}>{t("reserva.planes.elegirServicios")}</Text>

            {todosLosServicios.map((servicio) => {
              const seleccionado = planes.serviciosSeleccionados.includes(servicio.nombre);
              const icono = ICONOS_SERVICIOS[servicio.nombre] ?? ICONO_SERVICIO_DEFECTO;

              return (
                <TouchableOpacity
                  key={servicio.nombre}
                  style={[styles.servicioCard, { borderColor: c.border }, seleccionado && [styles.opcionCardActiva, { backgroundColor: c.primaryBg }]]}
                  onPress={() => toggleServicioAdicional(servicio.nombre)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={seleccionado ? "checkbox" : "square-outline"}
                    size={18}
                    color={seleccionado ? COLOR_MARCA : c.textMuted}
                  />
                  <Ionicons
                    name={icono as any}
                    size={14}
                    color={seleccionado ? COLOR_MARCA : c.textMuted}
                    style={{ marginLeft: 8, marginRight: 8 }}
                  />
                  <Text style={[styles.servicioNombre, { color: c.textSecondary }, seleccionado && styles.opcionTituloActiva]} numberOfLines={2}>
                    {t(`reserva.planes.nombreServicio.${servicio.nombre}`, { defaultValue: servicio.nombre })}
                  </Text>
                  {servicio.precio > 0 && (
                    <Text style={[styles.servicioPrecio, { color: c.textMuted }]}>{formatPrecio(servicio.precio)}{t("reserva.planes.porDia")}</Text>
                  )}
                </TouchableOpacity>
              );
            })}

            {totalServicios > 0 && (
              <FooterTotalTarjeta label={t("reserva.planes.totalServiciosAdicionales")} valor={totalServicios} c={c} />
            )}
          </View>
        </>
      )}

      {/* --- RESUMEN DE PLANES: tarjeta final con el desglose de las
          tres secciones de este tab (protección + kilometraje +
          servicios). Solo se muestra si hay al menos algo elegido, para
          no aparecer vacía apenas se entra al tab. --- */}
      {totalPlanes > 0 && (
        <>
          <Text style={[styles.seccionLabel, { color: c.textMuted, marginTop: 20 }]}>{t("reserva.planes.resumenDePlanes")}</Text>
          <View style={[styles.card, { backgroundColor: c.bgCard }]}>
            <View style={styles.resumenSubcard}>
              {seguroElegido && (
                <View style={styles.lineaPrecio}>
                  <Text style={[styles.lineaLabel, { color: c.textSecondary }]}>{t("reserva.planes.proteccionLinea", { nombre: t(`reserva.planes.nombreSeguro.${seguroElegido.nombre}`, { defaultValue: seguroElegido.nombre }) })}</Text>
                  <Text style={[styles.lineaValor, { color: c.textPrimary }]}>{formatPrecio(totalProteccion)}</Text>
                </View>
              )}
              {kmElegido && (
                <View style={styles.lineaPrecio}>
                  <Text style={[styles.lineaLabel, { color: c.textSecondary }]}>
                    {t("reserva.planes.kilometrajeLinea", { tipo: planes.tipoKilometraje === "limitado" ? t("reserva.planes.limitado") : t("reserva.planes.ilimitado") })}
                  </Text>
                  <Text style={[styles.lineaValor, { color: c.textPrimary }]}>{formatPrecio(totalKilometraje)}</Text>
                </View>
              )}
              {totalServicios > 0 && (
                <View style={styles.lineaPrecio}>
                  <Text style={[styles.lineaLabel, { color: c.textSecondary }]}>{t("reserva.planes.serviciosAdicionalesLinea")}</Text>
                  <Text style={[styles.lineaValor, { color: c.textPrimary }]}>{formatPrecio(totalServicios)}</Text>
                </View>
              )}

              <View style={[styles.subtotalBox, { backgroundColor: c.primaryBg }]}>
                <Text style={[styles.subtotalLabel, { color: c.textPrimary }]}>{t("reserva.planes.totalPlanes", { dias, unidad: dias === 1 ? t("reserva.planes.dia") : t("reserva.planes.dias") })}</Text>
                <Text style={[styles.subtotalValor, { color: c.textPrimary }]}>{formatPrecio(totalPlanes)}</Text>
              </View>
            </View>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.confirmarBtnWrap} onPress={handleIrADatos} activeOpacity={0.85}>
        <LinearGradient
          colors={GRADIENTES.boton.colors}
          start={GRADIENTES.boton.start}
          end={GRADIENTES.boton.end}
          style={styles.confirmarBtn}
        >
          <Text style={styles.confirmarBtnText}>{t("reserva.planes.continuar")}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <AlertModal
        visible={alertaFaltantesVisible}
        icono="alert-circle-outline"
        titulo={t("reserva.planes.alertaFaltantesTitulo")}
        mensaje={t("reserva.planes.alertaFaltantesMensaje")}
        botones={[]}
        onCerrar={() => setAlertaFaltantesVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  seccionLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  infoGeneral: {
    fontSize: 10.5,
    lineHeight: 15,
    marginBottom: 10,
  },

  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  opcionCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  opcionCardActiva: {
    borderColor: COLOR_MARCA,
    borderWidth: 2,
  },
  kmFila: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 8,
  },
  kmOpcionCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginVertical: 4,
  },
  opcionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  opcionTitulo: { fontSize: 12.5, fontWeight: "700" },
  opcionTituloActiva: { color: "#3B82F6" },
  opcionDesc: { fontSize: 10.5, marginTop: 4 },
  opcionDescActiva: { color: "#60A5FA" },

  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  radioActivo: { borderColor: COLOR_MARCA },
  radioPunto: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLOR_MARCA },

  beneficiosLista: { gap: 5, marginTop: 10 },
  beneficioFila: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  beneficioTexto: { flex: 1, fontSize: 10.5, lineHeight: 15 },
  beneficioTextoTachado: { textDecorationLine: "line-through" },

  serviciosSub: { fontSize: 10, marginBottom: 8 },

  servicioCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  servicioNombre: { flex: 1, fontSize: 11.5, fontWeight: "600" },
  servicioPrecio: { fontSize: 10.5, fontWeight: "700", marginLeft: 6 },

  // Footer de total al final de cada tarjeta (Protección / Kilometraje
  // / Servicios) — línea separada arriba, label + valor destacado.
  footerTotalTarjeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerTotalLabel: { fontSize: 12, fontWeight: "700" },
  footerTotalValor: { fontSize: 14.5, fontWeight: "800", color: COLOR_MARCA },

  // Subtarjeta de resumen final (mismo lenguaje visual del desglose
  // en ResumenReservaModal: lineaPrecio + subtotalBox).
  resumenSubcard: {},
  lineaPrecio: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  lineaLabel: { fontSize: 12, flex: 1, marginRight: 8 },
  lineaValor: { fontSize: 12, fontWeight: "700" },
  subtotalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  subtotalLabel: { fontSize: 12, fontWeight: "700" },
  subtotalValor: { fontSize: 13, fontWeight: "800" },

  confirmarBtnWrap: {
    alignSelf: "center",
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  confirmarBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmarBtnText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
});
