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
  bikeId?: number
): Promise<BikeDocumentVerificationResult> => {

  const formData = new FormData();

  formData.append("file", file);

  if (ownerId !== undefined) {
    formData.append("ownerId", String(ownerId));
  }

  if (bikeId !== undefined) {
    formData.append("bikeId", String(bikeId));
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