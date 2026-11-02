import { useReferenceStore } from '@/store/referenceStore'
import { documentosService } from '../../services/documentsService'
import { actualizarPerfil } from '@/modules/profile/services/profileService'
import { reservaPersistService, ReservaGuardada } from '../../services/reservationPersistService'
import { router } from 'expo-router'
import { captchaTokenStore } from '../../services/captchaTokenStore'
import { aCentavos, construirUrlCheckout } from '../../services/wompiService'
import { Platform } from 'react-native'
import { Alert } from '@/utils/alerta'
import React from 'react'
import { Vehiculo } from '@/modules/catalog/types/catalog.types'

function separarNombreCompleto(nombreCompleto: string): {
  nombres: string;
  apellidos: string;
} {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return { nombres: "", apellidos: "" };
  if (partes.length === 1) return { nombres: partes[0], apellidos: "" };
  const mitad = Math.ceil(partes.length / 2);
  return {
    nombres: partes.slice(0, mitad).join(" "),
    apellidos: partes.slice(mitad).join(" "),
  };
}

export default function useFormDatosPersonalesLogic2({ actualizarUsuarioGlobal, captchaDesactivadoRef, captchaVerificado, checkOutsideSchedule, cuponAplicado, datosCompletos, datosPersonales, documentos, fechasLugar, isSubmittingRef, limpiarReserva, planes, procesandoPago, reservaCreada, setAlertaCancelarProcesoVisible, setAlertaFaltantesVisible, setAlertaHorarioVisible, setErrorCaptcha, setErrorServidor, setModalInstruccionesEfectivoVisible, setModalReservaVisible, setProcesandoPago, setReservaCreada, setTipoErrorAlerta, t, usuarioGlobal, vehiculo }: { actualizarUsuarioGlobal: (data: Partial<import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/profile/types/profile.types").UsuarioPerfil>) => void; captchaDesactivadoRef: React.RefObject<boolean>; captchaVerificado: boolean; checkOutsideSchedule: () => boolean; cuponAplicado: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").Cupon | null; datosCompletos: boolean; datosPersonales: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosPersonales; documentos: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosDocumentos; fechasLugar: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosFechasLugar; isSubmittingRef: React.RefObject<boolean>; limpiarReserva: () => void; planes: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosPlanes; procesandoPago: boolean; reservaCreada: ReservaGuardada | null; setAlertaCancelarProcesoVisible: React.Dispatch<React.SetStateAction<boolean>>; setAlertaFaltantesVisible: React.Dispatch<React.SetStateAction<boolean>>; setAlertaHorarioVisible: React.Dispatch<React.SetStateAction<boolean>>; setErrorCaptcha: React.Dispatch<React.SetStateAction<boolean>>; setErrorServidor: React.Dispatch<React.SetStateAction<string>>; setModalInstruccionesEfectivoVisible: React.Dispatch<React.SetStateAction<boolean>>; setModalReservaVisible: React.Dispatch<React.SetStateAction<boolean>>; setProcesandoPago: React.Dispatch<React.SetStateAction<boolean>>; setReservaCreada: React.Dispatch<React.SetStateAction<ReservaGuardada | null>>; setTipoErrorAlerta: React.Dispatch<React.SetStateAction<'general' | 'documento' | 'documento_duplicado' | 'reserva' | 'vehiculo_ocupado'>>; t: any; usuarioGlobal: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/profile/types/profile.types").UsuarioPerfil; vehiculo: Vehiculo }) {
  const ejecutarCreacionReserva = async (fueraDeHorario = false) => {
      if (isSubmittingRef.current) {
        console.warn("[PersonalDataForm] Petición de reserva ya en curso, ignorando duplicado.");
        return;
      }
  
      isSubmittingRef.current = true;
      setProcesandoPago(true);
      setErrorServidor("");
  
      try {
        if (documentos.cedulaFrente || documentos.licenciaConduccion) {
          try {
            const sucursales = useReferenceStore.getState().sucursales;
            const sedeVehiculo = sucursales.find(
              (b) =>
                b.id === vehiculo.sucursalId ||
                (vehiculo.sucursal && b.name.toLowerCase() === vehiculo.sucursal.toLowerCase())
            );
            const idSucursal =
              (vehiculo as any).sucursalId ||
              (vehiculo as any).branchId ||
              (vehiculo as any).currentBranchId ||
              sedeVehiculo?.id ||
              sucursales[0]?.id ||
              "";
  
            await documentosService.subir({
              tipoDocumento: datosPersonales.tipoDocumento,
              numeroDocumento: datosPersonales.numeroDocumento,
              sucursalId: idSucursal,
              identificacion: documentos.cedulaFrente,
              identificacionReverso: documentos.cedulaReverso,
              licencia: documentos.licenciaConduccion,
            });
          } catch (errDoc: any) {
            const errDocMsg =
              errDoc?.response?.data?.detail ||
              errDoc?.response?.data?.message ||
              errDoc?.message ||
              "";
            const errDocLower = String(errDocMsg).toLowerCase();
            if (
              errDoc?.response?.status === 409 ||
              errDocLower.includes("registrado con otra cuenta") ||
              errDocLower.includes("ya se encuentra registrado")
            ) {
              setTipoErrorAlerta("documento_duplicado");
              setErrorServidor(
                t("reserva.confirmacion.errorDocumentoDuplicado", {
                  defaultValue:
                    "El número de documento ingresado ya se encuentra registrado con otra cuenta de usuario. Por favor verifica tus datos o inicia sesión con tu cuenta registrada.",
                })
              );
            } else {
              setTipoErrorAlerta("documento");
              setErrorServidor(
                errDocMsg ||
                  t("reserva.confirmacion.errorSubirDocs", {
                    defaultValue:
                      "No se pudieron subir los documentos de verificación. Por favor revisa los archivos e intenta nuevamente.",
                  })
              );
            }
            return;
          }
        }
  
        // Persistir cambios de datos personales en el perfil de usuario (BD y store)
        try {
          const { nombres, apellidos } = separarNombreCompleto(datosPersonales.nombreCompleto);
          const perfilActualizado = await actualizarPerfil("", {
            nombres: nombres || usuarioGlobal.nombres,
            apellidos: apellidos || usuarioGlobal.apellidos,
            telefono: datosPersonales.celular,
            numeroDocumento: datosPersonales.numeroDocumento,
            tipoDocumento: datosPersonales.tipoDocumento ?? undefined,
            nacionalidad: datosPersonales.nacionalidad,
            direccion: usuarioGlobal.direccion || "",
            fechaNacimiento: usuarioGlobal.fechaNacimiento || "",
          });
          if (perfilActualizado) {
            actualizarUsuarioGlobal(perfilActualizado);
          }
        } catch (errPerfil: any) {
          if (errPerfil?.response?.status === 409) {
            console.warn("[PersonalDataForm] Conflicto 409 al actualizar perfil, continuando con reserva.");
          } else {
            console.warn("No se pudo actualizar el perfil en BD:", errPerfil);
          }
        }
  
        const fechasAUsar = fueraDeHorario
          ? { ...fechasLugar, fueraDeHorarioAceptado: true }
          : fechasLugar;
  
        const creada = await reservaPersistService.crear({
          vehiculo,
          fechasLugar: fechasAUsar,
          planes,
          cupon: cuponAplicado,
        });
        setReservaCreada(creada);
  
        if (creada.metodoPago === "efectivo") {
          setModalInstruccionesEfectivoVisible(true);
        } else if (creada.estado === "PENDIENTE_HORARIO" || fueraDeHorario || fechasLugar.fueraDeHorarioAceptado) {
          limpiarReserva();
          router.replace("/(tabs)/my-bookings");
        } else if (creada.estado === "PENDIENTE") {
          setModalReservaVisible(true);
        } else {
          limpiarReserva();
          router.replace(`/payment-response?ref=${encodeURIComponent(creada.id)}` as any);
        }
      } catch (error: any) {
        const errorMsg =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "";
        const errorMsgLower = String(errorMsg).toLowerCase();
  
        const esErrorDocDuplicado =
          error?.response?.status === 409 &&
          (errorMsgLower.includes("document") ||
            errorMsgLower.includes("cedula") ||
            errorMsgLower.includes("cédula") ||
            errorMsgLower.includes("duplicate") ||
            errorMsgLower.includes("unique") ||
            errorMsgLower.includes("registrado con otra") ||
            errorMsgLower.includes("uq_users_document_number"));
  
        const esErrorVehiculoOcupado =
          error?.response?.status === 409 &&
          (errorMsgLower.includes("debido a otra reserva") ||
            errorMsgLower.includes("no se encuentra disponible en las fechas") ||
            errorMsgLower.includes("overlapping") ||
            errorMsgLower.includes("overlap"));
  
        if (esErrorDocDuplicado) {
          setTipoErrorAlerta("documento");
          setErrorServidor(
            t("reserva.confirmacion.errorDocumentoDuplicado", {
              defaultValue: "El número de documento ingresado ya se encuentra registrado con otra cuenta de usuario. Por favor verifica tus datos o inicia sesión con tu cuenta registrada.",
            })
          );
        } else if (esErrorVehiculoOcupado) {
          setTipoErrorAlerta("vehiculo_ocupado");
          setErrorServidor(
            t("reserva.confirmacion.errorVehiculoOcupado", {
              defaultValue: "Otro usuario acaba de apartar este vehículo para estas fechas mientras completabas el formulario. Si esa persona no completa su pago dentro del plazo, el vehículo quedará libre nuevamente. También puedes explorar otros vehículos disponibles en el catálogo.",
            })
          );
        } else if (error?.response?.status === 409) {
          if (errorMsgLower.includes("documento ya registrado") || errorMsgLower.includes("número de documento")) {
            setTipoErrorAlerta("documento");
            setErrorServidor(
              t("reserva.confirmacion.errorDocumentoDuplicado", {
                defaultValue: "El número de documento ingresado ya se encuentra registrado con otra cuenta de usuario. Por favor verifica tus datos o inicia sesión con tu cuenta registrada.",
              })
            );
          } else {
            setTipoErrorAlerta("reserva");
            const safeMsg = (!errorMsg || errorMsgLower.includes("conflicto con el estado actual"))
              ? t("reserva.confirmacion.error409", {
                  defaultValue: "Ya se está procesando una reserva para este vehículo o fechas. Por favor verifica en 'Mis reservas'.",
                })
              : errorMsg;
            setErrorServidor(safeMsg);
          }
        } else {
          setTipoErrorAlerta("general");
          const apiErrors = error?.response?.data?.errors;
          const detailsErrors = Array.isArray(apiErrors) && apiErrors.length > 0
            ? apiErrors.map((e: any) => e.message || `${e.field}: inválido`).join("\n")
            : "";
          const msg =
            detailsErrors ||
            errorMsg ||
            t("reserva.confirmacion.errorCrearMensaje", { defaultValue: "No se pudo registrar la reserva. Verifica que todos los datos y documentos sean válidos." });
          setErrorServidor(msg);
        }
      } finally {
        setProcesandoPago(false);
        isSubmittingRef.current = false;
      }
    };
  
    const handleConfirmarReserva = async () => {
      if (procesandoPago || isSubmittingRef.current) return;
  
      if (!datosCompletos) {
        setAlertaFaltantesVisible(true);
        return;
      }
  
      // Se exige un token vigente del captcha (no solo la marca visual): el servidor lo valida
      if (!captchaVerificado || (!captchaTokenStore.get() && !captchaDesactivadoRef.current)) {
        setErrorCaptcha(true);
        return;
      }
      setErrorCaptcha(false);
  
      if (checkOutsideSchedule() && !fechasLugar.fueraDeHorarioAceptado) {
        setAlertaHorarioVisible(true);
        return;
      }
  
      await ejecutarCreacionReserva(false);
    };
  
    const handleIrAMisReservas = () => {
      setModalInstruccionesEfectivoVisible(false);
      limpiarReserva();
      router.replace("/(tabs)/my-bookings");
    };
  
    const handleVolverAlInicio = () => {
      setModalInstruccionesEfectivoVisible(false);
      limpiarReserva();
      router.replace("/(tabs)");
    };
  
    const handlePagarMasTarde = () => {
      setModalReservaVisible(false);
      limpiarReserva();
      router.replace("/(tabs)/my-bookings");
    };
  
    const handleConfirmarCancelarProceso = () => {
      setAlertaCancelarProcesoVisible(false);
      limpiarReserva();
      router.replace("/(tabs)");
    };
  
    const handlePagarWompi = async () => {
      if (!reservaCreada) return;
      setProcesandoPago(true);
  
      try {
        const amountInCents = aCentavos(reservaCreada.total);
  
        const url = await construirUrlCheckout({
          reference: reservaCreada.id,
          amountInCents,
        });
  
        setModalReservaVisible(false);
  
        if (Platform.OS === "web" && typeof window !== "undefined") {
          limpiarReserva();
          window.location.href = url;
          return;
        }
  
        router.push({
          pathname: "/wompi-checkout" as any,
          params: {
            url: encodeURIComponent(url),
            ref: encodeURIComponent(reservaCreada.id),
          },
        });
  
        setTimeout(() => {
          limpiarReserva();
        }, 500);
      } catch (error) {
        Alert.alert(
          t("comun.error", { defaultValue: "Error" }),
          t("reserva.confirmacion.errorWompi", { defaultValue: "No se pudo abrir la pasarela de pago de Wompi." })
        );
      } finally {
        setProcesandoPago(false);
      }
    };

  return { ejecutarCreacionReserva, handleConfirmarReserva, handleIrAMisReservas, handleVolverAlInicio, handlePagarMasTarde, handleConfirmarCancelarProceso, handlePagarWompi }
}
