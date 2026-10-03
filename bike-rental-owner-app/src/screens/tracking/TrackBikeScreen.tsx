import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import {
  Navigation,
  RefreshCw,
  MapPin,
  Clock,
  Gauge,
  Bike,
} from "lucide-react-native";
import { OwnerStackParamList } from "../../navigation/types";
import { bookingService } from "../../services/bookingService";
import { gpsService } from "../../services/gpsService";
import { useTheme } from "../../theme";
import AppScreen from "../../components/common/AppScreen";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppCard from "../../components/common/AppCard";
import AppBadge from "../../components/common/AppBadge";
import AppButton from "../../components/common/AppButton";
import { RideTrackingDTO } from "../../types/booking";
import { GPSLocationDTO } from "../../types/gps";

type Props = NativeStackScreenProps<OwnerStackParamList, "TrackBikeScreen">;

const { width, height } = Dimensions.get("window");

export const TrackBikeScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId, rideId, rental } = route.params;
  const { theme, isDark } = useTheme();

  const mapRef = useRef<MapView>(null);
  const [tracking, setTracking] = useState<RideTrackingDTO | null>(null);
  const [locations, setLocations] = useState<GPSLocationDTO[]>([]);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Default coordinate (Bengaluru hub)
  const defaultCoord = {
    latitude: 12.9716,
    longitude: 77.5946,
  };

  const fetchLiveTracking = async () => {
    try {
      // 1. Fetch live tracking info
      const data = await bookingService.getRideTracking(bookingId);
      if (data) {
        setTracking(data);
      }

      // 2. Fetch coordinate history if rideId exists
      if (rideId) {
        const [locList, dist] = await Promise.all([
          gpsService.getLocations(rideId).catch(() => []),
          gpsService.getDistance(rideId).catch(() => 0),
        ]);
        setLocations(locList);
        setDistanceKm(dist);
      }
    } catch (err) {
      console.warn("Could not fetch GPS tracking:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveTracking();
    const interval = setInterval(fetchLiveTracking, 10000); // 10s live poll
    return () => clearInterval(interval);
  }, [bookingId, rideId]);

  const currentLat = tracking?.latitude || defaultCoord.latitude;
  const currentLng = tracking?.longitude || defaultCoord.longitude;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppHeader
        title={rental?.bikeName || "Live Ride Tracking"}
        subtitle={`Booking #${bookingId}`}
        rightAction={
          <Pressable
            onPress={() => {
              setRefreshing(true);
              fetchLiveTracking();
            }}
            style={styles.refreshBtn}
          >
            <RefreshCw size={20} color={theme.primary} />
          </Pressable>
        }
      />

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: currentLat,
            longitude: currentLng,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
          userInterfaceStyle={isDark ? "dark" : "light"}
        >
          {/* Current Bike Position Marker */}
          <Marker
            coordinate={{ latitude: currentLat, longitude: currentLng }}
            title={rental?.bikeName || "Bike Location"}
            description={tracking?.currentLocation || "Active Ride"}
          >
            <View style={[styles.bikeMarker, { backgroundColor: theme.primary }]}>
              <Bike size={20} color="#FFFFFF" />
            </View>
          </Marker>

          {/* Polyline Route if coordinates exist */}
          {locations.length > 1 && (
            <Polyline
              coordinates={locations.map((loc) => ({
                latitude: loc.latitude,
                longitude: loc.longitude,
              }))}
              strokeColor="#7C9082"
              strokeWidth={4}
            />
          )}
        </MapView>

        {/* Live Status Overlay Card */}
        <View style={styles.overlayBottom}>
          <AppCard style={styles.trackingCard}>
            <View style={styles.cardHeader}>
              <View style={styles.statusIndicator}>
                <View style={styles.liveDot} />
                <AppText variant="bodySmall" weight="700" color="primary">
                  {tracking?.status || "IN PROGRESS"}
                </AppText>
              </View>
              <AppBadge label="GPS ACTIVE" variant="success" size="sm" />
            </View>

            {/* Metrics Row */}
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Gauge size={18} color={theme.primary} />
                <AppText variant="caption" color="muted" style={styles.metricLabel}>
                  Distance
                </AppText>
                <AppText variant="body" weight="700">
                  {distanceKm > 0 ? `${distanceKm.toFixed(1)} km` : "Tracking"}
                </AppText>
              </View>

              <View style={styles.metricItem}>
                <Clock size={18} color={theme.primary} />
                <AppText variant="caption" color="muted" style={styles.metricLabel}>
                  Ride Duration
                </AppText>
                <AppText variant="body" weight="700">
                  {tracking?.rideDuration || "Active"}
                </AppText>
              </View>

              <View style={styles.metricItem}>
                <Navigation size={18} color={theme.primary} />
                <AppText variant="caption" color="muted" style={styles.metricLabel}>
                  Est. Return
                </AppText>
                <AppText variant="body" weight="700">
                  {tracking?.eta || "On Schedule"}
                </AppText>
              </View>
            </View>

            {/* Location Details */}
            {tracking?.currentLocation && (
              <View style={[styles.locationRow, { borderTopColor: theme.border }]}>
                <MapPin size={15} color={theme.primary} style={{ marginRight: 6 }} />
                <AppText variant="caption" color="muted" numberOfLines={1}>
                  {tracking.currentLocation}
                </AppText>
              </View>
            )}
          </AppCard>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  refreshBtn: {
    padding: 6,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  bikeMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  overlayBottom: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
  },
  trackingCard: {
    padding: 16,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    marginTop: 4,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
  },
});

export default TrackBikeScreen;
