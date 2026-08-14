export type BikeStatus =
  | "AVAILABLE"
  | "BOOKED"
  | "UNDER_MAINTENANCE"
  | "NOT_AVAILABLE"
  | "MAINTENANCE";

export interface BikeImage {
  id?: number;
  imageUrl: string;
}

export interface BikeSpecification {
  engineCapacity?: string;
  mileage?: string;
  transmission?: string;
  seatingCapacity?: number;
}

export interface Bike {
  id?: number;
  bikeId?: number;
  ownerId?: number;
  ownerName?: string;
  name?: string;
  bikeName: string;
  brand: string;
  model: string;
  registrationNumber: string;
  fuelType?: string;
  rentalPrice: number;
  location: string;
  bikeStatus: BikeStatus;
  rcNumber?: string;
  rcVerified?: boolean;
  /** Spec alias returned by backend */
  rcVerificationStatus?: boolean;
  imageUrl: string;
  imageUrls?: string[];
  description?: string;
  engineCapacity?: string;
  mileage?: string;
  transmission?: string;
  seatingCapacity?: number;
  latitude?: number;
  longitude?: number;
  rentalType?: "DAILY" | "HOURLY" | "BOTH";
  hourlyRate?: number;
  availableStartTime?: string;
  availableEndTime?: string;
  availableDate?: string;
  isShiftPosted?: boolean;
  specifications?: BikeSpecification;
  images?: BikeImage[];
  createdAt?: string;
  updatedAt?: string;
}

export type BikeDTO = Bike;

export interface BikeSearchParams {
  location?: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  bikeStatus?: string;
  status?: string;
}

export const BIKE_STATUSES: BikeStatus[] = [
  "AVAILABLE",
  "BOOKED",
  "UNDER_MAINTENANCE",
  "NOT_AVAILABLE",
];

export const emptyBike = (ownerId: number): Bike => ({
  ownerId,
  bikeName: "",
  brand: "",
  model: "",
  registrationNumber: "",
  fuelType: "",
  hourlyRate: 0,
  rentalPrice: 0,
  rentalType: "HOURLY",
  availableStartTime: "09:00",
  availableEndTime: "21:00",
  location: "",
  bikeStatus: "AVAILABLE",
  rcNumber: "",
  rcVerified: false,
  imageUrl: "",
  description: "",
  engineCapacity: "",
  mileage: "",
  transmission: "",
  seatingCapacity: 2,
});
