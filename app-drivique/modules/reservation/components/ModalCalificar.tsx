// modules/reservation/components/ModalCalificar.tsx
//
// Modal interactivo para calificar (1 a 5 estrellas libres), comentar
// sobre un vehículo tras una reserva finalizada.
// Incluye moderación en tiempo real (ofensas, datos personales, links, longitud).
import React, { useEffect, useMemo, useState } from "react";
import { Modal } from 'react-native'


import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";


import { ElegibilidadResena, ResenaGuardada, resenaService } from "../services/resenaService";
import { validarComentarioResena } from "../utils/reviewModeration";
import { Alert } from "@/utils/alerta";
import ModalCalificarPart from './ModalCalificar/ModalCalificarPart'



interface Props {
  visible: boolean;
  referenciaReserva: string;
  usuarioId: string;
  usuarioNombre?: string;
  vehiculoId?: number | string;
  vehiculoNombre?: string;
  valorInicial?: ResenaGuardada | null;
  onCerrar: () => void;
  onGuardado: (resena: ResenaGuardada | null) => void;
}

const ETIQUETAS_ESTRELLAS: Record<number, { texto: string; emoji: string }> = {
  1: { texto: "extra.calificar.e1", emoji: "😞" },
  2: { texto: "extra.calificar.e2", emoji: "😐" },
  3: { texto: "extra.calificar.e3", emoji: "🙂" },
  4: { texto: "extra.calificar.e4", emoji: "😊" },
  5: { texto: "extra.calificar.e5", emoji: "🤩" },
};

export function ModalCalificar({
  visible,
  referenciaReserva,
  usuarioId,
  usuarioNombre,
  vehiculoId,
  vehiculoNombre,
  valorInicial,
  onCerrar,
  onGuardado,
}: Props) {
  const c = useTemaColores();
  const { t } = useTranslation();

  const [calificacion, setCalificacion] = useState(valorInicial?.calificacion ?? 0);
  const [comentario, setComentario] = useState(valorInicial?.comentario ?? "");
  const [guardando, setGuardando] = useState(false);
  const [elegibilidad, setElegibilidad] = useState<ElegibilidadResena | null>(null);
  const [calificacionSuc, setCalificacionSuc] = useState(0);
  const [comentarioSuc, setComentarioSuc] = useState("");

  useEffect(() => {
    if (visible) {
      setCalificacion(valorInicial?.calificacion ?? 0);
      setComentario(valorInicial?.comentario ?? "");
      setCalificacionSuc(0);
      setComentarioSuc("");
      setGuardando(false);
    }
  }, [visible, valorInicial]);

  // Igual que la web: el servidor dice si se puede reseñar el vehículo y/o la sucursal
  useEffect(() => {
    if (!visible || !referenciaReserva) return;
    let activo = true;
    resenaService
      .obtenerElegibilidad(referenciaReserva)
      .then((e) => activo && setElegibilidad(e))
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, [visible, referenciaReserva]);

  const mostrarVehiculo = !valorInicial && (!elegibilidad || elegibilidad.puedeVehiculo);
  const mostrarSucursal = !!elegibilidad?.puedeSucursal && !!elegibilidad.sucursalId;

  // Validación de moderación en tiempo real
  const validacion = useMemo(() => {
    return validarComentarioResena(comentario);
  }, [comentario]);
  const validacionSuc = useMemo(() => validarComentarioResena(comentarioSuc), [comentarioSuc]);

  const getMensajeModeracion = () => {
    if (!validacion.tipo) return validacion.mensajeError;
    switch (validacion.tipo) {
      case "length":
        return comentario.length > 400
          ? t("reserva.calificar.moderacion.lengthMax", { defaultValue: "El comentario no puede exceder los 400 caracteres." })
          : t("reserva.calificar.moderacion.lengthMin", { defaultValue: "El comentario debe tener al menos 8 caracteres." });
      case "links":
        return t("reserva.calificar.moderacion.links", { defaultValue: "Por seguridad, no se permiten enlaces o páginas web en la reseña." });
      case "privacy":
        return t("reserva.calificar.moderacion.privacy", { defaultValue: "Por tu seguridad, no incluyas datos personales, correos ni teléfonos." });
      case "spam":
        return t("reserva.calificar.moderacion.spam", { defaultValue: "Por favor evita la repetición excesiva de caracteres." });
      case "profanity":
        return t("reserva.calificar.moderacion.profanity", { defaultValue: "Por favor mantén un lenguaje respetuoso y cordial en tu reseña." });
      default:
        return validacion.mensajeError;
    }
  };

  const handleGuardar = async () => {
    const enviarVehiculo = mostrarVehiculo && calificacion >= 1;
    const enviarSucursal = mostrarSucursal && calificacionSuc >= 1;

    if (!enviarVehiculo && !enviarSucursal) {
      Alert.alert(
        t("reserva.calificar.calificarVehiculo", { defaultValue: "Calificar vehículo" }),
        t("reserva.calificar.seleccionaEstrellasAlerta", {
          defaultValue: "Por favor selecciona una calificación de 1 a 5 estrellas.",
        })
      );
      return;
    }

    if ((enviarVehiculo && !validacion.valido) || (enviarSucursal && !validacionSuc.valido)) {
      Alert.alert(
        t("reserva.calificar.calificarVehiculo", { defaultValue: "Calificar vehículo" }),
        enviarVehiculo && !validacion.valido ? getMensajeModeracion() : validacionSuc.mensajeError
      );
      return;
    }

    if (guardando) return;

    setGuardando(true);
    try {
      let resena: ResenaGuardada | null = null;
      if (enviarVehiculo) {
        resena = await resenaService.guardar(referenciaReserva, usuarioId, {
          calificacion,
          comentario: comentario.trim(),
          vehiculoId,
          vehiculoNombre,
          usuarioNombre,
        });
      }
      if (enviarSucursal && elegibilidad?.sucursalId) {
        await resenaService.guardarSucursal(referenciaReserva, elegibilidad.sucursalId, {
          calificacion: calificacionSuc,
          comentario: comentarioSuc.trim(),
        });
      }
      onGuardado(resena);
    } catch (error) {
      console.error("[ModalCalificar] Error guardando reseña", error);
      Alert.alert(
        t("comun.error", { defaultValue: "Error" }),
        t("reserva.calificar.errorGuardarCalificacion", { defaultValue: "Ocurrió un error al guardar la calificación." })
      );
    } finally {
      setGuardando(false);
    }
  };

  const etiquetaActual = ETIQUETAS_ESTRELLAS[calificacion];
  const puedeGuardar =
    ((mostrarVehiculo && calificacion >= 1 && validacion.valido) ||
      (mostrarSucursal && calificacionSuc >= 1 && validacionSuc.valido)) &&
    !guardando;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <ModalCalificarPart c={c} calificacion={calificacion} calificacionSuc={calificacionSuc} comentario={comentario} comentarioSuc={comentarioSuc} elegibilidad={elegibilidad} etiquetaActual={etiquetaActual} getMensajeModeracion={getMensajeModeracion} guardando={guardando} handleGuardar={handleGuardar} mostrarSucursal={mostrarSucursal} mostrarVehiculo={mostrarVehiculo} onCerrar={onCerrar} puedeGuardar={puedeGuardar} setCalificacion={setCalificacion} setCalificacionSuc={setCalificacionSuc} setComentario={setComentario} setComentarioSuc={setComentarioSuc} t={t} validacion={validacion} validacionSuc={validacionSuc} valorInicial={valorInicial} vehiculoNombre={vehiculoNombre} />
    </Modal>
  );
}


