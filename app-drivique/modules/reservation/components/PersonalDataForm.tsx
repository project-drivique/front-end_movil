// modules/reserva/components/FormDatosPersonales.tsx
import { Vehiculo } from "@/modules/catalog/types/catalog.types";





import { View } from 'react-native'

import { router } from "expo-router";


import { AlertModal } from "../../../components/ui/AlertModal";








import BarraTotalConfirmar from "./TotalConfirmBar";

import ModalReservaRegistrada from "./BookingRegisteredModal";
import { BranchCashPaymentModal } from "./BranchCashPaymentModal";

import TarjetaTerminosCondiciones from "./TermsConditionsCard";
import TarjetaVerificacionDocumental from "./DocumentVerificationCard";
import CouponSection from "./CouponSection";
import SecurityCaptcha from "./SecurityCaptcha";




import { styles } from './PersonalDataForm/PersonalDataForm.styles'
import PersonalDataFormPart4 from './PersonalDataForm/PersonalDataFormPart4'
import PersonalDataFormPart3 from './PersonalDataForm/PersonalDataFormPart3'
import PersonalDataFormPart2 from './PersonalDataForm/PersonalDataFormPart2'
import PersonalDataFormPart from './PersonalDataForm/PersonalDataFormPart'
import useFormDatosPersonalesLogic1 from './PersonalDataForm/useFormDatosPersonalesLogic1'
import useFormDatosPersonalesLogic2 from './PersonalDataForm/useFormDatosPersonalesLogic2'





interface Props {
  vehiculo: Vehiculo;
}

