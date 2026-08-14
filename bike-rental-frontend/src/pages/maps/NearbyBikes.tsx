import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Bike, IndianRupee, RefreshCw, Clock } from "lucide-react";

import { useLocation } from "@/hooks/useLocation";
import { subscribeBikeUpdates } from "@/utils/syncUtils";
import useBikeSse from "@/hooks/useBikeSse";
import BikeAvailability from "@/components/bike/BikeAvailability";
import { getShiftState } from "@/utils/timeUtils";

export default function NearbyBikes() {
    const { nearbyBikes, loading, getNearbyBikes } = useLocation();

    useEffect(() => {
        getNearbyBikes();
        const unsub = subscribeBikeUpdates(getNearbyBikes);
        return () => {
            unsub();
        };
    }, [getNearbyBikes]);

    // SSE subscription for server-driven updates
    useBikeSse();

    if (loading && nearbyBikes.length === 0) {
        return (
            <div className="flex justify-center items-center h-96 gap-2 text-gray-600">
                <RefreshCw className="animate-spin h-5 w-5 text-blue-600" />
                <span>Loading nearby bikes...</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-5 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Nearby Bikes</h1>
                    <p className="text-gray-500 text-sm mt-1">Available bikes matching owner active operating hours</p>
                </div>
                <button
                    onClick={() => getNearbyBikes()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {nearbyBikes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm p-8">
                    <Bike className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800">No Nearby Bikes Currently Available</h3>
                    <p className="text-gray-500 max-w-md mx-auto mt-2 text-sm">
                        Bikes appear here when owners set their active operating hours for today. Please check back soon or refresh.
                    </p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nearbyBikes.map((bike) => (
                        <div
                            key={bike.bikeId}
                            className="rounded-xl shadow-lg border bg-white overflow-hidden hover:shadow-xl transition flex flex-col justify-between"
                        >
                            <div>
                                <div className="relative">
                                    <img
                                        src={bike.imageUrl}
                                        alt={bike.bikeName}
                                        className="h-56 w-full object-cover"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <BikeAvailability
                                            availableStartTime={bike.availableStartTime}
                                            availableEndTime={bike.availableEndTime}
                                            status={bike.bikeStatus}
                                            availableDate={bike.availableDate}
                                        />
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h2 className="font-semibold text-xl">{bike.bikeName}</h2>
                                    <p className="text-gray-500 text-sm mb-3">{bike.brand} • {bike.model}</p>

                                    <div className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                                        <IndianRupee size={18} />
                                        <span>₹{bike.rentalPrice}/day</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                                        <MapPin size={16} className="text-blue-500" />
                                        <span>{(bike.distance ?? 0).toFixed(2)} km away</span>
                                        {bike.location && <span className="text-xs text-gray-400">({bike.location})</span>}
                                    </div>

                                    {bike.availableStartTime && bike.availableEndTime && (
                                        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md mt-3">
                                            <Clock size={14} />
                                            <span>Hours: {bike.availableStartTime} - {bike.availableEndTime}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 pt-0 flex gap-3">
                                <Link to={`/bikes/${bike.bikeId}`} className="flex-1">
                                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition">
                                        View Details
                                    </button>
                                </Link>
                                {(() => {
                                    const shiftState = getShiftState(bike.availableStartTime, bike.availableEndTime, bike.bikeStatus, bike.availableDate);
                                    if (shiftState === "AVAILABLE") {
                                        return (
                                            <Link to={`/bikes/${bike.bikeId}`} className="flex-1">
                                                <button className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium transition">
                                                    Rent Now
                                                </button>
                                            </Link>
                                        );
                                    }
                                    const label = shiftState === "YET_TO_START" ? "Shift Yet to Start" : shiftState === "SHIFT_CLOSED" ? "Shift Closed" : shiftState === "BOOKED" ? "Booked" : "Not Available";
                                    return (
                                        <button disabled className="w-full bg-muted text-muted-foreground py-2 rounded-lg font-medium cursor-not-allowed">
                                            {label}
                                        </button>
                                    );
                                })()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}