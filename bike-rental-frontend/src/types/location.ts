export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RouteDetails {
  startLatitude: number;
  startLongitude: number;

  endLatitude: number;
  endLongitude: number;

  distance: number;

  duration: string;

  coordinates: number[][];
}

export interface NearbyBike {
  bikeId: number;
  bikeName: string;
  brand: string;
  model?: string;
  registrationNumber?: string;
  fuelType?: string;
  location?: string;
  description?: string;
  engineCapacity?: string;
  mileage?: string;
  transmission?: string;
  seatingCapacity?: number;
  hourlyRate?: number;
  rentalPrice: number;
  latitude: number;
  longitude: number;
  distance?: number;
  imageUrl: string;
  available: boolean;
  availableStartTime?: string;
  availableEndTime?: string;
  rating?: number;
  ownerName?: string;
  owner?: {
    ownerId: number;
    ownerName: string;
  };
}