import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";

interface BotonAlerta {
  texto: string;
  onPress: () => void;
  variante?: "primario" | "secundario";
}

interface Props {
  visible: boolean;
  icono?: keyof typeof Ionicons.glyphMap;
  titulo: string;
  mensaje: string;
  /** Si no se pasa, muestra un botón "Entendido". Pasa [] para no mostrar botones. */
  botones?: BotonAlerta[];
  onCerrar?: () => void;
  /** Contenido extra (ej: tarjeta con la dirección de una sucursal) entre el mensaje y los botones. */
  contenido?: React.ReactNode;
}

// Mismo color y diseño para TODAS las alertas de la app (igual que catalogo.tsx)
const COLOR = "#1E40AF";
const ICONO_DEFECTO: keyof typeof Ionicons.glyphMap = "information-circle-outline";

export function AlertModal({
  visible,
  icono,
  titulo,
  mensaje,
  botones,
  onCerrar,
  contenido,
}: Props) {
  const c = useTemaColores();
  const listaBotones: BotonAlerta[] =
    botones !== undefined
      ? botones
      : [{ texto: "Entendido", onPress: onCerrar ?? (() => {}), variante: "primario" }];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCerrar}
    >
      <Pressable style={s.alertOverlay} onPress={onCerrar}>
        <Pressable style={[s.alertBox, { backgroundColor: c.bgCard }]} onPress={() => {}}>
          <View style={[s.alertIconContainer, { backgroundColor: c.primaryBg }]}>
            <Ionicons
              name={icono ?? ICONO_DEFECTO}
              size={44}
              color={COLOR}
            />
          </View>

          <Text style={[s.alertTitle, { color: c.textPrimary }]}>{titulo}</Text>
          <Text style={[s.alertMessage, { color: c.textSecondary }]}>{mensaje}</Text>

          {contenido}

          {listaBotones.length > 0 && (
            <View style={s.alertButtonsContainer}>
              {listaBotones.map((btn, i) => (
                <TouchableOpacity
                  key={btn.texto + i}
                  style={
                    btn.variante === "secundario"
                      ? [s.alertCancelBtn, { borderColor: COLOR, backgroundColor: c.bgCard }]
                      : [s.alertConfirmBtn, { backgroundColor: COLOR }]
                  }
                  onPress={btn.onPress}
                  activeOpacity={0.8}
                >
                  <Text
                    style={
                      btn.variante === "secundario"
                        ? [s.alertCancelBtnText, { color: COLOR }]
                        : s.alertConfirmBtnText
                    }
                  >
                    {btn.texto}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  alertBox: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  alertIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  alertMessage: {
    fontSize: 13.5,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  alertButtonsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  alertCancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  alertCancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  alertConfirmBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  alertConfirmBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
});