import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import type { GPSLocation } from "@/types/gps";

interface GPSMarkerProps {
  location: GPSLocation | null;
}

const gpsIcon = new L.DivIcon({
  className: "gps-marker",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      background: #2563eb;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.2);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function GPSMarker({
  location,
}: GPSMarkerProps) {
  if (!location) {
    return null;
  }

  const rawLat = location.latitude;
  const rawLng = location.longitude;

  const latitude = typeof rawLat === "number" ? rawLat : Number(rawLat);
  const longitude = typeof rawLng === "number" ? rawLng : Number(rawLng);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  const formattedTime = location.timestamp
    ? new Date(location.timestamp).toLocaleTimeString()
    : "Just now";

  return (
    <Marker
      position={[latitude, longitude]}
      icon={gpsIcon}
    >
      <Popup>
        <div>
          <strong>Current Location</strong>

          <div>
            Latitude: {latitude.toFixed(6)}
          </div>

          <div>
            Longitude: {longitude.toFixed(6)}
          </div>

          {typeof location.accuracy === "number" && (
            <div>
              Accuracy: {Math.round(location.accuracy)} m
            </div>
          )}

          <div>
            Updated: {formattedTime}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}