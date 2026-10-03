export interface BikeDTO {
  bikeId?: number;
  ownerId?: number;
  owner?: {
    ownerId?: number;
    ownerName?: string;
  };
  ownerName?: string;
  bikeName: string;
  brand: string;
  model: string;
  registrationNumber: string;
  fuelType: string;
  rentalPrice?: number;
  location: string;
  bikeStatus?: "AVAILABLE" | "BOOKED" | "MAINTENANCE" | "INACTIVE" | string;
  rcNumber?: string;
  rcVerified?: boolean;
  rcVerificationStatus?: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  description?: string;
  engineCapacity?: string;
  mileage?: string;
  transmission?: string;
  seatingCapacity?: number;
  latitude?: number;
  longitude?: number;
  rentalType?: "HOURLY" | "DAILY" | string;
  hourlyRate?: number;
  availableStartTime?: string;
  availableEndTime?: string;
  availableDate?: string;
  rating?: number;
}

export interface ApprovedRcDTO {
  registrationNumber: string;
  rcNumber?: string;
  isApproved: boolean;
  ownerId?: number;
  verificationDate?: string;
}
