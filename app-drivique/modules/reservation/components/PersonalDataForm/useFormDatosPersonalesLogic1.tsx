import { useTemaColores } from '@/modules/i18n/hooks/useLanguage'
import { useTranslation } from 'react-i18next'
import { useMemo, useEffect, useState, useRef } from 'react'
import { getTiposDocumento, getNacionalidades, esNacionalidadColombiana, COLOR_MARCA, getPrefijoPorNacionalidad } from '../../constants/reservation.constants'
import { useReservaStore } from '@/store/reservationStore'
import { useReferenceStore } from '@/store/referenceStore'
import { useUsuarioStore } from '@/store/userStore'
import { documentosService } from '../../services/documentsService'
import { obtenerPerfil } from '@/modules/profile/services/profileService'
import { ReservaGuardada } from '../../services/reservationPersistService'
import { COLOR_ACENTO, COLOR_MARCA_OSCURO } from '@/constants/brandPalette'
import { diasEntre } from '../BookingSummaryModal.pieces'
import { useServerQuote } from '../../hooks/useServerQuote'
import { getHorarioSucursal } from '@/modules/catalog/constants/catalog.constants'
import { Vehiculo } from '@/modules/catalog/types/catalog.types'

function combinarNombreCompleto(nombres: string, apellidos: string): string {
  return [nombres, apellidos].filter(Boolean).join(" ").trim();
}

