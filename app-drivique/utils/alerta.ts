// utils/alerta.ts
//
// Alert.alert de React Native no muestra nada en web. Este reemplazo conserva la misma firma: en celular usa el
// Alert nativo y en web abre el AlertModal de la app (montado una sola vez en el layout por <AlertHost />).
import { Alert as RNAlert, Platform } from "react-native";

export interface BotonAlerta {
  text?: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export interface EstadoAlerta {
  visible: boolean;
  titulo: string;
  mensaje: string;
  botones: BotonAlerta[];
}

type Oyente = (estado: EstadoAlerta) => void;
const oyentes = new Set<Oyente>();

export const suscribirAlertas = (oyente: Oyente) => {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
};

export const Alert = {
  alert(titulo: string, mensaje?: string, botones?: BotonAlerta[]) {
    if (Platform.OS !== "web") {
      RNAlert.alert(titulo, mensaje, botones as never);
      return;
    }
    oyentes.forEach((o) => o({ visible: true, titulo, mensaje: mensaje ?? "", botones: botones ?? [] }));
  },
};
