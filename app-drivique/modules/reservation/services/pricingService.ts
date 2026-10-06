import { apiClient } from '@/services/http/apiClient';

export interface PriceQuoteRequestDTO {
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  insuranceId: string;
  mileagePlanId: string;
  additionalServiceIds?: string[];
  couponCode?: string | null;
}

export interface PriceQuoteResponseDTO {
  vehicleId: string;
  rentalDays: number;
  vehicleSubtotal: number;
  insuranceSubtotal: number;
  mileagePlanSubtotal: number;
  additionalServicesSubtotal: number;
  discountAmount: number;
  refundableSecurityDeposit: number;
  estimatedTotal: number;
  couponCode?: string | null;
}

export interface InsuranceCoverageDTO {
  id: string;
  name: string;
  dailyRate: number;
  description: string;
  isActive: boolean;
}

export interface MileagePlanDTO {
  id: string;
  name: string;
  includedKm?: number | null;
  dailyRate: number;
  extraKmRate: number;
  isActive: boolean;
}

export interface AdditionalServiceDTO {
  id: string;
  name: string;
  dailyRate: number;
  isActive: boolean;
}

export interface PromotionValidationRequestDTO {
  code: string;
  vehicleId: string;
  categoryId: string;
  pickupDate: string;
  returnDate: string;
}

export interface PromotionValidationResponseDTO {
  promotionId: string;
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  baseAmount: number;
}

export interface CurrencyDTO {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface ExchangeRateDTO {
  sourceCurrency: string;
  targetCurrency: string;
  rate: number;
  updatedAt: string;
}

export const pricingService = {
  async quotePrice(request: PriceQuoteRequestDTO): Promise<PriceQuoteResponseDTO> {
    const { data } = await apiClient.post<PriceQuoteResponseDTO>('/pricing/quote', {
      ...request,
      additionalServiceIds: request.additionalServiceIds?.filter(Boolean) || [],
      couponCode: request.couponCode?.trim() || null,
    });
    return data;
  },

  async getInsuranceCoverages(): Promise<InsuranceCoverageDTO[]> {
    const { data } = await apiClient.get<InsuranceCoverageDTO[]>('/insurance-coverages');
    return Array.isArray(data) ? data : [];
  },

  async getMileagePlans(): Promise<MileagePlanDTO[]> {
    const { data } = await apiClient.get<MileagePlanDTO[]>('/mileage-plans');
    return Array.isArray(data) ? data : [];
  },

  async getAdditionalServices(): Promise<AdditionalServiceDTO[]> {
    const { data } = await apiClient.get<AdditionalServiceDTO[]>('/additional-services');
    return Array.isArray(data) ? data : [];
  },

  async validatePromotion(request: PromotionValidationRequestDTO): Promise<PromotionValidationResponseDTO> {
    const { data } = await apiClient.post<PromotionValidationResponseDTO>('/promotions/validate', {
      ...request,
      code: request.code.trim(),
    });
    return data;
  },

  async getFeaturedPromotions(): Promise<any[]> {
    const { data } = await apiClient.get<any[]>('/promotions/featured');
    return Array.isArray(data) ? data : [];
  },

  async getCurrencies(): Promise<CurrencyDTO[]> {
    const { data } = await apiClient.get<CurrencyDTO[]>('/currencies');
    return Array.isArray(data) ? data : [];
  },

  async getLatestExchangeRates(): Promise<ExchangeRateDTO[]> {
    const { data } = await apiClient.get<ExchangeRateDTO[]>('/exchange-rates/latest');
    return Array.isArray(data) ? data : [];
  },
};

export default pricingService;
