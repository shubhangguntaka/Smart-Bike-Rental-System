export interface OCRData {
  aadhaarNumber: string;
  name: string;
  dob: string;
  gender: string;
  address: string;
  rawText: string;
}

export type OCRResponse = OCRData;

export interface AadhaarVerificationResult {
  id?: number;
  customerId: number | null;
  aadhaarNumber: string;
  customerName: string;
  extractedText?: string;
  status: string; // "VERIFIED" | "APPROVED" | "REJECTED" | "PENDING"
  rejectionReason?: string | null;
  uploadedFile?: string;
  uploadedAt?: string;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  verified?: boolean;
}

export interface DrivingLicenseVerificationResult {
  id?: number;
  verified: boolean;
  status: string; // "VERIFIED" | "APPROVED" | "REJECTED" | "PENDING"
  message?: string;
  customerName: string;
  licenseNumber: string;
  dob?: string | null;
  issueDate?: string | null;
  validTill?: string | null;
  address?: string;
  qrVerified?: boolean;
  aadhaarNameMatched?: boolean;
}
