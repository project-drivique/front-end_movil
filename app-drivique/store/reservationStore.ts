// store/reservaStore.ts
import { create } from "zustand";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import {
  DatosDocumentos,
  DatosFechasLugar,
  DatosPersonales,
  DatosPlanes,
  PasoReserva,
  Cupon,
} from "@/modules/reservation/types/reservation.types";

interface ReservaStore {
  vehiculoSeleccionado: Vehiculo | null;
  pasoActual: PasoReserva;
  fechasLugar: DatosFechasLugar;
  planes: DatosPlanes;
  datosPersonales: DatosPersonales;
  documentos: DatosDocumentos;
  cuponAplicado: Cupon | null;

  seleccionarVehiculo: (
    vehiculo: Vehiculo,
    datosPrecarga?: Partial<Pick<DatosFechasLugar, "lugarRetiro" | "fechaRetiro" | "fechaDevolucion">>
  ) => void;
  setPaso: (paso: PasoReserva) => void;
  actualizarFechasLugar: (data: Partial<DatosFechasLugar>) => void;
  actualizarPlanes: (data: Partial<DatosPlanes>) => void;
  toggleServicioAdicional: (nombre: string) => void;
  actualizarDatosPersonales: (data: Partial<DatosPersonales>) => void;
  actualizarDocumento: (llave: keyof DatosDocumentos, archivo: DatosDocumentos[keyof DatosDocumentos]) => void;
  aplicarCupon: (cupon: Cupon) => void;
  removerCupon: () => void;
  limpiarReserva: () => void;
}

function fechasLugarInicial(): DatosFechasLugar {
  return {
    metodoPago: null,
    lugarRetiro: "",
    lugarDevolucion: "",
    fechaRetiro: null,
    fechaDevolucion: null,
    horaRetiro: "",
    horaDevolucion: "",
    barrioRetiro: "",
    direccionRetiro: "",
    referenciasRetiro: "",
    barrioDevolucion: "",
    direccionDevolucion: "",
    referenciasDevolucion: "",
  };
}

function planesInicial(): DatosPlanes {
  return {
    proteccion: null,
    tipoKilometraje: null,
    serviciosSeleccionados: [],
  };
}

function datosPersonalesInicial(): DatosPersonales {
  return {
    nombreCompleto: "",
    nacionalidad: "",
    correo: "",
    celular: "",
    tipoDocumento: null,
    numeroDocumento: "",
    terminosAceptados: false,
  };
}

function documentosInicial(): DatosDocumentos {
  return {
    cedulaFrente: null,
    cedulaReverso: null,
    licenciaConduccion: null,
  };
}

export const useReservaStore = create<ReservaStore>()((set) => ({
  vehiculoSeleccionado: null,
  pasoActual: "fechas",
  fechasLugar: fechasLugarInicial(),
  planes: planesInicial(),
  datosPersonales: datosPersonalesInicial(),
  documentos: documentosInicial(),
  cuponAplicado: null,

  seleccionarVehiculo: (vehiculo, datosPrecarga) =>
    set({
      vehiculoSeleccionado: vehiculo,
      pasoActual: "fechas",
      fechasLugar: { ...fechasLugarInicial(), ...datosPrecarga },
      planes: planesInicial(),
      datosPersonales: datosPersonalesInicial(),
      documentos: documentosInicial(),
      cuponAplicado: null,
    }),

  setPaso: (paso) => set({ pasoActual: paso }),

  actualizarFechasLugar: (data) =>
    set((state) => ({ fechasLugar: { ...state.fechasLugar, ...data } })),

  actualizarPlanes: (data) =>
    set((state) => ({ planes: { ...state.planes, ...data } })),

  toggleServicioAdicional: (nombre) =>
    set((state) => {
      const yaEsta = state.planes.serviciosSeleccionados.includes(nombre);
      const serviciosSeleccionados = yaEsta
        ? state.planes.serviciosSeleccionados.filter((s) => s !== nombre)
        : [...state.planes.serviciosSeleccionados, nombre];
      return { planes: { ...state.planes, serviciosSeleccionados } };
    }),

  actualizarDatosPersonales: (data) =>
    set((state) => ({ datosPersonales: { ...state.datosPersonales, ...data } })),

  actualizarDocumento: (llave, archivo) =>
    set((state) => ({ documentos: { ...state.documentos, [llave]: archivo } })),

  aplicarCupon: (cupon) => set({ cuponAplicado: cupon }),

  removerCupon: () => set({ cuponAplicado: null }),

  limpiarReserva: () =>
    set({
      vehiculoSeleccionado: null,
      pasoActual: "fechas",
      fechasLugar: fechasLugarInicial(),
      planes: planesInicial(),
      datosPersonales: datosPersonalesInicial(),
      documentos: documentosInicial(),
      cuponAplicado: null,
    }),
}));