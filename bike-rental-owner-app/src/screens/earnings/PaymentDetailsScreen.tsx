import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Bike,
  Receipt,
  FileText,
} from "lucide-react-native";
import { OwnerStackParamList } from "../../navigation/types";
import { ownerService } from "../../services/ownerService";
import { useTheme } from "../../theme";
import AppScreen from "../../components/common/AppScreen";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppCard from "../../components/common/AppCard";
import AppBadge from "../../components/common/AppBadge";
import AppLoader from "../../components/common/AppLoader";
import {
  formatCurrency,
  formatDateTime,
  maskAccountNumber,
} from "../../utils/formatters";
import { OwnerPaymentDTO } from "../../types/owner";

type Props = NativeStackScreenProps<OwnerStackParamList, "PaymentDetailsScreen">;

export const PaymentDetailsScreen: React.FC<Props> = ({ route }) => {
  const { paymentId, payment: initialPayment } = route.params;
  const { theme, isDark } = useTheme();

  const [payment, setPayment] = useState<OwnerPaymentDTO | null>(
    initialPayment || null
  );
  const [loading, setLoading] = useState(!initialPayment);

  useEffect(() => {
    async function loadDetails() {
      try {
        const fetched = await ownerService.getPaymentById(paymentId);
        if (fetched) setPayment(fetched);
      } catch (err) {
        console.warn("Could not fetch payment details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [paymentId]);

  if (loading || !payment) {
    return <AppLoader fullScreen message="Loading transaction details..." />;
  }

  const isSuccess = payment.paymentStatus === "SUCCESS";
  const isPending = payment.paymentStatus === "PENDING" || payment.paymentStatus === "PROCESSING";

  const statusVariant = isSuccess
    ? "success"
    : isPending
    ? "warning"
    : "error";

  const ownerNet = payment.ownerEarnings ?? payment.baseRentalAmount ?? 0;

  return (
    <AppScreen withTopInset contentContainerStyle={styles.container}>
      <AppHeader
        title={`Payout #${payment.paymentId}`}
        subtitle={payment.invoiceNumber || `Booking #${payment.bookingId}`}
      />

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Net Payout Hero */}
        <AppCard
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? "#1E2A22" : "#EAF0EC",
              borderColor: theme.primary,
            },
          ]}
        >
          <View style={styles.heroTop}>
            <View>
              <AppText variant="caption" color="primary" weight="700">
                NET OWNER PAYOUT
              </AppText>
              <AppText variant="h1" weight="700" color="primary" style={styles.heroAmount}>
                {formatCurrency(ownerNet)}
              </AppText>
            </View>
            <AppBadge label={payment.paymentStatus} variant={statusVariant} />
          </View>

          {payment.payoutStatus && (
            <View style={[styles.payoutStatusRow, { borderTopColor: "rgba(124,144,130,0.2)" }]}>
              <AppText variant="caption" color="muted">
                Settlement Status:{" "}
                <AppText variant="caption" weight="700" color="foreground">
                  {payment.payoutStatus}
                </AppText>
              </AppText>
              {payment.payoutUtr && (
                <AppText variant="caption" color="muted">
                  UTR: {payment.payoutUtr}
                </AppText>
              )}
            </View>
          )}
        </AppCard>

        {/* Customer & Bike Info */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            Rental Information
          </AppText>
          <AppCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <User size={16} color={theme.primary} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodySmall" weight="700">
                  {payment.customerName || "Customer"}
                </AppText>
                {payment.customerPhone && (
                  <AppText variant="caption" color="muted">
                    {payment.customerPhone}
                  </AppText>
                )}
              </View>
            </View>

            <View style={[styles.infoRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.border }]}>
              <Bike size={16} color={theme.primary} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodySmall" weight="700">
                  {payment.bikeName || "Rental Bike"}
                </AppText>
                <AppText variant="caption" color="muted">
                  Reg: {payment.bikeRegistrationNumber || "Pending"}
                </AppText>
              </View>
            </View>
          </AppCard>
        </View>

        {/* Financial Billing Breakdown */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            Authoritative Billing Breakdown
          </AppText>
          <AppCard style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <AppText variant="bodySmall" color="muted">
                Base Rental Amount
              </AppText>
              <AppText variant="bodySmall" weight="600">
                {formatCurrency(payment.baseRentalAmount || 0)}
              </AppText>
            </View>

            {payment.lateCharge ? (
              <View style={[styles.breakdownRow, { marginTop: 6 }]}>
                <AppText variant="bodySmall" color="muted">
                  Late Charges
                </AppText>
                <AppText variant="bodySmall" weight="600" color="destructive">
                  +{formatCurrency(payment.lateCharge)}
                </AppText>
              </View>
            ) : null}

            {payment.platformFeeAmount ? (
              <View style={[styles.breakdownRow, { marginTop: 6 }]}>
                <AppText variant="caption" color="muted">
                  Platform Commission ({payment.platformFeePercent || 10}%)
                </AppText>
                <AppText variant="caption" color="muted">
                  -{formatCurrency(payment.platformFeeAmount)}
                </AppText>
              </View>
            ) : null}

            {payment.taxAmount ? (
              <View style={[styles.breakdownRow, { marginTop: 6 }]}>
                <AppText variant="caption" color="muted">
                  Taxes (GST)
                </AppText>
                <AppText variant="caption" color="muted">
                  {formatCurrency(payment.taxAmount)}
                </AppText>
              </View>
            ) : null}

            <View style={[styles.breakdownRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.border }]}>
              <AppText variant="body" weight="700">
                Total Customer Paid
              </AppText>
              <AppText variant="h3" weight="700">
                {formatCurrency(payment.finalAmount || 0)}
              </AppText>
            </View>

            <View style={[styles.breakdownRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.border }]}>
              <AppText variant="body" weight="700" color="primary">
                Net Owner Earnings
              </AppText>
              <AppText variant="h2" weight="700" color="primary">
                {formatCurrency(ownerNet)}
              </AppText>
            </View>
          </AppCard>
        </View>

        {/* Settlement Bank Details */}
        {(payment.ownerBankName || payment.ownerAccountNumber) && (
          <View style={styles.section}>
            <AppText variant="h3" weight="700" style={styles.sectionTitle}>
              Settlement Account
            </AppText>
            <AppCard style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Building2 size={16} color={theme.primary} style={{ marginRight: 8 }} />
                <View>
                  <AppText variant="bodySmall" weight="700">
                    {payment.ownerBankName || "Bank"}
                  </AppText>
                  <AppText variant="caption" color="muted">
                    {maskAccountNumber(payment.ownerAccountNumber)} • IFSC: {payment.ownerIfscCode || "N/A"}
                  </AppText>
                </View>
              </View>
            </AppCard>
          </View>
        )}

        {/* Payment Gateway Metadata */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            Gateway & Transaction Info
          </AppText>
          <AppCard style={styles.infoCard}>
            <View style={styles.breakdownRow}>
              <AppText variant="caption" color="muted">
                Transaction ID
              </AppText>
              <AppText variant="caption" weight="600">
                {payment.transactionId || `TXN-${payment.paymentId}`}
              </AppText>
            </View>

            {payment.razorpayPaymentId && (
              <View style={[styles.breakdownRow, { marginTop: 6 }]}>
                <AppText variant="caption" color="muted">
                  Razorpay Payment ID
                </AppText>
                <AppText variant="caption" weight="600">
                  {payment.razorpayPaymentId}
                </AppText>
              </View>
            )}

            <View style={[styles.breakdownRow, { marginTop: 6 }]}>
              <AppText variant="caption" color="muted">
                Payment Date
              </AppText>
              <AppText variant="caption" weight="600">
                {formatDateTime(payment.paidAt || payment.createdAt)}
              </AppText>
            </View>

            {payment.paymentMethod && (
              <View style={[styles.breakdownRow, { marginTop: 6 }]}>
                <AppText variant="caption" color="muted">
                  Payment Method
                </AppText>
                <AppText variant="caption" weight="600">
                  {payment.paymentMethod}
                </AppText>
              </View>
            )}
          </AppCard>
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
  heroCard: {
    padding: 18,
    borderRadius: 16,
    marginTop: 12,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroAmount: {
    fontSize: 32,
    lineHeight: 38,
    marginTop: 4,
  },
  payoutStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    marginTop: 12,
    borderTopWidth: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  infoCard: {
    padding: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  breakdownCard: {
    padding: 16,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default PaymentDetailsScreen;
