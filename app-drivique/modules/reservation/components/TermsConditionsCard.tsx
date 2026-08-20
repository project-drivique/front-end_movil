// modules/reserva/components/TarjetaTerminosCondiciones.tsx
import React, { useState, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import {
  COLOR_MARCA,
  getPuntosPolitica,
  getResumenPoliticasImportantes,
} from "../constants/reservation.constants";
import { GRADIENTES } from "@/constants/gradients";
import { useReservaStore } from "@/store/reservationStore";

export default function TarjetaTerminosCondiciones() {
  const datosPersonales = useReservaStore((s) => s.datosPersonales);
  const actualizarDatosPersonales = useReservaStore((s) => s.actualizarDatosPersonales);
  const [verTerminos, setVerTerminos] = useState(false);
  const c = useTemaColores();
  const { t } = useTranslation();
  const PUNTOS_POLITICA = useMemo(() => getPuntosPolitica(t), [t]);
  const RESUMEN_POLITICAS_IMPORTANTES = getResumenPoliticasImportantes(t);

  const primaryAccent = c.oscuro ? "#60A5FA" : COLOR_MARCA;
  const brandBg = c.oscuro ? "#3B82F6" : COLOR_MARCA;

  return (
    <View style={[styles.card, { backgroundColor: c.bgCard }]}>
      <View style={styles.filaCheckbox}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            { borderColor: brandBg },
            datosPersonales.terminosAceptados && { backgroundColor: brandBg },
          ]}
          onPress={() => actualizarDatosPersonales({ terminosAceptados: !datosPersonales.terminosAceptados })}
          hitSlop={6}
        >
          {datosPersonales.terminosAceptados && <Ionicons name="checkmark" size={13} color="#fff" />}
        </TouchableOpacity>
        <Text style={[styles.textoCheckbox, { color: c.textPrimary }]}>
          {t("reserva.terminos.autorizoTratamiento")}
          <Text style={[styles.enlace, { color: primaryAccent }]}>{t("reserva.terminos.politicaPrivacidad")}</Text> *
        </Text>
      </View>

      <TouchableOpacity style={styles.botonToggle} onPress={() => setVerTerminos((v) => !v)} activeOpacity={0.7}>
        <Ionicons name={verTerminos ? "chevron-down" : "chevron-forward"} size={13} color={primaryAccent} />
        <Text style={[styles.botonToggleTexto, { color: primaryAccent }]}>
          {verTerminos ? t("reserva.terminos.ocultarTerminos") : t("reserva.terminos.verTerminos")}
        </Text>
      </TouchableOpacity>

      {verTerminos && (
        <View style={[styles.panelTerminos, { borderColor: brandBg }]}>
          <LinearGradient
            colors={GRADIENTES.panel.colors}
            start={GRADIENTES.panel.start}
            end={GRADIENTES.panel.end}
            style={styles.panelHeader}
          >
            <Text style={styles.panelHeaderTitulo}>{t("reserva.terminos.politicasImportantes")}</Text>
            <Text style={styles.panelHeaderTexto}>{RESUMEN_POLITICAS_IMPORTANTES}</Text>
          </LinearGradient>

          <View style={[styles.panelCuerpo, { backgroundColor: c.bgInput }]}>
            {PUNTOS_POLITICA.map((punto) => (
              <View key={punto.titulo} style={styles.puntoBloque}>
                <Text style={[styles.puntoTitulo, { color: c.textPrimary }]}>{punto.titulo}</Text>
                {punto.items.map((item) => (
                  <Text key={item} style={[styles.puntoItem, { color: c.textSecondary }]}>
                    {"\u2022 "}
                    {item}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>
      )}
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
  filaCheckbox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.3,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  textoCheckbox: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
  },
  enlace: {
    fontWeight: "700",
  },
  botonToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 14,
    marginLeft: 28,
  },
  botonToggleTexto: {
    fontSize: 12,
    fontWeight: "700",
  },
  panelTerminos: {
    marginTop: 14,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.3,
  },
  panelHeader: {
    padding: 14,
  },
  panelHeaderTitulo: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  panelHeaderTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 17,
  },
  panelCuerpo: {
    padding: 14,
  },
  puntoBloque: {
    marginBottom: 12,
  },
  puntoTitulo: {
    fontSize: 11.5,
    fontWeight: "800",
    marginBottom: 4,
  },
  puntoItem: {
    fontSize: 11.5,
    lineHeight: 17,
    marginBottom: 2,
  },
});