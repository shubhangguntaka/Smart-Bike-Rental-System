export type AdminStatus = "PENDING" | "APPROVED" | "REJECTED" | "REUPLOAD_REQUIRED";
export type AutomaticStatus = "VERIFIED" | "NEEDS_REVIEW" | "REJECTED";
export type DocumentType = "AADHAAR" | "DRIVING_LICENSE" | "RC";
export type UserRole = "OWNER" | "CUSTOMER" | "ADMIN";

export interface VerificationHistory {
  id: number;
  documentReviewId: number;
  action: string;
  reason?: string;
  performedBy: string;
  performedAt: string;
}

export interface AdminVerification {
  id: number; // DocumentReview ID
  documentId: number;
  documentType: DocumentType;
  userId?: number;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  
  documentNumber?: string;
  automaticStatus: AutomaticStatus | string;
  adminStatus: AdminStatus;
  
  ocrText?: string;
  qrInfo?: string;
  rejectionReason?: string;
  adminReason?: string;
  
  documentPath?: string;
  uploadedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  
  // Bike Info for RC
  bikeId?: number;
  bikeName?: string;
  bikeBrand?: string;
  bikeModel?: string;
  registrationNumber?: string;
  
  history?: VerificationHistory[];
}

export interface ReviewDecisionPayload {
  reason?: string;
  reviewer?: string;
}

export interface AdminEmailPayload {
  subject: string;
  message: string;
}
