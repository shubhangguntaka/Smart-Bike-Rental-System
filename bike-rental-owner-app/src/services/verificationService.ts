import verificationOwnerApi from "../api/verificationOwnerApi";
import { AadhaarVerificationDTO, BikeDocumentResponseDTO } from "../types/verification";

export const verificationService = {
  async getAadhaarStatus(customerId?: number): Promise<AadhaarVerificationDTO | null> {
    try {
      const res = await verificationOwnerApi.getAadhaarStatus(customerId);
      return res.data || null;
    } catch {
      return null;
    }
  },

  async verifyAadhaar(formData: FormData): Promise<AadhaarVerificationDTO> {
    const res = await verificationOwnerApi.verifyAadhaar(formData);
    return res.data;
  },

  async getBikeRcStatus(bikeId: number, ownerId?: number): Promise<BikeDocumentResponseDTO | null> {
    try {
      const res = await verificationOwnerApi.getBikeRcStatus(bikeId, ownerId);
      return res.data || null;
    } catch {
      return null;
    }
  },

  async verifyBikeRc(formData: FormData): Promise<BikeDocumentResponseDTO> {
    const res = await verificationOwnerApi.verifyBikeRc(formData);
    return res.data;
  },
};

export default verificationService;
