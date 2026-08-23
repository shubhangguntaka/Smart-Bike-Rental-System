import type { Ride } from "@/types/ride";

interface RideStatusCardProps {
  ride: Ride | null;
  isTracking: boolean;
  isStarting: boolean;
  isEnding: boolean;
  error: string | null;
  gpsError: string | null;
  permissionDenied: boolean;
  onStartTracking: () => void;
  onEndRide: () => void;
}

export default function RideStatusCard({
  ride,
  isTracking,
  isStarting,
  isEnding,
  error,
  gpsError,
  permissionDenied,
  onStartTracking,
  onEndRide,
}: RideStatusCardProps) {
  const status = ride?.status ?? "NOT_STARTED";

  const isActive = status === "ACTIVE";
  const isCompleted = status === "COMPLETED";

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Ride Status
          </h2>

          {ride?.rideId && (
            <p className="text-sm text-gray-500">
              Ride #{ride.rideId}
            </p>
          )}
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isActive
              ? "bg-green-100 text-green-700"
              : isCompleted
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      </div>

      {ride && (
        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Booking</p>
            <p className="font-medium">
              #{ride.bookingId}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Bike</p>
            <p className="font-medium">
              #{ride.bikeId}
            </p>
          </div>

          {ride.startedAt && (
            <div className="col-span-2">
              <p className="text-gray-500">
                Started At
              </p>
              <p className="font-medium">
                {new Date(
                  ride.startedAt
                ).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {isActive && (
        <div className="mb-4 rounded-lg bg-gray-50 p-3">
          <p className="text-sm text-gray-600">
            GPS Tracking
          </p>

          <p
            className={`mt-1 text-sm font-semibold ${
              isTracking
                ? "text-green-600"
                : "text-orange-600"
            }`}
          >
            {isTracking
              ? "● Live tracking active"
              : "● Tracking stopped"}
          </p>
        </div>
      )}

      {permissionDenied && (
        <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Location permission was denied. Please allow
          location access in your browser settings.
        </div>
      )}

      {gpsError && !permissionDenied && (
        <div className="mb-3 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
          {gpsError}
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {isActive && !isTracking && (
          <button
            type="button"
            onClick={onStartTracking}
            disabled={isStarting || isEnding}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStarting
              ? "Starting..."
              : "Start Tracking"}
          </button>
        )}

        {isActive && (
          <button
            type="button"
            onClick={onEndRide}
            disabled={isEnding}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isEnding ? "Ending..." : "End Ride"}
          </button>
        )}
      </div>

      {isCompleted && (
        <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          This ride has been completed. Live tracking is
          stopped.
        </div>
      )}
    </div>
  );
}