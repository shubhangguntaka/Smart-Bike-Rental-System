import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { GPSLocation } from "@/types/gps";
import GPSMarker from "./GPSMarker";
import RouteMap from "./RouteMap";

import "leaflet/dist/leaflet.css";

interface LiveTrackerProps {
  currentLocation: GPSLocation | null;
  locations: GPSLocation[];
}

function RecenterMap({
  location,
}: {
  location: GPSLocation | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      const rawLat = location.latitude;
      const rawLng = location.longitude;
      const lat = typeof rawLat === "number" ? rawLat : Number(rawLat);
      const lng = typeof rawLng === "number" ? rawLng : Number(rawLng);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        map.setView(
          [lat, lng],
          map.getZoom() < 15 ? 15 : map.getZoom()
        );
      }
    }
  }, [location?.latitude, location?.longitude, map]);

  return null;
}

export default function LiveTracker({
  currentLocation,
  locations,
}: LiveTrackerProps) {
  const safeLocations = Array.isArray(locations) ? locations : [];

  const coordinates = safeLocations
    .map((loc) => {
      const rawLat = loc.latitude;
      const rawLng = loc.longitude;
      const lat = typeof rawLat === "number" ? rawLat : Number(rawLat);
      const lng = typeof rawLng === "number" ? rawLng : Number(rawLng);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return [lat, lng] as [number, number];
      }
      return null;
    })
    .filter((c): c is [number, number] => c !== null);

  const defaultCenter: [number, number] = [
    17.385,
    78.4867,
  ];

  let initialCenter: [number, number] = defaultCenter;

  if (currentLocation) {
    const rawLat = currentLocation.latitude;
    const rawLng = currentLocation.longitude;
    const lat = typeof rawLat === "number" ? rawLat : Number(rawLat);
    const lng = typeof rawLng === "number" ? rawLng : Number(rawLng);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      initialCenter = [lat, lng];
    }
  } else if (coordinates.length > 0) {
    initialCenter = coordinates[coordinates.length - 1];
  }

  return (
    <div
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <MapContainer
        center={initialCenter}
        zoom={15}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap location={currentLocation} />

        <GPSMarker location={currentLocation} />

        <RouteMap
          coordinates={coordinates}
          fitBounds={false}
        />
      </MapContainer>
    </div>
  );
}