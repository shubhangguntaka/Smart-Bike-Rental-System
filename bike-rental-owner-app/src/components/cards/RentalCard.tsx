import React from "react";
import { View, StyleSheet } from "react-native";
import { BookingResponse } from "../../types/booking";
import { useTheme } from "../../theme";
import AppText from "../common/AppText";
import AppCard from "../common/AppCard";
import AppBadge from "../common/AppBadge";
import AppButton from "../common/AppButton";
import { formatDateTime } from "../../utils/formatters";
import { Navigation, User, MapPin } from "lucide-react-native";

export interface RentalCardProps {
  rental: BookingResponse;
  onTrack: () => void;
  onDetails: () => void;
  onReturn?: () => void;
}

export const RentalCard: React.FC<RentalCardProps> = ({
  rental,
  onTrack,
  onDetails,
  onReturn,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <AppCard onPress={onDetails} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.bikeSection}>
          <AppText variant="body" weight="700" numberOfLines={1}>
            {rental.bikeName || "Rental Bike"}
          </AppText>
          <AppText variant="caption" color="muted">
            Reg: {rental.registrationNumber || `ID: #${rental.bikeId}`}
          </AppText>
        </View>
        <AppBadge label="ACTIVE RENTAL" variant="success" size="sm" />
      </View>

      <View style={styles.customerRow}>
        <User size={15} color={theme.mutedForeground} style={{ marginRight: 6 }} />
        <AppText variant="bodySmall" weight="600">
          Rented by {rental.customerName || "Customer"}
        </AppText>
      </View>

      {rental.location && (
        <View style={styles.locationRow}>
          <MapPin size={14} color={theme.primary} style={{ marginRight: 6 }} />
          <AppText variant="caption" color="muted" numberOfLines={1}>
            {rental.location}
          </AppText>
        </View>
      )}

      <View
        style={[
          styles.timeBox,
          { backgroundColor: isDark ? "#28282C" : "#F8F7F4" },
        ]}
      >
        <View style={styles.timeCol}>
          <AppText variant="caption" color="muted">
            Start Time
          </AppText>
          <AppText variant="bodySmall" weight="600">
            {formatDateTime(rental.actualPickupTime || rental.startTime)}
          </AppText>
        </View>
        <View style={styles.timeCol}>
          <AppText variant="caption" color="muted">
            Expected Return
          </AppText>
          <AppText variant="bodySmall" weight="600">
            {formatDateTime(rental.returnTime)}
          </AppText>
        </View>
      </View>

      <View style={styles.footer}>
        <AppButton
          title="Track Live"
          icon={<Navigation size={16} color="#FFFFFF" />}
          size="sm"
          onPress={onTrack}
          style={styles.trackBtn}
        />
        {onReturn && (
          <AppButton
            title="Confirm Return"
            variant="outline"
            size="sm"
            onPress={onReturn}
            style={styles.returnBtn}
          />
        )}
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bikeSection: {
    flex: 1,
    marginRight: 8,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  timeBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  timeCol: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trackBtn: {
    flex: 1,
    marginRight: 8,
    height: 38,
  },
  returnBtn: {
    flex: 1,
    height: 38,
  },
});

export default RentalCard;
