import api from "./axios";
import {
  AadhaarVerificationResult,
  DrivingLicenseVerificationResult,
  OCRResponse,
} from "../types/verification";

export interface UploadFileParam {
  uri: string;
  name: string;
  type: string;
}

export const verificationApi = {
  extractOCR: async (file: UploadFileParam): Promise<OCRResponse> => {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type || "image/jpeg",
    } as any);

    const res = await api.post<OCRResponse>("/ocr/extract", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  verifyAadhaar: async (
    file: UploadFileParam,
    customerId?: number,
    purpose?: string
  ): Promise<AadhaarVerificationResult> => {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type || "image/jpeg",
    } as any);

    if (customerId !== undefined) {
      formData.append("customerId", String(customerId));
    }
    if (purpose) {
      formData.append("purpose", purpose);
    }

    const res = await api.post<AadhaarVerificationResult>(
      "/aadhaar/verify",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  },

  verifyDrivingLicense: async (
    file: UploadFileParam,
    customerId?: number
  ): Promise<DrivingLicenseVerificationResult> => {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type || "image/jpeg",
    } as any);

    if (customerId !== undefined) {
      formData.append("customerId", String(customerId));
    }

    const res = await api.post<DrivingLicenseVerificationResult>(
      "/driving-license/verify",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  },

  getAadhaarStatus: async (customerId: number) => {
    const res = await api.get(`/aadhaar/status?customerId=${customerId}`);
    return res.data;
  },

  getDrivingLicenseStatus: async (customerId: number) => {
    const res = await api.get(`/driving-license/status?customerId=${customerId}`);
    return res.data;
  },
};

export default verificationApi;
