import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Bike,
  ShieldCheck,
  ShieldAlert,
  Edit,
  Trash2,
  Star,
  MapPin,
  Fuel,
  Gauge,
  Zap,
  Users,
  Clock,
  FileCheck,
} from "lucide-react-native";
import { OwnerStackParamList } from "../../navigation/types";
import { useOwnerBikes } from "../../hooks/useOwnerBikes";
import { useOwnerReviews } from "../../hooks/useOwnerReviews";
import { bikeService } from "../../services/bikeService";
import { useTheme } from "../../theme";
import AppScreen from "../../components/common/AppScreen";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppCard from "../../components/common/AppCard";
import AppBadge from "../../components/common/AppBadge";
import AppButton from "../../components/common/AppButton";
import AppLoader from "../../components/common/AppLoader";
import ReviewCard from "../../components/cards/ReviewCard";
import { formatCurrency } from "../../utils/formatters";
import { BikeDTO } from "../../types/bike";

type Props = NativeStackScreenProps<OwnerStackParamList, "BikeDetailsScreen">;

export const BikeDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bikeId, bike: initialBike } = route.params;
  const { theme, isDark } = useTheme();
  const { deleteBike, isDeleting } = useOwnerBikes();
  const { reviews } = useOwnerReviews(bikeId);

  const [bike, setBike] = useState<BikeDTO | null>(initialBike || null);
  const [loading, setLoading] = useState(!initialBike);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function loadDetails() {
      try {
        const fetched = await bikeService.getBikeById(bikeId);
        if (fetched) setBike(fetched);
      } catch (err) {
        console.warn("Could not fetch bike details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [bikeId]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Bike",
      "Are you sure you want to remove this bike from your fleet?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBike(bikeId);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete bike.");
            }
          },
        },
      ]
    );
  };

  if (loading || !bike) {
    return <AppLoader fullScreen message="Loading bike details..." />;
  }

  const allImages =
    bike.imageUrls && bike.imageUrls.length > 0
      ? bike.imageUrls
      : bike.imageUrl
      ? [bike.imageUrl]
      : [];

  const isRcVerified = !!(bike.rcVerified ?? bike.rcVerificationStatus);

  const statusVariant =
    bike.bikeStatus === "AVAILABLE"
      ? "success"
      : bike.bikeStatus === "BOOKED"
      ? "info"
      : bike.bikeStatus === "MAINTENANCE"
      ? "warning"
      : "neutral";

  return (
    <AppScreen withTopInset contentContainerStyle={styles.container}>
      <AppHeader
        title={bike.bikeName || "Bike Details"}
        subtitle={`Reg: ${bike.registrationNumber || "Pending"}`}
        rightAction={
          <Pressable
            onPress={() =>
              navigation.navigate("EditBikeScreen", { bikeId, bike })
            }
            style={styles.headerEditBtn}
          >
            <Edit size={20} color={theme.primary} />
          </Pressable>
        }
      />

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Image Gallery Banner */}
        <View style={styles.imageBanner}>
          {allImages.length > 0 ? (
            <Image
              source={{ uri: allImages[activeImageIndex] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.placeholderImage,
                { backgroundColor: isDark ? "#28282C" : "#EDEBE6" },
              ]}
            >
              <Bike size={54} color={theme.primary} />
            </View>
          )}

          {allImages.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailScroll}
            >
              {allImages.map((uri, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => setActiveImageIndex(idx)}
                  style={[
                    styles.thumbnail,
                    activeImageIndex === idx && {
                      borderColor: theme.primary,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Image source={{ uri }} style={styles.thumbImg} resizeMode="cover" />
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Title & Status */}
        <View style={styles.contentSection}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppText variant="h2" weight="700">
                {bike.bikeName || `${bike.brand} ${bike.model}`}
              </AppText>
              <AppText variant="bodySmall" color="muted">
                {bike.brand} • {bike.model}
              </AppText>
            </View>
            <AppBadge
              label={bike.bikeStatus || "AVAILABLE"}
              variant={statusVariant}
            />
          </View>

          {/* Pricing & Location Overview */}
          <AppCard style={styles.pricingCard}>
            <View style={styles.pricingRow}>
              <View>
                <AppText variant="caption" color="muted">
                  Daily Rental Rate
                </AppText>
                <AppText variant="h1" weight="700" color="primary">
                  {formatCurrency(bike.rentalPrice || 0)}
                  <AppText variant="bodySmall" color="muted">
                    /day
                  </AppText>
                </AppText>
              </View>

              {bike.hourlyRate ? (
                <View style={{ alignItems: "flex-end" }}>
                  <AppText variant="caption" color="muted">
                    Hourly Rate
                  </AppText>
                  <AppText variant="h3" weight="700">
                    {formatCurrency(bike.hourlyRate)}
                    <AppText variant="caption" color="muted">
                      /hr
                    </AppText>
                  </AppText>
                </View>
              ) : null}
            </View>

            <View style={[styles.locationRow, { borderTopColor: theme.border }]}>
              <MapPin size={16} color={theme.primary} style={{ marginRight: 6 }} />
              <AppText variant="bodySmall" weight="600" numberOfLines={1}>
                {bike.location || "Pickup Hub"}
              </AppText>
            </View>
          </AppCard>

          {/* RC Verification Banner */}
          <AppCard
            onPress={() =>
              navigation.navigate("DocumentsScreen", { bikeId: bike.bikeId })
            }
            style={[
              styles.rcCard,
              {
                backgroundColor: isRcVerified
                  ? isDark
                    ? "#1E2A22"
                    : "#DEF7EC"
                  : isDark
                  ? "#2E2A1E"
                  : "#FEF3C7",
              },
            ]}
          >
            <View style={styles.rcRow}>
              {isRcVerified ? (
                <ShieldCheck size={22} color="#22C55E" style={{ marginRight: 10 }} />
              ) : (
                <ShieldAlert size={22} color="#F59E0B" style={{ marginRight: 10 }} />
              )}
              <View style={{ flex: 1 }}>
                <AppText variant="body" weight="700">
                  {isRcVerified ? "RC Document Approved" : "RC Verification Required"}
                </AppText>
                <AppText variant="caption" color="muted">
                  RC #{bike.rcNumber || "Not on file"} • Tap to view documents
                </AppText>
              </View>
              <FileCheck size={18} color={theme.primary} />
            </View>
          </AppCard>

          {/* Specifications Grid */}
          <AppText variant="h3" weight="700" style={styles.sectionHeader}>
            Vehicle Specifications
          </AppText>

          <View style={styles.specsGrid}>
            <AppCard style={styles.specItem}>
              <Fuel size={18} color={theme.primary} />
              <AppText variant="caption" color="muted" style={styles.specLabel}>
                Fuel Type
              </AppText>
              <AppText variant="bodySmall" weight="700">
                {bike.fuelType || "Petrol"}
              </AppText>
            </AppCard>

            <AppCard style={styles.specItem}>
              <Zap size={18} color={theme.primary} />
              <AppText variant="caption" color="muted" style={styles.specLabel}>
                Transmission
              </AppText>
              <AppText variant="bodySmall" weight="700">
                {bike.transmission || "Manual"}
              </AppText>
            </AppCard>

            <AppCard style={styles.specItem}>
              <Gauge size={18} color={theme.primary} />
              <AppText variant="caption" color="muted" style={styles.specLabel}>
                Engine Capacity
              </AppText>
              <AppText variant="bodySmall" weight="700">
                {bike.engineCapacity || "N/A"}
              </AppText>
            </AppCard>

            <AppCard style={styles.specItem}>
              <Users size={18} color={theme.primary} />
              <AppText variant="caption" color="muted" style={styles.specLabel}>
                Seating
              </AppText>
              <AppText variant="bodySmall" weight="700">
                {bike.seatingCapacity || 2} Persons
              </AppText>
            </AppCard>
          </View>

          {/* Description */}
          {bike.description ? (
            <View style={styles.descSection}>
              <AppText variant="h3" weight="700" style={styles.sectionHeader}>
                Description
              </AppText>
              <AppText variant="body" color="muted" style={{ lineHeight: 22 }}>
                {bike.description}
              </AppText>
            </View>
          ) : null}

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <AppText variant="h3" weight="700">
                Customer Reviews ({reviews.length})
              </AppText>
              {bike.rating ? (
                <View style={styles.ratingBadge}>
                  <Star size={14} color="#FACC15" fill="#FACC15" />
                  <AppText variant="bodySmall" weight="700" style={{ marginLeft: 4 }}>
                    {bike.rating.toFixed(1)}
                  </AppText>
                </View>
              ) : null}
            </View>

            {reviews.length === 0 ? (
              <AppText variant="caption" color="muted" style={{ marginTop: 6 }}>
                No customer reviews yet for this vehicle.
              </AppText>
            ) : (
              reviews.slice(0, 3).map((review) => (
                <ReviewCard key={review.reviewId || review.id} review={review} />
              ))
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionBtnsRow}>
            <AppButton
              title="Edit Bike"
              variant="outline"
              size="lg"
              onPress={() =>
                navigation.navigate("EditBikeScreen", { bikeId, bike })
              }
              style={styles.editBtn}
            />
            <AppButton
              title="Delete"
              variant="destructive"
              size="lg"
              onPress={handleDelete}
              loading={isDeleting}
              style={styles.deleteBtn}
            />
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  headerEditBtn: {
    padding: 6,
  },
  scrollBody: {
    flex: 1,
  },
  imageBanner: {
    width: "100%",
  },
  mainImage: {
    width: "100%",
    height: 240,
  },
  placeholderImage: {
    width: "100%",
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 8,
  },
  thumbImg: {
    width: "100%",
    height: "100%",
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  pricingCard: {
    padding: 16,
    marginBottom: 12,
  },
  pricingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
  },
  rcCard: {
    padding: 14,
    marginBottom: 16,
  },
  rcRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  specItem: {
    width: "48%",
    padding: 12,
    marginBottom: 10,
  },
  specLabel: {
    marginTop: 6,
    marginBottom: 2,
  },
  descSection: {
    marginBottom: 16,
  },
  reviewsSection: {
    marginBottom: 24,
  },
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtnsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  editBtn: {
    flex: 0.65,
  },
  deleteBtn: {
    flex: 0.3,
  },
});

export default BikeDetailsScreen;
