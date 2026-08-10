import { useEffect } from "react";
import { Polyline, useMap } from "react-leaflet";
import L from "leaflet";

interface RouteMapProps {
  coordinates: Array<number[] | [number, number]>;
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
      positions={coordinates as unknown as L.LatLngExpression[]}
      pathOptions={{
        color: "#2563eb",
        weight: 6,
      }}
    />
  );
}