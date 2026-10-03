import React from "react";
import { View, StyleSheet } from "react-native";
import { OwnerPaymentDTO } from "../../types/owner";
import { useTheme } from "../../theme";
import AppText from "../common/AppText";
import AppCard from "../common/AppCard";
import AppBadge from "../common/AppBadge";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { ArrowUpRight, CheckCircle2, Clock, XCircle } from "lucide-react-native";

export interface PaymentCardProps {
  payment: OwnerPaymentDTO;
  onPress: () => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  onPress,
}) => {
  const { theme } = useTheme();

  const isSuccess = payment.paymentStatus === "SUCCESS";
  const isPending = payment.paymentStatus === "PENDING" || payment.paymentStatus === "PROCESSING";

  const statusVariant = isSuccess
    ? "success"
    : isPending
    ? "warning"
    : "error";

  const ownerShare = payment.ownerEarnings ?? payment.baseRentalAmount ?? 0;

  return (
    <AppCard onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.leftInfo}>
          <AppText variant="body" weight="700" numberOfLines={1}>
            {payment.bikeName || "Rental Payout"}
          </AppText>
          <AppText variant="caption" color="muted">
            {payment.invoiceNumber || `Booking #${payment.bookingId}`}
          </AppText>
        </View>

        <View style={styles.rightAmount}>
          <AppText variant="h3" weight="700" color="primary">
            +{formatCurrency(ownerShare)}
          </AppText>
          <AppBadge
            label={payment.paymentStatus}
            variant={statusVariant}
            size="sm"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <AppText variant="caption" color="muted">
          Customer: {payment.customerName || "Customer"}
        </AppText>
        <AppText variant="caption" color="muted">
          {formatDateTime(payment.paidAt || payment.createdAt)}
        </AppText>
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
  leftInfo: {
    flex: 1,
    marginRight: 8,
  },
  rightAmount: {
    alignItems: "flex-end",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
});

export default PaymentCard;
