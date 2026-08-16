import { useEffect } from "react";
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";

import { useLocation } from "@/hooks/useLocation";
import RouteMap from "./RouteMap";
import NearbyBikeMarker from "./NearbyBikeMarker";

import "leaflet/dist/leaflet.css";

const userIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const bikeIcon = new L.Icon({
    iconUrl: "/icons/motorbike.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
});

function ChangeView({
    latitude,
    longitude,
}: {
    latitude?: number | null;
    longitude?: number | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (
            typeof latitude === "number" &&
            typeof longitude === "number" &&
            !isNaN(latitude) &&
            !isNaN(longitude) &&
            latitude !== 0 &&
            longitude !== 0
        ) {
            try {
                map.setView([latitude, longitude], 14);
            } catch (err) {
                console.warn("Leaflet setView error avoided:", err);
            }
        }
    }, [latitude, longitude, map]);

    return null;
}

import type { NearbyBike } from "@/types/location";

interface MapComponentProps {
    bikes?: NearbyBike[];
    searchedLocation?: { latitude: number; longitude: number } | null;
}

export default function MapComponent({ bikes, searchedLocation }: MapComponentProps) {
    const navigate = useNavigate();

    const {
        currentLocation,
        nearbyBikes,
        route,
        setSelectedBikeId,
        getRoute,
    } = useLocation();

    const displayBikes = bikes ?? nearbyBikes;

    const activeLat = searchedLocation?.latitude ?? currentLocation?.latitude ?? 17.3850;
    const activeLng = searchedLocation?.longitude ?? currentLocation?.longitude ?? 78.4867;

    return (
        <MapContainer
            center={[activeLat, activeLng]}
            zoom={14}
            style={{
                height: "100%",
                width: "100%",
                zIndex: 0,
            }}
        >
            <ChangeView
                latitude={searchedLocation?.latitude ?? currentLocation?.latitude}
                longitude={searchedLocation?.longitude ?? currentLocation?.longitude}
            />

            <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Marker */}
            {currentLocation &&
              currentLocation.latitude !== null &&
              currentLocation.longitude !== null &&
              !isNaN(Number(currentLocation.latitude)) &&
              !isNaN(Number(currentLocation.longitude)) && (
                <Marker
                    position={[
                        Number(currentLocation.latitude),
                        Number(currentLocation.longitude),
                    ]}
                    icon={userIcon}
                >
                    <Popup>
                        <strong>Your Current Location</strong>
                    </Popup>
                </Marker>
            )}

            {/* Bike Markers */}
            {(displayBikes ?? []).map((bike) => (
                <NearbyBikeMarker
                    key={bike.bikeId}
                    bike={bike}
                    bikeIcon={bikeIcon}
                    onSelect={() => setSelectedBikeId(bike.bikeId)}
                    onShowRoute={() => getRoute(bike.bikeId)}
                />
            ))}

            {/* Draw Route */}
            {route?.coordinates && (
                <RouteMap coordinates={route.coordinates} />
            )}
        </MapContainer>
    );
}