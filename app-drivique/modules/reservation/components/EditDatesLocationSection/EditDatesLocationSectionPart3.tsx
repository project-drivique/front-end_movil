import SelectorHoraModal from '../TimeSelectorModal'
import { formatHoraAmPm } from '../../constants/reservation.constants'
import React from 'react'

export default function EditDatesLocationSectionPart3({ draft, esUnSoloDia, fechaDevolucionEfectiva, handleElegirHora, horaVisible, infoDuracion, nombreSucursal, setHoraVisible, t }: { draft: { metodoPago: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").MetodoPago | null; lugarRetiro: string; lugarDevolucion: string; fechaRetiro: string | null; fechaDevolucion: string | null; horaRetiro: string; horaDevolucion: string; barrioRetiro: string; direccionRetiro: string; referenciasRetiro: string; barrioDevolucion: string; direccionDevolucion: string; referenciasDevolucion: string; descuentoPromocion?: number; fueraDeHorarioAceptado?: boolean; }; esUnSoloDia: boolean; fechaDevolucionEfectiva: string | null; handleElegirHora: (hora: string) => void; horaVisible: 'retiro' | 'devolucion' | null; infoDuracion: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/constants/reservation.constants").InfoDuracionAlquiler | null; nombreSucursal: string; setHoraVisible: React.Dispatch<React.SetStateAction<'retiro' | 'devolucion' | null>>; t: any }) {
  return (
    <SelectorHoraModal
          visible={horaVisible !== null}
          fecha={horaVisible === "retiro" ? draft.fechaRetiro : fechaDevolucionEfectiva}
          minHora={null}
          maxHora={
            horaVisible === "devolucion" && draft.horaRetiro
              ? draft.horaRetiro
              : null
          }
          subtitulo={
            horaVisible === "devolucion" && esUnSoloDia && draft.fechaRetiro
              ? t("extra.computo.devSiguiente", { fecha: fechaDevolucionEfectiva })
              : null
          }
          alertaInformativa={
            horaVisible === "devolucion" && draft.horaRetiro
              ? {
                  titulo: t("reserva.fechasLugar.alertaHoraDevolucionTitulo", {
                    defaultValue: `Hora máxima de devolución: ${formatHoraAmPm(draft.horaRetiro)}`,
                  }),
                  mensaje: t("reserva.fechasLugar.alertaHoraDevolucionMensaje", {
                    defaultValue: `Para cumplir con los ${infoDuracion?.titulo ?? "días"} de tu reserva (retiro a las ${formatHoraAmPm(draft.horaRetiro)}), la hora límite de entrega es a las ${formatHoraAmPm(draft.horaRetiro)}. Si seleccionas una hora anterior, se calculará devolución anticipada.`,
                  }),
                }
              : null
          }
          nombreSucursal={horaVisible === "retiro" ? (draft.lugarRetiro || nombreSucursal) : (draft.lugarDevolucion || nombreSucursal)}
          horaSeleccionada={horaVisible === "retiro" ? draft.horaRetiro : draft.horaDevolucion}
          onSeleccionar={handleElegirHora}
          onCerrar={() => setHoraVisible(null)}
        />
  )
}
