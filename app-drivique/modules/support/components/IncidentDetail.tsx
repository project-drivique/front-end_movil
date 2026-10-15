import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { mensajeDeError } from "@/modules/reservation/services/reservationPersistService";
import { incidentService } from "../services/incidentService";
import { Incident, IncidentAttachment, IncidentStatus } from "../types/incident.types";
import {
  EstadoInsignia,
  etiquetaTransicion,
  formatearFechaHora,
  formatearTamano,
  PrioridadInsignia,
  SelectorAdjuntos,
  useAdjuntos,
} from "./incidentUi";
import { COLOR_ACENTO, COLOR_MARCA } from "@/constants/brandPalette";

interface Props {
  incidentId: string;
  onActualizada: (incidencia: Incident) => void;
}

export default function IncidentDetail({ incidentId, onActualizada }: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const acento = c.oscuro ? COLOR_ACENTO : COLOR_MARCA;
  const adjuntos = useAdjuntos();

  const [incidencia, setIncidencia] = useState<Incident | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [errorRespuesta, setErrorRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setError("");
    try {
      const data = await incidentService.obtener(incidentId);
      setIncidencia(data);
      onActualizada(data);
    } catch (e) {
      setError(mensajeDeError(e, t("incidencias.noEncontrada")));
    } finally {
      setCargando(false);
    }
  }, [incidentId, onActualizada, t]);

  useEffect(() => {
    setCargando(true);
    cargar();
  }, [cargar]);

  const actualizar = (data: Incident) => {
    setIncidencia(data);
    onActualizada(data);
  };

  const responder = async () => {
    if (!incidencia) return;
    if (!mensaje.trim()) {
      setErrorRespuesta(t("incidencias.mensajeObligatorio"));
      return;
    }
    setErrorRespuesta("");
    setEnviando(true);
    try {
      const data = await incidentService.responder(incidencia.id, mensaje.trim(), adjuntos.archivos);
      setMensaje("");
      adjuntos.limpiar();
      actualizar(data);
    } catch (e) {
      setErrorRespuesta(mensajeDeError(e, t("incidencias.errorCarga")));
    } finally {
      setEnviando(false);
    }
  };

  const cambiarEstado = async (hacia: IncidentStatus) => {
    if (!incidencia) return;
    setEnviando(true);
    try {
      actualizar(await incidentService.cambiarEstado(incidencia.id, hacia));
    } catch (e) {
      Alert.alert(t("comun.error"), mensajeDeError(e, t("incidencias.errorCarga")));
    } finally {
      setEnviando(false);
    }
  };

  const abrirAdjunto = async (adjunto: IncidentAttachment) => {
    if (!incidencia) return;
    try {
      const { uri, dataUri } = await incidentService.descargarAdjunto(incidencia.id, adjunto);
      if (dataUri) {
        setVistaPrevia(dataUri);
      } else if (Platform.OS === "web") {
        window.open(uri, "_blank");
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: adjunto.contentType });
      }
    } catch {
      Alert.alert(t("incidencias.adjuntoError"));
    }
  };

  if (cargando) {
    return (
      <View style={s.centro}>
        <ActivityIndicator size="large" color={acento} />
      </View>
    );
  }

  if (!incidencia) {
    return (
      <View style={s.centro}>
        <Text style={{ color: c.textSecondary, textAlign: "center" }}>{error || t("incidencias.noEncontrada")}</Text>
        <TouchableOpacity onPress={cargar} style={{ marginTop: 12 }}>
          <Text style={{ color: acento, fontWeight: "800" }}>{t("incidencias.reintentar")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cerrada = incidencia.status === "CLOSED";

  const Adjuntos = ({ lista }: { lista: IncidentAttachment[] }) =>
    lista.length > 0 ? (
      <View style={{ marginTop: 6, gap: 4 }}>
        {lista.map((a) => (
          <TouchableOpacity key={a.id} onPress={() => abrirAdjunto(a)} style={s.adjunto}>
            <Ionicons
              name={a.contentType === "application/pdf" ? "document-text-outline" : "image-outline"}
              size={16}
              color={acento}
            />
            <Text style={{ color: acento, fontSize: 12, flex: 1 }} numberOfLines={1}>
              {a.originalName} ({formatearTamano(a.sizeBytes)})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    ) : null;

  return (
    <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
      <View style={[s.card, { backgroundColor: c.bgCard, borderColor: c.border }]}>
        <Text style={[s.codigo, { color: c.textMuted }]}>{incidencia.code}</Text>
        <Text style={[s.asunto, { color: c.textPrimary }]}>{incidencia.subject}</Text>
        <View style={s.insignias}>
          <EstadoInsignia estado={incidencia.status} />
          <PrioridadInsignia prioridad={incidencia.priority} />
        </View>
        <Fila c={c} label={t("incidencias.categoria")} valor={t(`incidencias.categorias.${incidencia.category}`)} />
        {incidencia.reservationCode ? <Fila c={c} label={t("incidencias.reserva")} valor={incidencia.reservationCode} /> : null}
        {incidencia.vehicleModel ? (
          <Fila
            c={c}
            label={t("incidencias.vehiculo")}
            valor={`${incidencia.vehicleModel}${incidencia.vehiclePlate ? ` (${incidencia.vehiclePlate})` : ""}`}
          />
        ) : null}
        {incidencia.branchName ? <Fila c={c} label={t("incidencias.sedeLabel")} valor={incidencia.branchName} /> : null}
        <Fila c={c} label={t("incidencias.asignadoA")} valor={incidencia.assignedToName || t("incidencias.sinAsignar")} />
        <Fila c={c} label={t("incidencias.creadaEl")} valor={formatearFechaHora(incidencia.createdAt)} />
        {incidencia.slaDueAt ? (
          <Fila
            c={c}
            label={t("incidencias.sla")}
            valor={`${formatearFechaHora(incidencia.slaDueAt)}${incidencia.slaBreached ? ` - ${t("incidencias.slaVencido")}` : ""}`}
            alerta={incidencia.slaBreached}
          />
        ) : null}
        <Text style={[s.descripcion, { color: c.textSecondary }]}>{incidencia.description}</Text>
        <Adjuntos lista={incidencia.attachments ?? []} />
      </View>

      {incidencia.allowedTransitions.length > 0 ? (
        <View style={s.acciones}>
          {incidencia.allowedTransitions.map((hacia) => (
            <TouchableOpacity
              key={hacia}
              disabled={enviando}
              onPress={() => cambiarEstado(hacia)}
              style={[s.accion, { borderColor: acento }]}
            >
              <Text style={{ color: acento, fontWeight: "800", fontSize: 13 }}>
                {etiquetaTransicion(t, incidencia.status, hacia)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <Text style={[s.seccion, { color: c.textPrimary }]}>{t("incidencias.historial")}</Text>
      {(incidencia.timeline ?? []).map((item, i) => {
        const esCliente = item.authorRole === "CUSTOMER";
        return (
          <View
            key={`${item.createdAt}-${i}`}
            style={[
              s.evento,
              {
                backgroundColor: item.type === "MESSAGE" ? (esCliente ? c.primaryBg : c.bgCard) : c.bgInput,
                borderColor: c.border,
                alignSelf: item.type === "MESSAGE" && esCliente ? "flex-end" : "flex-start",
              },
            ]}
          >
            <Text style={[s.eventoAutor, { color: acento }]}>
              {item.type === "STATUS"
                ? t("incidencias.cambioEstado")
                : item.type === "ASSIGNMENT"
                  ? t("incidencias.asignacion")
                  : esCliente
                    ? t("incidencias.tuMensaje")
                    : item.authorName || t("incidencias.equipo")}
            </Text>
            {item.type === "STATUS" && item.toStatus ? (
              <Text style={{ color: c.textPrimary, fontSize: 13 }}>
                {item.fromStatus ? `${t(`incidencias.estados.${item.fromStatus}`)} → ` : ""}
                {t(`incidencias.estados.${item.toStatus}`)}
              </Text>
            ) : null}
            {item.message ? <Text style={{ color: c.textPrimary, fontSize: 13 }}>{item.message}</Text> : null}
            <Adjuntos lista={item.attachments ?? []} />
            <Text style={[s.eventoFecha, { color: c.textMuted }]}>{formatearFechaHora(item.createdAt)}</Text>
          </View>
        );
      })}

      {!cerrada ? (
        <View style={[s.card, { backgroundColor: c.bgCard, borderColor: c.border, marginTop: 14 }]}>
          <Text style={[s.seccion, { color: c.textPrimary, marginTop: 0 }]}>{t("incidencias.responder")}</Text>
          <TextInput
            value={mensaje}
            onChangeText={setMensaje}
            placeholder={t("incidencias.escribeMensaje")}
            placeholderTextColor={c.textMuted}
            multiline
            maxLength={5000}
            textAlignVertical="top"
            style={[s.input, { backgroundColor: c.bgInput, borderColor: c.border, color: c.textPrimary }]}
          />
          <View style={{ height: 10 }} />
          <SelectorAdjuntos
            archivos={adjuntos.archivos}
            error={adjuntos.error}
            onAgregar={adjuntos.agregar}
            onQuitar={adjuntos.quitar}
          />
          {errorRespuesta ? <Text style={s.error}>{errorRespuesta}</Text> : null}
          <TouchableOpacity
            onPress={responder}
            disabled={enviando}
            style={[s.enviar, { backgroundColor: acento, opacity: enviando ? 0.6 : 1 }]}
          >
            {enviando ? <ActivityIndicator color="#fff" /> : <Text style={s.enviarTexto}>{t("incidencias.enviarRespuesta")}</Text>}
          </TouchableOpacity>
        </View>
      ) : null}

      <Modal visible={!!vistaPrevia} transparent animationType="fade" onRequestClose={() => setVistaPrevia(null)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setVistaPrevia(null)}>
          {vistaPrevia ? <Image source={{ uri: vistaPrevia }} style={s.imagen} resizeMode="contain" /> : null}
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

function Fila({
  c,
  label,
  valor,
  alerta,
}: {
  c: ReturnType<typeof useTemaColores>;
  label: string;
  valor: string;
  alerta?: boolean;
}) {
  return (
    <View style={s.fila}>
      <Text style={[s.filaLabel, { color: c.textMuted }]}>{label}</Text>
      <Text style={[s.filaValor, { color: alerta ? "#dc2626" : c.textPrimary }]}>{valor}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  scroll: { padding: 16, paddingBottom: 48 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 6 },
  codigo: { fontSize: 12, fontWeight: "700" },
  asunto: { fontSize: 17, fontWeight: "800" },
  insignias: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginVertical: 4 },
  fila: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  filaLabel: { fontSize: 12 },
  filaValor: { fontSize: 13, fontWeight: "600", flex: 1, textAlign: "right" },
  descripcion: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  adjunto: { flexDirection: "row", alignItems: "center", gap: 6 },
  acciones: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  accion: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  seccion: { fontSize: 15, fontWeight: "800", marginTop: 18, marginBottom: 8 },
  evento: { borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 8, maxWidth: "92%", gap: 3 },
  eventoAutor: { fontSize: 11, fontWeight: "800" },
  eventoFecha: { fontSize: 10, marginTop: 2 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, minHeight: 90, fontSize: 14 },
  error: { color: "#dc2626", fontSize: 12, marginTop: 8 },
  enviar: { marginTop: 12, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  enviarTexto: { color: "#fff", fontWeight: "800" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", alignItems: "center", justifyContent: "center" },
  imagen: { width: "94%", height: "80%" },
});
