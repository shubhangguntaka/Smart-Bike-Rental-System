import verificationApi, { UploadFileParam } from "../api/verificationApi";
import {
  AadhaarVerificationResult,
  DrivingLicenseVerificationResult,
  OCRResponse,
} from "../types/verification";

export const verificationService = {
  extractOCR: async (file: UploadFileParam): Promise<OCRResponse> => {
    return verificationApi.extractOCR(file);
  },

  verifyAadhaar: async (
    file: UploadFileParam,
    customerId?: number,
    purpose?: string
  ): Promise<AadhaarVerificationResult> => {
    return verificationApi.verifyAadhaar(file, customerId, purpose);
  },

  verifyDrivingLicense: async (
    file: UploadFileParam,
    customerId?: number
  ): Promise<DrivingLicenseVerificationResult> => {
    return verificationApi.verifyDrivingLicense(file, customerId);
  },

  getAadhaarStatus: async (customerId: number) => {
    return verificationApi.getAadhaarStatus(customerId);
  },

  getDrivingLicenseStatus: async (customerId: number) => {
    return verificationApi.getDrivingLicenseStatus(customerId);
  },
};

export default verificationService;
