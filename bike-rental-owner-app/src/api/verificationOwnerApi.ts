import api from "./axios";
import { AadhaarVerificationDTO, BikeDocumentResponseDTO } from "../types/verification";

export const verificationOwnerApi = {
  getAadhaarStatus: (customerId?: number) =>
    api.get<AadhaarVerificationDTO>("/aadhaar/status", {
      params: { purpose: "BIKE_OWNER", customerId },
    }),

  verifyAadhaar: (formData: FormData) =>
    api.post<AadhaarVerificationDTO>("/aadhaar/verify", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      params: { purpose: "BIKE_OWNER" },
    }),

  getBikeRcStatus: (bikeId: number, ownerId?: number) =>
    api.get<BikeDocumentResponseDTO>("/bike-document/status", {
      params: { bikeId, ownerId },
    }),

  verifyBikeRc: (formData: FormData) =>
    api.post<BikeDocumentResponseDTO>("/bike-document/verify", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default verificationOwnerApi;
