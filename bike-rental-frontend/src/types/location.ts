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
  rentalPrice: number;
  latitude: number;
  longitude: number;
  distance: number;
  imageUrl: string;
  available: boolean;
  rating?: number;
  owner?: {
    ownerId: number;
    ownerName: string;
  };
}