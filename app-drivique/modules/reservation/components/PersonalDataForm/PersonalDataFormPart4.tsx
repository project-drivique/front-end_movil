import { AlertModal } from '../../../../components/ui/AlertModal'
import { router } from 'expo-router'
import React from 'react'

export default function PersonalDataFormPart4({ errorServidor, limpiarReserva, setErrorServidor, t, tipoErrorAlerta }: { errorServidor: string; limpiarReserva: () => void; setErrorServidor: React.Dispatch<React.SetStateAction<string>>; t: any; tipoErrorAlerta: 'general' | 'documento' | 'documento_duplicado' | 'reserva' | 'vehiculo_ocupado' }) {
  return (
    <AlertModal
          visible={!!errorServidor}
          icono={tipoErrorAlerta === "reserva" || tipoErrorAlerta === "vehiculo_ocupado" ? "warning-outline" : "close-circle-outline"}
          titulo={
            tipoErrorAlerta === "documento_duplicado"
              ? t("reserva.confirmacion.docDuplicadoTitulo", { defaultValue: "Documento ya registrado" })
              : tipoErrorAlerta === "documento"
              ? t("reserva.confirmacion.errorSubirDocsTitulo", { defaultValue: "Error al subir documentos" })
              : tipoErrorAlerta === "vehiculo_ocupado"
              ? t("reserva.confirmacion.vehiculoOcupadoTitulo", { defaultValue: "Vehículo no disponible" })
              : tipoErrorAlerta === "reserva"
              ? t("reserva.confirmacion.reservaEnProcesoTitulo", { defaultValue: "Reserva en proceso" })
              : t("reserva.confirmacion.errorCrearTitulo", { defaultValue: "Error al registrar la reserva" })
          }
          mensaje={errorServidor}
          botones={
            tipoErrorAlerta === "vehiculo_ocupado"
              ? [
                  {
                    texto: t("reserva.confirmacion.verCatalogo", { defaultValue: "Ver otros vehículos" }),
                    variante: "primario",
                    onPress: () => {
                      setErrorServidor("");
                      limpiarReserva();
                      router.replace("/(tabs)/catalog");
                    },
                  },
                ]
              : tipoErrorAlerta === "reserva"
              ? [
                  {
                    texto: t("reserva.confirmacion.verMisReservas", { defaultValue: "Ver mis reservas" }),
                    variante: "primario",
                    onPress: () => {
                      setErrorServidor("");
                      limpiarReserva();
                      router.replace("/(tabs)/my-bookings");
                    },
                  },
                ]
              : undefined
          }
          onCerrar={() => setErrorServidor("")}
        />
  )
}
