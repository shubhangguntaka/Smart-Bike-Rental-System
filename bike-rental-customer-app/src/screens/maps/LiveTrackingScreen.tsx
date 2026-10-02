import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import {
  Play,
  Pause,
  Square,
  ShieldCheck,
  Bike as BikeIcon,
  Crosshair,
  Clock,
  Gauge,
  MapPin,
  RotateCw,
} from "lucide-react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { gpsService } from "../../services/gpsService";
import { bookingService } from "../../services/bookingService";
import { GPSLocation, Ride } from "../../types/gps";
import { Booking } from "../../types/booking";
import AppHeader from "../../components/common/AppHeader";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../theme";

export default function LiveTrackingScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  const { user } = useAuthStore();
  const { theme, isDark } = useTheme();

  const booking = route.params?.booking as Booking | undefined;
  const bookingId = Number(route.params?.bookingId || booking?.bookingId || 0);

  const [ride, setRide] = useState<Ride | null>(null);
  const [rideStatus, setRideStatus] = useState<"IDLE" | "STARTED" | "PAUSED" | "ENDED">("IDLE");
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [speed, setSpeed] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);

  // Restore active ride from backend if exists
  useEffect(() => {
    async function initRide() {
      if (!bookingId) return;
      try {
        const existing = await gpsService.getRideByBookingId(bookingId);
        if (existing) {
          setRide(existing);
          if (existing.status === "STARTED" || existing.status === "RESUMED") {
            setRideStatus("STARTED");
          } else if (existing.status === "PAUSED") {
            setRideStatus("PAUSED");
          }
          if (existing.totalDistance != null) {
            setDistanceKm(existing.totalDistance);
          }
          if (existing.locations && existing.locations.length > 0) {
            setRouteCoordinates(
              existing.locations.map((loc) => ({
                latitude: loc.latitude,
                longitude: loc.longitude,
              }))
            );
          }
        }
      } catch {
        // No prior ride created yet
      }
    }
    initRide();
  }, [bookingId]);

  // GPS Watch & Backend Location Reporting
  useEffect(() => {
    let locSubscription: { remove(): void } | null = null;
    let timerInterval: any = null;

    async function startLocationWatch() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          setLocationPermission(true);
          const current = await Location.getCurrentPositionAsync({});
          const initialCoord = {
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          };
          const initialLoc: GPSLocation = {
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
            speed: current.coords.speed || 0,
            timestamp: new Date().toISOString(),
          };
          setCurrentLocation(initialLoc);
          setRouteCoordinates((prev) => (prev.length === 0 ? [initialCoord] : prev));

          locSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              distanceInterval: 10,
              timeInterval: 4000,
            },
            async (loc: any) => {
              const newCoord = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              };
              const newGpsLoc: GPSLocation = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                speed: loc.coords.speed || 0,
                timestamp: new Date().toISOString(),
              };

              setCurrentLocation(newGpsLoc);
              setSpeed(Math.max(0, Math.round((loc.coords.speed || 0) * 3.6))); // m/s to km/h

              if (rideStatus === "STARTED") {
                setRouteCoordinates((prev) => [...prev, newCoord]);

                // Sync live location point with backend
                const activeRideId = ride?.rideId || ride?.id;
                if (activeRideId) {
                  try {
                    await gpsService.saveLocation(activeRideId, newGpsLoc);
                    // Fetch authentic server-calculated distance
                    const d = await gpsService.calculateDistance(activeRideId);
                    if (d > 0) {
                      setDistanceKm(d);
                    }
                  } catch (e) {
                    console.warn("Telemetry report error:", e);
                  }
                }
              }
            }
          );
        }
      } catch (err) {
        console.warn("Location watch error:", err);
      }
    }

    startLocationWatch();

    if (rideStatus === "STARTED") {
      timerInterval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }

    return () => {
      if (locSubscription) locSubscription.remove();
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [rideStatus, ride?.rideId, ride?.id]);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleStartRide = async () => {
    const customerId = user?.id ? Number(user.id) : booking?.customerId;
    const bikeId = booking?.bikeId;

    if (!bookingId || !bikeId || !customerId) {
      Alert.alert("Missing Parameters", "Booking information is incomplete.");
      return;
    }

    try {
      setSyncing(true);
      const r = await gpsService.startRide(bookingId, bikeId, customerId);
      setRide(r);
      setRideStatus("STARTED");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to start ride session.";
      Alert.alert("Start Ride Error", msg);
    } finally {
      setSyncing(false);
    }
  };

  const handlePauseRide = async () => {
    const activeRideId = ride?.rideId || ride?.id;
    if (!activeRideId) return;

    try {
      setSyncing(true);
      const updated = await gpsService.pauseRide(activeRideId);
      setRide(updated);
      setRideStatus("PAUSED");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to pause ride session.";
      Alert.alert("Pause Error", msg);
    } finally {
      setSyncing(false);
    }
  };

  const handleResumeRide = async () => {
    const activeRideId = ride?.rideId || ride?.id;
    if (!activeRideId) return;

    try {
      setSyncing(true);
      const updated = await gpsService.resumeRide(activeRideId);
      setRide(updated);
      setRideStatus("STARTED");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to resume ride session.";
      Alert.alert("Resume Error", msg);
    } finally {
      setSyncing(false);
    }
  };

  const handleEndRideConfirm = () => {
    Alert.alert(
      "End Ride",
      "Are you sure you want to end your ride? The host will inspect and confirm the return to generate your final bill.",
      [
        { text: "Continue Riding", style: "cancel" },
        {
          text: "End Ride & Proceed to Bill",
          style: "destructive",
          onPress: async () => {
            const activeRideId = ride?.rideId || ride?.id;
            try {
              setSyncing(true);
              if (activeRideId) {
                await gpsService.endRide(activeRideId);
              }
              setRideStatus("ENDED");
              navigation.replace("PaymentScreen", {
                bookingId,
                booking,
              });
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Error ending ride on backend.";
              Alert.alert("End Ride Error", msg);
            } finally {
              setSyncing(false);
            }
          },
        },
      ]
    );
  };

  const initialRegion = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }
    : {
        latitude: 17.385,
        longitude: 78.4867,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <AppScreen edges={["top"]} scrollable={false}>
      <AppHeader
        title={`Live Tracking • BR-${bookingId || "Pass"}`}
        showBack
      />

      <View className="flex-1 relative">
        {/* Map View */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={{ flex: 1 }}
          initialRegion={initialRegion}
          showsUserLocation={locationPermission}
          showsMyLocationButton={false}
          showsCompass
        >
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Your Rental Bike"
              description={`Speed: ${speed} km/h`}
            >
              <View
                style={{ backgroundColor: theme.primary }}
                className="w-9 h-9 rounded-full items-center justify-center border-2 border-white shadow-md"
              >
                <BikeIcon size={18} color="#FFFFFF" />
              </View>
            </Marker>
          )}

          {routeCoordinates.length > 1 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={theme.primary}
              strokeWidth={4}
            />
          )}
        </MapView>

        {/* Floating Telemetry Stats Card */}
        <View className="absolute top-4 left-4 right-4 z-10">
          <View
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
            className="p-4 rounded-3xl border shadow-lg space-y-3"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <View
                  style={{
                    backgroundColor:
                      rideStatus === "STARTED"
                        ? "#059669"
                        : rideStatus === "PAUSED"
                        ? "#D97706"
                        : "#6B7280",
                  }}
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                />
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold uppercase tracking-wider text-foreground"
                >
                  {rideStatus === "STARTED"
                    ? "Live Trip Active"
                    : rideStatus === "PAUSED"
                    ? "Ride Paused"
                    : "Ride Standby"}
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  if (currentLocation && mapRef.current) {
                    mapRef.current.animateToRegion({
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                      latitudeDelta: 0.008,
                      longitudeDelta: 0.008,
                    });
                  }
                }}
                style={{ backgroundColor: isDark ? "#2A2A2A" : "#F3F4F6", borderColor: theme.border }}
                className="p-2 rounded-xl border items-center justify-center shadow-2xs"
              >
                <Crosshair size={16} color={theme.primary} />
              </Pressable>
            </View>

            {/* Metrics */}
            <View className="flex-row justify-between items-center pt-1">
              <View className="items-center flex-1">
                <View className="flex-row items-center gap-1">
                  <Clock size={12} color={theme.mutedForeground} />
                  <Text style={{ fontFamily: "Antic" }} className="text-[10px] text-muted-foreground uppercase font-bold">
                    Elapsed
                  </Text>
                </View>
                <Text style={{ fontFamily: "JetBrainsMono" }} className="text-base font-black text-foreground mt-0.5">
                  {formatTimer(elapsedSeconds)}
                </Text>
              </View>

              <View style={{ width: 1, height: 28, backgroundColor: theme.border }} />

              <View className="items-center flex-1">
                <View className="flex-row items-center gap-1">
                  <Gauge size={12} color={theme.mutedForeground} />
                  <Text style={{ fontFamily: "Antic" }} className="text-[10px] text-muted-foreground uppercase font-bold">
                    Speed
                  </Text>
                </View>
                <Text style={{ fontFamily: "JetBrainsMono" }} className="text-base font-black text-foreground mt-0.5">
                  {speed} <Text className="text-[10px] text-muted-foreground">km/h</Text>
                </Text>
              </View>

              <View style={{ width: 1, height: 28, backgroundColor: theme.border }} />

              <View className="items-center flex-1">
                <View className="flex-row items-center gap-1">
                  <MapPin size={12} color={theme.mutedForeground} />
                  <Text style={{ fontFamily: "Antic" }} className="text-[10px] text-muted-foreground uppercase font-bold">
                    Distance
                  </Text>
                </View>
                <Text style={{ fontFamily: "JetBrainsMono" }} className="text-base font-black text-foreground mt-0.5">
                  {distanceKm.toFixed(2)} <Text className="text-[10px] text-muted-foreground">km</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Control Controls */}
        <View
          style={{ backgroundColor: theme.card, borderTopColor: theme.border }}
          className="p-5 border-t space-y-3 z-10"
        >
          {rideStatus === "IDLE" && (
            <AppButton
              title="Start Ride Session"
              variant="primary"
              size="lg"
              loading={syncing}
              onPress={handleStartRide}
              leftIcon={<Play size={18} color="#FFFFFF" />}
            />
          )}

          {rideStatus === "STARTED" && (
            <View className="flex-row gap-3">
              <View className="flex-1">
                <AppButton
                  title="Pause Ride"
                  variant="outline"
                  size="lg"
                  loading={syncing}
                  onPress={handlePauseRide}
                  leftIcon={<Pause size={18} color={theme.foreground} />}
                />
              </View>

              <View className="flex-1">
                <AppButton
                  title="End Ride"
                  variant="destructive"
                  size="lg"
                  loading={syncing}
                  onPress={handleEndRideConfirm}
                  leftIcon={<Square size={18} color="#FFFFFF" />}
                />
              </View>
            </View>
          )}

          {rideStatus === "PAUSED" && (
            <View className="flex-row gap-3">
              <View className="flex-1">
                <AppButton
                  title="Resume Ride"
                  variant="primary"
                  size="lg"
                  loading={syncing}
                  onPress={handleResumeRide}
                  leftIcon={<Play size={18} color="#FFFFFF" />}
                />
              </View>

              <View className="flex-1">
                <AppButton
                  title="End Ride"
                  variant="destructive"
                  size="lg"
                  loading={syncing}
                  onPress={handleEndRideConfirm}
                  leftIcon={<Square size={18} color="#FFFFFF" />}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </AppScreen>
  );
}
