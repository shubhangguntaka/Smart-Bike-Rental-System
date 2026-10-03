import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { BikeDTO } from "../../types/bike";
import { useTheme } from "../../theme";
import AppText from "../common/AppText";
import AppCard from "../common/AppCard";
import AppBadge from "../common/AppBadge";
import { formatCurrency } from "../../utils/formatters";
import { Bike, ShieldCheck, ShieldAlert, Star } from "lucide-react-native";

export interface BikeOwnerCardProps {
  bike: BikeDTO;
  onPress: () => void;
  onEdit?: () => void;
}

export const BikeOwnerCard: React.FC<BikeOwnerCardProps> = ({
  bike,
  onPress,
  onEdit,
}) => {
  const { theme, isDark } = useTheme();

  const isAvailable = (bike.bikeStatus || "AVAILABLE").toUpperCase() === "AVAILABLE";
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
    <AppCard onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        {/* Bike Thumbnail */}
        <View
          style={[
            styles.imageContainer,
            { backgroundColor: isDark ? "#28282C" : "#EDEBE6" },
          ]}
        >
          {bike.imageUrl ? (
            <Image
              source={{ uri: bike.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Bike size={32} color={theme.primary} />
          )}
        </View>

        {/* Details */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <AppText variant="body" weight="700" numberOfLines={1} style={styles.title}>
              {bike.bikeName || `${bike.brand} ${bike.model}`}
            </AppText>
            <AppBadge
              label={bike.bikeStatus || "AVAILABLE"}
              variant={statusVariant}
              size="sm"
            />
          </View>

          <AppText variant="caption" color="muted" style={styles.regNo}>
            Reg: {bike.registrationNumber || "Pending"}
          </AppText>

          <View style={styles.metaRow}>
            <View style={styles.priceContainer}>
              <AppText variant="h3" weight="700" color="primary">
                {formatCurrency(bike.rentalPrice || bike.hourlyRate || 0)}
              </AppText>
              <AppText variant="caption" color="muted">
                {bike.rentalType === "HOURLY" ? "/hr" : "/day"}
              </AppText>
            </View>

            <View style={styles.badgesRight}>
              {isRcVerified ? (
                <View style={styles.verifiedTag}>
                  <ShieldCheck size={14} color="#22C55E" />
                  <AppText variant="caption" weight="600" style={{ color: "#22C55E", marginLeft: 4 }}>
                    RC Verified
                  </AppText>
                </View>
              ) : (
                <View style={styles.unverifiedTag}>
                  <ShieldAlert size={14} color="#F59E0B" />
                  <AppText variant="caption" weight="600" style={{ color: "#F59E0B", marginLeft: 4 }}>
                    RC Pending
                  </AppText>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  regNo: {
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  badgesRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unverifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default BikeOwnerCard;
