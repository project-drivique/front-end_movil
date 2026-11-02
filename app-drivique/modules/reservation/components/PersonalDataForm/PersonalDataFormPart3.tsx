import { AlertModal } from '../../../../components/ui/AlertModal'
import React from 'react'

export default function PersonalDataFormPart3({ actualizarFechasLugar, alertaHorarioVisible, branchName, ejecutarCreacionReserva, horario, setAlertaHorarioVisible, t }: { actualizarFechasLugar: (data: Partial<import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosFechasLugar>) => void; alertaHorarioVisible: boolean; branchName: string; ejecutarCreacionReserva: (fueraDeHorario?: boolean) => Promise<void>; horario: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/constants/catalog.constants").HorarioSucursal; setAlertaHorarioVisible: React.Dispatch<React.SetStateAction<boolean>>; t: any }) {
  return (
    <AlertModal
          visible={alertaHorarioVisible}
          icono="time-outline"
          titulo={t("reserva.horario.titulo", { defaultValue: "Sucursal fuera de horario de atención" })}
          mensaje={t("reserva.horario.mensaje", {
            sucursal: branchName || t("reserva.horario.laSucursal", { defaultValue: "la sucursal" }),
            apertura: horario.horaApertura,
            cierre: horario.horaCierre,
            defaultValue: `La sucursal ${branchName} tiene un horario de atención de ${horario.horaApertura} a ${horario.horaCierre}.\n\n⏱️ En este momento se encuentra cerrada, pero puedes registrar tu reserva ahora y quedará en estado PENDIENTE.\n\nMañana a las ${horario.horaApertura} te notificaremos por correo electrónico, notificación web y push para que puedas continuar con tu reserva.`,
          })}
          botones={[
            {
              texto: t("reserva.horario.modificar", { defaultValue: "Regresar" }),
              variante: "secundario",
              onPress: () => setAlertaHorarioVisible(false),
            },
            {
              texto: t("reserva.horario.aceptar", { defaultValue: "Registrar como pendiente" }),
              variante: "primario",
              onPress: () => {
                actualizarFechasLugar({ fueraDeHorarioAceptado: true });
                setAlertaHorarioVisible(false);
                ejecutarCreacionReserva(true);
              },
            },
          ]}
          onCerrar={() => setAlertaHorarioVisible(false)}
        />
  )
}
