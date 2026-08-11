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

    if (!coordinates || coordinates.length === 0) return;

    const bounds = L.latLngBounds(
      coordinates.map(([lat, lng]) => [lat, lng])
    );

    map.fitBounds(bounds, {
      padding: [60, 60],
    });

  }, [coordinates, map]);

  if (!coordinates?.length) return null;

  return (
    <Polyline
      positions={coordinates.map(([lat, lng]) => [lat, lng] as [number, number])}
      pathOptions={{
        color: "blue",
        weight: 5,
        opacity: 0.8,
      }}
    />
  );
}