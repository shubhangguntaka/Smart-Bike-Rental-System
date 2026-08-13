import { Link } from "react-router-dom";
import { MapPin, Bike, IndianRupee } from "lucide-react";

import { useLocation } from "@/hooks/useLocation";

export default function NearbyBikes() {

    const { nearbyBikes, loading } = useLocation();

    if (loading) {

        return (
            <div className="flex justify-center items-center h-96">
                Loading nearby bikes...
            </div>
        );

    }

    return (

        <div className="max-w-7xl mx-auto px-5 py-8">

            <h1 className="text-3xl font-bold mb-6">

                Nearby Bikes

            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {nearbyBikes.map((bike) => (

                    <div

                        key={bike.bikeId}

                        className="rounded-xl shadow-lg border bg-white overflow-hidden hover:shadow-xl transition"

                    >

                        <img

                            src={bike.imageUrl}

                            alt={bike.bikeName}

                            className="h-56 w-full object-cover"

                        />

                        <div className="p-5">

                            <h2 className="font-semibold text-xl">

                                {bike.bikeName}

                            </h2>

                            <p className="text-gray-500">

                                {bike.brand}

                            </p>

                            <div className="flex items-center gap-2 mt-3">

                                <IndianRupee size={18} />

                                <span>

                                    {bike.rentalPrice}/day

                                </span>

                            </div>

                            <div className="flex items-center gap-2 mt-2">

                                <MapPin size={18} />

                                {(bike.distance ?? 0).toFixed(2)} km

                            </div>

                            <div className="mt-5 flex gap-3">

                                <Link

                                    to={`/bikes/${bike.bikeId}`}

                                    className="flex-1"

                                >

                                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">

                                        View Details

                                    </button>

                                </Link>

                                <button

                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"

                                >

                                    Book

                                </button>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}