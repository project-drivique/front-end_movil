import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import { useReservaStore } from "@/store/reservationStore";
import { COLOR_MARCA, getMetodosPago } from "../constants/reservation.constants";
import { CIUDADES_DATA, getCiudadPorSucursal, getDireccionSucursal, getDisponibilidadVehiculo } from "@/modules/catalog/constants/catalog.constants";
import CalendarioRango from "./DateRangeCalendar";
import SelectorSucursalModal, { OpcionLugar } from "./BranchSelectorModal";
import SelectorHoraModal from "./TimeSelectorModal";
import { AlertaPagoEfectivo } from "./CashPaymentAlert";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";

interface Props {
  vehiculo: Vehiculo;
}

function formatFecha(fecha: string | null, fallback: string): string {
  if (!fecha) return fallback;
  const d = new Date(fecha + "T00:00:00");
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export default function FormFechasLugar({ vehiculo }: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const METODOS_PAGO = useMemo(() => getMetodosPago(t), [t]);
  const fechasLugar = useReservaStore((s) => s.fechasLugar);
  const actualizarFechasLugar = useReservaStore((s) => s.actualizarFechasLugar);

  const [modalTipo, setModalTipo] = useState<"retiro" | "devolucion" | null>(null);
  const [horaVisible, setHoraVisible] = useState<"retiro" | "devolucion" | null>(null);
  const [alertaEfectivoVisible, setAlertaEfectivoVisible] = useState(false);

  const nombreSucursal = vehiculo.sucursal ?? "";
  const ciudadNombre = vehiculo.sucursal ? getCiudadPorSucursal(vehiculo.sucursal) : null;
  const ciudadInfo = ciudadNombre ? CIUDADES_DATA.find((c) => c.nombre === ciudadNombre) : null;

  const esWompi = fechasLugar.metodoPago === "wompi";

  const opcionesEntrega: OpcionLugar[] = useMemo(() => {
    const base: OpcionLugar[] = [
      { value: nombreSucursal, label: t("reserva.fechasLugar.recogerEnSucursal", { sucursal: nombreSucursal }), icono: "business-outline" },
    ];
    if (esWompi) {
      base.push({ value: "domicilio", label: t("reserva.fechasLugar.entregaDomicilio"), icono: "home-outline" });
      if (ciudadInfo?.tieneAeropuerto) {
        base.push({ value: "aeropuerto", label: t("reserva.fechasLugar.entregaAeropuerto"), icono: "airplane-outline" });
      }
      if (ciudadInfo?.tieneTerminal) {
        base.push({ value: "terminal", label: t("reserva.fechasLugar.entregaTerminal"), icono: "bus-outline" });
      }
    }
    return base;
  }, [nombreSucursal, esWompi, ciudadInfo]);

  const opcionesDevolucion: OpcionLugar[] = useMemo(() => {
    const base: OpcionLugar[] = [
      { value: nombreSucursal, label: t("reserva.fechasLugar.devolverEnSucursal", { sucursal: nombreSucursal }), icono: "business-outline" },
    ];
    if (esWompi) {
      base.push({ value: "domicilio", label: t("reserva.fechasLugar.devolucionDomicilio"), icono: "home-outline" });
      if (ciudadInfo?.tieneAeropuerto) {
        base.push({ value: "aeropuerto", label: t("reserva.fechasLugar.devolucionAeropuerto"), icono: "airplane-outline" });
      }
      if (ciudadInfo?.tieneTerminal) {
        base.push({ value: "terminal", label: t("reserva.fechasLugar.devolucionTerminal"), icono: "bus-outline" });
      }
    }
    return base;
  }, [nombreSucursal, esWompi, ciudadInfo]);

  useEffect(() => {
    if (fechasLugar.metodoPago === "efectivo") {
      const actualizacion: Partial<typeof fechasLugar> = {};
      // Con pago en efectivo la única opción válida es la sucursal del
      // vehículo: la seleccionamos automáticamente (no solo cuando ya había
      // otro valor elegido, sino también cuando el campo estaba vacío).
      if (fechasLugar.lugarRetiro !== nombreSucursal) {
        actualizacion.lugarRetiro = nombreSucursal;
      }
      if (fechasLugar.lugarDevolucion !== nombreSucursal) {
        actualizacion.lugarDevolucion = nombreSucursal;
      }
      if (Object.keys(actualizacion).length > 0) {
        actualizarFechasLugar(actualizacion);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechasLugar.metodoPago, nombreSucursal]);

  const handleElegirSucursal = (value: string) => {
    if (modalTipo === "retiro") actualizarFechasLugar({ lugarRetiro: value });
    if (modalTipo === "devolucion") actualizarFechasLugar({ lugarDevolucion: value });
    setModalTipo(null);
  };

  const handleElegirHora = (hora: string) => {
    const fecha = horaVisible === "retiro" ? fechasLugar.fechaRetiro : fechasLugar.fechaDevolucion;

    if (fecha) {
      // La disponibilidad ya no viene embebida en el vehículo — se calcula
      // a partir de RESERVAS_MOCK (mocks/reservas.json) según su id.
      const horasOcupadas = getDisponibilidadVehiculo(vehiculo.id).horasOcupadas?.[fecha] ?? [];
      const bloqueo = horasOcupadas.find((h) => h.hora === hora);

      if (bloqueo) {
        const mensaje =
          bloqueo.motivo === "mantenimiento"
            ? t("reserva.fechasLugar.horaNoDisponibleMantenimiento")
            : t("reserva.fechasLugar.horaNoDisponibleReservado");

        Alert.alert(t("reserva.fechasLugar.horaNoDisponibleTitulo"), mensaje, [
          { text: t("reserva.fechasLugar.intentarDeNuevo"), style: "default" },
        ]);
        return;
      }
    }

    if (horaVisible === "retiro") actualizarFechasLugar({ horaRetiro: hora });
    else if (horaVisible === "devolucion") actualizarFechasLugar({ horaDevolucion: hora });
  };

  const labelLugarRetiro =
    opcionesEntrega.find((o) => o.value === fechasLugar.lugarRetiro)?.label ||
    fechasLugar.lugarRetiro ||
    t("reserva.fechasLugar.seleccionar");
  const labelLugarDevolucion =
    opcionesDevolucion.find((o) => o.value === fechasLugar.lugarDevolucion)?.label ||
    fechasLugar.lugarDevolucion ||
    t("reserva.fechasLugar.seleccionar");

  const ciudadEntregaNombre = ciudadInfo?.nombre ?? ciudadNombre ?? "";

  const mostrarDomicilioRetiro = fechasLugar.lugarRetiro === "domicilio";
  const mostrarDomicilioDevolucion = fechasLugar.lugarDevolucion === "domicilio";

  return (
    <View style={[styles.card, { backgroundColor: c.bgCard }]}>
      <Text style={[styles.tituloSeccion, styles.primerLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.metodoPagoPreferido")}</Text>
      <View style={styles.filaDosCols}>
        {METODOS_PAGO.map((metodo) => {
          const activo = fechasLugar.metodoPago === metodo.id;
          return (
            <TouchableOpacity
              key={metodo.id}
              style={[
                styles.metodoCard,
                { borderColor: c.border },
                activo && [styles.metodoCardActivo, { backgroundColor: c.primaryBg }],
              ]}
              onPress={() => {
                actualizarFechasLugar({ metodoPago: metodo.id });
                if (metodo.id === "efectivo") setAlertaEfectivoVisible(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.metodoHeaderRow}>
                <Text style={[styles.metodoTitulo, { color: c.textSecondary }, activo && styles.metodoTituloActivo]}>
                  {metodo.titulo}
                </Text>
                <View style={[styles.radio, { borderColor: c.border }, activo && styles.radioActivo]}>
                  {activo && <View style={styles.radioPunto} />}
                </View>
              </View>
              <Text style={[styles.metodoDesc, { color: c.textMuted }, activo && styles.metodoDescActivo]}>
                {metodo.descripcion}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.tituloSeccion, { color: c.textSecondary }]}>{t("reserva.fechasLugar.lugarHoraEntrega")}</Text>
      <View style={styles.filaDosCols}>
        <TouchableOpacity style={[styles.selectBox, { borderColor: c.border }]} onPress={() => setModalTipo("retiro")}>
          <View style={styles.selectLabelRow}>
            <Ionicons name="location-outline" size={12} color={c.textMuted} />
            <Text style={[styles.selectLabel, { color: c.textMuted }]}>{t("reserva.fechasLugar.lugarDeRetiro")}</Text>
          </View>
          <Text style={[styles.selectValue, { color: c.textPrimary }]} numberOfLines={1}>
            {labelLugarRetiro}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.selectBox, { borderColor: c.border }]} onPress={() => setModalTipo("devolucion")}>
          <View style={styles.selectLabelRow}>
            <Ionicons name="location-outline" size={12} color={c.textMuted} />
            <Text style={[styles.selectLabel, { color: c.textMuted }]}>{t("reserva.fechasLugar.lugarDeDevolucion")}</Text>
          </View>
          <Text style={[styles.selectValue, { color: c.textPrimary }]} numberOfLines={1}>
            {labelLugarDevolucion}
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- INFO DE ENTREGA A DOMICILIO (solo si lugarRetiro === "domicilio") --- */}
      {mostrarDomicilioRetiro && (
        <View style={[styles.domicilioCard, { borderColor: c.border }]}>
          <Text style={styles.domicilioTitulo}>{t("reserva.fechasLugar.infoEntregaDomicilio")}</Text>

          <View style={[styles.ciudadBox, { backgroundColor: c.primaryBg }]}>
            <View style={styles.selectLabelRow}>
              <Ionicons name="location" size={13} color={COLOR_MARCA} />
              <Text style={[styles.ciudadLabel, { color: c.textMuted }]}>{t("reserva.fechasLugar.ciudadEntrega")}</Text>
            </View>
            <View style={styles.ciudadValorRow}>
              <Text style={[styles.ciudadValor, { color: c.textPrimary }]}>{ciudadEntregaNombre}</Text>
              <Text style={styles.autoDetectado}>{t("reserva.fechasLugar.autoDetectado")}</Text>
            </View>
          </View>

          <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.barrio")}</Text>
          <TextInput
            style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.bgInput }]}
            placeholder={t("reserva.fechasLugar.placeholderBarrio")}
            placeholderTextColor={c.textMuted}
            value={fechasLugar.barrioRetiro ?? ""}
            onChangeText={(texto) => actualizarFechasLugar({ barrioRetiro: texto })}
          />

          <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.direccion")}</Text>
          <TextInput
            style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.bgInput }]}
            placeholder={t("reserva.fechasLugar.placeholderDireccion")}
            placeholderTextColor={c.textMuted}
            value={fechasLugar.direccionRetiro ?? ""}
            onChangeText={(texto) => actualizarFechasLugar({ direccionRetiro: texto })}
          />

          <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.referenciasEntrega")}</Text>
          <TextInput
            style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.bgInput }]}
            placeholder={t("reserva.fechasLugar.placeholderReferencias")}
            placeholderTextColor={c.textMuted}
            value={fechasLugar.referenciasRetiro ?? ""}
            onChangeText={(texto) => actualizarFechasLugar({ referenciasRetiro: texto })}
          />
        </View>
      )}

      {/* --- INFO DE DEVOLUCIÓN A DOMICILIO (solo si lugarDevolucion === "domicilio") --- */}
      {mostrarDomicilioDevolucion && (
        <View style={[styles.domicilioCard, { borderColor: c.border }]}>
          <Text style={styles.domicilioTitulo}>{t("reserva.fechasLugar.infoDevolucionDomicilio")}</Text>

          <View style={[styles.ciudadBox, { backgroundColor: c.primaryBg }]}>
            <View style={styles.selectLabelRow}>
              <Ionicons name="location" size={13} color={COLOR_MARCA} />
              <Text style={[styles.ciudadLabel, { color: c.textMuted }]}>{t("reserva.fechasLugar.ciudadDevolucion")}</Text>
            </View>
            <View style={styles.ciudadValorRow}>
              <Text style={[styles.ciudadValor, { color: c.textPrimary }]}>{ciudadEntregaNombre}</Text>
              <Text style={styles.autoDetectado}>{t("reserva.fechasLugar.autoDetectado")}</Text>
            </View>
          </View>

          <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.barrio")}</Text>
          <TextInput
            style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.bgInput }]}
            placeholder={t("reserva.fechasLugar.placeholderBarrio")}
            placeholderTextColor={c.textMuted}
            value={fechasLugar.barrioDevolucion ?? ""}
            onChangeText={(texto) => actualizarFechasLugar({ barrioDevolucion: texto })}
          />

          <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.direccion")}</Text>
          <TextInput
            style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.bgInput }]}
            placeholder={t("reserva.fechasLugar.placeholderDireccion")}
            placeholderTextColor={c.textMuted}
            value={fechasLugar.direccionDevolucion ?? ""}
            onChangeText={(texto) => actualizarFechasLugar({ direccionDevolucion: texto })}
          />

          <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t("reserva.fechasLugar.referenciasDevolucion")}</Text>
          <TextInput
            style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.bgInput }]}
            placeholder={t("reserva.fechasLugar.placeholderReferencias")}
            placeholderTextColor={c.textMuted}
            value={fechasLugar.referenciasDevolucion ?? ""}
            onChangeText={(texto) => actualizarFechasLugar({ referenciasDevolucion: texto })}
          />
        </View>
      )}

      <View style={[styles.filaDosCols, { marginTop: 8 }]}>
        <TouchableOpacity style={[styles.selectBox, { borderColor: c.border }]} onPress={() => setHoraVisible("retiro")}>
          <View style={styles.selectLabelRow}>
            <Ionicons name="time-outline" size={12} color={c.textMuted} />
            <Text style={[styles.selectLabel, { color: c.textMuted }]}>{t("reserva.fechasLugar.horaDeRetiro")}</Text>
          </View>
          <View style={styles.selectValorRow}>
            <Text style={[styles.selectValue, { color: c.textPrimary }]}>{fechasLugar.horaRetiro || t("reserva.fechasLugar.seleccionar")}</Text>
            <Ionicons name="chevron-down" size={14} color={c.textMuted} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.selectBox, { borderColor: c.border }]} onPress={() => setHoraVisible("devolucion")}>
          <View style={styles.selectLabelRow}>
            <Ionicons name="time-outline" size={12} color={c.textMuted} />
            <Text style={[styles.selectLabel, { color: c.textMuted }]}>{t("reserva.fechasLugar.horaDeDevolucion")}</Text>
          </View>
          <View style={styles.selectValorRow}>
            <Text style={[styles.selectValue, { color: c.textPrimary }]}>{fechasLugar.horaDevolucion || t("reserva.fechasLugar.seleccionar")}</Text>
            <Ionicons name="chevron-down" size={14} color={c.textMuted} />
          </View>
        </TouchableOpacity>
      </View>

      {/* --- CALENDARIO DE DISPONIBILIDAD (justo después de la hora) --- */}
      <View style={styles.labelConIcono}>
        <Ionicons name="calendar-outline" size={13} color={c.textMuted} />
        <Text style={[styles.tituloSeccion, { color: c.textSecondary }]}>{t("reserva.fechasLugar.calendarioDisponibilidad")}</Text>
      </View>
      <CalendarioRango
        vehiculo={vehiculo}
        fechaRetiro={fechasLugar.fechaRetiro}
        fechaDevolucion={fechasLugar.fechaDevolucion}
        onCambiarFechas={(retiro, devolucion) =>
          actualizarFechasLugar({ fechaRetiro: retiro, fechaDevolucion: devolucion })
        }
      />

      {/* --- FECHAS AUTOMÁTICAS (se llenan solas con lo elegido en el calendario) --- */}
      <View style={[styles.filaDosCols, { marginTop: 12 }]}>
        <View style={[styles.selectBox, { borderColor: c.border }]}>
          <View style={styles.selectLabelRow}>
            <Ionicons name="calendar-outline" size={12} color={c.textMuted} />
            <Text style={[styles.selectLabel, { color: c.textMuted }]}>{t("reserva.fechasLugar.fechaDeRetiro")}</Text>
          </View>
          <Text style={[styles.selectValue, { color: c.textPrimary }]} numberOfLines={1}>
            {formatFecha(fechasLugar.fechaRetiro, t("reserva.fechasLugar.seleccionar"))}
          </Text>
        </View>
        <View style={[styles.selectBox, { borderColor: c.border }]}>
          <View style={styles.selectLabelRow}>
            <Ionicons name="calendar-outline" size={12} color={c.textMuted} />
            <Text style={[styles.selectLabel, { color: c.textMuted }]}>{t("reserva.fechasLugar.fechaDeDevolucion")}</Text>
          </View>
          <Text style={[styles.selectValue, { color: c.textPrimary }]} numberOfLines={1}>
            {formatFecha(fechasLugar.fechaDevolucion, t("reserva.fechasLugar.seleccionar"))}
          </Text>
        </View>
      </View>

      <SelectorSucursalModal
        visible={modalTipo !== null}
        titulo={modalTipo === "retiro" ? t("reserva.fechasLugar.lugarDeRetiroModal") : t("reserva.fechasLugar.lugarDeDevolucionModal")}
        opciones={modalTipo === "retiro" ? opcionesEntrega : opcionesDevolucion}
        onSeleccionar={handleElegirSucursal}
        onCerrar={() => setModalTipo(null)}
      />

      <SelectorHoraModal
        visible={horaVisible !== null}
        horaSeleccionada={horaVisible === "retiro" ? fechasLugar.horaRetiro : fechasLugar.horaDevolucion}
        onSeleccionar={handleElegirHora}
        onCerrar={() => setHoraVisible(null)}
      />

      <AlertaPagoEfectivo
        visible={alertaEfectivoVisible}
        nombreSucursal={nombreSucursal}
        ciudad={ciudadEntregaNombre || ciudadNombre}
        direccion={getDireccionSucursal(nombreSucursal)}
        onCerrar={() => setAlertaEfectivoVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tituloSeccion: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginBottom: 8,
    marginTop: 4,
  },
  primerLabel: { marginTop: 0 },
  labelConIcono: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4, marginBottom: 8 },
  filaDosCols: { flexDirection: "row", gap: 8, marginBottom: 14 },
  metodoCard: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10 },
  metodoCardActivo: { borderColor: COLOR_MARCA, borderWidth: 1.5 },
  metodoHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  metodoTitulo: { fontSize: 11, fontWeight: "700", flex: 1, marginRight: 6 },
  metodoTituloActivo: { color: "#3B82F6" },
  metodoDesc: { fontSize: 9, marginTop: 4 },
  metodoDescActivo: { color: "#60A5FA" },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  radioActivo: { borderColor: COLOR_MARCA },
  radioPunto: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLOR_MARCA },
  selectBox: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 9 },
  selectLabelRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 3 },
  selectLabel: { fontSize: 9, fontWeight: "700" },
  selectValue: { fontSize: 11, fontWeight: "600" },
  selectValorRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  // --- Bloque de información a domicilio ---
  domicilioCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    marginTop: -6,
  },
  domicilioTitulo: {
    fontSize: 12,
    fontWeight: "800",
    color: "#3B82F6",
    marginBottom: 10,
  },
  ciudadBox: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  ciudadLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 0.3 },
  ciudadValorRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  ciudadValor: { fontSize: 13, fontWeight: "700" },
  autoDetectado: { fontSize: 9, fontWeight: "700", color: COLOR_MARCA, letterSpacing: 0.3 },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 5,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 12,
    marginBottom: 4,
  },
});
