// modules/reserva/components/FirmaCanvas.tsx
//
// Pad de firma táctil. Réplica funcional de FirmaCanvas.jsx (que en la web
// usa <canvas> + mouse/touch events): acá no hay <canvas> nativo, así que
// dibujamos cada trazo como una serie de segmentos (Views finas y rotadas)
// usando PanResponder — es la técnica estándar para "dibujar líneas" en
// React Native puro, sin agregar ninguna librería nueva que haya que
// instalar/reconstruir.
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";

interface Punto {
  x: number;
  y: number;
}

export interface FirmaCanvasHandle {
  estaVacio: () => boolean;
  limpiar: () => void;
  /** Serializa los trazos dibujados a un string (JSON) para guardarlos. */
  obtenerFirmaData: () => string;
}

interface Props {
  onCambiar?: (vacio: boolean) => void;
}

const GROSOR_TRAZO = 2.5;
const COLOR_TRAZO = "#111827";

function Segmento({ p1, p2 }: { p1: Punto; p2: Punto }) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const largo = Math.sqrt(dx * dx + dy * dy) + GROSOR_TRAZO;
  const angulo = (Math.atan2(dy, dx) * 180) / Math.PI;
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;

  return (
    <View
      style={{
        position: "absolute",
        left: midX - largo / 2,
        top: midY - GROSOR_TRAZO / 2,
        width: largo,
        height: GROSOR_TRAZO,
        borderRadius: GROSOR_TRAZO / 2,
        backgroundColor: COLOR_TRAZO,
        transform: [{ rotate: `${angulo}deg` }],
      }}
    />
  );
}

function Punto_({ p }: { p: Punto }) {
  return (
    <View
      style={{
        position: "absolute",
        left: p.x - GROSOR_TRAZO / 2,
        top: p.y - GROSOR_TRAZO / 2,
        width: GROSOR_TRAZO,
        height: GROSOR_TRAZO,
        borderRadius: GROSOR_TRAZO / 2,
        backgroundColor: COLOR_TRAZO,
      }}
    />
  );
}

const FirmaCanvas = forwardRef<FirmaCanvasHandle, Props>(({ onCambiar }, ref) => {
  const c = useTemaColores();
  const [trazos, setTrazos] = useState<Punto[][]>([]);
  const trazoActualRef = useRef<Punto[]>([]);
  const [, forceRender] = useState(0);

  useImperativeHandle(ref, () => ({
    estaVacio: () => trazos.length === 0,
    limpiar: () => {
      setTrazos([]);
      trazoActualRef.current = [];
      onCambiar?.(true);
    },
    obtenerFirmaData: () => JSON.stringify(trazos),
  }));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evento) => {
        const { locationX, locationY } = evento.nativeEvent;
        trazoActualRef.current = [{ x: locationX, y: locationY }];
        forceRender((n) => n + 1);
      },
      onPanResponderMove: (evento) => {
        const { locationX, locationY } = evento.nativeEvent;
        trazoActualRef.current = [
          ...trazoActualRef.current,
          { x: locationX, y: locationY },
        ];
        forceRender((n) => n + 1);
      },
      onPanResponderRelease: () => {
        if (trazoActualRef.current.length > 0) {
          const trazo = trazoActualRef.current;
          setTrazos((prev) => [...prev, trazo]);
          onCambiar?.(false);
        }
        trazoActualRef.current = [];
      },
    })
  ).current;

  const todosLosTrazos = [...trazos, trazoActualRef.current];

  return (
    <View
      style={[styles.lienzo, { backgroundColor: c.bgInput, borderColor: "#93c5fd" }]}
      {...panResponder.panHandlers}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {todosLosTrazos.map((trazo, i) => (
          <React.Fragment key={i}>
            {trazo.map((p, j) => (
              <React.Fragment key={j}>
                <Punto_ p={p} />
                {j > 0 && <Segmento p1={trazo[j - 1]} p2={p} />}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
});

FirmaCanvas.displayName = "FirmaCanvas";

export default FirmaCanvas;

const styles = StyleSheet.create({
  lienzo: {
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
  },
});
