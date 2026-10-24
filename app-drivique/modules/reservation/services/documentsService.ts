import { Platform } from "react-native";
import { apiClient } from "@/services/http/apiClient";
import { useReferenceStore } from "@/store/referenceStore";
import { ArchivoDocumento } from "../types/reservation.types";

export interface DocumentoKyc {
  id: string;
  documentType: { id: string; code: string; name: string };
  statusCode: string;
  statusName?: string;
  reviewNotes?: string | null;
  reservationCode?: string | null;
}

interface TipoDocumentoKyc {
  id: string;
  code: string;
  name: string;
}

const CODIGO_POR_TIPO: Record<string, string> = {
  CC: "CC",
  CE: "CE",
  Pasaporte: "PASSPORT",
  PASSPORT: "PASSPORT",
};

async function aParteArchivo(archivo: ArchivoDocumento): Promise<any> {
  if (Platform.OS === "web") {
    if (archivo.file instanceof Blob) {
      return archivo.file;
    }
    if (archivo.uri) {
      try {
        const res = await fetch(archivo.uri);
        const blob = await res.blob();
        const mime = archivo.tipoMime || blob.type || "application/pdf";
        return new File([blob], archivo.nombre || "documento.pdf", { type: mime });
      } catch (e) {
        console.warn("[documentsService] Error convirtiendo uri a File en web:", e);
      }
    }
  }
  return {
    uri: archivo.uri,
    name: archivo.nombre,
    type: archivo.tipoMime || "application/pdf",
  };
}

async function tipos(): Promise<TipoDocumentoKyc[]> {
  const { data } = await apiClient.get("/kyc/document-types");
  return Array.isArray(data) ? data : [];
}

export const documentosService = {
  listar: async (): Promise<DocumentoKyc[]> => {
    const { data } = await apiClient.get("/users/me/documents");
    return Array.isArray(data) ? data : [];
  },

  tieneDocumentos: async (): Promise<boolean> => {
    try {
      const docs = await documentosService.listar();
      const validos = docs.filter((d) => {
        const st = String(d.statusCode || "").toUpperCase();
        return st === "APPROVED" || st === "PENDING";
      });
      const licencia = validos.some((d) => d.documentType?.code === "DRIVER_LICENSE");
      const identidad = validos.some((d) => d.documentType?.code !== "DRIVER_LICENSE");
      return licencia && identidad;
    } catch {
      return false;
    }
  },

  subir: async (params: {
    tipoDocumento: string | null;
    numeroDocumento: string;
    sucursalId?: string | null;
    identificacion?: ArchivoDocumento | null;
    identificacionReverso?: ArchivoDocumento | null;
    licencia?: ArchivoDocumento | null;
    licenciaReverso?: ArchivoDocumento | null;
  }): Promise<void> => {
    const lista = await tipos();
    const codigoIdentidad = CODIGO_POR_TIPO[params.tipoDocumento ?? ""] ?? String(params.tipoDocumento ?? "");

    const sucursales = useReferenceStore.getState().sucursales;
    const isUuid = (val?: string | null) => !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const branchIdValido = isUuid(params.sucursalId)
      ? (params.sucursalId as string)
      : (sucursales[0]?.id || "");

    const subirUno = async (codigo: string, archivo: ArchivoDocumento, archivoReverso?: ArchivoDocumento | null) => {
      const tipo = lista.find((t) => t.code.toUpperCase() === codigo.toUpperCase());
      if (!tipo) return;
      const form = new FormData();
      form.append("documentTypeId", tipo.id);
      if (params.numeroDocumento) form.append("documentNumber", params.numeroDocumento);
      if (branchIdValido) form.append("branchId", branchIdValido);

      const frontFile = await aParteArchivo(archivo);
      form.append("frontFile", frontFile);

      if (archivoReverso) {
        const backFile = await aParteArchivo(archivoReverso);
        form.append("backFile", backFile);
      }

      await apiClient.post("/users/me/documents", form, {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: (data) => data,
      });
    };
    if (params.identificacion) await subirUno(codigoIdentidad, params.identificacion, params.identificacionReverso);
    if (params.licencia) await subirUno("DRIVER_LICENSE", params.licencia, params.licenciaReverso);
  },
};
