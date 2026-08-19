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

const MOCK_ADMIN_VERIFICATIONS: AdminVerification[] = [
  {
    id: 101,
    documentId: 1,
    documentType: "AADHAAR",
    userId: 1,
    userName: "Shiva Sai Kalyan Kalyan",
    userEmail: "shiva.owner@bikerental.test",
    userRole: "OWNER",
    documentNumber: "998877665544",
    automaticStatus: "VERIFIED",
    adminStatus: "APPROVED",
    ocrText: "GOVERNMENT OF INDIA\nSHIVA SAI KALYAN KALYAN\nDOB: 12/05/1995\nGENDER: MALE\n9988 7766 5544",
    qrInfo: "QR Signature Verified by UIDAI",
    uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    reviewedBy: "SYSTEM",
    reviewedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 102,
    documentId: 2,
    documentType: "RC",
    userId: 1,
    userName: "Shiva Sai Kalyan Kalyan",
    userEmail: "shiva.owner@bikerental.test",
    userRole: "OWNER",
    documentNumber: "TS09GH1002",
    automaticStatus: "VERIFIED",
    adminStatus: "APPROVED",
    ocrText: "TELANGANA TRANSPORT DEPARTMENT\nREG NO: TS09GH1002\nOWNER: SHIVA SAI KALYAN KALYAN\nMAKER: YAMAHA\nMODEL: Hitech City Sport",
    qrInfo: "Maker: YAMAHA",
    uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    reviewedBy: "SYSTEM",
    reviewedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    bikeId: 1,
    bikeName: "Hitech City Sport",
    bikeBrand: "YAMAHA",
    bikeModel: "Hitech City Sport",
    registrationNumber: "TS09GH1002",
  },
  {
    id: 103,
    documentId: 3,
    documentType: "RC",
    userId: 1,
    userName: "Shiva Sai Kalyan Kalyan",
    userEmail: "shiva.owner@bikerental.test",
    userRole: "OWNER",
    documentNumber: "TS10CD1002",
    automaticStatus: "VERIFIED",
    adminStatus: "APPROVED",
    ocrText: "TELANGANA TRANSPORT DEPARTMENT\nREG NO: TS10CD1002\nOWNER: SHIVA SAI KALYAN KALYAN\nMAKER: YAMAHA\nMODEL: MT-15",
    qrInfo: "Maker: YAMAHA",
    uploadedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    reviewedBy: "SYSTEM",
    reviewedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    bikeId: 2,
    bikeName: "MT-15",
    bikeBrand: "YAMAHA",
    bikeModel: "MT-15",
    registrationNumber: "TS10CD1002",
  },
  {
    id: 104,
    documentId: 4,
    documentType: "AADHAAR",
    userId: 2,
    userName: "Ravi Kumar",
    userEmail: "ravi.owner@bikerental.test",
    userRole: "OWNER",
    documentNumber: "900088776611",
    automaticStatus: "VERIFIED",
    adminStatus: "APPROVED",
    ocrText: "GOVERNMENT OF INDIA\nRAVI KUMAR\nDOB: 15/08/1990\n9000 8877 6611",
    qrInfo: "QR Verified",
    uploadedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    reviewedBy: "SYSTEM",
    reviewedAt: new Date(Date.now() - 3600000 * 40).toISOString(),
  },
  {
    id: 105,
    documentId: 5,
    documentType: "RC",
    userId: 3,
    userName: "Priya Reddy",
    userEmail: "priya.owner@bikerental.test",
    userRole: "OWNER",
    documentNumber: "TS09GH1003",
    automaticStatus: "VERIFIED",
    adminStatus: "APPROVED",
    ocrText: "TELANGANA TRANSPORT DEPARTMENT\nREG NO: TS09GH1003\nOWNER: PRIYA REDDY\nMAKER: TVS\nMODEL: Ameerpet Easy Ride",
    qrInfo: "Maker: TVS",
    uploadedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    reviewedBy: "SYSTEM",
    reviewedAt: new Date(Date.now() - 3600000 * 15).toISOString(),
    bikeId: 3,
    bikeName: "Ameerpet Easy Ride",
    bikeBrand: "TVS",
    bikeModel: "Ameerpet Easy Ride",
    registrationNumber: "TS09GH1003",
  },
  {
    id: 106,
    documentId: 6,
    documentType: "DRIVING_LICENSE",
    userId: 4,
    userName: "Arjun Sharma",
    userEmail: "arjun.customer@bikerental.test",
    userRole: "CUSTOMER",
    documentNumber: "DL-TS-2024-00918",
    automaticStatus: "VERIFIED",
    adminStatus: "APPROVED",
    ocrText: "INDIAN UNION DRIVING LICENSE\nNAME: ARJUN SHARMA\nLIC NO: DL-TS-2024-00918\nVALID TILL: 2035",
    qrInfo: "DL Verified",
    uploadedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    reviewedBy: "SYSTEM",
    reviewedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
  }
];

export const getAdminVerifications = async (params?: {
  role?: string;
  documentType?: string;
  status?: string;
  search?: string;
}): Promise<AdminVerification[]> => {
  try {
    const response = await api.get<AdminVerification[]>("/admin/verifications", {
      params,
    });
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
  } catch (err) {
    console.warn("Server verifications endpoint warning, using fallback verifications.", err);
  }
  return MOCK_ADMIN_VERIFICATIONS;
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