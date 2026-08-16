export interface NormalizedBike {
  id: number;
  bikeId: number;
  name: string;
  bikeName: string;
  brand: string;
  model: string;
  registrationNumber: string;
  rcNumber: string;
  type: string;
  fuelType: string;
  price: number;
  hourlyRate: number;
  rentalPrice: number;
  location: string;
  image: string;
  imageUrl: string;
  ownerName: string;
  engineCapacity: string;
  mileage: string;
  range: string;
  transmission: string;
  seatingCapacity: number;
  description: string;
  availableStartTime: string;
  availableEndTime: string;
  availableDate: string;
  bikeStatus: string;
  available: boolean;
  isShiftPosted?: boolean;
  latitude: number;
  longitude: number;
  distance?: number;
  rating: number;
  ownerId?: number;
  rcVerified?: boolean;
}

export function normalizeBike(b: any, index: number = 0): NormalizedBike {
  if (!b) {
    return {
      id: 0,
      bikeId: 0,
      name: "Rental Bike",
      bikeName: "Rental Bike",
      brand: "Smart Bike",
      model: "",
      registrationNumber: "",
      rcNumber: "",
      type: "petrol",
      fuelType: "PETROL",
      price: 60,
      hourlyRate: 60,
      rentalPrice: 480,
      location: "City Center",
      image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80",
      imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80",
      ownerName: "Bike Owner",
      engineCapacity: "155 cc",
      mileage: "45 km/l",
      range: "45 km/l",
      transmission: "Manual",
      seatingCapacity: 2,
      description: "Rental bike in excellent condition.",
      availableStartTime: "09:00",
      availableEndTime: "21:00",
      availableDate: new Date().toISOString().split("T")[0],
      bikeStatus: "AVAILABLE",
      available: true,
      latitude: 0,
      longitude: 0,
      rating: 0,
    };
  }

  const idNum = Number(b.bikeId || b.id || index + 1);
  const rawBrand = b.brand || "";
  const rawModel = b.model || "";
  const rawName = b.bikeName || b.name || `${rawBrand} ${rawModel}`.trim() || "Rental Bike";

  const rawFuel = (b.fuelType || b.type || "PETROL").toString().toUpperCase();
  const isEV = rawFuel.includes("ELECTRIC") || rawFuel.includes("EV");

  const hourly = Math.round(Number(b.hourlyRate || (b.rentalPrice ? Number(b.rentalPrice) / 8 : b.price || 60)));
  const daily = Math.round(Number(b.rentalPrice || hourly * 8));

  const regNo = b.registrationNumber || b.rcNumber || "";

  // Check owner name
  let owner = "Bike Owner";
  if (b.ownerName && b.ownerName.trim()) {
    owner = b.ownerName;
  } else if (b.owner?.ownerName && b.owner.ownerName.trim()) {
    owner = b.owner.ownerName;
  }

  const imageRes = b.imageUrl || b.image || (b.imageUrls && b.imageUrls[0]) || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80";

  const isAvail = b.available !== undefined ? Boolean(b.available) : (b.bikeStatus === "AVAILABLE" || !b.bikeStatus);
  const statusStr = b.bikeStatus || (isAvail ? "AVAILABLE" : "SHIFT_CLOSED");

  const engine = b.engineCapacity || (isEV ? "250W EV" : "155 cc");
  const kmPerL = b.mileage || b.range || (isEV ? "60 km/charge" : "45 km/l");
  const trans = b.transmission || (isEV ? "Automatic" : "Manual");
  const seats = Number(b.seatingCapacity || 2);
  const desc = b.description || `${rawName} in excellent driving condition.`;

  return {
    id: idNum,
    bikeId: idNum,
    name: rawName,
    bikeName: rawName,
    brand: rawBrand || rawName.split(" ")[0] || "Bike",
    model: rawModel,
    registrationNumber: regNo,
    rcNumber: regNo,
    type: isEV ? "electric" : "petrol",
    fuelType: isEV ? "ELECTRIC" : "PETROL",
    price: hourly,
    hourlyRate: hourly,
    rentalPrice: daily,
    location: b.location || "City Center",
    image: imageRes,
    imageUrl: imageRes,
    ownerName: owner,
    engineCapacity: engine,
    mileage: kmPerL,
    range: kmPerL,
    transmission: trans,
    seatingCapacity: seats,
    description: desc,
    availableStartTime: b.availableStartTime ? b.availableStartTime.toString() : (b.startTime ? b.startTime.toString() : "08:00"),
    availableEndTime: b.availableEndTime ? b.availableEndTime.toString() : (b.endTime ? b.endTime.toString() : "20:00"),
    availableDate: b.availableDate ? b.availableDate.toString() : new Date().toISOString().split("T")[0],
    bikeStatus: statusStr,
    available: isAvail,
    isShiftPosted: b.isShiftPosted,
    latitude: b.latitude !== null && b.latitude !== undefined ? Number(b.latitude) : 0,
    longitude: b.longitude !== null && b.longitude !== undefined ? Number(b.longitude) : 0,
    distance: b.distance !== undefined && b.distance !== null ? Number(b.distance) : undefined,
    rating: b.rating ? Number(b.rating) : 0,
    ownerId: b.ownerId ? Number(b.ownerId) : undefined,
    rcVerified: b.rcVerified !== undefined ? Boolean(b.rcVerified) : true,
  };
}
