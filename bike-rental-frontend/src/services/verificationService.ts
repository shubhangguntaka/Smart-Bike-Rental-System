import api from "../api/axios";
import type {
  OCRResponse,
  AadhaarVerificationResult,
  DrivingLicenseVerificationResult,
  BikeDocumentVerificationResult,
} from "../types/verification";

export const extractOCR = async (
  file: File
): Promise<OCRResponse> => {

  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post<OCRResponse>(
    "/ocr/extract",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// Uploads an Aadhaar image and runs full OCR/QR verification on the
// backend (not just raw text extraction). customerId is optional and,
// when supplied, links this Aadhaar record to a customer so a later
// Driving License upload can be cross-checked against it.
export const verifyAadhaar = async (
  file: File,
  customerId?: number,
  purpose?: string
): Promise<AadhaarVerificationResult> => {

  const formData = new FormData();

  formData.append("file", file);

  if (customerId !== undefined) {
    formData.append("customerId", String(customerId));
  }

  if (purpose) {
    formData.append("purpose", purpose);
  }

  const response = await api.post<AadhaarVerificationResult>(
    "/aadhaar/verify",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// Uploads a Driving License image and runs full OCR/QR verification
// on the backend. Pass the same customerId used for verifyAadhaar so
// the backend can cross-check the DL name against the verified
// Aadhaar name.
export const verifyDrivingLicense = async (
  file: File,
  customerId?: number
): Promise<DrivingLicenseVerificationResult> => {

  const formData = new FormData();

  formData.append("file", file);

  if (customerId !== undefined) {
    formData.append("customerId", String(customerId));
  }

  const response = await api.post<DrivingLicenseVerificationResult>(
    "/driving-license/verify",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// Uploads a Bike Document (RC) image and runs full OCR/QR verification
// on the backend. This is the bike owner's document, not the renting
// customer's - pass the owner's Aadhaar record id (from verifyAadhaar) as
// ownerId so the backend can cross-check the RC owner name against the
// verified Aadhaar name. bikeId is optional and links the RC to a
// specific bike listing if one already exists.
export const verifyBikeDocument = async (
  file: File,
  ownerId?: number,
  bikeId?: number,
  registrationNumber?: string
): Promise<BikeDocumentVerificationResult> => {

  const formData = new FormData();

  formData.append("file", file);

  if (ownerId !== undefined) {
    formData.append("ownerId", String(ownerId));
  }

  if (bikeId !== undefined) {
    formData.append("bikeId", String(bikeId));
  }

  if (registrationNumber) {
    formData.append("registrationNumber", registrationNumber);
  }

  const response = await api.post<BikeDocumentVerificationResult>(
    "/bike-document/verify",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// =============================================================================
// ADMIN VERIFICATION MANAGEMENT (MEMBER 5)
// =============================================================================
import type {
  AdminVerification,
  VerificationHistory,
  ReviewDecisionPayload,
  AdminEmailPayload,
} from "../types/adminVerification";

export const getAdminVerifications = async (params?: {
  role?: string;
  documentType?: string;
  status?: string;
  search?: string;
}): Promise<AdminVerification[]> => {
  const response = await api.get<AdminVerification[]>("/admin/verifications", {
    params,
  });
  return Array.isArray(response.data) ? response.data : [];
};

export const getAdminVerificationById = async (
  id: number
): Promise<AdminVerification> => {
  const response = await api.get<AdminVerification>(`/admin/verifications/${id}`);
  return response.data;
};

export const getAdminVerificationImageUrl = (id: number): string => {
  const baseURL = api.defaults.baseURL || "/api";
  return `${baseURL}/admin/verifications/${id}/image`;
};

export const approveAdminVerification = async (
  id: number,
  reason?: string
): Promise<AdminVerification> => {
  const response = await api.post<AdminVerification>(
    `/admin/verifications/${id}/approve`,
    { reason } as ReviewDecisionPayload
  );
  return response.data;
};

export const rejectAdminVerification = async (
  id: number,
  reason: string
): Promise<AdminVerification> => {
  const response = await api.post<AdminVerification>(
    `/admin/verifications/${id}/reject`,
    { reason } as ReviewDecisionPayload
  );
  return response.data;
};

export const requestAdminReupload = async (
  id: number,
  reason: string
): Promise<AdminVerification> => {
  const response = await api.post<AdminVerification>(
    `/admin/verifications/${id}/reupload`,
    { reason } as ReviewDecisionPayload
  );
  return response.data;
};

export const getAdminVerificationHistory = async (
  id: number
): Promise<VerificationHistory[]> => {
  const response = await api.get<VerificationHistory[]>(
    `/admin/verifications/${id}/history`
  );
  return response.data;
};

export const sendAdminVerificationEmail = async (
  id: number,
  subject: string,
  message: string
): Promise<void> => {
  await api.post(`/admin/verifications/${id}/email`, {
    subject,
    message,
  } as AdminEmailPayload);
};

export const deleteAdminVerification = async (
  id: number
): Promise<void> => {
  await api.delete(`/admin/verifications/${id}`);
};

export const getGroupedUserVerifications = async (params?: {
  role?: string;
  status?: string;
  search?: string;
}): Promise<import("../types/adminVerification").UserVerificationSummary[]> => {
  const response = await api.get<import("../types/adminVerification").UserVerificationSummary[]>(
    "/admin/verifications/grouped",
    { params }
  );
  return response.data;
};

export const deleteAllUserVerifications = async (
  userId: number
): Promise<void> => {
  await api.delete(`/admin/verifications/user/${userId}`);
};