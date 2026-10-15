import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { GRADIENTES } from "@/constants/gradients";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useReferenceStore } from "@/store/referenceStore";
import {
  mensajeDeError,
  ReservaGuardada,
  reservaPersistService,
} from "@/modules/reservation/services/reservationPersistService";
import { incidentService } from "../services/incidentService";
import { Incident, IncidentCategory } from "../types/incident.types";
import { SelectorAdjuntos, useAdjuntos } from "./incidentUi";
import { COLOR_ACENTO, COLOR_MARCA } from "@/constants/brandPalette";

const CATEGORIAS: IncidentCategory[] = ["RESERVATION", "VEHICLE", "PAYMENT", "OTHER"];

interface Props {
  reservaInicialId?: string;
  onCreada: (incidencia: Incident) => void;
  onCancelar: () => void;
}

export default function IncidentForm({ reservaInicialId, onCreada, onCancelar }: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const acento = c.oscuro ? COLOR_ACENTO : COLOR_MARCA;
  const sucursales = useReferenceStore((st) => st.sucursales);
  const adjuntos = useAdjuntos();

  const [categoria, setCategoria] = useState<IncidentCategory>("RESERVATION");
  const [reservas, setReservas] = useState<ReservaGuardada[]>([]);
  const [reservaId, setReservaId] = useState<string>(reservaInicialId ?? "");
  const [sedeId, setSedeId] = useState("");
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selector, setSelector] = useState<"reserva" | "sede" | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    reservaPersistService
      .getReservasUsuario()
      .then((lista) => activo && setReservas(lista))
      .catch(() => activo && setReservas([]));
    return () => {
      activo = false;
    };
  }, []);

  const reserva = reservas.find((r) => r.id === reservaId) ?? null;
  const sede = sucursales.find((b) => b.id === sedeId) ?? null;

  const enviar = async () => {
    setError("");
    if (!asunto.trim() || !descripcion.trim()) {
      setError(t("incidencias.camposObligatorios"));
      return;
    }
    if (!reserva && !sedeId) {
      setError(t("incidencias.sedeObligatoria"));
      return;
    }
    setEnviando(true);
    try {
      const creada = await incidentService.crear({
        category: categoria,
        subject: asunto.trim(),
        description: descripcion.trim(),
        ...(reserva ? { reservationId: reserva.id, vehicleId: reserva.vehiculoId } : { branchId: sedeId }),
      });
      if (adjuntos.archivos.length > 0) {
        try {
          await incidentService.subirAdjuntos(creada.id, adjuntos.archivos);
        } catch (e) {
          setError(mensajeDeError(e, t("incidencias.archivoInvalido")));
        }
      }
      onCreada(creada);
    } catch (e) {
      setError(mensajeDeError(e, t("incidencias.errorCarga")));
    } finally {
      setEnviando(false);
    }
  };

  const estiloInput = [
    s.input,
    { backgroundColor: c.bgInput, borderColor: c.border, color: c.textPrimary },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[s.etiqueta, { color: c.textSecondary }]}>{t("incidencias.categoria")}</Text>
        <View style={s.chips}>
          {CATEGORIAS.map((cat) => {
            const activo = cat === categoria;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategoria(cat)}
                style={[
                  s.chip,
                  { borderColor: activo ? acento : c.border, backgroundColor: activo ? c.primaryBg : c.bgInput },
                ]}
              >
                <Text style={[s.chipTexto, { color: activo ? acento : c.textSecondary }]}>
                  {t(`incidencias.categorias.${cat}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[s.etiqueta, { color: c.textSecondary }]}>{t("incidencias.reservaVinculada")}</Text>
        <TouchableOpacity style={[s.selector, { borderColor: c.border, backgroundColor: c.bgInput }]} onPress={() => setSelector("reserva")}>
          <Text style={{ color: reserva ? c.textPrimary : c.textMuted, flex: 1 }} numberOfLines={1}>
            {reserva ? `${reserva.referencia} - ${reserva.vehiculoNombre}` : t("incidencias.sinReserva")}
          </Text>
          <Ionicons name="chevron-down" size={16} color={c.textMuted} />
        </TouchableOpacity>

        {!reserva ? (
          <>
            <Text style={[s.etiqueta, { color: c.textSecondary }]}>{t("incidencias.sede")} *</Text>
            <TouchableOpacity style={[s.selector, { borderColor: c.border, backgroundColor: c.bgInput }]} onPress={() => setSelector("sede")}>
              <Text style={{ color: sede ? c.textPrimary : c.textMuted, flex: 1 }} numberOfLines={1}>
                {sede ? `${sede.name} - ${sede.cityName}` : t("incidencias.sedeSeleccionar")}
              </Text>
              <Ionicons name="chevron-down" size={16} color={c.textMuted} />
            </TouchableOpacity>
          </>
        ) : null}

        <Text style={[s.etiqueta, { color: c.textSecondary }]}>{t("incidencias.asunto")} *</Text>
        <TextInput
          style={estiloInput}
          value={asunto}
          onChangeText={setAsunto}
          maxLength={150}
          placeholderTextColor={c.textMuted}
        />

        <Text style={[s.etiqueta, { color: c.textSecondary }]}>{t("incidencias.descripcion")} *</Text>
        <TextInput
          style={[...estiloInput, s.multilinea]}
          value={descripcion}
          onChangeText={setDescripcion}
          maxLength={5000}
          multiline
          textAlignVertical="top"
          placeholderTextColor={c.textMuted}
        />

        <Text style={[s.etiqueta, { color: c.textSecondary }]}>{t("incidencias.adjuntos")}</Text>
        <SelectorAdjuntos
          archivos={adjuntos.archivos}
          error={adjuntos.error}
          onAgregar={adjuntos.agregar}
          onQuitar={adjuntos.quitar}
        />

        <Text style={[s.prioridadNota, { color: c.textMuted }]}>{t("incidencias.prioridad")}</Text>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <TouchableOpacity onPress={enviar} disabled={enviando} activeOpacity={0.85} style={{ marginTop: 14 }}>
          <LinearGradient
            colors={GRADIENTES.boton.colors}
            start={GRADIENTES.boton.start}
            end={GRADIENTES.boton.end}
            style={s.boton}
          >
            {enviando ? <ActivityIndicator color="#fff" /> : <Text style={s.botonTexto}>{t("incidencias.enviar")}</Text>}
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancelar} style={s.cancelar}>
          <Text style={{ color: c.textSecondary, fontWeight: "700" }}>{t("comun.cancelar")}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={selector !== null} transparent animationType="fade" onRequestClose={() => setSelector(null)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setSelector(null)}>
          <View style={[s.modal, { backgroundColor: c.bgCard }]}>
            <ScrollView>
              {selector === "reserva" ? (
                <>
                  <Opcion
                    texto={t("incidencias.sinReserva")}
                    activo={!reservaId}
                    onPress={() => {
                      setReservaId("");
                      setSelector(null);
                    }}
                  />
                  {reservas.map((r) => (
                    <Opcion
                      key={r.id}
                      texto={`${r.referencia} - ${r.vehiculoNombre}`}
                      activo={r.id === reservaId}
                      onPress={() => {
                        setReservaId(r.id);
                        setSelector(null);
                      }}
                    />
                  ))}
                </>
              ) : (
                sucursales.map((b) => (
                  <Opcion
                    key={b.id}
                    texto={`${b.name} - ${b.cityName}`}
                    activo={b.id === sedeId}
                    onPress={() => {
                      setSedeId(b.id);
                      setSelector(null);
                    }}
                  />
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function Opcion({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  const c = useTemaColores();
  return (
    <TouchableOpacity onPress={onPress} style={[s.opcion, { borderBottomColor: c.border }]}>
      <Text style={{ color: activo ? (c.oscuro ? COLOR_ACENTO : COLOR_MARCA) : c.textPrimary, flex: 1, fontWeight: activo ? "800" : "500" }}>
        {texto}
      </Text>
      {activo ? <Ionicons name="checkmark" size={18} color={c.oscuro ? COLOR_ACENTO : COLOR_MARCA} /> : null}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 48 },
  etiqueta: { fontSize: 12, fontWeight: "700", marginTop: 14, marginBottom: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  chipTexto: { fontSize: 12, fontWeight: "700" },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  multilinea: { minHeight: 120 },
  prioridadNota: { fontSize: 11, marginTop: 14 },
  error: { color: "#dc2626", fontSize: 12, marginTop: 10 },
  boton: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  botonTexto: { color: "#fff", fontWeight: "800", fontSize: 14 },
  cancelar: { alignItems: "center", paddingVertical: 14 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 24 },
  modal: { borderRadius: 14, maxHeight: "70%", overflow: "hidden" },
  opcion: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
});
