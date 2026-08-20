// modules/reserva/components/CampoSubidaDocumento.tsx
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { COLOR_MARCA } from "../constants/reservation.constants";
import { ArchivoDocumento } from "../types/reservation.types";

interface Props {
  etiqueta: string;
  ayuda: string;
  archivo: ArchivoDocumento | null;
  cargando: boolean;
  error?: string;
  onSeleccionar: () => void;
  onQuitar: () => void;
  requerido?: boolean;
}

export default function CampoSubidaDocumento({
  etiqueta,
  ayuda,
  archivo,
  cargando,
  error,
  onSeleccionar,
  onQuitar,
  requerido = true,
}: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();
  const primaryAccent = c.oscuro ? "#60A5FA" : COLOR_MARCA;

  return (
    <View
      style={[
        styles.subcard,
        { backgroundColor: c.bgInput, borderColor: primaryAccent },
        !!error && styles.subcardError,
      ]}
    >
      <Text style={[styles.etiqueta, { color: c.textPrimary }]}>
        {etiqueta}
        {requerido ? " *" : ""}
      </Text>
      <Text style={[styles.ayuda, { color: c.textMuted }]}>{ayuda}</Text>

      {cargando ? (
        <View style={styles.estadoCargando}>
          <ActivityIndicator size="small" color={primaryAccent} />
          <Text style={[styles.textoCargando, { color: primaryAccent }]}>{t("reserva.documentos.subiendoArchivo")}</Text>
        </View>
      ) : archivo ? (
        <View style={[styles.archivoBox, { backgroundColor: c.primaryBg, borderColor: primaryAccent }]}>
          <Ionicons name="checkmark-circle-outline" size={20} color={primaryAccent} />
          <View style={styles.archivoInfo}>
            <Text style={[styles.archivoNombre, { color: c.textPrimary }]} numberOfLines={1}>
              {archivo.nombre}
            </Text>
            <Text style={[styles.archivoTamano, { color: c.textSecondary }]}>{(archivo.tamanoBytes / 1024 / 1024).toFixed(2)} MB</Text>
          </View>
          <TouchableOpacity onPress={onQuitar} hitSlop={8}>
            <Ionicons name="close-outline" size={20} color={c.textSecondary} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[styles.boton, { backgroundColor: c.bgCard, borderColor: c.border }]} onPress={onSeleccionar} activeOpacity={0.7}>
          <Ionicons name="cloud-upload-outline" size={16} color={primaryAccent} />
          <Text style={[styles.botonTexto, { color: primaryAccent }]}>{t("reserva.documentos.subirPdf")}</Text>
        </TouchableOpacity>
      )}

      {!!error && (
        <View style={styles.errorFila}>
          <Ionicons name="alert-circle-outline" size={14} color={c.error} />
          <Text style={[styles.error, { color: c.error }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  subcard: {
    borderWidth: 1.3,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    width: "100%",
  },
  subcardError: {
    borderStyle: "solid",
    borderWidth: 1.5,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  ayuda: {
    fontSize: 10.5,
    textAlign: "center",
    lineHeight: 14,
    marginBottom: 12,
  },
  boton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  botonTexto: {
    fontSize: 12,
    fontWeight: "700",
  },
  estadoCargando: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textoCargando: {
    fontSize: 12,
    fontWeight: "700",
  },
  archivoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  archivoInfo: { flex: 1, minWidth: 0 },
  archivoNombre: { fontSize: 11.5, fontWeight: "700" },
  archivoTamano: { fontSize: 10 },
  errorFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  error: {
    fontSize: 10.5,
    fontWeight: "700",
  },
});