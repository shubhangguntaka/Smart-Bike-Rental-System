import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OwnerStackParamList } from "../../navigation/types";
import { useOwnerBikes } from "../../hooks/useOwnerBikes";
import { useTheme } from "../../theme";
import AppScreen from "../../components/common/AppScreen";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppInput from "../../components/common/AppInput";
import AppButton from "../../components/common/AppButton";
import ImageUploader from "../../components/forms/ImageUploader";
import { BIKE_STATUS_OPTIONS } from "../../constants";
import { BikeDTO } from "../../types/bike";

type Props = NativeStackScreenProps<OwnerStackParamList, "EditBikeScreen">;

export const EditBikeScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bikeId, bike } = route.params;
  const { theme, isDark } = useTheme();
  const { updateBike, isUpdating, deleteBike, isDeleting } = useOwnerBikes();

  const [bikeName, setBikeName] = useState(bike?.bikeName || "");
  const [brand, setBrand] = useState(bike?.brand || "");
  const [model, setModel] = useState(bike?.model || "");
  const [registrationNumber, setRegistrationNumber] = useState(bike?.registrationNumber || "");
  const [rcNumber, setRcNumber] = useState(bike?.rcNumber || "");
  const [rentalPrice, setRentalPrice] = useState(
    bike?.rentalPrice ? String(bike.rentalPrice) : ""
  );
  const [hourlyRate, setHourlyRate] = useState(
    bike?.hourlyRate ? String(bike.hourlyRate) : ""
  );
  const [location, setLocation] = useState(bike?.location || "");
  const [bikeStatus, setBikeStatus] = useState<string>(bike?.bikeStatus || "AVAILABLE");
  const [availableStartTime, setAvailableStartTime] = useState(bike?.availableStartTime || "09:00");
  const [availableEndTime, setAvailableEndTime] = useState(bike?.availableEndTime || "21:00");
  const [description, setDescription] = useState(bike?.description || "");
  const [images, setImages] = useState<string[]>(
    bike?.imageUrls?.length ? bike.imageUrls : bike?.imageUrl ? [bike.imageUrl] : []
  );
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    if (!bikeName.trim() || !rentalPrice.trim() || !location.trim()) {
      setError("Please fill in required fields (Name, Daily Price, Location).");
      return;
    }

    const dailyRateNum = parseFloat(rentalPrice);
    if (isNaN(dailyRateNum) || dailyRateNum <= 0) {
      setError("Please enter a valid daily rental price.");
      return;
    }

    setError("");

    try {
      const payload: BikeDTO = {
        fuelType: bike?.fuelType || "PETROL",
        ...(bike || {}),
        bikeId,
        bikeName: bikeName.trim(),
        brand: brand.trim() || bike?.brand || "",
        model: model.trim() || bike?.model || "",
        registrationNumber: registrationNumber.trim() || bike?.registrationNumber || "",
        rcNumber: rcNumber.trim() || bike?.rcNumber || "",
        rentalPrice: dailyRateNum,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        location: location.trim(),
        bikeStatus,
        availableStartTime,
        availableEndTime,
        description: description.trim() || undefined,
        imageUrl: images.length > 0 ? images[0] : undefined,
        imageUrls: images,
      };

      await updateBike({ bikeId, bike: payload });

      Alert.alert("Success", "Bike details updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not update bike.";
      setError(msg);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Bike",
      "Are you sure you want to remove this bike from your rental fleet? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBike(bikeId);
              Alert.alert("Deleted", "Bike removed from fleet.", [
                { text: "OK", onPress: () => navigation.navigate("OwnerTabs") },
              ]);
            } catch (err: any) {
              Alert.alert(
                "Delete Failed",
                err.response?.data?.message || "Could not delete bike."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <AppScreen withTopInset contentContainerStyle={styles.container}>
      <AppHeader
        title="Edit Bike"
        subtitle={`ID: #${bikeId} • ${registrationNumber}`}
      />

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Status Selection */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            Fleet Status
          </AppText>
          <View style={styles.pillsRow}>
            {BIKE_STATUS_OPTIONS.map((item) => {
              const selected = bikeStatus === item.value;
              return (
                <Pressable
                  key={item.value}
                  onPress={() => setBikeStatus(item.value)}
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
                    variant="bodySmall"
                    weight={selected ? "700" : "500"}
                    style={{ color: selected ? "#FFFFFF" : theme.foreground }}
                  >
                    {item.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Pricing & Info */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            Pricing & Availability
          </AppText>

          <AppInput
            label="Bike Name *"
            value={bikeName}
            onChangeText={setBikeName}
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <AppInput
                label="Daily Rate (₹) *"
                value={rentalPrice}
                onChangeText={setRentalPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.col}>
              <AppInput
                label="Hourly Rate (₹)"
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="numeric"
              />
            </View>
          </View>

          <AppInput
            label="Location *"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Images */}
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
            label="Description"
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

        <View style={styles.btnRow}>
          <AppButton
            title="Delete Bike"
            variant="destructive"
            size="lg"
            onPress={handleDelete}
            loading={isDeleting}
            style={styles.deleteBtn}
          />
          <AppButton
            title="Save Changes"
            size="lg"
            onPress={handleUpdate}
            loading={isUpdating}
            style={styles.saveBtn}
          />
        </View>
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
    marginBottom: 10,
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
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 40,
  },
  deleteBtn: {
    flex: 0.45,
  },
  saveBtn: {
    flex: 0.52,
  },
});

export default EditBikeScreen;
