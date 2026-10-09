import { apiClient } from "@/services/http/apiClient";

export interface ContratoGuardado {
  id: string;
  codigo: string;
  referenciaReserva: string;
  firmaTrazos: string;
  ciudad: string;
  ciudadId?: string;
  fecha: string;
  estado: string;
  firmadoEn: string;
  documentVersion?: string;
  signatureUrl?: string;
  pdfUrl?: string;
  contratoPdfBase64?: string;
  contratoPdfNombre?: string;
}

function normalize(value: any): ContratoGuardado | null {
  if (!value) return null;
  return {
    ...value,
    id: value.id,
    codigo: value.contractNumber,
    referenciaReserva: value.reservationCode,
    firmaTrazos: value.signatureStrokeData || "[]",
    ciudad: value.pickupCityName || "",
    ciudadId: value.pickupCityId,
    fecha: value.signedAt || value.createdAt,
    estado: value.statusCode,
    firmadoEn: value.signedAt,
  };
}

async function getOrGenerate(reference: string | null | undefined) {
  if (!reference) return null;
  const { data } = await apiClient.post(`/contracts/generate/reservation-code/${encodeURIComponent(reference)}`);
  return normalize(data);
}

export const contratoService = {
  obtenerPorReserva: getOrGenerate,
  obtenerOCrearCodigo: async (reference: string | null | undefined) => (await getOrGenerate(reference))?.codigo || "",
  guardarFirma: async (reference: string, datos: { firmaTrazos: string; ciudad?: string; fecha?: string }) => {
    const contract = await getOrGenerate(reference);
    if (!contract) return null;
    const form = new FormData();
    form.append("signatureStrokeData", datos.firmaTrazos);
    form.append("signedCityId", contract.ciudadId || "");
    form.append("consentAccepted", "true");
    form.append("documentVersion", contract.documentVersion || "v1.0");
    const { data } = await apiClient.post(`/contracts/${contract.id}/sign`, form, { headers: { "Content-Type": "multipart/form-data" } });
    return { ...normalize(data)!, firmaTrazos: datos.firmaTrazos };
  },
  guardarPdfContrato: async (reference: string, _base64?: string, _name?: string) => getOrGenerate(reference),
  descargarPdf: async (contractId: string) => (await apiClient.get(`/contracts/${contractId}/pdf`, { responseType: "arraybuffer" })).data,
};
