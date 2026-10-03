export interface BikeDocumentResponseDTO {
  documentId?: number;
  bikeId?: number;
  ownerId?: number;
  registrationNumber?: string;
  rcNumber?: string;
  documentPath?: string;
  extractedDetails?: string;
  verified?: boolean;
  ocrConfidence?: number;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED" | string;
  verifiedAt?: string;
  message?: string;
}

export interface AadhaarVerificationDTO {
  id?: number;
  userId?: number;
  customerId?: number;
  aadhaarNumber?: string;
  maskedAadhaar?: string;
  fullName?: string;
  dob?: string;
  gender?: string;
  address?: string;
  documentPath?: string;
  isVerified?: boolean;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED" | string;
  verifiedAt?: string;
}
