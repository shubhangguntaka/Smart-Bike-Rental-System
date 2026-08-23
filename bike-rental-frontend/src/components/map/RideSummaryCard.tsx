import type { Ride } from "@/types/ride";

interface RideSummaryCardProps {
  ride: Ride | null;
}

function formatDuration(totalDuration?: number | null): string {
  if (totalDuration == null || totalDuration < 0) {
    return "—";
  }

  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  const seconds = totalDuration % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function formatDistance(distance?: number | null): string {
  if (distance == null || distance < 0) {
    return "—";
  }

  return `${distance.toFixed(2)} km`;
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function RideSummaryCard({
  ride,
}: RideSummaryCardProps) {
  if (!ride) {
    return (
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">
          Ride Summary
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          No ride information available.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Ride Summary
          </h2>

          <p className="text-sm text-gray-500">
            Ride #{ride.rideId}
          </p>
        </div>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {ride.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Total Distance
          </p>

          <p className="mt-1 text-lg font-semibold">
            {formatDistance(ride.totalDistance)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Total Duration
          </p>

          <p className="mt-1 text-lg font-semibold">
            {formatDuration(ride.totalDuration)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Booking
          </p>

          <p className="mt-1 font-semibold">
            #{ride.bookingId}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Bike
          </p>

          <p className="mt-1 font-semibold">
            #{ride.bikeId}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs text-gray-500">
            Started At
          </p>

          <p className="text-sm font-medium">
            {formatDateTime(ride.startedAt)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            Ended At
          </p>

          <p className="text-sm font-medium">
            {formatDateTime(ride.endedAt)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">
            Start Location
          </p>

          <p className="text-sm font-medium">
            {ride.startLatitude != null &&
            ride.startLongitude != null
              ? `${ride.startLatitude.toFixed(6)}, ${ride.startLongitude.toFixed(6)}`
              : "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            End Location
          </p>

          <p className="text-sm font-medium">
            {ride.endLatitude != null &&
            ride.endLongitude != null
              ? `${ride.endLatitude.toFixed(6)}, ${ride.endLongitude.toFixed(6)}`
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}