import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  ArrowLeft,
  Receipt,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  ShieldCheck,
  Calendar,
  CreditCard,
  AlertCircle,
  ExternalLink,
  DollarSign,
  Percent,
  Hash,
  Info,
} from "lucide-react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { paymentService } from "../../services/paymentService";
import { PaymentResponse } from "../../types/payment";
import AppHeader from "../../components/common/AppHeader";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import { useTheme } from "../../theme";

export default function PaymentDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();

  const paymentId = Number(route.params?.paymentId);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const fetchPaymentDetails = async () => {
    if (!paymentId || isNaN(paymentId)) {
      setError("Invalid payment ID parameter.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getPaymentById(paymentId);
      setPayment(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to fetch transaction details.";
      setError(typeof msg === "string" ? msg : "Unable to fetch transaction details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  const handleRetry = async () => {
    if (!payment) return;
    try {
      setRetrying(true);
      const updated = await paymentService.retryPayment(payment.paymentId);
      setPayment(updated);
      navigation.navigate("PaymentScreen", {
        bookingId: payment.bookingId,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to retry payment.";
      Alert.alert("Retry Error", msg);
    } finally {
      setRetrying(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const renderStatusBadge = (status?: string) => {
    const s = (status || "").toUpperCase();
    if (s === "SUCCESS") {
      return (
        <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 size={13} color="#059669" />
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-300"
          >
            Payment Successful
          </Text>
        </View>
      );
    }
    if (s === "FAILED") {
      return (
        <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
          <XCircle size={13} color="#E11D48" />
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs font-bold text-rose-700 dark:text-rose-300"
          >
            Payment Failed
          </Text>
        </View>
      );
    }
    return (
      <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
        <Clock size={13} color="#D97706" />
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-xs font-bold text-amber-700 dark:text-amber-300"
        >
          {s || "Pending"}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-6 space-y-3">
        <ActivityIndicator size="large" color={theme.primary} />
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-xs text-muted-foreground font-semibold text-center mt-3"
        >
          Loading transaction details...
        </Text>
      </View>
    );
  }

  if (error || !payment) {
    return (
      <AppScreen edges={["top", "bottom"]} scrollable={false}>
        <AppHeader title="Transaction Details" showBack />
        <View className="flex-1 p-6 justify-center items-center space-y-4">
          <AlertCircle size={40} color="#E11D48" />
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-base font-bold text-foreground text-center"
          >
            {error || "Transaction record not found."}
          </Text>
          <AppButton
            title="Go Back"
            variant="outline"
            onPress={() => navigation.goBack()}
            className="mt-4 px-6"
          />
        </View>
      </AppScreen>
    );
  }

  const isSuccess = payment.paymentStatus === "SUCCESS";
  const isFailed = payment.paymentStatus === "FAILED";

  return (
    <AppScreen edges={["top", "bottom"]} scrollable={false}>
      <AppHeader title={`Payment #${payment.paymentId}`} showBack />

      <ScrollView
        className="flex-1 px-5 py-4 space-y-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Header Card */}
        <View
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
          className="p-5 rounded-3xl border shadow-xs space-y-3 items-center text-center"
        >
          {renderStatusBadge(payment.paymentStatus)}

          <Text
            style={{ fontFamily: "JetBrainsMono" }}
            className="text-3xl font-black text-foreground mt-2"
          >
            ₹{payment.finalAmount}
          </Text>

          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs text-muted-foreground"
          >
            Transaction ID: {payment.transactionId || payment.razorpayPaymentId || "—"}
          </Text>
        </View>

        {/* Fare Breakdown */}
        <View
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
          className="p-5 rounded-3xl border shadow-xs space-y-3"
        >
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Payment Breakdown
          </Text>

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              Booking Reference
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
              BR-{payment.bookingId}
            </Text>
          </View>

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              Base Rental Fare
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
              ₹{payment.baseRentalAmount}
            </Text>
          </View>

          {Number(payment.lateCharge) > 0 && (
            <View className="flex-row justify-between text-xs">
              <Text style={{ fontFamily: "Antic" }} className="text-rose-600 font-bold">
                Late Return Surcharge
              </Text>
              <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-rose-600">
                + ₹{payment.lateCharge}
              </Text>
            </View>
          )}

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              Platform Fee ({payment.platformFeePercent}%)
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
              ₹{payment.platformFeeAmount}
            </Text>
          </View>

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              GST / Taxes
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
              ₹{payment.taxAmount}
            </Text>
          </View>

          <View
            style={{ borderTopColor: theme.border }}
            className="pt-3 border-t flex-row justify-between text-xs"
          >
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              Payment Method
            </Text>
            <Text style={{ fontFamily: "Antic" }} className="font-bold text-foreground">
              {payment.paymentMethod || "Razorpay Online"}
            </Text>
          </View>

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              Paid Timestamp
            </Text>
            <Text style={{ fontFamily: "Antic" }} className="font-bold text-foreground">
              {formatDate(payment.paidAt || payment.createdAt)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {isSuccess && (
          <AppButton
            title="View Official Tax Invoice"
            variant="primary"
            size="lg"
            onPress={() =>
              navigation.navigate("InvoiceScreen", {
                paymentId: payment.paymentId,
              })
            }
            leftIcon={<Receipt size={18} color="#FFFFFF" />}
          />
        )}

        {isFailed && (
          <AppButton
            title="Retry Payment"
            variant="primary"
            size="lg"
            loading={retrying}
            onPress={handleRetry}
            leftIcon={<RotateCw size={18} color="#FFFFFF" />}
          />
        )}

        <AppButton
          title="Back to Payments"
          variant="outline"
          size="lg"
          onPress={() => navigation.goBack()}
        />
      </ScrollView>
    </AppScreen>
  );
}
