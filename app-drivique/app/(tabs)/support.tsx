import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { GRADIENTES } from "@/constants/gradients";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { mensajeDeError } from "@/modules/reservation/services/reservationPersistService";
import { incidentService } from "@/modules/support/services/incidentService";
import { Incident } from "@/modules/support/types/incident.types";
import IncidentForm from "@/modules/support/components/IncidentForm";
import IncidentDetail from "@/modules/support/components/IncidentDetail";
import {
  EstadoInsignia,
  formatearFechaHora,
  PrioridadInsignia,
} from "@/modules/support/components/incidentUi";

type Vista = "lista" | "nueva" | "detalle";

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ incidencia?: string; reservaId?: string; tab?: string }>();

  const [vista, setVista] = useState<Vista>("lista");
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [incidencias, setIncidencias] = useState<Incident[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setError("");
    try {
      setIncidencias(await incidentService.listarMias());
    } catch (e) {
      setError(mensajeDeError(e, t("incidencias.errorCarga")));
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [t]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (params.incidencia) {
      setSeleccionada(String(params.incidencia));
      setVista("detalle");
    } else if (params.tab === "nueva" || params.reservaId) {
      setVista("nueva");
    }
  }, [params.incidencia, params.tab, params.reservaId]);

  const acento = c.oscuro ? "#60A5FA" : "#2f4ea2";

  const volver = () => {
    if (vista === "lista") {
      router.canGoBack() ? router.back() : router.replace("/(tabs)" as any);
      return;
    }
    setVista("lista");
    setSeleccionada(null);
    router.setParams({ incidencia: undefined, reservaId: undefined, tab: undefined } as any);
    cargar();
  };

  const alActualizar = useCallback((actualizada: Incident) => {
    setIncidencias((prev) => prev.map((i) => (i.id === actualizada.id ? { ...i, ...actualizada, timeline: undefined } : i)));
  }, []);

  return (
    <View style={[s.flex, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <View style={[s.header, { backgroundColor: c.bgCard, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={volver} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={acento} />
        </TouchableOpacity>
        <Text style={[s.headerTitulo, { color: c.textPrimary }]}>
          {vista === "nueva"
            ? t("incidencias.nueva")
            : vista === "detalle"
              ? t("incidencias.detalle")
              : t("incidencias.titulo")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {vista === "nueva" ? (
        <IncidentForm
          reservaInicialId={params.reservaId ? String(params.reservaId) : undefined}
          onCancelar={volver}
          onCreada={(creada) => {
            setSeleccionada(creada.id);
            setVista("detalle");
            cargar();
          }}
        />
      ) : vista === "detalle" && seleccionada ? (
        <IncidentDetail incidentId={seleccionada} onActualizada={alActualizar} />
      ) : (
        <View style={s.flex}>
          <Text style={[s.subtitulo, { color: c.textSecondary }]}>{t("incidencias.subtitulo")}</Text>
          {cargando ? (
            <View style={s.centro}>
              <ActivityIndicator size="large" color={acento} />
            </View>
          ) : (
            <FlatList
              data={incidencias}
              keyExtractor={(i) => i.id}
              contentContainerStyle={s.lista}
              refreshControl={
                <RefreshControl
                  refreshing={refrescando}
                  onRefresh={() => {
                    setRefrescando(true);
                    cargar();
                  }}
                />
              }
              ListEmptyComponent={
                <View style={s.centro}>
                  <Ionicons name="chatbubbles-outline" size={44} color={c.textMuted} />
                  <Text style={{ color: c.textSecondary, marginTop: 10, textAlign: "center" }}>
                    {error || t("incidencias.vacio")}
                  </Text>
                  {error ? (
                    <TouchableOpacity onPress={cargar} style={{ marginTop: 10 }}>
                      <Text style={{ color: acento, fontWeight: "800" }}>{t("incidencias.reintentar")}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    setSeleccionada(item.id);
                    setVista("detalle");
                  }}
                  style={[s.card, { backgroundColor: c.bgCard, borderColor: c.border }]}
                >
                  <View style={s.cardTop}>
                    <Text style={[s.codigo, { color: c.textMuted }]}>{item.code}</Text>
                    <Text style={[s.fecha, { color: c.textMuted }]}>{formatearFechaHora(item.createdAt)}</Text>
                  </View>
                  <Text style={[s.asunto, { color: c.textPrimary }]} numberOfLines={2}>
                    {item.subject}
                  </Text>
                  <View style={s.insignias}>
                    <EstadoInsignia estado={item.status} />
                    <PrioridadInsignia prioridad={item.priority} />
                  </View>
                  {item.slaDueAt && item.status !== "CLOSED" && item.status !== "RESOLVED" ? (
                    <Text style={{ color: item.slaBreached ? "#dc2626" : c.textMuted, fontSize: 11, marginTop: 6 }}>
                      {t("incidencias.sla")}: {formatearFechaHora(item.slaDueAt)}
                      {item.slaBreached ? ` - ${t("incidencias.slaVencido")}` : ""}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              )}
            />
          )}
          <View style={[s.pie, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setVista("nueva")}>
              <LinearGradient
                colors={GRADIENTES.boton.colors}
                start={GRADIENTES.boton.start}
                end={GRADIENTES.boton.end}
                style={s.boton}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={s.botonTexto}>{t("incidencias.nueva")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitulo: { fontSize: 16, fontWeight: "800" },
  subtitulo: { fontSize: 13, paddingHorizontal: 16, paddingTop: 12 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, minHeight: 240 },
  lista: { padding: 16, gap: 10, flexGrow: 1 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 6 },
  cardTop: { flexDirection: "row", justifyContent: "space-between" },
  codigo: { fontSize: 11, fontWeight: "700" },
  fecha: { fontSize: 11 },
  asunto: { fontSize: 15, fontWeight: "800" },
  insignias: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pie: { paddingHorizontal: 16, paddingTop: 8 },
  boton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  botonTexto: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