export default function FormDatosPersonales({ vehiculo }: Props) {
  const { c, t, datosPersonales, OPCIONES_NACIONALIDAD, opcionesTipoDocumentoFiltradas, actualizarDatosPersonales, actualizarFechasLugar, fechasLugar, planes, documentos, cuponAplicado, usuarioGlobal, actualizarUsuarioGlobal, limpiarReserva, modalReservaVisible, setModalReservaVisible, docsVerificados, alertaFaltantesVisible, setAlertaFaltantesVisible, alertaHorarioVisible, setAlertaHorarioVisible, alertaEfectivoVisible, setAlertaEfectivoVisible, alertaErrorPagoVisible, setAlertaErrorPagoVisible, alertaCancelarProcesoVisible, setAlertaCancelarProcesoVisible, procesandoPago, setProcesandoPago, isSubmittingRef, reservaCreada, setReservaCreada, errorServidor, setErrorServidor, tipoErrorAlerta, setTipoErrorAlerta, modalInstruccionesEfectivoVisible, setModalInstruccionesEfectivoVisible, captchaVerificado, setCaptchaVerificado, errorCaptcha, setErrorCaptcha, captchaDesactivadoRef, primaryAccent, prefijoTelefono, hayPrefijo, datosCompletos, total, branchName, horario, checkOutsideSchedule } = useFormDatosPersonalesLogic1({ vehiculo })

  const { ejecutarCreacionReserva, handleConfirmarReserva, handleIrAMisReservas, handleVolverAlInicio, handlePagarMasTarde, handleConfirmarCancelarProceso, handlePagarWompi } = useFormDatosPersonalesLogic2({ actualizarUsuarioGlobal, captchaDesactivadoRef, captchaVerificado, checkOutsideSchedule, cuponAplicado, datosCompletos, datosPersonales, documentos, fechasLugar, isSubmittingRef, limpiarReserva, planes, procesandoPago, reservaCreada, setAlertaCancelarProcesoVisible, setAlertaFaltantesVisible, setAlertaHorarioVisible, setErrorCaptcha, setErrorServidor, setModalInstruccionesEfectivoVisible, setModalReservaVisible, setProcesandoPago, setReservaCreada, setTipoErrorAlerta, t, usuarioGlobal, vehiculo })

  return (
    <View>
      {/* Tarjeta Padre Contenedora */}
      <PersonalDataFormPart OPCIONES_NACIONALIDAD={OPCIONES_NACIONALIDAD} actualizarDatosPersonales={actualizarDatosPersonales} actualizarUsuarioGlobal={actualizarUsuarioGlobal} c={c} datosPersonales={datosPersonales} hayPrefijo={hayPrefijo} opcionesTipoDocumentoFiltradas={opcionesTipoDocumentoFiltradas} prefijoTelefono={prefijoTelefono} primaryAccent={primaryAccent} t={t} />

      {/* 2. Tarjeta Padre de Verificación Documental */}
      <View style={[styles.cardPadre, { backgroundColor: c.bgCard, borderColor: c.border }]}>
        <TarjetaVerificacionDocumental
          tipoDocumento={datosPersonales.tipoDocumento ?? undefined}
          docsVerificados={docsVerificados}
        />
      </View>

      {/* 3. Tarjeta Padre de Cupón y Políticas */}
      <View style={[styles.cardPadre, { backgroundColor: c.bgCard, borderColor: c.border }]}>
        <CouponSection vehiculo={vehiculo} />
        <TarjetaTerminosCondiciones />
      </View>

      {/* Aviso informativo previo a la confirmación */}
      {(() => {
        const horasLimite = reservaCreada?.fechaLimitePago
          ? Math.max(1, Math.ceil((new Date(reservaCreada.fechaLimitePago).getTime() - Date.now()) / 3600000))
          : undefined;

        return (
          <>
            <PersonalDataFormPart2 c={c} t={t} />

            <SecurityCaptcha
              isVerified={captchaVerificado}
              onVerified={(verified, token) => {
                captchaDesactivadoRef.current = Boolean(verified && !token);
                setCaptchaVerificado(verified);
                if (verified) setErrorCaptcha(false);
              }}
              hasError={errorCaptcha}
              style={{ marginTop: 10, marginBottom: 20 }}
            />

            <BarraTotalConfirmar
              total={total}
              cargando={procesandoPago}
              onConfirmar={handleConfirmarReserva}
              onCancelar={() => setAlertaCancelarProcesoVisible(true)}
            />

            <ModalReservaRegistrada
              visible={modalReservaVisible}
              horasLimitePago={horasLimite}
              cargando={procesandoPago}
              onPagarWompi={handlePagarWompi}
              onCerrar={handlePagarMasTarde}
            />

            <BranchCashPaymentModal
              visible={modalInstruccionesEfectivoVisible}
              referencia={reservaCreada?.referencia || ""}
              codigoPago={reservaCreada?.codigoPagoEfectivo}
              nombreSucursal={vehiculo.sucursal || ""}
              total={reservaCreada?.total ?? total}
              horasLimitePago={horasLimite}
              onIrAMisReservas={handleIrAMisReservas}
              onVolverAlInicio={handleVolverAlInicio}
            />
          </>
        );
      })()}

      <AlertModal
        visible={alertaCancelarProcesoVisible}
        icono="alert-circle-outline"
        titulo={t("reserva.confirmacion.cancelarProcesoTitulo", { defaultValue: "¿Cancelar proceso de reserva?" })}
        mensaje={t("reserva.confirmacion.cancelarProcesoMensaje", {
          defaultValue: "Se descartarán los datos ingresados en este proceso y regresarás al catálogo de vehículos.",
        })}
        botones={[
          {
            texto: t("comun.no", { defaultValue: "No, continuar" }),
            variante: "secundario",
            onPress: () => setAlertaCancelarProcesoVisible(false),
          },
          {
            texto: t("reserva.confirmacion.siCancelar", { defaultValue: "Sí, cancelar reserva" }),
            variante: "primario",
            onPress: handleConfirmarCancelarProceso,
          },
        ]}
        onCerrar={() => setAlertaCancelarProcesoVisible(false)}
      />

      <AlertModal
        visible={alertaFaltantesVisible}
        icono="alert-circle-outline"
        titulo={t("reserva.datosPersonales.alertaFaltantesTitulo", { defaultValue: "Información incompleta" })}
        mensaje={t("reserva.datosPersonales.alertaFaltantesMensaje", {
          defaultValue: "Por favor completa todos los campos obligatorios y adjunta los documentos requeridos para confirmar tu reserva.",
        })}
        botones={[
          {
            texto: t("comun.entendido", { defaultValue: "Entendido" }),
            variante: "primario",
            onPress: () => setAlertaFaltantesVisible(false),
          },
        ]}
        onCerrar={() => setAlertaFaltantesVisible(false)}
      />

      <PersonalDataFormPart3 actualizarFechasLugar={actualizarFechasLugar} alertaHorarioVisible={alertaHorarioVisible} branchName={branchName} ejecutarCreacionReserva={ejecutarCreacionReserva} horario={horario} setAlertaHorarioVisible={setAlertaHorarioVisible} t={t} />

      <AlertModal
        visible={alertaEfectivoVisible}
        icono="checkmark-circle-outline"
        titulo={t("reserva.confirmacion.efectivoConfirmadaTitulo")}
        mensaje={t("reserva.confirmacion.efectivoConfirmadaMensaje", {
          horas: reservaCreada?.fechaLimitePago
            ? Math.max(1, Math.ceil((new Date(reservaCreada.fechaLimitePago).getTime() - Date.now()) / 3600000))
            : "",
        })}
        botones={[
          {
            texto: t("reserva.confirmacion.entendidoIrAMisReservas"),
            variante: "primario",
            onPress: () => {
              setAlertaEfectivoVisible(false);
              limpiarReserva();
              router.replace("/(tabs)/my-bookings");
            },
          },
        ]}
        onCerrar={() => setAlertaEfectivoVisible(false)}
      />

      <PersonalDataFormPart4 errorServidor={errorServidor} limpiarReserva={limpiarReserva} setErrorServidor={setErrorServidor} t={t} tipoErrorAlerta={tipoErrorAlerta} />

      <AlertModal
        visible={alertaErrorPagoVisible}
        icono="close-circle-outline"
        titulo={t("reserva.confirmacion.errorPagoTitulo", { defaultValue: "No se pudo completar el pago" })}
        mensaje={t("reserva.confirmacion.errorPagoMensaje", { defaultValue: "Hubo un error al procesar el pago con la pasarela. Intenta de nuevo." })}
        botones={[]}
        onCerrar={() => setAlertaErrorPagoVisible(false)}
      />
    </View>
  );
}


