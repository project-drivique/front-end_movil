import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { apiClient } from "@/services/http/apiClient";
import { aBase64 } from "@/utils/signaturePng";

export interface ContratoDTO {
  id: string;
  contractNumber: string;
  reservationCode: string;
  customerFullName: string;
  customerEmail: string;
  customerPhone: string;
  customerDocumentNumber: string;
  customerAddress: string | null;
  driverLicenseStatus: "APPROVED" | "PENDING" | "REJECTED" | string;
  vehiclePlate: string;
  vehicleBrandName: string;
  vehicleModel: string;
  vehicleColor: string;
  vehicleYear: number;
  vehicleImageUrl: string | null;
  pickupBranchName: string;
  pickupBranchAddress: string;
  pickupCityId: string;
  pickupCityName: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  finalAmount: number;
  baseAmount: number;
  insuranceCoverageName: string;
  mileagePlanName: string;
  paymentMethodCode: "CASH" | "WOMPI" | string;
  cashPaymentBranchName: string | null;
  additionalServiceNames: string[];
  statusCode: string;
  signedAt: string | null;
  signatureUrl: string | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const contratoService = {
  obtenerPorReserva: async (reservationId: string): Promise<ContratoDTO> => {
    if (!UUID.test(reservationId)) {
      const { data } = await apiClient.post(`/contracts/generate/reservation-code/${encodeURIComponent(reservationId)}`);
      return data;
    }
    try {
      const { data } = await apiClient.get(`/contracts/reservation/${reservationId}`);
      return data;
    } catch (error: any) {
      if (error?.response?.status !== 404) throw error;
      const { data } = await apiClient.post("/contracts/generate", { reservationId });
      return data;
    }
  },

  firmar: async (
    contrato: ContratoDTO,
    pngBase64: string,
    strokeData: string,
  ): Promise<ContratoDTO> => {
    const form = new FormData();
    if (Platform.OS === "web") {
      const binario = atob(pngBase64);
      const bytes = new Uint8Array(binario.length);
      for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
      form.append("signature", new Blob([bytes], { type: "image/png" }), "signature.png");
    } else {
      const uri = `${FileSystem.cacheDirectory}signature-${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(uri, pngBase64, { encoding: FileSystem.EncodingType.Base64 });
      form.append("signature", { uri, name: "signature.png", type: "image/png" } as any);
    }
    form.append("signatureStrokeData", strokeData || "[]");
    form.append("signedCityId", contrato.pickupCityId);
    form.append("consentAccepted", "true");
    form.append("documentVersion", "v1.0");
    const { data } = await apiClient.post(`/contracts/${contrato.id}/sign`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  obtenerFirmaDataUri: async (contractId: string): Promise<string> => {
    const { data } = await apiClient.get(`/contracts/${contractId}/signature`, { responseType: "arraybuffer" });
    return `data:image/png;base64,${aBase64(new Uint8Array(data))}`;
  },

  descargarPdf: async (contractId: string, nombre: string): Promise<string> => {
    const { data } = await apiClient.get(`/contracts/${contractId}/pdf`, { responseType: "arraybuffer" });
    const base64 = aBase64(new Uint8Array(data));
    if (Platform.OS === "web") {
      return URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
    }
    const uri = `${FileSystem.cacheDirectory}${nombre}`;
    await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
    return uri;
  },

  enviarPorCorreo: async (contractId: string): Promise<boolean> => {
    const { data } = await apiClient.post(`/contracts/${contractId}/email`);
    return Boolean(data?.sent);
  },
};
