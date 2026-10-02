import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import {
  MapPin,
  Bike as BikeIcon,
  Crosshair,
  Star,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { bikeService } from "../../services/bikeService";
import { Bike } from "../../types/bike";
import AppHeader from "../../components/common/AppHeader";
import AppButton from "../../components/common/AppButton";
import AppText from "../../components/common/AppText";
import AppScreen from "../../components/common/AppScreen";
import { useTheme } from "../../theme";

export default function MapExploreScreen() {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  const { theme } = useTheme();

  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Default coordinate (Hyderabad central hub)
  const initialRegion = {
    latitude: 17.385,
    longitude: 78.4867,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const data = await bikeService.getAllBikes();
        setBikes(data);
        if (data.length > 0) setSelectedBike(data[0]);

        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch (err) {
        console.warn("Location or bikes load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      });
    }
  };

  return (
    <AppScreen edges={["top", "bottom"]} scrollable={false}>
      <AppHeader title="Nearby Fleet Map" showBack />

      <View className="flex-1 relative">
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={{ flex: 1 }}
          initialRegion={initialRegion}
          showsUserLocation={Boolean(userLocation)}
          showsMyLocationButton={false}
        >
          {bikes.map((b, index) => {
            const lat = b.latitude || 17.385 + (index % 5) * 0.012 - 0.025;
            const lng = b.longitude || 78.4867 + (index % 4) * 0.014 - 0.02;
            const isSelected = selectedBike?.bikeId === b.bikeId;

            return (
              <Marker
                key={b.bikeId || b.id || index}
                coordinate={{ latitude: lat, longitude: lng }}
                onPress={() => setSelectedBike(b)}
              >
                <View
                  className={`p-2 rounded-2xl items-center justify-center border-2 shadow-lg ${
                    isSelected
                      ? "bg-primary border-white"
                      : "bg-card border-primary"
                  }`}
                >
                  <BikeIcon
                    size={16}
                    color={isSelected ? "#FFFFFF" : theme.primary}
                  />
                </View>
              </Marker>
            );
          })}
        </MapView>

        {/* Floating Center Location Button */}
        {userLocation && (
          <Pressable
            onPress={centerOnUser}
            className="absolute top-4 right-4 p-3 rounded-2xl bg-card border border-border/80 shadow-md active:bg-muted"
          >
            <Crosshair size={20} color={theme.primary} />
          </Pressable>
        )}

        {/* Selected Bike Preview Bottom Sheet Card */}
        {selectedBike && (
          <View className="absolute bottom-6 left-5 right-5 p-4 rounded-3xl bg-card border border-border/80 shadow-2xl space-y-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10">
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-[10px] font-black text-primary uppercase tracking-wider"
                >
                  {selectedBike.brand}
                </Text>
              </View>

              <View className="flex-row items-center gap-1">
                <Star size={12} color="#EAB308" fill="#EAB308" />
                <Text
                  style={{ fontFamily: "JetBrainsMono" }}
                  className="text-xs font-bold text-foreground"
                >
                  4.8
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-3">
                <AppText variant="h4" numberOfLines={1}>
                  {selectedBike.bikeName || `${selectedBike.brand} ${selectedBike.model}`}
                </AppText>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <MapPin size={11} color={theme.primary} />
                  <AppText variant="caption" numberOfLines={1}>
                    {selectedBike.location || "Hyderabad Hub"}
                  </AppText>
                </View>
              </View>

              <View className="items-end">
                <Text
                  style={{ fontFamily: "JetBrainsMono" }}
                  className="text-lg font-black text-foreground"
                >
                  ₹{selectedBike.hourlyRate || 80}
                </Text>
                <AppText variant="caption" className="font-semibold text-[10px]">
                  / hr
                </AppText>
              </View>
            </View>

            <View className="flex-row gap-2 pt-1">
              <AppButton
                title="View Specs"
                variant="outline"
                size="md"
                className="flex-1"
                onPress={() =>
                  navigation.navigate("BikeDetailsScreen", {
                    bikeId: selectedBike.bikeId || selectedBike.id,
                    bike: selectedBike,
                  })
                }
              />
              <AppButton
                title="Reserve Now"
                variant="primary"
                size="md"
                className="flex-1"
                onPress={() =>
                  navigation.navigate("BookingScreen", {
                    bikeId: selectedBike.bikeId || selectedBike.id,
                    bike: selectedBike,
                  })
                }
              />
            </View>
          </View>
        )}
      </View>
    </AppScreen>
  );
}
