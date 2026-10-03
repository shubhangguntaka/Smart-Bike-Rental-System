import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OwnerStackParamList } from "../../navigation/types";
import { useOwnerBikes } from "../../hooks/useOwnerBikes";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../theme";
import AppScreen from "../../components/common/AppScreen";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppInput from "../../components/common/AppInput";
import AppButton from "../../components/common/AppButton";
import ImageUploader from "../../components/forms/ImageUploader";
import { BIKE_CATEGORIES, FUEL_TYPES, TRANSMISSION_TYPES } from "../../constants";
import { BikeDTO } from "../../types/bike";
import { bikeService } from "../../services/bikeService";

type Props = NativeStackScreenProps<OwnerStackParamList, "AddBikeScreen">;

export const AddBikeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();
  const { addBike, isAdding } = useOwnerBikes();

  // Form State
  const [bikeName, setBikeName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [fuelType, setFuelType] = useState("PETROL");
  const [transmission, setTransmission] = useState("MANUAL");
  const [engineCapacity, setEngineCapacity] = useState("");
  const [mileage, setMileage] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState("2");
  const [rentalPrice, setRentalPrice] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [location, setLocation] = useState("");
  const [availableStartTime, setAvailableStartTime] = useState("09:00");
  const [availableEndTime, setAvailableEndTime] = useState("21:00");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (
      !bikeName.trim() ||
      !brand.trim() ||
      !model.trim() ||
      !registrationNumber.trim() ||
      !rcNumber.trim() ||
      !location.trim() ||
      !rentalPrice.trim()
    ) {
      setError("Please fill in all required fields marked with *");
      return;
    }

    const dailyRateNum = parseFloat(rentalPrice);
    if (isNaN(dailyRateNum) || dailyRateNum <= 0) {
      setError("Please enter a valid daily rental price.");
      return;
    }

    const hourlyRateNum = hourlyRate ? parseFloat(hourlyRate) : Math.round(dailyRateNum / 8);

    setError("");

    try {
      // Check if RC is already approved or pre-verified
      let isRcApproved = false;
      try {
        const rcStatus = await bikeService.checkApprovedRc(registrationNumber.trim().toUpperCase());
        isRcApproved = !!rcStatus?.isApproved;
      } catch {
        // Continue if verification check endpoint returns false
      }

      const payload: BikeDTO = {
        ownerId: user?.id,
        ownerName: user?.fullName || user?.name || "Owner",
        bikeName: bikeName.trim(),
        brand: brand.trim(),
        model: model.trim(),
        registrationNumber: registrationNumber.trim().toUpperCase(),
        rcNumber: rcNumber.trim().toUpperCase(),
        rcVerified: isRcApproved,
        rcVerificationStatus: isRcApproved,
        fuelType,
        transmission,
        engineCapacity: engineCapacity.trim() || undefined,
        mileage: mileage.trim() || undefined,
        seatingCapacity: parseInt(seatingCapacity, 10) || 2,
        rentalPrice: dailyRateNum,
        hourlyRate: hourlyRateNum,
        rentalType: "DAILY",
        location: location.trim(),
        availableStartTime: availableStartTime.trim(),
        availableEndTime: availableEndTime.trim(),
        description: description.trim() || undefined,
        imageUrl: images.length > 0 ? images[0] : undefined,
        imageUrls: images,
        bikeStatus: "AVAILABLE",
      };

      const created = await addBike(payload);

      Alert.alert(
        "Bike Registered!",
        "Your bike has been added to your fleet successfully.",
        [
          {
            text: "View Fleet",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to register bike. Please check your details.";
      setError(msg);
    }
  };

  return (
    <AppScreen withTopInset contentContainerStyle={styles.container}>
      <AppHeader title="Add New Bike" subtitle="Register a vehicle into your rental fleet" />

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Basic Vehicle Details */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            Basic Vehicle Info
          </AppText>

          <AppInput
            label="Bike Display Name *"
            placeholder="e.g. Royal Enfield Classic 350"
            value={bikeName}
            onChangeText={setBikeName}
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <AppInput
                label="Brand *"
                placeholder="e.g. Royal Enfield"
                value={brand}
                onChangeText={setBrand}
              />
            </View>
            <View style={styles.col}>
              <AppInput
                label="Model *"
                placeholder="e.g. Classic 350"
                value={model}
                onChangeText={setModel}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <AppInput
                label="Reg Number *"
                placeholder="e.g. MH12AB1234"
                value={registrationNumber}
                onChangeText={setRegistrationNumber}
                autoCapitalize="characters"
              />
            </View>
            <View style={styles.col}>
              <AppInput
                label="RC Number *"
                placeholder="e.g. RC987654321"
                value={rcNumber}
                onChangeText={setRcNumber}
                autoCapitalize="characters"
              />
            </View>
          </View>
        </View>

        {/* Technical Specifications */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            Specifications
          </AppText>

          {/* Fuel Type selector */}
          <AppText variant="bodySmall" weight="600" style={{ marginBottom: 6 }}>
            Fuel Type
          </AppText>
          <View style={styles.pillsRow}>
            {FUEL_TYPES.map((fuel) => {
              const selected = fuelType === fuel;
              return (
                <Pressable
                  key={fuel}
                  onPress={() => setFuelType(fuel)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: selected
                        ? theme.primary
                        : isDark
                        ? "#28282C"
                        : "#EDEBE6",
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight={selected ? "700" : "500"}
                    style={{ color: selected ? "#FFFFFF" : theme.foreground }}
                  >
                    {fuel}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {/* Transmission selector */}
          <AppText
            variant="bodySmall"
            weight="600"
            style={{ marginTop: 12, marginBottom: 6 }}
          >
            Transmission
          </AppText>
          <View style={styles.pillsRow}>
            {TRANSMISSION_TYPES.map((trans) => {
              const selected = transmission === trans;
              return (
                <Pressable
                  key={trans}
                  onPress={() => setTransmission(trans)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: selected
                        ? theme.primary
                        : isDark
                        ? "#28282C"
                        : "#EDEBE6",
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight={selected ? "700" : "500"}
                    style={{ color: selected ? "#FFFFFF" : theme.foreground }}
                  >
                    {trans}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.row, { marginTop: 12 }]}>
            <View style={styles.col}>
              <AppInput
                label="Engine Capacity"
                placeholder="e.g. 350cc"
                value={engineCapacity}
                onChangeText={setEngineCapacity}
              />
            </View>
            <View style={styles.col}>
              <AppInput
                label="Mileage"
                placeholder="e.g. 35 kmpl"
                value={mileage}
                onChangeText={setMileage}
              />
            </View>
          </View>
        </View>

        {/* Pricing & Location */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            Pricing & Location
          </AppText>

          <View style={styles.row}>
            <View style={styles.col}>
              <AppInput
                label="Daily Rental Rate (₹) *"
                placeholder="e.g. 800"
                value={rentalPrice}
                onChangeText={setRentalPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.col}>
              <AppInput
                label="Hourly Rate (₹)"
                placeholder="e.g. 100"
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="numeric"
              />
            </View>
          </View>

          <AppInput
            label="Pickup Location / Hub *"
            placeholder="e.g. Koramangala Hub, Bengaluru"
            value={location}
            onChangeText={setLocation}
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <AppInput
                label="Available From"
                placeholder="09:00"
                value={availableStartTime}
                onChangeText={setAvailableStartTime}
              />
            </View>
            <View style={styles.col}>
              <AppInput
                label="Available Until"
                placeholder="21:00"
                value={availableEndTime}
                onChangeText={setAvailableEndTime}
              />
            </View>
          </View>
        </View>

        {/* Vehicle Images */}
        <View style={styles.section}>
          <ImageUploader
            label="Bike Photos"
            images={images}
            onChange={setImages}
            maxImages={5}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <AppInput
            label="Description & Rules"
            placeholder="Describe condition, helmet availability, fuel guidelines..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: "top" }}
          />
        </View>

        {error ? (
          <AppText
            variant="bodySmall"
            color="destructive"
            style={styles.errorText}
          >
            {error}
          </AppText>
        ) : null}

        <AppButton
          title="Save & Publish Bike"
          size="lg"
          onPress={handleSubmit}
          loading={isAdding}
          style={styles.submitBtn}
        />
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  scrollBody: {
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  col: {
    flex: 0.485,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  errorText: {
    marginVertical: 12,
    textAlign: "center",
  },
  submitBtn: {
    marginTop: 16,
    marginBottom: 40,
  },
});

export default AddBikeScreen;
