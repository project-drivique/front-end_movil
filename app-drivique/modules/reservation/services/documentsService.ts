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

function aParteArchivo(archivo: ArchivoDocumento): any {
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
      const aprobados = docs.filter((d) => d.statusCode === "APPROVED");
      const licencia = aprobados.some((d) => d.documentType?.code === "DRIVER_LICENSE");
      const identidad = aprobados.some((d) => d.documentType?.code !== "DRIVER_LICENSE");
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
      form.append("frontFile", aParteArchivo(archivo));
      const reverso = archivoReverso || archivo;
      if (reverso) {
        form.append("backFile", aParteArchivo(reverso));
      }
      await apiClient.post("/users/me/documents", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    };
    if (params.identificacion) await subirUno(codigoIdentidad, params.identificacion, params.identificacionReverso);
    if (params.licencia) await subirUno("DRIVER_LICENSE", params.licencia, params.licenciaReverso);
  },
};
