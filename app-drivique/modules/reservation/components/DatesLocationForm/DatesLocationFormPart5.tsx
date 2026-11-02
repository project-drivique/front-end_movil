import SelectorHoraModal from '../TimeSelectorModal'
import { formatHoraAmPm } from '../../constants/reservation.constants'
import React from 'react'

export default function DatesLocationFormPart5({ diasReserva, esUnSoloDia, fechaDevolucionEfectiva, fechasLugar, handleElegirHora, horaVisible, nombreSucursal, setHoraVisible, t }: { diasReserva: number; esUnSoloDia: boolean; fechaDevolucionEfectiva: string | null; fechasLugar: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosFechasLugar; handleElegirHora: (hora: string) => void; horaVisible: 'retiro' | 'devolucion' | null; nombreSucursal: string; setHoraVisible: React.Dispatch<React.SetStateAction<'retiro' | 'devolucion' | null>>; t: any }) {
  return (
    <SelectorHoraModal
          visible={horaVisible !== null}
          fecha={horaVisible === "retiro" ? fechasLugar.fechaRetiro : fechaDevolucionEfectiva}
          minHora={null}
          maxHora={
            horaVisible === "devolucion" && fechasLugar.horaRetiro
              ? fechasLugar.horaRetiro
              : null
          }
          subtitulo={
            horaVisible === "devolucion" && esUnSoloDia && fechasLugar.fechaRetiro
              ? t("extra.computo.devSiguiente", { fecha: fechaDevolucionEfectiva })
              : null
          }
          alertaInformativa={
            horaVisible === "devolucion" && fechasLugar.horaRetiro
              ? {
                  titulo: t("reserva.fechasLugar.alertaHoraDevolucionTitulo", {
                    defaultValue: `Hora máxima de devolución: ${formatHoraAmPm(fechasLugar.horaRetiro)}`,
                  }),
                  mensaje: t("reserva.fechasLugar.alertaHoraDevolucionMensaje", {
                    defaultValue: `Para cumplir con los ${diasReserva} ${diasReserva === 1 ? "día" : "días"} de tu reserva (retiro a las ${formatHoraAmPm(fechasLugar.horaRetiro)}), la hora límite de entrega es a las ${formatHoraAmPm(fechasLugar.horaRetiro)}. Si seleccionas una hora anterior, se calculará devolución anticipada.`,
                  }),
                }
              : null
          }
          nombreSucursal={horaVisible === "retiro" ? (fechasLugar.lugarRetiro || nombreSucursal) : (fechasLugar.lugarDevolucion || nombreSucursal)}
          horaSeleccionada={horaVisible === "retiro" ? fechasLugar.horaRetiro : fechasLugar.horaDevolucion}
          onSeleccionar={handleElegirHora}
          onCerrar={() => setHoraVisible(null)}
        />
  )
}
