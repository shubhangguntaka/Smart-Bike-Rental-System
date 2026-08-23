import { useEffect } from "react";
import { Polyline, useMap } from "react-leaflet";
import L from "leaflet";

interface RouteMapProps {
  coordinates: number[][];
  fitBounds?: boolean;
}

export default function RouteMap({
  coordinates,
  fitBounds = true,
}: RouteMapProps) {
  const map = useMap();

  const validPositions = (coordinates || [])
    .map((point) => {
      if (!Array.isArray(point) || point.length < 2) return null;
      const lat = typeof point[0] === "number" ? point[0] : Number(point[0]);
      const lng = typeof point[1] === "number" ? point[1] : Number(point[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return [lat, lng] as [number, number];
      }
      return null;
    })
    .filter((p): p is [number, number] => p !== null);

  useEffect(() => {
    if (!fitBounds || validPositions.length === 0) {
      return;
    }

    try {
      if (validPositions.length === 1) {
        map.setView(validPositions[0], map.getZoom() < 15 ? 15 : map.getZoom());
      } else {
        const bounds = L.latLngBounds(validPositions);
        map.fitBounds(bounds, {
          padding: [60, 60],
          maxZoom: 17,
        });
      }
    } catch (error) {
      console.warn(
        "Leaflet fitBounds error avoided:",
        error
      );
    }
  }, [validPositions.length, fitBounds, map]);

  if (validPositions.length === 0) {
    return null;
  }

  return (
    <Polyline
      positions={validPositions}
      pathOptions={{
        color: "#2563eb",
        weight: 5,
        opacity: 0.85,
      }}
    />
  );
}