import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  IndianRupee,
  MapPin,
  Fuel,
  CheckCircle,
} from "lucide-react";

import { bikeService } from "@/services/bikeService";

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
      .then((response) => {
        setBike(response.data.data);
      })
      .catch((error) => {
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10">

      <div className="mx-auto max-w-7xl px-5">

        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid gap-10 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800 lg:grid-cols-2">

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

            <p className="mt-2 text-xl text-gray-500">
              {bike.brand}
            </p>

            <div className="mt-6">

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  bike.available
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {bike.available ? "Available" : "Unavailable"}
              </span>

            </div>

            {/* Specifications */}

            <div className="mt-8 grid grid-cols-2 gap-4">

              <div className="rounded-xl bg-gray-50 p-4 shadow dark:bg-gray-700">

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

              <div className="rounded-xl bg-gray-50 p-4 shadow dark:bg-gray-700">

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

              <div className="rounded-xl bg-gray-50 p-4 shadow dark:bg-gray-700">

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

              <div className="rounded-xl bg-gray-50 p-4 shadow dark:bg-gray-700">

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

              <p className="leading-7 text-gray-600 dark:text-gray-300">
                {bike.description}
              </p>

            </div>

            {/* Buttons */}

            <div className="mt-10 flex flex-wrap gap-4">

              <button
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                onClick={() => alert("Booking module is under development.")
                }
              >
                Book Now
              </button>

              <button
                className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
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