export default function useFormDatosPersonalesLogic1({ vehiculo }: { vehiculo: Vehiculo }) {
  const c = useTemaColores();
    const { t } = useTranslation();
    const OPCIONES_TIPO_DOCUMENTO = useMemo(() => getTiposDocumento(t), [t]);
    const datosPersonales = useReservaStore((s) => s.datosPersonales);
    const nacionalidadesApi = useReferenceStore((st) => st.nacionalidades);
    const cargarNacionalidades = useReferenceStore((st) => st.cargarNacionalidades);
  
    useEffect(() => {
      cargarNacionalidades().catch(() => {});
    }, [cargarNacionalidades]);
  
    const OPCIONES_NACIONALIDAD = useMemo(
      () => getNacionalidades().map((n) => ({ id: n.id, label: n.nombre })),
      [nacionalidadesApi],
    );
  
    const opcionesTipoDocumentoFiltradas = useMemo(() => {
      if (!datosPersonales.nacionalidad) return OPCIONES_TIPO_DOCUMENTO;
      if (esNacionalidadColombiana(datosPersonales.nacionalidad)) {
        return OPCIONES_TIPO_DOCUMENTO.filter(
          (o) => o.id === "CC" || o.id === "CE" || o.id === "Pasaporte"
        );
      }
      return OPCIONES_TIPO_DOCUMENTO.filter(
        (o) => o.id === "Pasaporte" || o.id === "CE"
      );
    }, [datosPersonales.nacionalidad, OPCIONES_TIPO_DOCUMENTO]);
    const actualizarDatosPersonales = useReservaStore(
      (s) => s.actualizarDatosPersonales,
    );
    const actualizarFechasLugar = useReservaStore((s) => s.actualizarFechasLugar);
    const fechasLugar = useReservaStore((s) => s.fechasLugar);
    const planes = useReservaStore((s) => s.planes);
    const documentos = useReservaStore((s) => s.documentos);
    const cuponAplicado = useReservaStore((s) => s.cuponAplicado);
  
    const usuarioGlobal = useUsuarioStore((s) => s.usuario);
    const actualizarUsuarioGlobal = useUsuarioStore((s) => s.actualizarUsuario);
    const limpiarReserva = useReservaStore((s) => s.limpiarReserva);
  
    const [modalReservaVisible, setModalReservaVisible] = useState(false);
    const [docsVerificados, setDocsVerificados] = useState(false);
  
    useEffect(() => {
      let activo = true;
      documentosService.tieneDocumentos().then((valor) => {
        if (activo) setDocsVerificados(valor);
      });
      return () => {
        activo = false;
      };
    }, [usuarioGlobal.id]);
  
    useEffect(() => {
      let activo = true;
      obtenerPerfil()
        .then((perfil) => {
          if (!activo || !perfil) return;
          actualizarUsuarioGlobal(perfil);
          const nombreCompleto = combinarNombreCompleto(perfil.nombres, perfil.apellidos);
          const tel = String(perfil.telefono || "").replace(/\D/g, "");
          const celular = tel.startsWith("57") && tel.length > 10 ? tel.slice(2) : tel;
          const tipoDocStr = String(perfil.tipoDocumento || "");
          const tipoDoc =
            tipoDocStr === "DRIVER_LICENSE" || tipoDocStr === "Licencia de Conducción" || tipoDocStr === "LIC"
              ? null
              : perfil.tipoDocumento;
  
          const precarga: Partial<typeof datosPersonales> = {};
          if (nombreCompleto) precarga.nombreCompleto = nombreCompleto;
          if (perfil.correo) precarga.correo = perfil.correo;
          if (celular) precarga.celular = celular;
          if (perfil.nacionalidad) precarga.nacionalidad = perfil.nacionalidad;
          if (tipoDoc) precarga.tipoDocumento = tipoDoc as any;
          if (perfil.numeroDocumento) precarga.numeroDocumento = perfil.numeroDocumento;
  
          if (Object.keys(precarga).length > 0) {
            actualizarDatosPersonales(precarga);
          }
        })
        .catch(() => {});
      return () => {
        activo = false;
      };
    }, []);
  
    const [alertaFaltantesVisible, setAlertaFaltantesVisible] = useState(false);
    const [alertaHorarioVisible, setAlertaHorarioVisible] = useState(false);
    const [alertaEfectivoVisible, setAlertaEfectivoVisible] = useState(false);
    const [alertaErrorPagoVisible, setAlertaErrorPagoVisible] = useState(false);
    const [alertaCancelarProcesoVisible, setAlertaCancelarProcesoVisible] = useState(false);
    const [procesandoPago, setProcesandoPago] = useState(false);
    const isSubmittingRef = useRef(false);
    const [reservaCreada, setReservaCreada] = useState<ReservaGuardada | null>(null);
    const [errorServidor, setErrorServidor] = useState("");
    const [tipoErrorAlerta, setTipoErrorAlerta] = useState<"general" | "documento" | "documento_duplicado" | "reserva" | "vehiculo_ocupado">("general");
    const [modalInstruccionesEfectivoVisible, setModalInstruccionesEfectivoVisible] = useState(false);
    const [captchaVerificado, setCaptchaVerificado] = useState(false);
    const [errorCaptcha, setErrorCaptcha] = useState(false);
    const captchaDesactivadoRef = useRef(false);
  
    const primaryAccent = c.oscuro ? COLOR_ACENTO : COLOR_MARCA;
    const brandBg = c.oscuro ? COLOR_MARCA_OSCURO : COLOR_MARCA;
  
    useEffect(() => {
      if (!usuarioGlobal) return;
      const precarga: Partial<typeof datosPersonales> = {};
      const nombreCompleto = combinarNombreCompleto(
        usuarioGlobal.nombres,
        usuarioGlobal.apellidos,
      );
      if (!datosPersonales.nombreCompleto && nombreCompleto) {
        precarga.nombreCompleto = nombreCompleto;
      }
      if (!datosPersonales.correo && usuarioGlobal.correo) {
        precarga.correo = usuarioGlobal.correo;
      }
      if (!datosPersonales.nacionalidad && usuarioGlobal.nacionalidad) {
        precarga.nacionalidad = usuarioGlobal.nacionalidad;
      }
      const tipoDocGlobalStr = String(usuarioGlobal.tipoDocumento || "");
      const tipoDoc =
        tipoDocGlobalStr === "DRIVER_LICENSE" || tipoDocGlobalStr === "Licencia de Conducción" || tipoDocGlobalStr === "LIC"
          ? null
          : usuarioGlobal.tipoDocumento;
      if (!datosPersonales.tipoDocumento && tipoDoc) {
        precarga.tipoDocumento = tipoDoc as any;
      }
      if (!datosPersonales.numeroDocumento && usuarioGlobal.numeroDocumento) {
        precarga.numeroDocumento = usuarioGlobal.numeroDocumento;
      }
      if (!datosPersonales.celular && usuarioGlobal.telefono) {
        const tel = String(usuarioGlobal.telefono).replace(/\D/g, "");
        precarga.celular = tel.startsWith("57") && tel.length > 10 ? tel.slice(2) : tel;
      }
      if (Object.keys(precarga).length > 0) {
        actualizarDatosPersonales(precarga);
      }
    }, [usuarioGlobal]);
  
    const prefijoTelefono = useMemo(() => {
      return getPrefijoPorNacionalidad(datosPersonales.nacionalidad || null);
    }, [datosPersonales.nacionalidad, nacionalidadesApi]);
    const hayPrefijo = !!datosPersonales.nacionalidad;
  
    const datosCompletos =
      !!datosPersonales.nombreCompleto.trim() &&
      !!datosPersonales.nacionalidad &&
      // Mismas reglas que la web: correo con formato válido y celular de al menos 10 dígitos
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosPersonales.correo.trim()) &&
      datosPersonales.celular.trim().length >= 10 &&
      !!datosPersonales.tipoDocumento &&
      !!datosPersonales.numeroDocumento.trim() &&
      (docsVerificados || !!documentos.cedulaFrente) &&
      (docsVerificados || !!documentos.licenciaConduccion) &&
      !!datosPersonales.terminosAceptados;
  
    const totalLocal = useMemo(() => {
      const seguros = vehiculo.seguros ?? [];
      const kmLimitado = vehiculo.tarifas?.kmLimitado;
      const kmIlimitado = vehiculo.tarifas?.kmIlimitado;
      const servicios = (vehiculo.servicios ?? []).filter(
        (s) => !s.nombre.toLowerCase().includes("otra ciudad")
      );
  
      const seguroElegido =
        seguros.find((s) => s.nombre === planes.proteccion) ?? null;
      const kmElegido =
        planes.tipoKilometraje === "limitado"
          ? kmLimitado
          : planes.tipoKilometraje === "ilimitado"
            ? kmIlimitado
            : null;
  
      const dias = diasEntre(
        fechasLugar.fechaRetiro,
        fechasLugar.fechaDevolucion,
        fechasLugar.horaRetiro,
        fechasLugar.horaDevolucion,
      );
      const diarias = vehiculo.precio * dias;
      const proteccion = seguroElegido ? seguroElegido.precio * dias : 0;
      const kilometraje = kmElegido ? kmElegido.precio * dias : 0;
      const servAdic = servicios
        .filter((s) => planes.serviciosSeleccionados.includes(s.nombre))
        .reduce((a, s) => a + s.precio * dias, 0);
      const subtotalBase = diarias + proteccion + kilometraje + servAdic;
      const subtotalBruto = subtotalBase;
        
      let descuentoCupon = 0;
      if (cuponAplicado) {
        if (cuponAplicado.descuentoPorcentaje) {
          descuentoCupon = Math.round(subtotalBruto * (cuponAplicado.descuentoPorcentaje / 100));
        } else if (cuponAplicado.descuentoFijo) {
          descuentoCupon = cuponAplicado.descuentoFijo;
        }
      }
      
      const subtotal = Math.max(subtotalBruto - descuentoCupon, 0);
      return subtotal;
    }, [
      vehiculo,
      fechasLugar.fechaRetiro,
      fechasLugar.fechaDevolucion,
      fechasLugar.lugarRetiro,
      fechasLugar.lugarDevolucion,
      planes,
      cuponAplicado,
    ]);
  
    // El total (cargo administrativo, IVA y descuento incluidos) lo calcula el servidor
    const cotizacion = useServerQuote({ vehiculo, fechasLugar, planes, cuponCodigo: cuponAplicado?.codigo });
    const total = cotizacion ? Number(cotizacion.estimatedTotal) : totalLocal;
  
    const branchName = fechasLugar.lugarRetiro || vehiculo.sucursal || "";
    const horario = useMemo(() => getHorarioSucursal(branchName), [branchName]);
  
    const checkOutsideSchedule = () => {
      if (fechasLugar.fueraDeHorarioAceptado) return false;
      let nowBogota = "12:00";
      try {
        nowBogota = new Intl.DateTimeFormat("en-GB", {
          timeZone: "America/Bogota",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date());
      } catch {
        const now = new Date();
        nowBogota = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      }
  
      const openRaw = (horario.horaApertura || "08:00").slice(0, 5);
      const closeRaw = (horario.horaCierre || "18:00").slice(0, 5);
  
      const is24h =
        (openRaw === "00:00" && (closeRaw === "23:59" || closeRaw === "23:30" || closeRaw === "24:00")) ||
        openRaw === closeRaw;
      if (is24h) return false;
  
      if (openRaw < closeRaw) {
        return nowBogota < openRaw || nowBogota > closeRaw;
      } else {
        return nowBogota < openRaw && nowBogota > closeRaw;
      }
    };

  return { c, t, datosPersonales, OPCIONES_NACIONALIDAD, opcionesTipoDocumentoFiltradas, actualizarDatosPersonales, actualizarFechasLugar, fechasLugar, planes, documentos, cuponAplicado, usuarioGlobal, actualizarUsuarioGlobal, limpiarReserva, modalReservaVisible, setModalReservaVisible, docsVerificados, alertaFaltantesVisible, setAlertaFaltantesVisible, alertaHorarioVisible, setAlertaHorarioVisible, alertaEfectivoVisible, setAlertaEfectivoVisible, alertaErrorPagoVisible, setAlertaErrorPagoVisible, alertaCancelarProcesoVisible, setAlertaCancelarProcesoVisible, procesandoPago, setProcesandoPago, isSubmittingRef, reservaCreada, setReservaCreada, errorServidor, setErrorServidor, tipoErrorAlerta, setTipoErrorAlerta, modalInstruccionesEfectivoVisible, setModalInstruccionesEfectivoVisible, captchaVerificado, setCaptchaVerificado, errorCaptcha, setErrorCaptcha, captchaDesactivadoRef, primaryAccent, prefijoTelefono, hayPrefijo, datosCompletos, total, branchName, horario, checkOutsideSchedule }
}
