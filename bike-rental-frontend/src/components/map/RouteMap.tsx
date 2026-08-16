import { useEffect } from "react";
import { Polyline, useMap } from "react-leaflet";
import L from "leaflet";

interface RouteMapProps {
  coordinates: number[][];
}

export default function RouteMap({
  coordinates,
}: RouteMapProps) {

  const map = useMap();

  useEffect(() => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) return;

    try {
      const validPoints = coordinates.filter(
        (p) => Array.isArray(p) && p.length === 2 && typeof p[0] === "number" && typeof p[1] === "number" && !isNaN(p[0]) && !isNaN(p[1])
      );
      if (validPoints.length === 0) return;

      const bounds = L.latLngBounds(
        validPoints.map(([lat, lng]) => [lat, lng])
      );

      map.fitBounds(bounds, {
        padding: [60, 60],
      });
    } catch (err) {
      console.warn("Leaflet fitBounds error avoided:", err);
    }
  }, [coordinates, map]);

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) return null;

  const validPositions = coordinates.filter(
    (p) => Array.isArray(p) && p.length === 2 && typeof p[0] === "number" && typeof p[1] === "number" && !isNaN(p[0]) && !isNaN(p[1])
  ) as [number, number][];

  if (validPositions.length === 0) return null;

  return (
    <Polyline
      positions={validPositions}
      pathOptions={{
        color: "#3b82f6",
        weight: 5,
        opacity: 0.8,
      }}
    />
  );
}