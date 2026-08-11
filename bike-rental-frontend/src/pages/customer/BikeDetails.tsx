import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  IndianRupee,
  MapPin,
  Fuel,
  CheckCircle,
} from "lucide-react";

import bikeService from "@/services/bikeService";
import DistanceCard from "@/components/map/DistanceCard";

interface Bike {
  bikeId: number;
  bikeName: string;
  brand: string;
  model: string;
  fuelType: string;
  rentalPrice: number;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  available: boolean;
  bikeStatus: string;
  registrationNumber: string;
  rating?: number;
  owner?: {
    ownerId: number;
    ownerName: string;
  };
}

export default function BikeDetails() {
  const navigate = useNavigate();

  const { bikeId } = useParams();

  const [bike, setBike] = useState<Bike | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bikeId) return;

    bikeService
      .getBikeById(Number(bikeId))
      .then((data: any) => {
        setBike(data?.data || data);
      })
      .catch((error: any) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [bikeId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Loading Bike Details...
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="flex h-screen items-center justify-center text-xl text-red-500">
        Bike not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-10">

      <div className="mx-auto max-w-7xl px-5">

        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 rounded-lg bg-card border border-border px-4 py-2 shadow hover:bg-muted text-foreground cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid gap-10 rounded-2xl bg-card border border-border p-8 shadow-xl lg:grid-cols-2">

          {/* Bike Image */}

          <div>

            <img
              src={bike.imageUrl}
              alt={bike.bikeName}
              className="h-[500px] w-full rounded-2xl object-cover"
            />

          </div>

          {/* Bike Details */}

          <div>

            <h1 className="text-4xl font-bold">
              {bike.bikeName}
            </h1>

            <p className="mt-2 text-xl text-muted-foreground">
              {bike.brand}
            </p>

            <div className="mt-6">

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${bike.available
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                  }`}
              >
                {bike.available ? "Available" : "Unavailable"}
              </span>

            </div>

            {/* Owner & Rating Information */}
            <div className="mt-6 flex flex-wrap gap-4 items-center">
              {bike.owner && (
                <div className="rounded-xl border border-border bg-card px-4 py-2 flex flex-col shadow-sm">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Bike Owner</span>
                  <span className="text-sm font-bold text-foreground">
                    {bike.owner.ownerName} (ID: {bike.owner.ownerId})
                  </span>
                </div>
              )}
              {bike.rating !== undefined && bike.rating > 0 && (
                <div className="rounded-xl border border-border bg-card px-4 py-2 flex flex-col shadow-sm">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Bike Rating</span>
                  <span className="text-sm font-bold text-yellow-500 flex items-center gap-1">
                    ★ {bike.rating.toFixed(1)} / 5.0
                  </span>
                </div>
              )}
              <div className="rounded-xl border border-border bg-card px-4 py-2 flex flex-col shadow-sm">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Owner Rating</span>
                <span className="text-xs text-muted-foreground italic">
                  Not available (Owner Rating API missing/unsupported)
                </span>
              </div>
            </div>

            {/* Specifications */}

            <div className="mt-8 grid grid-cols-2 gap-4">

              <div className="rounded-xl bg-card border border-border p-4 shadow">

                <div className="flex items-center gap-2">

                  <IndianRupee />

                  <span className="font-semibold">
                    Rental Price
                  </span>

                </div>

                <p className="mt-2 text-lg font-bold">
                  ₹{bike.rentalPrice}/Day
                </p>

              </div>

              <div className="rounded-xl bg-card border border-border p-4 shadow">

  <div className="flex items-center gap-2">

    <span className="font-semibold">
      Model
    </span>

  </div>

  <p className="mt-2 text-lg font-bold">
    {bike.model}
  </p>

</div>

              <div className="rounded-xl bg-card border border-border p-4 shadow">

                <div className="flex items-center gap-2">

                  <Fuel />

                  <span className="font-semibold">
                    Fuel Type
                  </span>

                </div>

                <p className="mt-2 text-lg font-bold">
                  {bike.fuelType}
                </p>

              </div>

              <div className="rounded-xl bg-card border border-border p-4 shadow">

                <div className="flex items-center gap-2">

                  <MapPin />

                  <span className="font-semibold">
                    Location
                  </span>

                </div>

                <p className="mt-2 text-lg font-bold">
                  {bike.location}
                </p>

              </div>

              <div className="rounded-xl bg-card border border-border p-4 shadow">

                <div className="flex items-center gap-2">

                  <CheckCircle />

                  <span className="font-semibold">
                    Status
                  </span>

                </div>

                <p className="mt-2 text-lg font-bold">
                  {bike.bikeStatus}
                </p>

              </div>

            </div>

            {/* Description */}

            <div className="mt-8">

              <h2 className="mb-2 text-xl font-bold">
                Description
              </h2>

              <p className="leading-7 text-muted-foreground">
                {bike.description}
              </p>

            </div>

            {/* Location & Distance Card */}
            <div className="mt-8">
              <DistanceCard
                bikeId={bike.bikeId}
                latitude={bike.latitude || 17.385}
                longitude={bike.longitude || 78.4867}
                locationName={bike.location}
                showMiniMap={true}
              />
            </div>

            {/* Buttons */}

            <div className="mt-10 flex flex-wrap gap-4">

              <button
                className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 cursor-pointer"
                onClick={() =>
                  navigate(`/customer/book/${bike.bikeId}`)
                }
              >
                Book Now
              </button>

              <button
                className="rounded-xl bg-secondary px-6 py-3 font-semibold text-secondary-foreground hover:opacity-90 cursor-pointer"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${bike.latitude},${bike.longitude}`,
                    "_blank"
                  )
                }
              >
                Navigate with Google Maps
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}