export interface OCRData {
  aadhaarNumber: string;
  name: string;
  dob: string;
  gender: string;
  address: string;
  rawText: string;
}

export type OCRResponse = OCRData;

// ---- Aadhaar verification (POST /api/aadhaar/verify) ----
export interface AadhaarVerificationResult {
  id: number;
  customerId: number | null;
  aadhaarNumber: string;
  customerName: string;
  extractedText: string;
  status: string; // e.g. "VERIFIED" | "REJECTED"
  rejectionReason: string | null;
  uploadedFile: string;
  uploadedAt: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  nameSource: string | null;
  stampLabel: string | null;
  stampIcon: string | null;
  stampColor: string | null;
}

// ---- Driving License verification (POST /api/driving-license/verify) ----
export interface DrivingLicenseVerificationResult {
  verified: boolean;
  status: string; // e.g. "APPROVED" | "REJECTED"
  message: string;
  customerName: string;
  licenseNumber: string;
  dob: string | null;
  issueDate: string | null;
  validTill: string | null;
  address: string;
  qrVerified: boolean;
  aadhaarNameMatched: boolean;
  stampLabel: string | null;
  stampIcon: string | null;
  stampColor: string | null;
}

// ---- Bike Document / RC verification (POST /api/bike-document/verify) ----
// Uploaded by the bike owner, not the renting customer. ownerAadhaarNameMatched
// is only meaningful when the owner's Aadhaar was verified first (its id is
// passed through as ownerId).
export interface BikeDocumentVerificationResult {
  verified: boolean;
  status: string; // e.g. "APPROVED" | "REJECTED"
  message: string;
  ownerName: string;
  registrationNumber: string;
  chassisNumber: string | null;
  engineNumber: string | null;
  makerName: string | null;
  model: string | null;
  vehicleClass: string | null;
  registrationDate: string | null;
  insuranceValidUpto: string | null;
  puccValidUpto: string | null;
  fitnessValidUpto: string | null;
  address: string;
  qrVerified: boolean;
  ownerAadhaarNameMatched: boolean;
  stampLabel: string | null;
  stampIcon: string | null;
  stampColor: string | null;
}